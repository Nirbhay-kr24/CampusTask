import { useEffect, useMemo, useState } from 'react';
import {
  ArrowDownRight, ArrowUpRight, CalendarDays, Check, CheckCheck, Circle,
  ClipboardList, Clock3, LayoutGrid, ListFilter, Plus, Search, Sparkles,
  Trash2, Pencil, X, RefreshCw, BookOpen, ChevronRight
} from 'lucide-react';
import './styles.css';

const API = import.meta.env.VITE_API_BASE_URL || '';
const blank = { title: '', course: '', description: '', due_date: '', status: 'todo' };
const labels = { todo: 'Not started', in_progress: 'In progress', completed: 'Done' };
const dateLabel = d => d
  ? new Date(d + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
  : 'No deadline';

function App() {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({ total: 0, todo: 0, in_progress: 0, completed: 0, overdue: 0 });
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [modal, setModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    try {
      setError('');
      const [a, b] = await Promise.all([fetch(`${API}/api/tasks`), fetch(`${API}/api/tasks/stats`)]);
      if (!a.ok || !b.ok) throw Error('Could not reach the API. Check that the backend and database are running.');
      setTasks(await a.json());
      setStats(await b.json());
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  const visible = useMemo(() => tasks.filter(t =>
    (filter === 'all' || t.status === filter) &&
    (!search || `${t.title} ${t.course} ${t.description || ''}`.toLowerCase().includes(search.toLowerCase().trim()))
  ), [tasks, filter, search]);

  const upcoming = useMemo(() => tasks
    .filter(t => t.status !== 'completed' && t.due_date)
    .sort((a, b) => a.due_date.localeCompare(b.due_date))
    .slice(0, 4), [tasks]);

  const openNew = () => { setEditing(null); setForm(blank); setModal(true); };
  const openEdit = t => {
    setEditing(t.id);
    setForm({ title: t.title, course: t.course, description: t.description || '', due_date: t.due_date || '', status: t.status });
    setModal(true);
  };

  async function save(e) {
    e.preventDefault();
    try {
      const payload = { ...form, course: form.course.trim() || 'General', description: form.description || null, due_date: form.due_date || null };
      const r = await fetch(`${API}/api/tasks${editing ? '/' + editing : ''}`, {
        method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
      if (!r.ok) throw Error('Could not save this assignment. Check the required fields.');
      setModal(false); await load();
    } catch (e) { setError(e.message); }
  }

  async function updateStatus(task, status) {
    const r = await fetch(`${API}/api/tasks/${task.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...task, status })
    });
    if (!r.ok) setError('Could not update the assignment status.');
    else load();
  }

  async function remove(task) {
    if (!confirm(`Delete “${task.title}”?`)) return;
    const r = await fetch(`${API}/api/tasks/${task.id}`, { method: 'DELETE' });
    if (!r.ok) setError('Could not delete this assignment.');
    else load();
  }

  const completion = stats.total ? Math.round(stats.completed / stats.total * 100) : 0;

  return <div className="app-frame">
    <aside className="rail">
      <div className="brand-lockup"><div className="brand-symbol"><BookOpen size={19}/></div><span>campus<span className="brand-light">task</span></span></div>
      <div className="rail-label">YOUR SPACE</div>
      <button className={`rail-link ${filter === 'all' ? 'selected' : ''}`} onClick={() => setFilter('all')}><LayoutGrid size={17}/> Overview</button>
      <button className={`rail-link ${filter === 'todo' ? 'selected' : ''}`} onClick={() => setFilter('todo')}><Circle size={17}/> Not started <span className="rail-count">{stats.todo}</span></button>
      <button className={`rail-link ${filter === 'in_progress' ? 'selected' : ''}`} onClick={() => setFilter('in_progress')}><Clock3 size={17}/> In progress</button>
      <button className={`rail-link ${filter === 'completed' ? 'selected' : ''}`} onClick={() => setFilter('completed')}><CheckCheck size={17}/> Finished</button>
      <div className="rail-bottom">
        <div className="rail-quote"><Sparkles size={18}/><p>Make room for the work that matters.</p><span>ONE THING AT A TIME</span></div>
        <div className="rail-user"><div className="avatar">ST</div><div><b>Student space</b><small>Personal planner</small></div></div>
      </div>
    </aside>

    <main className="workspace">
      <div className="topline"><span><span className="crumb-muted">Workspace</span><ChevronRight size={14}/> Overview</span><button className="quiet-refresh" onClick={load}><RefreshCw size={14}/> Sync</button></div>
      <header className="welcome">
        <div><div className="kicker"><span className="kicker-dot"></span> YOUR SEMESTER, IN VIEW</div><h1>Make today <em>count.</em></h1><p>A calmer place to organise coursework, deadlines, and little wins.</p></div>
        <button className="add-button" onClick={openNew}><Plus size={17}/> Add assignment</button>
      </header>

      {error && <div className="error-banner">{error}<button onClick={() => setError('')}><X size={16}/></button></div>}

      <section className="overview-grid">
        <div className="progress-card">
          <div className="progress-copy"><span className="card-eyebrow">SEMESTER PROGRESS</span><h2>{completion}<small>%</small></h2><p>{stats.completed} of {stats.total} assignments finished</p></div>
          <div className="ring-wrap"><svg viewBox="0 0 100 100" className="progress-ring"><circle className="ring-track" cx="50" cy="50" r="41"/><circle className="ring-value" cx="50" cy="50" r="41" strokeDasharray={`${completion * 2.576} 258`}/></svg><div className="ring-label"><Check size={20}/></div></div>
          <div className="progress-foot"><span><span className="legend-dot mint"></span> Completed</span><span><span className="legend-dot pale"></span> Still to do</span></div>
        </div>
        <div className="metric-card"><div className="metric-top"><span>ON YOUR LIST</span><div className="metric-icon indigo"><ClipboardList size={17}/></div></div><strong>{stats.total}</strong><p>Total assignments</p><div className="metric-note"><ArrowUpRight size={14}/> Keep your next step clear</div></div>
        <div className="metric-card"><div className="metric-top"><span>IN MOTION</span><div className="metric-icon orange"><Clock3 size={17}/></div></div><strong>{stats.in_progress}</strong><p>Currently in progress</p><div className="metric-note orange-text"><ArrowDownRight size={14}/> Small progress is progress</div></div>
        <div className="metric-card"><div className="metric-top"><span>NEEDS ATTENTION</span><div className="metric-icon rose"><CalendarDays size={17}/></div></div><strong>{stats.overdue}</strong><p>Overdue assignments</p><div className="metric-note rose-text">{stats.overdue ? 'Review these deadlines' : 'You are all caught up'}</div></div>
      </section>

      <section className="content-grid">
        <div className="list-panel">
          <div className="section-heading"><div><span className="section-index">01 / TASK BOARD</span><h2>Your assignments</h2><p>Everything you need to move forward.</p></div><span className="result-count">{visible.length} items</span></div>
          <div className="list-controls"><div className="search-field"><Search size={16}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Find an assignment or course"/></div><div className="filter-wrap"><ListFilter size={15}/><select aria-label="Filter by status" value={filter} onChange={e => setFilter(e.target.value)}><option value="all">All tasks</option><option value="todo">Not started</option><option value="in_progress">In progress</option><option value="completed">Finished</option></select></div></div>
          {loading ? <div className="blank-state">Loading your workspace…</div> : visible.length === 0 ? <div className="blank-state"><div className="blank-icon"><ClipboardList size={23}/></div><b>{search || filter !== 'all' ? 'Nothing matches just yet' : 'A fresh start'}</b><p>{search || filter !== 'all' ? 'Try another search or change the status filter.' : 'Add your first assignment and build your plan from here.'}</p>{!search && filter === 'all' && <button className="add-button small" onClick={openNew}><Plus size={15}/> Create first task</button>}</div> :
            <div className="assignment-list">{visible.map((t, i) => <article className="assignment-row" key={t.id}>
              <button className={`task-toggle ${t.status === 'completed' ? 'is-done' : ''}`} onClick={() => updateStatus(t, t.status === 'completed' ? 'todo' : 'completed')} title="Mark done">{t.status === 'completed' ? <Check size={15}/> : <span/>}</button>
              <div className="assignment-main"><div className="assignment-title-line"><b className={t.status === 'completed' ? 'struck' : ''}>{t.title}</b><span className={`status-tag ${t.status}`}>{labels[t.status]}</span></div><p>{t.course || 'General'}{t.description ? <span className="description-sep"> / </span> : null}{t.description || ''}</p><div className="assignment-meta"><CalendarDays size={13}/>{dateLabel(t.due_date)}</div></div>
              <div className="row-actions"><button onClick={() => openEdit(t)} title="Edit assignment"><Pencil size={15}/></button><button onClick={() => remove(t)} title="Delete assignment"><Trash2 size={15}/></button></div>
            </article>)}</div>}
          <div className="list-bottom"><span>Showing {visible.length} of {tasks.length} assignments</span><button onClick={load}>Refresh list <RefreshCw size={13}/></button></div>
        </div>

        <aside className="side-stack">
          <div className="deadline-panel"><div className="deadline-heading"><div><span className="section-index">02 / COMING UP</span><h2>Next deadlines</h2></div><CalendarDays size={19}/></div>
            {upcoming.length ? <div className="deadline-list">{upcoming.map(t => {
              const d = new Date(t.due_date + 'T00:00:00');
              return <div className="deadline-row" key={t.id}><div className="date-tile"><span>{d.toLocaleDateString(undefined,{month:'short'}).toUpperCase()}</span><b>{d.getDate()}</b></div><div className="deadline-detail"><b>{t.title}</b><span>{t.course || 'General'}</span></div><span className={`deadline-dot ${t.status}`}></span></div>;
            })}</div> : <div className="no-deadlines"><CalendarDays size={21}/><p>No deadlines on the horizon.</p><span>Add due dates to see them here.</span></div>}
          </div>
          <div className="note-card"><div className="note-stamp"><Sparkles size={18}/></div><span className="section-index">A NOTE TO SELF</span><h3>Consistency beats the last-minute rush.</h3><p>Pick one useful thing to finish next. You don't have to do everything at once.</p><div className="note-line"></div><span className="note-signoff">YOU'VE GOT THIS <span>✳</span></span></div>
        </aside>
      </section>
      <footer className="page-footer"><span>CampusTask <span className="footer-dot">·</span> Student workspace</span><span>Plan a little. Do a little. Repeat.</span></footer>
    </main>

    {modal && <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && setModal(false)}><section className="task-modal"><div className="modal-top"><div><span className="section-index">YOUR TASK BOARD</span><h2>{editing ? 'Edit assignment' : 'Add an assignment'}</h2><p>Capture the details now; you can update them anytime.</p></div><button className="modal-close" onClick={() => setModal(false)}><X size={18}/></button></div>
      <form onSubmit={save}><label>Assignment title<input required maxLength="160" value={form.title} onChange={e => setForm({...form,title:e.target.value})} placeholder="e.g. Finish Kubernetes lab"/></label><div className="modal-two"><label>Course or subject<input value={form.course} onChange={e => setForm({...form,course:e.target.value})} placeholder="e.g. DevOps"/></label><label>Due date<input type="date" value={form.due_date} onChange={e => setForm({...form,due_date:e.target.value})}/></label></div><label>Notes<textarea rows="3" value={form.description} onChange={e => setForm({...form,description:e.target.value})} placeholder="What should you remember?"/></label><label>Status<select value={form.status} onChange={e => setForm({...form,status:e.target.value})}><option value="todo">Not started</option><option value="in_progress">In progress</option><option value="completed">Done</option></select></label><div className="modal-footer"><button type="button" className="cancel-button" onClick={() => setModal(false)}>Cancel</button><button className="add-button">{editing ? 'Save changes' : <><Plus size={16}/> Create assignment</>}</button></div></form>
    </section></div>}
  </div>;
}

export default App;

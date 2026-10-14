def task(title="Submit DBMS assignment", **changes):
    payload = {"title": title, "course": "Advanced DBMS", "description": "Finish the lab", "due_date": "2026-11-15", "status": "todo"}
    payload.update(changes)
    return payload

def test_health(client):
    r = client.get("/health")
    assert r.status_code == 200 and r.json()["status"] == "ok"

def test_create(client):
    r = client.post("/api/tasks", json=task())
    assert r.status_code == 201 and r.json()["title"] == "Submit DBMS assignment"

def test_list(client):
    client.post("/api/tasks", json=task())
    assert len(client.get("/api/tasks").json()) == 1

def test_missing_task(client):
    assert client.get("/api/tasks/999").status_code == 404

def test_update(client):
    created = client.post("/api/tasks", json=task()).json()
    r = client.put(f"/api/tasks/{created['id']}", json=task(title="Updated", status="in_progress"))
    assert r.status_code == 200 and r.json()["status"] == "in_progress"

def test_delete(client):
    created = client.post("/api/tasks", json=task()).json()
    assert client.delete(f"/api/tasks/{created['id']}").status_code == 204
    assert client.get(f"/api/tasks/{created['id']}").status_code == 404

def test_stats(client):
    client.post("/api/tasks", json=task())
    client.post("/api/tasks", json=task(title="ML project", status="completed"))
    stats = client.get("/api/tasks/stats").json()
    assert stats["total"] == 2 and stats["completed"] == 1 and stats["todo"] == 1

def test_search(client):
    client.post("/api/tasks", json=task())
    assert len(client.get("/api/tasks?search=DBMS").json()) == 1

def test_empty_title_rejected(client):
    assert client.post("/api/tasks", json=task(title="")).status_code == 422

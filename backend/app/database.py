
import os
from sqlalchemy import URL, create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    # Build a PostgreSQL URL from the individual POSTGRES_* environment variables
    # instead of falling back to SQLite.
    database_url = URL.create(
        drivername="postgresql+psycopg",
        username=os.getenv("POSTGRES_USER", "campustask"),
        password=os.getenv("POSTGRES_PASSWORD"),
        host=os.getenv("DATABASE_HOST", "postgres"),
        port=int(os.getenv("DATABASE_PORT", "5432")),
        database=os.getenv("POSTGRES_DB", "campustask"),
    )
else:
    database_url = DATABASE_URL

connect_args = (
    {"check_same_thread": False}
    if str(database_url).startswith("sqlite")
    else {}
)

engine = create_engine(
    database_url,
    connect_args=connect_args,
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

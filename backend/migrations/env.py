from logging.config import fileConfig
import os
from alembic import context
from sqlalchemy import engine_from_config, pool
from app.database import Base
from app import models

config = context.config
if config.config_file_name: fileConfig(config.config_file_name)

# Resolve the database URL. Prefer the explicit DATABASE_URL; otherwise build a
# PostgreSQL URL from the individual POSTGRES_* environment variables so alembic
# never silently falls back to the SQLite default in alembic.ini.
database_url = os.getenv("DATABASE_URL")
if not database_url:
    database_url = (
        "postgresql+psycopg://"
        f"{os.getenv('POSTGRES_USER', 'campustask')}:"
        f"{os.getenv('POSTGRES_PASSWORD', '')}@"
        f"{os.getenv('DATABASE_HOST', 'postgres')}:"
        f"{os.getenv('DATABASE_PORT', '5432')}/"
        f"{os.getenv('POSTGRES_DB', 'campustask')}"
    )
config.set_main_option("sqlalchemy.url", database_url)

target_metadata = Base.metadata

def run_migrations_offline():
    context.configure(url=config.get_main_option("sqlalchemy.url"), target_metadata=target_metadata, literal_binds=True, dialect_opts={"paramstyle": "named"})
    with context.begin_transaction(): context.run_migrations()

def run_migrations_online():
    connectable = engine_from_config(config.get_section(config.config_ini_section, {}), prefix="sqlalchemy.", poolclass=pool.NullPool)
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction(): context.run_migrations()

if context.is_offline_mode(): run_migrations_offline()
else: run_migrations_online()

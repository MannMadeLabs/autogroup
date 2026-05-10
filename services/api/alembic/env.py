from alembic import context
from sqlalchemy import create_engine, pool

from app.config import get_settings
from app.db.base import Base
from app.db.models.lead import Lead  # noqa: F401
from app.db.session import sync_database_url

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    url = sync_database_url(get_settings().database_url)
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = create_engine(
        sync_database_url(get_settings().database_url),
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata, compare_type=True)

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()

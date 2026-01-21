import os
from urllib.parse import quote_plus
from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context

from models.database import Base
from models.asset import Asset
from models.category import Category
from models.asset_history import AssetHistory

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata

def get_url():
    mysql_host = os.getenv("MYSQL_HOST", "mysql-shared")
    mysql_port = os.getenv("MYSQL_PORT", "3306")
    mysql_user = os.getenv("MYSQL_USER", "root")
    mysql_password = os.getenv("MYSQL_PASSWORD", "")
    app_id = os.getenv("APP_ID", "")
    mysql_db = os.getenv("MYSQL_DB")
    if not mysql_db:
        app_id_short = app_id.replace("-", "")[:8].lower() if app_id else "default"
        mysql_db = f"app_{app_id_short}"
    return f"mysql+pymysql://{mysql_user}:{quote_plus(mysql_password)}@{mysql_host}:{mysql_port}/{mysql_db}"

def run_migrations_offline():
    url = get_url()
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online():
    configuration = config.get_section(config.config_ini_section)
    configuration["sqlalchemy.url"] = get_url()
    connectable = engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from alembic import command
from alembic.config import Config
from models.database import engine, SessionLocal, MYSQL_DB, DATABASE_URL
from routers import assets, categories, dashboard, files

app = FastAPI(title="Asset Management API")

app_id = os.getenv("APP_ID", "")
preview_domain = os.getenv("PREVIEW_DOMAIN", "")
preview_scheme = "https" if os.getenv("PREVIEW_USE_HTTPS", "false").lower() == "true" else "http"

if app_id and preview_domain:
    azure_preview_url = f"{preview_scheme}://app-{app_id}.{preview_domain}"
    allowed_origins = [
        azure_preview_url,
        "http://frontend:4000",
        "http://localhost:4000",
        "http://localhost:3000"
    ]
else:
    allowed_origins = [
        "http://localhost:4000",
        "http://frontend:4000",
        "http://localhost:3000",
        "http://frontend:3000"
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def run_startup_migrations():
    lock_name = f"migration_lock_{MYSQL_DB}"
    with engine.connect() as conn:
        acquired = conn.execute(
            text("SELECT GET_LOCK(:lock_name, 60)"),
            {"lock_name": lock_name},
        ).scalar()
        if not acquired:
            raise RuntimeError("Could not acquire migration lock")
        try:
            alembic_cfg = Config("alembic.ini")
            alembic_cfg.set_main_option("sqlalchemy.url", DATABASE_URL)
            command.upgrade(alembic_cfg, "head")
        finally:
            conn.execute(
                text("SELECT RELEASE_LOCK(:lock_name)"),
                {"lock_name": lock_name},
            )

@app.on_event("startup")
def startup_event():
    run_startup_migrations()
    
    db = SessionLocal()
    try:
        from models.category import Category
        if db.query(Category).count() == 0:
            default_categories = [
                Category(name="Electronics", description="Electronic devices and equipment"),
                Category(name="Furniture", description="Office and home furniture"),
                Category(name="Vehicles", description="Company vehicles and transportation"),
                Category(name="Software", description="Software licenses and subscriptions"),
                Category(name="Equipment", description="General equipment and tools"),
            ]
            db.add_all(default_categories)
            db.commit()
    finally:
        db.close()

app.include_router(assets.router)
app.include_router(categories.router)
app.include_router(dashboard.router)
app.include_router(files.router)

@app.get("/")
def root():
    return {"message": "Asset Management API", "status": "running"}
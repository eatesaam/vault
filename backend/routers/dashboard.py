from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from models.database import get_db
from models.asset import Asset
from models.category import Category
from models.asset_history import AssetHistory

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

@router.get("/summary")
def get_dashboard_summary(db: Session = Depends(get_db)):
    total_assets = db.query(Asset).count()
    total_value = db.query(func.sum(Asset.current_value)).scalar() or 0
    active_assets = db.query(Asset).filter(Asset.status == "Active").count()
    maintenance_due = db.query(Asset).filter(Asset.status == "Maintenance").count()
    
    category_distribution = db.query(
        Category.name,
        func.count(Asset.id).label("count")
    ).join(Asset).group_by(Category.name).all()
    
    status_distribution = db.query(
        Asset.status,
        func.count(Asset.id).label("count")
    ).group_by(Asset.status).all()
    
    recent_activities = db.query(AssetHistory).order_by(
        AssetHistory.timestamp.desc()
    ).limit(10).all()
    
    return {
        "total_assets": total_assets,
        "total_value": float(total_value),
        "active_assets": active_assets,
        "maintenance_due": maintenance_due,
        "category_distribution": [
            {"name": name, "count": count} for name, count in category_distribution
        ],
        "status_distribution": [
            {"status": status, "count": count} for status, count in status_distribution
        ],
        "recent_activities": [
            {
                "id": activity.id,
                "asset_id": activity.asset_id,
                "action": activity.action,
                "details": activity.details,
                "timestamp": activity.timestamp.isoformat()
            }
            for activity in recent_activities
        ]
    }
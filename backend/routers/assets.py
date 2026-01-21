from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from models.database import get_db
from models.asset import Asset
from models.asset_history import AssetHistory
from schemas.asset import AssetCreate, AssetUpdate, AssetResponse, AssetHistoryResponse

router = APIRouter(prefix="/api/assets", tags=["assets"])

@router.get("", response_model=List[AssetResponse])
def get_assets(
    status: Optional[str] = None,
    category_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Asset)
    if status:
        query = query.filter(Asset.status == status)
    if category_id:
        query = query.filter(Asset.category_id == category_id)
    return query.all()

@router.get("/{asset_id}", response_model=AssetResponse)
def get_asset(asset_id: int, db: Session = Depends(get_db)):
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    return asset

@router.post("", response_model=AssetResponse, status_code=201)
def create_asset(asset_data: AssetCreate, db: Session = Depends(get_db)):
    asset = Asset(**asset_data.model_dump())
    db.add(asset)
    db.commit()
    db.refresh(asset)
    
    history = AssetHistory(
        asset_id=asset.id,
        action="CREATE",
        details=f"Asset '{asset.name}' created"
    )
    db.add(history)
    db.commit()
    
    return asset

@router.put("/{asset_id}", response_model=AssetResponse)
def update_asset(asset_id: int, asset_data: AssetUpdate, db: Session = Depends(get_db)):
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    for key, value in asset_data.model_dump().items():
        setattr(asset, key, value)
    
    db.commit()
    db.refresh(asset)
    
    history = AssetHistory(
        asset_id=asset.id,
        action="UPDATE",
        details=f"Asset '{asset.name}' updated"
    )
    db.add(history)
    db.commit()
    
    return asset

@router.delete("/{asset_id}", status_code=204)
def delete_asset(asset_id: int, db: Session = Depends(get_db)):
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    db.delete(asset)
    db.commit()
    return None

@router.get("/{asset_id}/history", response_model=List[AssetHistoryResponse])
def get_asset_history(asset_id: int, db: Session = Depends(get_db)):
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    history = db.query(AssetHistory).filter(AssetHistory.asset_id == asset_id).order_by(AssetHistory.timestamp.desc()).all()
    return history
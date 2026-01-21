from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from models.database import Base

class Asset(Base):
    __tablename__ = "assets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    serial_number = Column(String(255), nullable=True, unique=True)
    purchase_date = Column(Date, nullable=True)
    purchase_price = Column(Float, nullable=True)
    current_value = Column(Float, nullable=True)
    status = Column(String(50), nullable=False, default="Active")
    location = Column(String(255), nullable=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    assigned_to = Column(String(255), nullable=True)
    image_path = Column(String(512), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    category = relationship("Category", back_populates="assets")
    history = relationship("AssetHistory", back_populates="asset", cascade="all, delete-orphan")
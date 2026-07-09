from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime

from backend.database import Base

class Interaction(Base):
    __tablename__ = "interactions"

    id = Column(Integer, primary_key=True, index=True)
    hcp_name = Column(String, nullable=False)
    specialty = Column(String)
    product = Column(String)
    summary = Column(String)
    sentiment = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

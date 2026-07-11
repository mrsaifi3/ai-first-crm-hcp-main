from sqlalchemy import Column, Integer, String, DateTime, Text
from datetime import datetime

from backend.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class Interaction(Base):
    __tablename__ = "interactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True)
    hcp_name = Column(String, nullable=False)
    specialty = Column(String)
    interaction_type = Column(String, default="Meeting")
    product = Column(String)
    summary = Column(Text)
    sentiment = Column(String, default="Neutral")
    date = Column(String)
    time = Column(String)
    attendees = Column(Text)
    topics = Column(Text)
    materials_shared = Column(Text)
    samples_distributed = Column(Text)
    outcomes = Column(Text)
    followup_actions = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

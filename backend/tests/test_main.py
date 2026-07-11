import os
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.database import Base, get_db
from backend.main import app

DB_PATH = os.path.join(os.path.dirname(__file__), "test.db")
SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)


class TestStats:
    def setup_method(self):
        Base.metadata.create_all(bind=engine)

    def teardown_method(self):
        Base.metadata.drop_all(bind=engine)

    def test_stats_empty(self):
        res = client.get("/stats")
        assert res.status_code == 200
        assert res.json()["total"] == 0

    def test_stats_with_data(self):
        client.post("/interactions", json={"hcpName": "Dr. X", "sentiment": "Positive", "interactionType": "Meeting"})
        client.post("/interactions", json={"hcpName": "Dr. Y", "sentiment": "Neutral", "interactionType": "Call"})
        res = client.get("/stats")
        data = res.json()
        assert data["total"] == 2
        assert data["by_sentiment"].get("Positive") == 1
        assert data["by_type"].get("Meeting") == 1


class TestInteractions:
    def setup_method(self):
        Base.metadata.create_all(bind=engine)

    def teardown_method(self):
        Base.metadata.drop_all(bind=engine)

    def test_create_interaction(self):
        res = client.post("/interactions", json={"hcpName": "Dr. X", "interactionType": "Meeting", "sentiment": "Positive"})
        assert res.status_code == 200
        assert res.json()["success"] is True

    def test_list_interactions(self):
        client.post("/interactions", json={"hcpName": "Dr. X", "interactionType": "Meeting"})
        client.post("/interactions", json={"hcpName": "Dr. Y", "interactionType": "Call"})
        res = client.get("/interactions")
        assert res.status_code == 200
        data = res.json()
        assert data["total"] == 2
        assert len(data["items"]) == 2

    def test_search_interactions(self):
        client.post("/interactions", json={"hcpName": "Dr. X", "interactionType": "Meeting", "topics": "cardiology"})
        client.post("/interactions", json={"hcpName": "Dr. Y", "interactionType": "Call", "topics": "dermatology"})
        res = client.get("/interactions?search=cardio")
        assert res.status_code == 200
        data = res.json()
        assert data["total"] == 1
        assert data["items"][0]["hcpName"] == "Dr. X"

    def test_pagination(self):
        for i in range(5):
            client.post("/interactions", json={"hcpName": f"Dr. {i}"})
        res = client.get("/interactions?page=1&page_size=2")
        data = res.json()
        assert data["total"] == 5
        assert len(data["items"]) == 2
        assert data["page"] == 1


class TestHealth:
    def test_health(self):
        res = client.get("/")
        assert res.status_code == 200
        assert res.json()["status"] == "API is running"

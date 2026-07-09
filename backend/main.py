from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="AI-First CRM HCP")

# ✅ CORS — RIGHT HERE
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---- AI / CHAT MODELS ----
class ChatInput(BaseModel):
    message: str

@app.post("/interaction/chat")
def chat_interaction(data: ChatInput):
    return {
        "status": "received",
        "message": data.message
    }

# ---- INTERACTION APIs ----
class Interaction(BaseModel):
    hcpName: str
    interactionType: str
    date: str
    time: str
    attendees: str
    topics: str
    product: str
    summary: str

interactions = []

@app.post("/interactions")
def create_interaction(data: Interaction):
    interactions.append(data)
    return {"success": True, "data": data}

@app.get("/interactions")
def get_interactions():
    return interactions

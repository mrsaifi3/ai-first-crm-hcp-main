from typing import TypedDict, Optional, Any

class AgentState(TypedDict):
    user_input: str
    intent: Optional[str]
    result: Optional[Any]

from typing import TypedDict, Optional, Any, List


class Message(TypedDict):
    role: str
    text: str


class AgentState(TypedDict):
    user_input: str
    messages: List[Message]
    intent: Optional[str]
    result: Optional[Any]

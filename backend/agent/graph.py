from langgraph.graph import StateGraph, END

from backend.agent.state import AgentState
from backend.tools.log_interaction import log_interaction_tool
from backend.tools.edit_interaction import edit_interaction_tool
from backend.tools.summarize import summarize_interactions_tool
from backend.tools.followup import followup_recommendation_tool
from backend.tools.compliance import compliance_check_tool


def _is_command(text: str) -> str | None:
    """Detect intent from first line only (ignores copy-pasted history)."""
    first_line = text.split("\n")[0].split(".")[0].lower().strip()

    # Check if text is very long (>300 chars) — likely includes copy-pasted assistant text
    # In that case, only check the very beginning
    if len(text) > 300:
        first_part = text[:200].lower()
    else:
        first_part = first_line

    if "edit" in first_part:
        return "edit"
    if "summary" in first_part or "summarize" in first_part:
        return "summary"
    if "total interaction" in first_part or "how many" in first_part:
        return "summary"
    if "count" in first_part and ("interaction" in first_part or "log" in first_part):
        return "summary"
    if "follow" in first_part and ("up" in first_part or "recommend" in first_part):
        return "followup"
    if "compliance" in first_part or "off-label" in first_part:
        return "compliance"
    return None


def detect_intent(state: AgentState) -> AgentState:
    text = state["user_input"]
    messages = state.get("messages", [])

    # 1. If last assistant asked a question → route to edit
    if messages:
        last = messages[-1]
        if last.get("role") == "assistant" and "?" in last.get("text", ""):
            state["intent"] = "edit"
            return state

    # 2. Check for commands in the user input
    cmd = _is_command(text)
    if cmd:
        state["intent"] = cmd
    else:
        state["intent"] = "log"

    return state


def log_node(state: AgentState) -> AgentState:
    state["result"] = log_interaction_tool(
        state["user_input"],
        history=state.get("messages", [])
    )
    return state


def edit_node(state: AgentState) -> AgentState:
    state["result"] = edit_interaction_tool(
        state["user_input"],
        history=state.get("messages", [])
    )
    return state


def summary_node(state: AgentState) -> AgentState:
    state["result"] = summarize_interactions_tool()
    return state


def followup_node(state: AgentState) -> AgentState:
    state["result"] = followup_recommendation_tool()
    return state


def compliance_node(state: AgentState) -> AgentState:
    state["result"] = compliance_check_tool(state["user_input"])
    return state


graph = StateGraph(AgentState)

graph.add_node("router", detect_intent)
graph.add_node("log", log_node)
graph.add_node("edit", edit_node)
graph.add_node("summary", summary_node)
graph.add_node("followup", followup_node)
graph.add_node("compliance", compliance_node)

graph.set_entry_point("router")

graph.add_conditional_edges(
    "router",
    lambda state: state["intent"],
    {
        "log": "log",
        "edit": "edit",
        "summary": "summary",
        "followup": "followup",
        "compliance": "compliance",
    }
)

graph.add_edge("log", END)
graph.add_edge("edit", END)
graph.add_edge("summary", END)
graph.add_edge("followup", END)
graph.add_edge("compliance", END)

agent = graph.compile()

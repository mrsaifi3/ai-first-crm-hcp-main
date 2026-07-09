from langgraph.graph import StateGraph, END
from backend.agent.state import AgentState

from backend.tools.log_interaction import log_interaction_tool
from backend.tools.edit_interaction import edit_interaction_tool
from backend.tools.summarize import summarize_interactions_tool
from backend.tools.followup import followup_recommendation_tool
from backend.tools.compliance import compliance_check_tool


def detect_intent(state: AgentState) -> AgentState:
    text = state["user_input"].lower()

    if "edit" in text:
        state["intent"] = "edit"
    elif "summary" in text:
        state["intent"] = "summary"
    elif "follow" in text:
        state["intent"] = "followup"
    elif "compliance" in text or "off-label" in text:
        state["intent"] = "compliance"
    else:
        state["intent"] = "log"

    return state


def log_node(state: AgentState) -> AgentState:
    state["result"] = log_interaction_tool(state["user_input"])
    return state


def edit_node(state: AgentState) -> AgentState:
    state["result"] = edit_interaction_tool(
        interaction_id=1,
        new_summary="Updated by LangGraph"
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

def compliance_check_tool(text: str):
    if "off-label" in text.lower():
        return {
            "status": "issue_detected",
            "messageToUser": "Potential compliance issue detected: off-label discussion found.",
        }
    return {
        "status": "ok",
        "messageToUser": "No compliance issues detected.",
    }

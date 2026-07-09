def compliance_check_tool(text: str):
    if "off-label" in text.lower():
        return "⚠️ Potential compliance issue detected"
    return "No compliance issues detected"

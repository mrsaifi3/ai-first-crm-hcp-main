const API_URL = "http://localhost:8000";

export async function submitInteraction(data) {
  const response = await fetch(`${API_URL}/interactions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to submit interaction");
  }

  return await response.json();
}

export async function fetchInteractions(page = 1, pageSize = 20, search = "") {
  const params = new URLSearchParams({ page, page_size: pageSize });
  if (search) params.set("search", search);
  const response = await fetch(`${API_URL}/interactions?${params}`);

  if (!response.ok) {
    throw new Error("Failed to fetch interactions");
  }

  return await response.json();
}

export async function sendChatMessage(message, history = []) {
  const response = await fetch(`${API_URL}/interaction`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_input: message, messages: history }),
  });

  if (!response.ok) {
    throw new Error("Failed to get AI response");
  }

  return await response.json();
}

export async function checkForm(formData) {
  const response = await fetch(`${API_URL}/check-form`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });
  if (!response.ok) throw new Error("Failed to check form");
  return await response.json();
}

export async function fetchSuggestions(formData) {
  const response = await fetch(`${API_URL}/suggestions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch suggestions");
  }

  return await response.json();
}

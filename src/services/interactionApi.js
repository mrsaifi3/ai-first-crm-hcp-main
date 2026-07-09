const API_URL = "http://localhost:8000";

export async function submitInteraction(data) {
  const response = await fetch(`${API_URL}/interactions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to submit interaction");
  }

  return await response.json();
}

export async function fetchInteractions() {
  const response = await fetch(`${API_URL}/interactions`);

  if (!response.ok) {
    throw new Error("Failed to fetch interactions");
  }

  return await response.json();
}

export async function sendChatMessage(message, history = []) {
  const response = await fetch(`${API_URL}/interaction`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ user_input: message, messages: history }),
  });

  if (!response.ok) {
    throw new Error("Failed to get AI response");
  }

  return await response.json();
}

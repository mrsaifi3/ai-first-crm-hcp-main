const API_URL = "http://localhost:5000/interactions";

/**
 * Submit a new interaction
 */
export async function submitInteraction(data) {
  const response = await fetch(API_URL, {
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

/**
 * Fetch all interactions (for future use / verification)
 */
export async function fetchInteractions() {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error("Failed to fetch interactions");
  }

  return await response.json();
}



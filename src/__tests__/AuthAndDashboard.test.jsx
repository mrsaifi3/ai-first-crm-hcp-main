import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Dashboard from "../auth/Dashboard";
import { describe, it, expect, beforeEach } from "vitest";

beforeEach(() => {
  vi.clearAllMocks();
});

function mockFetchSequence(...responses) {
  responses.forEach((data) => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve(data),
    });
  });
}

function renderDashboard() {
  return render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>
  );
}

describe("Dashboard", () => {
  it("shows loading initially", () => {
    global.fetch.mockReturnValue(new Promise(() => {}));
    renderDashboard();
    expect(screen.getByText("Loading dashboard...")).toBeInTheDocument();
  });

  it("displays stats when loaded", async () => {
    mockFetchSequence(
      { total: 10, weekly: 3, by_sentiment: { Positive: 5, Neutral: 3, Negative: 2 },
        by_type: { Meeting: 4, Call: 3, Email: 3 }, top_hcps: [{ name: "Dr. X", count: 3 }] },
      { items: [] }
    );
    renderDashboard();
    expect(await screen.findByText("Total Interactions")).toBeInTheDocument();
    expect(screen.getByText("Dr. X")).toBeInTheDocument();
  });

  it("shows empty state when no top HCPs", async () => {
    mockFetchSequence(
      { total: 0, weekly: 0, by_sentiment: {}, by_type: {}, top_hcps: [] },
      { items: [] }
    );
    renderDashboard();
    expect(await screen.findByText("No interactions yet")).toBeInTheDocument();
  });
});

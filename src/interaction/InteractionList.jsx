import { useEffect, useState } from "react";
import { fetchInteractions } from "../services/interactionApi";

export default function InteractionList() {
  const [interactions, setInteractions] = useState([]);

  useEffect(() => {
    fetchInteractions().then(setInteractions).catch(console.error);
  }, []);

  return (
    <div className="list-card">
      <h2>Logged Interactions</h2>

      {interactions.length === 0 ? (
        <p>No interactions logged yet.</p>
      ) : (
        <ul>
          {interactions.map((item) => (
            <li key={item.id}>
              <strong>{item.hcpName}</strong> — {item.interactionType}
              <br />
              <small>{item.summary}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

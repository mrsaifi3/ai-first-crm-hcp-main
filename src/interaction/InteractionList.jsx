import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { fetchInteractions } from "../services/interactionApi";

export default function InteractionList() {
  const [interactions, setInteractions] = useState([]);
  const listRefresh = useSelector((state) => state.interaction.listRefresh);

  useEffect(() => {
    fetchInteractions().then(setInteractions).catch(console.error);
  }, [listRefresh]);

  return (
    <div className="list-card">
      <h2>Logged Interactions</h2>

      {interactions.length === 0 ? (
        <p>No interactions logged yet.</p>
      ) : (
        <ul>
          {interactions.map((item) => (
            <li key={item.id}>
              <div className="list-item-header">
                <strong>{item.hcpName}</strong>
                <span className="list-item-type">{item.interactionType || "Meeting"}</span>
                {item.date && <span className="list-item-date">{item.date}</span>}
                {item.sentiment && (
                  <span className={`list-item-sentiment sentiment-${(item.sentiment || "").toLowerCase()}`}>
                    {item.sentiment}
                  </span>
                )}
              </div>
              <small>{item.summary}</small>
              {item.topics && <div className="list-item-detail">Topics: {item.topics}</div>}
              {item.outcomes && <div className="list-item-detail">Outcomes: {item.outcomes}</div>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

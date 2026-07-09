import { useState, useEffect } from "react";

export default function InfoTip({ text, title }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) {
    return (
      <button type="button" className="info-tip-btn" onClick={() => setOpen(true)} tabIndex={-1}>
        i
      </button>
    );
  }

  return (
    <div className="info-tip-overlay" onClick={() => setOpen(false)}>
      <div className="info-tip-modal" onClick={(e) => e.stopPropagation()}>
        <div className="info-tip-modal-header">
          <span>{title || "About this field"}</span>
          <button type="button" className="info-tip-close" onClick={() => setOpen(false)}>
            &times;
          </button>
        </div>
        <div className="info-tip-modal-body">{text}</div>
      </div>
    </div>
  );
}

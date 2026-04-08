import { useState } from "react";

interface Props {
  currentReminder: string | null;
  onSet: (reminderAt: string | null) => void;
  onClose: () => void;
}

export function ReminderPicker({ currentReminder, onSet, onClose }: Props) {
  const [datetime, setDatetime] = useState(currentReminder || "");

  return (
    <div className="reminder-picker">
      <label>Set reminder:</label>
      <input
        type="datetime-local"
        value={datetime}
        onChange={(e) => setDatetime(e.target.value)}
      />
      <div className="reminder-actions">
        <button
          className="btn-save"
          onClick={() => onSet(datetime || null)}
          disabled={!datetime}
        >
          Set
        </button>
        {currentReminder && (
          <button className="btn-cancel" onClick={() => onSet(null)}>
            Clear
          </button>
        )}
        <button className="btn-cancel" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

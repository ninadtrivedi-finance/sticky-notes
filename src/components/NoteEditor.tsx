import { useState } from "react";
import { NOTE_COLORS } from "../types";

interface Props {
  title: string;
  body: string;
  color: string;
  onSave: (title: string, body: string, color: string) => void;
  onCancel: () => void;
}

export function NoteEditor({ title, body, color, onSave, onCancel }: Props) {
  const [editTitle, setEditTitle] = useState(title);
  const [editBody, setEditBody] = useState(body);
  const [editColor, setEditColor] = useState(color);

  return (
    <div className="note-editor">
      <input
        type="text"
        className="editor-title"
        placeholder="Title..."
        value={editTitle}
        onChange={(e) => setEditTitle(e.target.value)}
        autoFocus
      />
      <textarea
        className="editor-body"
        placeholder="Write your note..."
        value={editBody}
        onChange={(e) => setEditBody(e.target.value)}
        rows={4}
      />
      <div className="color-picker">
        {NOTE_COLORS.map((c) => (
          <button
            key={c.hex}
            className={`color-dot ${editColor === c.hex ? "selected" : ""}`}
            style={{ backgroundColor: c.hex }}
            onClick={() => setEditColor(c.hex)}
            title={c.name}
          />
        ))}
      </div>
      <div className="editor-actions">
        <button className="btn-save" onClick={() => onSave(editTitle, editBody, editColor)}>
          Save
        </button>
        <button className="btn-cancel" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}

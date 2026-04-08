import { useState, useCallback } from "react";
import { StickyNote as StickyNoteType } from "../types";
import { useDrag } from "../hooks/useDrag";
import { NoteEditor } from "./NoteEditor";
import { ReminderPicker } from "./ReminderPicker";

interface Props {
  note: StickyNoteType;
  onUpdate: (note: StickyNoteType) => void;
  onDelete: (id: string) => void;
  rotation: number;
}

export function StickyNote({ note, onUpdate, onDelete, rotation }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [showReminder, setShowReminder] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);

  const handleDragEnd = useCallback(
    (x: number, y: number) => {
      onUpdate({
        ...note,
        positionX: x,
        positionY: y,
        updatedAt: new Date().toISOString().slice(0, 19),
      });
    },
    [note, onUpdate]
  );

  const { position, onMouseDown } = useDrag(
    note.positionX,
    note.positionY,
    handleDragEnd
  );

  const toggleComplete = () => {
    onUpdate({
      ...note,
      isCompleted: !note.isCompleted,
      updatedAt: new Date().toISOString().slice(0, 19),
    });
  };

  const handleSave = (title: string, body: string, color: string) => {
    onUpdate({
      ...note,
      title,
      body,
      color,
      updatedAt: new Date().toISOString().slice(0, 19),
    });
    setIsEditing(false);
  };

  const handleSetReminder = (reminderAt: string | null) => {
    onUpdate({
      ...note,
      reminderAt,
      reminderSent: false,
      updatedAt: new Date().toISOString().slice(0, 19),
    });
    setShowReminder(false);
  };

  return (
    <div
      className={`sticky-note ${isFlashing ? "flash" : ""} ${note.isCompleted ? "completed" : ""}`}
      style={{
        transform: `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg)`,
        backgroundColor: note.color,
        width: note.width,
        minHeight: note.height,
      }}
      onMouseDown={onMouseDown}
      onDoubleClick={() => setIsEditing(true)}
    >
      <div className="note-pin"></div>

      <div className="note-actions no-drag">
        <button
          className="note-btn"
          onClick={toggleComplete}
          title={note.isCompleted ? "Mark incomplete" : "Mark complete"}
        >
          {note.isCompleted ? "✓" : "○"}
        </button>
        <button
          className="note-btn"
          onClick={() => setIsEditing(true)}
          title="Edit"
        >
          ✎
        </button>
        <button
          className="note-btn"
          onClick={() => setShowReminder(!showReminder)}
          title="Set reminder"
        >
          {note.reminderAt && !note.reminderSent ? "🔔" : "🔕"}
        </button>
        <button
          className="note-btn delete-btn"
          onClick={() => onDelete(note.id)}
          title="Delete"
        >
          ×
        </button>
      </div>

      {showReminder && (
        <div className="no-drag">
          <ReminderPicker
            currentReminder={note.reminderAt}
            onSet={handleSetReminder}
            onClose={() => setShowReminder(false)}
          />
        </div>
      )}

      {isEditing ? (
        <div className="no-drag">
          <NoteEditor
            title={note.title}
            body={note.body}
            color={note.color}
            onSave={handleSave}
            onCancel={() => setIsEditing(false)}
          />
        </div>
      ) : (
        <div className="note-content">
          {note.title && (
            <h3 className={note.isCompleted ? "strikethrough" : ""}>
              {note.title}
            </h3>
          )}
          {note.body && (
            <p className={note.isCompleted ? "strikethrough" : ""}>
              {note.body}
            </p>
          )}
          {!note.title && !note.body && (
            <p className="placeholder">Double-click to edit...</p>
          )}
          {note.reminderAt && !note.reminderSent && (
            <div className="reminder-badge">
              ⏰ {new Date(note.reminderAt).toLocaleString()}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

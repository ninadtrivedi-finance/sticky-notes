import { useState, useMemo } from "react";
import { useNotes } from "./hooks/useNotes";
import { StickyNote } from "./components/StickyNote";
import { AddNoteButton } from "./components/AddNoteButton";
import { Toolbar } from "./components/Toolbar";

// Deterministic rotation per note ID for a natural look
function getRotation(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
  }
  return (hash % 5) - 2; // -2 to 2 degrees
}

export default function App() {
  const { notes, loading, addNote, editNote, removeNote, deleteCompleted } =
    useNotes();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");

  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      const matchesSearch =
        !search ||
        note.title.toLowerCase().includes(search.toLowerCase()) ||
        note.body.toLowerCase().includes(search.toLowerCase());

      const matchesFilter =
        filter === "all" ||
        (filter === "active" && !note.isCompleted) ||
        (filter === "completed" && note.isCompleted);

      return matchesSearch && matchesFilter;
    });
  }, [notes, search, filter]);

  const completedCount = notes.filter((n) => n.isCompleted).length;

  if (loading) {
    return (
      <div className="loading">
        <p>Loading notes...</p>
      </div>
    );
  }

  return (
    <div className="app">
      <Toolbar
        search={search}
        onSearchChange={setSearch}
        filter={filter}
        onFilterChange={setFilter}
        onDeleteCompleted={deleteCompleted}
        noteCount={notes.length}
        completedCount={completedCount}
      />

      <div className="notes-canvas">
        {filteredNotes.map((note) => (
          <StickyNote
            key={note.id}
            note={note}
            onUpdate={editNote}
            onDelete={removeNote}
            rotation={getRotation(note.id)}
          />
        ))}

        {filteredNotes.length === 0 && (
          <div className="empty-state">
            <p>
              {notes.length === 0
                ? 'No notes yet. Click "+" to create one!'
                : "No notes match your search/filter."}
            </p>
          </div>
        )}
      </div>

      <AddNoteButton onAdd={addNote} />
    </div>
  );
}

import { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { StickyNote } from "../types";

export function useNotes() {
  const [notes, setNotes] = useState<StickyNote[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotes = useCallback(async () => {
    try {
      const result = await invoke<StickyNote[]>("get_notes");
      setNotes(result);
    } catch (e) {
      console.error("Failed to fetch notes:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  useEffect(() => {
    const unlisten = listen<string>("note-reminder-fired", (event) => {
      setNotes((prev) =>
        prev.map((n) =>
          n.id === event.payload ? { ...n, reminderSent: true } : n
        )
      );
    });
    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

  const addNote = useCallback(
    async (color: string, positionX: number, positionY: number) => {
      try {
        const note = await invoke<StickyNote>("create_note", {
          title: "",
          color,
          positionX,
          positionY,
        });
        setNotes((prev) => [note, ...prev]);
        return note;
      } catch (e) {
        console.error("Failed to create note:", e);
        return null;
      }
    },
    []
  );

  const editNote = useCallback(async (note: StickyNote) => {
    try {
      await invoke("update_note", { note });
      setNotes((prev) => prev.map((n) => (n.id === note.id ? note : n)));
    } catch (e) {
      console.error("Failed to update note:", e);
    }
  }, []);

  const removeNote = useCallback(async (id: string) => {
    try {
      await invoke("delete_note", { id });
      setNotes((prev) => prev.filter((n) => n.id !== id));
    } catch (e) {
      console.error("Failed to delete note:", e);
    }
  }, []);

  const deleteCompleted = useCallback(async () => {
    const completed = notes.filter((n) => n.isCompleted);
    const deletedIds: string[] = [];
    for (const note of completed) {
      try {
        await invoke("delete_note", { id: note.id });
        deletedIds.push(note.id);
      } catch (e) {
        console.error("Failed to delete note:", note.id, e);
      }
    }
    setNotes((prev) => prev.filter((n) => !deletedIds.includes(n.id)));
  }, [notes]);

  return { notes, loading, addNote, editNote, removeNote, deleteCompleted };
}

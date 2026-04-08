import { NOTE_COLORS } from "../types";

interface Props {
  onAdd: (color: string, x: number, y: number) => void;
}

export function AddNoteButton({ onAdd }: Props) {
  const handleClick = () => {
    const randomColor =
      NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)].hex;
    const x = 50 + Math.random() * 200;
    const y = 80 + Math.random() * 200;
    onAdd(randomColor, x, y);
  };

  return (
    <button className="add-note-btn" onClick={handleClick} title="Add new note">
      +
    </button>
  );
}

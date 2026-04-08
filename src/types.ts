export interface StickyNote {
  id: string;
  title: string;
  body: string;
  color: string;
  isCompleted: boolean;
  positionX: number;
  positionY: number;
  width: number;
  height: number;
  reminderAt: string | null;
  reminderSent: boolean;
  createdAt: string;
  updatedAt: string;
}

export const NOTE_COLORS = [
  { name: "Yellow", hex: "#FDFD96" },
  { name: "Pink", hex: "#FFB7C5" },
  { name: "Green", hex: "#B5EAD7" },
  { name: "Blue", hex: "#A0C4FF" },
  { name: "Purple", hex: "#CDC1FF" },
  { name: "Orange", hex: "#FFD6A5" },
];

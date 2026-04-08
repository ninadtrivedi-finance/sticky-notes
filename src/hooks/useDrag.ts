import { useState, useCallback, useRef, useEffect } from "react";

interface DragState {
  isDragging: boolean;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

export function useDrag(
  initialX: number,
  initialY: number,
  onDragEnd: (x: number, y: number) => void
) {
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const dragRef = useRef<DragState>({
    isDragging: false,
    startX: 0,
    startY: 0,
    currentX: initialX,
    currentY: initialY,
  });

  useEffect(() => {
    setPosition({ x: initialX, y: initialY });
    dragRef.current.currentX = initialX;
    dragRef.current.currentY = initialY;
  }, [initialX, initialY]);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".no-drag")) return;
    dragRef.current.isDragging = true;
    dragRef.current.startX = e.clientX - dragRef.current.currentX;
    dragRef.current.startY = e.clientY - dragRef.current.currentY;
    e.preventDefault();
  }, []);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragRef.current.isDragging) return;
      const newX = e.clientX - dragRef.current.startX;
      const newY = e.clientY - dragRef.current.startY;
      dragRef.current.currentX = newX;
      dragRef.current.currentY = newY;
      setPosition({ x: newX, y: newY });
    };

    const onMouseUp = () => {
      if (!dragRef.current.isDragging) return;
      dragRef.current.isDragging = false;
      onDragEnd(dragRef.current.currentX, dragRef.current.currentY);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [onDragEnd]);

  return { position, onMouseDown };
}

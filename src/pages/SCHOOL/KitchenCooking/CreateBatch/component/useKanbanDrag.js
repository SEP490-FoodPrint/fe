import { useCallback, useEffect, useRef, useState } from "react";

const MOUSE_THRESHOLD = 5; // px trước khi bắt đầu kéo bằng chuột
const TOUCH_HOLD_MS = 300; // nhấn giữ trước khi kéo bằng cảm ứng
const TOUCH_TOLERANCE = 8; // px cho phép rung tay trong lúc nhấn giữ

const columnAt = (x, y) =>
  document.elementFromPoint(x, y)?.closest?.("[data-kanban-column]")?.dataset.kanbanColumn || null;

/**
 * Kéo thả thẻ giữa các cột bằng Pointer Events (chuột + cảm ứng), không cần thư viện.
 * - Chuột: bắt đầu kéo sau khi di chuyển vài px.
 * - Cảm ứng: nhấn giữ ~0,3 giây rồi kéo; trong lúc kéo trang không cuộn.
 */
export default function useKanbanDrag({ onDrop }) {
  const [drag, setDrag] = useState(null);
  const pending = useRef(null);
  const active = useRef(null);
  const suppressClick = useRef(false);
  const onDropRef = useRef(onDrop);
  onDropRef.current = onDrop;

  const clearPending = () => {
    if (pending.current?.timer) clearTimeout(pending.current.timer);
    pending.current = null;
  };

  const begin = useCallback((x, y) => {
    const p = pending.current;
    if (!p) return;
    const rect = p.element.getBoundingClientRect();
    active.current = {
      item: p.item,
      from: p.from,
      preview: p.preview,
      width: rect.width,
      offsetX: p.startX - rect.left,
      offsetY: p.startY - rect.top,
      x,
      y,
      over: columnAt(x, y),
    };
    clearPending();
    setDrag({ ...active.current });
  }, []);

  const startPointer = useCallback(
    (event, item, from, preview) => {
      if (event.button !== undefined && event.button !== 0) return;
      if (event.target.closest("button, a, input, select, textarea")) return;
      clearPending();
      pending.current = {
        item,
        from,
        preview,
        element: event.currentTarget,
        pointerType: event.pointerType,
        startX: event.clientX,
        startY: event.clientY,
        timer:
          event.pointerType === "mouse"
            ? null
            : setTimeout(() => begin(event.clientX, event.clientY), TOUCH_HOLD_MS),
      };
    },
    [begin],
  );

  useEffect(() => {
    const move = (event) => {
      const p = pending.current;
      if (p && !active.current) {
        const distance = Math.hypot(event.clientX - p.startX, event.clientY - p.startY);
        if (p.pointerType === "mouse" && distance > MOUSE_THRESHOLD) begin(event.clientX, event.clientY);
        else if (p.pointerType !== "mouse" && distance > TOUCH_TOLERANCE) clearPending();
        return;
      }
      if (!active.current) return;
      active.current = {
        ...active.current,
        x: event.clientX,
        y: event.clientY,
        over: columnAt(event.clientX, event.clientY),
      };
      setDrag({ ...active.current });
    };

    const end = () => {
      clearPending();
      const current = active.current;
      if (!current) return;
      active.current = null;
      setDrag(null);
      suppressClick.current = true;
      setTimeout(() => {
        suppressClick.current = false;
      }, 0);
      if (current.over && current.over !== current.from) onDropRef.current?.(current.item, current.from, current.over);
    };

    const cancel = () => {
      clearPending();
      if (!active.current) return;
      active.current = null;
      setDrag(null);
    };

    // Chặn cuộn trang trên cảm ứng khi đang kéo thẻ.
    const blockScroll = (event) => {
      if (active.current) event.preventDefault();
    };
    const escape = (event) => {
      if (event.key === "Escape") cancel();
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", cancel);
    window.addEventListener("touchmove", blockScroll, { passive: false });
    window.addEventListener("keydown", escape);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", cancel);
      window.removeEventListener("touchmove", blockScroll);
      window.removeEventListener("keydown", escape);
      clearPending();
    };
  }, [begin]);

  return {
    drag,
    startPointer,
    shouldIgnoreClick: () => suppressClick.current,
  };
}

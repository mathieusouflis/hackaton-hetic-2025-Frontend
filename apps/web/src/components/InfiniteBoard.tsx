import React, { useRef, useState, useEffect } from "react";

/**
 * InfiniteBoard : Un board infini façon Miro/Figma avec pan (drag/scroll) et zoom (molette/pinch).
 * Prêt à accueillir des cards ou éléments interactifs.
 */
const MIN_SCALE = 0.2;
const MAX_SCALE = 2.5;
const SCALE_STEP = 0.08;

export default function InfiniteBoard() {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const gestureScaleRef = useRef(1);
  const velocity = useRef({ x: 0, y: 0 });
  const inertiaFrame = useRef<number | null>(null);
  const wheelTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Empêche le zoom navigateur lors du pinch trackpad (Safari/Chrome Mac) et applique un zoom custom sur le board
  useEffect(() => {
    const node = boardRef.current;
    if (!node) return;
    const prevent = (e: Event) => e.preventDefault();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleGestureStart = (e: any) => {
      prevent(e);
      gestureScaleRef.current = scale;
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleGestureChange = (e: any) => {
      prevent(e);
      let newScale = gestureScaleRef.current * e.scale;
      newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, newScale));
      setScale(newScale);
    };
    node.addEventListener("gesturestart", handleGestureStart, {
      passive: false,
    });
    node.addEventListener("gesturechange", handleGestureChange, {
      passive: false,
    });
    node.addEventListener("gestureend", prevent, { passive: false });
    return () => {
      node.removeEventListener("gesturestart", handleGestureStart);
      node.removeEventListener("gesturechange", handleGestureChange);
      node.removeEventListener("gestureend", prevent);
    };
  }, [scale]);

  // Helper to stop inertia
  const stopInertia = () => {
    if (inertiaFrame.current) {
      cancelAnimationFrame(inertiaFrame.current);
      inertiaFrame.current = null;
    }
    velocity.current = { x: 0, y: 0 };
  };

  // Inertia animation
  const startInertia = () => {
    const friction = 0.92; // Lower = more friction
    const minVelocity = 0.5; // px/frame

    function animate() {
      velocity.current.x *= friction;
      velocity.current.y *= friction;

      setOffset((prev) => ({
        x: prev.x + velocity.current.x,
        y: prev.y + velocity.current.y,
      }));

      if (
        Math.abs(velocity.current.x) > minVelocity ||
        Math.abs(velocity.current.y) > minVelocity
      ) {
        inertiaFrame.current = requestAnimationFrame(animate);
      } else {
        stopInertia();
      }
    }

    inertiaFrame.current = requestAnimationFrame(animate);
  };

  // Gestion du drag (pan)
  const handleMouseDown = (e: React.MouseEvent) => {
    stopInertia(); // Stop inertia on new drag
    setDragging(true);
    lastPos.current = { x: e.clientX, y: e.clientY };
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging || !lastPos.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    setOffset((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
    // Track velocity for inertia
    velocity.current = { x: dx, y: dy };
    lastPos.current = { x: e.clientX, y: e.clientY };
  };
  const handleMouseUp = () => {
    setDragging(false);
    lastPos.current = null;
    // Start inertia if velocity is significant
    if (Math.abs(velocity.current.x) > 1 || Math.abs(velocity.current.y) > 1) {
      startInertia();
    }
  };

  /**
   * Handle wheel and pinch events for pan and zoom.
   * - Two-finger scroll = pan (smooth, diagonal).
   * - Pinch or wheel+ctrl = zoom, centered on cursor.
   * - Prevent browser zoom.
   */
  const handleWheel = (e: React.WheelEvent) => {
    stopInertia(); // Stop inertia on new wheel
    // Pinch-to-zoom (trackpad) or wheel+ctrl (browser zoom gesture)
    if (e.ctrlKey) {
      e.preventDefault();
      // Calculate zoom factor
      let newScale = scale - e.deltaY * SCALE_STEP * 0.01;
      newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, newScale));

      // Zoom centered on cursor
      const rect = boardRef.current?.getBoundingClientRect();
      if (rect) {
        const cursorX = e.clientX - rect.left;
        const cursorY = e.clientY - rect.top;
        const relX = (cursorX - offset.x - rect.width / 2) / scale;
        const relY = (cursorY - offset.y - rect.height / 2) / scale;
        const scaleRatio = newScale / scale;
        setOffset((prev) => ({
          x: prev.x - relX * (scaleRatio - 1) * scale,
          y: prev.y - relY * (scaleRatio - 1) * scale,
        }));
      }
      setScale(newScale);
      return;
    }

    // Pan (trackpad two-finger scroll or mouse wheel)
    e.preventDefault();
    setOffset((prev) => ({
      x: prev.x - e.deltaX,
      y: prev.y - e.deltaY,
    }));
    // Track velocity for inertia (invert sign to match movement)
    velocity.current = { x: -e.deltaX, y: -e.deltaY };

    // Start inertia on wheel end (debounced)
    if (inertiaFrame.current) cancelAnimationFrame(inertiaFrame.current);
    if (wheelTimeoutRef.current) clearTimeout(wheelTimeoutRef.current);
    wheelTimeoutRef.current = setTimeout(() => {
      if (
        Math.abs(velocity.current.x) > 1 ||
        Math.abs(velocity.current.y) > 1
      ) {
        startInertia();
      }
    }, 40); // 40ms after last wheel event
  };

  // --- GRID LOGIC ---
  const baseGridSize = 40;
  const gridSize = baseGridSize * scale;
  const gridStyle = {
    position: "absolute" as const,
    inset: 0,
    zIndex: 0,
    pointerEvents: "none" as const,
    backgroundColor: "#f3f4f6",
    backgroundImage: `
      linear-gradient(to right, #d1d5db 1px, transparent 1px),
      linear-gradient(to bottom, #d1d5db 1px, transparent 1px)
    `,
    backgroundSize: `${gridSize}px ${gridSize}px`,
    backgroundPosition: `${offset.x % gridSize}px ${offset.y % gridSize}px`,
  };

  return (
    <div
      ref={boardRef}
      className="fixed inset-0 w-full h-full overflow-hidden cursor-grab select-none bg-neutral-100"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      tabIndex={0}
    >
      <div
        className="absolute left-1/2 top-1/2 min-w-[2000px] min-h-[2000px] flex items-center justify-center"
        style={{
          transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
          transition: dragging
            ? "none"
            : "transform 0.15s cubic-bezier(.4,0,.2,1)",
        }}
      >
        {/* Grid background, moves and zooms with content */}
        <div style={gridStyle} />
        {/* Placeholder pour les cards */}
        <div className="w-32 h-32 bg-white border-2 border-dashed border-gray-300 rounded-lg z-10 flex items-center justify-center text-gray-400">
          Board infini
        </div>
      </div>
    </div>
  );
}

import React, { useRef, useState, useEffect } from "react";
import Cards from "./ui/cards";
import { useGetBoard } from "@/hooks/useGetBoard";

/**
 * InfiniteBoard : Un board infini façon Figma/Miro avec pan (drag/scroll) et zoom (molette/pinch).
 * Prêt à accueillir des cards ou éléments interactifs.
 */
const MIN_SCALE = 0.2;
const MAX_SCALE = 2.5;
const SCALE_STEP = 0.08;

interface InfiniteBoardProps {
  boardName: string | null;
}

export default function InfiniteBoard({ boardName }: InfiniteBoardProps) {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const gestureScaleRef = useRef(1);
  const velocity = useRef({ x: 0, y: 0 });
  const inertiaFrame = useRef<number | null>(null);
  const wheelTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch real cards if boardId is present
  const { cards: fetchedCards, loading, error } = useGetBoard(boardName ?? "");

  // Generate honeycomb/hex grid if no board is selected (demo)
  useEffect(() => {
    // Hex grid params
    const cardWidth = 128;
    const cardHeight = 128;
    const spacingX = cardWidth * 0.9;
    const spacingY = cardHeight * 0.78;
    const hexCards = [];
    let id = 1;
    let count = 0;
    for (let row = 0; row < 10 && count < 10; row++) {
      for (let col = 0; col < 10 && count < 10; col++) {
        const x = col * spacingX + (row % 2 === 1 ? spacingX / 2 : 0);
        const y = row * spacingY;
        hexCards.push({
          id: id++,
          x,
          y,
          label: `App ${id - 1}`,
        });
        count++;
      }
    }
  }, [boardName]);

  // --- SMART GRID LOGIC (Miro/Figma style) ---

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
    if (e.ctrlKey || e.metaKey) {
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

  // Canvas grid ref
  const gridCanvasRef = useRef<HTMLCanvasElement>(null);
  // Board size (should match min-w/min-h)
  const boardSize = 5000;

  // Draw grid on canvas when offset/scale changes
  /* useEffect(() => {
    const canvas = gridCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // HiDPI support
    const dpr = window.devicePixelRatio || 1;
    canvas.width = boardSize * dpr;
    canvas.height = boardSize * dpr;
    canvas.style.width = `${boardSize}px`;
    canvas.style.height = `${boardSize}px`;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(dpr, dpr);

    // --- Minimalist GRID LOGIC ---
    const gridSize = 40; // px
    // Offset for grid lines (centered)
    const ox = (offset.x % gridSize) + boardSize / 2;
    const oy = (offset.y % gridSize) + boardSize / 2;

    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1;
    // Vertical lines
    for (let x = ox; x < boardSize; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, boardSize);
      ctx.stroke();
    }
    for (let x = ox - gridSize; x > 0; x -= gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, boardSize);
      ctx.stroke();
    }
    // Horizontal lines
    for (let y = oy; y < boardSize; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(boardSize, y);
      ctx.stroke();
    }
    for (let y = oy - gridSize; y > 0; y -= gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(boardSize, y);
      ctx.stroke();
    }
  }, [offset, scale]);*/

  // Helper to calculate honeycomb/hex grid position for each card
  const cardWidth = 180; // px, adjust to your card size
  const cardHeight = 180; // px, adjust to your card size
  const spacingX = cardWidth * 0.85;
  const spacingY = cardHeight * 0.75;
  const cols = 5; // Number of columns in the honeycomb

  function getHexPosition(idx: number) {
    const row = Math.floor(idx / cols);
    const col = idx % cols;
    const x = col * spacingX + (row % 2 === 1 ? spacingX / 2 : 0);
    const y = row * spacingY;
    return { x, y };
  }

  return (
    <div
      ref={boardRef}
      className="fixed inset-0 w-full h-full overflow-hidden bg-neutral-100 cursor-grab select-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      tabIndex={0}
    >
      {/* Show loading message when fetching cards */}
      {boardName && loading && (
        <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-white bg-opacity-80 px-6 py-4 rounded-lg shadow text-gray-500 text-lg font-medium">
            Loading board...
          </div>
        </div>
      )}
      {/* Show error message if there is an error */}
      {boardName && error && (
        <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-red-100 bg-opacity-90 px-6 py-4 rounded-lg shadow text-red-600 text-lg font-medium">
            Error loading board: {error.message}
          </div>
        </div>
      )}
      <div
        className="absolute left-1/2 top-1/2 min-w-[5000px] min-h-[5000px] flex items-center justify-center"
        style={{
          transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
          transition: "none", // No transition for instant feedback
        }}
      >
        {/* Canvas grid under cards */}
        <canvas
          ref={gridCanvasRef}
          width={boardSize}
          height={boardSize}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            zIndex: 0,
            pointerEvents: "none",
          }}
        />
        {/* Render cards at their logical board positions */}
        {boardName
          ? fetchedCards.map((card, idx) => {
              const { x, y } = getHexPosition(idx);
              return (
                <div
                  key={card.id}
                  style={{
                    transform: `translate(${x}px, ${y}px)`,
                    position: "absolute",
                  }}
                  className="transition-transform duration-200 hover:scale-110"
                >
                  <Cards
                    title={card.title ?? ""}
                    description={card.text ?? ""}
                    tags={card.tags ?? []}
                    url={card.url ?? ""}
                    images={card.img ? [card.img] : []}
                  />
                </div>
              );
            })
          : // Demo: show 10 cards in honeycomb
            Array.from({ length: 10 }).map((_, idx) => {
              const { x, y } = getHexPosition(idx);
              return (
                <div
                  key={idx}
                  style={{
                    transform: `translate(${x}px, ${y}px)`,
                    position: "absolute",
                  }}
                  className="transition-transform duration-200 hover:scale-110"
                >
                  <Cards
                    title={`App ${idx + 1}`}
                    description={"Demo card"}
                    tags={["demo", "tag"]}
                    url={"https://example.com"}
                    images={[]}
                  />
                </div>
              );
            })}
        {/* Placeholder for board center */}
        {/* <div className="w-32 h-32 bg-white border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400">
          Board infini
        </div>
        <Cards
          title="lksfghiusdfgh"
          description="gfdgdfg"
          tags={TAGS}
          url="youtube.com"
        />
        </div> */}
      </div>
    </div>
  );
}

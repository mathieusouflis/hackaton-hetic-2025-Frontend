import React from "react";
import { Button } from "./ui/button";
import { X } from "lucide-react";

interface ImageFullscreenProps {
  image: string;
  onClose: () => void;
}

export const ImageFullscreen = ({ image, onClose }: ImageFullscreenProps) => {
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 bg-black/95 z-[9999] flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="relative max-w-[90vw] max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          variant="ghost"
          size="icon"
          className="absolute -top-10 right-0 bg-black/50 hover:bg-black/70 text-white"
          onClick={onClose}
        >
          <X className="h-6 w-6" />
        </Button>

        <img
          src={image}
          alt="Image en plein écran"
          className="max-w-full max-h-[90vh] object-contain"
          style={{ display: "block" }}
        />

        <div className="absolute bottom-2 left-0 right-0 flex justify-center">
          <div className="text-xs text-gray-400 bg-black/40 px-3 py-1 rounded-full">
            <span>ESC pour fermer</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageFullscreen;

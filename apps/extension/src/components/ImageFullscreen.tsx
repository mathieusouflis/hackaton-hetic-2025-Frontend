import React from "react";
import { Button } from "./ui/button";
import { X } from "lucide-react";

interface ImageFullscreenProps {
  image: string;
  images: string[];
  onClose: () => void;
  onNavigate: (image: string) => void;
}

export const ImageFullscreen = ({
  image,
  images,
  onClose,
  onNavigate,
}: ImageFullscreenProps) => {
  const currentIndex = images.indexOf(image);
  const hasMultipleImages = images.length > 1;

  const goToPrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    const prevIndex = currentIndex <= 0 ? images.length - 1 : currentIndex - 1;
    onNavigate(images[prevIndex]);
  };

  const goToNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextIndex = currentIndex >= images.length - 1 ? 0 : currentIndex + 1;
    onNavigate(images[nextIndex]);
  };

  // Handle keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowLeft":
          if (hasMultipleImages) {
            const prevIndex =
              currentIndex <= 0 ? images.length - 1 : currentIndex - 1;
            onNavigate(images[prevIndex]);
          }
          break;
        case "ArrowRight":
          if (hasMultipleImages) {
            const nextIndex =
              currentIndex >= images.length - 1 ? 0 : currentIndex + 1;
            onNavigate(images[nextIndex]);
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentIndex, hasMultipleImages, images, onClose, onNavigate]);

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

        {hasMultipleImages && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full"
              onClick={goToPrevious}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full"
              onClick={goToNext}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </Button>
          </>
        )}

        <img
          src={image}
          alt="Image en plein écran"
          className="max-w-full max-h-[90vh] object-contain"
          style={{ display: "block" }}
        />

        <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-2">
          {hasMultipleImages &&
            images.map((img, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full ${
                  img === image ? "bg-white" : "bg-gray-500"
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate(img);
                }}
              />
            ))}
        </div>

        <div className="absolute bottom-2 left-0 right-0 flex justify-center">
          <div className="text-xs text-gray-400 bg-black/40 px-3 py-1 rounded-full">
            {hasMultipleImages ? (
              <span>
                Utilisez les flèches ← → ou cliquez pour naviguer • ESC pour
                fermer
              </span>
            ) : (
              <span>ESC pour fermer</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageFullscreen;

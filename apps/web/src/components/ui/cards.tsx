import React from "react";
import { Link } from "lucide-react";

function Cards({ title, description, tags, url, images = [] }) {
  // Check if we have images
  const hasImages = images && images.length > 0;

  return (
    <div className="w-auto p-2 z-999 bg-white rounded-lg inline-flex flex-col justify-start items-start gap-2 overflow-hidden">
      {hasImages ? (
        // Display with images
        <div className="flex flex-col justify-center items-start gap-1">
          <div className="w-72 h-72 relative bg-white rounded-md overflow-hidden">
            {/* Main image */}
            <img
              className="w-full h-full object-cover"
              src={images[0] || "https://placehold.co/288x288"}
              alt="Featured product"
            />

            {/* Overlay gradient */}
            <div className="w-72 h-72 left-0 top-0 absolute bg-gradient-to-b from-black/0 to-black/20 rounded-md" />

            {/* URL button */}
            <a
              href="#"
              className="px-1.5 py-0.5 right-2 top-2 absolute bg-white/40 rounded-[32px] inline-flex flex-col justify-start items-start gap-2"
            >
              <div className="inline-flex justify-start items-center gap-0.5">
                <Link size={12} />
                <div className="justify-start text-black text-xs font-normal">
                  {url || "title.com"}
                </div>
              </div>
            </a>

            {/* Tags at bottom */}
            <div className="absolute bottom-3 left-3 flex items-center">
              {tags &&
                tags.map((tag, index) => (
                  <React.Fragment key={index}>
                    <p className="justify-start text-white text-xs font-normal">
                      {tag}
                    </p>
                    {index < tags.length - 1 && (
                      <p className="text-white mx-1">-</p>
                    )}
                  </React.Fragment>
                ))}
            </div>
          </div>

          {/* Thumbnail images row */}
          {images.length > 1 && (
            <div className="self-stretch inline-flex justify-start items-center gap-2 mt-2">
              <div className="flex justify-start items-start gap-1">
                {images.slice(0, 3).map((img, index) => (
                  <div
                    key={index}
                    className="w-9 h-9 bg-black/10 rounded-md overflow-hidden"
                  >
                    <img
                      className="w-full h-full object-cover"
                      src={img}
                      alt={`Thumbnail ${index + 1}`}
                    />
                  </div>
                ))}
                {images.length > 3 && (
                  <div className="w-9 h-9 relative">
                    <div className="w-9 h-9 left-0 top-0 absolute bg-black/50 rounded-md" />
                    <div className="left-[11px] top-[11px] absolute justify-start text-white/80 text-xs font-normal">
                      +{images.length - 3}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        // No images version - Simple text-only view
        <></>
      )}

      {/* Tags for no-image version */}
      {!hasImages && tags && tags.length > 0 && (
        <div className="flex items-center">
          {tags.map((tag, index) => (
            <React.Fragment key={index}>
              <span className="text-gray-500 text-xs font-normal">{tag}</span>
              {index < tags.length - 1 && (
                <span className="text-gray-400 mx-1">-</span>
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Title and description - always shown */}
      <div className="self-stretch flex flex-col justify-start items-start gap-0.5">
        <div className="self-stretch h-10 justify-start text-black/80 text-3xl font-bold">
          {title || "Title"}
        </div>
        <div className="justify-start text-black/40 text-xs font-normal">
          {description || "sdhgpksdfh sqdfgh qosidhoqs qdfskgq"}
        </div>
      </div>

      {/* URL button for no-image version */}
      {!hasImages && (
        <div className="mt-2">
          <a
            href="#"
            className="px-3 py-2 bg-gray-200 rounded-full inline-flex items-center gap-2"
          >
            <Link size={16} color="#666" />
            <div className="text-gray-600 text-sm font-normal">
              {url || "title.com"}
            </div>
          </a>
        </div>
      )}
    </div>
  );
}

export default Cards;

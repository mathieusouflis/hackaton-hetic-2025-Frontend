import { Link } from "lucide-react";

interface CardsProps {
  title?: string;
  description?: string;
  tags?: string[];
  url?: string;
  img?: string;
  note?: string;
}

function Cards({ title, description, tags = [], url, img, note }: CardsProps) {
  const hasImages = img ? true : false;
  const hasTitle = !!title;
  const hasDescription = !!description;
  const hasTags = tags.length > 0;
  const hasUrl = !!url;
  const hasNote = !!note;

  return (
    <div className="w-auto max-w-xs p-2 bg-white rounded-lg flex flex-col gap-2 overflow-hidden">
      {/* Image section */}
      {hasImages && (
        <div className="w-72 h-72 relative bg-white rounded-md overflow-hidden">
          <img
            className="w-full h-full object-cover"
            src={img}
            alt={title || "Card image"}
          />
        </div>
      )}

      {/* Title */}
      {hasTitle && (
        <div className="text-2xl font-bold text-black/80 line-clamp-2">
          {title}
        </div>
      )}

      {/* Description */}
      {hasDescription ? (
        <div className="text-black/40 text-xs font-normal line-clamp-3">
          {description}
        </div>
      ) : (
        hasNote && (
          <div className="text-black/40 text-xs font-normal line-clamp-3">
            {note}
          </div>
        )
      )}

      {/* Tags */}
      {hasTags && (
        <div className="flex items-center gap-1">
          {tags.map((tag, idx) => (
            <span key={idx} className="text-xs text-gray-500">
              {tag}
              {idx < tags.length - 1 && <span className="mx-1">-</span>}
            </span>
          ))}
        </div>
      )}

      {/* URL */}
      {hasUrl && (
        <a
          href={url}
          className="mt-2 px-3 py-2 bg-gray-200 rounded-full inline-flex items-center gap-2"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Link size={16} color="#666" />
          <span className="text-gray-600 text-sm font-normal">{url}</span>
        </a>
      )}
    </div>
  );
}

export default Cards;

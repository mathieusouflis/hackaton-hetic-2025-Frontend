import { Button } from "./ui/button";
import { X } from "lucide-react";

interface ImagePreviewProps {
  src: string;
  onDelete: () => void;
}

const ImagePreview = ({ src, onDelete }: ImagePreviewProps) => {
  return (
    <div className="relative w-full h-48 rounded-lg overflow-hidden group">
      <img
        src={src}
        alt="Uploaded content"
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-start justify-end p-2">
        <Button
          variant="destructive"
          size="icon"
          onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ImagePreview;

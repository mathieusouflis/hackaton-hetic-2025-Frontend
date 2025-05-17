import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface HUDProps {
  selectedBoard: string | null;
  onBoardChange: (value: string) => void;
}

export default function HUD({ selectedBoard, onBoardChange }: HUDProps) {
  return (
    <div className="fixed top-6 left-6 z-50">
      <div className=" bg-white rounded-lg flex items-center min-w-[180px]">
        <Select
          value={selectedBoard ?? undefined}
          onValueChange={onBoardChange}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select board" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="board-1">Board 1</SelectItem>
            <SelectItem value="board-2">Board 2</SelectItem>
            <SelectItem value="board-3">Board 3</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

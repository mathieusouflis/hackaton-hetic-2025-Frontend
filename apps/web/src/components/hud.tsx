import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetBoardList } from "@/hooks/useGetBoardList";
interface HUDProps {
  selectedBoard: string | null;
  onBoardChange: (value: string) => void;
}

export default function HUD({ selectedBoard, onBoardChange }: HUDProps) {
  const { boards, loading, error } = useGetBoardList();

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="fixed top-6 left-6 z-50">
      <div className=" bg-white rounded-lg flex items-center min-w-[180px]">
        <Select
          value={selectedBoard ?? undefined}
          onValueChange={onBoardChange}
          disabled={loading}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select board" />
          </SelectTrigger>
          <SelectContent>
            {boards.map((board) => (
              <SelectItem key={board.name} value={board.name}>
                {board.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

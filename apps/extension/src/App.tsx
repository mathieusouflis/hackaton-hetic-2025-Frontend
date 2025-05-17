import { useState, useEffect } from "react";
import "./App.css";
import { Textarea } from "./components/ui/textarea";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "./components/ui/card";
import { Button } from "./components/ui/button";
import {
  ImagePlus,
  Link,
  Plus,
  Send,
  X,
  Tag,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./components/ui/dropdown-menu";
import { Input } from "./components/ui/input";
import { Badge } from "./components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./components/ui/dialog";
import ImageFullscreen from "./components/ImageFullscreen";

interface Tag {
  id: string;
  name: string;
}

function App() {
  const [selectedText, setSelectedText] = useState<string>("testtt");
  const [note, setNote] = useState<string>("");
  const [currentUrl, setCurrentUrl] = useState<string>("");
  const [tags, setTags] = useState<Tag[]>([]);
  const [newTagName, setNewTagName] = useState<string>("");
  const [isAddingTag, setIsAddingTag] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState<boolean>(false);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [boards, setBoards] = useState<{ id: string; name: string }[]>([]);
  const [selectedBoard, setSelectedBoard] = useState<string>("");
  const [boardsLoading, setBoardsLoading] = useState<boolean>(true);
  const [boardsError, setBoardsError] = useState<string | null>(null);
  const [customBoard, setCustomBoard] = useState<string>("");

  const APIURL = "http://localhost:5005/api/";

  useEffect(() => {
    try {
      if (chrome && chrome.tabs) {
        chrome.tabs.query(
          { active: true, currentWindow: true },
          function (tabs) {
            if (tabs[0] && tabs[0].url) {
              setCurrentUrl(tabs[0].url);
            }
          }
        );
      } else {
        setCurrentUrl("panoramix.cc");
      }
    } catch (e) {
      console.log("Cannot get current URL:", e);
      setCurrentUrl("panoramix.cc");
    }

    try {
      if (chrome && chrome.storage) {
        chrome.storage.local.get(["selectedText"], function (result) {
          if (result.selectedText) {
            console.log("Text retrieved from storage:", result.selectedText);
            setSelectedText(result.selectedText);
          }
        });
      }
    } catch (e) {
      console.log("Chrome storage not available:", e);
    }

    const handleMessage = (event: MessageEvent) => {
      console.log("Message event received:", event);

      if (event.data && event.data.type === "FROM_CONTENT_SCRIPT") {
        console.log("Text received from content script:", event.data.text);
        setSelectedText(event.data.text);
      }

      if (event.data && event.data.type === "SELECT") {
        console.log("Text received from SELECT event:", event.data.text);
        setSelectedText(event.data.text);
      }
    };

    window.addEventListener("message", handleMessage);

    // Fetch boards
    const fetchBoards = async () => {
      try {
        setBoardsLoading(true);
        const response = await fetch(APIURL +"/boards");
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setBoards(data);
        setBoardsError(null);
        if (data.length > 0) setSelectedBoard(data[0].name);
      } catch (err: any) {
        setBoardsError(err.message || "Erreur lors du chargement des boards");
      } finally {
        setBoardsLoading(false);
      }
    };
    fetchBoards();

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  const handleSave = async () => {
    try {
      setIsSending(true);

      const content = {
        text: selectedText,
        note: note,
        tags: tags,
        img: imageUrl,
        url: currentUrl,
        date: new Date().toISOString(),
        board_name: selectedBoard,
      };

      if (chrome && chrome.storage) {
        chrome.storage.local.set({ savedItem: content }, function () {
          console.log("Item saved locally");
        });
      }

      try {
        const response = await fetch(APIURL + "/cards", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(content),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        console.log("Sent to API successfully");
      } catch (error) {
        console.error("API request failed:", error);
      }

      setIsSending(false);
      window.parent.postMessage({ type: "CLOSE_MODAL" }, "*");
    } catch (e) {
      console.log("Failed to save:", e);
      setIsSending(false);
      alert("Contenu sauvegardé!");
      window.parent.postMessage({ type: "CLOSE_MODAL" }, "*");
    }
  };

  const handleCancel = () => {
    window.parent.postMessage({ type: "CLOSE_MODAL" }, "*");
  };

  const handleAddTag = () => {
    if (newTagName.trim()) {
      const newTag: Tag = {
        id: Date.now().toString(),
        name: newTagName.trim(),
      };
      setTags([...tags, newTag]);
      setNewTagName("");
      setIsAddingTag(false);
    }
  };

  const handleRemoveTag = (tagId: string) => {
    setTags(tags.filter((tag) => tag.id !== tagId));
  };

  const handleAddImage = () => {
    if (imageUrl.trim()) {
      setImageUrl(imageUrl.trim());
      setIsImageDialogOpen(false);
    }
  };

  const handleRemoveImage = () => {
    setImageUrl("");
  };

  return (
    <
      
    >
      <Card className="w-lg flex flex-col">
        <CardHeader className="w-full flex flex-row justify-end">
          <Button variant="ghost" onClick={handleCancel}>
            <X className="bg-blend-difference" />
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex flex-row gap-1.5 h-full w-full items-start">
            <div className="w-px h-full bg-zinc-900"></div>
            <p className="max-w-full max-h-[3.5lh] overflow-y-auto text-left text-lg">
              {selectedText}
            </p>
          </div>
          <Textarea
            placeholder="Écrivez votre note ici..."
            className="note-textarea"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <div className="flex flex-row flex-wrap gap-2 mt-2">
            {tags.map((tag) => (
              <Badge key={tag.id} variant="outline" className="cursor-default">
                {tag.name}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveTag(tag.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </Badge>
            ))}
            {isAddingTag && (
              <div className="flex flex-row gap-2">
                <Input
                  placeholder="Nom du tag"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleAddTag}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full mt-4">
                <ImagePlus className="mr-2 h-4 w-4" />
                Ajouter une image
              </Button>
            </DialogTrigger>
            <DialogContent className="w-full">
              <DialogHeader>
                <DialogTitle>Ajouter une image</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-4 w-full">
                <div className="w-full">
                  <p className="mb-2 text-sm text-gray-400">
                    Insérer l'URL d'une image
                  </p>
                  <Textarea
                    placeholder="URL de l'image"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    rows={1}
                    className="resize-none h-10 w-full"
                  />
                </div>
                <Button
                  onClick={handleAddImage}
                  disabled={isSending || !imageUrl.trim()}
                >
                  {isSending ? <Loader2 className="animate-spin" /> : "Ajouter"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <div className="mt-4">
            {imageUrl && (
              <div className="flex items-center gap-2">
                <img
                  src={imageUrl}
                  alt="Image ajoutée"
                  className="w-24 h-24 object-cover rounded-lg"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRemoveImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-row justify-between w-full">
          <div className="flex flex-row gap-1.5">
            <Button>
              <Link /> panoramix.cc
            </Button>
            <Button onClick={() => setIsAddingTag(!isAddingTag)}>
              <Plus /> Tag
            </Button>
          </div>
          <div className="flex flex-row justify-between w-full items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  {boardsLoading ? "Chargement..." : selectedBoard || "Choisir un board"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Choisir un board</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {boardsError && <DropdownMenuItem disabled>{boardsError}</DropdownMenuItem>}
                {boards.map((board) => (
                  <DropdownMenuItem
                    key={board.id}
                    onClick={() => setSelectedBoard(board.name)}
                  >
                    {board.name}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <div className="px-2 py-1 flex flex-col gap-1">
                  <Input
                    placeholder="Nom personnalisé..."
                    value={customBoard}
                    onChange={e => setCustomBoard(e.target.value)}
                    className="text-sm"
                    onKeyDown={e => {
                      if (e.key === "Enter" && customBoard.trim()) {
                        setSelectedBoard(customBoard.trim());
                        setCustomBoard("");
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    className="mt-1"
                    disabled={!customBoard.trim()}
                    onClick={() => {
                      setSelectedBoard(customBoard.trim());
                      setCustomBoard("");
                    }}
                  >
                    Utiliser ce nom
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button onClick={handleSave} disabled={isSending || !selectedBoard}>
              <Send /> Send
            </Button>
          </div>
        </CardFooter>
      </Card>

      {fullscreenImage && (
        <ImageFullscreen
          image={fullscreenImage}
          onClose={() => setFullscreenImage(null)}
        />
      )}
    </>
  );
}

export default App;

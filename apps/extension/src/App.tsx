import { useState, useEffect, useRef } from "react";
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
  Upload,
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
  const [images, setImages] = useState<string[]>([]);
  const [isAddingTag, setIsAddingTag] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState<boolean>(false);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      if (chrome && chrome.tabs) {
        chrome.tabs.query(
          { active: true, currentWindow: true },
          function (tabs) {
            if (tabs[0] && tabs[0].url) {
              setCurrentUrl(new URL(tabs[0].url).hostname);
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
        images: images,
        url: currentUrl,
        date: new Date().toISOString(),
      };

      if (chrome && chrome.storage) {
        chrome.storage.local.set({ savedItem: content }, function () {
          console.log("Item saved locally");
        });
      }

      try {
        const response = await fetch("https://api.example.com/save", {
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
      const urls = imageUrl
        .split(/[\n,]/)
        .map((url) => url.trim())
        .filter((url) => url.length > 0);

      if (urls.length > 0) {
        setImages([...images, ...urls]);
        setImageUrl("");
        setIsImageDialogOpen(false);
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    const fileReadPromises: Promise<string>[] = [];

    Array.from(files).forEach((file) => {
      const promise = new Promise<string>((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
          if (e.target && typeof e.target.result === "string") {
            resolve(e.target.result);
          } else {
            reject(new Error("Erreur lors de la lecture du fichier"));
          }
        };

        reader.onerror = () => {
          reject(new Error("Erreur lors de la lecture du fichier"));
        };

        reader.readAsDataURL(file);
      });

      fileReadPromises.push(promise);
    });

    Promise.all(fileReadPromises)
      .then((results) => {
        setImages([...images, ...results]);
        setIsImageDialogOpen(false);
      })
      .catch((error) => {
        console.error("Erreur lors de la lecture des fichiers:", error);
      })
      .finally(() => {
        setIsUploading(false);
      });
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="w-full flex flex-row justify-end">
          <Button variant="ghost" onClick={handleCancel}>
            <X className="bg-blend-difference" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-row gap-1.5 h-full w-full items-start">
            <div className="w-px h-full bg-zinc-900"></div>
            <p className="max-w-full max-h-[7lh] overflow-y-auto">
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
                Ajouter des images
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter des images</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    onClick={triggerFileInput}
                    variant="secondary"
                    className="w-full"
                    disabled={isUploading}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {isUploading ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      "Importer des fichiers"
                    )}
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    multiple
                    className="hidden"
                  />
                  <div className="col-span-2">
                    <p className="mb-2 text-sm text-gray-400">
                      ou insérer une ou plusieurs URLs (séparées par des
                      virgules ou sauts de ligne)
                    </p>
                    <Textarea
                      placeholder="URL des images (une par ligne ou séparées par des virgules)"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
                <Button
                  onClick={handleAddImage}
                  disabled={isSending || isUploading}
                >
                  {isSending ? <Loader2 className="animate-spin" /> : "Ajouter"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <div className="mt-4">
            {images.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm font-medium">
                    {images.length} image{images.length > 1 ? "s" : ""}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {images.map((img, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
                      onClick={() => setFullscreenImage(img)}
                    >
                      <img
                        src={img}
                        alt={`Image ${index + 1}`}
                        className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <span className="text-white text-xs bg-black/50 px-2 py-1 rounded-full">
                          Cliquez pour agrandir
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 bg-black/30 hover:bg-black/50"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveImage(index);
                        }}
                      >
                        <X className="h-4 w-4 text-white" />
                      </Button>
                    </div>
                  ))}
                </div>
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
          <div className="flex flex-row justify-between w-full">
            <DropdownMenu>
              <DropdownMenuTrigger>Open</DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Billing</DropdownMenuItem>
                <DropdownMenuItem>Team</DropdownMenuItem>
                <DropdownMenuItem>Subscription</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button onClick={handleSave}>
              <Send /> Send
            </Button>
          </div>
        </CardFooter>
      </Card>

      {fullscreenImage && (
        <ImageFullscreen
          image={fullscreenImage}
          images={images}
          onClose={() => setFullscreenImage(null)}
          onNavigate={(img) => setFullscreenImage(img)}
        />
      )}

      {/* La version précédente du modal a été remplacée par le composant ImageFullscreen */}
    </>
  );
}

export default App;

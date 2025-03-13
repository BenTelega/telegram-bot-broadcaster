"use client";

import { useEffect, useState, useRef } from "react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Loader2, Upload, XCircle, FileText } from "lucide-react";
import { toast } from "sonner";
import { getMe } from "@/lib/telegram";

interface AddUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddUsersModal({ isOpen, onClose }: AddUsersModalProps) {
  const { addUserList } = useStore();
  const [name, setName] = useState("");
  const [plainText, setPlainText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [usersCount, setUsersCount] = useState(0);
  const [duplicatesCount, setDuplicatesCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const convertPlainTextToUserIds = (text: string) => {
    return text.replaceAll(",", "\n").replaceAll(" ", "\n").replaceAll(";", "\n").split("\n").map((user) => user.trim()).filter((user) => user !== "");
  };

  useEffect(() => {
    setUsersCount(convertPlainTextToUserIds(plainText).length);
    setDuplicatesCount(convertPlainTextToUserIds(plainText).filter((user, index, self) => self.indexOf(user) !== index).length);
  }, [plainText]);

  useEffect(() => {
    if (selectedFile) {
      readFileContent(selectedFile);
    }
  }, [selectedFile]);

  const readFileContent = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setPlainText(content || "");
    };
    reader.onerror = () => {
      toast.error("Failed to read file");
    };
    reader.readAsText(file);
  };

  const resetForm = () => {
    setPlainText("");
    setSelectedFile(null);
    setUsersCount(0);
    setIsSaving(false);
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  const handleSave = async () => {
    if (!plainText || !name) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSaving(true);
    try {
      const userIds = convertPlainTextToUserIds(plainText);
      console.log(userIds);
      addUserList({
        name,
        users: userIds,
        count: userIds.length,
      });

      toast.success("Users added successfully!");
      handleClose();
    } catch (error) {
      toast.error("Failed to add users");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type === "text/plain" || file.name.endsWith(".txt") || file.name.endsWith(".csv")) {
        setSelectedFile(file);
      } else {
        toast.error("Please upload a .txt or .csv file");
      }
    }
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Add Users</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">List name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Customers"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <Tabs defaultValue="plain-text" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="plain-text">Plain Text</TabsTrigger>
              <TabsTrigger value="file">From File</TabsTrigger>
            </TabsList>
            <TabsContent value="plain-text" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="users">Users</Label>
                <Textarea
                  id="users"
                  placeholder="Enter telegram user IDs, one per line"
                  value={plainText}
                  onChange={(e) => setPlainText(e.target.value)}
                  className="min-h-[120px]"
                />
                <p className="text-xs text-muted-foreground">
                  Enter one telegram user ID per line
                </p>
                <p className="text-xs text-muted-foreground">
                  {usersCount} users, {duplicatesCount} duplicates
                </p>
              </div>
            </TabsContent>
            <TabsContent value="file" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file">Upload File</Label>
                <div 
                  className={`border-2 border-dashed rounded-lg p-6 transition-colors flex flex-col items-center justify-center cursor-pointer ${
                    isDragging ? "border-primary bg-primary/10" : "hover:bg-accent/50"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={handleFileClick}
                >
                  <input
                    ref={fileInputRef}
                    id="file"
                    type="file"
                    accept=".txt,.csv"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  
                  {selectedFile ? (
                    <div className="flex flex-col items-center gap-2">
                      <FileText className="h-10 w-10 text-primary" />
                      <p className="font-medium">{selectedFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {usersCount} users, {duplicatesCount} duplicates
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(null);
                          setPlainText("");
                        }}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                      <p className="font-medium">Click or drag and drop</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Upload a .txt or .csv (TODO) file with one username or user ID per line
                      </p>
                    </>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        <DialogFooter className="sm:justify-end">
          <Button type="submit" onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add Users
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

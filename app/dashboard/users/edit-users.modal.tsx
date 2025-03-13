"use client";

import { useEffect, useState } from "react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { UserList } from "@/lib/store";

interface EditUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  userList: UserList | null;
}

export function EditUsersModal({ isOpen, onClose, userList }: EditUsersModalProps) {
  const { updateUserList } = useStore();
  const [name, setName] = useState("");
  const [plainText, setPlainText] = useState("");
  const [usersCount, setUsersCount] = useState(0);
  const [duplicatesCount, setDuplicatesCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const convertPlainTextToUserIds = (text: string) => {
    return text
      .replaceAll(",", "\n")
      .replaceAll(" ", "\n")
      .replaceAll(";", "\n")
      .split("\n")
      .map((user) => user.trim())
      .filter((user) => user !== "");
  };

  useEffect(() => {
    if (userList) {
      setName(userList.name);
      setPlainText(userList.users.join("\n"));
    }
  }, [userList]);

  useEffect(() => {
    const userIds = convertPlainTextToUserIds(plainText);
    setUsersCount(userIds.length);
    
    // Count duplicates
    const uniqueIds = new Set(userIds);
    setDuplicatesCount(userIds.length - uniqueIds.size);
  }, [plainText]);

  const resetForm = () => {
    setName("");
    setPlainText("");
    setUsersCount(0);
    setDuplicatesCount(0);
    setIsSaving(false);
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  const handleSave = async () => {
    if (!plainText || !name || !userList) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSaving(true);
    try {
      const userIds = convertPlainTextToUserIds(plainText);
      
      updateUserList(userList.id, {
        name,
        users: userIds,
        count: userIds.length,
      });

      toast.success("User list updated successfully!");
      handleClose();
    } catch (error) {
      toast.error("Failed to update user list");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearDuplicates = () => {
    if (!plainText) return;
    
    const userIds = convertPlainTextToUserIds(plainText);
    const uniqueIds = [...new Set(userIds)];
    setPlainText(uniqueIds.join("\n"));
    setIsConfirmOpen(false);
    
    toast.success(`Removed ${duplicatesCount} duplicate entries`);
  };

  if (!userList) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Edit User List</DialogTitle>
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

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="users">Users</Label>
                {duplicatesCount > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setIsConfirmOpen(true)}
                  >
                    Clear {duplicatesCount} duplicates
                  </Button>
                )}
              </div>
              <Textarea
                id="users"
                placeholder="Enter telegram user IDs, one per line"
                value={plainText}
                onChange={(e) => setPlainText(e.target.value)}
                className="min-h-[200px]"
              />
              <p className="text-xs text-muted-foreground">
                Enter one telegram user ID per line
              </p>
              <p className="text-xs text-muted-foreground">
                {usersCount} users, {duplicatesCount} duplicates
              </p>
            </div>
          </div>
          <DialogFooter className="sm:justify-end">
            <Button type="submit" onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Duplicates</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove {duplicatesCount} duplicate entries from your user list.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearDuplicates}>
              <Trash2 className="mr-2 h-4 w-4" />
              Remove Duplicates
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 
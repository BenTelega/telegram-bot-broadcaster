'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Upload } from 'lucide-react';
import { AddUsersModal } from './add-users.modal';

export default function UsersPage() {
  const { userLists } = useStore();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">User Lists</h1>
        <Button onClick={() => setIsUploadModalOpen(true)}>
          <Upload className="h-4 w-4 mr-2" />
          Upload Users
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {userLists.map((list) => (
          <Card key={list.id}>
            <CardHeader>
              <CardTitle>{list.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {list.count} subscribers
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Created on {new Date(list.createdAt).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {userLists.length === 0 && (
        <Card className="mt-4">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <p className="text-muted-foreground mb-4">No user lists yet</p>
            <Button onClick={() => setIsUploadModalOpen(true)}>
              Upload your first list
            </Button>
          </CardContent>
        </Card>
      )}

      <AddUsersModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />
    </div>
  );
}
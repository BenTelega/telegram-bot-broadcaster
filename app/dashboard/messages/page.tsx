'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function MessagesPage() {
  const router = useRouter();
  const { messageTemplates } = useStore();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Message Templates</h1>
        <Button onClick={() => router.push('/dashboard/messages/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Create Message
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {messageTemplates.map((template) => (
          <Card 
            key={template.id} 
            className="cursor-pointer hover:bg-accent/50 transition-colors"
            onClick={() => router.push(`/dashboard/messages/${template.id}`)}
          >
            <CardHeader>
              <CardTitle>{template.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                className="text-sm text-muted-foreground mb-2 prose prose-sm"
              >
                { template.content.substring(0, 100) + '...'}
              </div>
              {template.buttons && template.buttons.length > 0 && (
                <div className="border-t pt-2 mt-2">
                  <p className="text-xs text-muted-foreground mb-1">Buttons:</p>
                  <div className="space-y-1">
                    {template.buttons.map((row, i) => (
                      <div key={i} className="flex gap-1">
                        {row.map((button, j) => (
                          <span
                            key={`${i}-${j}`}
                            className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-secondary text-secondary-foreground"
                          >
                            {button.text || 'Button'}
                          </span>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {messageTemplates.length === 0 && (
        <Card className="mt-4">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <p className="text-muted-foreground mb-4">No message templates yet</p>
            <Button onClick={() => router.push('/dashboard/messages/new')}>
              Create your first message
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
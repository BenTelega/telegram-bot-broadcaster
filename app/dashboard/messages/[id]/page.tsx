'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useStore } from '@/lib/store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ButtonItem } from '@/lib/types';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Quote,
  Code,
  Link,
  Plus,
  Trash,
} from 'lucide-react';
import { TelegramMessagePreview } from '@/components/message-preview/message';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';

export default function MessageEditorPage() {
  const router = useRouter();
  const params = useParams();
  const { messageTemplates, addMessageTemplate, updateMessageTemplate } = useStore();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [hideLinkPreview, setHideLinkPreview] = useState(true);
  const [parseMode, setParseMode] = useState<'HTML' | 'MarkdownV2'>('HTML');
  const [buttonRows, setButtonRows] = useState<ButtonItem[][]>([]);
  const [buttonErrors, setButtonErrors] = useState<{ [key: string]: boolean }>({});
  const isEditing = params.id !== 'new';

  useEffect(() => {
    if (isEditing && params.id) {
      const template = messageTemplates.find(t => t.id === params.id);
      if (template) {
        setTitle(template.title);
        setContent(template.content);
        setHideLinkPreview(template.hideLinkPreview);
        setParseMode(template.parseMode);
        if (template.buttons) {
          setButtonRows(template.buttons);
        }

      }
    }
  }, [isEditing, params.id, messageTemplates]);


  const addButtonRow = () => {
    setButtonRows(prev => [...prev, []]);
  };

  const addButton = (rowIndex: number) => {
    setButtonRows(prev => prev.map((row, index) => 
      index === rowIndex ? [...row, { text: '', type: 'callback', value: '' }] : row
    ));
  };

  const removeButton = (rowIndex: number, buttonIndex: number) => {
    setButtonRows(prev => prev.map((row, index) => 
      index === rowIndex ? row.filter((_, i) => i !== buttonIndex) : row
    ));
  };

  const removeButtonRow = (rowIndex: number) => {
    setButtonRows(prev => prev.filter((_, index) => index !== rowIndex));
  };

  const updateButton = (rowIndex: number, buttonIndex: number, updates: Partial<ButtonItem>) => {
    setButtonRows(prev => prev.map((row, index) => 
      index === rowIndex ? row.map((button, i) => 
        i === buttonIndex ? { ...button, ...updates } : button
      ) : row
    ));
  };

  const validateButtons = () => {
    let hasErrors = false;
    const newButtonErrors: { [key: string]: boolean } = {};

    buttonRows.forEach((row, rowIndex) => {
      row.forEach((button, buttonIndex) => {
        const key = `${rowIndex}-${buttonIndex}`;
        if (!button.value.trim()) {
          newButtonErrors[key] = true;
          hasErrors = true;
        }
      });
    });

    setButtonErrors(newButtonErrors);
    return !hasErrors;
  };

  const handleSave = () => {
    if (!validateButtons()) {
      toast.error("Please fill in all button values before saving");
      return;
    }

    if(content == "") {
      toast.error("Message text cannot be empty");
      return;
    }

    if(content.length > 4096) {
      toast.error("Message text cannot be longer than 4096 characters");
      return;
    }

    const template = {
      title,
      content,
      media: [], // TODO: Add media upload
      buttons: buttonRows,
      hideLinkPreview,
      parseMode
    };
    if(isEditing) {
      updateMessageTemplate(params.id as string, template);
    } else {
      addMessageTemplate(template);
    }


    router.push('/dashboard/messages');
  };


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">
          {isEditing ? 'Edit Message Template' : 'Create Message Template'}
        </h1>
        <Button onClick={handleSave}>Save Template</Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Template Name</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter template name"
              />
            </div>

            <div>
              <Label>Message Content</Label>
              <div className="border rounded-md">
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[200px] focus-visible:ring-0"
                  placeholder="Write your message content here..."
                />
              </div>
              <p className="text-xs text-muted-foreground">Use HTML formatting as described in <a href="https://core.telegram.org/bots/api#html-style" className="text-blue-500" target="_blank" rel="noopener noreferrer">Telegram API</a>. Maximum 4096 characters.</p>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="hideLinkPreview" checked={hideLinkPreview} onCheckedChange={() => setHideLinkPreview(!hideLinkPreview)} />
              <label
                htmlFor="hideLinkPreview"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Hide telegram's link preview (when there is a link to external website)
              </label>
            </div>

            <div className="flex items-center space-x-4">
              <Label>Parse Mode</Label>
              <RadioGroup
                value={parseMode}
                onValueChange={(value) => setParseMode(value as 'HTML' | 'MarkdownV2')}
                className="flex items-center space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="HTML" id="html" />
                  <Label htmlFor="html">HTML</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="MarkdownV2" id="markdown" disabled />
                  <Label htmlFor="markdown" className="text-muted-foreground">MarkdownV2</Label>
                </div>
              </RadioGroup>
            </div>



            <div>
              <Label>Buttons</Label>

              <div className="space-y-4">
                {buttonRows.map((row, rowIndex) => (
                  <Card key={rowIndex}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-medium">Button Row</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeButtonRow(rowIndex)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid gap-4">
                        {row.map((button, buttonIndex) => (
                          <div key={buttonIndex} className="grid grid-cols-3 gap-4">
                            <div>
                              <Input
                                placeholder="Button text"
                                value={button.text}
                                onChange={(e) =>
                                  updateButton(rowIndex, buttonIndex, { text: e.target.value })
                                }
                              />
                            </div>
                            <div>
                              <Input
                                placeholder={button.type === 'callback' ? 'Callback data' : 'URL'}
                                value={button.value}
                                onChange={(e) =>
                                  updateButton(rowIndex, buttonIndex, { value: e.target.value })
                                }
                                className={buttonErrors[`${rowIndex}-${buttonIndex}`] ? 'border-red-500' : ''}
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                onClick={() =>
                                  updateButton(rowIndex, buttonIndex, {
                                    type: button.type === 'callback' ? 'link' : 'callback'
                                  })
                                }
                              >
                                {button.type === 'callback' ? 'Callback' : 'Link'}
                              </Button>
                              <Button
                                variant="ghost"
                                onClick={() => removeButton(rowIndex, buttonIndex)}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          onClick={() => addButton(rowIndex)}
                          className="mt-2"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Button
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                <Button variant="outline" onClick={addButtonRow}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Button Row
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <div>
        <Label>Preview</Label>
        <TelegramMessagePreview
          media={[]}
          postText={content}
          buttons={buttonRows}
          parseMode={parseMode}
        />
        <p className="text-xs text-muted-foreground">Preview might be inaccurate at this moment</p>
      </div>
      
    </div>

  );
} 
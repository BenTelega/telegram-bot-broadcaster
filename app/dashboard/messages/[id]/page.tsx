'use client';

import { useEffect, useState, useRef, KeyboardEvent } from 'react';
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
  Eye,
  FileCode,
  X,
  Undo,
} from 'lucide-react';
import { TelegramMessagePreview } from '@/components/message-preview/message';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export default function MessageEditorPage() {
  const router = useRouter();
  const params = useParams();
  const { messageTemplates, addMessageTemplate, updateMessageTemplate } = useStore();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [hideLinkPreview, setHideLinkPreview] = useState(true);
  const [parseMode, setParseMode] = useState<'HTML' | 'MarkdownV2'>('HTML');
  const [buttonRows, setButtonRows] = useState<ButtonItem[][]>([]);
  const [buttonErrors, setButtonErrors] = useState<{ [key: string]: boolean }>({});
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isEditing = params.id !== 'new';
  const [contentHistory, setContentHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  useEffect(() => {
    if (isEditing && params.id) {
      const template = messageTemplates.find(t => t.id === params.id);
      if (template) {
        setTitle(template.title);
        setContent(template.content);
        setPhotoUrl(template.media[0] || '');
        setHideLinkPreview(template.hideLinkPreview);
        setParseMode(template.parseMode);
        if (template.buttons) {
          setButtonRows(template.buttons);
        }
      }
    }
  }, [isEditing, params.id, messageTemplates]);

  // Save content to history when it changes
  useEffect(() => {
    if (content !== contentHistory[historyIndex]) {
      // Add new state to history, removing any future states if we're in the middle of the history
      const newHistory = contentHistory.slice(0, historyIndex + 1);
      newHistory.push(content);
      
      // Limit history size to prevent memory issues
      if (newHistory.length > 50) {
        newHistory.shift();
      }
      
      setContentHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  }, [content]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle Ctrl+Z for undo
    if (e.ctrlKey && e.key === 'z') {
      e.preventDefault();
      undo();
    }
  };

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setContent(contentHistory[newIndex]);
    }
  };

  const formatText = (tag: string, attributes?: string) => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    let formattedText = '';
    if (tag === 'a') {
      const url = attributes || 'https://';
      formattedText = `<a href="${url}">${selectedText || 'link text'}</a>`;
    } else if (tag === 'pre') {
      formattedText = `<pre>${selectedText || 'code block'}</pre>`;
    } else if (tag === 'code') {
      formattedText = `<code>${selectedText || 'inline code'}</code>`;
    } else if (tag === 'tg-spoiler') {
      formattedText = `<tg-spoiler>${selectedText || 'spoiler text'}</tg-spoiler>`;
    } else if (tag === 'blockquote') {
      formattedText = `<blockquote>${selectedText || 'quote text'}</blockquote>`;
    } else if (tag === 'clear') {
      // Remove HTML tags from selected text
      formattedText = selectedText.replace(/<\/?[^>]+(>|$)/g, '');
    } else {
      formattedText = `<${tag}>${selectedText || `${tag} text`}</${tag}>`;
    }
    
    const newContent = content.substring(0, start) + formattedText + content.substring(end);
    setContent(newContent);
    
    // Set focus back to textarea and position cursor after the inserted text
    setTimeout(() => {
      textarea.focus();
      const newCursorPosition = start + formattedText.length;
      textarea.setSelectionRange(newCursorPosition, newCursorPosition);
    }, 0);
  };

  const handleLinkInsert = (url: string) => {
    if (!url.trim()) return;
    formatText('a', url);
  };

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

  const handleSave = async () => {
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

    // Validate photo url
    if(photoUrl) {
      try {
        // Try to fetch the photo url
        await fetch(photoUrl);
      } catch (error) {
        toast.error("Photo URL is invalid");
        return;
      }
    }

    const template = {
      title,
      content,
      media: [photoUrl],
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
              <Label htmlFor="photoUrl">Photo URL</Label>
              <Input
                id="photoUrl"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="Enter photo URL (optional)"
              />
               <p className="text-xs text-muted-foreground">Upload your image to imgur and paste the link here.</p>
            </div>

            <div>
              <Label>Message Content</Label>
              <div className="border rounded-md">
                <div className="flex flex-wrap gap-1 p-1 border-b bg-muted/50">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8" 
                          onClick={() => formatText('b')}
                        >
                          <Bold className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Bold</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8" 
                          onClick={() => formatText('i')}
                        >
                          <Italic className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Italic</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8" 
                          onClick={() => formatText('u')}
                        >
                          <Underline className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Underline</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8" 
                          onClick={() => formatText('s')}
                        >
                          <Strikethrough className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Strikethrough</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8" 
                          onClick={() => formatText('tg-spoiler')}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Spoiler</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8" 
                          onClick={() => formatText('code')}
                        >
                          <Code className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Inline Code</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8" 
                          onClick={() => formatText('pre')}
                        >
                          <FileCode className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Code Block</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8" 
                          onClick={() => formatText('blockquote')}
                        >
                          <Quote className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Blockquote</TooltipContent>
                    </Tooltip>

                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Link className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        <div className="flex flex-col gap-2">
                          <Label htmlFor="link-url">URL</Label>
                          <div className="flex gap-2">
                            <Input 
                              id="link-url" 
                              placeholder="https://" 
                              className="flex-1"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleLinkInsert((e.target as HTMLInputElement).value);
                                  (e.target as HTMLInputElement).value = '';
                                  document.body.click(); // Close popover
                                }
                              }}
                            />
                            <Button 
                              onClick={(e) => {
                                const input = document.getElementById('link-url') as HTMLInputElement;
                                handleLinkInsert(input.value);
                                input.value = '';
                                document.body.click(); // Close popover
                              }}
                            >
                              Insert
                            </Button>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>

                    <div className="border-l mx-1 h-8"></div>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8" 
                          onClick={() => formatText('clear')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Clear Formatting</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8" 
                          onClick={undo}
                        >
                          <Undo className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="min-h-[200px] focus-visible:ring-0 rounded-t-none"
                  placeholder="Write your message content here..."
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Use HTML formatting as described in <a href="https://core.telegram.org/bots/api#html-style" className="text-blue-500" target="_blank" rel="noopener noreferrer">Telegram API</a>. 
                Maximum {photoUrl ? "1024" : "4096"} characters.
              </p>
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
          photoUrl={photoUrl}
        />
        <p className="text-xs text-muted-foreground">Preview might be inaccurate at this moment</p>
      </div>
      
    </div>

  );
} 
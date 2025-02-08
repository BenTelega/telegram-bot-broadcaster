/**
 * ButtonItem is the type for a button in a message template.
 * It can be a callback button or a link button.
 * 
 * Represents a url or callback_data inline button https://core.telegram.org/bots/api#inlinekeyboardbutton
 */
export interface ButtonItem {
  text: string;
  type: 'callback' | 'link';
  value: string;
} 
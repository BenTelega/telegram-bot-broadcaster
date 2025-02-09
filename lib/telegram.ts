/* Simple Telegram API wrapper */
import {ButtonItem} from "@/lib/types"

interface User {
    id: number;
    is_bot: boolean;
    first_name: string;
    username: string;
    can_join_groups: boolean;
    can_read_all_group_messages: boolean;
    supports_inline_queries: boolean;
    can_connect_to_business: boolean;
    has_main_web_app: boolean;
  }
  
  interface GetMeSuccess {
    ok: true;
    result: User;
  }
  
  interface TelegramErrorResponse {
    ok: false;
    error_code: number;
    description: string;
  }

export const getMe = async (botToken: string): Promise<GetMeSuccess|TelegramErrorResponse> => {
  const response = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
  const data = await response.json();
  return data;
};

/**
 * Send a message to a chat
 * @param botToken - The token of the bot
 * @param chatId - The id of the chat
 * @param message - The message to send
 * @param replyMarkup - Telegram reply markup
 * @param disableLinkPreview - Disable link preview
 * @param parseMode - Parse mode
 * 
 * https://core.telegram.org/bots/api#sendmessage
 */

export const sendMessage = async (botToken: string, chatId: string, message: string, replyMarkup?: any, disableLinkPreview: boolean = false, parseMode: 'HTML' | 'MarkdownV2' = 'HTML') => {
  const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      chat_id: chatId,
      text: message, 
      ...(replyMarkup ? { reply_markup: replyMarkup } : {}),
      parse_mode: parseMode, 
      ...(disableLinkPreview ? { link_preview_options: { is_disabled: true } } : {})
    }),
  });
  const data = await response.json();
  return data;
};


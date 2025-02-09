import { Bot, MessageTemplate } from "./store";
import { sendMessage, sendPhoto } from "./telegram";
import { ButtonItem } from "./types";

/**
 * Send a message from a template
 * @param bot - The bot to send the message from
 * @param chatId - The chat id to send the message to
 * @param template - The template to send the message from
 * @returns The response from the telegram api
 */

export const sendMessageFromTemplate = async (bot: Bot, chatId: string, template: MessageTemplate) => {
    // If there is a photo, send a photo message
    if (template.media[0]) {
        return await sendPhoto(
            bot.token,
            chatId,
            template.content,
            template.media[0],
            convertButtonItemsToTelegramReplyMarkup(template.buttons),
            template.hideLinkPreview,
            template.parseMode
        );
    }
    else {
        return await sendMessage(
        bot.token, 
        chatId, 
        template.content, 
        convertButtonItemsToTelegramReplyMarkup(template.buttons), 
        template.hideLinkPreview,
        template.parseMode
        );
    }

}


/**
 * converts ButtonItems to https://core.telegram.org/bots/api#inlinekeyboardmarkup
 */
export const convertButtonItemsToTelegramReplyMarkup = (buttonItems?: ButtonItem[][]) => {
    if (!buttonItems) return undefined;
    const inline_keyboard = buttonItems.map((row) => row.map((item) => ({
      text: item.text,
      ...(item.type === 'link' ? { url: item.value } : { callback_data: item.value })
    })));
    return { inline_keyboard };
}

  
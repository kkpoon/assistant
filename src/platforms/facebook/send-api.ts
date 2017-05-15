import fetch from "node-fetch";
import * as FormData from "form-data";
import {
    MessageSender,
    TextMessageSender,
    TextMessageWithQuickRepliesSender,
    AudioMessageSender,
    QuickReply
} from "../../message-sender";

const SEND_API_ENDPOINT = "https://graph.facebook.com/v2.6/me/messages";

export const SendMarkSeen =
    (PAGE_ACCESS_TOKEN: string): MessageSender =>
        (recipientId: string): Promise<any> =>
            SendMessageJSON(PAGE_ACCESS_TOKEN)(
                {
                    recipient: { id: recipientId },
                    sender_action: "mark_seen"
                }
            );

export const SendTypingOn =
    (PAGE_ACCESS_TOKEN: string): MessageSender =>
        (recipientId: string): Promise<any> =>
            SendMessageJSON(PAGE_ACCESS_TOKEN)(
                {
                    recipient: { id: recipientId },
                    sender_action: "typing_on"
                }
            );

export const SendTypingOff =
    (PAGE_ACCESS_TOKEN: string): MessageSender =>
        (recipientId: string): Promise<any> =>
            SendMessageJSON(PAGE_ACCESS_TOKEN)(
                {
                    recipient: { id: recipientId },
                    sender_action: "typing_off"
                }
            );

export const SendTextMessage =
    (PAGE_ACCESS_TOKEN: string): TextMessageSender =>
        (recipientId: string) => (text: string): Promise<any> =>
            SendMessageJSON(PAGE_ACCESS_TOKEN)(
                {
                    recipient: { id: recipientId },
                    message: { text: text }
                }
            );

export const SendTextMessageWithQuickReplies =
    (PAGE_ACCESS_TOKEN: string): TextMessageWithQuickRepliesSender =>
        (recipientId: string) => (text: string) => (replies: QuickReply[]): Promise<any> =>
            SendMessageJSON(PAGE_ACCESS_TOKEN)(
                {
                    recipient: { id: recipientId },
                    message: { text: text, quick_replies: replies }
                }
            );

export const SendAudioMessage =
    (PAGE_ACCESS_TOKEN: string): AudioMessageSender =>
        (recipientId: string) => (audio: ReadableStream): Promise<any> =>
            SendMessageWithAttachment(PAGE_ACCESS_TOKEN)(
                {
                    recipient: { id: recipientId },
                    message: { attachment: { type: "audio", payload: {} } }
                },
                audio,
                "audio.mp3",
                "audio/mp3"
            );

const SendMessageJSON =
    (PAGE_ACCESS_TOKEN: string) =>
        (message: any): Promise<any> =>
            fetch(`${SEND_API_ENDPOINT}?access_token=${PAGE_ACCESS_TOKEN}}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(message)
            }).catch(err => {
                console.error("[facebook/send-api] Error: " + err);
                return { error: err };
            });

const SendMessageWithAttachment =
    (PAGE_ACCESS_TOKEN: string) =>
        (
            message: any,
            attachment: ReadableStream,
            filename: string,
            contentType: string
        ): Promise<any> => {
            let form = new FormData();
            form.append("recipient", JSON.stringify(message.recipient));
            form.append("message", JSON.stringify(message.message));
            form.append("filedata", attachment, {
                filename: filename,
                contentType: contentType
            });
            let url = `${SEND_API_ENDPOINT}?access_token=${PAGE_ACCESS_TOKEN}}`;

            return fetch(url, { method: 'POST', body: form })
                .then(res => {
                    if (!res.ok) {
                        console.error("[facebook/send-api] Error: " + JSON.stringify(res));
                        throw new Error(`[${res.status}] ${res.statusText}`);
                    }
                    return res;
                })
                .catch(err => {
                    console.error("[facebook/send-api] Error: " + err);
                    return { error: err };
                });
        };

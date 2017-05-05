import fetch from "node-fetch";
import * as FormData from "form-data";

const SEND_API_ENDPOINT = "https://graph.facebook.com/v2.6/me/messages";

export type MessageSender = (message: any) => Promise<any>;

export type MessageSenderWithAttachementUpload = (
    message: any,
    attachment: ReadableStream,
    filename: string,
    contentType: string
) => Promise<any>;

export const CreateMessageSender =
    (PAGE_ACCESS_TOKEN: string): MessageSender =>
        (message) =>
            fetch(`${SEND_API_ENDPOINT}?access_token=${PAGE_ACCESS_TOKEN}}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(message)
            }).catch(err => {
                console.error("Error: " + err);
                return { error: err };
            });

export const CreateMessageSenderWithAttachmentUpload =
    (PAGE_ACCESS_TOKEN: string): MessageSenderWithAttachementUpload =>
        (message, attachment, filename, contentType) => {
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
                        console.error("Error: " + JSON.stringify(res));
                        throw new Error(`[${res.status}] ${res.statusText}`);
                    }
                    return res;
                })
                .catch(err => {
                    console.error("Error: " + err);
                    return { error: err };
                });
        };

export const SendTextMessage = (
    sendMessage: MessageSender,
    recipientId: string,
    text: string
) =>
    sendMessage({
        recipient: { id: recipientId },
        message: { text: text }
    });

export const SendAudioMessage = (
    sendMessage: MessageSenderWithAttachementUpload,
    recipientId: string,
    audio: ReadableStream
) =>
    sendMessage(
        {
            recipient: {
                id: recipientId
            },
            message: {
                attachment: {
                    type: "audio",
                    payload: {}
                }
            }
        },
        audio,
        "audio.mp3",
        "audio/mp3"
    );

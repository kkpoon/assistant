export type MessageSender =
    (recipientId: string) => Promise<any>;

export type TextMessageSender =
    (recipientId: string) => (text: string) => Promise<any>;

export type TextMessageWithQuickRepliesSender =
    (recipientId: string) => (text: string) => (replies: QuickReply[]) => Promise<any>;

export type AudioMessageSender =
    (recipientId: string) => (audio: ReadableStream) => Promise<any>;

export interface QuickReply {
    content_type: string;
    title?: string;
    payload?: string;
    image_url?: string;
}

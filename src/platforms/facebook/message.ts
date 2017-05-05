import { Say, Echo, Sorry, Ignore } from "./skills";
import {
    MessageSender,
    MessageSenderWithAttachementUpload,
    CreateMessageSender,
    CreateMessageSenderWithAttachmentUpload,
} from "./send-api";

enum MessageEventType {
    UNKNOWN,
    TEXT,
    ECHO,
    POSTBACK
}

interface HandledMessageEvent {
    messageEvent: any;
    result: string;
}

type MessageEventHandler = (messageEvent: any) => Promise<HandledMessageEvent>;


export const CreateMessageHandler =
    (PAGE_ACCESS_TOKEN: string): MessageEventHandler => {
        const messageSender =
            CreateMessageSender(PAGE_ACCESS_TOKEN);
        const attachmentMessageSender =
            CreateMessageSenderWithAttachmentUpload(PAGE_ACCESS_TOKEN);

        return (event) => {
            switch (detectMessageEventType(event)) {
                case MessageEventType.ECHO:
                    return Ignore(event);
                case MessageEventType.TEXT:
                    return handleTextMessage(
                        messageSender,
                        attachmentMessageSender,
                        event
                    );
                default:
                    return Sorry(messageSender, event);
            }
        };
    }

const handleTextMessage = (
    messageSender: MessageSender,
    attachmentMessageSender: MessageSenderWithAttachementUpload,
    messageEvent: any
) => {
    let message = messageEvent.message;
    if (message.text.match(/^say (.+)$/i)) {
        return Say(attachmentMessageSender, messageEvent);
    }
    return Echo(messageSender, messageEvent);
};

const detectMessageEventType = (messageEvent: any): MessageEventType => {
    if (messageEvent.message) {
        let message = messageEvent.message;

        if (message.is_echo) {
            return MessageEventType.ECHO;
        } else if (message.text) {
            return MessageEventType.TEXT;
        }
    } else if (messageEvent.postback) {
        return MessageEventType.POSTBACK;
    }
    return MessageEventType.UNKNOWN;
};

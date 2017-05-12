import * as Rx from "@reactivex/rxjs";
import { Say, Echo, Sorry, Ignore, LabelImage, Lex } from "./skills";
import {
    MessageSender,
    MessageSenderWithAttachementUpload,
    CreateMessageSender,
    CreateMessageSenderWithAttachmentUpload,
    SendMarkSeen,
    SendTypingOff,
    SendTypingOn
} from "./send-api";

enum MessageEventType {
    UNKNOWN, TEXT, ATTACHMENTS, ECHO, POSTBACK
}

interface Attachment {
    type: string;
    payload: { url?: string; sticker_id?: number };
}

export const CreateMessageHandler = (PAGE_ACCESS_TOKEN: string, GOOGLE_APIKEY: string) => {
    const msgSender = CreateMessageSender(PAGE_ACCESS_TOKEN);
    const attSender = CreateMessageSenderWithAttachmentUpload(PAGE_ACCESS_TOKEN);

    return (event: any): Promise<string> => {
        let userID = event.sender.id;

        return SendMarkSeen(msgSender, userID)
            .then(() => SendTypingOn(msgSender, userID))
            .then(() => handleMessage(msgSender, attSender, GOOGLE_APIKEY, event))
            .catch((err) => {
                console.error("[facebook/message] message handle error: " + err);
                return Echo(msgSender, userID, "Sorry, I've got brain problems.");
            })
            .then((result) => SendTypingOff(msgSender, userID).then(() => result));
    };
}

const handleMessage = (
    msgSender: MessageSender,
    attSender: MessageSenderWithAttachementUpload,
    GOOGLE_APIKEY: string,
    event: any
): Promise<string> => {
    let userID = event.sender.id;

    switch (detectMessageEventType(event)) {
        case MessageEventType.ECHO:
            return Ignore();
        case MessageEventType.TEXT:
            return handleTextMessage(msgSender, attSender, GOOGLE_APIKEY, event);
        case MessageEventType.ATTACHMENTS:
            return handleAttachmentsMessage(msgSender, attSender, event);
        default:
            return Sorry(msgSender, userID);
    }
};

const handleTextMessage = (
    messageSender: MessageSender,
    attachmentMessageSender: MessageSenderWithAttachementUpload,
    GOOGLE_APIKEY: string,
    messageEvent: any,
) => {
    let userID = messageEvent.sender.id;
    let message = messageEvent.message;
    let messageText = message.text;

    if (messageText.match(/^say (.+)$/i)) {
        return Say(messageSender, attachmentMessageSender, GOOGLE_APIKEY, userID, messageText);
    }

    return Lex(messageSender, userID, messageText);
};

const handleAttachmentsMessage = (
    messageSender: MessageSender,
    attachmentMessageSender: MessageSenderWithAttachementUpload,
    messageEvent: any
) => {
    let message = messageEvent.message;
    let userID = messageEvent.sender.id;
    let attachments = message.attachments;

    return Rx.Observable.from(attachments)
        .mergeMap((att: Attachment) => {
            switch (att.type) {
                case "image":
                    return Rx.Observable.fromPromise(
                        handleImageMessage(messageSender, userID, att)
                    );
                default:
                    return Rx.Observable.fromPromise(
                        Sorry(messageSender, userID)
                    );
            }
        })
        .toArray()
        .map(results => results.join(", "))
        .toPromise();
};

const handleImageMessage = (
    messageSender: MessageSender,
    userID: string,
    att: Attachment
) => {
    if (att.payload && att.payload.sticker_id) {
        return Ignore();
    } else if (att.payload && att.payload.url) {
        return LabelImage(messageSender, userID, att.payload.url);
    } else {
        return Echo(messageSender, userID, "Sorry, I can't get the image");
    }
};

const detectMessageEventType = (messageEvent: any): MessageEventType => {
    if (messageEvent.message) {
        let message = messageEvent.message;

        if (message.is_echo) {
            return MessageEventType.ECHO;
        } else if (message.text) {
            return MessageEventType.TEXT;
        } else if (message.attachments) {
            return MessageEventType.ATTACHMENTS;
        }
    } else if (messageEvent.postback) {
        return MessageEventType.POSTBACK;
    }
    return MessageEventType.UNKNOWN;
}

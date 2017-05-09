import * as Rx from "@reactivex/rxjs";
import { Say, Echo, Sorry, Ignore, LabelImage, NLP } from "./skills";
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
    payload: { url?: string; };
}

export const CreateMessageHandler = (PAGE_ACCESS_TOKEN: string) => {
    const msgSender =
        CreateMessageSender(PAGE_ACCESS_TOKEN);
    const attSender =
        CreateMessageSenderWithAttachmentUpload(PAGE_ACCESS_TOKEN);

    return (event: any): Rx.Observable<string> => {
        let userID = event.sender.id;

        return Rx.Observable.of(event)
            .mergeMap((event) =>
                Rx.Observable.fromPromise(SendMarkSeen(msgSender, userID))
                    .map(() => event)
            )
            .mergeMap((event) =>
                Rx.Observable.fromPromise(SendTypingOn(msgSender, userID))
                    .map(() => event)
            )
            .mergeMap(handleMessage$(msgSender, attSender))
            .catch((err) => {
                console.error("[facebook/message] message handle error: " + err);
                return Rx.Observable.fromPromise(
                    Echo(msgSender, userID, "Sorry, I've got brain problems.")
                );
            })
            .mergeMap((data) =>
                Rx.Observable.fromPromise(SendTypingOff(msgSender, userID))
                    .map(() => data)
            );
    };
}

const handleMessage$ = (
    msgSender: MessageSender,
    attSender: MessageSenderWithAttachementUpload
) => (event: any): Rx.Observable<string> => {
    let userID = event.sender.id;

    switch (detectMessageEventType(event)) {
        case MessageEventType.ECHO:
            return Rx.Observable.fromPromise(Ignore());
        case MessageEventType.TEXT:
            return handleTextMessage$(msgSender, attSender, event);
        case MessageEventType.ATTACHMENTS:
            return handleAttachmentsMessage$(msgSender, attSender, event);
        default:
            return Rx.Observable.fromPromise(Sorry(msgSender, userID));
    }
};

const handleTextMessage$ = (
    messageSender: MessageSender,
    attachmentMessageSender: MessageSenderWithAttachementUpload,
    messageEvent: any
) => {
    let userID = messageEvent.sender.id;
    let message = messageEvent.message;
    let messageText = message.text;

    if (messageText.match(/^say (.+)$/i)) {
        return Rx.Observable.fromPromise(
            Say(attachmentMessageSender, userID, messageText)
        );
    }

    return Rx.Observable.fromPromise(NLP(messageSender, userID, messageText));
};

const handleAttachmentsMessage$ = (
    messageSender: MessageSender,
    attachmentMessageSender: MessageSenderWithAttachementUpload,
    messageEvent: any
) => {
    let message = messageEvent.message;
    let userID = messageEvent.sender.id;
    let attachments = message.attachments;
    let imageMsgHandler = handleImageMessage$(messageSender);

    return Rx.Observable.from(attachments)
        .mergeMap((att: Attachment) => {
            switch (att.type) {
                case "image":
                    return imageMsgHandler(userID, att);
                default:
                    return Rx.Observable.fromPromise(
                        Sorry(messageSender, userID)
                    );
            }
        });
};

const handleImageMessage$ = (messageSender: MessageSender) =>
    (userID: string, att: Attachment) => {
        if (att.payload && att.payload.url) {
            return Rx.Observable.fromPromise(
                LabelImage(messageSender, userID, att.payload.url)
            );
        } else {
            return Rx.Observable.fromPromise(
                Echo(messageSender, userID, "Sorry, I can't get the image")
            );
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

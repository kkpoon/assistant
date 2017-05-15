import * as Rx from "@reactivex/rxjs";
import { Say, Sorry, Ignore, LabelImage, Lex } from "../../skills";
import {
    SendTextMessage,
    SendTextMessageWithQuickReplies,
    SendAudioMessage,
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

export const CreateMessageHandler =
    (PAGE_ACCESS_TOKEN: string, GOOGLE_APIKEY: string) =>
        (event: any): Promise<string> => {
            let userID = event.sender.id;

            return SendMarkSeen(PAGE_ACCESS_TOKEN)(userID)
                .then(() => SendTypingOn(PAGE_ACCESS_TOKEN)(userID))
                .then(() => handleMessage(PAGE_ACCESS_TOKEN, GOOGLE_APIKEY, event))
                .catch((err) => {
                    console.error("[facebook/message] message handle error: " + err);
                    return SendTextMessage(PAGE_ACCESS_TOKEN)(userID)("Sorry, I've got brain problems.")
                        .then(() => "response to tell error");
                })
                .then((result) =>
                    SendTypingOff(PAGE_ACCESS_TOKEN)(userID)
                        .then(() => result)
                );
        };


const handleMessage = (
    PAGE_ACCESS_TOKEN: string,
    GOOGLE_APIKEY: string,
    messageEvent: any
): Promise<string> => {
    let userID = messageEvent.sender.id;

    switch (detectMessageEventType(messageEvent)) {
        case MessageEventType.ECHO:
            return Ignore();
        case MessageEventType.TEXT:
            return handleTextMessage(PAGE_ACCESS_TOKEN, GOOGLE_APIKEY, messageEvent);
        case MessageEventType.ATTACHMENTS:
            return handleAttachmentsMessage(PAGE_ACCESS_TOKEN, messageEvent);
        default:
            return Sorry(SendTextMessage(PAGE_ACCESS_TOKEN)(userID))
    }
};

const handleTextMessage = (
    PAGE_ACCESS_TOKEN: string,
    GOOGLE_APIKEY: string,
    messageEvent: any,
) => {
    let userID = messageEvent.sender.id;
    let message = messageEvent.message;
    let messageText = message.text;

    if (messageText.match(/^say (.+)$/i)) {
        return Say(
            SendTextMessage(PAGE_ACCESS_TOKEN)(userID),
            SendAudioMessage(PAGE_ACCESS_TOKEN)(userID),
            GOOGLE_APIKEY,
            messageText
        );
    }

    return Lex(
        SendTextMessage(PAGE_ACCESS_TOKEN)(userID),
        SendTextMessageWithQuickReplies(PAGE_ACCESS_TOKEN)(userID),
        userID,
        messageText
    );
};

const handleAttachmentsMessage = (
    PAGE_ACCESS_TOKEN: string,
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
                        handleImageMessage(PAGE_ACCESS_TOKEN, userID, att)
                    );
                default:
                    return Rx.Observable.fromPromise(
                        Sorry(SendTextMessage(PAGE_ACCESS_TOKEN)(userID))
                    );
            }
        })
        .toArray()
        .map(results => results.join(", "))
        .toPromise();
};

const handleImageMessage = (
    PAGE_ACCESS_TOKEN: string,
    userID: string,
    att: Attachment
) => {
    if (att.payload && att.payload.sticker_id) {
        return Ignore();
    } else if (att.payload && att.payload.url) {
        return LabelImage(
            SendTextMessage(PAGE_ACCESS_TOKEN)(userID),
            att.payload.url
        );
    } else {
        return SendTextMessage(PAGE_ACCESS_TOKEN)(userID)("Sorry, I can't get the image")
            .then(() => "response with error on getting image");
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

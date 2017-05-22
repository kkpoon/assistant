/*
 * Copyright 2017 kkpoon
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as Rx from "@reactivex/rxjs";
import { Say, Sorry, Ignore, LabelImage, Lex } from "../skills";
import {
    SendTextMessage,
    SendTextMessageWithQuickReplies,
    SendAudioMessage,
    SendMarkSeen,
    SendTypingOff,
    SendTypingOn
} from "../platforms/facebook/send-api";
import {
    FacebookMessageHandler,
    FacebookMessageAttachment,
    CreateFacebookMessageHandler
} from "../platforms/facebook";


export const CreateKkpoonAssistant =
    (PAGE_ACCESS_TOKEN: string, GOOGLE_APIKEY: string): FacebookMessageHandler<string> =>
        CreateFacebookMessageHandler<string>({
            echoHandler: (message) => Ignore(),
            textHandler: handleTextMessage(PAGE_ACCESS_TOKEN, GOOGLE_APIKEY),
            attachmentsHandler: handleAttachmentsMessage(PAGE_ACCESS_TOKEN),
            postbackHandler: (message) => Ignore(),
            unknownHandler: handleUnknownMessage(PAGE_ACCESS_TOKEN)
        });

const humanActionProxy = (PAGE_ACCESS_TOKEN: string) =>
    (handler: FacebookMessageHandler<string>) => (message: any) => {
        let userID = message.sender.id;

        return SendMarkSeen(PAGE_ACCESS_TOKEN)(userID)
            .then(() => SendTypingOn(PAGE_ACCESS_TOKEN)(userID))
            .then(() => handler(event))
            .catch((err) => {
                console.error("[examples/kkpoon-assistant] message handle error: " + err);
                return SendTextMessage(PAGE_ACCESS_TOKEN)(userID)("Sorry, I've got brain problems.")
                    .then(() => "[examples/kkpoon-assistant] response to tell error");
            })
            .then((result) => SendTypingOff(PAGE_ACCESS_TOKEN)(userID).then(() => result));
    };

const handleUnknownMessage = (PAGE_ACCESS_TOKEN: string) => (message: any) => {
    let userID = message.sender.id;
    return Sorry(SendTextMessage(PAGE_ACCESS_TOKEN)(userID));
}

const handleTextMessage = (PAGE_ACCESS_TOKEN: string, GOOGLE_APIKEY: string) =>
    (messageEvent: any) => {
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

const handleAttachmentsMessage = (PAGE_ACCESS_TOKEN: string) =>
    (messageEvent: any) => {
        let message = messageEvent.message;
        let userID = messageEvent.sender.id;
        let attachments = message.attachments;

        return Rx.Observable.from(attachments)
            .mergeMap((att: FacebookMessageAttachment) => {
                switch (att.type) {
                    case "image":
                        return Rx.Observable.fromPromise(
                            handleImageMessage(PAGE_ACCESS_TOKEN)(userID, att)
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

const handleImageMessage = (PAGE_ACCESS_TOKEN: string) =>
    (userID: string, att: FacebookMessageAttachment) => {
        if (att.payload && att.payload.sticker_id) {
            return Ignore();
        } else if (att.payload && att.payload.url) {
            return LabelImage(
                SendTextMessage(PAGE_ACCESS_TOKEN)(userID),
                att.payload.url
            );
        } else {
            return SendTextMessage(PAGE_ACCESS_TOKEN)(userID)("Sorry, I can't get the image")
                .then(() => "[examples/kkpoon-assistant] response with error on getting image");
        }
    };

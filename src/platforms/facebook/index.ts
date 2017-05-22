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

import * as crypto from "crypto";
import * as express from "express";
import * as bodyParser from "body-parser";
import { WebhookValidationHandler, WebhookMessageHandler } from "./webhook";

enum MessageEventType { UNKNOWN, ECHO, TEXT, ATTACHMENTS, POSTBACK };

export type FacebookMessageHandler<T> = (message: any) => Promise<T>;

export interface MessengerBotOptions {
    APP_SECRET: string;
    VALIDATION_TOKEN: string;
    messageHandler: FacebookMessageHandler<any>
};

export interface FacebookMessageHandlerOptions<T> {
    echoHandler: FacebookMessageHandler<T>;
    textHandler: FacebookMessageHandler<T>;
    attachmentsHandler: FacebookMessageHandler<T>;
    postbackHandler: FacebookMessageHandler<T>;
    unknownHandler: FacebookMessageHandler<T>;
}

export interface FacebookMessageAttachment {
    type: string;
    payload: { url?: string; sticker_id?: number };
}

export const CreateFacebookMessageHandler =
    <T>(options: FacebookMessageHandlerOptions<T>) =>
        (message: any): Promise<T> => {
            switch (detectMessageEventType(message)) {
                case MessageEventType.ECHO:
                    return options.echoHandler(message);
                case MessageEventType.TEXT:
                    return options.textHandler(message);
                case MessageEventType.ATTACHMENTS:
                    return options.attachmentsHandler(message);
                case MessageEventType.POSTBACK:
                    return options.postbackHandler(message);
                default:
                    return options.unknownHandler(message);
            }
        };

export const CreateMessengerBot = (options: MessengerBotOptions): express.Router => {
    const verifySignature = SignatureVerifier(options.APP_SECRET);
    const router = express.Router();
    router.use(bodyParser.json({ verify: verifySignature }));
    router.get('/webhook', WebhookValidationHandler(options.VALIDATION_TOKEN));
    router.post("/webhook", WebhookMessageHandler(options.messageHandler));
    return router;
};

const SignatureVerifier =
    (APP_SECRET: string) =>
        (req: express.Request, res: express.Response, buf: Buffer) => {
            let signature = req.headers["x-hub-signature"];

            if (!signature) {
                throw new Error("Couldn't validate the signature.");
            } else {
                let elements = signature.split('=');
                let method = elements[0];
                let signatureHash = elements[1];

                let expectedHash = crypto
                    .createHmac('sha1', APP_SECRET)
                    .update(buf)
                    .digest('hex');

                if (signatureHash != expectedHash) {
                    throw new Error("Couldn't validate the request signature.");
                }
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

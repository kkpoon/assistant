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
import { FacebookMessageHandler } from "./message";

export interface MessengerBotOptions {
    APP_SECRET: string;
    VALIDATION_TOKEN: string;
    messageHandler: FacebookMessageHandler<any>
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

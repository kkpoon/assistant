import * as crypto from "crypto";
import * as express from "express";
import * as bodyParser from "body-parser";
import { WebhookValidationHandler, WebhookMessageHandler } from "./webhook";

export interface MessengerBotOptions {
    PAGE_ACCESS_TOKEN: string;
    APP_SECRET: string;
    VALIDATION_TOKEN: string;
    GOOGLE_APIKEY: string;
};

export function CreateMessengerBot(options: MessengerBotOptions): express.Router {
    const verifySignature = SignatureVerifier(options.APP_SECRET);
    const router = express.Router();
    router.use(bodyParser.json({ verify: verifySignature }));
    router.get('/webhook', WebhookValidationHandler(options.VALIDATION_TOKEN));
    router.post("/webhook", WebhookMessageHandler(options.PAGE_ACCESS_TOKEN, options.GOOGLE_APIKEY));
    return router;
}

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

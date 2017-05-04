import * as express from "express";
import * as Rx from "@reactivex/rxjs";
import { SendAPIConnector, sendTextMessage } from "./send-api";

export const WebhookValidationHandler =
    (VALIDATION_TOKEN: string) =>
        (req: express.Request, res: express.Response) => {
            if (req.query['hub.mode'] === 'subscribe' &&
                req.query['hub.verify_token'] === VALIDATION_TOKEN) {
                console.log("Validating webhook");
                res.status(200).send(req.query['hub.challenge']);
            } else {
                console.error("Failed validation. Make sure the validation tokens match.");
                res.sendStatus(403);
            }
        };

export const WebhookMessageHandler = (sendAPIConnector: SendAPIConnector) =>
    (req: express.Request, res: express.Response, next: express.NextFunction) => {
        let data = req.body;
        console.log("message received: " + JSON.stringify(data));
        if (data.object === "page") {
            Rx.Observable.from(data.entry || [])
                .mergeMap((entry: any) => Rx.Observable.from(entry.messaging))
                .mergeMap((event: any) => {
                    if (event.message) {
                        return handleMessageEventObservable(sendAPIConnector, event);
                    } else if (event.postback) {
                        return handlePostbackEventObservable(sendAPIConnector, event);
                    }
                    return Rx.Observable.empty();
                })
                .subscribe(() => {
                    res.sendStatus(200);
                }, (err: Error) => {
                    res.status(500).send(err);
                })
        }
    };

const handleMessageEventObservable =
    (sendAPIConnector: SendAPIConnector, event: any) => {
        var senderID = event.sender.id;
        let message = event.message;
        let messageText = message.text;

        if (message.is_echo) {
            return Rx.Observable.empty();
        }
        console.log("Echo back text message");
        return Rx.Observable.fromPromise(
            sendTextMessage(sendAPIConnector, senderID, messageText)
        );
    };

const handlePostbackEventObservable =
    (event: any, sendAPIConnector: SendAPIConnector) => {
        let postback = event.postback;
        return Rx.Observable.empty();
    };

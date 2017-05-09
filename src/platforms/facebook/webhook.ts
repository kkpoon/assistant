import * as express from "express";
import * as Rx from "@reactivex/rxjs";
import { CreateMessageHandler } from "./message";

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

export const WebhookMessageHandler = (PAGE_ACCESS_TOKEN: string) =>
    (req: express.Request, res: express.Response, next: express.NextFunction) => {
        let data = req.body;
        console.log("[facebook/webhook] message received: " + JSON.stringify(data));
        if (data.object === "page") {
            let handledMessage$ = CreateMessageHandler(PAGE_ACCESS_TOKEN);
            Rx.Observable.from(data.entry || [])
                .mergeMap((entry: any) => Rx.Observable.from(entry.messaging))
                .mergeMap(messageEvent => handledMessage$(messageEvent))
                .subscribe((result) => {
                    console.log("[facebook/webhook] message handled, result: " + result);
                }, (err: Error) => {
                    console.error("[facebook/webhook] Error: " + err);
                    console.error("[facebook/webhook] send HTTP 200 status");
                    res.sendStatus(200);
                }, () => {
                    console.error("[facebook/webhook] send HTTP 200 status");
                    res.sendStatus(200);
                });
        } else {
            console.error("[facebook/webhook] send HTTP 200 status");
            res.sendStatus(200);
        }
    };

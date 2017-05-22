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

import * as express from "express";
import * as Rx from "@reactivex/rxjs";
import { MessageHandler } from "../../message";

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

export const WebhookMessageHandler = (msgHandler: MessageHandler<string>) =>
    (req: express.Request, res: express.Response, next: express.NextFunction) => {
        let data = req.body;
        console.log("[facebook/webhook] message received: " + JSON.stringify(data));
        if (data.object === "page") {
            Rx.Observable.from(data.entry || [])
                .mergeMap((entry: any) => Rx.Observable.from(entry.messaging))
                .mergeMap(event => Rx.Observable.fromPromise(msgHandler(event)))
                .subscribe((result: any) => {
                    console.log(
                        "[facebook/webhook] message handled, result: " +
                        JSON.stringify(result)
                    );
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

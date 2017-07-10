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

import { APIGatewayEvent, Context, ProxyCallback } from "aws-lambda";
import { WebhookRequestHandler as FBWebHook } from "facebook-webhook-lambda";
import { Observable } from "@reactivex/rxjs";
import { SNSPublishMessage } from "./services/aws";

const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET;
const FACEBOOK_VERIFICATION_TOKEN = process.env.FACEBOOK_VERIFICATION_TOKEN;
const SNS_MESSAGE_HANDLE_TOPIC = process.env.SNS_MESSAGE_HANDLE_TOPIC;

exports.facebookHandler = FBWebHook({
    appSecret: FACEBOOK_APP_SECRET,
    verifyToken: FACEBOOK_VERIFICATION_TOKEN,
    updateHandler: (event: any): Promise<string> => {
        if (event.object == "page") { // only interested in messenger events
            return Observable.from(event.entry || [])
                .mergeMap((entry: any) => Observable.from(entry.messaging))
                .mergeMap(message =>
                    Observable.fromPromise(
                        SNSPublishMessage(SNS_MESSAGE_HANDLE_TOPIC)(message)
                    )
                )
                .reduce((acc, curr) => acc + 1, 0)
                .map(cnt => `${cnt} messages are sent to SNS topic: ${SNS_MESSAGE_HANDLE_TOPIC}`)
                .toPromise()
                .then((text) => {
                    console.log(text);
                    return "";
                });
        }
        console.log("Not handle this event: " + JSON.stringify(event));
        return Promise.resolve("");
    }
});

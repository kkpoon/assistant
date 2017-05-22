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

import * as awsServerlessExpress from "aws-serverless-express";
import { Context } from "aws-lambda";
import CreateWebhook from "./platforms";
import { SNSPublishMessage } from "./services/aws";

const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET;
const FACEBOOK_VALIDATION_TOKEN = process.env.FACEBOOK_VALIDATION_TOKEN;
const SNS_MESSAGE_HANDLE_TOPIC = process.env.SNS_MESSAGE_HANDLE_TOPIC;

const messageHandler = (message: any): Promise<string> =>
    SNSPublishMessage(SNS_MESSAGE_HANDLE_TOPIC)(message)
        .then(() => `the message is sent to SNS topic: ${SNS_MESSAGE_HANDLE_TOPIC}`);

const messengerWebhookServer = awsServerlessExpress
    .createServer(CreateWebhook({
        messenger: {
            APP_SECRET: FACEBOOK_APP_SECRET,
            VALIDATION_TOKEN: FACEBOOK_VALIDATION_TOKEN,
            messageHandler: messageHandler
        }
    }));


exports.handler = (event: any, context: Context) =>
    awsServerlessExpress.proxy(messengerWebhookServer, event, context);

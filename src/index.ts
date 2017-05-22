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
import { CreateKkpoonAssistant } from "./examples/kkpoon-assistant";

const PAGE_ACCESS_TOKEN = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
const GOOGLE_APIKEY = process.env.GOOGLE_APIKEY;

const messageHandler = CreateKkpoonAssistant(PAGE_ACCESS_TOKEN, GOOGLE_APIKEY);

const messengerWebhookServer = awsServerlessExpress
    .createServer(CreateWebhook({
        messenger: {
            APP_SECRET: process.env.FACEBOOK_APP_SECRET,
            VALIDATION_TOKEN: process.env.FACEBOOK_VALIDATION_TOKEN,
            messageHandler: messageHandler
        }
    }));

exports.handler = (event: any, context: Context) =>
    awsServerlessExpress.proxy(messengerWebhookServer, event, context);

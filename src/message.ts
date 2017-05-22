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

import { Context, Callback } from "aws-lambda";
import { CreateKkpoonAssistant } from "./examples/kkpoon-assistant";

const PAGE_ACCESS_TOKEN = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
const GOOGLE_APIKEY = process.env.GOOGLE_APIKEY;

const kkpoonAssistant = CreateKkpoonAssistant(PAGE_ACCESS_TOKEN, GOOGLE_APIKEY);

exports.handler = (event: any, context: Context, callback: Callback) => {
    const message = event.Records[0].Sns.Message;
    console.log(message);
    kkpoonAssistant(JSON.parse(message))
        .then((result) => callback(null, result))
        .catch((err) => callback(err));
}

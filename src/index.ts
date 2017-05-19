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

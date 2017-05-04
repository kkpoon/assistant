import * as awsServerlessExpress from "aws-serverless-express";
import { Context } from "aws-lambda";
import CreateWebhook from "./platforms";

const messengerWebhookServer = awsServerlessExpress
    .createServer(CreateWebhook({
        messenger: {
            PAGE_ACCESS_TOKEN: process.env.FACEBOOK_PAGE_ACCESS_TOKEN,
            APP_SECRET: process.env.FACEBOOK_APP_SECRET,
            VALIDATION_TOKEN: process.env.FACEBOOK_VALIDATION_TOKEN
        }
    }));

exports.handler = (event: any, context: Context) =>
    awsServerlessExpress.proxy(messengerWebhookServer, event, context);

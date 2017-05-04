import * as express from "express";
import { MessengerBotOptions, CreateMessengerBot } from "./facebook";

interface AppOptions {
    messenger: MessengerBotOptions;
}

export default (options: AppOptions): express.Application => {
    const app = express();
    app.use("/messenger", CreateMessengerBot(options.messenger));
    return app;
};

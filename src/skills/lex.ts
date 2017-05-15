import { Lex } from "../services/aws";
import { Sorry } from "./";
import { QuickReply } from "../message-sender";

const HELP_MESSAGE = `It's been my pleasure to serve you.
1. You could ask me to say something in English. Just ask me "say blah blah blah".
2. You could send me your beautiful photos and let me guess what is it about.
3. And hopefully you could ask me to submit Leave Application to the company in the future
(Now I just repeat your leave application order to you without doing anything)
Just send me "I would like to take leave", or "I would like to take annual leave from tomorrow to next friday" etc.
`;

export default (
    sendTextMessage: (text: string) => Promise<any>,
    sendQuickReplyMessage: (text: string) => (replies: QuickReply[]) => Promise<any>,
    userID: string,
    text: string
): Promise<string> =>
    Lex("CompanyBot", "beta")(userID, text)
        .then((data: AWS.LexRuntime.PostTextResponse) => {
            console.log("[Lex] " + JSON.stringify(data))
            if (data.dialogState === "Fulfilled") {
                // information locate in data.slots
                // enough information, Lex fulfillment lambda will take action
                return sendTextMessage(data.message);
            } else if (data.dialogState === "ReadyForFulfillment") {
                if (data.intentName === "ListBotFeatures") {
                    return sendTextMessage(HELP_MESSAGE);
                }
            } else if (data.dialogState === "ElicitSlot") {
                if (data.responseCard &&
                    data.responseCard.genericAttachments &&
                    data.responseCard.genericAttachments.length > 0 &&
                    data.responseCard.genericAttachments[0].buttons
                ) {
                    // send question with option buttons
                    let replies = data
                        .responseCard
                        .genericAttachments[0]
                        .buttons
                        .map((d) => ({
                            content_type: "text",
                            title: d.text,
                            payload: d.value
                        }));
                    return sendQuickReplyMessage(data.message)(replies);
                } else {
                    // send question to ask for text input
                    return sendTextMessage(data.message);
                }
            } else if (data.dialogState === "ElicitIntent") {
                return Sorry(sendTextMessage);
            }
            return sendTextMessage(data.message);
        })
        .then(() => "response by Lex message");

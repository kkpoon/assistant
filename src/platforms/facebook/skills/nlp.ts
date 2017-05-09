import {
    MessageSender,
    SendTextMessage,
    SendTextMessageWithQuickReplies
} from "../send-api";
import { Lex } from "../../../services/aws";
import { Sorry } from "./";

export default (sendMessage: MessageSender, userID: string, text: string) => {
    return Lex("CompanyBot", "beta")(userID, text)
        .then((data: AWS.LexRuntime.PostTextResponse) => {
            console.log("[Lex] " + JSON.stringify(data))
            if (data.dialogState === "Fulfilled") {
                // information locate in data.slots
                // enough information, Lex fulfillment lambda will take action
                return SendTextMessage(sendMessage, userID, data.message);
            } else if (data.dialogState === "ElicitSlot") {
                if (data.responseCard &&
                    data.responseCard.genericAttachments &&
                    data.responseCard.genericAttachments.length > 0 &&
                    data.responseCard.genericAttachments[0].buttons
                ) {
                    // send question with option buttons
                    return SendTextMessageWithQuickReplies(
                        sendMessage,
                        userID,
                        data.message,
                        data.responseCard.genericAttachments[0].buttons.map(
                            (d) => ({
                                content_type: "text",
                                title: d.text,
                                payload: d.value
                            })
                        )
                    );
                } else {
                    // send question to ask for text input
                    return SendTextMessage(sendMessage, userID, data.message);
                }
            } else if (data.dialogState === "ElicitIntent") {
                return Sorry(sendMessage, userID);
            }
            return SendTextMessage(sendMessage, userID, data.message);
        })
        .then(() => "response by Lex message");

};

import { MessageSender, SendTextMessage } from "../send-api";

export default (
    sendMessage: MessageSender,
    recipientID: string,
    text: string
) => {
    return SendTextMessage(sendMessage, recipientID, text)
        .then(() => "response by text message");
};

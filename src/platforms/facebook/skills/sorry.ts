import { MessageSender, SendTextMessage } from "../send-api";

export default (sendMessage: MessageSender, recipientID: string) => {
    let text = "¯\\_(ツ)_/¯ Sorry, I don't know what to do!";
    return SendTextMessage(sendMessage, recipientID, text)
        .then(() => "response by sorry message");
};

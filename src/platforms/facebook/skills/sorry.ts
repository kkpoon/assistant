import { MessageSender, SendTextMessage} from "../send-api";

export default (sendMessage: MessageSender, messageEvent: any) => {
    let senderID = messageEvent.sender.id;
    let text = "¯\\_(ツ)_/¯ Sorry, I don't know what to do!";
    return SendTextMessage(sendMessage, senderID, text)
        .then(() => ({ messageEvent, result: "response by sorry message" }));
};

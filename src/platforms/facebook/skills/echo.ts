import { MessageSender, SendTextMessage} from "../send-api";

export default (sendMessage: MessageSender, messageEvent: any) => {
    let senderID = messageEvent.sender.id;
    let message = messageEvent.message;
    let text = message.text;
    return SendTextMessage(sendMessage, senderID, text)
        .then(() => ({
            messageEvent,
            result: "response by echo back text message"
        }));
};

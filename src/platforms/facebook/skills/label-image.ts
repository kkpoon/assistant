import fetch from "node-fetch";
import { RekognitionImageLabels } from "../../../services/aws";
import { MessageSender, SendTextMessage } from "../send-api";

export default (
    sendMessage: MessageSender,
    recipientID: string,
    imageURL: string
) =>
    fetch(imageURL)
        .then((res) => res.buffer())
        .then(RekognitionImageLabels)
        .then((data) => SendTextMessage(
            sendMessage,
            recipientID,
            `It looks like about ${data.Labels.map(d => d.Name).join(", ")}.`
        ));

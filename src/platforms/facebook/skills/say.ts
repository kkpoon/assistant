import { Polly } from "../../../services/aws";
import {
    MessageSenderWithAttachementUpload,
    SendAudioMessage
} from "../send-api";

export default (
    sendMessage: MessageSenderWithAttachementUpload,
    messageEvent: any
) => {
    var senderID = messageEvent.sender.id;
    let message = messageEvent.message;

    return new Promise((resolve, reject) => {
        if (message.text) {
            let messageText = message.text;
            let matchSay = messageText.match(/^say (.+)$/i);
            if (matchSay && matchSay.length > 0 && matchSay[1]) {
                return resolve(
                    Polly(matchSay[1])
                        .then((data: AWS.Polly.SynthesizeSpeechOutput) =>
                            SendAudioMessage(
                                sendMessage,
                                senderID,
                                <ReadableStream>data.AudioStream
                            )
                        )
                        .then(() => ({
                            messageEvent,
                            result: "response by voice message"
                        }))
                );
            }
            return reject(new Error("invalid say command format"));
        }
        return reject(new Error("invalid message type"));
    });
};

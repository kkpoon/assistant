import { PollySpeak } from "../../../services/aws";
import {
    MessageSenderWithAttachementUpload,
    SendAudioMessage
} from "../send-api";

export default (
    sendMessage: MessageSenderWithAttachementUpload,
    recipientID: string,
    messageText: string
) => {
    return new Promise((resolve, reject) => {
        let matchSay = messageText.match(/^say (.+)$/i);
        if (matchSay && matchSay.length > 0 && matchSay[1]) {
            return resolve(
                PollySpeak(matchSay[1])
                    .then((data: AWS.Polly.SynthesizeSpeechOutput) =>
                        SendAudioMessage(
                            sendMessage,
                            recipientID,
                            <ReadableStream>data.AudioStream
                        )
                    )
                    .then(() => "response by voice message")
            );
        }
        return reject(new Error("invalid say command format"));
    });
};

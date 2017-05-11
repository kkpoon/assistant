import { PollySpeakSSML } from "../../../services/aws";
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
            let convertedSay = matchSay[1]
                .replace(/"([^".]*)"/i, (a, b) => "<emphasis level=\"strong\">" + b + "</emphasis>");
            let speech = `<speak>${convertedSay}</speak>`;
            return resolve(
                PollySpeakSSML(speech)
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

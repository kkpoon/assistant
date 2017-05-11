import { PollySpeakSSML, PollyGetVoice } from "../../../services/aws";
import { DetectLanguage } from "../../../services/google-cloud";
import {
    MessageSenderWithAttachementUpload,
    SendAudioMessage
} from "../send-api";

export default (
    sendMessage: MessageSenderWithAttachementUpload,
    googleCloudAPIkey: string,
    recipientID: string,
    messageText: string
) => {
    return new Promise((resolve, reject) => {
        let matchSay = messageText.match(/^say (.+)$/i);
        if (matchSay && matchSay.length > 0 && matchSay[1]) {
            let inputSay = matchSay[1];
            let convertedSay = inputSay.replace(/"([^".]*)"/i, (a, b) => "<emphasis level=\"strong\">" + b + "</emphasis>");
            let speech = `<speak>${convertedSay}</speak>`;
            return resolve(
                DetectLanguage(googleCloudAPIkey)(inputSay)
                    .then(toAWSLanguageCode)
                    .then(PollyGetVoice)
                    .then((voiceID) => PollySpeakSSML(speech, voiceID))
                    .then((data) => SendAudioMessage(sendMessage, recipientID, <ReadableStream>data.AudioStream))
                    .then(() => "response by voice message")
            );
        }
        return reject(new Error("invalid say command format"));
    });
};

const LANGUAGE_CODE_GOOOGLE_TO_AWS: any = {
    "cy": "cy-GB",
    "da": "da-DK",
    "de": "de-DE",
    "en": "en-US",
    "es": "es-ES",
    "fr": "fr-FR",
    "is": "is-IS",
    "it": "it-IT",
    "ja": "ja-JP",
    "no": "nb-NO",
    "nl": "nl-NL",
    "pl": "pl-PL",
    "pt": "pt-PT",
    "ro": "ro-RO",
    "ru": "ru-RU",
    "sv": "sv-SE",
    "tr": "tr-TR"
};

const toAWSLanguageCode = (googleLangCode: string) =>
    LANGUAGE_CODE_GOOOGLE_TO_AWS[googleLangCode] || "en-US";




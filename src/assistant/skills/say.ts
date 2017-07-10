/*
 * Copyright 2017 kkpoon
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { PollySpeakSSML, PollyGetVoice } from "../../services/aws";
import { DetectLanguage } from "../../services/google-cloud";

export default (
    sendTextMessage: (text: string) => Promise<any>,
    sendAudioMessage: (audio: ReadableStream) => Promise<any>,
    googleCloudAPIkey: string,
    messageText: string
): Promise<string> =>
    new Promise((resolve, reject) => {
        let matchSay = messageText.match(/^say (.+)$/i);
        if (matchSay && matchSay.length > 0 && matchSay[1]) {
            let inputSay = matchSay[1];
            let convertedSay = inputSay.replace(/"([^".]*)"/i, (a, b) => "<emphasis level=\"strong\">" + b + "</emphasis>");
            let speech = `<speak>${convertedSay}</speak>`;
            return resolve(
                DetectLanguage(googleCloudAPIkey)(inputSay)
                    .then(toAWSLanguageCode)
                    .then((code) => code ? code : new Error("Language not supported"))
                    .then(PollyGetVoice)
                    .then((voiceID) => PollySpeakSSML(speech, voiceID))
                    .then((data) => sendAudioMessage(<ReadableStream>data.AudioStream))
                    .catch((err) => sendTextMessage("I don't know how to speak in this language"))
                    .then(() => "response by voice message")
            );
        }
        return reject(new Error("invalid say command format"));
    });


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
    LANGUAGE_CODE_GOOOGLE_TO_AWS[googleLangCode];

import * as AWS from "aws-sdk";

const polly = new AWS.Polly();

export const Polly =
    (text: string): Promise<AWS.Polly.SynthesizeSpeechOutput> =>
        new Promise((resolve, reject) => {
            polly.synthesizeSpeech({
                OutputFormat: "mp3",
                Text: text,
                VoiceId: "Joanna",
                SampleRate: "8000",
                TextType: "text"
            }, function(err, data) {
                if (err) {
                    return reject(err);
                }
                return resolve(data);
            });
        });

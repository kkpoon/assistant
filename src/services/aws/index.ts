import * as AWS from "aws-sdk";

export const PollySpeak =
    (text: string): Promise<AWS.Polly.SynthesizeSpeechOutput> =>
        new Promise((resolve, reject) => {
            const polly = new AWS.Polly();
            polly.synthesizeSpeech({
                OutputFormat: "mp3",
                Text: text,
                VoiceId: "Joanna",
                SampleRate: "8000",
                TextType: "text"
            }, (err, data) => err ? reject(err) : resolve(data));
        });

export const RekognitionImageLabels =
    (image: Buffer): Promise<AWS.Rekognition.DetectLabelsResponse> =>
        new Promise((resolve, reject) => {
            const rekognition = new AWS.Rekognition();
            rekognition.detectLabels({
                Image: { Bytes: image },
                MinConfidence: 0.7
            }, (err, data) => err ? reject(err) : resolve(data));
        });

export const Lex =
    (botName: string, botAlias: string) =>
        (userID: string, text: string) =>
            new Promise((resolve, reject) => {
                const lexruntime = new AWS.LexRuntime();
                lexruntime.postText({
                    botAlias: botAlias,
                    botName: botName,
                    inputText: text,
                    userId: userID
                }, (err, data) => err ? reject(err) : resolve(data));
            });

import * as AWS from "aws-sdk";

export const PollySpeakText =
    (text: string): Promise<AWS.Polly.SynthesizeSpeechOutput> =>
        new Promise((resolve, reject) => {
            const polly = new AWS.Polly();
            polly.synthesizeSpeech({
                OutputFormat: "mp3",
                Text: text,
                VoiceId: "Joanna",
                SampleRate: "16000",
                TextType: "text"
            }, (err, data) => err ? reject(err) : resolve(data));
        });

export const PollySpeakSSML =
    (text: string): Promise<AWS.Polly.SynthesizeSpeechOutput> =>
        new Promise((resolve, reject) => {
            const polly = new AWS.Polly();
            polly.synthesizeSpeech({
                OutputFormat: "mp3",
                Text: text,
                VoiceId: "Joanna",
                SampleRate: "16000",
                TextType: "ssml"
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

export const RekognitionFaceAnalysis =
    (image: Buffer): Promise<AWS.Rekognition.DetectFacesResponse> =>
        new Promise((resolve, reject) => {
            const rekognition = new AWS.Rekognition();
            rekognition.detectFaces({
                Image: { Bytes: image },
                Attributes: ["ALL"]
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

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

import * as AWS from "aws-sdk";
import * as _ from "lodash";

export const S3ReadJSON =
    (bucket: string) => (key: string): Promise<AWS.S3.GetObjectOutput> =>
        new Promise((resolve, reject) => {
            const s3 = new AWS.S3();
            s3.getObject({
                Bucket: bucket,
                Key: key
            }, (err, data) => err ? reject(err) : resolve(JSON.parse(data.Body.toString())));
        });

export const S3WriteJSON =
    (bucket: string) => (key: string) => (data: any): Promise<AWS.S3.PutObjectOutput> =>
        new Promise((resolve, reject) => {
            const s3 = new AWS.S3();
            s3.putObject({
                Bucket: bucket,
                Key: key,
                Body: JSON.stringify(data),
                ContentType: "application/json"
            }, (err, data) => err ? reject(err) : resolve(data));
        });

export const S3Remove =
    (bucket: string) => (key: string): Promise<AWS.S3.DeleteObjectOutput> =>
        new Promise((resolve, reject) => {
            const s3 = new AWS.S3();
            s3.deleteObject({
                Bucket: bucket,
                Key: key
            }, (err, data) => err ? reject(err) : resolve(data));
        });

export const SNSPublishMessage =
    (topic: string) => (data: any): Promise<AWS.SNS.PublishResponse> =>
        new Promise((resolve, reject) => {
            const sns = new AWS.SNS();
            sns.publish({
                TopicArn: topic,
                Message: JSON.stringify(data),
            }, (err, data) => err ? reject(err) : resolve(data));
        });

export const PollySpeakText =
    (text: string, voiceID: string): Promise<AWS.Polly.SynthesizeSpeechOutput> =>
        new Promise((resolve, reject) => {
            const polly = new AWS.Polly();
            polly.synthesizeSpeech({
                OutputFormat: "mp3",
                Text: text,
                VoiceId: voiceID,
                SampleRate: "22050",
                TextType: "text"
            }, (err, data) => err ? reject(err) : resolve(data));
        });

export const PollySpeakSSML =
    (text: string, voiceID: string): Promise<AWS.Polly.SynthesizeSpeechOutput> =>
        new Promise((resolve, reject) => {
            const polly = new AWS.Polly();
            polly.synthesizeSpeech({
                OutputFormat: "mp3",
                Text: text,
                VoiceId: voiceID,
                SampleRate: "22050",
                TextType: "ssml"
            }, (err, data) => err ? reject(err) : resolve(data));
        });


export const PollyGetVoice = (language: string): Promise<string> =>
    new Promise((resolve, reject) => {
        const polly = new AWS.Polly()
        polly.describeVoices({
            LanguageCode: language
        }, (err, data) => {
            if (err) {
                return reject(err);
            }
            let firstChoice = _.head(data.Voices);
            if (firstChoice) {
                return resolve(firstChoice.Id)
            }
            return resolve("Joanna");
        });
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

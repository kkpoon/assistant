import fetch from "node-fetch";
import { RekognitionImageLabels, RekognitionFaceAnalysis } from "../services/aws";

export default (
    sendTextMessage: (text: string) => Promise<any>,
    imageURL: string
): Promise<string> =>
    fetch(imageURL)
        .then((res) => res.buffer())
        .then(handleImage)
        .then((result: string) => sendTextMessage(result))
        .then(() => "response of image labels");

const handleImage = (image: Buffer) =>
    RekognitionImageLabels(image)
        .then((data) => {
            if (data.Labels.filter(humanInside).length > 0) {
                return RekognitionFaceAnalysis(image)
                    .then((faceData) => "I see a " +
                        faceData.FaceDetails
                            .map(describeFace)
                            .join(" And there is another ")
                    );
            }
            return `It looks like about ${data.Labels.map(d => d.Name).join(", ")}.`
        });

const humanInside = (d: AWS.Rekognition.Label) =>
    d.Name === "People" ||
    d.Name === "Person" ||
    d.Name === "Portrait" ||
    d.Name === "Face";

const describeFace = (face: AWS.Rekognition.FaceDetail) => {
    let pronoun = face.Gender.Value.trim().toUpperCase() === "MALE" ? "He" : "She";
    let desc = [`${face.Gender.Value.toLowerCase()} ` +
        `around ${face.AgeRange.Low} to ${face.AgeRange.High}.`];

    if (face.Smile.Value && face.Smile.Confidence > 0.7) {
        desc.push(`${pronoun} looks like smiling.`);
    }

    if (face.Eyeglasses.Value && face.Eyeglasses.Confidence > 0.7) {
        desc.push(`${pronoun} is wearing glasses.`);
    } else if (face.Sunglasses.Value && face.Sunglasses.Confidence > 0.7) {
        desc.push(`${pronoun} is wearing sunglasses.`);
    }

    let emotions = face.Emotions.filter((d) => d != "UNKNOWN");
    if (emotions.length > 0) {
        let emotion = emotions.sort((a, b) => b.Confidence - a.Confidence)[0];
        desc.push(`${pronoun} seems ${emotion.Type.toLowerCase()}.`);
    }

    return desc.join(" ");
};

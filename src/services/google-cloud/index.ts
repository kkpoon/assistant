import fetch from "node-fetch";
import * as _ from "lodash";

interface DetectLanguageResult {
    data: {
        detections: {
            confidence: number;
            isReliable: boolean;
            language: string;
        }[][]
    }
}

export const DetectLanguage = (apikey: string) => (text: string): Promise<string> =>
    fetch(`https://translation.googleapis.com/language/translate/v2/detect?key=${apikey}`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: text })
    })
        .then((res) => res.json())
        .then((result: DetectLanguageResult) =>
            _.head(
                result.data.detections[0]
                    .sort((a, b) => b.confidence - a.confidence)
                    .map((d) => d.language)
            ) || "UNKNOWN"
        );

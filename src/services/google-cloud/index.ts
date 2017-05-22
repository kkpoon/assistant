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

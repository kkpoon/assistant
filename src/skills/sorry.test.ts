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

import Sorry from "./sorry";

test("[skills] Sorry skill send sorry message", (done) => {
    const sendTextMessage = jest.fn(() => Promise.resolve());

    Sorry(sendTextMessage)
        .then((result) => {
            expect(result).toBe("response by sorry message");
            expect(sendTextMessage.mock.calls.length).toBe(1);
            expect(sendTextMessage.mock.calls[0][0])
                .toBe("¯\\_(ツ)_/¯ Sorry, I don't know what to do!");
            done();
        })
})

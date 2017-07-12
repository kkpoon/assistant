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

import { Wit } from "node-wit";
import * as moment from "moment";
import { head, last } from "lodash";
import { QuickReply } from "../../message-sender";
import { S3ReadJSON, S3WriteJSON } from "../../services/aws";

export default (WIT_ACCESS_TOKEN: string, SESSION_BUCKET: string) => (
    sendTextMessage: (text: string) => Promise<any>,
    sendQuickReplyMessage: (text: string) => (replies: QuickReply[]) => Promise<any>,
    userID: string,
    text: string
): Promise<string> => {
    const client = new Wit({
        accessToken: WIT_ACCESS_TOKEN,
        actions: {
            send: (request: any, response: any) => {
                if (response.quickreplies && response.quickreplies.length > 0) {
                    return sendQuickReplyMessage(response.text)(
                        response.quickreplies
                            .map((quickReply: string) =>
                                ({
                                    content_type: "text",
                                    title: quickReply,
                                    payload: quickReply
                                })
                            )
                    ).then(() => { });
                } else {
                    // must return Promise of void for wit.ai send function;
                    return sendTextMessage(response.text).then(() => { });
                }
            },
            FindLocation,
            TakeLeave,
            SubmitLeaveApplication
        }
    });

    return S3ReadJSON(SESSION_BUCKET)(userID)
        .catch(err => ({}))
        .then((context: any) => {
            console.log("context:\n" + JSON.stringify(context));
            let now = new Date();
            if (now.getTime() - (context.timestamp || 0) > 300000) {
                return {};
            }
            return context;
        })
        .then((context) => client.runActions(userID, text, context))
        .then((context0: any) => Object.assign({}, context0, {
            timestamp: new Date().getTime()
        }))
        .then((context0: any) => !!context0.fulfilled ? {} : context0)
        .then((context0: any) => S3WriteJSON(SESSION_BUCKET)(userID)(context0))
        .catch((err) => { console.error('Oops! Got an error: ' + err); })
        .then(() => "Message handled by Wit.ai");
}

// -- actions

const FindLocation = (request: any) => {
    const { sessionId, context, text, entities } = request;
    const place = entities.location[0].value;
    return ({
        place,
        url: "https://maps.google.com/maps/search/" + place
    });
};

const TakeLeave = (request: any) => {
    const { sessionId, context, text, entities } = request;
    console.log("request:\n" + JSON.stringify(request));

    let context0 = Object.assign({}, context);

    if (entities.from && entities.from.length > 0 && entities.to && entities.to.length > 0) {
        const { from, to } = entities;
        context0 = Object.assign({}, context0, {
            when: fromToToText(from[0], to[0])
        });
    } else if (entities.datetime && entities.datetime.length > 0) {
        const { datetime } = entities;
        context0 = Object.assign({}, context0, {
            when: datetimeToText(datetime[0])
        });
    }
    if (entities.leave_type && entities.leave_type[0]) {
        context0 = Object.assign({}, context0, {
            leave_type: entities.leave_type[0].value
        });
    }

    if (context0.when && context0.leave_type) {
        context0 = Object.assign({}, context0, { fulfilled: true });
    }

    return context0;
};

const SubmitLeaveApplication = (request: any) => {
    console.log("request:\n" + JSON.stringify(request));

    switch (request.entities.yes_no[0].value) {
        case "yes": return { completed: true };
        case "no": return { cancel: true };
        default: return { error: true }
    }
};

// -- helpers

const datetimeToText = (datetime: any) => {
    if (datetime.type === "value" && datetime.grain === "day") {
        return "on " + moment(datetime.value).format("YYYY-MM-DD") + " (Whole Day)";
    } else if (datetime.type === "value" && datetime.grain === "hour") {
        return "at " + moment(datetime.value).format("YYYY-MM-DD (A)");
    } else if (datetime.type === "interval") {
        let values = datetime.values;
        let start: any = head(values.map((d: any) => d.from));
        let end: any = last(values.map((d: any) => d.to));

        if (moment(start.value).isSame(end.value, "day")) {
            if (start.grain === "day" || end.grain === "day") {
                return "on " + moment(start).format("YYYY-MM-DD") + " (Whole Day)";
            } else if (moment(start.value).format("A") === moment(end.value).subtract(1, "seconds").format("A")) {
                return "at " + moment(start.value).format("YYYY-MM-DD (A)");
            } else {
                return "on " + moment(start.value).format("YYYY-MM-DD") + " (Whole Day)";
            }
        } else {
            let when = "";
            if (start.grain === "day" || moment(start.value).format("A") === "AM") {
                when += "from " + moment(start.value).format("YYYY-MM-DD") + " (Whole Day)";
            } else {
                when += "from " + moment(start.value).format("YYYY-MM-DD (A)");
            }
            if (end.grain === "day" || moment(end.value).format("A") === "PM") {
                when += " to " + moment(end.value).subtract(1, "seconds").format("YYYY-MM-DD") + " (Whole Day)";
            } else {
                when += " to " + moment(end.value).subtract(1, "seconds").format("YYYY-MM-DD (A)");
            }
            return when;
        }
    } else {
        return "on " + moment(datetime.value).format("YYYY-MM-DD") + " (Whole Day)";
    }
};

const fromToToText = (from: any, to: any) => {
    let when = "";

    if (from.type === "value") {
        if (from.grain === "day") {
            when += "from " + moment(from.value).format("YYYY-MM-DD") + " (Whole Day)";
        } else {
            when += "from " + moment(from.value).format("YYYY-MM-DD (A)");
        }
    } else if (from.type === "interval") {
        if (moment(from.from.value).isSame(to.value || to.to.value, "day")) {
            return "on " + moment(from.from.value).format("YYYY-MM-DD") + " (Whole Day)";
        } else if (moment(from.from.value).format("A") === "AM") {
            when += "from " + moment(from.from.value).format("YYYY-MM-DD") + " (Whole Day)";
        } else {
            when += "from " + moment(from.from.value).format("YYYY-MM-DD (A)");
        }
    }

    if (to.type === "value") {
        if (to.grain === "day") {
            when += " to " + moment(to.value).subtract(1, "seconds").format("YYYY-MM-DD") + " (Whole Day)";
        } else {
            when += " to " + moment(to.value).subtract(1, "seconds").format("YYYY-MM-DD (A)");
        }
    } else if (to.type === "interval") {
        if (moment(from.value || from.from.value).isSame(to.to.value, "day")) {
            return "on " + moment(from.from.value).format("YYYY-MM-DD") + " (Whole Day)";
        } else if (moment(to.to.value).format("A") === "PM") {
            when += " to " + moment(to.to.value).subtract(1, "seconds").format("YYYY-MM-DD") + " (Whole Day)";
        } else {
            when += " to " + moment(to.to.value).subtract(1, "seconds").format("YYYY-MM-DD (A)");
        }
    }

    return when;
};

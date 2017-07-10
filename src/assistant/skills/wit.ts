import { Wit, WitRequest, WitResponse } from "node-wit";
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
            send: (request: WitRequest, response: WitResponse) => {
                if (response.quickReplies && response.quickReplies.length > 0) {
                    return sendQuickReplyMessage(response.text)(
                        response.quickReplies
                            .map((quickReply: string) =>
                                ({ content_type: "text", title: quickReply })
                            )
                    ).then(() => { });
                } else {
                    // must return Promise of void for wit.ai send function;
                    return sendTextMessage(response.text).then(() => { });
                }
            },
            FindLocation: (request: any) => {
                const { sessionId, context, text, entities } = request;
                const place = entities.location[0].value;
                return ({
                    place,
                    url: "https://maps.google.com/maps/search/" + place
                });
            },
            TakeLeave: (request: any) => {
                const { sessionId, context, text, entities } = request;
                console.log("a\n" + JSON.stringify(request));

                let context0 = Object.assign({}, context);

                if (entities.datetime && entities.datetime.length > 0) {
                    const datetime = entities.datetime[0];
                    let when = "";
                    if (datetime.type === "interval") {
                        when = "from " + datetime.from + " to " + datetime.to;
                    } else {
                        when = "on " + datetime.value;
                    }
                    context0 = Object.assign({}, context0, { when });
                }
                if (entities.leave_type && entities.leave_type[0]) {
                    context0 = Object.assign({}, context0, {
                        leave_type: entities.leave_type[0].value
                    });
                }

                return context0;
            },
            ResetContext: (request: any) => ({})
        }
    });

    return S3ReadJSON(SESSION_BUCKET)(userID)
        .catch(err => ({}))
        .then((context) => { console.log("context: \n" + JSON.stringify(context)); return context; })
        .then((context) => client.runActions(userID, text, context))
        .then((context0) => S3WriteJSON(SESSION_BUCKET)(userID)(context0))
        .catch((err) => { console.error('Oops! Got an error: ' + err); })
        .then(() => "Message handled by Wit.ai");
}

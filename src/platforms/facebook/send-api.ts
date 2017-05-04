import fetch from "node-fetch";

const SEND_API_ENDPOINT = "https://graph.facebook.com/v2.6/me/messages";

export type SendAPIConnector = (message: any) => Promise<any>;

export const CreateSendAPIConnector =
    (PAGE_ACCESS_TOKEN: string): SendAPIConnector =>
        (message: any) =>
            fetch(
                `${SEND_API_ENDPOINT}?access_token=${PAGE_ACCESS_TOKEN}}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(message)
                })
                .catch(err => {
                    console.error("Error: " + err);
                    return { error: err };
                });

export const sendTextMessage =
    (sendAPI: SendAPIConnector, recipientId: string, text: string) =>
        sendAPI({ recipient: { id: recipientId }, message: { text: text } });

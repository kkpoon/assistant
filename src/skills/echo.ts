export default (
    sendTextMessage: (text: string) => Promise<any>,
    text: string
): Promise<string> =>
    sendTextMessage(text)
        .then(() => "response by text message");

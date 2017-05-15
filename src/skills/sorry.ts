const DEFAULT_SORRY = "¯\\_(ツ)_/¯ Sorry, I don't know what to do!";

export default (
    sendTextMessage: (text: string) => Promise<any>,
): Promise<string> =>
    sendTextMessage(DEFAULT_SORRY)
        .then(() => "response by sorry message");

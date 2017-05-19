import Echo from "./echo";

test("[skills] Echo skill send the exact text back", (done) => {
    const sendTextMessage = jest.fn(() => Promise.resolve());

    Echo(sendTextMessage, "Hello World")
        .then((result) => {
            expect(result).toBe("response by text message");
            expect(sendTextMessage.mock.calls.length).toBe(1);
            expect(sendTextMessage.mock.calls[0][0]).toBe("Hello World");
            done();
        })
})

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

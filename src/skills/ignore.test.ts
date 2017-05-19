import Ignore from "./ignore";

test("[skills] Ignore skill do nothing", (done) => {
    Ignore()
        .then((result) => {
            expect(result).toBe("ignore message, do nothing");
            done();
        })
})

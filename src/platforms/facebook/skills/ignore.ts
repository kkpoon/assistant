export default (messageEvent: any) => {
    return new Promise((resolve, reject) => {
        resolve({ messageEvent, result: "echo message, do nothing" });
    });
};

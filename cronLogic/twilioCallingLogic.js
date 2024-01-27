// recoveryCode=VS5YRPS8UAAYN18A3HZSFSLA
const dotenv = require("dotenv");
const twilioCall = (task) => {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const client = require("twilio")(accountSid, authToken);
    const { phoneNumber } = task.phoneNumber;
    client.calls
        .create({
            url: "http://demo.twilio.com/docs/voice.xml",
            to: "+917601060044",
            from: phoneNumber,
        })
        .then((call) => console.log(call.sid));
};

module.exports = { twilioCall };
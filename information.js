const sendMessage = require(__dirname + '/sendMessages.js')
const question = require(__dirname + '/questions.js')
const questionsInfo = require(__dirname + '/questionsInfo.js')
const job = require(__dirname + '/job.js')

module.exports = function(sender, event, user) {

    if (event.postback && event.postback.payload) {
        let payload = event.postback.payload
        
        switch (payload) {
            case 'MIGRANT_INFORMATION':
                user.lastStep = 'INTRO_MIGRANT';
                sendMessage.text(sender, "Sure, no problem!", () => {
                    questionsInfo.service(sender);
            })
            return
            case 'INFO_JOB':
                user.lastStep = 'MIGRANT_INFORMATION';
                sendMessage.text(sender, "Hey, my name is Hans. I'll be your job counselor today", () => {
                    questionsInfo.jobService(sender);
                })
            return
            case 'INFO_JOB_CLOSEST_AGENCY':
                user.lastStep = 'JOB_INFORMATION';
                sendMessage.text(sender, "I'll need your location for that.", () => {
                    sendMessage.text(sender, "Thanks for sending it to me, the closest office is this one.", () => {
                        var closestOffice = job.closestOffice();
                        sendMessage.text(sender, closestOffice);
                    })
                })
            return
        }
    }
}

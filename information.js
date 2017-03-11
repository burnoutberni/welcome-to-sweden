const sendMessage = require(__dirname + '/sendMessages.js')
const question = require(__dirname + '/questions.js')
const questionsInfo = require(__dirname + '/questionsInfo.js')

module.exports = function(sender, event, user) {
    
    sendMessage.text(sender, "Sure, no problem!", () => {
          questionsInfo.service(sender)
        })
    
    if (event.postback && event.postback.payload) {
        let payload = event.postback.payload
        if (payload === 'JOB_INFORMATION') {
          user.lastStep = 'MIGRANT_INFORMATION'
          sendMessage.text(sender, "Hey, my name is Hans. I'll be your job counselor today", () => {
            questionsInfo.jobService(sender)
            sendMessage.text(sender, "We are going to find a buddy for you that will help you with finding your daily routine, but first we need a couple of informations about you.", () => {
              question.language(sender)
            })
          })
          return
        }
    }
}

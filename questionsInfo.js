const sendMessage = require(__dirname + '/sendMessages.js')

const askService = (sender) => {
  sendMessage.button(sender, `What service do you need?`, [{
    "type":"postback",
    "title":"Finding a job",
    "payload":"INFO_JOB"
  }, {
    "type":"postback",
    "title":"Getting registered as a resident",
    "payload":"INFO_REGISTRATION"
  }])
}

const askJobService = (sender) => {
  sendMessage.button(sender, `Here's what I can do for you`, [{
    "type":"postback",
    "title":"Closest agency",
    "payload":"INFO_JOB_CLOSEST_AGENCY"
  }, {
    "type":"postback",
    "title":"Job offers",
    "payload":"INFO_JOB_OFFERS"
  }])
}

module.exports = {
  service: askService,
  jobService: askJobService,
}


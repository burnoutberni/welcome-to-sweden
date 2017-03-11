const sendMessage = require(__dirname + '/sendMessages.js')

const askService = (sender) => {
  sendMessage.button(sender, `What service do you need?`, [{
    "type":"postback",
    "title":"Finding a job",
    "payload":"INFO_JOB"
  }, {
    "type":"postback",
    "title":"Getting registered as a resident",
    "payload":"REGISTRATION_INFORMATION"
  }])
}

const askJobService = (sender) => {
  sendMessage.button(sender, `Here's what I can do for you`, [{
    "type":"postback",
    "title":"Show the nearest job agency",
    "payload":"INFO_JOB_CLOSEST_AGENCY"
  }, {
    "type":"postback",
    "title":"Show me some job offers",
    "payload":"INFO_JOB_OFFERS"
  }])
}

module.exports = {
  service: askService,
  jobService: askJobService,
}


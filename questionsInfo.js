const sendMessage = require(__dirname + '/sendMessages.js')

const askService = (sender) => {
  sendMessage.button(sender, `What service do you need?`, [{
    "type":"postback",
    "title":"Finding a job",
    "payload":"JOB_INFORMATION"
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
    "payload":"JOB_CLOSEST_AGENCY"
  }, {
    "type":"postback",
    "title":"Show me some job offers",
    "payload":"JOB_OFFERS"
  }])
}

module.exports = {
  service: askService,
  jobService: askJobService,
}


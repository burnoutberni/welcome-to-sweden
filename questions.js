const sendMessage = require(__dirname + '/sendMessages.js')

const askRole = (sender) => {
  sendMessage.button(sender, "Did you recently come to Sweden or are you a native?", [{
    "type":"postback",
    "title":"I'm a migrant!",
    "payload":"INTRO_MIGRANT"
  }, {
    "type":"postback",
    "title":"I'm a Swede!",
    "payload":"INTRO_SWEDE"
  }])
}

const askPurpose = (sender) => {
  sendMessage.button(sender, "Do you want to find information about job seeking in Sweden or do you want to be connected to a buddy?", [{
    "type": "postback",
    "title": "Job information",
    "payload": "MIGRANT_INFORMATION"
  }, {
    "type": "postback",
    "title": "Find me a buddy",
    "payload": "MIGRANT_BUDDY"
  }])
}

const askLanguage = (sender, language) => {
  sendMessage.button(sender, `It seems like you speak ${language}, do you also want to select a second language that you feel comfortable speaking in?`, [{
    "type":"postback",
    "title":"English",
    "payload":"MIGRANT_LANGUAGE_EN"
  }, {
    "type":"postback",
    "title":"French",
    "payload":"MIGRANT_LANGUAGE_FR"
  }, {
    "type":"postback",
    "title":"Spanish",
    "payload":"MIGRANT_LANGUAGE_ES"
  }])
}

const askLocation = (sender) => {
  sendMessage.quickreply(sender, "Please share your location:", [{ content_type: "location" }])
}

const askConsent = (sender) => {
  sendMessage.button(sender, "Do you want to join?", [{
    "type":"postback",
    "title":"Yes!",
    "payload":"SWEDE_YES"
  }])
}

module.exports = {
  role: askRole,
  purpose: askPurpose,
  language: askLanguage,
  location: askLocation,
  consent: askConsent,
}

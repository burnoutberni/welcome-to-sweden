const sendMessage = require(__dirname + '/sendMessages.js')

const askLanguage = (sender) => {
  sendMessage.button(sender, "It seems like you speak $language, do you also want to select a second language that you feel comfortable speaking in?", [{
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
  language: askLanguage,
  location: askLocation,
  consent: askConsent,
}

'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()
const token = process.env.FB_PAGE_ACCESS_TOKEN

const getUserData = (sender) => {
  request({
    url: `https://graph.facebook.com/v2.6/${sender}`,
    qs: {
      access_token: token,
      fields: 'first_name,last_name,profile_pic,locale,timezone,gender',
    },
    method: 'GET'
  }, (error, response, body) => {
    if (error) {
      console.log('Error sending messages: ', error)
    } else if (response.body.error) {
      console.log('Error: ', response.body.error)
    } else {
      console.log(body);
    }
  })
}

const sendTextMessage = (sender, text, callback) => {
  let messageData = { text:text }
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token:token},
    method: 'POST',
    json: {
      recipient: {id:sender},
      message: messageData,
    }
  }, (error, response, body) => {
    if (error) {
      console.log('Error sending messages: ', error)
    } else if (response.body.error) {
      console.log('Error: ', response.body.error)
    }
    callback();
  })
}

const sendQuickReplyMessage = (sender, text, quick_replies) => {
  let messageData = {
    text: text,
    quick_replies: quick_replies
  }
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token:token},
    method: 'POST',
    json: {
      recipient: {id:sender},
      message: messageData,
    }
  }, (error, response, body) => {
    if (error) {
      console.log('Error sending messages: ', error)
    } else if (response.body.error) {
      console.log('Error: ', response.body.error)
    } else {
      console.log(body)
    }
  })
}

const sendButtonMessage = (sender, question, buttons) => {
  let messageData = {
    "attachment":{
      "type":"template",
      "payload":{
        "template_type":"button",
        "text": question,
        "buttons": buttons
      }
    }
  }

  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token:token},
    method: 'POST',
    json: {
      recipient: {id:sender},
      message: messageData,
    }
  }, (error, response, body) => {
    if (error) {
      console.log('Error sending messages: ', error)
    } else if (response.body.error) {
      console.log('Error: ', response.body.error)
    }
  })
}

app.set('port', (process.env.PORT || 5000))

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// Process application/json
app.use(bodyParser.json())

// Index route
app.get('/', (req, res) => {
  res.send('Hello world, I am a chat bot')
})

// for Facebook verification
app.get('/webhook/', (req, res) => {
  if (req.query['hub.verify_token'] === 'my_voice_is_my_password_verify_me') {
    res.send(req.query['hub.challenge'])
  }
  res.send('Error, wrong token')
})

// do things
app.post('/webhook/', (req, res) => {
  let messaging_events = req.body.entry[0].messaging
  messaging_events.map((event) => {
    let sender = event.sender.id
    console.log(event)
    if (event.message && event.message.text) {
      let text = event.message.text
      getUserData(sender);
      sendTextMessage(sender, "Hej du!", () => {
        sendButtonMessage(sender, "Did you recently come to Sweden or are you a native?", [{
          "type":"postback",
          "title":"I'm a migrant!",
          "payload":"INTRO_MIGRANT"
        }, {
          "type":"postback",
          "title":"I'm a Swede!",
          "payload":"INTRO_SWEDE"
        }])
      })
    }
    if (event.postback && event.postback.payload) {
      let payload = event.postback.payload
      if (payload === 'INTRO_MIGRANT') {
        sendTextMessage(sender, "Welcome to Sweden.", () => {
          sendTextMessage(sender, "We are going to find a buddy for you that will help you with finding your daily routine, but first we need a couple of informations about you.", () => {
            sendButtonMessage(sender, "It seems like you speak $language, do you also want to select a second language that you feel comfortable speaking in?", [{
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
          })
        })
        return
      }
      if (payload.startsWith('MIGRANT_LANGUAGE_')) {
        sendTextMessage(sender, "Cool. We also need your location, so we can find a buddy close to you.", () => {
          sendQuickReplyMessage(sender, "Please share your location:", [{ content_type: "location" }])
        })
      }
      if (payload === 'INTRO_SWEDE') {
        sendTextMessage(sender, "Cool. We are looking for buddies that we can match up with newly arrived people to Sweden.", () => {
          sendButtonMessage(sender, "Do you want to join?", [{
            "type":"postback",
            "title":"Yes!",
            "payload":"SWEDE_YES"
          }])
        })
      }
    }
  })
  res.sendStatus(200)
})

// Spin up the server
app.listen(app.get('port'), () => {
  console.log('running on port', app.get('port'))
})

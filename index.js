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

const sendTextMessage = (sender, text) => {
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

const sendGenericMessage = (sender) => {
  let messageData = {
    "attachment": {
      "type": "template",
      "payload": {
        "template_type": "generic",
        "elements": [{
          "title": "First card",
          "subtitle": "Element #1 of an hscroll",
          "image_url": "http://messengerdemo.parseapp.com/img/rift.png",
          "buttons": [{
            "type": "web_url",
            "url": "https://www.messenger.com",
            "title": "web url"
          }, {
            "type": "postback",
            "title": "Postback",
            "payload": "Payload for first element in a generic bubble",
          }],
        }, {
          "title": "Second card",
          "subtitle": "Element #2 of an hscroll",
          "image_url": "http://messengerdemo.parseapp.com/img/gearvr.png",
          "buttons": [{
            "type": "postback",
            "title": "Postback",
            "payload": "Payload for second element in a generic bubble",
          }],
        }]
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
    if (event.postback && event.postback.payload) {
      let payload = event.postback.payload
      if (payload === 'INTRO_MIGRANT') {
        sendTextMessage(sender, "Welcome to Sweden.")
        sendTextMessage(sender, "We are going to find a buddy for you that will help you with finding your daily routine, but first we need a couple of informations about you.")

        sendButtonMessage(sender, "What are you looking for?", [{
          "type":"postback",
          "title":"Nearest job office",
          "payload":"MIGRANT_ARBETSFORMEDLINGEN"
        }, {
          "type":"postback",
          "title":"Nearest tax office",
          "payload":"MIGRANT_SKATTEVERKET"
        }])
        return
      }
      if (payload === 'INTRO_SWEDE') {
        sendTextMessage(sender, "Cool. We are looking for buddies that we can match up with newly arrived people to Sweden.")
        sendButtonMessage(sender, "Do you want to join?", [{
          "type":"postback",
          "title":"Yes!",
          "payload":"SWEDE_YES"
        }])
      }
    }
    if (event.message && event.message.text) {
      let text = event.message.text
      if (text === 'Generic') {
        sendGenericMessage(sender)
        return
      }
      getUserData(sender);
      sendTextMessage(sender, "Hej du!")
      sendButtonMessage(sender, "Did you recently come to Sweden or are you a native?", [{
        "type":"postback",
        "title":"I'm a migrant!",
        "payload":"INTRO_MIGRANT"
      }, {
        "type":"postback",
        "title":"I'm a Swede!",
        "payload":"INTRO_SWEDE"
      }])
    }
  })
  res.sendStatus(200)
})

// Spin up the server
app.listen(app.get('port'), () => {
  console.log('running on port', app.get('port'))
})

'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const sendMessage = require(__dirname + '/sendMessages.js')
const question = require(__dirname + '/questions.js')
const app = express()
const token = process.env.FB_PAGE_ACCESS_TOKEN

let users = []

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
    let user = users.find((user) => user.fbId === sender)
    if (!user) {
      sendMessage.userdata(sender, (user) => {
        users.push({
          firstName: user.first_name,
          lastName: user.last_name,
          fbId: sender,
          lastStep: 0,
        })
      });
    }
    console.log(event)

    if (event.message && event.message.text) {
      let text = event.message.text
      switch (user.lastStep) {
        case 0:
          sendMessage.text(sender, "Hej du!", () => {
            sendMessage.button(sender, "Did you recently come to Sweden or are you a native?", [{
              "type":"postback",
              "title":"I'm a migrant!",
              "payload":"INTRO_MIGRANT"
            }, {
              "type":"postback",
              "title":"I'm a Swede!",
              "payload":"INTRO_SWEDE"
            }])
          })
          return
        case 'INTRO_MIGRANT':
          sendMessage.text(sender, "Hej du!", () => {
            sendMessage.button(sender, "Did you recently come to Sweden or are you a native?", [{
              "type":"postback",
              "title":"I'm a migrant!",
              "payload":"INTRO_MIGRANT"
            }, {
              "type":"postback",
              "title":"I'm a Swede!",
              "payload":"INTRO_SWEDE"
            }])
          })
          return
      }
    }

    if (event.postback && event.postback.payload) {
      let payload = event.postback.payload
      if (payload === 'INTRO_MIGRANT') {
        user.lastStep = 'INTRO_MIGRANT'
        sendMessage.text(sender, "Welcome to Sweden.", () => {
          sendMessage.text(sender, "We are going to find a buddy for you that will help you with finding your daily routine, but first we need a couple of informations about you.", () => {
            question.language(sender)
          })
        })
        return
      }
      if (payload.startsWith('MIGRANT_LANGUAGE_')) {
        user.lastStep = 'MIGRANT_LANGUAGE'
        sendMessage.text(sender, "Cool. We also need your location, so we can find a buddy close to you.", () => {
          question.location(sender)
        })
      }
      if (payload === 'INTRO_SWEDE') {
        user.lastStep = 'INTRO_SWEDE'
        sendMessage.text(sender, "Cool. We are looking for buddies that we can match up with newly arrived people to Sweden.", () => {
          question.consent(sender)
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

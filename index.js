'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const sendMessage = require(__dirname + '/sendMessages.js')
const app = express()
const token = process.env.FB_PAGE_ACCESS_TOKEN

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

    if (event.attachments && event.attachments[0].type === 'location') {
      let coordinates = event.attachments[0].payload.coordinates
      sendMessage.text(sender, "Thanks. We will send you a message once we have found your buddy!", () => {
        console.log('Went through everything \o/')
      })
    }
    if (event.message && event.message.text) {
      let text = event.message.text
      sendMessage.userdata(sender);
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
    }
    if (event.postback && event.postback.payload) {
      let payload = event.postback.payload
      if (payload === 'INTRO_MIGRANT') {
        sendMessage.text(sender, "Welcome to Sweden.", () => {
          sendMessage.text(sender, "We are going to find a buddy for you that will help you with finding your daily routine, but first we need a couple of informations about you.", () => {
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
          })
        })
        return
      }
      if (payload.startsWith('MIGRANT_LANGUAGE_')) {
        sendMessage.text(sender, "Cool. We also need your location, so we can find a buddy close to you.", () => {
          sendMessage.quickreply(sender, "Please share your location:", [{ content_type: "location" }])
        })
      }
      if (payload === 'INTRO_SWEDE') {
        sendMessage.text(sender, "Cool. We are looking for buddies that we can match up with newly arrived people to Sweden.", () => {
          sendMessage.button(sender, "Do you want to join?", [{
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

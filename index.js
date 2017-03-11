'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const sendMessage = require(__dirname + '/sendMessages.js')
const question = require(__dirname + '/questions.js')
const information = require(__dirname + '/information.js')
const app = express()
const token = process.env.FB_PAGE_ACCESS_TOKEN

let users = {}

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
  if (req.query['hub.verify_token'] === 'hack_for_sweden_team_open_sunshine') {
    res.send(req.query['hub.challenge'])
  }
  res.send('Error, wrong token')
})

const processMessage = (sender, event, user) => {
  if (event.message && event.message.text) {
    let text = event.message.text
    switch (user.lastStep) {
      case 'FIRST_MESSAGE':
        user.lastStep = 'FIRST_QUESTION'
        sendMessage.text(sender, "Hej du!", () => {
          question.role(sender)
        })
        return
      case 'FIRST_QUESTION':
        sendMessage.text(sender, "Sorry, I didn't understand.", () => {
          question.role(sender)
        })
        return
    }
  }

  if (event.postback && event.postback.payload) {
    let payload = event.postback.payload
    switch (payload) {
      case 'INTRO_MIGRANT':
        user.lastStep = 'INTRO_MIGRANT'
        sendMessage.text(sender, "Welcome to Sweden.", () => {
          question.purpose(sender)
        })
        return
      case 'MIGRANT_BUDDY':
        sendMessage.text(sender, "We are going to find a buddy for you that will help you with finding your daily routine, but first we need a couple of informations about you.", () => {
          question.language(sender, user.language.join(' and '))
        })
        return
      case 'MIGRANT_INFORMATION':
        information(sender, event, user)
        return
      case 'INTRO_SWEDE':
      user.lastStep = 'INTRO_SWEDE'
        sendMessage.text(sender, "Cool. We are looking for buddies that we can match up with newly arrived people to Sweden.", () => {
          question.consent(sender)
        })
        return
    }


    if (payload.startsWith('MIGRANT_LANGUAGE_')) {
      let language = payload.split('MIGRANT_LANGUAGE_')[1]
      if (!user.language.find(language)) { user.language.push(language) }
      user.lastStep = 'MIGRANT_LANGUAGE'
      sendMessage.text(sender, "Cool. We also need your location, so we can find a buddy close to you.", () => {
        question.location(sender)
      })
    }
  }
}

// do things
app.post('/webhook/', (req, res) => {
  let messaging_events = req.body.entry[0].messaging
  messaging_events.map((event) => {
    let sender = event.sender.id
    let user
    if (!users[sender]) {
      sendMessage.userdata(sender, (fbUser) => {
        fbUser = fbUser.json()
        console.log(fbUser, fbUser.first_name, fbUser.locale)
        users[sender] = {
          firstName: fbUser.first_name,
          lastName: fbUser.last_name,
          language: [fbUser.locale],
          lastStep: 'FIRST_MESSAGE',
        }
        user = users[sender]
        processMessage(sender, event, user)
      });
    } else {
      user = users[sender]
      processMessage(sender, event, user)
    }
  })
  res.sendStatus(200)
})

// Spin up the server
app.listen(app.get('port'), () => {
  console.log('running on port', app.get('port'))
})

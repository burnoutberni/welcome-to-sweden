'use strict'

const BootBot = require('bootbot');
const languages = require(__dirname + '/ISOlanguage.json')

const bot = new BootBot({
  accessToken: process.env.FB_PAGE_ACCESS_TOKEN,
  verifyToken: process.env.FB_VERIFY_TOKEN,
  appSecret: process.env.FB_APP_SECRET
});

let users = {}

const askRole = (convo) => {
  convo.ask((convo) => {
    const buttons = [
      { type: 'postback', title: `I'm a migrant`, payload: 'INTRO_MIGRANT'},
      { type: 'postback', title: `I'm a Swede`, payload: 'INTRO_SWEDE'}
    ]
    convo.sendButtonTemplate(`Did you recently come to Sweden or are you a native?`, buttons)
  }, (payload) => {
    console.log(payload)
  }, [
    {
      event: 'postback:INTRO_MIGRANT',
      callback: (payload, convo) => {
        convo.set('role', 'migrant')
        convo.say('Welcome to Sweden.').then(() => askPurpose(convo));
      }
    },
    {
      event: 'postback:INTRO_SWEDE',
      callback: (payload, convo) => {
        convo.set('role', 'swede')
        convo.say('Cool. We are looking for buddies that we can match up with newly arrived people to Sweden.').then(() => askConsent(convo));
      }
    },
  ])
}

const askPurpose = (convo) => {
  convo.ask((convo) => {
    const buttons = [
      { type: 'postback', title: `Job information`, payload: 'MIGRANT_INFORMATION'},
      { type: 'postback', title: `Find me a buddy`, payload: 'MIGRANT_BUDDY'}
    ]
    convo.sendButtonTemplate(`Do you want to find information about job seeking in Sweden or do you want to be connected to a buddy?`, buttons)
  }, (payload) => {
    console.log(payload)
  }, [
    {
      event: 'postback:MIGRANT_INFORMATION',
      callback: (payload, convo) => {
        // todo
      }
    },
    {
      event: 'postback:MIGRANT_BUDDY',
      callback: (payload, convo) => {
        convo.say('We are going to find a buddy for you that will help you with finding your daily routine, but first we need a couple of informations about you.').then(() => askLanguage(convo))
      }
    },
  ])
}

const askLanguage = (convo) => {
  const englishLanguageNames = languages.filter((language) => language.code === convo.get('languages'))
    .map((language) => language.name)

  convo.ask(`Do you speak any other language than ${englishLanguageNames.join(' and ')}?`, (payload, convo, data) => {
    const text = payload.message.text.toLowerCase()
    const addedLanguage = languages.find((language) => {
      return language.name.toLowerCase() === text
        || language.nativeName.toLowerCase() === text
    })
    convo.set('language', [convo.get('language'), addedLanguage.code])
    convo.say('Cool. We also need your location, so we can find a buddy close to you').then(() => askLocation(convo))
  })
}

const askLocation = (convo) => {
  //quickReplies: {"content_type": "location"}
  convo.say({
    text: 'Where do you live?',
    quickReplies: { content_type: "location" }
  })

  convo.ask('Where do you live?', (payload, convo) => {
    const text = payload.message.text
    console.log(payload)
    convo.say(`Got it, your favorite food is ${text}`).then(() => sendSummary(convo));
  })/*, [
    {
      event: 'quick_reply',
      callback: (payload, convo) => {
        console.log(payload, convo)
        convo.say(`Ok, here's what you told me about you:
        - Name: ${convo.get('name')}
        - Favorite Food: ${convo.get('food')}
        - Gender: ${convo.get('gender')}
        - Age: ${convo.get('age')}`).then(() => {
          convo.say('I will send you a message when we found your buddy!')
          convo.end()
        })
      }
    }
  ])*/
}

const sendSummary = (convo) => {
  convo.say('yolo')
  convo.end()
}

bot.hear('hello', (payload, chat) => {
  chat.getUserProfile().then((user) => {
    chat.conversation((convo) => {
      convo.set('first_name', user.first_name)
      convo.set('languages', user.locale.split('_')[0])
      chat.say(`Hello, ${user.first_name}!`).then(() => askRole(convo))
    })
  })
})

bot.start(process.env.PORT || 3000)

'use strict'

const BootBot = require('bootbot');
const languages = require(__dirname + '/ISOlanguage.json')
const fetch = require('node-fetch')

const bot = new BootBot({
  accessToken: process.env.FB_PAGE_ACCESS_TOKEN,
  verifyToken: process.env.FB_VERIFY_TOKEN,
  appSecret: process.env.FB_APP_SECRET
});

let users = []

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
        convo.say('Sure, no problem!').then(() => askService(convo))
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
    if (addedLanguage) {
      convo.set('languages', [convo.get('languages'), addedLanguage.code])
    }
    convo.say('Cool. We also need your location, so we can find a buddy close to you').then(() => askLocation(convo, (payload) => {
      const languageCodes = convo.get('languages')
      const allEnglishLanguageNames = languages.filter((language) => convo.get('languages').indexOf(language.code) !== -1)
        .map((language) => language.name)
        .join(' and ')
      const coordinates = payload.message.attachments[0].payload.coordinates
      fetch(`http://nominatim.openstreetmap.org/reverse?format=json&lat=${coordinates.lat}&lon=${coordinates.long}`)
        .then(res => res.json())
        .then(json => {
          const userId = payload.sender.id
          users = users.filter((user) => user.fbId !== userId)
          users.push({
            fbId: userId,
            role: convo.get('role'),
            name: convo.get('first_name'),
            profile_pic: convo.get('profile_pic'),
            location: {
              lat: coordinates.lat,
              long: coordinates.long,
              display_name: json.display_name,
            },
            languages: convo.get('languages'),
          })
          convo.say(`Ok, here's what you told me about you:
          - Name: ${convo.get('first_name')}
          - Languages: ${allEnglishLanguageNames}
          - Location: ${json.display_name}`).then(() => {
            let buddy;
            if (users.length > 1) {
              buddy = users.find((user) => user.fbId !== userId)
            }
            if (buddy) {
              convo.say(`I found a buddy for you!`).then(() => {
                convo.say(`This is ${buddy.first_name}:`)
                convo.sendAttachment('image', buddy.profile_pic)
              })
            } else {
              convo.say('I will send you a message when we found your buddy!')
            }
            convo.end()
          })
        })
    }))
  })
}

const askLocation = (convo, callback) => {
  convo.ask({
    text: 'Where do you live?',
    quickReplies: [{ content_type: "location" }]
  }, (payload) => {
    console.log(payload)
  }, [
    {
      event: 'attachment',
      callback: (payload) => callback(payload)
    }
  ])
}

const askService = (convo) => {
  convo.ask((convo) => {
    const buttons = [
      { type: 'postback', title: `Closest job agency`, payload: 'MIGRANT_INFO_JOB_AGENCY'}
    ]
    convo.sendButtonTemplate(`Here's what I can find for you`, buttons)
  }, (payload) => {
    console.log(payload)
  }, [
    {
      event: 'postback:MIGRANT_INFO_JOB_AGENCY',
      callback: (payload, convo) => {
        convo.say('Sure, no problem!').then(() => askLocation(convo, (payload) => {
          convo.say(`Ok, here's the closest job agency`)
          convo.end()
        }))
      }
    }
  ])
}

const askConsent = (convo) => {
  convo.ask((convo) => {
    const buttons = [
      { type: 'postback', title: `Yes!`, payload: 'SWEDE_YES'}
    ]
    convo.sendButtonTemplate(`Do you want to join?`, buttons)
  }, (payload) => {
    console.log(payload)
  }, [
    {
      event: 'postback:SWEDE_YES',
      callback: (payload, convo) => {
        convo.say('Awesome!').then(() => askLanguage(convo))
      }
    }
  ])
}

const sendSummary = (convo) => {
  convo.say('yolo')
  convo.end()
}

bot.hear('hello', (payload, chat) => {
  chat.getUserProfile().then((user) => {
    chat.conversation((convo) => {
      convo.set('profile_pic', user.profile_pic)
      convo.set('first_name', user.first_name)
      convo.set('languages', user.locale ? user.locale.split('_')[0] : '')
      chat.say(`Hello, ${user.first_name}!`).then(() => askRole(convo))
    })
  })
})

bot.start(process.env.PORT || 3000)

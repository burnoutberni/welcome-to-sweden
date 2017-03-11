const request = require('request')
const token = process.env.FB_PAGE_ACCESS_TOKEN

const sendUserDataRequest = (sender, callback) => {
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
      callback(body);
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

module.exports = {
  userdata: sendUserDataRequest,
  text: sendTextMessage,
  quickreply: sendQuickReplyMessage,
  button: sendButtonMessage,
}

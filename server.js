/*

Simple Translation Bot

This bot translates Slack messages from German to English

v0.1 - 20 June 2017

created by Eric Mueller, eric@ericmueller.org

For use on BeepBoop platfom

 */

'use strict'

const express = require('express')
const Slapp = require('slapp')
const ConvoStore = require('slapp-convo-beepboop')
const Context = require('slapp-context-beepboop')
const unirest = require('unirest');
const slack = require('slack')
const jsonfile = require('jsonfile')

const CONFIG = require('config.json')('./conf.json');

// use `PORT` env var on Beep Boop - default to 3000 locally
var port = process.env.PORT || 3000

var slapp = Slapp({
  // Beep Boop sets the SLACK_VERIFY_TOKEN env var
  verify_token: process.env.SLACK_VERIFY_TOKEN,
  convo_store: ConvoStore({ debug: true }),
  context: Context()
})



//* ********************************************
// Setup different handlers for messages
//* ********************************************


// translate the most recent x messages

slapp.command('/tron', /(.*)/, (msg, text, match) => {
  let token = CONFIG.slack_token; // msg.meta.app_token
  // let channel = msg.body.event.channel;
  let channel = msg.body.channel_id;

  var v = 0;

  // want to use https://api.slack.com/methods/channels.history/test API call here
  slack.channels.history({token, channel}, (err, data) => {

    // walk through each message and translate it
    for (let s of data.messages) {

      // console.log("\n\n------------------");
      console.log(s);
/
      // add the translation as a reply to this individual message
      var reply_thread = s.ts;
      // console.log("reply thread is "+s.ts)

      if (s.subtype != 'bot_message' && s.subtype != 'channel_join') {

        var m = JSON.stringify(s.text)

        console.log("\n\n\n message after stringify "+m);

        // translate it with Yandex - not as good as Google Translate, but it's free!
        // see https://tech.yandex.com/translate/doc/dg/reference/translate-docpage/

        // TODO let the user specify source and target languages
        var headers = {'accept' : "json"};
        var post = 'https://translate.yandex.net/api/v1.5/tr.json/translate?lang=en&key=' + CONFIG.yandex_api_key + '&text=' + encodeURIComponent(m);

        unirest.get(post, headers, function(res) {

          console.log("\n\n\n result body is:");
          console.log(res.body);

          // now we have translated message - pull it out and remove quotes around it that stringify adds
          var translated = JSON.stringify( res.body.text[0] ).replace(/^"(.+)"$/,'$1');

          // console.log("\n\n\n translated 1 = "+translated);

          // unescape double quotes and remove from start and end of string
          translated = translated.replace(/\\\"/g, "\"");
          // console.log("\n\n\n translated 2 = "+translated);

          // remove double slash to single slash
          translated = translated.replace(/\\\\/g, "\\");
          // console.log("\n\n\n translated 3 = "+translated);

          // and finally remove any other double quotes enclosing the whole thing
          translated = translated.replace(/^"(.+)"$/, '$1')
          // console.log("\n\n\n translated LAST = "+translated);

          translated = translated.replace(/\\n/g, '\n')
          // console.log("\n\n\n translated LAST = "+translated);

          // console.log("\n\n\n");
          // console.log(translated);

          // post it to slack
          // TODO - see if translation was already posted and if so, don't post it again

          // translated = "Kartoffel\nGross Kartoffel"

          // console.log(translated);

          // set up correct emoji flag to show source lang
          var langcode = res.body.lang.substring(0,2);  // get source language like "de" or "en"
          var flag = langcode;
          if(flag == 'en') flag = 'us';

          msg.say({
            text: translated + "\n_(from " + langcode.toUpperCase() + " :flag-" + flag + ":)_",
            thread_ts: reply_thread,
          })
        } )

        // did we get enough valid messages?
        v++;
        if (v == parseInt(match)) break;    // yes - get out of the loop
      }
    }

  })
})

/*


// response to the user typing "help"
slapp.message('help', ['mention', 'direct_message'], (msg) => {
  msg.say(`TESTING ${HELP_TEXT}`)
})


 // "Conversation" flow that tracks state - kicks off when user says hi, hello or hey
slapp
  .message('^(hi|hello|hey)$', ['direct_mention', 'direct_message'], (msg, text) => {
    msg
      .say(`${text}, how are you?`)
      // sends next event from user to this route, passing along state
      .route('how-are-you', { greeting: text })
  })
  .route('how-are-you', (msg, state) => {
    let text = (msg.body.event && msg.body.event.text) || ''

    // user may not have typed text as their next action, ask again and re-route
    if (!text) {
      return msg
        .say("Whoops, I'm still waiting to hear how you're doing.")
        .say('How are you?')
        .route('how-are-you', state)
    }

    // add their response to state
    state.status = text

    msg
      .say(`Ok then. What's your favorite color?`)
      .route('color', state)
  })
  .route('color', (msg, state) => {
    var text = (msg.body.event && msg.body.event.text) || ''

    // user may not have typed text as their next action, ask again and re-route
    if (!text) {
      return msg
        .say("I'm eagerly awaiting to hear your favorite color.")
        .route('color', state)
    }

    // add their response to state
    state.color = text

    msg
      .say('Thanks for sharing.')
      .say(`Here's what you've told me so far: \`\`\`${JSON.stringify(state)}\`\`\``)
    // At this point, since we don't route anywhere, the "conversation" is over
  })

// Can use a regex as well
slapp.message(/^(thanks|thank you)/i, ['mention', 'direct_message'], (msg) => {
  // You can provide a list of responses, and a random one will be chosen
  // You can also include slack emoji in your responses
  msg.say([
    "You're welcome :smile:",
    'You bet',
    ':+1: Of course',
    'Anytime :sun_with_face: :full_moon_with_face:'
  ])
})

// demonstrate returning an attachment...
slapp.message('attachment', ['mention', 'direct_message'], (msg) => {
  msg.say({
    text: 'Check out this amazing attachment! :confetti_ball: ',
    attachments: [{
      text: 'Slapp is a robust open source library that sits on top of the Slack APIs',
      title: 'Slapp Library - Open Source',
      image_url: 'https://storage.googleapis.com/beepboophq/_assets/bot-1.22f6fb.png',
      title_link: 'https://beepboophq.com/',
      color: '#7CD197'
    }]
  })
})

// Catch-all for any other responses not handled above
slapp.message('.*', ['direct_mention', 'direct_message'], (msg) => {
  msg.say(`You said ${JSON.stringify(msg)}`)

  // respond only 40% of the time
  if (Math.random() < 0.4) {
    msg.say([':wave:', ':pray:', ':raised_hands:'])
  }
})
*/



// attach Slapp to express server
var server = slapp.attachToExpress(express())

// start http server
server.listen(port, (err) => {
  if (err) {
    return console.error(err)
  }

  console.log(`Listening on port ${port} - local`)
})

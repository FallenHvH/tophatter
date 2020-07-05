const urban = require('urban-dictionary');
const fs = require('fs');
const functions = require('../Shared/functions.js');
const settings = require('../../bot-files/settings.json');
const extras = require('../../bot-files/extras.json')

module.exports = {
  name: 'urban',
  aliases: ['urb', 'dict', 'dictionary'],
  catagory: 'general',
  description: 'Look up a word in the urban dictionary',
  usage: '[word]',
  execute(client, conn, message, args, defaultEmbedColor, defaultEmbedErrorColor, authorizedAdmin) {
    if (args.length < 1) {
      urban.random((err, word) => {
        message.channel.send({embed: {
          color: defaultEmbedColor,
          title: word.word,
          url: word.permalink,
          fields: [{
            name: '**Definition**',
            value: `*${word.definition}*`
          },
          {
            name: '**Author**',
            value: `*${word.author}*`
          }
          ],
          footer: {
            icon_url: client.user.avatarURL,
            text: `${word.thumbs_up} 👍 | ${word.thumbs_down} 👎`
          }
        }})
      })
    } else {
      urban.term(args.join(' '), (err, word) => {
        message.channel.send({embed: {
          color: defaultEmbedColor,
          title: word[0].word,
          url: word[0].permalink,
          fields: [{
            name: '**Definition**',
            value: `*${word[0].definition}*`
          },
          {
            name: '**Author**',
            value: `*${word[0].author}*`
          }
          ],
          footer: {
            icon_url: client.user.avatarURL,
            text: `${word[0].thumbs_up} 👍 | ${word[0].thumbs_down} 👎`
          }
        }})
      })
    }
  }
}

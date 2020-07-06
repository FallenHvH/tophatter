const fs = require('fs');
const functions = require('../Shared/functions.js');
const settings = require('../../bot-files/settings.json');
const extras = require('../../bot-files/extras.json')

var people = [
  '[Gabriel Tanner](https://gabrieltanner.org/blog/dicord-music-bot) - Music code',
  '{TheSourceCode} - Restructure video on modules (allows for faster updates and better commands)',
  '[SilentImp](https://stackoverflow.com/users/1266725/silentimp)',
  '[jarmod](https://stackoverflow.com/users/271415/jarmod)'
]

module.exports = {
  name: 'thanks',
  aliases: ['people'],
  catagory: 'general',
  description: 'Show who helped create the bot',
  usage: '',
  async execute(client, conn, message, args, defaultEmbedColor, defaultEmbedErrorColor, authorizedAdmin) {
    message.channel.send({embed: {
      title: 'Thanks to the following people!',
      color: defaultEmbedColor,
      description: people.join('\n')
    }})
  }
}

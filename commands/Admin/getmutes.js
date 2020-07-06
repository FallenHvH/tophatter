const fs = require('fs');
const functions = require('../Shared/functions.js');
const settings = require('../../bot-files/settings.json');
const extras = require('../../bot-files/extras.json')

var timeout = 120; // seconds until it is deleted

module.exports = {
  name: 'getmutes',
  aliases: [],
  catagory: 'admin',
  description: 'Get the current people muted',
  usage: '',
  execute(client, conn, message, args, defaultEmbedColor, defaultEmbedErrorColor, authorizedAdmin) {
    message.channel.send({embed: {
    title: `User(s) muted in ${message.guild.name}`,
    color: defaultEmbedColor,
    fields: [{
      name: 'Number of users muted',
      value: message.guild.roles.find(r => r.name === 'muted').members.size
    },
    {
      name: 'Users',
      value: message.guild.roles.find(r => r.name === 'muted').members.map(m => m.user.tag).join('\n').substring(0, 1000)
    }
    ]
    }})
    .then(msg => {
      setTimeout(() => {
        msg.delete()
      }, timeout * 1000)
    })
  }
}

const fs = require('fs');
const functions = require('../Shared/functions.js');
const settings = require('../../bot-files/settings.json');
const extras = require('../../bot-files/extras.json')

module.exports = {
  name: 'serverinfo',
  aliases: ['info', 'svinfo'],
  catagory: 'general',
  description: 'Get server information',
  usage: '',
  execute(client, conn, message, args, defaultEmbedColor, defaultEmbedErrorColor, authorizedAdmin) {
    message.channel.send({embed: {
      title: `About ${message.guild.name}`,
      color: defaultEmbedColor,
      fields: [{
        name: 'Server name',
        value: message.guild.name
      },
      {
        name: 'Server ID',
        value: message.guild.id
      },
      {
        name: 'Online user count',
        value: message.guild.members.size
      },
      {
        name: 'Created',
        value: message.guild.createdAt.toString().substring(4, 15)
      },
      {
        name: 'Owner',
        value: `<@${message.guild.ownerID}>`
      },
      ],
      footer: {
        icon_url: client.user.avatarURL,
        text: extras.footerMsg[Math.floor(Math.random() * extras.footerMsg.length - 1)]
      }
    }})
  }
}

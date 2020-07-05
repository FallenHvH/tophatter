const fs = require('fs');
const functions = require('../Shared/functions.js');
const settings = require('../../bot-files/settings.json');
const extras = require('../../bot-files/extras.json')

module.exports = {
  name: 'clearmutes',
  aliases: [],
  catagory: 'admin',
  description: 'Clear all of the server mutes',
  usage: '',
  execute (client, conn, message, args, defaultEmbedColor, defaultEmbedErrorColor, authorizedAdmin) {
    try {
      let r = message.guild.roles.find(r => r.name === 'muted')

      message.guild.members.forEach(m => {
        if (m.roles.has(r.id)) {
          m.removeRole(r.id)
          m.setMute(false, `<@${message.author.id}> cleared mute for <@${m.id}>`)
        }
      })

      functions.deletingEmbed(client, 'Cleared mutes', '', defaultEmbedColor, message.channel.id)
    } catch (err) {
      // lmao
    }
  }
}

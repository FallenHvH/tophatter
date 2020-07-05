const fs = require('fs');
const functions = require('../Shared/functions.js');
const settings = require('../../bot-files/settings.json');
const extras = require('../../bot-files/extras.json')

module.exports = {
  name: 'getblacklist',
  aliases: [],
  catagory: 'hidden',
  description: 'Get a list of users that are banned from using the bot',
  usage: '',
  async execute(client, conn, message, args, defaultEmbedColor, defaultEmbedErrorColor, authorizedAdmin) {
    try {
      let data = fs.readFileSync('./bot-files/extras.json');
      let ids = [];

      let parsed = JSON.parse(data)
      for (i = 0;i < parsed.blacklistedIDs.length;i++) {

        let user;

        if (client.users.get(parsed.blacklistedIDs[i]) == undefined) {
          user = 'Failed to find profile'
        } else {
          user = `${client.users.get(parsed.blacklistedIDs[i]).username}#${client.users.get(parsed.blacklistedIDs[i]).discriminator}`
        }

        ids.push(`[${parsed.blacklistedIDs[i]}] ${user}`)
      }

      message.channel.send({embed: {
        title: 'Blacklisted Users',
        color: defaultEmbedColor,
        description: `\`\`\`${ids.join('\n')}\`\`\``
      }})
    } catch (err) {
      functions.errorLog(err, 'Get blacklist')
    }
  }
}

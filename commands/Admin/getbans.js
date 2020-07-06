const fs = require('fs');
const functions = require('../Shared/functions.js');
const settings = require('../../bot-files/settings.json');
const extras = require('../../bot-files/extras.json')

var list;

module.exports = {
	name: 'getbans',
	aliases: [],
  catagory: 'admin',
  description: 'Calls and organizes a list of bans of the current server',
  usage: '',
	async execute(client, conn, message, args, defaultEmbedColor, defaultEmbedErrorColor, authorizedAdmin) {
  
  await message.guild.fetchBans().then(bans => {
    list = bans.map(u => u.username + "#" + u.discriminator)

    console.log(list.join("\n"))
  })

  if (list.length > 0) {

			message.channel.send({embed: {
				title: `There are ${list.length} users banned:`,
				color: defaultEmbedColor,
				description: list.join("\n"),
				footer: {
          icon_url: client.user.avatarURL,
          text: extras.footerMsg[Math.floor(Math.random() * extras.footerMsg.length - 1)]
        }
			}})
		} else {
			message.channel.send({embed: {
				title: 'There are no users banned! 😉',
				color: defaultEmbedColor,
				footer: {
          icon_url: client.user.avatarURL,
          text: extras.footerMsg[Math.floor(Math.random() * extras.footerMsg.length - 1)]
        }
			}})
		}
	}
}

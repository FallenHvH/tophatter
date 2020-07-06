const fs = require('fs');
const functions = require('../Shared/functions.js');
const settings = require('../../bot-files/settings.json');
const extras = require('../../bot-files/extras.json')

module.exports = {
	name: 'clear',
	aliases: ['c'],
  catagory: 'admin',
  description: 'Bulk deletes messages under 2 weeks age',
  usage: '[count]',
 	execute(client, sql, message, args, defaultEmbedColor, defaultEmbedErrorColor, authorizedAdmin) {
		if (authorizedAdmin) {
			if (args[0] == undefined) {
				var number = 100;
			} else {
				if (!isNaN(args[0])) {
					var number = args[0];
				} else {
					functions.deletingEmbed(client, 'Insert a number', 'You need to specify a valid number of messages to delete!', defaultEmbedErrorColor, message.channel.id)
				}
			}

			try {
				message.channel.bulkDelete(number)
			} catch (err) {
				// oh well lmao (would be caused because of older messages)
			}
		} else {
			functions.permissionMissing(client, defaultEmbedErrorColor, message.channel.id)
		}
	}
}

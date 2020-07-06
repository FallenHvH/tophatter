const fs = require('fs');
const functions = require('../Shared/functions.js');
const settings = require('../../bot-files/settings.json');
const extras = require('../../bot-files/extras.json');
const { RichEmbed } = require('discord.js');

module.exports = {
  name: 'invite',
  aliases: ['inv'],
  catagory: 'general',
  description: 'Get an invite code for the bot',
  usage: '',
  execute(client, conn, message, args, defaultEmbedColor, defaultEmbedErrorColor, authorizedAdmin) {
    try {
      client.generateInvite('ADMINISTRATOR').then(link => {
        let embed = new RichEmbed()
          .setDescription(`[👌 Invite link 👌](${link})`)
          .setColor(defaultEmbedColor)
          .setFooter(functions.randomFooter(),client.user.avatarURL)
        message.channel.send(embed)
      })
      .then(() => {
        console.log(`[${functions.getTime()}]: Generated invite for ${message.author.username}#${message.author.discriminator}`);
      })
    } catch (err) {
      functions.errorLog(err, 'Generating invite')
    }
  }
}

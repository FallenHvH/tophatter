const fs = require('fs');
const functions = require('../Shared/functions.js');
const settings = require('../../bot-files/settings.json');
const extras = require('../../bot-files/extras.json')
const { RichEmbed } = require( "discord.js" )

module.exports = {
  name: 'resetserver', // this is so a server owner can completely reset a server
  aliases: ['rsserver'],
  catagory: 'server owner',
  description: 'Delete everything from the server (triggers confirmation)',
  usage: '',
  execute(client, conn, message, args, defaultEmbedColor, defaultEmbedErrorColor, authorizedAdmin) {
    if ( (message.guild.ownerID !== message.author.id) && (message.author.id !== settings.botOwnerID) ) return functions.permissionMissing(client, defaultEmbedErrorColor, message.channel.id);
    let embed = new RichEmbed()
      .setTitle( "Confirmation" )
      .setColor( defaultEmbedColor )
      .setDescription( "Are you sure you want to purge the server?" )
      .addField( "Things this will do", "Remove all channels and roles\nStrip ranks from everyone" )
      .setFooter( functions.randomFooter(), client.user.avatarURL )

    message.channel.send(embed)
    .then(async msg => {
      await msg.react(settings.acceptEmoji);
      await msg.react(settings.declineEmoji);

      const filter = (r, u) => [settings.acceptEmoji, settings.declineEmoji].includes(r.emoji.name) && u.id == message.author.id
      const collector = msg.createReactionCollector(filter, {time: settings.reactionWaitTime * 1000})

      collector.on('collect', r => {
        if (r.emoji.name === settings.acceptEmoji) {
          console.log(`[${functions.getTime()}]: Resetting server ${message.guild.id}:${message.guild.name}`);

          try {
            message.guild.channels.forEach(channel => channel.delete())
          } catch (err) {
            functions.errorLog(err, 'Server reset (Deleting channels)')
          }

          try {
            message.guild.roles.forEach(role => role.delete())
          } catch (err) {
            functions.errorLog(err, 'Server reset (Deleting roles)')
          }

          console.log(`[${functions.getTime()}]: Finished reset on server ${message.guild.id}:${message.guild.name}`);
        } else if (r.emoji.name === settings.declineEmoji) {
          msg.clearReactions()
          let embed = new RichEmbed()
            .setTitle( "Action canceled." )
            .setColor( defaultEmbedErrorColor )
            .setDescription( "Server reset was canceled" )
            .setFooter( functions.randomFooter(), client.user.avatarURL )

          msg.edit(embed)
          .then(() => {
            setTimeout(msg => {
              msg.delete()
            }, settings.deletingEmbedTimeout * 1000)
          })
        }
      })
    })
  }
}

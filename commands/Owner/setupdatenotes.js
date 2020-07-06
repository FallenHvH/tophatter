const fs = require('fs');
const functions = require('../Shared/functions.js');
const settings = require('../../bot-files/settings.json');
const extras = require('../../bot-files/extras.json');
const { RichEmbed } = require("discord.js")

const v = require('../../version.json')

var ver;

module.exports = {
  name: 'setupdate',
  aliases: [],
  catagory: 'hidden',
  description: 'Update update.txt to whatever',
  usage: '<notes>',
  execute(client, conn, message, args, defaultEmbedColor, defaultEmbedErrorColor, authorizedAdmin) {
    if (true) {
      if (settings.botOwnerID == message.author.id) {
        const args2 = message.origContent.split(" ")
        args2.shift()

        let embed = new RichEmbed()
          .setTitle( "Set update notes" )
          .setColor( defaultEmbedColor )
          .setDescription( `Are you sure you want to set the update to the following: \n\n${args2.join( " " )}\n\n${settings.acceptEmoji} - Accept\n${settings.declineEmoji} - Decline` )
          .setFooter( functions.randomFooter(), client.user.avatarURL )
          .setTimestamp()

        message.channel.send( embed )
        .then(async msg => {
          await msg.react(settings.acceptEmoji);
          await msg.react(settings.declineEmoji);

          const filter = (r, u) => [settings.acceptEmoji, settings.declineEmoji].includes(r.emoji.name) && u.id === message.author.id
          const collector = msg.createReactionCollector(filter, {time: settings.reactionWaitTime * 1000})

          collector.on('collect', r => {
            if (r.emoji.name === settings.acceptEmoji) {
              fs.writeFile('./bot-files/update.txt', args2.join( ' ' ), err => {
                if (err) return functions.errorLog(err, "Writing to update.txt")

                msg.clearReactions()
                let embed = new RichEmbed()
                  .setColor(defaultEmbedColor)
                  .setDescription("Set update notes")
                  .setFooter( functions.randomFooter(), client.user.avatarURL )
                  .setTimestamp();

                msg.edit(embed)

                console.log(`[${functions.getTime()}]: Successfully wrote to update.txt`);
              })
            } else if (r.emoji.name === settings.declineEmoji) {
              msg.clearReactions()
              let embed = new RichEmbed()
                  .setTitle("Canceled changes")
                  .setColor(defaultEmbedErrorColor)
                  .setFooter(functions.randomFooter(), client.user.avatarURL )
                  .setTimestamp()

              msg.edit(embed)
              .then(msg => {
                setTimeout(() => {
                  msg.delete()
                }, settings.deletingEmbedTimeout * 1000)
              })
            }
          })
        })
      } else {
        functions.actionProhibited(client, message, defaultEmbedErrorColor, 'Set update (unauthorized)')
      }
    } else {
      functions.actionProhibited(client, message, defaultEmbedErrorColor, 'Set update (Disabled in settings)')
    }
  }
}

const fs = require('fs');
const functions = require('../Shared/functions.js');
const settings = require('../../bot-files/settings.json');
const extras = require('../../bot-files/extras.json')
const s = require('./settings-functions.js');
const { RichEmbed } = require( "discord.js" );

module.exports = {
  name: 'settings',
  aliases: ['setting'],
  catagory: 'server owner',
  description: 'Server settings for the bot',
  usage: '',
  execute(client, conn, message, args, defaultEmbedColor, defaultEmbedErrorColor, authorizedAdmin) {
    if (message.author.id == message.guild.ownerID || message.author.id == settings.botOwnerID) {
      let embed = new RichEmbed()
        .setTitle( "Settings - General" )
        .setColor( defaultEmbedColor )
        .addField( "Option 1", "Swearing censoring" )
        .addField( "Option 2", "Warn for swearing" )
        .addField( "Option 3", "Admin protection" )
        .addField( "Option 4", "Admin only music" )
        .addField( "Option 5", "Message logging" )
        .addField( "Option 6", "AutoMod" )
        .addField( "Option 7", "Real time logging" )
        .setFooter( functions.randomFooter(), client.user.avatarURL )
        .setTimestamp()

      message.channel.send(embed)
      .then(async msg => {
        await msg.react(settings.declineEmoji)

        await msg.react(extras.numberCodes[1])
        await msg.react(extras.numberCodes[2])
        await msg.react(extras.numberCodes[3])
        await msg.react(extras.numberCodes[4])
        await msg.react(extras.numberCodes[5])
        await msg.react(extras.numberCodes[6])
        await msg.react(extras.numberCodes[7])

        const filter = (r, u) => [settings.declineEmoji, extras.numberCodes[1], extras.numberCodes[2], extras.numberCodes[3], extras.numberCodes[4], extras.numberCodes[5], extras.numberCodes[6]].includes(r.emoji.name) && u.id === message.author.id
        const reaction = msg.createReactionCollector(filter, {time: settings.reactionWaitTime * 1000})

        reaction.on('collect', async r => {
          if (r.emoji.name == settings.declineEmoji) {
            msg.delete();
            reaction.stop()
          } else if (r.emoji.name == extras.numberCodes[1]) {
            s.setting(client, r, msg, message, 'Swearing Censoring', conn, 'swearingDetectionEnabled', defaultEmbedColor, defaultEmbedErrorColor)
            reaction.stop()
          } else if (r.emoji.name == extras.numberCodes[2]) {
            s.setting(client, r, msg, message, 'Warn for Swearing', conn, 'warnForSwearing', defaultEmbedColor, defaultEmbedErrorColor)
            reaction.stop()
          } else if (r.emoji.name == extras.numberCodes[3]) {
            s.setting(client, r, msg, message, 'Admin Protection', conn, 'adminProtection', defaultEmbedColor, defaultEmbedErrorColor)
            reaction.stop()
          } else if (r.emoji.name == extras.numberCodes[4]) {           
            s.setting(client, r, msg, message, 'Admin music commands', conn, 'adminMusic', defaultEmbedColor, defaultEmbedErrorColor)
            reaction.stop()
          } else if (r.emoji.name == extras.numberCodes[5]) {
            s.setting(client, r, msg, message, 'Message logging', conn, 'enableMessageLogging', defaultEmbedColor, defaultEmbedErrorColor)
            reaction.stop()
          } else if (r.emoji.name == extras.numberCodes[6]) {           
            s.autoModSettings(client, conn, message, defaultEmbedColor, defaultEmbedErrorColor);
            reaction.stop()
          } else if (r.emoji.name == extras.numberCodes[7]) {           
            s.realTimeLoggingSettings(conn, client, message, defaultEmbedColor, defaultEmbedErrorColor);
            reaction.stop()
          } 
        })
      })
    } else {
      functions.deletingEmbed(client, 'Owner needed', 'Sorry, but only the owner of the server can configure these settings.', defaultEmbedErrorColor, message.channel.id)
    }
  }
}







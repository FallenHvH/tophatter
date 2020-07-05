const fs = require('fs');
const functions = require('../Shared/functions.js');
const settings = require('../../bot-files/settings.json');
const extras = require('../../bot-files/extras.json');
const { RichEmbed } = require("discord.js");

const v = require('../../version.json')

var ver;

module.exports = {
  name: 'setversion',
  aliases: [],
  catagory: 'hidden',
  description: 'Update version.json to whatever',
  usage: '<version>',
  execute(client, conn, message, args, defaultEmbedColor, defaultEmbedErrorColor, authorizedAdmin) {
    if (true) {
      if (settings.botOwnerID == message.author.id) {
        let embed = new RichEmbed()
          .setTitle("Set version number")
          .setColor(defaultEmbedColor)
          .setDescription(`Are you sure you want to set the version to the following: ${args[0]}\n\n${settings.acceptEmoji} - Accept\n${settings.declineEmoji} - Decline`)
        
        message.channel.send(embed).then(async msg => {
          await msg.react(settings.acceptEmoji);
          await msg.react(settings.declineEmoji);

          const filter = (r, u) => [settings.acceptEmoji, settings.declineEmoji].includes(r.emoji.name) && u.id === message.author.id
          const collector = msg.createReactionCollector(filter, {time: settings.reactionWaitTime * 1000})

          collector.on('collect', r => {
            if (r.emoji.name === settings.acceptEmoji) {
              // fs.writeFile('../version.json', args[0], err => {
              let content = JSON.stringify({version: args[0]});

              console.log(content);
              

              fs.writeFile('./version.json', content, err => {
                if (err) return functions.errorLog(err, 'Writing to version.json file');

                msg.clearReactions();
                let embed = new RichEmbed()
                  .setColor(defaultEmbedColor)
                  .setDescription("Set version number")
                  .setTimestamp();

                msg.edit(embed);

                console.log(`[${functions.getTime()}]: Successfully wrote to version.json`);
              })
              // })
            } else if (r.emoji.name === settings.declineEmoji) {
              msg.clearReactions()
              let embed = new RichEmbed()
                .setTitle("Canceled changes")
                .setColor(defaultEmbedErrorColor)
                .setFooter(functions.randomFooter())
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
        functions.actionProhibited(client, message, defaultEmbedErrorColor, 'Set version (unauthorized)')
      }
    } else {
      functions.actionProhibited(client, message, defaultEmbedErrorColor, 'Set version (Disabled in settings)')
    }
  }
}

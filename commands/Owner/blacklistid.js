const fs = require('fs');
const functions = require('../Shared/functions.js');
const settings = require('../../bot-files/settings.json');
const extras = require('../../bot-files/extras.json');
const { RichEmbed } = require( "discord.js" )

/*
 This is how the bot owner (X22) can blacklist an id so that the bot will completly ignore it.

 good to block something // someone thats trying to break the bot or whatever
*/

module.exports = {
  name: 'blacklistid',
  aliases: ['blacklist', 'blockid'],
  catagory: 'hidden',
  description: 'Block userid from all access to the bot',
  usage: '<id>',
  execute(client, conn, message, args, defaultEmbedColor, defaultEmbedErrorColor, authorizedAdmin) {
    if (true) {
      if (settings.botOwnerID == message.author.id) {
        const newID = args[0];
        const user = client.users.get(newID).username

        let data = fs.readFileSync('./bot-files/extras.json')

        let precheck = JSON.parse(data);

        if (precheck.blacklistedIDs.includes(newID)) {
          return functions.embed(client, 'User already on blacklist', '', defaultEmbedErrorColor, message.channel.id)
        }

        let embed = new RichEmbed()
        .setTitle( `Block ${newID} (${user})?` )
        .setColor( defaultEmbedColor )
        .setFooter( functions.randomFooter(), client.user.avatarURL )
        
        message.channel.send(embed)
        .then(async msg => {
          await msg.react(settings.acceptEmoji);
          await msg.react(settings.declineEmoji);

          const filter = (r, u) => [settings.acceptEmoji, settings.declineEmoji].includes(r.emoji.name) && u.id === message.author.id
          const collector = msg.createReactionCollector(filter, {time: settings.reactionWaitTime * 1000})

          collector.on('collect', r => {
            if (r.emoji.name === settings.acceptEmoji) {
              // read the file and get ready to write some new data
              fs.readFile('./bot-files/extras.json', (err, data) => {
                let parsed = JSON.parse(data);

                // writing time

                parsed['blacklistedIDs'].push(newID)

                let content = JSON.stringify(parsed, null, 2)
                fs.writeFile('./bot-files/extras.json', content, err => {
                  if (err) return console.error(err.stack)

                  console.log(`[${functions.getTime()}]: Blacklisted ID ${newID} (${user})`);
                  msg.clearReactions()

                  let embed = new RichEmbed()
                    .setTitle( `Blacklisted user ${user}` )
                    .setColor( defaultEmbedColor )
                    .setFooter(  ) 

                  msg.edit(embed)
                })
              });
            } else if (r.emoji.name === settings.declineEmoji) {
              msg.clearReactions()

              let embed = new RichEmbed()
                .setTitle( "Action canceled" )
                .setColor( defaultEmbedErrorColor )
                .setFooter( functions.randomFooter(), client.user.avatarURL )

              msg.edit( embed )
              .then(() => {
                setTimeout(() => {
                  msg.delete()
                }, settings.deletingEmbedTimeout * 1000)
              })
            }
          })
        })
      } else {
        functions.actionProhibited(client, message, defaultEmbedErrorColor, 'Blacklist ID (unauthorized)')
      }
    } else {
      functions.actionProhibited(client, message, defaultEmbedErrorColor, 'Blacklist ID (Disabled in settings)')
    }
  }
}

const fs = require('fs');
const functions = require('../Shared/functions.js');
const settings = require('../../bot-files/settings.json');
const extras = require('../../bot-files/extras.json')
const s = require('./settings-functions.js');
const { RichEmbed } = require("discord.js");

// settings menu (faster with less code)
exports.setting = async (client, r, msg, message, setting, conn, sql, defaultEmbedColor, defaultEmbedErrorColor) => {
  try {
    let embed = new RichEmbed()
      .setTitle( `Setting - ${setting}` )
      .setColor( defaultEmbedColor )
      .setDescription( `React with ${settings.acceptEmoji} to enable\nReact with ${settings.declineEmoji} to disable` )
      .setFooter( functions.randomFooter(), client.user.avatarURL )

    msg.edit(embed)

    await msg.clearReactions()

    await msg.react(settings.acceptEmoji)
    await msg.react(settings.declineEmoji)

    const filter = (r, u) => [settings.acceptEmoji, settings.declineEmoji].includes(r.emoji.name) && u.id === message.author.id
    const sfReaction = r.message.createReactionCollector(filter, {time: settings.reactionWaitTime * 1000})

    sfReaction.on('collect', r => {
      if (r.emoji.name === settings.acceptEmoji) {
        msg.clearReactions()

        conn.query(`UPDATE bot_servers SET ${sql} = '1' WHERE serverid = ${msg.guild.id}`, err => {
          if (err) {
            functions.embed(client, 'Failure', `Failed to update value: \`\`\`${err.message}\`\`\``, defaultEmbedErrorColor, message.channel.id)
          } else {
            let embed = new RichEmbed()
              .setTitle(`Settings - ${setting}`)
              .setDescription("Updated value to enabled")
              .setColor(defaultEmbedColor)
            msg.edit(embed)
            .then(msg => {
              setTimeout(() => {
                msg.delete()
              }, settings.deletingEmbedTimeout * 1000)
            })
          }
        })
      } else if (r.emoji.name === settings.declineEmoji) {
        msg.clearReactions()

        conn.query(`UPDATE bot_servers SET ${sql} = '0' WHERE serverid = ${msg.guild.id}`, err => {
          if (err) {
            functions.embed(client, 'Failure', `Failed to update value: \`\`\`${err.message}\`\`\``, defaultEmbedErrorColor, message.channel.id)
          } else {
            let embed = new RichEmbed()
              .setTitle(`Settings - ${setting}`)
              .setDescription("Updated value to disabled")
              .setColor(defaultEmbedColor)
            msg.edit(embed)
            .then(() => {
              setTimeout(() => {
                msg.delete()
              }, settings.deletingEmbedTimeout * 1000)
            })
          }
        })
      }
    })
  } catch (err)
  {
    functions.errorLog(err, "Updating settings")
  }
}

// auto mod settings (in seperate file so you can open certain settings easier)
exports.autoModSettings = (client, conn, message, defaultEmbedColor, defaultEmbedErrorColor) => {
  let automodEmbed = new RichEmbed()
    .setTitle( "Settings - AutoMod" )
    .setColor( defaultEmbedColor )
    .addField( "Option 1", "Link protection" )
    .addField( "Option 2", "Warn for links" )
    .addField( "Option 3", "Image protection" )
    .addField( "Option 4", "Warn for images" )
    .setFooter( functions.randomFooter(), client.user.avatarURL )

  message.channel.send(automodEmbed)
  .then(async msg => {
    // react
    await msg.react(settings.declineEmoji);

    await msg.react(extras.numberCodes[1])
    await msg.react(extras.numberCodes[2])
    await msg.react(extras.numberCodes[3])
    await msg.react(extras.numberCodes[4])
    
    // create filter
    const filter = (r, u) => [settings.declineEmoji, extras.numberCodes[1], extras.numberCodes[2], extras.numberCodes[3], extras.numberCodes[4]].includes(r.emoji.name) && u.id == message.author.id;
    const reaction = msg.createReactionCollector(filter, { time: 1000 * settings.reactionWaitTime })

    reaction.on('collect', r => {
      if (r.emoji.name == settings.declineEmoji) {
        msg.delete()
      } else if (r.emoji.name == extras.numberCodes[1]) {
        s.setting(client, r, msg, message, 'Link protection', conn, 'autoModLinks', defaultEmbedColor, defaultEmbedErrorColor)
      } else if (r.emoji.name == extras.numberCodes[2]) {
        s.setting(client, r, msg, message, 'Warn for links', conn, 'warnForLinks', defaultEmbedColor, defaultEmbedErrorColor)
      } else if (r.emoji.name == extras.numberCodes[3]) {
        s.setting(client, r, msg, message, 'Image protection', conn, 'autoModImages', defaultEmbedColor, defaultEmbedErrorColor)
      } else if (r.emoji.name == extras.numberCodes[4]) {
        s.setting(client, r, msg, message, 'Warn for images', conn, 'warnForImages', defaultEmbedColor, defaultEmbedErrorColor)
      }
    })
  })
}

// real time logging settings
exports.realTimeLoggingSettings = (conn, client, message, defaultEmbedColor, defaultEmbedErrorColor) => {
  try {
    let embed = new RichEmbed()
      .setTitle( "Settings - Realtime logging" )
      .setColor( defaultEmbedColor )
      .addField( "Option 1", "Set logging channel" )
      .addField( "Option 2", "Log edited messages" )
      .setFooter( functions.randomFooter(), client.user.avatarURL )
      .setTimestamp()

    message.channel.send(embed)
    .then(async msg => {
      // react
      await msg.react(settings.declineEmoji);

      await msg.react(extras.numberCodes[1])
      await msg.react(extras.numberCodes[2])
      
      // create filter
      const filter = (r, u) => [settings.declineEmoji, extras.numberCodes[1], extras.numberCodes[2], extras.numberCodes[3], extras.numberCodes[4]].includes(r.emoji.name) && u.id == message.author.id;
      const reaction = msg.createReactionCollector(filter, { time: 1000 * settings.reactionWaitTime })

      reaction.on('collect', r => {
        if (r.emoji.name == settings.declineEmoji) {
          msg.delete()
        } else if (r.emoji.name == extras.numberCodes[1]) 
        {
          msg.clearReactions()
          let embed2 = new RichEmbed()
            .setTitle( "Settings - Realtime logging - Channel" )
            .setColor( defaultEmbedColor )
            .setDescription( "Tag the channel you want to set as the logging channel." )
            .setFooter( functions.randomFooter(), client.user.avatarURL )

          msg.edit(embed2)

          const filter = m => m.author.id == message.author.id;
          const collector = message.channel.createMessageCollector(filter, {time: 1000 * settings.reactionWaitTime})

          collector.on('collect', msg => {
            // works
            
            if (msg.mentions.channels.first()) {
              conn.query(`UPDATE bot_servers SET logChannel = "${msg.mentions.channels.first().id}" WHERE serverid = "${msg.channel.id}";`, err => {
                if (err) return functions.errorLog(err, 'Setting realtime logging channel')
      
                msg.delete();
                functions.embed(client, 'Database updated', `Database was updated to include ${msg.mentions.channels.first()} as realtime logging channel`, defaultEmbedColor, message.channel.id)
                collector.stop()
              })
            } else {
              functions.deletingEmbed(client, 'No channel tagged.', 'Please tag a channel to output realtime logging to.', defaultEmbedErrorColor, msg.channel.id)
            }
          })

          collector.on( "end", () => {
            msg.delete()
          })
        } else if (r.emoji.name == extras.numberCodes[2])
        {
          s.setting( client, r, msg, message, 'Log edited messges', conn, 'logEditedMessages', defaultEmbedColor, defaultEmbedErrorColor )
        }
      })

      reaction.on( "end", () => {
        msg.clearReactions()
      })
    })
  } catch (err)
  {
    functions.errorLog( err, "Realtime logging settings" )
  }
}
module.exports = {
  name: 'help',
  description: 'ooh! some ***shiny*** commands!',
  execute(client, conn, message, args, embed, embedError) {
    console.log('running help');
    for (i = 0;i < commands.user.length;i++) {
      userHelpList.push(`${prefix}${commands.user[i].name}\n*${commands.user[i].desc}*\n`)
    }
    for (i = 0;i < commands.admin.length;i++) {
      adminHelpList.push(`${prefix}${commands.admin[i].name}\n*${commands.admin[i].desc}*\n`)
    }

    message.channel.send({embed: {
      color: defaultEmbedColor,
      title: 'Help',
      description: userHelpList.join('\n'),
      footer: {
        icon_url: client.user.avatarURL,
        text: extras.footerMsg[Math.floor(Math.random() * extras.footerMsg.length - 1)]
      }
    }})
    // .then(async (msg) => {
      await msg.react('⏪');
      await msg.react('⏩');

      let filter = (react, user) => ['⏪', '⏩'].includes(react.emoji.name) && user.id === message.author.id;
      let reaction = msg.createReactionCollector(filter, {time: settings.reactionWaitTime * 1000});

      reaction.on('collect', r => {
        if (r.emoji.name === '⏩') {
          msg.edit({embed: {
            color: defaultEmbedColor,
            title: 'Help - Admin Commands',
            description: adminHelpList.join('\n'),
            footer: {
              icon_url: client.user.avatarURL,
              text: extras.footerMsg[Math.floor(Math.random() * extras.footerMsg.length - 1)]
            }
          }})
        } else if (r.emoji.name === '⏪') {
          msg.edit({embed: {
            color: defaultEmbedColor,
            title: 'Help',
            description: userHelpList.join('\n'),
            footer: {
              icon_url: client.user.avatarURL,
              text: extras.footerMsg[Math.floor(Math.random() * extras.footerMsg.length - 1)]
            }
          }})
        }
      })

      reaction.on('end', () => {
        msg.clearReactions()
      })
    })
  }
}

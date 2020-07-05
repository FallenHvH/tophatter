const fs = require('fs');
const functions = require('../Shared/functions.js');
const settings = require('../../bot-files/settings.json');
const extras = require('../../bot-files/extras.json')
const { RichEmbed } = require( "discord.js" );

module.exports = {
  name: 'cmd',
  aliases: ['execute', 'exec'],
  catagory: 'hidden',
  description: 'Execute some serverside code',
  usage: '<code>',
  execute(client, conn, message, args, defaultEmbedColor, defaultEmbedErrorColor, authorizedAdmin) {
    if (settings.debugMode || true ) {
      if (settings.botOwnerID === message.author.id) {
        if (args.length > 0) {
          // block sql queries
          if (message.content.toString().toLowerCase().includes('query')) return functions.actionProhibited(message, defaultEmbedErrorColor, 'SQL Query');

          // block certain commands
          // for (var i =0;i < extras.blockedCmdCommands.length;i++) {
          //   if (message.content.toString().toLowerCase().includes(extras.blockedCmdCommands[i])) return functions.actionProhibited(client, message, defaultEmbedErrorColor, 'Blocked commands');
          // }

          let args2 = message.origContent.toString().split( " " )
          args2.shift()

          let embed = new RichEmbed()
            .setTitle( "Code Execution" )
            .setDescription( `Are you sure you want to execute this?\n\`\`\`js\n${args2.join( " " )}\`\`\`` )
            .setFooter( functions.randomFooter(), client.user.avatarURL )
            .setColor( defaultEmbedColor )
            .setTimestamp()

          message.channel.send(embed)
          .then(async msg => {
            await msg.react(settings.acceptEmoji)
            await msg.react(settings.declineEmoji)

            const filter = (r, u) => [settings.acceptEmoji, settings.declineEmoji].includes(r.emoji.name) && u.id === message.author.id
            const reaction = msg.createReactionCollector(filter, {time: settings.reactionWaitTime * 1000})

            reaction.on('collect', async r => {
              if (r.emoji.name === settings.acceptEmoji) {
                msg.delete()

                functions.deletingEmbed(client, 'Attempting code execution', '', defaultEmbedColor, message.channel.id)
                console.log('Attempting code execution');

                fs.appendFile('./logs/cmd.log', `[${functions.getTime()}]: User ${functions.getTag(message)} attempted to run the following code:\n ${args.join(' ')}\n`, err => {
                  if (err) {
                    console.log(`Failed to write to file cmd.log: ${err.stack}`);
                  }
                })

                const clean = text => {
                  if (typeof(text) === "string") {
                    return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
                  } else {
                    return text;
                  }
                }

                try {
                  const code = args2.join(" ");
                  let evaled = eval(code);

                  if (typeof evaled !== "string") evaled = require("util").inspect(evaled);

                  functions.embed(client, ':white_check_mark: Code excuted successfully.', '', defaultEmbedColor, message.channel.id)

                  fs.appendFile('./logs/cmd.log', `[${functions.getTime()}]: code was executed. Code: ${args.join(' ')}\n`, err => {
                    if (err) return console.log(`[${functions.getTime()}]: Failed to write to cmd.log: ${err.stack}`);
                  })

                  // message.channel.send(clean(evaled), {code:"xl"});
                } catch (err) {
                  functions.embed( client, ":x: Failed to execute code.", `ERROR \`\`\`js\n${clean(err)}\n\`\`\``, defaultEmbedErrorColor, message.channel.id )
                  functions.errorLog(err, 'CMD execution')
                }
              } else if (r.emoji.name === settings.declineEmoji) {
                msg.clearReactions()
                msg.delete()

                functions.deletingEmbed(client, 'Action Cancelled', 'Action was cancelled by user.', defaultEmbedErrorColor, message.channel.id);
              }
            })
          })
        } else {
          functions.deletingEmbed(client, 'No parameters', 'Parameters are required.', defaultEmbedErrorColor, message.channel.id)
        }
      } else {
        functions.actionProhibited(client, message, defaultEmbedErrorColor, 'EVAL (Unauthorized)')
      }
    } else {
      functions.embed(client, 'Function disabled', 'This function has been disable by the bot creator.', defaultEmbedErrorColor, message.channel.id)
      functions.ownerMsg(client, `User (${message.author.username}#${message.author.discriminator}) attempted to use **EVAL** function. Details are in security.log`)
      fs.appendFile('./logs/security.log', `[${functions.getTime()}]: User ${functions.getTag(message)} attempted to use function EVAL. (Function EVAL is disabled) MESSAGE CONTENT: ${message.content.toString()}\n`, err => {
        if (err) console.log(`Failed to write to security.log: ${err}`);
      })
    }
  }
}

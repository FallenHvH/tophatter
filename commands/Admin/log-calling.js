const fs = require('fs');
const functions = require('../Shared/functions.js');
const settings = require('../../bot-files/settings.json');
const extras = require('../../bot-files/extras.json');
const { MessageAttachment, RichEmbed } = require('discord.js');
const ascii = require( "ascii-table" )

module.exports = {
  name: 'logs',
  aliases: ['calllogs', 'getlogs'],
  catagory: 'admin',
  description: 'Get all logs for the server',
  usage: '',
  async execute(client, conn, message, args, defaultEmbedColor, defaultEmbedErrorColor, authorizedAdmin) {
    try {
      conn.query(`SELECT enableMessageLogging FROM bot_servers WHERE serverid = "${message.guild.id}"`,(err,res)=>{
        if (err) return functions.errorLog(err,"Calling enableMessageLogging")
        if (authorizedAdmin) {
          if (res[0].enableMessageLogging==1) {
            var table = new ascii(`Logs for server ${message.guild.name}`)
            table.setHeading( "Time", "Log type", "Data" )
            
            conn.query(`SELECT * FROM logs WHERE serverid = ${message.guild.id} ORDER BY time`, async (err, result) => {
              if (err) {
                console.error(`Failed to call logs from SQL: ${err}`)
              } else {
                result.forEach( res => {
                  table.addRow( res.time, res.log_type, res.data )
                })

                await fs.writeFile('./all-logs.log', table.toString(), err => {
                  if (err) return console.log(`[${functions.getTime()}]: Failed to write to tmp file.`);
                })

                message.author.send(`Here are all of the logs from **${message.guild.name}**`, {
                  files: [
                    "./all-logs.log",
                  ]
                })

                .then(() => {
                  functions.embed( client, "Logs sent", "The logs were sent to your DMs!", defaultEmbedColor, message.channel.id )
                  fs.unlinkSync('./all-logs.log', err => {
                    if (err) return console.log(err.stack);
                  })
                })
              }
            })
          } else
          {
            functions.deletingEmbed(client,"Logging disabled","Server logging is disabled in the servers settings",defaultEmbedErrorColor,message)
          }
        } else {
          functions.permissionMissing(client, defaultEmbedErrorColor, message.channel.id)
        }
      })
    } catch (err) {
      console.log(err.stack);
    }
  }
}

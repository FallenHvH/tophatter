const fs = require('fs');
const functions = require('../Shared/functions.js');
const settings = require('../../bot-files/settings.json');
const extras = require('../../bot-files/extras.json')
const f2 = require('./Server pinger functions.js')
const p = require('ping')

exports.ping = (message, serverList, embedColor) => {
  stat = [];
  i = 0;

  message.channel.send({embed: {
    title: 'Pinging servers...',
    color: embedColor
  }})
  .then(async msg => {
    await serverList.forEach(async server => {
      await p.sys.probe(server, async (status) => {
        if (status) stat.push('🟢  | ' + server + ': **Online**');
        if (!status) stat.push('🔴  | ' + server + ': **Offline**');

        i++

        await msg.edit({embed: {
          title: 'Server statuses:',
          color: embedColor,
          description: stat.join('\n'),
          footer: {
            text: `${serverList.length - i} servers left`
          }
        }})

        if ((serverList.length - 1) - i) {
          msg.edit({embed: {
            title: 'Server statuses:',
            color: embedColor,
            description: stat.join('\n'),
            footer: {
              text: `Done.`
            }
          }})
        }
      })
    })
  })
}

exports.getServers = (conn, message, client, embedColor) => {
  conn.query(`SELECT serverList from bot_servers WHERE serverid = '${message.guild.id}';`, (err, data) => {
    if (err) return functions.errorLog(err, 'Calling server ping info')
    if (!data.length || data[0].serverList == null) return functions.embed(client, 'No sites', 'There are no set sites to check', embedColor, message.channel.id)

    let data2 = data[0].serverList.toString().split(",");

    f2.ping(message, data2, embedColor)
  })
}

exports.setServers = async (conn, message, client, embedColor) => {
  let args = message.content.toString().toLowerCase().split(" ")

  if (!args.length > 1) return functions.embed(client, 'Error', 'You need to include a URL // IP', embedColor, message.channel.id)

  let host = args[1]

  await conn.query(`SELECT serverList from bot_servers WHERE serverid = '${message.guild.id}';`, (err, data) => {
    if (err) return functions.errorLog(err, 'Calling server ping info')

    console.log(data);

    if (data[0].serverList == null || !data.length) cmd = host;
    if (data[0].serverList != null) cmd = data[0].serverList.toString() + ',' + host;

    console.log(cmd);

    conn.query(`UPDATE bot_servers SET serverList = '${cmd}' WHERE serverid = '${message.guild.id}'`, err => {
      if (err) {
        functions.embed(client, 'Failures', 'Failed to update database')
        functions.errorLog(err, 'Updating database (server pinger)');

        return;
      } else {
        functions.embed(client, 'Updated', 'Updated database.', embedColor, message.channel.id)
	      console.log(`[${functions.getTime()}]: Updated MySQL database`)

        return;
      }
    })
  })
}

exports.resetServerData = (conn, message, client, embedColor) => {
  conn.query(`DELETE FROM bot_servers WHERE serverid = '${message.guild.id}'`, err => {
    if (err) console.log(err.stack)
    if (err) return message.reply('Failed to delete SQL rows.')

    functions.embed(client, 'Updated', 'Cleared all servers', embedColor, message.channel.id)
  })
}

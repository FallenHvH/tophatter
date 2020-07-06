const extras = require('../../bot-files/extras.json');
const settings = require('../../bot-files/settings.json')
const functions = require('./functions.js');
const fetch = require('random-puppy');
const fs = require('fs');
const { RichEmbed } = require("discord.js");
const request = require('request');

var reason;

function getTime() {
  let dateNow = new Date();
  let dateH = dateNow.getHours();
  let dateM = dateNow.getMinutes();
  if (dateM < 10) {
    dateM = `0${dateM}`;
  }

  return `${dateH}:${dateM}`;
}

// regular embeds
exports.embed = (client, title, text, color, message) => {
  if (message.channel) {channelid = message.channel.id} else {channelid = message}
  let embed = new RichEmbed()
    .setTitle(title)
    .setDescription(text)
    .setColor(color)
    .setFooter(functions.randomFooter(), client.user.avatarURL)
    .setTimestamp()

  client.channels.get(channelid).send(embed)
  .catch(err => {
    console.log("Failed to create embed: " + err)
  })
}

// disappearing embed
exports.deletingEmbed = (client, title, text, color, message) => {
  if (message.channel) {channelid = message.channel.id} else {channelid = message}
  let embed = new RichEmbed()
    .setTitle(title)
    .setDescription(text)
    .setColor(color)
    .setFooter(functions.randomFooter(), client.user.avatarURL)
    .setTimestamp()

  client.channels.get(channelid).send(embed)
  .then((msg) => {
    setTimeout(() => {
      msg.delete()
    }, settings.deletingEmbedTimeout * 1000)
  })
}

//permissions missing function
exports.permissionMissing = (client, color, channelid) => {
  let embed = new RichEmbed()
    .setTitle("Permissions missing.")
    .setDescription(extras.permissionMissingMsg[Math.floor(Math.random() * extras.permissionMissingMsg.length - 1)])
    .setColor(color)
    .setFooter(functions.randomFooter(), client.user.avatarURL)
    .setTimestamp()

  client.channels.get(channelid).send(embed)
}

// restart bot function (not useful)
exports.resetBot = (client, id, color) => {
//   client.destroy();
//   startBot();
//   console.log('Restarted bot.');

//   client.channels.get(id).send({embed: {
//     description: 'Restarted.',
//     color: color,
//     footer: {
//       icon_url: client.user.avatarURL,
//       text: extras.footerMsg[Math.floor(Math.random() * extras.footerMsg.length - 1)]
//     }
//   }})
}

// usage commands
exports.usage = (client, syntax, color, channelid) => {
  let embed = new RichEmbed()
    .setTitle("Syntax")
    .setDescription(`\`\`\`${syntax}\`\`\``)
    .setColor(color)
    .setFooter(functions.randomFooter(), client.user.avatarURL)
    .setTimestamp()

  client.channels.get(channelid).send(embed)
},

// setup sql table
exports.setupSQL = (conn, serverid, servername) => {
  // console.log('Attempting to setup server ' + serverid + ':' + servername)
  conn.query(`INSERT INTO bot_servers (serverID) VALUES ('${serverid}');`, (err,result) => {
    if (err) {
      // console.log('Failed to setup table for server ' + serverid + ':' + servername)
      // console.log(err);
      return false
    } else {
      // console.log('Setup data for table for server ' + serverid + ':' + servername)
      return true
    }
  })
}

// delete sql table
exports.deleteSQL = (conn, serverid, servername) => {
  console.log(`Attempting to purge server ${servername}`)
  conn.query("DELETE FROM bot_servers WHERE serverid = " + serverid, (err,result) => {
    if (err) {
      console.log(`Failed to purge table for server ${servername}` + servername)
    } else {
      console.log('Deleted data for table for server\nAttempting to purge warning database')
      conn.query("DELETE FROM user_warns WHERE serverid = " + serverid, (err, result) => {
        if (err) {
          console.log('Failed to purge warnings database for server ' + servername);
        } else {
          console.log('Purged user warnings database');
        }
      })
    }
  })
}

// owner messaging
exports.ownerMsg = (client, title, description) => {
  let embed = new RichEmbed()
    .setTitle(title)
    .setDescription(description)
    .setColor(settings.embed)
    .setFooter(functions.randomFooter(), client.user.avatarURL)
    .setTimestamp()

  client.users.get(settings.botOwnerID).send(embed)
},

// warn the user
exports.warnUser = (conn, client, errorColor, color, systemWarn, message, reason) => {
  if (!systemWarn && message.mentions.users.first().id == message.guild.ownerID) return functions.embed(client, 'Error', 'You cannot warn the owner of a server.', errorColor, message.channel.id);
  if (systemWarn && message.author.id == settings.botOwnerID) return;

  conn.query("SELECT adminProtection FROM bot_servers WHERE serverid = " + message.guild.id, (err, result) => {
    try {
      if (!systemWarn) {
        if (err) {
          console.error('Failed to get admin protection settings.')
          functions.ownerMsg(client, 'Database failure', `Failed to get admin protection settings for server ${message.guild.name}: ${err.stack.substring(0,1024)}`)
        } else {
          if (message.guild.members.get(message.mentions.users.first().id).hasPermission('ADMINISTRATOR') || message.mentions.users.first().id == message.guild.ownerID) {
            if (result[0].adminProtection == 1) return functions.deletingEmbed(client, 'Failure', 'Cannot warn an admin: Admin protection is enabled.', errorColor, message.channel.id);
          }
        }
      }

      if (!systemWarn) {
        var user = message.mentions.users.first().id
        var username = message.author.tag
      } else {
        var user = message.author.id
        var username = 'System'
      }


      conn.query(`INSERT INTO user_warns (id, serverid, userid, reason, warnedBy, time) VALUES ('${Math.floor(Math.random() * settings.randomNum)}', '${message.guild.id}', '${user}', '${reason}', '${username}', '${getTime()}');`, function(err, result) {
        if (err) {
          console.error('Error adding warning: ' + err)
          let embed = new RichEmbed()
            .setDescription("Failed to warn user.")
            .setColor(errorColor)
            .setFooter(functions.randomFooter(), client.user.avatarURL)
            .setTimestamp()

          message.channel.send(embed)
        }
        else {
          fs.appendFile('./logs/warn.log', `[${getTime()}]: (${message.author.id}) ${message.author.username}#${message.author.discriminator} warned user (${user}) ${username} for ${reason}\n`, err => {
            if (err) console.log(`[${getTime()}]: Failed to log to warns.log: ${err.message}`)
          })

          let embed = new RichEmbed()
            .setDescription(`Warned user <@${user}> for *${reason}*`)
            .setColor(color)
            .setFooter(functions.randomFooter(), client.user.avatarURL)
            .setTimestamp()

          message.channel.send(embed)
        }
      })

      functions.realTimeLog(client, conn, message, 'User warned', `${message.mentions.users.first()} was warned by ${message.author}. Reason: *${reason.substring(0, 1000)}*`);

      // check consequences
      functions.checkConsequences(conn, client, errorColor, color, message, username, user, systemWarn)
    } catch (err) {
      functions.embed(client, 'Failure', 'Failed to insert into warnings table', errorColor, message.channel.id)
      console.log(`[${getTime()}]: Failed to warn user ${user}: ${err.stack}`);
    }
  })
},

// clear user warnings
exports.clearWarns = (client, conn, message, defaultEmbedColor, defaultEmbedErrorColor) => {
  if (message.author.id == message.mentions.users.first().id && message.author.id != message.guild.ownerID && message.author.id != settings.botOwnerID) return functions.embed(client, 'Error', 'You cannot clear your own warnings.', defaultEmbedErrorColor, message.channel.id);

  console.log(message.author.id == message.mentions.users.first().id);
  

  conn.query("DELETE FROM user_warns WHERE serverid = " + message.guild.id + " AND userid = " + message.mentions.users.first().id, (err, result) => {
    if (err) {
      functions.embed(client, 'Failure', 'Failed to clear warns for user ' + message.mentions.users.first(), defaultEmbedErrorColor, message.channel.id)
    } else {
      let embed = new RichEmbed()
        .setDescription(`Cleared warns for user ${message.mentions.users.first()}`)
        .setColor(defaultEmbedColor)
        .setFooter(functions.randomFooter(), client.user.avatarURL)
        .setTimestamp()

      message.channel.send(embed)

      functions.realTimeLog(client, conn, message, 'Cleared warnings', `${message.mentions.users.first()} warning(s) were cleared by ${message.author}`);
    }
  })
},

// check for punishments
exports.checkConsequences = (conn, client, errorColor, color, message, username, userid, system) => {
  conn.query("SELECT * FROM user_warns WHERE serverID = " + message.guild.id + " AND userID = " + userid, (err, result) => {
    if (err) {
      console.log(`Failed to check consequences: ${err.stack}`);
      embed('Failure', 'Failed to check consequences database', errorColor, message.channel.id)
      return;
    } else {
      conn.query(`SELECT * FROM bot_servers WHERE serverid = ${message.guild.id}`, (err, result2) => {
        if (err) {
          console.log(`Failed to call server consequences: ${err.stack}`);
          embed('Failure', 'Failed to check consequences database', errorColor, message.channel.id)
          return;
        } else if (result2[0].maxWarnsUntilKick == 0) {
          // dont run any functions
          return;
        } else {
          if (result.length > result2[0].maxWarnsUntilKick - 1) {
            functions.kickUser(conn, client, color, errorColor, message, system)
          }
        }
      })
    }
  })
},

// kick function
exports.kickUser = (conn, client, color, errorColor, message, system) => {
  var user;

  try {
    // set the user
    if (system) {
      user = message.member
    } else {
      user = message.mentions.members.first()
    }
    

    if (user.kickable) { 
      const reason = message.content.toString().substring(user.id.length + 11)
  
      let embed = new RichEmbed()
        .setTitle(`Kicked from ${message.guild.name}`)
        .setDescription(`Reason: *${reason.substring(0, 1000)}*`)
        .setColor(settings.embedError)
        .setTimestamp()

      client.users.get(user.id).send(embed).then(() => {
        message.guild.members.get(user.id).kick(reason).then(() => {
          conn.query(`DELETE FROM user_warns WHERE userid = ${user.id} AND serverid = ${message.guild.id}`, err => {
            if (err) {
              functions.ownerMsg(client, 'Error deleting records', `Error deleting client warnings records: ${err}`)
              console.log(`Failure deleting warn records for server ${message.guild.id}`);
            }
          })
        }).then(() => {
          let embed = new RichEmbed()
            .setTitle("Kicked user.")
            .setDescription(`Kicked user **${user}**\n\nReason: *${reason.substring(0, 1000)}*`)
            .setColor(color)
            .setFooter(functions.randomFooter(), client.user.avatarURL)

          message.channel.send(embed)

          functions.realTimeLog(client, conn, message, 'User kicked', `${message.mentions.users.first()} was kicked. Reason: ${reason.substring(0, 1000)}`);
        })
      })
    } else {
      if (!system) return functions.embed(client, 'Failure', 'Unable to perform action. User cannot be kicked.', errorColor, message.channel.id)
    }
  } catch (err) {
    console.log(`[${functions.getTime()}]: Failed to kick user: ${err.stack}`);
    
  }
},

// ban user function
exports.banUser = (conn, client, color, errorColor, message, time, system) => {
  var user, reason;

  if (message.mentions.users.first().id == message.guild.ownerID || message.mentions.users.first().id == settings.botOwnerID) return functions.embed(client, 'Error', 'You cannot ban this person.', errorColor, message.channel.id)

  try {
    // set the user
    if (system) {
      user = message.member
    } else {
      user = message.mentions.members.first()
    }

    args = message.origContent.toString().split(" ")
    args.shift();args.shift()

    if (time != 0) {
      args.shift()
      reason = args.join(" ")
    } else {
      reason = args.join(" ")
    }
    

    if (user.bannable) { 
      let embed = new RichEmbed()
        .setTitle(`Banned from ${message.guild.name}`)
        .setDescription(`Reason: *${reason}*`)
        .setColor(settings.embedError)
        .setTimestamp()

      client.users.get(user.id).send(embed)
      .then(() => {
        message.guild.ban(user.id, { days: time, reason: reason } ).then(() => {
          conn.query(`DELETE FROM user_warns WHERE userid = ${user.id} AND serverid = ${message.guild.id}`, err => {
            if (err) {
              functions.ownerMsg(client, 'Error deleting records', `Error deleting client warnings records: ${err}`)
              console.log(`Failure deleting warn records for server ${message.guild.id}`);
            }
          })
        }).then(() => {
          let embed = new RichEmbed()
            .setTitle("Banned user.")
            .setDescription(`Banned user **${user}**\n\nReason: *${reason.substring(0, 1000)}*\nTime: **${time}** day(s)`)
            .setColor(color)
            .setFooter(functions.randomFooter(), client.user.avatarURL)

          message.channel.send(embed)

          functions.realTimeLog(client, conn, message, 'User banned', `**${message.mentions.users.first().tag}** was banned.\nReason: ${reason.substring(0, 1000)}`);
        })
      })
    } else {
      functions.embed(client, 'Failure', 'Unable to perform action. User cannot be banned.', errorColor, message.channel.id)
    }
  } catch (err) {
    console.log(`[${functions.getTime()}]: Failed to ban user: ${err.stack}`);
  }
},

// user function, mutes mic and disables typing
exports.muteUser = (client, embed, embedError, message, time) => {
  if (!time) {
    try {
      message.guild.members.get(message.mentions.users.first().id).removeRole(message.guild.roles.find(role => role.name == 'member')).catch()

      message.guild.members.get(message.mentions.users.first().id).addRole(message.guild.roles.find(role => role.name == 'muted'))
      message.guild.members.get(message.mentions.users.first().id).setMute(true, `Muted by ${settings.botName}`)
      .then(() => {
        functions.deletingEmbed(client, 'User muted', `${message.mentions.users.first()} was muted.`, embed, message.channel.id)

        functions.realTimeLog(client, conn, message, 'User muted', `${message.mentions.users.first()} was muted for ${time} minute(s).`);
      })
    } catch (err) {
      functions.deletingEmbed(client, 'Failure', `Failed to mute user ${message.mentions.users.first()}`, embedError, message.channel.id)
      functions.errorLog(err, 'Muting user')
    }
  } else if (message.guild.roles.find(role => role.name == 'muted')) {
    if (isNaN(time) === true && time !== null) {
      return functions.deletingEmbed(client, 'Invalid', `${time} is an invalid amount of time.`, embedError, channelid);
    }

    try {
      message.guild.members.get(message.mentions.users.first().id).removeRole(message.guild.roles.find(role => role.name == 'member')).catch()

      message.guild.members.get(message.mentions.users.first().id).addRole(message.guild.roles.find(role => role.name == 'muted'))
      message.guild.members.get(message.mentions.users.first().id).setMute(true, `Muted by ${settings.botName}`)

      functions.deletingEmbed(client, 'User muted', `${message.mentions.users.first()} was muted for ${time} minute(s)`, embed, message.channel.id)

      functions.realTimeLog(client, conn, message, 'User muted', `${message.mentions.users.first()} was muted for ${time} minute(s).`);

      setTimeout(() => {
        functions.unmuteUser(client, embed, embedError, message)
      }, time * 60000)
    } catch (err) {
      // cant mute user... send error message
      functions.deletingEmbed(client, 'Failure', `Failed to mute user ${message.mentions.users.first()}`, embedError, message.channel.id)
    }
  } else {
    functions.makeMuteRole(client, message.guild.id);
  }
},

// unmute user function, unmutes mic and enables typing
exports.unmuteUser = (client, embed, embedError, message) => {
  if (message.guild.roles.find(role => role.name == 'muted')) {
    if (message.channel.id === false) {
      try {
      	message.guild.members.get(message.mentions.users.first().id).addRole(message.guild.roles.find(role => role.name == 'member'))

        message.guild.members.get(message.mentions.users.first().id).removeRole(message.guild.roles.find(role => role.name == 'muted'))
        message.guild.members.get(message.mentions.users.first().id).setMute(false, `Unmuted by ${settings.botName}`)

        functions.realTimeLog(client, conn, message, 'User unmuted', `${message.mentions.users.first()} was unmuted.`);
      } catch (err) {
        // oh well not my issue
        // probably
      }
    } else {
      try {
        message.guild.members.get(message.mentions.users.first().id).removeRole(message.guild.roles.find(role => role.name == 'muted'))
        message.guild.members.get(message.mentions.users.first().id).setMute(false, `Unmuted by ${settings.botName}`)

        functions.deletingEmbed(client, 'User unmuted', `${message.mentions.users.first()} was unmuted`, embed, message.channel.id)

        functions.realTimeLog(client, conn, message, 'User unmuted', `${message.mentions.users.first()} was unmuted.`);
      } catch (err) {
        // cant mute user... send error message
        console.log("Failed to unmute: " + err);
        functions.deletingEmbed(client, 'Failure', `Failed to unmute user ${message.mentions.users.first().id}`, embedError, message.channel.id)
      }
    }
  }
},

// add muted role
exports.makeMuteRole = (client, serverid) => {
  client.guilds.get(serverid).createRole({
    name: 'muted',
    permissions: ['READ_MESSAGES', 'READ_MESSAGE_HISTORY']
  })
  .then((role) => {
    functions.addMuteRoleToChannels(client, serverid, role.id);
  })
},

// add muted role to all channels
exports.addMuteRoleToChannels = (client, serverid, roleid) => {
  for (i = 0;i < client.guilds.get(serverid).channels.size;i++) {
    try {
      client.guilds.get(serverid).channels.find(channel => channel.position == i).overwritePermissions(roleid, {
        'SEND_MESSAGES': false,
        'READ_MESSAGES': true,
        'READ_MESSAGE_HISTORY': true
      })
    } catch (err) {
      // nothing, if it throws error, most likely just permission error soooo ignore all errors
    }
  }
},

// unban user
exports.unbanUser = (client, message, embedColor, conn) => {
  try {
    let userid = message.origContent.toString().toLowerCase().split(" ")[1];
    let username = client.users.get(userid).tag

    message.guild.unban(userid.toString())

    let embed = new RichEmbed()
      .setTitle("Unbanned user")
      .setDescription(`Unbanned user ${username}`)
      .setColor(embedColor)
      .setFooter(functions.randomFooter(), client.user.avatarURL)
      .setTimestamp()

    message.channel.send(embed)

    functions.realTimeLog(client, conn, message, 'Unbanned user', `**${userid}** was unbanned by ${message.author}`)
  } catch (err) {
    // oh well

    console.log(err.stack);
    
  }
},

// get reddit post
exports.getReddit = async (client, defaultEmbedColor, defaultEmbedErrorColor, subreddit, message) => {
  try {
    request( `https://www.reddit.com/r/${subreddit}/random.json?limit=1`, (err, res, body) => {
      if (err) { 
        functions.errorLog( err, "Calling reddit random.json" )
        return functions.deletingEmbed( client, "General failure", "", defaultEmbedErrorColor, message.channel.id )
      }

      body = JSON.parse( body )

      if (!body[0]) { return functions.embed( client, "Error", "The supplied reddit either doesn't exist or there is no posts.", defaultEmbedErrorColor, message.channel.id ) }

      let data = body[0].data.children[0].data

      let embed = new RichEmbed()
        .setTitle( `${data.title} (u/${data.author})` )
        .setColor( defaultEmbedColor )
        .setFooter( `${data.ups} upvotes | ${data.downs} downvotes` )

      if (data.url) { embed.setImage( data.url ) }
      if (data.selftext) { embed.setDescription( data.selftext ) }

      message.channel.send( embed )
    })
  } catch (err)
  {
    functions.embed( client, "General error.", "Sorry, something went wrong!\n\nIf this persists, DM the bot to open a ticket", defaultEmbedErrorColor, message.channel.id )
    functions.errorLog( err, "Calling from reddit" )
  }
},

// get and return the time
exports.getTime = () => {
  let time = new Date();
  let m = time.getMinutes();
  let h = time.getHours();

  let month = time.getMonth() + 1;
  let day = time.getDate();
  let year = time.getYear();

  if (m < 10) {
    m = `0${m}`
  }

  year = year.toString().substring(1)

  return `${month}/${day}/${year} | ${h}:${m}`;
}

// get users tag
exports.getTag = (message) => {
  return `${message.author.username}#${message.author.discriminator}`
}

// action prohibited
exports.actionProhibited = (client, message, color, action) => {
  let embed = new RichEmbed()
    .setTitle("Action prohibited")
    .setDescription(`The following action was blocked: ${action}`)
    .setColor(color)
    .setFooter(functions.randomFooter(), client.user.avatarURL)
    .setTimestamp()

  message.channel.send(embed)

  console.log(`${functions.getTag(message)} attempted to use blocked function. More details are available in security.log`);

  functions.ownerMsg(client, 'Blocked action', `${functions.getTag(message)} attempted to use blocked function. More details are available in security.log\n\nServer ID: ${message.guild.id}\nServer Name: ${message.guild.name}`, color)

  fs.appendFile('./logs/security.log', `[${functions.getTime()}]: User ${functions.getTag(message)} attempted to use action ${action} in server ${message.guild.id} | ${message.guild.name}`, err => {
    if (err) console.log(`[${functions.getTime()}]: Failed to write to security.log: ${err.stack}`);
  })

  conn.query(`INSERT INTO logs (id, time, log_type, serverid, data) VALUES ('${Math.floor(Math.random() * settings.randomNum)}', '${functions.getTime()}', 'Security', '${message.guild.id}', '${functions.getTag()} attempted to use blocked function: ${action}')`, err => {
    if (err) {
      if (err.toString().includes('ER_TRUNCATED_WRONG_VALUE_FOR_FIELD')) return;
      fs.appendFile('./logs/errors.log', `[${functions.getTime()}]: Failed to write to SQL messagelogs: ${err}`, err => {
        if (err) console.log('Failed to write to errors.log');
      })
    }
  })
}

// errors here
exports.errorLog = (err, action) => {
  console.log(`[${functions.getTime()}]: Error: ${err.message}\nFull message is available in errors.log`);
  fs.appendFile('./logs/errors.log', `[${functions.getTime()}]: ${action} generated an error: ${err.stack}\n`, err => {
    if (err) return console.log(`Failed to write to file errors.log: ${err.stack}`);
  })
}

// music functions crap
exports.musicLog = (conn, msg) => {
  //console.log(`[${functions.getTime()}]: ${msg}`);
  fs.appendFile('./logs/music.log', `[${functions.getTime()}]: ${msg}\n`, err => {
    if (err) return console.log(`Failed to write to music.log: ${err.stack}`)
  })

  functions.realTimeLog(client, conn, message, 'Music action', `${message.author} played song. Full message: ||${msg}||.`);

  conn.query(`INSERT INTO logs (id, time, log_type, data) VALUES ('${Math.floor(Math.random() * settings.randomNum)}', '${functions.getTime()}', 'Music', '${msg}')`, err => {
    if (err) {
      if (err.toString().includes('ER_TRUNCATED_WRONG_VALUE_FOR_FIELD')) return;
      fs.appendFile('./logs/errors.log', `[${functions.getTime()}]: Failed to write to SQL messagelogs: ${err}`, err => {
        if (err) console.log('Failed to write to errors.log');
      })
    }
  })
}

// log to channel (if it exists)
exports.realTimeLog = (client, conn, message, title, desc) => {
  try {
    conn.query(`SELECT logChannel, defaultEmbedColor FROM bot_servers WHERE serverid = '${message.guild.id}';`, (err, res) => {
      if (err) return functions.errorLog(err, 'Log channel (SQL)');

      if (res[0].logChannel == 0) return; // exit if it is "blank"
      
      chan = res[0].logChannel.toString();
      
      console.log(chan);

      try {
        if (res[0].logChannel.length) {
          let embed = new RichEmbed()
            .setTitle(title.toString())
            .setColor(res[0].defaultEmbedColor)
            .setDescription(desc.toString())
            .setFooter(functions.randomFooter(), client.user.avatarURL)
            .setTimestamp()

          client.channels.get(chan).send(embed)
        }
      } catch (err) {
        console.log(err.stack);
      }
    })
  } catch (ex)
  {
    // prolly just random shit
  }
}

exports.randomFooter = () => {
  return extras.footerMsg[Math.floor(Math.random() * extras.footerMsg.length)];
}

exports.appendFile = ( file, msg ) => {
  fs.appendFile( file, `[${functions.getTime()}]: ${msg}\n`, err => {
    if (err) { console.log( "Failed to append to file! " + err ) }
    return
  })
}
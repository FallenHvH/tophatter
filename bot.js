// get discord funky
const Discord = require('discord.js');
const client = new Discord.Client({
  restTimeOffset: 1
});

// setup external modules
const fs = require('fs');
const mysql = require('mysql');
const functions = require('./commands/Shared/functions.js')
const v = require('./version.json')

// set commands
client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();



// get external files
const extras = require('./bot-files/extras.json');
const settings = require('./bot-files/settings.json');
const { replaceResultTransformer } = require('common-tags');

const antiSpam = new Set();

// bot login
function startBot() {
  if (settings.developerMode) {
    client.login(settings.devLoginKey);
  } else {
    client.login(settings.loginKey);
  }
};

// login details for sql database
const conn = mysql.createConnection({
  host:     settings.sqlHost,
  user:     settings.sqlUser,
  password: settings.sqlPass,
  database: settings.sqlDatabase
});

// add custom vars
var dateNow, dateNowComplete, authorizedAdmin, dateH, dateM, prefix, defaultEmbedColor, defaultEmbedErrorColor, defaultEmbedColor, defaultEmbedErrorColor, warnForSwearing, autoMod, warnForLinks, autoModLinks, whitelistedChannels, authorizedAdmin, warnForImages, autoModImages, whitelistedImageChannels, notMsg, autoModAntiSpam, spamCooldown, autoModEnforceAgainstAdmins;

var notified = false;
var ticketStarted = false;

// set arrays
var whitelistedRoles = [];
var whitelistedChannels = [];
var ticketArray = [];
var warnReasons = [];
var sqlResult   = [];
var userHelpList = [];
var adminHelpList = [];
var guildBans = [];
var msgNum = 1;

// clear console
console.clear();


// FUNCTIONS //

// fucking sanitize the damn inputs
function sanitize(str) {
  const charMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    "/": '&#x2F;',
  }

  const reg = /[&<>"'/]/ig;
  
  return str.replace(reg, (match) => (charMap[match]))
}

async function reconnectSQL() {
  await conn.end();

  await conn.connect();
}

async function scanMessageContent(client, conn, message, authorizedAdmin) {
  // dont enforce against server owner cause its annoying
  if (message.author.id == message.guild.ownerID) return;

  if (authorizedAdmin && autoModEnforceAgainstAdmins == 1) {
    enforce = true;
  } else if (!authorizedAdmin) {
    enforce = true;
  } else {
    enforce = false;
  }

  // swear detection // working

  var defaultEmbedColor, defaultEmbedErrorColor;

  await conn.query( `SELECT * FROM bot_servers WHERE serverid = "${message.guild.id}"`, (err, res) => {
    if (err)
    {
      return functions.errorLog( err, "calling SQL in scanMessageContent()" );
    }

    defaultEmbedColor = res[0].defaultEmbedColor;
    defaultEmbedErrorColor = res[0].defaultEmbedErrorColor;
    warnForSwearing = res[0].warnForSwearing;
  })

  if (swearState == 1 && settings.enableSwearingCensoring === true) {
    conn.query("SELECT word FROM swear_words", (err, result) => {
      if (err) {
        console.log('Failed to check for swearwords: ' + err.message)
      } else {
        for (i = 0;i < result.length;i++) {
          if (message.content.toString().toLowerCase().includes(result[i].word)) {
            fs.appendFile('./logs/swearing.log', `[${functions.getTime()}]: ${message.author.tag} (${message.author.id}) said ${result[i].word}. MESSAGE CONTENT: ${message.content.toString()}\n`, err => {
              if (err) console.log(`[${functions.getTime()}]: Failed to append to file.`)
            })

            conn.query(`INSERT INTO logs (id, time, log_type, serverid, data) VALUES ('${Math.floor(Math.random() * settings.randomNum)}', '${functions.getTime()}', 'Swearing', '${message.guild.id}', '${functions.getTag(message)} swore. Full message: ${message.content.toString()}')`, err => {
              if (err) {
                if (err.toString().includes('ER_TRUNCATED_WRONG_VALUE_FOR_FIELD')) return;
                fs.appendFile('./logs/errors.log', `[${functions.getTime()}]: Failed to write to SQL messagelogs: ${err}\n`, err => {
                  if (err) console.log('Failed to write to errors.log');
                })
              }
            })

            message.delete()

            let embed = new Discord.RichEmbed()
              .setColor(defaultEmbedErrorColor)
              .addField("Swearing Detected", "This server has swearing detection enabled. Please do not swear.")
              .addField("Glitch?", "DM the bot with issues to open a ticket.", true)
              .setFooter(extras.footerMsg[Math.floor(Math.random() * extras.footerMsg.length - 1)], client.user.avatarURL)

            message.channel.send(embed)
            .then(msg => {
              functions.realTimeLog(client, conn, message, `${message.author.tag} swore`, `${message.author} swore in ${message.channel}. (swearing filter enabled)`, defaultEmbedColor);

              setTimeout(function() {
                msg.delete()
                return;
              }, 5 * 1000)
            })

            if (warnForSwearing == 1) {
              functions.warnUser(conn, client, defaultEmbedErrorColor, defaultEmbedColor, true, message, 'Swearing');
            }
            return;
          }         
        }
      }
    })
  }

  // AUTO MOD //


  // link bot // working
  if (autoMod == 1 && autoModLinks == 1 && settings.enableAutoMod && enforce) {   
    if (message.content.toString().toLowerCase().includes('http')) {
      whitelistedChannels.forEach(channel => {
        if (channel != message.channel.id) {
          message.delete();
      
          let embed = new Discord.RichEmbed()
            .setColor(defaultEmbedErrorColor)
            .addField("Link Detected", "This server has link detection enabled and removal. Please do not send links in this channel.")
            .addField("Glitch?", "DM the bot with issues to open a ticket.", true)
            .setFooter(extras.footerMsg[Math.floor(Math.random() * extras.footerMsg.length - 1)], client.user.avatarURL)

          message.channel.send(embed)
          .then(msg => {
            functions.realTimeLog(client, conn, message, message.author, `${message.author} posted a link in ${message.channel}. (outside of whitelisted channel)`, defaultEmbedColor);

            setTimeout(function() {
              msg.delete()
              return;
            }, 10 * 1000)

            if (warnForLinks == 1) {
              functions.warnUser(conn, client, defaultEmbedErrorColor, defaultEmbedColor, true, message, 'Link outside of whitelisted link posting area');
            }
          })
        }
      })
    }
  } 


  // image bot // working
  
  if (autoMod == 1 && autoModImages == 1 && settings.enableAutoMod && enforce) {   
    if (message.attachments.size > 0) {
      whitelistedImageChannels.forEach(channel => {
        if (channel != message.channel.id) {
          message.delete();
      
          let embed = new Discord.RichEmbed()
            .setColor(defaultEmbedErrorColor)
            .addField("Image Detected", "This server has image detection enabled and removal. Please do not send images in this channel.")
            .addField("Glitch?", "DM the bot with issues to open a ticket.", true)
            .setFooter(extras.footerMsg[Math.floor(Math.random() * extras.footerMsg.length - 1)], client.user.avatarURL)

          message.channel.send(embed)
          .then(msg => {
            functions.realTimeLog(client, conn, message, message.author, `${message.author} posted an image in ${message.channel}. (outside of whitelisted channel)`, defaultEmbedColor);

            setTimeout(function() {
              msg.delete()
              return;
            }, 10 * 1000)

            if (warnForImages == 1) {
              functions.warnUser(conn, client, defaultEmbedErrorColor, defaultEmbedColor, true, message, 'Image outside of whitelisted image posting area');
            }
          })
        }
      })
    }
  } 


  // anti spam
  if (autoMod == 1 && autoModAntiSpam == 1 && settings.enableAutoMod && enforce) {
    antiSpam.add(message.author.id)
    setTimeout(() => {
      antiSpam.delete(message.author.id)
      notified = false;
    }, spamCooldown);
  }

  //functions.realTimeLog(client, conn, message, title, desc, color);

  return;
} 


function loadModules() {
  ['command'].forEach(handler => {
    require(`./handler/${handler}`)(client)
  })
}

// clear vars
function clearVars() {
  delete prefix
  delete defaultEmbedColor
  delete defaultEmbedErrorColor
  delete swearingDetectionEnabled
  delete warnForSwearing
  delete swearState
  delete autoMod
  delete warnForLinks
  delete autoModLinks
  delete whitelistedChannels
  delete warnForImages
  delete autoModImages
  delete whitelistedImages
  delete autoModAntiSpam
  delete spamCooldown
  delete autoModEnforceAgainstAdmins

  authorizedAdmin = false;
}

function activity() {
  client.user.setActivity(`Bot started on version ${v.version}`)
  setInterval(() => {

    client.user.setActivity(`Bot is running on ${client.guilds.size} servers`)

    setTimeout(() => {

      client.user.setActivity(`Use ${settings.defPrefix}help`)

      setTimeout(() => {

        client.user.setActivity("DM for support!")

      }, 5 * 1000)

    }, 5 * 1000)

  }, 15000)
}

function antiSpamCheck(message) {
  if (antiSpam.has(message.author.id)) {
    if (!notified) {
      message.reply('You are sending messages too fast!').then((msg) => setTimeout(() => msg.delete(), settings.deletingEmbedTimeout * 500));

      notified = true;
    }

    message.delete();

    return true;
  } else {
    return false;
  }
}

// check if user is admin
function isAdmin(message)
{
  if (message.member.hasPermission(['ADMINISTRATOR']) || message.member.hasPermission(['MANAGE_MESSAGES']) || message.author.id == message.guild.ownerID || message.author.id == settings.botOwnerID) {
    return true;
  } else {
    return false;
  }
}

// bot start
client.on('ready', async () => {
  if (settings.developerMode) {
    client.user.setUsername('[DEV BRANCH] ' + settings.botName);
  } else {
    client.user.setUsername(settings.botName);
  }

  activity()

  console.log(`Started ${settings.botName} by Fallen#4585`);
  console.log(`Ignoring DMs: ${settings.ignoreDMs}`);
  console.log(`Swearing censoring: ${settings.enableSwearingCensoring}`);
  console.log(`Loaded ${extras.permissionMissingMsg.length} permissing missing messages`);
  console.log(`Loaded ${extras.footerMsg.length} footer messages`);
  console.log(`Loaded ${extras.botActivities.length} custom statuses`);
  console.log(`Seconds between status switches: ${settings.activityChangeTime}`);
  console.log(`${extras.blacklistedIDs.length} Blacklisted IDs`);


  if (settings.developerMode) {
    console.log('\n\nDEVELOPER MODE ENABLED\n\n');
  }


  if (settings.logCommandMessages) {
    fs.appendFile('./logs/commands.log', `\n\n[${functions.getTime()}] | Starting logging of all commands used\n\n`, err => {
      if (err) console.error(`Failed to write to commands.log: ${err}`)
    })
  }

  if (settings.logMessages) {
    fs.appendFile('./logs/messages.log', `\n\n[${functions.getTime()}]: Starting logging for all server messages. \n\n`, err => {
      if (err) console.error(`Error writing to messages.log: ${err}`)
    })
  }

  await fs.writeFile('./servers.txt', `${settings.botName} is in ${client.guilds.size} servers:\n\n`, err => {
    if (err) console.error(`Failed to write to servers.txt: ${err}`)
  })

  client.guilds.forEach(guild => {
    fs.appendFile('./servers.txt', `${guild.id} | ${guild.name}\n`, err => {
      if (err) console.error(`Failed to append to file servers.txt: ${err.stack}`)
    })
  })

  // show how many swear words there are in the database
  if (settings.enableSwearingCensoring === true) {
    conn.query("SELECT * FROM swear_words", (err, result) => {
      if (err) {
        console.log(`Failed to call swear bank: ${err.stack}`)
      } else {
        console.log(`Loaded ${result.length} swear words`)
      }
    })
  }

  // show support tickets
  conn.query("SELECT * FROM tickets", (err, result) => {
    if (err) {
      console.log(`Failed to call tickets: ${err.stack}`)
    } else {
      console.log(`${result.length} support tickets\n`)
      console.log(`Bot loading finished. ${client.user.tag} is now 🟢ONLINE\n`)
    }
  })

  client.guilds.forEach(guild => {
    if (functions.setupSQL(conn,guild.id,guild.name))
    {
      console.log(`[${functions.getTime()}]: Setup server ${guild.name} (Server not found in database)`)
    }
  })
});

// actual code.. its a wonder aint it?
client.on('message', async message => {
  if (message.author == client.user) return;
  if (antiSpamCheck(message)) return;

  message.origContent = message.content
  message.content = sanitize(message.content.toString())

  notMsg = false;

  if (!message.guild) return;
  if (!message.content.toString().length > 0) {
    console.log(`[${functions.getTime()}]: (${message.guild.name}) <${message.guild.name}> Not a message: Ceasing run function.`);
    notMsg = true;
  } else {
    notMsg = false;
  }

  try {
    if (!notMsg) {
      let data = fs.readFileSync('./bot-files/extras.json')
      let blacklistedIDs = [];
      let parsed = JSON.parse(data);
  
      blacklistedIDs = parsed.blacklistedIDs
  
      for (i = 0;i < blacklistedIDs.length;i++) {
        if (blacklistedIDs[i] == message.author.id) {
          return console.log(`Blacklisted ID. (${functions.getTag(message)})`);
        }
      }
  
      conn.query(`SELECT enableMessageLogging FROM bot_servers WHERE serverid = "${message.guild.id}"`, (err, result) => {
        if (!result[0]) return functions.setupSQL(conn, message.guild.id, message.guild.name) // anti corruption and shit
        if (result[0].enableMessageLogging == 1)
        {
          if (settings.logMessagesToConsole) console.log(`[${functions.getTime()}]: ${functions.getTag(message)} : ${message.author.id} in ${message.guild.name} : ${message.guild.id} => ${message.content}`);
  
          if (settings.logMessages) {
            fs.appendFile('./logs/messages.log', `[${functions.getTime()}]: ${message.author.id} (${functions.getTag(message)}) in ${message.guild.id} (${message.guild.name}): ${message.content}\n`, err => {
              if (err) console.error(`Error writing to messages.log: ${err}`)
            })
      
            conn.query(`INSERT INTO logs (id, time, log_type, serverid, data) VALUES ('${Math.floor(Math.random() * settings.randomNum)}', '${functions.getTime()}', 'Message ', '${message.guild.id}', '${functions.getTag(message)}: ${message.content.toString()}')`, async (err) => {
              if (err) {          
                if (err.toString().includes('ER_TRUNCATED_WRONG_VALUE_FOR_FIELD')) return;
                fs.appendFile('./logs/errors.log', `[${functions.getTime()}]: Failed to write to SQL messagelogs: ${err}\n`, async err => {
                  if (err) {
                    console.log('Failed to write to errors.log');
                  } else {
                    reconnectSQL();
                  }
                })
              }
            })
          }
        }
      })
    }
    

    // get all server vars
    conn.query('SELECT * FROM bot_servers WHERE serverID = ' + message.guild.id, async function(err,result) {
      if (err) {
        console.log(`Failed to call database info: ${err.stack}`);
        functions.embed(client, 'Failure!','Failed to call database information!', message.channel.id);
      }
      if (result.length > 0) {
        
        

        // clear vars
        await clearVars();

        sqlResult = result;

        prefix = result[0].prefix;
        defaultEmbedColor = result[0].defaultEmbedColor;
        defaultEmbedErrorColor = result[0].defaultEmbedErrorColor;
        swearingDetectionEnabled = result[0].swearingDetectionEnabled;
        warnForSwearing = result[0].warnForSwearing;
        swearState = result[0].swearingDetectionEnabled;
        autoMod = result[0].autoMod;
        warnForLinks = result[0].warnForLinks;
        autoModLinks = result[0].autoModLinks;
        whitelistedChannels = result[0].autoModWhitelistedLinkChannels;
        warnForImages = result[0].warnForImages;
        autoModImages = result[0].autoModImages;
        whitelistedImageChannels = result[0].autoModWhitelistedImageChannels;
        autoModAntiSpam = result[0].autoModAntiSpam;
        spamCooldown = result[0].spamCooldown;
        autoModEnforceAgainstAdmins = result[0].autoModEnforceAgainstAdmins;

        try {
          whitelistedChannels = whitelistedChannels.toString().split(",")
        } catch (err) {
          // no
        }

        try {
          whitelistedImageChannels = whitelistedImageChannels.toString().split(",")
        } catch (err) {
          // no
        }
        

        // check for admin role
        var authorizedAdmin = await isAdmin(message);
          

        // delete prev args
        delete args;

        // check for args
        const args = message.content.toString().toLowerCase().split(" ");
        const command = args.shift().slice(1);
        
        // scan message   
        await scanMessageContent(client, conn, message, authorizedAdmin);
        if (prefix != message.content.substring(0,1) || notMsg) return;

        if (command == "reload") {
          if (settings.botOwnerID == message.author.id) {
            loadModules()
            return functions.embed( client, "Reloaded modules", "", defaultEmbedColor, message.channel.id )
          } else {
            return functions.actionProhibited(client, message, defaultEmbedErrorColor, 'Module Reload (Unauthorized)')
          }
        } 
        else if (command == "reloadcfg")
        {
          if (settings.botOwnerID == message.author.id) {
            const settings = require("./bot-files/settings.json")
            return functions.embed( client, "Reloaded configuration", "", defaultEmbedColor, message.channel.id )
          } else {
            return functions.actionProhibited(client, message, defaultEmbedErrorColor, 'Module Reload (Unauthorized)')
          }
        }

        // use external modules
        let cmd = client.commands.get(command);
        if (!cmd) cmd = client.commands.get(client.aliases.get(command));

      	if (cmd) {
          cmd.execute(client, conn, message, args, defaultEmbedColor, defaultEmbedErrorColor, authorizedAdmin);

          if (settings.logCommandMessages) {
            fs.appendFile('./logs/commands.log', `[${functions.getTime()}]: ${message.author.id} (${functions.getTag(message)}) ran command ${command}. Complete log of message is in message.log\n`, err => {
              if (err) console.error(`Failed to write to commands.log: ${err}`)
            })

            conn.query(`INSERT INTO logs (id, time, log_type, serverid, data) VALUES ('${Math.floor(Math.random() * settings.randomNum)}', '${functions.getTime()}', 'Command ', '${message.guild.id}', '${functions.getTag(message)} => ${message.content.toString()}')`, err => {
              if (err) {
                if (err.toString().includes('ER_TRUNCATED_WRONG_VALUE_FOR_FIELD')) return;
                fs.appendFile('./logs/errors.log', `[${functions.getTime()}]: Failed to write to SQL messagelogs: ${err}\n`, err => {
                  if (err) console.log('Failed to write to errors.log');
                })
              }
            })
          }

          if (settings.deleteCommandMsg) message.delete();
        }
      } else {
        functions.setupSQL(conn, message.guild.id, message.guild.name)
      }
    })
  } catch (err) {
    functions.errorLog(err, 'Running on message event')
  }

  // closeSQL();
})

function closeTicket(user)
{
  conn.query(`DELETE FROM tickets WHERE userid = "${user.userid}"`, err => {
    if (err) return functions.errorLog(err, "Deleting support ticket");
    
    let confEmbed = new Discord.RichEmbed()
      .setColor(settings.embed)
      .setDescription(`${settings.acceptEmoji} Ticket closed. (${user.userTag})`)
      .setThumbnail(client.users.get(user.userid.toString()).avatarURL)
      .setTimestamp()
      .setFooter(functions.randomFooter())

    client.users.get(settings.botOwnerID).send(confEmbed);
    return client.users.get(user.userid.toString()).send(confEmbed);
  })
}

function sendResponseTicket(userid, message)
{
  const embedResponse = new Discord.RichEmbed()
    .setColor(settings.embed)
    .setDescription(message.content)
    .setAuthor(message.author.tag)
    .setTimestamp()
  
  client.users.get(userid.toString()).send(embedResponse);
  return message.react(settings.acceptEmoji); 
}

// ticket system
client.on('message', async message => {
  if (message.guild) return;
  if (message.author.bot) return;
  ticketStarted = false;

  message.content = sanitize(message.content)

  if (message.content.toString().toLowerCase().startsWith("."))
  {
    if (message.content.toString().toLowerCase().startsWith( `${settings.defPrefix}tickets` ) && message.author.id == settings.botOwnerID)
    {
      const ticketsEmbed = new Discord.RichEmbed()
        .setColor(settings.embed)

      try {
        
        conn.query(`SELECT * FROM tickets`, (err, result) => {
          if (err) return functions.errorLog(err, "Calling tickets");
          if (result.length)
          {
            ticketsEmbed.setTitle("Currently open tickets:");
            
            result.forEach(item => {
              ticketsEmbed.addField(item.userTag, `${item.time}: ${item.lastMessage}`);
              if (ticketsEmbed.fields > 24) { message.channel.send(ticketsEmbed); ticketsEmbed.fields = []};
            })
            
            message.channel.send(ticketsEmbed);
          }
        })
      } catch (err)
      {
        functions.errorLog(err, "Calling active tickets from DB");
      }
      return;
    } 
    
    if (message.content.toString().toLowerCase().startsWith(`${settings.defPrefix}close`))
    {
      if (message.author.id != settings.botOwnerID)
      {
        let user = { userid: message.author.id.toString(), userTag: message.author.tag };
        closeTicket(user);
      }

      let args = message.content.split(" ");
      args.shift();

      conn.query("SELECT userTag, userid FROM tickets", (err, users) => {
        if (users.length == 1) { return closeTicket( users[0] ) }

        users.forEach(user => {
          if ([user.userTag, user.userid].includes(args[0]))
          {
            closeTicket(user);
          }
        })
      })
      return;
    }
    return;
  }

  if (message.author.id == settings.botOwnerID)
  {
    conn.query("SELECT userid, userTag, lastMessage FROM tickets", (err, tickets) => {
      if (err) return functions.errorLog(err, "Calling ticket list");

      if (tickets.length) {
        if (tickets.length == 1)
        {        
          sendResponseTicket(tickets[0].userid, message);
        } else
        {
          let skip = false;

          tickets.forEach(ticket => {
            console.log([ticket.userTag, ticket.userid].includes(message.content.toString()));
            
            if ([ticket.userTag, ticket.userid].includes(message.content.toString())) return skip = true;
          })

          if (skip) return; // ignore if its a tag          

          const whoToSend = new Discord.RichEmbed()
          .setTitle("Who to send this to?")
          .setColor(settings.embed)
          .setDescription(`Current tickets open:`)
          .setFooter("Reply with username to select")
          .setTimestamp()
          
          tickets.forEach(ticket => {
            whoToSend.addField(ticket.userTag, ticket.lastMessage);
            if (whoToSend.fields.length > 24) { message.channel.send(whoToSend); whoToSend.fields = []; }
          })
          
          message.channel.send(whoToSend)
          .then(msg => {
            const filter = m => !m.author.bot && m.author.id == message.author.id;
            message.channel.awaitMessages(filter, { time: settings.reactionWaitTime * 1000 })
            let collector = new Discord.MessageCollector(message.channel, filter)
            
            collector.on('collect', m => {
              conn.query("SELECT * FROM tickets", (err, users) => {
                if (err) return functions.errorLog(err, "Calling tickets for selection");

                users.forEach(user => {                 
                  if ([user.userTag, user.userid].includes(m.content.toString().toLowerCase()))
                  {
                    sendResponseTicket(user.userid, message);

                    msg.delete();
                    return collector.stop();
                  }
                })
              })
            })
          })
        }
      } else 
      {
        return message.channel.send("There are no tickets open.");
      }
    })
  }

  // we dont need to make tickets with ourselves
  if (message.author.id == settings.botOwnerID) return;
  
  // see if ticket is open already
  await conn.query(`SELECT ticketStarted FROM tickets WHERE userid = ${message.author.id}`, (err, result) => {
    if (err) { functions.errorLog(err, "Calling from tickets DB") } 
    else { 
      if (result.length) { ticketStarted = true } else { ticketStarted = false }; 

      if (!ticketStarted) {
        try {
          let embedConf = new Discord.RichEmbed()
            .setTitle("Open ticket?")
            .setDescription("Do you want to open a new ticket?")
            .setColor(settings.embed)

          message.channel.send(embedConf)
          .then(async msg => {
            await msg.react(settings.acceptEmoji);
            await msg.react(settings.declineEmoji);
            
            const filter = (r, u) => [settings.acceptEmoji, settings.declineEmoji].includes(r.emoji.name) && u.id === message.author.id
            const reaction = msg.createReactionCollector(filter, {time: settings.reactionWaitTime * 1000})
           
            reaction.on('collect', async r => {
              
              if (r.emoji.name == settings.acceptEmoji) {
                msg.clearReactions();
     
                // insert into db
                conn.query(`INSERT INTO tickets (id, userid, ticketStarted, userTag, lastMessage, time) VALUES ("${Math.floor(Math.random() * settings.randomNum)}", "${message.author.id}", "true", "${message.author.tag}", "${message.content}", "${functions.getTime()}")`, err => {
                  if (err) { return functions.errorLog(err, "Inserting into tickets DB") };
                  
                  ticketStarted = true;
                  
                  let embedConf = new Discord.RichEmbed()
                    .setTitle("Ticket opened")
                    .setColor(settings.embed)
                    .setDescription("Type anything to start. Everything will be relayed to staff")
                    .setFooter("to close a ticket do .close")
                    .setTimestamp()

                  msg.edit(embedConf);
                })
              } else if (r.emoji.name == settings.declineEmoji) {
                msg.clearReactions();
    
                msg.edit({embed: {
                  title: 'Action Canceled',
                  color: settings.embedColor
                }});
              }
            })
          })
        } catch (err) 
        {
          functions.errorLog(err, "Ticket system")
        }
      } else 
      {
        if (message.author.id != settings.botOwnerID)
        {
          let supportMsg = `${message.author.tag}: ${message.content}`;
          console.log(`SUPPORT MESSAGE: ${supportMsg}`);
          
          sendResponseTicket(settings.botOwnerID, message)

          conn.query(`UPDATE tickets SET lastMessage = "${message.content}", time = "${functions.getTime()}", userTag = "${message.author.tag}" WHERE userid = "${message.author.id}" `, (err) => {
            if (err) return functions.errorLog(err, "Inserting into tickets DB (lastMessage)");
          })

          message.react(settings.acceptEmoji);
        }
      }
    };
  })

  
})

// check when bot is added to server
client.on('guildCreate', guild => {
  activity()
  console.log(`Added to server ${guild.name}`)
  functions.setupSQL(conn, guild.id, guild.name)
})

// check for bot kick
client.on('guildDelete', guild => {
  activity()
  console.log(`Removed from ${guild.name}`)
  functions.deleteSQL(conn, guild.id, guild.name)
})

// msg owner if client error
client.on('error', err => {
  console.log(`Error! ${err}. More details are available in errors.log`)
  functions.ownerMsg(client, 'Client error!', `Client error: ${err}. More details are available in errors.log`)

  fs.appendFile('./logs/errors.log', `[${functions.getTime()}]: Client error: ${err.stack}\n`, err => {
    if (err) {
      console.log(`[${functions.getTime()}]: Failed to append to errors.log: ${err}`);
    }
  })
})

// this is called when a message is edited
client.on("messageUpdate", async (oldMessage, message) => {
  if (message.author == client.user) return;
  let authorizedAdmin = await isAdmin(message);
  functions.realTimeLog( client, conn, message, `${message.author.tag} Edited their message.`, `**Old content:**\n${oldMessage.content}\n\n**New content:**\n${message.content}` )

  scanMessageContent(client, conn, message, authorizedAdmin);
})

loadModules(); // load the modules dammit!

startBot();

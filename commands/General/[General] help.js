const fs = require('fs');
const functions = require('../Shared/functions.js');
const settings = require('../../bot-files/settings.json');
const extras = require('../../bot-files/extras.json')

const { RichEmbed } = require("discord.js");
var catName;

module.exports = {
  name: 'help',
  aliases: ['h'],
  catagory: 'general',
  description: 'Get the help page',
  usage: '',
  execute(client, conn, message, args, defaultEmbedColor, defaultEmbedErrorColor, authorizedAdmin) {
    getAll(client, message, defaultEmbedColor, defaultEmbedErrorColor)   
  }
}

// function to altername inline or not
function newColCheck( list )
{
  if (!catName) // check if var exists
  {
    catName = list.catagory;
    return false;
  }
  if (catName == list.catagory) return false;

  if (catName != list.catagory)
  {
    catName = list.catagory;
    return true;
  } else return false;  
}

// function to get all modules and send them to the channel
function getAll(client, message, color, errorColor) {
  try {
    var newCol = true;
    var commands = [];
    catName = '';

    const embed = new RichEmbed()
    .setColor(color)
    .setTitle(`Help`)
    .setFooter(functions.randomFooter(), client.user.avatarURL)
    .setTimestamp()
    
    const map = client.commands.map(x => {      
      if (x.catagory.toString().toLowerCase() != "hidden" && x.catagory.toString().toLowerCase() != "alpha")
      {
        if (newColCheck(x))
        {
          embed.addBlankField();
        }

        size = 1500;
        let cmdLen = embed.fields.length;
        if (commands.join("").toString().length > size || cmdLen > 24)
        {
          client.users.get(message.author.id).send(embed);
          commands = [];

          // console.log("Over ran limit. New message!");
          

          embed.fields = [];
          embed.setFooter(functions.randomFooter());
        }

        if (x.aliases.length < 0)
        {
          cmd = `${x.name} (${x.aliases.join(", ")}) - ${x.description}`;
          embed.addField(`${x.name} (${x.aliases.join(", ")}) - `, x.description, newCol);
        } else
        {
          cmd = `${x.name} - ${x.description}`;
          embed.addField(`${x.name} - `, x.description, newCol);
        }
        
        commands.push(cmd);
      } 
    })

    client.users.get(message.author.id).send(embed);
    let confEmbed = new RichEmbed()
      .setDescription(`${settings.acceptEmoji} DM'd you the help list!`)
      .setColor(color)
      .setFooter(functions.randomFooter(), client.user.avatarURL)
      .setTimestamp();

    message.channel.send(confEmbed);
    
  } catch (err)
  {
    functions.errorLog(err, "Help module")
    let failEmbed = new RichEmbed()
      .setDescription(`${settings.declineEmoji} Failed to DM help list.`)
      .setColor(errorColor)
      .setFooter(functions.randomFooter(), client.user.avatarURL)
      .setTimestamp();

    message.channel.send(failEmbed);
  }
}

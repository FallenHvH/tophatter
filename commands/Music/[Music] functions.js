const settings = require('../../bot-files/settings.json')
const functions = require('../Shared/functions.js')
const ytdl = require('ytdl-core');
const fs = require('fs')

const music = require('./[Music] functions.js')

var song;
var queueList = [];

const queue = new Map();

exports.execute = async (conn, client, message, args, defaultEmbedColor, defaultEmbedErrorColor) => {
  try {
    const serverQueue = queue.get(message.guild.id)
    const voiceChannel = message.member.voiceChannel;

    if (!voiceChannel) return functions.deletingEmbed(client, 'No voice channel', 'You need to connect to a voice channel to use this function.', defaultEmbedErrorColor, message.channel.id);
    let permissions = voiceChannel.permissionsFor(message.client.user)

    if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) return functions.deletingEmbed(client, 'Permissions invalid', 'Sorry. But the bot has to have permissions to talk and connect.', defaultEmbedErrorColor, message.channel.id)

    const songInfo = await ytdl.getInfo(args[0])
    const song = {
      title: songInfo.title,
      url: songInfo.video_url,
      user: functions.getTag(message)
    }


    if (!serverQueue) {
      const queueConstruct = {
        textChannel: message.channel,
        voiceChannel: voiceChannel,
        connection: null,
        songs: [],
        volume: 5,
        playing: true,
        loop: false
      }

      queue.set(message.guild.id, queueConstruct)

      queueConstruct.songs.push(song)

      try {
        var connection = await voiceChannel.join()
        queueConstruct.connection = connection
        music.play(conn, message, queueConstruct.songs[0], client, defaultEmbedColor, defaultEmbedErrorColor)
      } catch (err) {
        console.log(`Failed to play song: ${err}`)
        queue.delete(message.guild.id)
        functions.ownerMsg(client, 'Failed to run play function. Check errors.log for more details')
+
        console.log(`Failed to run execute function: ${err}. More details are available in errors.log`);
        fs.appendFile('./logs/errors.log', `[${functions.getTime()}]: Failed to run execute function: ${err.stack}\n`, err => {
          if (err) console.log(`Failed to write to errors.log: ${err.stack}`)
        })

        return functions.deletingEmbed(client, 'Failure', 'Failed to run execute function.', defaultEmbedErrorColor, message.channel.id)
      }
    } else {
      serverQueue.songs.push(song)
      functions.deletingEmbed(client, `**${song.user}** added **${song.title}* to the queue. Queue length: ${serverQueue.songs.length}`, '', defaultEmbedColor, message.channel.id)

      // music.play(message, serverQueue.songs[0], client, defaultEmbedColor, defaultEmbedErrorColor)
    }
    message.member.voiceChannel.join()
  } catch (err) {
    console.error(`Failed to play song: ${err}. More details are available in errors.log`)
    fs.appendFile('./logs/errors.log', `[${functions.getTime()}]: Failed to play song: ${err.stack}\n`, err => {
      if (err) console.log(`Failed to write to errors.log: ${err.stack}`);
    })
  }
}

exports.play = (conn, message, song, client, defaultEmbedColor, defaultEmbedErrorColor) => {
  try {
    serverQueue = queue.get(message.guild.id)

    if (!song) {
      serverQueue.voiceChannel.leave()
      queue.delete(message.guild.id)
      return;
    }

    const dispatcher = serverQueue.connection.playStream(ytdl(song.url))
      .on('start', () => {
        functions.embed(client, `Now playing ${song.title}`, `[Link to source](${song.url})\n\nAdded to queue by *${song.user}*`, defaultEmbedColor, message.channel.id)
        console.log(`[${functions.getTime()}]: Started ${song.title} on server ${message.guild.id}:${message.guild.name}`);
        functions.musicLog(conn, `Started ${song.title} on server ${message.guild.id}:${message.guild.name}`);
      })
      .on('end', () => {
        if (!serverQueue.loop) {
          serverQueue.songs.shift()
          functions.musicLog(conn, `Finished ${song.title} on server ${message.guild.id}:${message.guild.name}`);
        }

        music.play(conn, message, serverQueue.songs[0], client, defaultEmbedColor, defaultEmbedErrorColor)
      })
      .on('error', err => {
        console.log(`Failed to run play function: ${err}. More details are available in errors.log`)
        functions.musicLog(conn, `Error playing music: ${err.stack}`);
        fs.appendFile('./logs/errors.log', `[${functions.getTime()}]: Failed to run play function: ${err.stack}\n`, err => {
          if (err) console.log(`Failed to write to errors.log: ${err.stack}`);
        })
      })

    dispatcher.setVolumeLogarithmic(serverQueue.volume / 5)
  } catch (err) {
    console.log(err.stack);
  }
}

exports.skip= (conn, client, message, defaultEmbedColor, defaultEmbedErrorColor) => {
  functions.musicLog(conn, `Skipped song on server ${message.guild.id}:${message.guild.name}`);
  const serverQueue = queue.get(message.guild.id)

  if (!message.member.voiceChannel) return functions.deletingEmbed(client, 'No voice channel', 'You need to be in the voice channel to skip this song', defaultEmbedErrorColor, message.channel.id)
  if (!serverQueue) return functions.embed(client, 'No queue', 'There are no songs in the queue.', defaultEmbedErrorColor, message.channel.id)
  serverQueue.connection.dispatcher.end()
}

exports.stop = (conn, client, message, defaultEmbedColor, defaultEmbedErrorColor) => {
  try {
    functions.musicLog(conn, `Stopped all music on server ${message.guild.id}:${message.guild.name}`);
    // const serverQueue = queue.get(message.guild.id);
		if (!message.member.voiceChannel) return message.channel.send('You have to be in a voice channel to stop the music!');
		serverQueue.songs = [];
		serverQueue.connection.dispatcher.end();
  } catch (err) {
    // hahahahhah
  }
}

exports.pp= (conn, message, defaultEmbedColor) => {
  try {
    const serverQueue = queue.get(message.guild.id)

    serverQueue.playing = !serverQueue.playing

    if (serverQueue.playing) {
      serverQueue.connection.dispatcher.resume()
      message.channel.send({embed: {
        title: `▶️ Playing`,
        color: defaultEmbedColor
      }})
      functions.musicLog(conn, `Resuming playback on ${message.guild.id}:${message.guild.name}`);
    } else {
      serverQueue.connection.dispatcher.pause()
      message.channel.send({embed: {
        title: `⏸️ Paused`,
        color: defaultEmbedColor
      }})
      functions.musicLog(conn, `Pausing playback on ${message.guild.id}:${message.guild.name}`);
    }
  } catch (err) {
    functions.musicLog(conn, `Error resuming // pausing: ${err.stack}`);
    console.log(`Error: ${err.stack}`);
    functions.errorLog(err, 'Play and Pause')
  }
}

exports.loop = (conn, message, defaultEmbedColor) => {
  try {
    const serverQueue = queue.get(message.guild.id)

    serverQueue.loop = !serverQueue.loop

    if (serverQueue.loop) {
      message.channel.send({embed: {
        title: `🔁 Looping enabled`,
        color: defaultEmbedColor
      }})
      functions.musicLog(conn, `Loop enabled on ${message.guild.id}:${message.guild.name}`);
    } else {
      message.channel.send({embed: {
        title: `🔁 Looping disabled`,
        color: defaultEmbedColor
      }})
      functions.musicLog(conn, `Loop disabled on ${message.guild.id}:${message.guild.name}`);
    }
  } catch (err) {
    // wouldve failed because of no music playing atm
  }
}

exports.queue = (conn, message, defaultEmbedColor, defaultEmbedErrorColor) => {
  try {
    functions.musicLog(conn, `Queue was called on server ${message.guild.id}:${message.guild.name}`);
    const serverQueue = queue.get(message.guild.id)

    for (var i = 0;i < serverQueue.songs.length;i++) {
      queueList.push(`[${serverQueue.songs[i].title}](${serverQueue.songs[i].url}) (${serverQueue.songs[i].user})`)
    }

    message.channel.send({embed: {
      title: `Queue for ${message.guild.name}`,
      color: defaultEmbedColor,
      description: queueList.join('\n')
    }})
  } catch (err) {
    functions.musicLog(conn, `Failed to read queue: ${err.stack}`);
    console.log(`Failed to read queue: ${err}. More details are available in errors.log`);

    fs.appendFile('./logs/errors.log', `[${functions.getTime()}]: Failed to read queue: ${err.stack}\n`, err => {
      if (err) console.log(`Failed to write to errors.log: ${err.stack}`);
    })
  }
}

exports.control= (conn, client, message, defaultEmbedColor, defaultEmbedErrorColor) => {
  functions.musicLog(conn, `${functions.getTag(message)} opened music control panel`);
  try {
    const serverQueue = queue.get(message.guild.id)

    let time = serverQueue.connection.dispatcher.time;

    let date = new Date(time);

    let s = date.getSeconds();
    let m = date.getMinutes();
    let h = date.getHours();

    if (s < 10) {
      s = `0${s}`;
    }

    let timestamp = `${m}:${s}`;

    // let timestamp = 'NOT SET'

    message.channel.send({embed: {
      title: '[Music] Control Panel',
      color: defaultEmbedColor,
      description: `Song: **${serverQueue.songs[0].title}**\n\nTimestamp: **${timestamp}**\n\n🇶 - Queue\n🔁 - Repeat\n⏹️ - Stop\n⏯️ - Play / Pause\n⏭️ - Skip`
    }})
    .then(async msg => {
      await msg.react('🇶')
      await msg.react('🔁')
      await msg.react('⏹️')
      await msg.react('⏯️')
      await msg.react('⏭️')

      const filter = (r, u) => ['🇶', '🔁', '⏹️', '⏯️', '⏭️'].includes(r.emoji.name) && u.id === message.author.id
      const reaction = msg.createReactionCollector(filter, {time: settings.reactionWaitTime * 1000})

      reaction.on('collect', r => {
        if (r.emoji.name == '⏯️') {
          msg.clearReactions()
          music.pp(conn, message, defaultEmbedColor)
        } else if (r.emoji.name == '⏭️') {
          msg.clearReactions()
          music.skip(conn, client, message, defaultEmbedColor, defaultEmbedErrorColor)
        } else if (r.emoji.name === '⏹️') {
          msg.clearReactions()
          music.stop(conn, client, message, defaultEmbedColor, defaultEmbedErrorColor)
        } else if (r.emoji.name === '🇶') {
          msg.clearReactions()
          music.queue(conn, message, defaultEmbedColor, defaultEmbedErrorColor)
        } else if (r.emoji.name === '🔁') {
          msg.clearReactions()
          music.loop(conn, message, defaultEmbedColor)
        }
      })
    })
  } catch (err) {
    return functions.deletingEmbed(client, 'It\'s too quite', 'No songs are playing at the moment.', defaultEmbedErrorColor, message.channel.id)
  }
}

const Discord = require('discord.js');
const allowUserBotting = require('./user.js');
const client = new Discord.Client();
const fs = require('fs');

var config_token = process.env.TOKEN
var config_prefix = process.env.PREFIX
var config_owner = process.env.OWNER
var config_channel = process.env.CHANNEL

if(process.argv.slice(2) == "test") {
    var secret = fs.readFileSync('secret', 'utf8').split(/\r?\n/)
    secret.forEach(function(line) {
        line = line.split("=")
        var name = line[0]
        var value = line[1]
        str = name+' = '+value;
        eval(str)
    })
}

var voice = {}

client.on('ready', () => {
    console.log(`Online`)
    client.user.setStatus("online")
    setInterval(() => {
        var time_online = new Date()
        var time_offline = new Date()
        var time_now = new Date()
        time_offline.setHours(24,0,0,0);
        time_online.setHours(10,0,0,0);
        if(Math.floor(time_now.getTime() / 1000) == Math.floor(time_online.getTime() / 1000)) {
            console.log("online")
            client.user.setStatus("online")
        } else if(Math.floor(time_now.getTime() / 1000) == Math.floor(time_offline.getTime() / 1000)) {
            console.log("offline")
            client.user.setStatus("invisible")
        }
    }, 1000)
})

var cmdmap = {
    find: cmd_find,
    avatar: cmd_avatar,
    status: cmd_status
}

async function cmd_find(msg, args) {
    const id = await args[0]
    const voicechannel = await voice[id]
    var channel
    var guild
    if(voicechannel != null) {
        const channell = await client.channels.cache.get(voicechannel)
        channel = channell.name
        guild = channell.guild.name
    } else {
        channel = "None"
        guild = "None"
    }
    client.channels.cache.get(msg.channel.id).send("Found voice channel: " + channel + " in " + guild)
}

async function cmd_avatar(msg, args) {
    const id = await args[0]
    const user = await client.users.cache.get(id)
    if(user == undefined) { client.channels.cache.get(config_channel).send("User not found"); return false }
    await client.channels.cache.get(config_channel).send(user.avatarURL({size: 4096, "format": "png", "dynamic": true}))
}

function cmd_status(msg, args) {
    if(args[0] == "online") {
        client.user.setStatus("online")
    } else if(args[0] == "offline") {
        client.user.setStatus("invisible")
    } else if(args[0] == "idle") {
        client.user.setStatus("idle")
    } else if(args[0] == "dnd") {
        client.user.setStatus("dnd")
    } else {
        client.channels.cache.get(config_channel).send("Invalid status")
    }
}

client.on('message', (msg) => {
    if(msg.author.id == client.user.id) { return false}
    if(msg.author.id != config_owner) { return false }
    if(msg.channel.id != config_channel) { return false }
    if(msg.content.startsWith(config_prefix)) {
        var invoke = msg.content.split(' ')[0].substr(config_prefix.length)
        var args   = msg.content.split(' ').slice(1)
        if (invoke in cmdmap) {
            if (cmdmap[invoke](msg, args) == false) {
                console.log("ERROR")
            }
        }
    }
})

client.on('voiceStateUpdate', (oldState, newState) => {
    voice[newState.member.user.id] = newState.channelID
    fs.writeFileSync('./voice.json', JSON.stringify(voice))
})

allowUserBotting(client);
client.login(config_token);
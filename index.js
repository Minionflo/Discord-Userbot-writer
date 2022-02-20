const Discord = require('discord.js');
const allowUserBotting = require('./user.js');
const dclient = new Discord.Client();
const fs = require('fs');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    _id: Number,
    voicechannel: { type: String },
    flags: {type: String },
    locale: { type: String },
    status: { type: String, required: true},
    presence: { type: Array },
    tag: { type: String, required: true },
    avatarURL: { type: String, required: true },
    created: { type: Date, required: true }
}, {timestamps: true});

const botSchema = new Schema({
    _id: Number,
    status: { type: String, required: true},
    newstatus: { type: String},
    tag: { type: String, required: true },
    created: { type: Date, required: true }
}, {timestamps: true});

const voicechannelSchema = new Schema({
    _id: Number,
    members: { type: Array, required: true },
    parent: { type: String, required: true },
    userLimit: { type: Number, required: true },
    name: { type: String, required: true },
    guild: { type: String, required: true },
    created: { type: Date, required: true }
}, {timestamps: true});

const MUser = mongoose.model('User', userSchema);
const MBot = mongoose.model('Bot', botSchema);
const MVoicechannel = mongoose.model('Voicechannel', voicechannelSchema);

var config_token = process.env.TOKEN
var db_host = process.env.DB_HOST
var db_port = process.env.DB_PORT || "27017"
var db_name = process.env.DB_NAME
var db_user = process.env.DB_USER
var db_pass = process.env.DB_PASS
process.env.TZ = "UTC"


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

dclient.on('ready', async () => {
    await mongoose.connect(`mongodb://${db_user}:${db_pass}@${db_host}:${db_port}/${db_name}`, {useNewUrlParser: true, useUnifiedTopology: true})
    await console.log(`Online`)
    setInterval(async () => {
        var bott = await MBot.findById(dclient.user.id)
        if(bott.newstatus == "online") {
            await dclient.user.setStatus("online")
        } else if(bott.newstatus == "idle") {
            await dclient.user.setStatus("idle")
        } else if(bott.newstatus == "dnd") {
            await dclient.user.setStatus("dnd")
        } else if(bott.newstatus == "offline") {
            await dclient.user.setStatus("invisible")
        }
        const bot = new MBot({
            status: dclient.user.presence.status,
            newstatus: null,
            tag: dclient.user.tag,
            created: dclient.user.createdAt
        })
        bot._id = Number(await dclient.user.id)
        await MBot.findByIdAndUpdate({_id: bot._id}, bot, {upsert: true})
    } , 5000)
})

dclient.on('voiceStateUpdate', async (oldState, newState) => {
    if(newState.channel != undefined) {
        var users = []
        if(newState.channel.members != null) {
            await newState.channel.members.forEach(async (member) => {
                await users.push(member.user.id)
            })
        }  else {
            users = []
        }
        const voicechannel = new MVoicechannel({
            members: users,
            parent: newState.channel.parentID,
            userLimit: newState.channel.userLimit,
            name: newState.channel.name,
            guild: newState.guild.id,
            created: newState.channel.createdAt
        })
        voicechannel._id = Number(await newState.channel.id)
        await MVoicechannel.findByIdAndUpdate({_id: voicechannel._id}, voicechannel, {upsert: true})
    } else {
        const users = []
        const voicechannel = new MVoicechannel({
            members: users,
            guild: newState.guild.id,
        })
        voicechannel._id = Number(await oldState.channel.id)
        await MVoicechannel.findByIdAndUpdate({_id: voicechannel._id}, voicechannel, {upsert: true})
    }

    const user = new MUser({
        voicechannel: newState.channelID,
        flags: newState.member.user.flags,
        locale: newState.member.user.locale,
        status: newState.member.user.presence.status,
        presence: newState.member.user.presence.activities,
        tag: newState.member.user.tag,
        avatar: newState.member.user.avatarURL({size: 4096, "format": "png", "dynamic": true}),
        created: newState.member.user.createdAt
    })
    user._id = Number(await newState.member.user.id)
    await MUser.findByIdAndUpdate({_id: user._id}, user, {upsert: true})
})

dclient.on('presenceUpdate', async (oldState, newState) => {
    const user = new MUser({
        flags: newState.user.flags,
        locale: newState.user.locale,
        status: newState.user.presence.status,
        presence: newState.user.presence.activities,
        tag: newState.user.tag,
        avatar: newState.user.avatarURL({size: 4096, "format": "png", "dynamic": true}),
        created: newState.user.createdAt
    })
    user._id = Number(await newState.user.id)
    await MUser.findByIdAndUpdate({_id: user._id}, user, {upsert: true})
})

dclient.on('userUpdate', async (oldState, newState) => {
    const user = new MUser({
        flags: newState.flags,
        locale: newState.locale,
        status: newState.presence.status,
        presence: newState.presence.activities,
        tag: newState.tag,
        avatar: newState.avatarURL({size: 4096, "format": "png", "dynamic": true}),
        created: newState.createdAt
    })
    user._id = Number(await newState.id)
    await MUser.findByIdAndUpdate({_id: user._id}, user, {upsert: true})
})

allowUserBotting(dclient);
dclient.login(config_token);
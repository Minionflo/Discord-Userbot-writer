setInterval(() => {
    var time_online = new Date()
    var time_offline = new Date()
    var time_now = new Date()
    time_offline.setHours(24,0,0,0);
    time_online.setHours(10,0,0,0);
    console.log(Math.floor(time_online.getTime() / 1000))
    console.log(Math.floor(time_offline.getTime() / 1000))
    console.log(Math.floor(time_now.getTime() / 1000))
    if(Math.floor(time_now.getTime() / 1000) == Math.floor(time_online.getTime() / 1000)) {
        console.log("online")
    } else if(Math.floor(time_now.getTime() / 1000) == Math.floor(time_offline.getTime() / 1000)) {
        console.log("offline")
    }
}, 1000)
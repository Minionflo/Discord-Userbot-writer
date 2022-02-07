
//FULL CREDITS TO BotKalista

function allowUserBotting(client) {
    client.rest.getAuth = function () {
        const token = this.client.token || this.client.accessToken;
        if (token) return `${token}`;
        throw new Error('TOKEN_MISSING');
    }
}

module.exports = allowUserBotting;
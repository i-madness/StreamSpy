var Twitch = (function() {
    const USER  = 'world_enslaver'; // пока используем не-кастомного юзера
    const PARAMS = {
        'client_id' : '<CLIENT_ID>',
        'state' : (Math.random()*1000).toFixed(0),
        'scope' : 'user_subscriptions',
        'redirect_uri'  : 'localhost',
        'response_type' : 'code',
    }

    $.ajaxSetup({
        beforeSend : request => request.setRequestHeader('Client-ID', PARAMS.client_id)
    });

    return {
        /**
         * Авторизация на Твиче
         */
        auth : function() {
            return $.get('https://api.twitch.tv/kraken/oauth2/authorize', PARAMS);
        },

        /**
         * Получает список из подписок текущего пользователя
         */
        getFollowingList : function() {
            return $.get('https://api.twitch.tv/kraken/users/'+ USER +'/follows/channels')
        }
    }
}())
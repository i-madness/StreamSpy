var Twitch = (function($) {
'use strict';
    const USER  = 'world_enslaver'; // пока используем не-кастомного юзера
    const PARAMS = {
        'client_id' : '<CLIENT_ID>',
        'state' : (Math.random()*1000).toFixed(0), // wanna-be генерация токена
        'scope' : 'user_subscriptions',
        'redirect_uri'  : 'localhost',
        'response_type' : 'code',
    }

    $.ajaxSetup({
        beforeSend : request => request.setRequestHeader('Client-ID', PARAMS.client_id)
    });

    return {
        /**
         * Получает список из подписок текущего пользователя
         */
        getFollowingList : function() {
            return $.get('https://api.twitch.tv/kraken/users/'+ USER +'/follows/channels')
        },

        /**
         * Получает список стримов
         * @param channels {String} каналы, для которых хотим получить стримы (через ',')
         */
        getStreamList : function(channels) {
            return $.get('https://api.twitch.tv/kraken/streams', {channel : channels});
        }
    }
}(jQuery))
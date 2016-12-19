/**
 * Объект, содержащий все необходимые расширению методы для работы с Twitch API
 */
var Twitch = (function($) {
'use strict';
    const USER  = 'world_enslaver'; // пока используем не-кастомного юзера
    const PARAMS = {
        'client_id' : '<CLIENT_ID>',
    }

    // перехватываем все исходящие AJAX-запросы и добавляем в них заголовок Client-ID
    $.ajaxSetup({
        beforeSend : request => request.setRequestHeader('Client-ID', PARAMS.client_id)
    });

    return {
        /**
         * Получает список из подписок текущего пользователя
         * @returns {jqXHR}
         */
        getFollowingList : function() {
            return $.get('https://api.twitch.tv/kraken/users/'+ USER +'/follows/channels')
        },

        /**
         * Получает список стримов
         * @param channels {String} каналы, для которых хотим получить стримы (через ',')
         * @returns {jqXHR} 
         */
        getStreamList : function(channels) {
            return $.get('https://api.twitch.tv/kraken/streams', {channel : channels});
        }
    }
}(jQuery))

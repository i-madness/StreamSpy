/**
 * Объект, содержащий все необходимые расширению методы для работы с Twitch API
 */
var Twitch = (function($) {
'use strict';
    const USER  = 'world_enslaver'; // пока используем не-кастомного юзера
    const PARAMS = {
        'client_id' : '0ub9wh6r9493nk9hd2aqsfnjioknsw' //'<CLIENT_ID>',
    }

    // перехватываем все исходящие AJAX-запросы и добавляем в них заголовок Client-ID
    $.ajaxSetup({
        beforeSend : request => request.setRequestHeader('Client-ID', PARAMS.client_id)
    });

    return {
        /**
         * Минимально необходимая базовая модель канала для дальнейших проверок каналов 
         * на наличие стрима в текущий момент времени
         */
        Channel : class {
            constructor(channel) {
                if (typeof channel === 'object') {
                    this.name = channel.channel.name;
                    this.logo = channel.channel.logo;
                    this.status = channel.channel.status;
                } else if (typeof channel === 'string') {
                    this.name = channel;
                }                
                this.isOnline = false;
            }
            
            /**
             * Представление объекта канала в качестве элемента списка онлайн-стримеров, который используется в оповещении
             * @returns {Object}
             */
            asNotificationItem() {
                return {
                    title : this.name,
                    message : this.status
                }
            }
        },

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
        },
    }
}(jQuery))

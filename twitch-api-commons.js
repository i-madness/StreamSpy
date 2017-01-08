/**
 * Объект, содержащий все необходимые расширению методы для работы с Twitch API
 */
var Twitch = (function ($, browser) {
    'use strict';
    const PARAMS = {
        'client_id': '0ub9wh6r9493nk9hd2aqsfnjioknsw' //'<CLIENT_ID>',
    }

    // перехватываем все исходящие AJAX-запросы и добавляем в них заголовок Client-ID
    $.ajaxSetup({
        beforeSend: request => request.setRequestHeader('Client-ID', PARAMS.client_id)
    });

    return {
        /**
         * Минимально необходимая базовая модель канала для дальнейших проверок каналов 
         * на наличие стрима в текущий момент времени
         */
        Channel: class {
            constructor(channel) {
                if (typeof channel === 'object') {
                    this.name   = channel.channel.name;
                    this.url    = channel.channel.url;
                    this.logo   = channel.channel.logo;
                    this.status = channel.channel.status;
                    this.game   = channel.channel.game;
                }
                this.isOnline = false;
            }

            /**
             * Представление объекта канала в качестве объекта для создания оповещений через browser.notifications.create
             * @returns {Object}
             */
            asNotificationItem() {
                return {
                    type: 'basic',
                    title: this.name,
                    message: this.status,
                    iconUrl: this.logo
                }
            }
        },

        /**
         * Проверка существования данного пользователя на Twitch
         * @returns {jqXHR}
         */
        checkUserExists: function(userName) {
            return $.get('https://api.twitch.tv/kraken/users/' + userName);
        },

        /**
         * Получает список из подписок текущего пользователя
         * @returns {jqXHR}
         */
        getFollowingList: function () {
            // магия с промисами ! 
            return browser.storage.local.get('userName').then(value => {
                if (value && value.userName) {
                    return $.get('https://api.twitch.tv/kraken/users/' + value.userName + '/follows/channels')
                }
                return new Promise((resolve, reject) => {
                    reject('Имя пользователя не определено');
                });
            });
        },

        /**
         * Получает список стримов
         * @param channels {String} каналы, для которых хотим получить стримы (через ',')
         * @returns {jqXHR} 
         */
        getStreamList: function (channels) {
            return $.get('https://api.twitch.tv/kraken/streams', { channel: channels });
        },
    }
} (jQuery, browser))

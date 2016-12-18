/**
 * Ядро функционала оповещений
 */
(function($, browser, Twitch) {
'use strict';
    const INTERVAL_TIME = 10000; // TODO: make appropriate setting in settings page
    const NOTIFICATION_NAME = 'streamNotification';
    let intervalId;
    let channels;
    let streams;

    Twitch.getFollowingList().then(response =>  {
        channels = response.follows.map(ch => ch.channel.name);
        console.log('Полученные каналы:', channels.join(", "));
        intervalId = setInterval(performCheckingRequest, INTERVAL_TIME);
    }).catch(response => console.log("Ошибка при обработке запроса на сервере Twitch", response.statusText, response.status));

    /**
     * Выполняет запрос на проверку наличия стримов.
     * TODO: сделать загрузку списка подписок и проверять каждый из них по отдельности. При этом
     * сделать некий буфер тех стримов, которые уже начались
     * 
     */
    function performCheckingRequest() {
        //$.get('https://www.twitch.tv/directory/following/live') // TODO: use twitch api
        Twitch.getStreamList(channels.join(",")).then(response => {
            if (response) {
                console.log(response);
                browser.notifications.create(NOTIFICATION_NAME, {
                    type:    'basic',
                    title:   'The stream is online!',
                    message: 'Oh my actual God!'
                }).then(clearNotification);
            }
        }).fail(() => { 
            browser.notifications.create(NOTIFICATION_NAME, {
                type:    'basic',
                title:   'The error is real!',
                message: 'Oh my actual God!!!11'
            }).then(clearNotification);
       });
    }

    /**
     * Удаляет оповещение
     */
    function clearNotification() {
        setTimeout(() => browser.notifications.clear(NOTIFICATION_NAME), 3000);
    }
} (jQuery, browser, Twitch))
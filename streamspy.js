/**
 * Ядро функционала оповещений
 */
var execute = function ($, browser) {
    'use strict';
    const NOTIFICATION_NAME = 'streamNotification';
    let intervalId;
    let channels;
    let channelNames;
    let channelsAsString;
    let onlineStreamers = [];

    browser.notifications.onClicked.addListener(function (notificationId) {
        browser.tabs.create({ url: 'https://twitch.tv/' + notificationId });
    });

    Twitch.getFollowingList().then(response => {
        channels = response.follows.map(ch => new Twitch.Channel(ch));
        channelNames = channels.map(ch => ch.name);
        channelsAsString = channelNames.join(',');
        console.log('Полученные каналы:', channelsAsString);
        // после получения списка стримов формируем список каналов, которые стримят сейчас
        Twitch.getStreamList(channelsAsString).then(
            response => {
                console.debug(response.streams);
                if (response.streams.length > 0) {
                    let streamingChannels = response.streams.map(ch => ch.channel.name);
                    for (let ch of channels) {
                        if (streamingChannels.includes(ch.name)) {
                            ch.isOnline = true;
                            onlineStreamers.push(ch);
                        }
                    }
                    console.debug('streamers online', onlineStreamers)
                    // выводим всех онлайн стримеров в качестве оповещений (и больше к ним не возвращаемся)
                    onlineStreamers.forEach((streamer, index) => {
                        setTimeout(() => {
                            browser.notifications.create(streamer.name, {
                                type: 'basic',
                                title: streamer.name,
                                message: streamer.status,
                                iconUrl: streamer.logo
                            });
                        }, index * 500);
                    })
                }
                // получаем интервал проверки наличия новых стримов как ещё один Promise (кто вообще придумал такой browser.storage?)
                return browser.storage.local.get('checkDuration');
            }).then(options => {
                console.log(options);
                intervalId = setInterval(performCheckingRequest, options.checkDuration);
            });
        //
    }).catch(response => console.log("Ошибка при обработке запроса на сервере Twitch", response.statusText, response.status));

    /**
     * Выполняет запрос на проверку наличия стримов.
     */
    function performCheckingRequest() {
        Twitch.getStreamList(channelsAsString).then(response => {
            var onlineStreamerNames = onlineStreamers.map(s => s.name);
            response.streams.forEach(stream => {
                //console.log(stream);
                let ch = new Twitch.Channel(stream);
                if (!onlineStreamerNames.includes(ch.name)) {
                    browser.notifications.create(ch.name, {
                        type: 'basic',
                        title: ch.name,
                        message: ch.status,
                        iconUrl: ch.logo
                    }).then(notification => clearNotification(ch.name));
                    onlineStreamers.push(ch);
                }
            });

        }).fail(() => {
            browser.notifications.create(NOTIFICATION_NAME, {
                type: 'basic',
                title: 'The error is real!',
                message: 'Oh my actual God!!!11'
            }).then(() => clearNotification(NOTIFICATION_NAME));
        });
    }

    /**
     * Удаляет оповещение
     */
    function clearNotification(streamerName) {
        setTimeout(() => browser.notifications.clear(streamerName), 3000);
    }
}
execute(jQuery, browser);
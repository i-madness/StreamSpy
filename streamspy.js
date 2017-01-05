/**
 * Ядро функционала оповещений
 */
var execute = function ($, browser) {
    'use strict';
    const NOTIFICATION_NAME = 'streamNotification';
    let intervalId;
    let channels;
    let channelNames;
    let uncheckedChannels;
    let channelsAsString;
    let onlineStreamers = [];
    let soundMap = {
        'none' : {play:function(){}},
        'notify-1' : new Audio('/audio/notify1.mp3'),
        'notify-2' : new Audio('/audio/notify2.mp3'),
        'notify-3' : new Audio('/audio/notify3.mp3')
    };
    let notificationSound;

    browser.notifications.onClicked.addListener(function (notificationId) {
        browser.tabs.create({ url: 'https://twitch.tv/' + notificationId });
    });

    // избегаем большой кучи вложенных обещаний
    let promises = [ Twitch.getFollowingList(), fetchListOfUnchekedChannels(), fetchSoundSettings()]; 

    Promise.all(promises).then(values => {
        let response = values[0];
        uncheckedChannels = values[1].uncheckedChannels;
        notificationSound = values[2].sound ? soundMap[values[2].sound] : soundMap['none'];
        channels = response.follows.map(ch => new Twitch.Channel(ch));
        channelNames = channels.map(ch => ch.name);
        channelsAsString = channelNames.join(',');
        console.log('Полученные каналы:', channelsAsString);
        // после получения списка стримов формируем список каналов, которые стримят сейчас
        Twitch.getStreamList(channelsAsString).then(
            response => {
                console.debug(response.streams);
                if (response.streams.length > 0) {
                    let streamingChannels = response.streams.map(ch => ch.channel.name).filter(ch => !uncheckedChannels.includes(ch));
                    for (let ch of channels) {
                        if (streamingChannels.includes(ch.name)) {
                            ch.isOnline = true;
                            onlineStreamers.push(ch);
                        }
                    }
                    console.debug('streamers online', onlineStreamers)
                    onlineStreamers.length && notificationSound.play();
                    // выводим всех онлайн стримеров в качестве оповещений (и больше к ним не возвращаемся)
                    onlineStreamers.forEach((streamer, index) => {
                        setTimeout(() => {
                            browser.notifications.create(streamer.name, streamer.asNotificationItem())
                                                 .then(notification => clearNotification(streamer.name));
                        }, index * 500);
                    })
                }
                // получаем интервал проверки наличия новых стримов как ещё один Promise (кто вообще придумал такой browser.storage?)
                return browser.storage.local.get('checkDuration');
            }).then(options => {
                console.log(options);
                intervalId = setInterval(performCheckingRequest, options.checkDuration);
            });
    }).catch(response => console.log("Ошибка при обработке запроса на сервере Twitch", response));

    /**
     * Выполняет запрос на проверку наличия стримов.
     */
    function performCheckingRequest() {
        Twitch.getStreamList(channelsAsString).then(response => {
            var onlineStreamerNames = onlineStreamers.map(s => s.name);
            response.streams.forEach(stream => {
                let ch = new Twitch.Channel(stream);
                if (!onlineStreamerNames.includes(ch.name) && !uncheckedChannels.includes(ch.name)) {
                    notificationSound.play();
                    browser.notifications.create(ch.name, ch.asNotificationItem())
                                         .then(notification => clearNotification(ch.name));
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
    
    /**
     * Достаёт из local storage список непроверяемых каналов
     * @returns {Promise}
     */
    function fetchListOfUnchekedChannels() {
        return browser.storage.local.get('uncheckedChannels');
    }

    function fetchSoundSettings() {
        return browser.storage.local.get('sound');
    }
}
execute(jQuery, browser);
/**
 * Ядро функционала оповещений
 */
var execute = function ($, browser) {
    'use strict';
    const defaultNotificationName = 'streamNotification';
    let intervalId;
    let channels;
    let channelNames;
    let uncheckedChannels;
    let channelsAsString;
    let onlineStreamers = [];
    let soundMap = {
        'notify-1' : new Audio('/audio/notify1.mp3'),
        'notify-2' : new Audio('/audio/notify2.mp3'),
        'notify-3' : new Audio('/audio/notify3.mp3'),
        'none' :  {
            play : () => {} // заглушка для якобы наследника интерфейса Audio 
        }
    };
    let notificationSound;
    let checkDuration;

    browser.notifications.onClicked.addListener(function (notificationId) {
        if (notificationId == defaultNotificationName) {
            browser.runtime.openOptionsPage();
            return;
        }
        browser.tabs.create({ url: 'https://twitch.tv/' + notificationId });
    });

    // избегаем большой кучи вложенных обещаний
    let promises = [ Twitch.getFollowingList(), fetchListOfUnchekedChannels(), fetchSoundSettings(), fetchCheckDurationSettings() ]; 

    Promise.all(promises).then(values => {
        let response = values[0];
        uncheckedChannels = values[1].uncheckedChannels;
        // доставаемый из хранилища sound может оказаться пустым объектом, если значения нет, так что учитываем данный случай
        notificationSound = values[2].sound && typeof values[2].sound === 'string' ? soundMap[values[2].sound] : soundMap['none'];
        checkDuration = values[3].checkDuration;
        
        channels = response.follows.map(ch => new Twitch.Channel(ch));
        channelNames = channels.map(ch => ch.name);
        channelsAsString = channelNames.join(',');
        console.log('Полученные каналы:', channelsAsString);
        // после получения списка стримов формируем список каналов, которые стримят сейчас
        Twitch.getStreamList(channelsAsString).then(response => {
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
                    setTimeout(() => browser.notifications.create(streamer.name, streamer.asNotificationItem()), index * 500);
                })
            }
            intervalId = setInterval(performCheckingRequest, checkDuration);
        })
    }).catch(response => displayFirstStartMessage()); // TODO по-хорошему сделать обработку catch для всех промиссов из массива, но...

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
            browser.notifications.create(defaultNotificationName, {
                type:    'basic',
                title:   'Ошибка при проверке на наличие новых стримов!',
                message: 'Неизвестная ошибка'
            }).then(() => clearNotification(defaultNotificationName));
        });
    }

    /**
     * Удаляет оповещение
     */
    function clearNotification(streamerName) {
        setTimeout(() => browser.notifications.clear(streamerName), 3000);
    }

    /**
     * Показывает оповещение о том, что необходимо настроить расширение, в случае если необходимые
     * настройки ещё не заданы (например, при первом запуске расширения).
     */
    function displayFirstStartMessage() {
        browser.notifications.create(defaultNotificationName, {
            type:    'basic',
            title:   'Расширение не настроено!',
            message: 'Пожалуйста, перейдите на страницу настроек, чтобы задать необходимые параметры',
            iconUrl: 'icons/logo-96.png'
        });
    }
    
    /**
     * Достаёт из local storage список непроверяемых каналов
     * @returns {Promise}
     */
    function fetchListOfUnchekedChannels() {
        return browser.storage.local.get('uncheckedChannels');
    }

    /**
     * Достаёт из local storage звук оповещения
     * @returns {Promise}
     */
    function fetchSoundSettings() {
        return browser.storage.local.get('sound');
    }

    /**
     * Достаёт из local storage интервал времени, через которое делаются проверки наличия новых стримов
     * @returns {Promise}
     */
    function fetchCheckDurationSettings() {
        return browser.storage.local.get('checkDuration');
    }
}
execute(jQuery, browser);
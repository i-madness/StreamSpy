(function ($, browser) {
    'use strict';
    var channels;
    var uncheckedChannels;
    let runtime = browser.runtime;

    /**
     * Сохранение настроек
     */
    function saveOptions(e) {
        e.preventDefault();
        let durationValue = parseInt($('#checkDuration').val());
        let userNameValue = $('#userName').val();
        if (!durationValue || !userNameValue) {
            console.error('Ошибка: не введёно одно из обязательных полей');
            return;
        }
        browser.storage.local.set({
            checkDuration: durationValue,
            userName: userNameValue,
            uncheckedChannels: uncheckedChannels
        });

        if (runtime.reload) {
            runtime.reload();
        } else {
            displayFollowingList();
        }
    }

    /**
     * Отображаем список подписок в настройках.
     */
    function displayFollowingList() {
        Twitch.getFollowingList().then(response => {
            $("#followingList").empty();
            channels = response.follows.map(ch => new Twitch.Channel(ch));
            for (let ch of channels) {
                var isChecked = "checked";
                isChecked = uncheckedChannels.includes(ch.name) ? "" : "checked";
                let row = $('<tr/>');
                $('<td>').html('<div class="q-container"><a href="'+'https://twitch.tv/' + ch.name + '" target="_blank"><img src="'+ 
                    ch.logo +'" class="img-ch-logo"/></a></div>').appendTo(row);
                $('<td>').html('<div class="q-container">' + '<a href="'+'https://twitch.tv/' + ch.name + '" target="_blank">' + ch.name + '</a></div>').appendTo(row);
                $('<td>').html('<div class="q-container">' + ch.game + '</div>').appendTo(row);
                $('<td>').html('<div class="q-container">' +
                    '<div class="main" id="' + ch.name + '">' +
                        '<input type="checkbox" id="hidcheck_' + ch.name + '" class="hidcheck" hidden ' + isChecked + '/>' +
                        '<label class="capsule" for="hidcheck_' + ch.name + '" id="capsule-id">' +
                        '<div class="circle"></div><div class="text-signs"><span id="on"></span></div></label></div></div>').appendTo(row);
                $('#followingList').append(row);
            }
        });
    }

    browser.storage.local.get('userName').then(result => {
        $('#userName').val(result.userName);
    });

    browser.storage.local.get('checkDuration').then(result => {
        $('#checkDuration').val(result.checkDuration);
    });

    browser.storage.local.get('uncheckedChannels').then(result => {
        uncheckedChannels = result.uncheckedChannels || [];
        displayFollowingList();
    });

    // >=================================< Event handlers >=================================<

    // обработка клика по кнопке выбора канала для добавления/исключения из списка непроверяемых каналов
    $('body').on('click', '.main', function (event) {
        if (event.target.tagName != 'DIV') { // обработка случая, когда клик вызывается из неподходящего места
            return;
        }
        var channelName = $(this).attr('id');
        for (var i = 0; i < uncheckedChannels.length; i++) {
            if (uncheckedChannels[i] == channelName) {
                delete uncheckedChannels[i];
                return;
            }
        }
        if (!uncheckedChannels.length || !uncheckedChannels.includes(channelName)) {
            uncheckedChannels.push(channelName);
            return;
        }
    });

    // по отправке формы сохраняем настройки в browser.storage.local
    $("form").submit(saveOptions);

} ($, browser));
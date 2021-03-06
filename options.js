/**
 * Функционал страницы настроек
 */
(function ($, browser) {
    'use strict';
    let channels;
    let uncheckedChannels;
    let runtime = browser.runtime;
    let selectedSound;
    let soundMap = {
        'notify-1' : new Audio('/audio/notify1.mp3'),
        'notify-2' : new Audio('/audio/notify2.mp3'),
        'notify-3' : new Audio('/audio/notify3.mp3')
    };

    /**
     * Сохранение настроек
     */
    function saveOptions(e) {
        e.preventDefault();
        let durationValue = parseInt($('#checkDuration').val());
        let userNameValue = $('#userName').val();
        if (!checkFields()) {
            return;
        }
        browser.storage.local.set({
            checkDuration: durationValue*1000,
            userName: userNameValue,
            uncheckedChannels: uncheckedChannels,
            sound: selectedSound
        }).then(() => {
            let browserRebootNote = runtime.reload ? "" : ". Пожалуйста, перезапустите браузер для вступления настроек в силу"
            $('.settings-alarm').html('Настройки успешно сохранены' + browserRebootNote).show().removeClass('alarm-error').addClass('alarm-success');
            setTimeout(() => $('.settings-alarm').fadeOut(200), 3000)
            if (runtime.reload) {
                runtime.reload();
            } else {
                displayFollowingList();
            }
        });
    }

    /**
     * Отображаем список подписок в настройках.
     */
    function displayFollowingList() {
        Twitch.getFollowingList().then(response => {
            $("#followingList").empty();
            let headersRow = $('<tr/>');
            $('<td>').html('').appendTo(headersRow);
            $('<td>').html('КАНАЛ').appendTo(headersRow);
            $('<td>').html('ИГРА').appendTo(headersRow);
            $('<td>').html('ПОКАЗ ОПОВЕЩЕНИЙ').appendTo(headersRow);
            $('#followingList').append(headersRow);
            channels = response.follows.map(ch => new Twitch.Channel(ch));
            for (let ch of channels) {
                var isChecked = "checked";
                isChecked = uncheckedChannels.includes(ch.name) ? "" : "checked";
                let row = $('<tr/>');
                $('<td>').html('<div class="q-container"><a href="' + 'https://twitch.tv/' + ch.name + '" target="_blank"><img src="' +
                    ch.logo + '" class="img-ch-logo"/></a></div>').appendTo(row);
                $('<td>').html('<div class="q-container">' + '<a href="' + 'https://twitch.tv/' + ch.name + '" target="_blank">' + ch.name + '</a></div>').appendTo(row);
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

    /**
     * Проверка корректности значений в input'ах, ввод валидационных сообщений
     */
    function checkFields() {
        let durationValue = parseInt($('#checkDuration').val());
        let userNameValue = $('#userName').val();
        if (!durationValue) {
            $('#saveOptions').prop('disabled', true);
            $('.settings-alarm').html('Ошибка: значение интервала времени имеет неверный формат').show().removeClass('alarm-success').addClass('alarm-error');
            return false;
        } 
        if (!userNameValue || /\W/.test(userNameValue)) { // проверка строки на Whitespace 
            $('#saveOptions').prop('disabled', true);
            $('.settings-alarm').html('Ошибка: вы должны ввести имя пользователя').show().removeClass('alarm-success').addClass('alarm-error');
            return false;
        }
        $('#saveOptions').prop('disabled', false);
        $('.settings-alarm').fadeOut(100).removeClass('alarm-error');
        return true;
    }

    browser.storage.local.get('userName').then(result => {
        $('#userName').val(result.userName);
    });

    browser.storage.local.get('checkDuration').then(result => {
        if (result.checkDuration) {
            $('#checkDuration').val(result.checkDuration/1000);
        }       
    });

    browser.storage.local.get('uncheckedChannels').then(result => {
        uncheckedChannels = result.uncheckedChannels || [];
        displayFollowingList();
    });

    browser.storage.local.get('sound').then(result => {
        if (result.sound && typeof result.sound === 'string') {
            $('#notify-sound-list option[value=' + result.sound + ']').attr('selected', 'selected');
        }
    });

    // >=================================< Event handlers >=================================<

    $(document).ready(function () {
        $('#notify-sound-list').change(function (event) {
            selectedSound = $('#notify-sound-list option:selected').val();
            if (selectedSound != 'none') {
                soundMap[selectedSound].play();
            }
        });

        $('body').on('click', '#check-name', function (event) {
            Twitch.checkUserExists( $('#userName').val() ).then(r => {
                $('#userName').removeClass('field-error');
                $('#name-validatation-message').addClass('msg-success');
                $('#name-validatation-message').html('Пользователь найден');
                $('#name-validatation-message').show();
                if (checkFields()) {
                    $('#saveOptions').prop('disabled', false);
                }
                setTimeout(() => $('#name-validatation-message').fadeOut(300), 3000);
            }).catch(r => {
                $('#userName').addClass('field-error');
                $('#name-validatation-message').removeClass('msg-success');
                $('#name-validatation-message').html('Пользователя с данным именем не существует');
                $('#name-validatation-message').show();
                $('#saveOptions').prop('disabled', true);
            });
        });

        $('body').on('focusout', '#userName', function (event) {
            if (!checkFields()) {
                $('#userName').addClass('field-error');
            } else {
                $('#userName').removeClass('field-error');
            }
        });

        $('body').on('focusout', '#checkDuration', function (event) {
            if (!checkFields()) {
                $('#checkDuration').addClass('field-error');
            } else {
                $('#checkDuration').removeClass('field-error');
            }
        });

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
    });

} (jQuery, browser));
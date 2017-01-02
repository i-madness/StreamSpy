(function ($, browser) {
    'use strict';
    var channels;
    var uncheckedChannels;

    function saveOptions(e) {
        e.preventDefault();
        let durationValue = parseInt($('#checkDuration').val());
        let userNameValue = $('#userName').val();
        if (!durationValue || !userNameValue) {
            console.error('HOW DARE YOU!1!11');
            return;
        }
        browser.storage.local.set({
            checkDuration: durationValue,
            userName: userNameValue,
            uncheckedChannels: uncheckedChannels
        });

        displayFollowingList();
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

    /**
     * Отображаем список подписок в настройках.
     */
    function displayFollowingList() {
        Twitch.getFollowingList().then(response => {
            $("#followingList").empty();
            channels = response.follows.map(ch => new Twitch.Channel(ch));
            for (let ch of channels) {
                var isChecked = "checked";
                isChecked = uncheckedChannels.includes(ch.name)? "": "checked";
                let row = $('<tr/>');
                $('<td>').html('<div class="q-container">' + ch.name + '</div>').appendTo(row);
                $('<td>').html('<div class="q-container">' + ch.status + '</div>').appendTo(row);
                // OH SHI~~
                $('<td>').html('<div class="q-container">'+ 
                    '<div class="main" id="' + ch.name + '">' + 
                        '<input type="checkbox" id="hidcheck_' + ch.name + '" class="hidcheck" hidden ' + isChecked + '/>' + 
                        '<label class="capsule" for="hidcheck_' + ch.name + '" id="capsule-id">' + 
                        '<div class="circle"></div><div class="text-signs"><span id="on"></span></div></label></div></div>').appendTo(row);
                // чота ещё
                $('#followingList').append(row);
            }
        });
    }

    $('body').on('click', '.main', function() {
        var channelName = $(this).attr('id');//.replace('hidcheck_', '');
        for (var i = 0; i < uncheckedChannels.length; i++) {
    console.log(uncheckedChannels[i]);
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

    $("form").submit(saveOptions);
} ($, browser))

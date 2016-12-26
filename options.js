(function ($, browser) {
    'use strict';
    var channels;

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
            userName: userNameValue
        });

        displayFollowingList();

        //console.log(browser.storage.local.get("checkDuration"));
    }

    browser.storage.local.get('userName').then(result => {
        $('#userName').val(result.userName);
    });

    browser.storage.local.get('checkDuration').then(result => {
        $('#checkDuration').val(result.checkDuration);
    });

    displayFollowingList();

    /**
     * Отображаем список подписок в настройках.
     */
    function displayFollowingList() {
        Twitch.getFollowingList().then(response => {
            $("#followingList").empty();
            channels = response.follows.map(ch => new Twitch.Channel(ch));
            for (let ch of channels) {
                let row = $('<tr/>');
                $('<td>').html(ch.name).appendTo(row);
                // чота ещё
                $('#followingList').append(row);
            }
        });
    }

    $("form").submit(saveOptions);
} ($, browser))

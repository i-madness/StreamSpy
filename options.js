(function ($, browser) {
    function saveOptions(e) {
        e.preventDefault();
        let duration = parseInt($('#checkDuration').val());
        let userName = $('#userName').val();
        if (!duration || !userName) {
            console.error('HOW DARE YOU!1!11');
            return;
        }
        browser.storage.local.set({
            checkDuration: duration,
            userName: userName
        });

        browser.storage.local.get('intervalId').then(obj => {
            clearInterval(obj.intervalId);
            execute($, browser);
        });

        
        //console.log(browser.storage.local.get("checkDuration"));
    }

    $("form").submit(saveOptions);
} (jQuery, browser))

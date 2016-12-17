(function($){
'use strict';
    window.setInterval(function() {
        $.get('https://www.twitch.tv/directory/following/live')
         .then(response => {
             if (response.includes('live')) {
                 console.debug('the stream is online now');
             }
         })
    }, 10000);
}(jQuery))

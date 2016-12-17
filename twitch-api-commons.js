var Twitch = (function() {
    /**
     * Генерирует токен
     */
    function token() {
        return (Math.random()*1000).toFixed(0);
    }

    return {
        /**
         * Авторизация на Твиче
         * (что за redirect_uri? что за scope??? WTF)
         */
        auth : function() {
            let requestParams = {
                'response_type' : 'code',
                'client_id' : '0ub9wh6r9493nk9hd2aqsfnjioknsw',
                'redirect_uri' : 'localhost',
                'state' : token(),
                'scope' : ''
            };
            $.get('https://api.twitch.tv/kraken/oauth2/authorize', requestParams);
        },

        /**
         * Получает список из подписок текущего пользователя
         */
        getSubscriptionList : function() {

        }
    }
}())
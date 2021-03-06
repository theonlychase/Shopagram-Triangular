(function() {
    'use strict';

    angular
        .module('app.shopagram.authentication')

        .constant('AUTH_EVENTS', {
          notAuthenticated: 'auth-not-authenticated'
        })

        .constant('API_ENDPOINT', {
          url: 'http://127.0.0.1:8080/api'
        //   url: 'http://192.241.186.45:80/api'
          //  For a simulator use: url: 'http://127.0.0.1:8080/api'
        });
})();

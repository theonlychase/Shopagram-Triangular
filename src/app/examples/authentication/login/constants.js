(function() {
    'use strict';

    angular
        .module('app.examples.authentication')

        .constant('AUTH_EVENTS', {
          notAuthenticated: 'auth-not-authenticated'
        })

        .constant('API_ENDPOINT', {
          url: 'http://127.0.0.1:8080/api'
          //  For a simulator use: url: 'http://127.0.0.1:8080/api'
        });
})();

(function() {
    'use strict';

    angular
        .module('app.shopagram.authentication')

        .service('AuthService', function($rootScope, $q, $http, API_ENDPOINT) {
          var LOCAL_TOKEN_KEY = 'yourTokenKey';
          var isAuthenticated = false;
          var authToken;
          
          function getAuthedUser() {
            return  $http.get(API_ENDPOINT.url + '/memberinfo').then(function(result) {
                return result.data;
            });
        }
        
        var formatProfileData = function(data) {
            return {
                image: data.images.standard_resolution.url
            };
        };

         function fetchInstagram() {
            var deferred = $q.defer();

            getAuthedUser().then(function(authedUser) {
            $http({
                method: 'JSONP',
                url: 'https://api.instagram.com/v1/users/self/media/recent/?access_token=' + authedUser.user.instagram.token + '&callback=JSON_CALLBACK'
            }).then(function(response) {
                var parsedResponse = response.data.data;
                var instaProfile = [];
                for (var i = 0; i < parsedResponse.length; i++) {
                    instaProfile.push(formatProfileData(parsedResponse[i]));
                }
                    deferred.resolve(instaProfile);
                });
            });
            return deferred.promise;
        };
          
            
         function connectInstagram() {
            var deferred = $q.defer();

            $http({ method: 'JSONP', url: '/auth/instagram' }).then(function(response) {
               deferred.resolve(response);
            },
            function(err) {
               console.log(err);
            });
            return deferred.promise;
          };  
          
         function postNewProduct(product) {
            return $http.post(API_ENDPOINT.url + '/products', product)
            .then(function(response) {
                console.log(response);
                return "product added!";
            }, function (error) {
                console.log(error);
                return error;
            });
        };
        
        function getCreatedProducts() {
            return $http.get(API_ENDPOINT.url + '/products/getUserCreatedProducts').then(function(response) {
                return response.data;
                // console.log("What is this response", response.data);
            });
        };
        
        function removeProduct(id) {
            return $http.delete(API_ENDPOINT.url + '/products/' + id).then(function(response) {
                return response.data;
            });
       };
       
       function updateUserProfile(profile) {
            return $http.put(API_ENDPOINT.url + '/profile', profile).then(function(response) {
                console.log(response);
                return "settings added!";
            }, function (error) {
                console.log(error);
                return error;
            });
        };
        
        function getProductsForUser(shopname) {
            return $http.get(API_ENDPOINT.url + '/products/getProducts/' + shopname).then(function(response) {
            console.log("what is the response", response);
            return response.data;
          });
        };

          function loadUserCredentials() {
            var token = window.localStorage.getItem(LOCAL_TOKEN_KEY);
            if (token) {
              useCredentials(token);
            }
          }

          function storeUserCredentials(token) {
            window.localStorage.setItem(LOCAL_TOKEN_KEY, token);
            useCredentials(token);
          }

          function useCredentials(token) {
            isAuthenticated = true;
            authToken = token;

            // Set the token as header for your requests!
            $http.defaults.headers.common.Authorization = authToken;
          }

          function destroyUserCredentials() {
            authToken = undefined;
            isAuthenticated = false;
            $http.defaults.headers.common.Authorization = undefined;
            window.localStorage.removeItem(LOCAL_TOKEN_KEY);
          }

          var register = function(user) {
            return $q(function(resolve, reject) {
              $http.post(API_ENDPOINT.url + '/signup', user).then(function(result) {
                if (result.data.succes) {
                  resolve(result.data.msg);
                } else {
                  reject(result.data.msg);
                }
              });
            });
          };

          var login = function(user) {
            return $q(function(resolve, reject) {
              $http.post(API_ENDPOINT.url + '/authenticate', user).then(function(result) {
                if (result.data.success) {
                  storeUserCredentials(result.data.token);
                  resolve(result.data.msg);
                } else {
                  reject(result.data.msg);
                }
              });
            });
          };

          var logout = function() {
            destroyUserCredentials();
          };

          loadUserCredentials();

          return {
            login: login,
            register: register,
            logout: logout,
            isAuthenticated: function() {return isAuthenticated;},
            getAuthedUser: getAuthedUser,
            fetchInstagram: fetchInstagram,
            postNewProduct: postNewProduct,
            getCreatedProducts: getCreatedProducts,
            removeProduct: removeProduct,
            updateUserProfile: updateUserProfile,
            getProductsForUser: getProductsForUser
          };
        })

        .factory('AuthInterceptor', function ($rootScope, $q, AUTH_EVENTS) {
          return {
            responseError: function (response) {
              $rootScope.$broadcast({
                401: AUTH_EVENTS.notAuthenticated,
              }[response.status], response);
              return $q.reject(response);
            }
          };
        })

        .config(function ($httpProvider) {
          $httpProvider.interceptors.push('AuthInterceptor');
        });
})();

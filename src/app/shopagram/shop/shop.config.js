(function() {
    'use strict';

    angular
        .module('app.shopagram.shop')
        .config(moduleConfig);

    /* @ngInject */
    function moduleConfig($translatePartialLoaderProvider, $stateProvider, triMenuProvider) {
        $translatePartialLoaderProvider.addPart('app/shopagram/shop');

        $stateProvider
        .state('shop', {
            url: '/shop/:id',
            templateUrl: 'app/shopagram/shop/shop.tmpl.html',
            // set the controller to load for this page
            controller: 'ShopController',
            controllerAs: 'vm'
        });

        triMenuProvider.addMenu({
            name: 'MENU.SHOP.SHOP-MODULE',
            state: 'shop',
            // params: {
            //     id: $rootScope
            // },
            icon: 'zmdi zmdi-store',
            type: 'link',
            priority: 1.1
            // children: [{
            //     name: 'MENU.PROFILE.PROFILE-PAGE',
            //     state: 'triangular.admin-default.profile',
            //     type: 'link'
            // }]
        });
    }
})();

(function ()
{
    'use strict';

    angular
        .module('12thDoor')
        .config(routeConfig);

    /** @ngInject */
    function routeConfig($stateProvider, $urlRouterProvider, $locationProvider)
    {
        $locationProvider.html5Mode(false);

        $urlRouterProvider.otherwise('/dashboard');

        // shell core layout state definitions
        $stateProvider
            .state('app', {
                abstract: true,
                views   : {
                    'main@'         : {
                        templateUrl: 'app/core/layouts/app-primary-layout.html',
                        controller : 'MainController as vm'
                    },
                    'toolbar@app'   : {
                        templateUrl: 'app/toolbar/layouts/app-primary-layout-toolbar/toolbar.html',
                        controller : 'ToolbarController as vm'
                    },
                    'navigation@app': {
                        templateUrl: 'app/navigation/layouts/app-primary-layout-navigation/navigation.html',
                        controller : 'NavigationController as vm'
                    }
                }
            });
    }

})();

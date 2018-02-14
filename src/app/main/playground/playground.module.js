(function ()
{
    'use strict';

    angular
        .module('app.playground', [])
        .config(config);

    /** @ngInject */
    function config($stateProvider, msNavigationServiceProvider)
    {
        // State
        $stateProvider
            .state('app.playground', {
                url    : '/playground',
                views  : {
                    'content@app': {
                        templateUrl: 'app/main/playground/playground.html',
                        controller : 'PlaygroundController as vm'
                    }
                }
            })
            .state('app.playground.listclone', {
                url     : '/listclone',
                views   : {
                    'content@app': {
                        templateUrl: 'app/main/playground/listClone/list.html',
                        controller : 'PlaygroundListCloneController as vm' 
                    }
                }
            });

    }

})();
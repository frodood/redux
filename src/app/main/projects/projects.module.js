(function ()
{
    'use strict';

    angular
        .module('app.projects', [])
        .config(config);

    /** @ngInject */
    function config($stateProvider, $translatePartialLoaderProvider, msApiProvider, msNavigationServiceProvider)
    {
        // State
        $stateProvider
            .state('app.projects', {
                url    : '/projects',
                views  : {
                    'content@app': {
                        templateUrl: 'app/main/projects/projects.html',
                        controller : 'ProjectsController as vm'
                    }
                }
            });

        // Navigation

        msNavigationServiceProvider.saveItem('Projects', {
            title    : 'Projects',
            icon     : 'icon-tile-four',
            state    : 'app.projects',
            weight   : 10
        });
    }
})();
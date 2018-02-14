(function ()
{
    'use strict';

    angular
        .module('app.utils', [])
        .config(config);

    /** @ngInject */
    function config($stateProvider)
    {
        // State
        $stateProvider
            .state('app.unauthorized', {
                url    : '/unauthorized',
                views  : {
                    'content@app': {
                        templateUrl: 'app/main/utils/views/unauthorized.view.html'
                    }
                }
            });
    }
})();
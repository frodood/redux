//Estimate App version: 6.1.0.116
//Author:Divani

(function() {
    'use strict';

    angular
        .module('app.estimates', [])
        .config(config);

    /** @ngInject */
    function config($stateProvider, msApiProvider, msNavigationServiceProvider) {

        console.log('ESTIMATE 6.1.0.116');

        $stateProvider
            //Parent State
            .state('app.estimates', {
                abstract: true,
                url: '/estimates',
                resolve: {
                    Summary: function($serviceCall) {
                     
                    }

                }
            })
            //Secondary State Estimate
            .state('app.estimates.est', {
                url: '/est',
                views: {
                    'content@app': {
                        templateUrl: 'app/main/estimates/views/est/est.html',
                        controller: 'estController as vm'
                    }
                }
            })
            //Child State Estimate Detail
            .state('app.estimates.est.detail', {
                url: '/:itemId'
            }) 

            //Chiild State Create
            .state('app.estimates.compose', {
                url: '/compose',
                params : {
                    'Data' : null,
                    'appName' : null
                },
                views: {
                    'content@app': {
                        templateUrl: 'app/main/estimates/views/compose/estCompose.html',
                        controller: 'estComposeController as vm'
                    }
                },
                permModel : {                    
                    parentContext : 'estimates',                    
                    stateContext : 'add'                
                } 

            })

            .state('app.estimates.copy', {
                url: '/copy/:itemId',
                views: {
                    'content@app': {
                        templateUrl: 'app/main/estimates/views/compose/copyParent.html',
                        controller: 'copyEstCtrl as vm'
                    }
                },
                permModel : {                    
                    parentContext : 'estimates',                    
                    stateContext : 'add'                
                } 
            })

            .state('app.estimates.edit', {
                url: '/edit/:itemId',
                views: {
                    'content@app': {
                        templateUrl: 'app/main/estimates/views/compose/editParent.html',
                        controller: 'editEstCtrl as vm'
                    }
                },
                permModel : {                    
                    parentContext : 'estimates',                    
                    stateContext : 'edit'                
                } 

            })



        // Api registration
        msApiProvider.register('estimates.summary', ['app/data/invoices/summary.json']);

        // Navigation
        msNavigationServiceProvider.saveItem('Estimates', {
            title: 'Estimates',
            icon: 'icon-email',
            state: 'app.estimates.est',
            weight: 4
        });
    }
})();

(function() {
    'use strict';

    angular
        .module('app.estimates')
        .factory('$focus', $focus);

    /** @ngInject */
    function $focus($timeout, $window) {
        return function(id) {
            $timeout(function() {
                var element = $window.document.getElementById(id);
                if (element)
                    element.focus();
            });
        };
    }
})();

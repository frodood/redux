(function ()
{
    'use strict';

    angular
        .module('app.reports', [])
        .config(config);

    /** @ngInject */
    function config($stateProvider, msNavigationServiceProvider)
    {
        // State

        console.log("Report Module 6.1.0.16");
        $stateProvider
            .state('app.reports', {
                url    : '/reports',
                views  : {
                    'content@app': {
                        templateUrl: 'app/main/reports/reports.html',
                        controller : 'ReportController as vm'
                    }
                },
                permModel : {
                    parentContext : 'reports',
                    stateContext : 'add'
                }
            })
            //Secondary State Invoice
            .state('app.reports.detail',{
                url : '/:name',
                views : {
                    'content@app' : {
                        templateUrl : 'app/main/reports/detail/report-detail.html',
                        controller : 'ReportControllerChild as vm'
                        
                    }
                },
                params : {
                    title : null
                }
            }) 

        msNavigationServiceProvider.saveItem('Reports', {
            title    : 'Reports',
            icon     : 'icon-tile-four',
            state    : 'app.reports',
            weight   : 12
        });
    }


})();

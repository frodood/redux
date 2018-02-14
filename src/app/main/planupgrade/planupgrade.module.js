////////////////////////////////
// App : Plan Upgrade Module
// Owner  : Eshwaran Veerabahu
// Last changed date : 2017/01/14
// Version : 6.1.0.9
// Modified By : Eshwaran Veerabahu
/////////////////////////////////

(function ()
{
    'use strict';

    angular
        .module('app.planupgrade', [])
        .config(config);

    /** @ngInject */
    function config($stateProvider)
    {

        console.log("Plan Upgrade Module 6.1.0.9");

        // State
        $stateProvider
            .state('app.planupgrade', {
                url    : '/planupgrade',
                views  : {
                    'content@app': {
                        templateUrl: 'app/main/planupgrade/planupgrade.html',
                        controller : 'PlanUpgradeController as vm'
                    }
                }
            })
            .state('app.planupgrade.main',{
                views  : {
                    'planupgradeView': {
                        templateUrl: 'app/main/planupgrade/views/main/main.html'
                    }
                },
                permModel : {                    
                    parentContext : 'Settings',                    
                    stateContext : 'view'                
                }    
            })
            .state('app.planupgrade.payment',{
                views  : {
                    'planupgradeView': {
                        templateUrl: 'app/main/planupgrade/views/payments/paymentpage.html'
                    }
                },
                permModel : {                    
                    parentContext : 'Settings',                    
                    stateContext : 'view'                
                }    
            });
    }
})();
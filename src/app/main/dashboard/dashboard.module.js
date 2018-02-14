////////////////////////////////
// App : Dashboard App
// Owner  : Eshwaran Veerabahu
// Last changed date : 2017/02/21
// Version : 6.0.0.2
// Modified By : Eshwaran Veerabahu
/////////////////////////////////

(function()
{

	'use strict';

	angular
		.module('app.dashboard', [])
		.config(config);

	/** @ngInject */
	function config($stateProvider, msNavigationServiceProvider)
	{

        console.log("Dashboard App 6.0.0.1");

		$stateProvider
            //Parent State
            .state('app.dashboard',{
                url : '/dashboard',
                views : {
                    'content@app' : {
                        templateUrl : 'app/main/dashboard/dashboard.html',
                        controller : 'DashboardController as vm'
                    }
                },
                permModel : {                    
                    parentContext : 'dashboard',                    
                    stateContext : 'view'                
                }
            });

        msNavigationServiceProvider.saveItem('Dashboard', {
            title      : 'Dashboard',
            icon       : 'icon-chart',
            state      : 'app.dashboard',
            weight     : 1
        });
	}

})();
////////////////////////////////
// App : Three Sixty View App
// Owner  : Eshwaran Veerabahu
// Last changed date : 2017/02/06
// Version : 6.1.1.3
// Modified By : Eshwaran Veerabahu
/////////////////////////////////

(function()
{

	'use strict';

	angular
		.module('app.threesixtyview', [])
		.config(config);

	/** @ngInject */
	function config($stateProvider, msNavigationServiceProvider)
	{

        console.log("Three Sixty View App 6.1.1.3");

		$stateProvider
            //Parent State
            .state('app.threesixtyview',{
                url : '/threesixtyview',
                params : {
                    'Data' : null,
                    'appName' : null
                },
                views : {
                    'content@app' : {
                        templateUrl : 'app/main/threesixtyview/threesixtyview.html',
                        controller : 'ThreeSixtyViewController as vm'
                    }
                }
            });

        // Navigation
        msNavigationServiceProvider.saveItem('threesixtyview', {
            title      : '360 View',
            icon       : 'icon-email',
            state      : 'app.threesixtyview',
            weight     : 11
        });
	}

})();
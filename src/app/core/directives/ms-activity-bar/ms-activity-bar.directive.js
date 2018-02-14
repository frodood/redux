(function()
{
	'use strict';

	angular
		.module('app.core')
		.controller('MsActivityBarController', MsActivityBarController)
		.directive('msActivityBar', msActivityBar);

	/** @ngInject */
	function MsActivityBarController(){
		var vm  = this;
	}

	/** @ngInject */
	function msActivityBar(){

		return {
            restrict        : 'E',
            scope           : {
            	documentID: '='
            },
            templateUrl     : 'app/core/directives/ms-activity-bar/templates/activity-bar.html',
            controller: 'MsActivityBarController as MsActivityBar'
        }

	}

})();
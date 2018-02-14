(function() {
    'use strict';

    angular
        .module('app.settings')
        .controller('preferenceViewController', preferenceViewController);

    /** @ngInject */
    function preferenceViewController($scope, $rootScope, $document, $mdDialog, $mdMedia, $mdToast, $serviceCall, $mdSidenav, $state, msApi, $auth, fileUploader) {
        // use the below code on all child view controllers

        $state.go("app.settings.main.preferences.invoice");

        var vm = this;

        vm.toggleSidenav = toggleSidenav;

        function toggleSidenav(sidenavId) {
            $mdSidenav(sidenavId).toggle();
        }
        // dont change above code !

        //    	vm.preference=[];
        //    	vm.preference=[
        //    	{'appImage':'Invoices','appName':'Invoice','appUrl':'app.settings.main.preferences.invoice'},
        //    	{'appImage':'Estimates','appName':'Estimate','appUrl':'app.settings.main.preferences.estimate'},
        //    	{'appImage':'Credit Notes','appName':'Credit Note','appUrl':'app.settings.main.preferences.creditNote'},
        //    	{'appImage':'Payments','appName':'Payment','appUrl':'app.settings.main.preferences.payment'},
        //    	{'appImage':'Expenses','appName':'Expense','appUrl':'app.settings.main.preferences.expense'},
        //    	{'appImage':'Products','appName':'Product','appUrl':'app.settings.main.preferences.product'},
        //    	{'appImage':'Inventory','appName':'Inventory','appUrl':'app.settings.main.preferences.inventory'},
        //    	{'appImage':'Contacts','appName':'Contact','appUrl':'app.settings.main.preferences.contact'},
        //    	{'appImage':'Projects','appName':'Project','appUrl':'app.settings.main.preferences.project'},
        //    	{'appImage':'360 View','appName':'360 View','appUrl':''},
        //    	{'appImage':'File Manager','appName':'File Manager','appUrl':''}
        //    	];
        //
        //    	vm.preferenceChange=preferenceChange;
        //
        //    	function preferenceChange(pref){
        //    		// console.log(pref.appUrl);
        //    		// vm.appUrl=pref.appUrl;
        //    		$state.go(pref);
        //
        //    	}




    }

})();
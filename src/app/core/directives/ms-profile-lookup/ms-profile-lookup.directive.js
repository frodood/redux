(function()
{
	'use strict';

	angular
		.module('app.core')
		.controller('MsProfileLookupController', MsProfileLookupController)
		.directive('msProfileLookup', msProfileLookup);

	/** @ngInject */
	function msProfileLookup()
	{
		var profilelookupDirective = {
			restrict   : 'EA',
			scope: {
				placeholder : '=',
				required : '=',
				editoptions : '=',
				lookupclass : '=',
				isautofocus : '='
			},
			transclude : true,
			templateUrl: 'app/core/directives/ms-profile-lookup/ms-profile-lookup.html',
			controller : MsProfileLookupController,
			controllerAs : 'vm',
			bindToController : true
		};

		return profilelookupDirective;
	}

	/** @ngInject */
	function MsProfileLookupController($rootScope, $scope, $element, $attrs, $serviceCall, $mdDialog){
		var vm = this;

		vm.selectedItemChange = selectedItemChange;
		vm.searchProfile = searchProfile;

		var profileCollection = []; //all profile will be loaded into this array.

		$rootScope.$on('extupslctusr', function(ev, args){
			vm.selectedProfile = {};
			vm.selectedProfile = args;
		});

		function selectedItemChange(profile){
			$scope.$emit('selectedProfile', {slctdProfile : profile.value});
		}

        //this can be the main function which takes in diffrenet queries.
        function loadProfiles(queryBody) { 

            var getProfilesSrvc =  $serviceCall.setClient("getAllByQuery","profile"); 

            getProfilesSrvc.skip("0");
            getProfilesSrvc.take("10");
            getProfilesSrvc.class(vm.lookupclass);
            getProfilesSrvc.orderby("profileID");
            getProfilesSrvc.isAscending("false");

            return getProfilesSrvc.getSearch(queryBody).then(function(response){

            	profileCollection = [];

                var data = response.data.result;

                for (var i = 0, len = data.length; i < len; ++i) {
                    profileCollection.push({
                        display: data[i].profileName,
                    	value: data[i]           
                    });
                }
                return profileCollection

            },function(results){
                console.log('error loading data')
            }) 
        }

        function searchProfile(loadOrigin, searchTxt){

        	if(searchTxt === '' || searchTxt === undefined){
        		return loadProfiles({where : "status = 'Active' and deleteStatus = false"});
        	}else{
        		return loadProfiles({where : "status = 'Active' and deleteStatus = false and (profileName LIKE" +"'" +searchTxt+"%' OR email LIKE"+"'"+searchTxt+"%')"});
        	}
        }

	};
 
})();
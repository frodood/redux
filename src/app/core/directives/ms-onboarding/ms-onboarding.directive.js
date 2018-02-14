(function()
{
	'use strict';

	angular
		.module('app.core')
		.controller('MsOnBoardingController',MsOnBoardingController)
		.directive('msOnBoarding',msOnBoardingDirective);

	/** @ngInject */
	function msOnBoardingDirective()
	{
		var onBoardingDirective = {
			restrict        : 'E',
            templateUrl     : 'app/core/directives/ms-onboarding/ms-onboarding.html',
            scope           : {},
            controller      : MsOnBoardingController,
            controllerAs	: 'vm',
            bindToController: true 
		};

		return onBoardingDirective;
	}

	/** @ngInject */
	function MsOnBoardingController($scope, $http, $state, $timeout, profileSettingsContextService, $serviceCall, $imageUploader, $setUrl, AddressService, $mdToast)
	{
		var vm = this;

		vm.businessBoarding;

		vm.businessInfoPreview;

		var defaultCompProfileData = $serviceCall.setClient("getAll", "setting");

		defaultCompProfileData.ifSuccess(function(data){
			vm.businessBoarding = data[0].profile;
		});

		defaultCompProfileData.ifError(function(err){
			console.log(err);
		});

		defaultCompProfileData.skip(0);
		defaultCompProfileData.take(1);
		defaultCompProfileData.orderby();
		defaultCompProfileData.getReq();
		
		vm.onBoardingScreenValue = true;

		vm.formWizard = {};

		vm.bizLogo = [];

		vm.bizLogoRelativeUrl;

		vm.submitOnboardingData = submitOnboardingData;

		$scope.$watch('vm.businessBoarding',function(newVal, oldVal){
			vm.businessInfoPreview = AddressService.setAddress(vm.businessBoarding.companyName,vm.businessBoarding.street,vm.businessBoarding.city,vm.businessBoarding.state,vm.businessBoarding.zip,vm.businessBoarding.country,vm.businessBoarding.phoneNo,"",vm.businessBoarding.fax,vm.businessBoarding.companyEmail,vm.businessBoarding.website);
		}, true);

		$scope.$watch('vm.bizLogo.length', function(newVal, oldVal){
			if (vm.bizLogo.length > 0) {
				vm.bizLogoRelativeUrl = vm.bizLogo[0].lfDataUrl;
				prepImageSave(vm.bizLogo[0].lfFile);
			}else{
				vm.bizLogoRelativeUrl = "";
			}
		}, true);

		function uniqueTitleGenerator(){
			var date = new Date();
			var components = [
			date.getYear(),
			date.getMonth(),
			date.getDate(),
			date.getHours(),
			date.getMinutes(),
			date.getSeconds(),
			date.getMilliseconds()
			];
			return components.join("");
		};

		var imageFileArray;

		function prepImageSave(file){
			var extension = file.name.split('.').pop(); 
			file.uniqueCode = uniqueTitleGenerator() +"." +extension; 
			imageFileArray = file; 
			
			console.log(imageFileArray);

			var clientCompanyImage = $imageUploader.setImage(imageFileArray.uniqueCode, 'setting');
			
			clientCompanyImage.ifSuccess(function(data){

				var currentImageDate = new Date();

				vm.businessBoarding.companyLogo = {
					ID : imageFileArray.name,
					appGuid : null,
					appName: "SETTING",
					createUser: null,
					date: currentImageDate,
					imageUrl: $setUrl.imagePath+'setting/'+imageFileArray.uniqueCode,
					name: imageFileArray.name,
					size: imageFileArray.size,
					type: imageFileArray.type,
					uniqueCode: imageFileArray.uniqueCode
				};

			});

			clientCompanyImage.ifError(function(data){

				var companyImageSetFail = $mdToast.simple().content('There was an error uploading the selected profile image.').action('OK').highlightAction(false).position("bottom right");

				$mdToast.show(companyImageSetFail).then(function() {});
			});

			clientCompanyImage.sendImage(imageFileArray);
		};

		function submitOnboardingData(){

			vm.onBoardingScreenValue = false;

			vm.businessBoarding.isNewTenant = false;

			var profileSettingsCall = $serviceCall.setClient("singleupdate","setting");

			profileSettingsCall.ifSuccess(function(data){
				var boardingSuccessVal = data.isSuccess.toString();
				console.log(boardingSuccessVal);
                if(data.isSuccess === true){
					console.log('boarding success', boardingSuccessVal);
					$scope.$emit('onBoardingSuccess', true);
                }else{
					console.log('boarding not success', boardingSuccessVal);
                    $scope.$emit('onBoardingSuccess', true);
                    var boardingSettingsFailToast = $mdToast.simple().content('There was an error saving the data').action('OK').highlightAction(false).position("top right");

                    $mdToast.show(boardingSettingsFailToast).then(function() {});
                }
			});

			profileSettingsCall.ifError(function(err){
                console.log(err);
			});

			profileSettingsCall.tab('profile');

			profileSettingsCall.postReq(vm.businessBoarding);
		};

	}

})();
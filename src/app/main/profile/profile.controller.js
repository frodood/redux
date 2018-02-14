(function ()
{
    'use strict';

    angular
        .module('app.profile')
        .controller('ProfileController', ProfileController);

    /** @ngInject */
    function ProfileController($window, $rootScope, $scope, $state, $serviceCall, instanceContextService, recurlySubService, $mdDialog, $mdToast, $imageUploader, msSpinnerService)
    {
        var vm = this;

        vm.querySearchCountry = querySearchCountry;
        vm.editProfileDetails = editProfileDetails;
        vm.saveProfileDetails = saveProfileDetails;
        vm.cancelProfileDetailChanges = cancelProfileDetailChanges;
        vm.changePassword = changePassword;
        vm.navigateplanupgrade = navigateplanupgrade;
        vm.initiatePlanChange = initiatePlanChange;
        vm.addAlacart = addAlacart;
        vm.removeAlacart = removeAlacart;
        vm.setProfilePic = setProfilePic;

        vm.profileDetails;

        var profileDetailsTemp;

        var profileAccountGlblDetails;

        vm.isEditable = true;  

        vm.allCountries = [];

        vm.currentProfilePlanDetail;

        vm.planDetailsLoaded = true;

        vm.userSlotCount = 3;

        vm.currentPlanDesc = "";

        vm.isProfileFreePlan = true;

        vm.allPaymentRecords;

        vm.allCardDetails;

        vm.profilePicConfig = {
            restrict : "image/*", // upload type if this is image then use `application/*`
            size : "1MB",
            crop : true,      // enable/disable the croping feature. by defualt make it false
            type : "image", // types available are `brochure`,`image` and `all`
            maxCount : 1       // upload file count 
        }

        vm.selectedProfileTabIndex = 0;

        vm.profileCommonSpinner = msSpinnerService;

        //Imediatly executed oprations
        function IMPfetchProfileInfo(){
            instanceContextService.getProfileDetails($rootScope.cc_sessionInfo.Email)
                .then(function(response){
                    console.log(response);
                    vm.profileDetails = angular.copy(response.data);   
                });
        };

        IMPfetchProfileInfo();

        function IMPfetchAccountInfo(){
            recurlySubService.subGetAccountDetail()
                .then(function(response){
                    console.log(response);
                    if(response){
                        profileAccountGlblDetails = response;
                        checkProfileCurrentplan();
                        getPaymentLedger();
                        vm.planDetailsLoaded = true;
                    }
                }).catch(function(){

                });
        };

        IMPfetchAccountInfo();

        /*Profile Operations - start*/

            // $scope.$watch("$root.instanceProfileDetails", function(){
            //     if(Object.getOwnPropertyNames($rootScope.instanceProfileDetails).length === 0){
            //     }else{
            //         vm.profileDetails = angular.copy($rootScope.instanceProfileDetails);            
            //     }
            // });

            function editProfileDetails(){
                vm.isEditable = false;
                profileDetailsTemp = angular.copy(vm.profileDetails);
            };

            function saveProfileDetails(){
                vm.isEditable = true;

                instanceContextService.setProfileDetails(vm.profileDetails)
                    .then(function(response){
                        if(response.IsSuccess = true){
                            angular.copy(vm.profileDetails, $rootScope.instanceProfileDetails);
                            // $rootScope.instanceProfileDetails = vm.profileDetails;
                            $mdToast.show(
                                $mdToast.simple()
                                .textContent('Successfully saved changes.')
                                .position('bottom right' )
                                .hideDelay(3000)
                            );
                        }else{
                            vm.isEditable = false;
                            $mdDialog.show(
                                $mdDialog.alert()
                                    .clickOutsideToClose(true)
                                    .title('Error saving profile changes')
                                    .textContent('There was an error in saving profile details.')
                                    .ariaLabel('Error Profile Update')
                                    .ok('Got it!')
                                    .targetEvent(ev)
                            );
                        }
                        
                    });
            };

            function cancelProfileDetailChanges(){
                vm.isEditable = true;
                vm.profileDetails = angular.copy(profileDetailsTemp);
            }

            function changePassword(ev){
                $mdDialog.show({
                    templateUrl: 'app/main/profile/views/profile-details/modals/changePassword-modal.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    controller: chngPasswordController,
                    clickOutsideToClose: true
                })
                .then(function (answer) {}, function () {});

                chngPasswordController.$inject = ['$scope', '$rootScope', '$window', '$mdDialog', '$mdToast', 'instanceContextService'];

                function chngPasswordController($scope, $rootScope, $window, $mdDialog, $mdToast, instanceContextService){

                    $scope.submitChangePassword = function(){
                        instanceContextService.setNewPassword($scope.changePasswordDetails.OldPassword,$scope.changePasswordDetails.Password)
                            .then(function(response){
                                $mdDialog.hide();

                                if(response.isSuccess === true){
                                    $mdToast.show(
                                        $mdToast.simple()
                                        .textContent('Successfully changed password')
                                        .position('bottom right' )
                                        .hideDelay(3000)
                                    );
                                }else{
                                    $mdDialog.show(
                                        $mdDialog.alert()
                                            .clickOutsideToClose(true)
                                            .title('Incorrect password details')
                                            .textContent('Current password does not exist.')
                                            .ariaLabel('Incorrect password details')
                                            .ok('Got it!')
                                            .targetEvent(ev)
                                    );
                                }
                            });
                    };

                    $scope.cancelChngPassword = function(){
                        $mdDialog.hide();
                    };
                }
            };

            function querySearchCountry(query){
                vm.results = [];
                for (var i = 0, len = vm.allCountries.length; i < len; ++i) {
                
                    if (vm.allCountries[i].country.toUpperCase().startsWith(query.toUpperCase()) ) {
                        vm.results.push(vm.allCountries[i]);
                    }
                }
                return vm.results;
            };

            function loadCountries(){
            var client =  $serviceCall.setClient("getCountries","profile"); // method name and service
            client.ifSuccess(function(data){   
                if(data.length > 0){
                for (var i = data.length - 1; i >= 0; i--) {
                    vm.allCountries.push({
                    country: data[i].country_name
                    })
                }
                }
            })
            client.ifError(function(data){ 
            
            })
            client.postReq();
            }

            loadCountries();

        /*Profile Operations - end*/

        /*Profile pic update - start*/

            function setProfilePic(res){
                if(res.hasOwnProperty('image')){
                    console.log(res);
                    console.log(res.image[0]);

                    var client = $imageUploader.setImage(vm.profileDetails.Email+'.png','profilePictures');
                        client.ifSuccess(function(data){ 
                            console.log('success image uploaded',data);
                            $rootScope.instanceProfileDetails.ProfilePicture = window.location.protocol+"//"+$rootScope.cc_sessionInfo.Domain+"/apis/media/tenant/image/profilePictures/"+$rootScope.cc_sessionInfo.Username+".png?decache="+Math.random(); 
                            console.log($rootScope.instanceProfileDetails.ProfilePicture);
                        });
                        client.ifError(function(data){
                            console.log('error image was not uploaded',data); 
                        });
                        client.sendImage(res.image[0]);
                } 
            }

        /*Profile pic update - end*/

        /*Plan Operations - start*/

            function checkProfileCurrentplan(){

                if(profileAccountGlblDetails.plan_code === "12d-free-plan"){
                    vm.currentPlanDesc = "12thDoor Free Plan";
                }else if(profileAccountGlblDetails.plan_code === "12d-business-monthly-plan"){
                    vm.currentPlanDesc = "12thDoor Business Monthly Plan";
                    checkAddonUsage();
                }else{
                    vm.currentPlanDesc = "12thDoor Business Yearly Plan";
                    checkAddonUsage();
                }
                
            }

            function checkAddonUsage(){
                recurlySubService.chckAddonLvl(profileAccountGlblDetails.account_code)
                    .then(function(data){
                        vm.userSlotCount = parseInt(data.data);
                    }).catch(function(err){
                        console.log('could not get add on usage !');
                    });
            }

            function navigateplanupgrade(){
                $state.go('app.planupgrade.main');
            }

            function initiatePlanChange(){
                $state.go('app.planupgrade.main');
            }

            var stripWildcard = function(rawDomain){
                rawDomain = rawDomain.substring(rawDomain.indexOf('.') + 1);
                return rawDomain;
            };

            var currentDowngradedDomain = stripWildcard(window.location.host);

            function implementChangePlan(){
                $state.go('app.planupgrade.main');
            }

        /*Plan Operations - end*/


        /*User slot Operations - start*/

            function addAlacart(ev){
                $mdDialog.show({
                    templateUrl: 'app/main/profile/views/manage-plan/modals/alacartVariant.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    controller: addAlacartController,
                    clickOutsideToClose: true
                })
                .then(function (answer) {}, function () {});

                /** @ngInject */
                function addAlacartController($scope, $rootScope, $window, $mdDialog, recurlySubService){
                    $scope.slots = 1;
                    $scope.minSlots = 1;
                    $scope.maxSlots = 100;
                    $scope.showMonthlyVariant = true;
                    $scope.purchaseState = false;

                    $scope.slotPrices = {
                        monthly:3,
                        yearly:36
                    };

                    var currSubDetail = $rootScope.activeSubscriptionDetail;

                    $scope.alacartPayload = {
                        accCode:currSubDetail.account_code,
                        subCode:currSubDetail.uuid,
                        planCode:currSubDetail.plan_code,
                        alaCode:"user",
                        slots:1
                    }
                    
                    if(currSubDetail.plan_code === "12d-business-monthly-plan"){
                        $scope.showMonthlyVariant = true;
                        $scope.alacartPayload.unitAmount = $scope.slotPrices.monthly * 100;
                    }else{
                        $scope.showMonthlyVariant = false;
                        $scope.alacartPayload.unitAmount = $scope.slotPrices.yearly * 100;
                    }

                    $scope.buyAlacartOption = function(ev){
                        $scope.purchaseState = true;
                        recurlySubService.subLogAddonUsage($scope.alacartPayload)
                            .then(function(data){
                                if(data.data.isSuccess == true){
                                    updateAddonQuantity($scope.alacartPayload.slots);
                                    getPaymentLedger();
                                    purchaseAlacartMessage(ev, 'Success', 'You have successfully added additional requested users to your business.');
                                }else{
                                    purchaseAlacartMessage(ev, 'Fail', 'Unable to remove additional users, since these users are already in use.');
                                }
                            }).catch(function(err){
                                purchaseAlacartMessage(ev, 'Fail', 'Unable to process your request. Please try again or contact support for further assistance.');
                            });
                            
                        $mdDialog.hide();
                    }

                    function updateAddonQuantity(addonQty){
                        vm.userSlotCount = vm.userSlotCount + addonQty;
                    }
                    
                    function purchaseAlacartMessage(ev, title, message){
                        
                        $mdDialog.show(
                            $mdDialog.alert()
                                .clickOutsideToClose(true)
                                .title(''+title+'')
                                .textContent(''+message+'')
                                .ariaLabel('Purchase Alert')
                                .ok('Got it!')
                                .targetEvent(ev)
                        );
                    }

                }
            }

            function removeAlacart(ev){
                $mdDialog.show({
                    templateUrl: 'app/main/profile/views/manage-plan/modals/removeAlacartModal.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    controller: removeAlacartController,
                    clickOutsideToClose: true
                })
                .then(function (answer) {}, function () {});

                function removeAlacartController($scope, $rootScope, $window, $mdDialog, recurlySubService){
                    $scope.rmvAlacartQty = 0;
                    $scope.rmvMinSlots = 0;
                    $scope.rmvMaxSlots = vm.userSlotCount - 3;
                    $scope.removeAlacartState = false;

                    $scope.rmvSlotPrices = {
                        monthly:3,
                        yearly:36
                    };

                    var rmvCurrSubDetail = $rootScope.activeSubscriptionDetail;
                    
                    $scope.rmvAlacartPayload = {
                        accCode:rmvCurrSubDetail.account_code,
                        subCode:rmvCurrSubDetail.uuid,
                        planCode:rmvCurrSubDetail.plan_code,
                        alaCode:"user",
                        slots:0
                    }

                    if(rmvCurrSubDetail.plan_code === "12d-business-monthly-plan"){
                        $scope.rmvAlacartPayload.unitAmount = $scope.rmvSlotPrices.monthly * 100;
                    }else{
                        $scope.rmvAlacartPayload.unitAmount = $scope.rmvSlotPrices.yearly * 100;
                    }

                    $scope.rmvAlacartSlotCount = 0;

                    $scope.removeAlacartOption = function(ev){
                        $scope.removeAlacartState = true;
                        $scope.rmvAlacartPayload.slots = $scope.rmvAlacartSlotCount*-1;
                        recurlySubService.subLogAddonUsage($scope.rmvAlacartPayload)
                            .then(function(data){
                                if(data.data.isSuccess == true){
                                    updateRmvAddonQuantity($scope.rmvAlacartSlotCount);
                                    removeAlacartMessage(ev, 'Success', 'You have successfully removed additional users from your business.');
                                }else{
                                    removeAlacartMessage(ev, 'Fail', 'Unable to process your request. Please try again or contact support for further assistance.');
                                }
                            }).catch(function(err){
                                removeAlacartMessage(ev, 'Fail', 'Unable to process your request. Please try again or contact support for further assistance.');
                            });
                            
                        $mdDialog.hide();
                    }

                    function updateRmvAddonQuantity(rmvAddonQty){
                        vm.userSlotCount = vm.userSlotCount - rmvAddonQty;
                    }

                    function removeAlacartMessage(ev, title, message){
                        
                        $mdDialog.show(
                            $mdDialog.alert()
                                .clickOutsideToClose(true)
                                .title(''+title+'')
                                .textContent(''+message+'')
                                .ariaLabel('Purchase Alert')
                                .ok('Got it!')
                                .targetEvent(ev)
                        );
                    }

                }
            }

        /*User slot Operations - end*/

        /*Get payment ledger - start*/

            function getPaymentLedger(){
                vm.profileCommonSpinner.show('profile-ledger-spinner');
                recurlySubService.subGetAccountTransactionDetail(profileAccountGlblDetails.account_code)
                    .then(function(data){
                        vm.profileCommonSpinner.hide('profile-ledger-spinner');
                        vm.allPaymentRecords = data.data;
                        console.log(vm.allPaymentRecords);
                    });
            }

        /*Get payment ledger - end*/

    }
})();

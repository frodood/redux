(function() {
    'use strict';

    angular
        .module('app.settings')
        .controller('profileViewController', profileViewController);

    /** @ngInject */
    function profileViewController($scope, $rootScope, $document, $mdDialog, $mdMedia, $mdToast, $serviceCall, $mdSidenav, $state, msApi, $auth, uploaderService, $imageUploader, $apis, $setUrl, msSpinnerService, profileSettingsContextService) {
        // use the below code on all child view controllers
        var vm = this;

        vm.toggleSidenav = toggleSidenav;

        function toggleSidenav(sidenavId) {
            $mdSidenav(sidenavId).toggle();
        }
        // dont change above code !

        vm.addcusfieldsProfile = addcusfieldsProfile;
        vm.editCusfieldsProfile = editCusfieldsProfile;
        vm.deleteProfileCusfieldsrow = deleteProfileCusfieldsrow;
        vm.saveProfile = saveProfile;
        vm.uploadImage = uploadImage;

        vm.imageConfig = {
          restrict : "image/*",
          size : "2MB",
          crop : true,
          type : "image",
          maxCount : 1
        }

        vm.spinnerService = msSpinnerService;

        vm.settingLoadProfileDetailsSpinnerLoaded = settingLoadProfileDetailsSpinnerLoaded;

        function settingLoadProfileDetailsSpinnerLoaded(profileDetailsSpinner){
            profileDetailsSpinner.show('setting-loadProfileDetails-spinner');

        }

        // $scope.$on('selectedTimezone', function(ev, args) {
        //     var obj = [];
        //     console.log(args.slctdTimezone);
        // });

        // vm.fullTimeZoneArray=[];
        // function loadTimeZone(){
        //      var client = $serviceCall.setClient("getZoneList","setting");
        //      client.ifSuccess(function(data){
        //         var data = data;
        //         console.log(data);
        //         vm.fullTimeZoneArray= data; 
        //        });
        //        client.ifError(function(data){
                
        //        })
        //        client.skip('');
        //        client.take('');
        //        client.getReq();
        // }

        vm.fullTimeZoneArray=[];
        vm.fullTimeZoneArrayLowerCase=[];
        function loadTimeZone(){
             var client = $serviceCall.setClient("getZoneList","setting");
             client.ifSuccess(function(data){
                var data = data;
                console.log(data);
                vm.fullTimeZoneArray= data;
                vm.fullTimeZoneArrayLowerCase = angular.copy(vm.fullTimeZoneArray);
               });
               client.ifError(function(data){
                
               })
               client.skip('');
               client.take('');
               client.getReq();
        }

        loadTimeZone();

        vm.querySearch = querySearch;

        vm.searchText = null;

        // function querySearch(query) {
            
        //     var results = [];
        //     for (var i = 0, len = vm.fullTimeZoneArray.length; i < len; ++i) {
               
        //         vm.fullTimeZoneArray[i].zone_name = vm.fullTimeZoneArray[i].zone_name.toLowerCase();   
        //         if (vm.fullTimeZoneArray[i].zone_name.indexOf(query.toLowerCase()) != -1) {
        //             // vm.fullTimeZoneArray[i].zone_name = vm.fullTimeZoneArray[i].zone_name.()
        //             vm.fullTimeZoneArray[i].zone_name = vm.fullTimeZoneArray[i].zone_name.toLowerCase().replace(/\b[a-z]/g, function(letter) {
        //                 return letter.toUpperCase();
        //             });
        //             results.push(vm.fullTimeZoneArray[i]);
        //         }

        //     }
        //     return results;
        // }

        function querySearch(query) {
            
            var results = [];
            for (var i = 0, len = vm.fullTimeZoneArrayLowerCase.length; i < len; ++i) {
               
                vm.fullTimeZoneArrayLowerCase[i].zone_name = vm.fullTimeZoneArrayLowerCase[i].zone_name.toLowerCase();   
                if (vm.fullTimeZoneArrayLowerCase[i].zone_name.indexOf(query.toLowerCase()) != -1) {
                    // vm.fullTimeZoneArray[i].zone_name = vm.fullTimeZoneArray[i].zone_name.()
                    vm.fullTimeZoneArrayLowerCase[i].zone_name = vm.fullTimeZoneArrayLowerCase[i].zone_name.toLowerCase().replace(/\b[a-z]/g, function(letter) {
                        return letter.toUpperCase();
                    });
                    results.push(vm.fullTimeZoneArray[i]);
                }

            }
            return results;
        }


        
        function loadSetting() {
            var client = $serviceCall.setClient("getAll", "setting"); // method name and service
            client.ifSuccess(function(data) {

                console.log(data[0]);
                vm.Settings12thdoor = data[0];
                if (vm.Settings12thdoor.profile.companyLogo.uniqueCode != '') {
                    vm.uploadFile = $setUrl.imagePath + 'setting/' + vm.Settings12thdoor.profile.companyLogo.uniqueCode;
                } else {
                    vm.uploadFile = vm.Settings12thdoor.profile.companyLogo.imageUrl;
                }

                vm.selectedItem = []; 
                vm.selectedItem.zone_name = vm.Settings12thdoor.profile.zoneName;
                vm.selectedItem.country_code = vm.Settings12thdoor.profile.locationCode;

                console.log(vm.selectedItem);

                // vm.Settings12thdoor.profile.transactionEnd = new Date(vm.Settings12thdoor.profile.transactionEnd);
                // vm.Settings12thdoor.profile.transactionStart = new Date(vm.Settings12thdoor.profile.transactionStart);

                // var temp = (moment.utc(vm.Settings12thdoor.profile.transactionStart));
                // var tempE = (moment.utc(vm.Settings12thdoor.profile.transactionEnd));
                
                vm.spinnerService.hide('setting-loadProfileDetails-spinner');

            });
            client.ifError(function(data) {
                vm.spinnerService.hide('setting-loadProfileDetails-spinner');
                var toast = $mdToast.simple().content('There was an error, when data loading').action('OK').highlightAction(false).position("top right");
                $mdToast.show(toast).then(function() {});
            })

            client.skip(0);
            client.take(1);
            client.orderby();
            client.getReq();
        }
        loadSetting();

        function saveProfile() {
            vm.spinnerService.show('setting-profileTab-spinner');

            console.log(vm.selectedItem);

            vm.Settings12thdoor.profile.zoneName = vm.selectedItem.zone_name;
            vm.Settings12thdoor.profile.locationCode = vm.selectedItem.country_code;

            if (vm.imageArray != undefined) {
                var client = $imageUploader.setImage(vm.imageArray[0].uniqueCode, 'setting');
                client.ifSuccess(function(data) {
                    console.log(data);
                });
                client.ifError(function(data) {});
                client.sendImage(vm.imageArray[0]);

                vm.Settings12thdoor.profile.companyLogo.imageUrl = $setUrl.imagePath + 'setting/' + vm.imageArray[0].uniqueCode;
                console.log(vm.Settings12thdoor.profile.companyLogo.imageUrl);
            }

            function formatDate(date) {
            var d = new Date(date),
             month = '' + (d.getMonth() + 1),
             day = '' + d.getDate(),
             year = d.getFullYear();
          


            if (month.length < 2) month = '0' + month;
            if (day.length < 2) day = '0' + day;

            return [year, month, day].join('-');
        }

        vm.Settings12thdoor.profile.transactionStart = formatDate(vm.Settings12thdoor.profile.transactionStart);
        
        vm.Settings12thdoor.profile.transactionEnd = formatDate(vm.Settings12thdoor.profile.transactionEnd);



            // console.log(vm.Settings12thdoor.profile.transactionEnd);
            // console.log(vm.Settings12thdoor.profile.transactionStart);

            //set date using moment
            // vm.Settings12thdoor.profile.transactionEnd = moment(vm.Settings12thdoor.profile.transactionEnd).format('YYYY-MM-DD HH:mm:ss');
            // vm.Settings12thdoor.profile.transactionStart = moment(vm.Settings12thdoor.profile.transactionStart).format('YYYY-MM-DD HH:mm:ss')

            //check date range...........................
  
            if (vm.Settings12thdoor.profile.transactionEnd == vm.Settings12thdoor.profile.transactionStart) {
                $mdDialog.show($mdDialog.alert().parent(angular.element(document.querySelector('#popupContainer'))).clickOutsideToClose(true)
                    .title('Alert').textContent('Financial End Date and Financial Start Date are equals, Change Financial End Date').ariaLabel('Alert Dialog Demo').ok('Ok!').targetEvent());
            }
  
            if (vm.Settings12thdoor.profile.transactionEnd < vm.Settings12thdoor.profile.transactionStart) {
                $mdDialog.show($mdDialog.alert().parent(angular.element(document.querySelector('#popupContainer'))).clickOutsideToClose(true)
                    .title('Alert').textContent('Financial End Date have to bigger than Financial Start Date').ariaLabel('Alert Dialog Demo').ok('Ok!').targetEvent());
            }
     
            if (vm.Settings12thdoor.profile.transactionEnd != vm.Settings12thdoor.profile.transactionStart && vm.Settings12thdoor.profile.transactionEnd > vm.Settings12thdoor.profile.transactionStart) {

                var client = $serviceCall.setClient("singleupdate", "setting"); // method name and service
                client.ifSuccess(function(data) { //success 

                    profileSettingsContextService.setProfileSettingsData()
                    .then(function(response){
                        var toast = $mdToast.simple().content('Business successfully saved').action('OK').highlightAction(false).position("top right");
                         $mdToast.show(toast).then(function() {});
                    });

                    vm.spinnerService.hide('setting-profileTab-spinner');
                });
                client.ifError(function(data) { //false
                    vm.spinnerService.hide('setting-profileTab-spinner');
                    var toast = $mdToast.simple().content('There was an error saving the data').action('OK').highlightAction(false).position("top right");
                    $mdToast.show(toast).then(function() {});
                })
                client.tab('profile');
                
                client.postReq(vm.Settings12thdoor.profile);
            }




        };

        function uploadImage(res) {
            // var type = image;

            // console.log(type); 
            // fileUploaderSetting.uploadFile(type);
            // fileUploaderSetting.result(function(arr) {
            //     console.log(arr);

            //     vm.imageArray = [];
            //     vm.imageArray = arr;
            //     console.log(vm.imageArray);
            //     console.log(vm.Settings12thdoor.profile.companyLogo);
            //     vm.Settings12thdoor.profile.companyLogo.ID = "";
            //     vm.Settings12thdoor.profile.companyLogo.appGuid = "";
            //     vm.Settings12thdoor.profile.companyLogo.appName = "SETTING";
            //     vm.Settings12thdoor.profile.companyLogo.createUser = "",
            //     vm.Settings12thdoor.profile.companyLogo.date = vm.imageArray[0].lastModifiedDate;
            //     vm.Settings12thdoor.profile.companyLogo.imageUrl = "";
            //     vm.Settings12thdoor.profile.companyLogo.name = vm.imageArray[0].name;
            //     vm.Settings12thdoor.profile.companyLogo.size = vm.imageArray[0].size,
            //     vm.Settings12thdoor.profile.companyLogo.type = vm.imageArray[0].type;
            //     vm.Settings12thdoor.profile.companyLogo.uniqueCode = vm.imageArray[0].uniqueCode;
            //     console.log(vm.Settings12thdoor.profile.companyLogo);

            //     loadImage();

            //     //}
            // })

            vm.imageArray = [];
            if (res.hasOwnProperty('brochure')) {
              
              vm.imageArray = res.brochure;
              vm.imageArray = vm.imageArray[0].name;

            }else if(res.hasOwnProperty('image')){
                vm.imageArray = [];
                vm.imageArray = res.image;
                console.log(vm.imageArray);
                vm.Settings12thdoor.profile.companyLogo.ID = "";
                vm.Settings12thdoor.profile.companyLogo.appGuid = "";
                vm.Settings12thdoor.profile.companyLogo.appName = "SETTING";
                vm.Settings12thdoor.profile.companyLogo.createUser = "",
                vm.Settings12thdoor.profile.companyLogo.date = vm.imageArray[0].lastModifiedDate;
                vm.Settings12thdoor.profile.companyLogo.imageUrl = "";
                vm.Settings12thdoor.profile.companyLogo.name = vm.imageArray[0].name;
                vm.Settings12thdoor.profile.companyLogo.size = vm.imageArray[0].size,
                vm.Settings12thdoor.profile.companyLogo.type = vm.imageArray[0].type;
                vm.Settings12thdoor.profile.companyLogo.uniqueCode = vm.imageArray[0].uniqueCode;
                console.log(vm.Settings12thdoor.profile.companyLogo);
                loadImage();

            }else if(res.hasOwnProperty('all')){
              console.log(res.all);
            }

            
        };

        function loadImage() {
            var reader = new FileReader();
            console.log(vm.imageArray);
            reader.readAsDataURL(vm.imageArray[0]); 
            reader.onload = function() {
                vm.uploadFile = reader.result
                if (!$scope.$$phase) {
                    $scope.$apply()
                }
            };
            reader.onerror = function(error) {
                console.log('Error: ', error);
            };
        };


        function addcusfieldsProfile(ev) {
            $mdDialog.show({
                    controller: 'DialogprofileController',
                    controllerAs: 'vm',
                    templateUrl: 'app/main/settings/dialogs/profileDialogs/addCustomdetailsforProfile.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    locals: {
                        data: vm.Settings12thdoor.profile.cusFiel
                    },
                    clickOutsideToClose: true
                })
                .then(function(answer) {
                    
                    if(vm.Settings12thdoor.profile.cusFiel.length == 3){
                       $mdDialog.show($mdDialog.alert().parent(angular.element(document.querySelector('#popupContainer'))).clickOutsideToClose(true)
                    .title('Alert').textContent('You can add only 3 custom fields here!').ariaLabel('Alert Dialog Demo').ok('Ok!').targetEvent());
                    }
                    else{
                         vm.Settings12thdoor.profile.cusFiel.push(answer);
                    }
                   
                    

                }, function() {
                    vm.status = 'You cancelled the dialog.';
                });

        };

        function editCusfieldsProfile(cusFieldsProfileedit, ev) {
            console.log(cusFieldsProfileedit);
            $mdDialog.show({
                    controller: 'DialogEditprofileController',
                    controllerAs: 'vm',
                    templateUrl: 'app/main/settings/dialogs/profileDialogs/editCustomdetailsforprofile.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    locals: {
                        cusFieldsProfileedit: cusFieldsProfileedit,
                        data: vm.Settings12thdoor.profile.cusFiel
                    },
                    clickOutsideToClose: true,
                })
                .then(function(answer) {

                    for (var i = vm.Settings12thdoor.profile.cusFiel.length - 1; i >= 0; i--) {
                        if (vm.Settings12thdoor.profile.cusFiel[i].id == answer.id) {
                            vm.Settings12thdoor.profile.cusFiel[i] = answer;
                            console.log(vm.Settings12thdoor.profile.cusFiel);
                            break;
                        }
                    }

                }, function() {
                    vm.status = 'You cancelled the dialog.';
                });

        };

        function deleteProfileCusfieldsrow(cusFieldsprofile, index) {
            debugger;
            vm.Settings12thdoor.profile.cusFiel.splice(index, 1);
        }




    }


})();
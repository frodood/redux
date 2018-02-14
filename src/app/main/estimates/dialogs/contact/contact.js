(function() {
    'use strict';

    angular
        .module('app.estimates')
        .controller('addEstCusCtrl', addEstCusCtrl);

    /** @ngInject */
    function addEstCusCtrl($scope, $serviceCall, $mdToast, $document, $mdDialog, $mdMedia, $mdSidenav, $state, msSpinnerService) {
        var vm = this;
        vm.toolbarHeader = "New Customer";
        vm.buttonName="Save";
        vm.showShipping = false;
        vm.showBilling = true;
        vm.cancel = cancel;
        vm.addressChange = addressChange;
        vm.contact = {};
        vm.spinnerService = msSpinnerService;

        vm.contact = {
            "profileName": "",
            "email": "",
            "firstName": "",
            "lastName": "",
            "billingAddress": {},
            "shippingAddress": {},
            "phone": "",
            "mobile": "",
            "fax": "",
            "website": "",
            "profileLog": {},
            "status": "",
            "profileID": "",
            "deleteStatus": false,
            "favouriteStar": false,
            "favouriteStarNo": 1,
            "createDate": "",
            "profileClass": "Customer",
            "profileType": "Customer",
            "profileCategory": "",
            "lastTranDate": "",
            "modifyDate": "",
            "createUser": "",
            "modifyUser": "",
            "adminMail": "",
            "customFields"    : []
        }

        //__________define Address fields________

        vm.contact["billingAddress"] = {
            city: "",
            country: "",
            state: "",
            street: "",
            zip: ""
        };

        vm.contact["shippingAddress"] = {
            s_city: "",
            s_country: "",
            s_state: "",
            s_street: "",
            s_zip: ""
        };

        //_______________Close Dialog Box__________
        function cancel() {
            $mdDialog.hide();
        }

        //________change address_________________________
        function addressChange() {
            vm.showShipping = !vm.showShipping;
            vm.showBilling = !vm.showBilling;
        }

        //______________Copy shipping Address to Billing Address________________________
        vm.onChange = function(cb) {
            vm.contact.shippingAddress["s_street"] = vm.contact.billingAddress["street"];
            vm.contact.shippingAddress["s_city"] = vm.contact.billingAddress["city"];
            if (vm.selectedItem != null) {
                vm.contact.shippingAddress["s_country"] = vm.selectedItem.country;
            }
            vm.contact.shippingAddress["s_zip"] = vm.contact.billingAddress["zip"];
            vm.contact.shippingAddress["s_state"] = vm.contact.billingAddress["state"];
            vm.selectedItem1 = vm.selectedItem.country
            if (cb == false) {
                vm.contact.shippingAddress["s_street"] = "";
                vm.contact.shippingAddress["s_city"] = "";
                vm.contact.shippingAddress["s_country"] = "";
                vm.contact.shippingAddress["s_zip"] = "";
                vm.contact.shippingAddress["s_state"] = "";
            }
        }

        function loadSettingProfile(){
        var client =  $serviceCall.setClient("getAllByQuery","setting"); // method name and service
                client.ifSuccess(function(data){
                    if (data.length>0) {
                        console.log(data);
                        vm.currency=data[0].profile.baseCurrency;
                        vm.profileDataFields=data[0].preference.contactPref.customerCusFiel;

                        getCustFiled(vm.profileDataFields,function(){
                                
                        });
                        
                    }  
                 
                })
                client.ifError(function(data){ 
                    console.log(data);
               
                })
                
                client.postReq({
                        "setting":"profile",
                        "preference":"contactPref"
                    });
        }
        loadSettingProfile();

        function getCustFiled(arr){

            var fieldArr = arr;
            console.log(fieldArr);
            var value="";

            for(var l=0; l<= fieldArr.length -1; l++){
                vm.contact.customFields.push({
                  labelShown:fieldArr[l].labelShown,
                  fields:fieldArr[l].fields,
                  type:fieldArr[l].type,
                  inputType:fieldArr[l].inputType,
                  showOnPdf: fieldArr[l].showOnPdf,
                  value:value
                });

              console.log(vm.contact.customFields);
            }
        }

        vm.invalidmail = false;
        //______check whether added email address already exist___________
        vm.validateEmail = function(obj) {
            vm.emailExsist = false;

            var re = /\S+@\S+\.\S+/;
            if (re.test(obj) == true) {
                vm.invalidmail = false;
            } else {
                vm.invalidmail = true;
            }
        }

        vm.addContact = function() {
            if (vm.contact.profileName == "") {

                var toast = $mdToast.simple()
                    .content('Please add Company or Individual Name')
                    .action('OK')
                    .highlightAction(false)
                    .position("top right");
                $mdToast.show(toast).then(function() {});
            } else if (vm.contact.email == "") {
                var toast = $mdToast.simple()
                    .content('Please enter your email')
                    .action('OK')
                    .highlightAction(false)
                    .position("top right");
                $mdToast.show(toast).then(function() {});
            } else if (vm.emailExsist == true) {
                var toast = $mdToast.simple()
                    .content('the email is already in use')
                    .action('OK')
                    .highlightAction(false)
                    .position("top right");
                $mdToast.show(toast).then(function() {});
            } else if (vm.invalidmail == true) {
                var toast = $mdToast.simple()
                    .content('Please add a valid email address')
                    .action('OK')
                    .highlightAction(false)
                    .position("top right");
                $mdToast.show(toast).then(function() {});
            } else {
                vm.contact.profileLog = {
                    profileID: "",
                    logID: "-888",
                    type: "Activity",
                    description: "",
                    UIHeight: "30px",
                    status: "Active",
                    userName: "",
                    lastTranDate: new Date(),
                    createDate: new Date(),
                    modifyDate: new Date(),
                    createUser: "",
                    modifyUser: ""
                }

                // if(vm.selectedItem != null)
                // 	vm.contact.billingAddress["country"] = vm.selectedItem.country;
                // if(vm.selectedItem1 != null)
                // 	if(vm.selectedItem1.country == undefined){
                // 		vm.contact.shippingAddress["s_country"] = vm.selectedItem1;
                // 	}else{
                // 		vm.contact.shippingAddress["s_country"] = vm.selectedItem1.country;
                // 	}

                if (vm.selectedItem != null)
                    vm.contact.billingAddress["country"] = vm.selectedItem.country;
                if (vm.selectedItem1 != null)
                    if (vm.selectedItem1.country == undefined) {
                        vm.contact.shippingAddress["s_country"] = vm.selectedItem1;
                    } else {
                        vm.contact.shippingAddress["s_country"] = vm.selectedItem1.country;
                    }

                vm.spinnerService.show('est-contactAdd-spinner');    

                vm.contact.status = "Active";
                vm.contact.createDate = new Date();
                vm.contact.profileClass = "Customer";
                vm.contact.profileType = "Customer";
                vm.contact.modifyDate = new Date();
                console.log(vm.contact);
                vm.profObj = {
                    "profile": vm.contact,
                    "permissionType": "add",
                    "appName": "Contacts"
                }

                var jsonString = JSON.stringify(vm.profObj)

                var client = $serviceCall.setClient("saveProfile", "process");
                client.ifSuccess(function(data) {
                    $mdToast.show(
                        $mdToast.simple()
                        .textContent('Customer Successfully Registerd')
                        .position('top right')
                        .theme('success-toast')
                        .hideDelay(2000)
                    );
                    vm.contact.profileID = data.ID;
                    $mdDialog.hide(vm.contact)
                    vm.spinnerService.hide('est-contactAdd-spinner');
                });
                client.ifError(function(data) {
                    vm.spinnerService.hide('est-contactAdd-spinner');
                if(data.data.isSuccess == false){
                    $mdDialog.show(
                    $mdDialog.alert()
                    .parent(angular.element(document.body))
                    .title('Error')
                    .content(data.data.customMessage)
                    .ariaLabel('Alert Dialog Demo')
                    .ok('OK')
                    .targetEvent()
                    );
                }

                if(data.data.customMessage == null){
                    $mdDialog.show(
                    $mdDialog.alert()
                    .parent(angular.element(document.body))
                    .title('Error')
                    .content('Error Saving Contact.')
                    .ariaLabel('Alert Dialog Demo')
                    .ok('OK')
                    .targetEvent()
                    );
                }
                   
                });
                client.postReq(jsonString);

            }
        }
        vm.allcountries = [];
        loadCountries();

        function loadCountries() {
            var country = $serviceCall.setClient("getCountries", "profile");
            country.ifSuccess(function(data) {
                if (data.length > 1) {
                    for (var i = data.length - 1; i >= 0; i--) {
                        vm.allcountries.push({
                            country: data[i].country_name
                        })
                    }
                }
            });
            country.ifError(function(data) {});
            country.postReq();
        }

        //______________________________get country for billing address___________________________________
        vm.selectedItem = null;
        vm.billingquerySearch = billingquerySearch;
        vm.billingSearch = null;

        // function billingquerySearch(query) {
        // 	vm.results = [];
        // 	for (var i = vm.allcountries.length - 1; i >= 0; i--) {
        // 		if (vm.allcountries[i].country.indexOf(query.toLowerCase()) != -1) {
        // 			vm.results.push(vm.allcountries[i]);
        // 		}
        // 	}
        // 	return vm.results;
        // }

        function billingquerySearch(query) {
            vm.results = [];
            for (var i = vm.allcountries.length - 1; i >= 0; i--) {
                if (vm.allcountries[i].country.toLowerCase().indexOf(query.toLowerCase()) != -1) {
                    vm.results.push(vm.allcountries[i]);
                }
            }
            return vm.results;
        }

        //______________________________get country for shipping address___________________________________
        vm.selectedItem1 = null;
        vm.querySearch = querySearch;
        vm.searchText = null;

        function querySearch(query) {
            vm.results = [];
            for (var i = vm.allcountries.length - 1; i >= 0; i--) {
                if (vm.allcountries[i].country.toLowerCase().indexOf(query.toLowerCase()) != -1) {
                    vm.results.push(vm.allcountries[i]);
                }
            }
            return vm.results;
        }

    }
})();

(function() {
    'use strict';

    angular
        .module('app.estimates')
        .controller('editEstCusCtrl', editEstCusCtrl);

    /** @ngInject */
    function editEstCusCtrl($scope, $serviceCall, $mdToast, item, $document, $mdDialog, $mdMedia, $mdSidenav, $state ,$customCtrl, msSpinnerService) {
        var vm = this;
        vm.toolbarHeader = "Edit Customer";
        vm.buttonName="Edit";
        vm.showShipping = false;
        vm.showBilling = true;
        vm.cancel = cancel;
        vm.addressChange = addressChange;
        vm.contact = {};
        vm.contact = item;
        console.log(vm.contact);

        //For customFields
        vm.hasSettingsData = false;
        vm.hasEstData = false;
        vm.CusFieldsFromSettings = {};

        vm.spinnerService = msSpinnerService;

        $scope.$watch("vm.contact", function(data) {
              vm.hasEstData = true;
              makeCustomFields();
        });

        function loadSetting(){

        var settings = $serviceCall.setClient("getAllByQuery", "setting");
            settings.ifSuccess(function(data) {
                vm.CusFieldsFromSettings = data[0].preference.contactPref.customerCusFiel;
                vm.hasSettingsData = true;
                makeCustomFields();
            });
            settings.ifError(function(data) {

            });
            settings.postReq({
                "setting": "profile",
                "preference": "contactPref"
            })

        }
        loadSetting();

        function makeCustomFields() {
            if (vm.hasEstData == false || vm.hasSettingsData == false) {
                return;
            }
                var field = $customCtrl.getCustArr();
                field.settingCus(vm.CusFieldsFromSettings).appCus(vm.contact.customFields);
                vm.contact.customFields = field.fullArr().result;
                console.log(vm.contact.customFields);

        }

        vm.selectedItem = null;
        vm.selectedItem1 = null;

        vm.selectedItem = item.billingAddress;
        vm.selectedItem1 = item.shippingAddress;
        console.log(vm.selectedItem1);

        if (vm.selectedItem1 != 0) {
            vm.selectedItem1.country = vm.selectedItem1.s_country;
        }



        // vm.selectedItem = item.billingAddress.country;
        // vm.selectedItem1 = item.shippingAddress.s_country;


        var editBilingAddress = false;
        var editshippingAddress = false;

        //_______________Close Dialog Box__________
        function cancel() {
            $mdDialog.hide();
        }

        //________change address_________________________
        function addressChange() {
            vm.showShipping = !vm.showShipping;
            vm.showBilling = !vm.showBilling;
        }

        vm.onChange = function(cb) {
            vm.contact.shippingAddress["s_street"] = vm.contact.billingAddress["street"];
            vm.contact.shippingAddress["s_city"] = vm.contact.billingAddress["city"];
            edit
            if (vm.selectedItem != null) {
                vm.contact.shippingAddress["s_country"] = vm.selectedItem.country;
            }
            vm.contact.shippingAddress["s_zip"] = vm.contact.billingAddress["zip"];
            vm.contact.shippingAddress["s_state"] = vm.contact.billingAddress["state"];
            vm.selectedItem1 = vm.selectedItem;
            if (cb == false) {
                vm.contact.shippingAddress["s_street"] = "";
                vm.contact.shippingAddress["s_city"] = "";
                vm.contact.shippingAddress["s_country"] = "";
                vm.contact.shippingAddress["s_zip"] = "";
                vm.contact.shippingAddress["s_state"] = "";
            }
        }

        vm.allcountries = [];
        loadCountries();

        function loadCountries() {

            var country = $serviceCall.setClient("getCountries", "profile");
            country.ifSuccess(function(data) {
                if (data.length > 1) {
                    for (var i = data.length - 1; i >= 0; i--) {
                        vm.allcountries.push({
                            country: data[i].country_name
                        })
                    }
                }
            });
            country.ifError(function(data) {});
            country.postReq();
        }

        //______________________________get country for billing address___________________________________

        vm.billingquerySearch = billingquerySearch;
        vm.billingSearch = null;

        function billingquerySearch(query) {
            vm.results = [];
            for (var i = vm.allcountries.length - 1; i >= 0; i--) {

                if (vm.allcountries[i].country.toLowerCase().indexOf(query.toLowerCase()) != -1) {

                    vm.results.push(vm.allcountries[i]);
                }
            }
            return vm.results;

        }

        //______________________________get country for shipping address___________________________________

        vm.querySearch = querySearch;
        vm.searchText = null;

        function querySearch(query) {

            vm.results = [];

            for (var i = vm.allcountries.length - 1; i >= 0; i--) {
                if (vm.allcountries[i].country.toLowerCase().indexOf(query.toLowerCase()) != -1) {
                    vm.results.push(vm.allcountries[i]);
                }
            }
            return vm.results;
            console.log(vm.results);
        }
        //_______________________________________________________________
        vm.editBillingCountry = editBillingCountry;

        function editBillingCountry(val) {
            editBilingAddress = true;
            var billingCountry = val;
        }

        //_______________________________________________________________
        vm.editShippingCountry = editShippingCountry;

        function editShippingCountry(val) {
            editshippingAddress = true;
            var shippingCountry = val;

        }
        //________________________________________________________________________
        vm.addContact = addContact;

        function addContact(cusDetails) {

            if (vm.selectedItem != null)
                cusDetails.billingAddress["country"] = vm.selectedItem.country;
            if (vm.selectedItem1 != null)
                if (vm.selectedItem1.country == undefined) {
                    cusDetails.shippingAddress["s_country"] = "";
                } else {
                    cusDetails.shippingAddress["s_country"] = vm.selectedItem1.country;
                }



            console.log(vm.selectedItem);
            console.log(cusDetails);

            if (editBilingAddress == true) {
                var billingCountry = cusDetails.billingAddress.country;
            }

            if (editshippingAddress == true) {
                var shippingCountry = cusDetails.shippingAddress.s_country;
            }

            //vm.profObj = {"profile" : vm.contact, "permissionType" : "add", "appName":"Contacts"}
            //var jsonString = JSON.stringify(vm.profObj)


            if (cusDetails.profileName == undefined) {
                var toast = $mdToast.simple()
                    .content('Please add Company or Individual Name')
                    .action('OK')
                    .highlightAction(false)
                    .position("top right");
                $mdToast.show(toast).then(function() {});
            } else if (cusDetails.email == undefined) {
                var toast = $mdToast.simple()
                    .content('Please enter your email')
                    .action('OK')
                    .highlightAction(false)
                    .position("top right");
                $mdToast.show(toast).then(function() {});
            } else if (vm.invalidmail == true) {
                var toast = $mdToast.simple()
                    .content('Please add a valid email address')
                    .action('OK')
                    .highlightAction(false)
                    .position("top right");
                $mdToast.show(toast).then(function() {});
            } else {

                vm.spinnerService.show('est-contactEdit-spinner');
                console.log(cusDetails);
                var jsonString = {
                    "profile": cusDetails,
                    "permissionType": "edit",
                    "appName": "Contacts"
                }
                var client = $serviceCall.setClient("updateProfile", "process");
                client.ifSuccess(function(data) {
                    $mdToast.show(
                        $mdToast.simple()
                        .textContent('Customer Successfully Edited')
                        .position('top right')
                        .theme('success-toast')
                        .hideDelay(2000)
                    );
                    vm.contact.profileID = data.ID;
                    $mdDialog.hide(cusDetails);
                    vm.spinnerService.show('est-contactEdit-spinner');
                });
                client.ifError(function(data) {
                  vm.spinnerService.show('est-contactEdit-spinner');

                  if(data.data.isSuccess == false){
                    $mdDialog.show(
                    $mdDialog.alert()
                    .parent(angular.element(document.body))
                    .title('Error')
                    .content(data.data.customMessage)
                    .ariaLabel('Alert Dialog Demo')
                    .ok('OK')
                    .targetEvent()
                    );
                }

                if(data.data.customMessage == null){
                    $mdDialog.show(
                    $mdDialog.alert()
                    .parent(angular.element(document.body))
                    .title('Error')
                    .content('Error Editing Contact.')
                    .ariaLabel('Alert Dialog Demo')
                    .ok('OK')
                    .targetEvent()
                    );
                }

                });
                client.postReq(jsonString);
            }

        }

        vm.invalidmail = false;
        //______check whether added email address already exist___________
        vm.validateEmail = function(obj) {
            vm.emailExsist = false;

            var re = /\S+@\S+\.\S+/;
            if (re.test(obj) == true) {
                vm.invalidmail = false;
            } else {
                vm.invalidmail = true;
            }
        }

    }
})();
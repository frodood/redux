(function() {
    'use strict';

    angular
        .module('app.core')
        .controller('MsContactController', MsContactController)
        .directive('msContactpopup', msContactpopup)

    /** @ngInject */
    function msContactpopup() {
        var contactpopupDirective = {
            restrict: 'EA',
            scope: {
                customertype: '=',
                contactdetails: '='

            },
            transclude: false,
            controller: MsContactController,
            controllerAs: 'vm',
            bindToController: true
        };

        return contactpopupDirective;
    };

    //start MsContactController
    function MsContactController($rootScope, $scope, $element, $attrs, $http, $mdDialog, $mdToast, $serviceCall, $document, $customCtrl, msSpinnerService) {

        var vm = this;

        vm.cb = false;
        vm.showShipping = false;
        vm.showBilling = true;
        vm.cancel = cancel;
        vm.addressChange = addressChange;
        vm.hasSettingsData = false;
        vm.hasEstData = false;
        vm.CusFieldsFromSettings = {};
        vm.spinnerService = msSpinnerService;

    
        if (vm.customertype === 'new') {
            vm.title = "New Customer";
            vm.submitbutton = "Save";
            vm.contact = {};
            vm.billingCountry = "";
            vm.shippingCountry = "";
        }

        vm.contact = {
            "image": [],
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
            "customFields": []
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

        $element.bind('click', function(event) {
            $mdDialog.show({
                templateUrl: 'app/core/directives/ms-contactpopup/mscontactpopup.html',
                targetEvent: event,
                controller: function() {
                    return vm;
                },
                controllerAs: 'vm',
                clickOutsideToClose: false
            });
        });

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

            if (vm.customertype === 'new') {
                if (vm.selectedItem != null) {
                    vm.contact.shippingAddress["s_country"] = vm.selectedItem.country;
                }
                vm.selectedItem1 = vm.selectedItem.country
            }

            if (vm.customertype === 'edit') {
                if (vm.selectedItem != null) {
                    if (vm.selectedItem != null && vm.selectedItem.hasOwnProperty('country')) {
                        vm.contact.shippingAddress["s_country"] = vm.selectedItem.country;
                        vm.shippingCountry = vm.selectedItem.country;
                        vm.selectedItem1 = vm.selectedItem.country;
                        vm.billingCountry = vm.selectedItem.country;
                    } else {
                        vm.contact.shippingAddress["s_country"] = vm.selectedItem;
                        vm.shippingCountry = vm.selectedItem;
                        vm.selectedItem1 = vm.selectedItem;
                        vm.billingCountry = vm.selectedItem;
                    }
                }
            }

            vm.contact.shippingAddress["s_zip"] = vm.contact.billingAddress["zip"];
            vm.contact.shippingAddress["s_state"] = vm.contact.billingAddress["state"];
            if (cb == false) {
                vm.contact.shippingAddress["s_street"] = "";
                vm.contact.shippingAddress["s_city"] = "";
                vm.contact.shippingAddress["s_country"] = "";
                vm.contact.shippingAddress["s_zip"] = "";
                vm.contact.shippingAddress["s_state"] = "";
            }
        }

        function loadSettingProfile() {
            var client = $serviceCall.setClient("getAllByQuery", "setting"); // method name and service
            client.ifSuccess(function(data) {
                if (data.length > 0) {
                    console.log(data);
                    vm.profileDataFields = data[0].preference.contactPref.customerCusFiel;

                    if (vm.customertype === 'new') {
                        getCustFiled(vm.profileDataFields, function() {
                        });
                    }

                    if (vm.customertype === 'edit') {
                        vm.CusFieldsFromSettings = data[0].preference.contactPref.customerCusFiel;
                        vm.hasSettingsData = true;
                        if (vm.CusFieldsFromSettings.length != 0) {
                            makeCustomFields();
                        }
                    }


                }

            })
            client.ifError(function(data) {
                console.log(data);

            })

            client.postReq({
                "setting": "profile",
                "preference": "contactPref"
            });
        }


        function getCustFiled(arr) {

            var fieldArr = arr;
            console.log(fieldArr);
            var value = "";

            for (var l = 0; l <= fieldArr.length - 1; l++) {
                vm.contact.customFields.push({
                    labelShown: fieldArr[l].labelShown,
                    fields: fieldArr[l].fields,
                    type: fieldArr[l].type,
                    inputType: fieldArr[l].inputType,
                    showOnPdf: fieldArr[l].showOnPdf,
                    value: value
                });

                console.log(vm.contact.customFields);
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
                            country: data[i].country_name //.toLowerCase() + ", " +  data[i].country_code // commented by dushmantha
                        })
                    }
                }
            });
            country.ifError(function(data) {});
            country.postReq();
        }

        //______________________________start get country for shipping address & billing address___________________________________
        vm.selectedItem = null;
        vm.selectedItem1 = null;
        vm.querySearch = querySearch;
        vm.searchText = null;
        vm.billingSearch = null;

        function querySearch(query) {
            vm.results = [];

            for (var i = 0, len = vm.allcountries.length; i < len; ++i) {
                if (vm.allcountries[i].country.toLowerCase().indexOf(query.toLowerCase()) != -1) {
                    vm.results.push(vm.allcountries[i]);
                }
            }
            return vm.results;
        }//end get country for shipping address & billing address

        //start save function
        vm.submit = function(cusDetails) {
            vm.spinnerService.show('ms-contactAdd-spinner');
            
            if (vm.customertype == 'edit') {
                if (editBilingAddress == true) {
                    cusDetails.billingAddress.country = vm.billingCountry;
                }

                if (editshippingAddress == true) {
                    cusDetails.shippingAddress.s_country = vm.shippingCountry;
                }

                var jsonString = {
                    "profile": cusDetails,
                    "permissionType": "edit",
                    "appName": "Contacts"
                }

                var client = $serviceCall.setClient("updateProfile", "process");
                client.ifSuccess(function(data) {
                    $mdToast.show(
                        $mdToast.simple()
                        .textContent('Customer successfully edited')
                        .position('top right')
                        .theme('success-toast')
                        .hideDelay(2000)
                    );
                    vm.contact.profileID = data.ID;

                    // $mdDialog.hide(cusDetails)
                    $scope.$emit('editContactActivity', vm.contact);
                    exitContactPopupModal();
                });
                client.ifError(function(data) {
                    if (data.data.message == undefined || data.data.message.includes("Unexpected token")) {

                        $mdDialog.show(
                            $mdDialog.alert()
                            .parent(angular.element(document.body))
                            .title('Error')
                            .content('There was an error updating contact data')
                            .ok('OK')
                            .targetEvent()
                        );

                    } else {
                        $mdDialog.show(
                            $mdDialog.alert()
                            .parent(angular.element(document.body))
                            .title('Error')
                            .content(data.data.customMessage)
                            .ok('OK')
                            .targetEvent()
                        );
                    }

                });
                client.postReq(jsonString);
            }

            //start check if new customer 
            if (vm.customertype == 'new') {

                if (vm.selectedItem != null)
                    vm.contact.billingAddress["country"] = vm.selectedItem.country;
                if (vm.selectedItem1 != null)
                    if (vm.selectedItem1.country == undefined) {
                        vm.contact.shippingAddress["s_country"] = vm.selectedItem1;
                    } else {
                        vm.contact.shippingAddress["s_country"] = vm.selectedItem1.country;
                    }

                vm.contact.status = "Active";
                vm.contact.createDate = new Date();
                vm.contact.profileClass = "Customer";
                vm.contact.profileType = "Customer";
                vm.contact.modifyDate = new Date();

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
                        .textContent('Customer successfully registered')
                        .position('top right')
                        .theme('success-toast')
                        .hideDelay(2000)
                    );
                    vm.contact.profileID = data.ID;

                    $scope.$emit('newContactActivity', vm.contact);
                    exitContactPopupModal();

                });
                client.ifError(function(data) {

                    if (data.data.message == undefined || data.data.message.includes("Unexpected token")) {

                        $mdDialog.show(
                            $mdDialog.alert()
                            .parent(angular.element(document.body))
                            .title('Error')
                            .content('There was an error saving contact data')
                            .ok('OK')
                            .targetEvent()
                        );

                    } else {
                        $mdDialog.show(
                            $mdDialog.alert()
                            .parent(angular.element(document.body))
                            .title('Error')
                            .content(data.data.customMessage)
                            .ok('OK')
                            .targetEvent()
                        );
                    }
                });
                client.postReq(jsonString);                
            }//end check if new customer 

        }//end save function
        
        //dialog box close
        function exitContactPopupModal() {
            $mdDialog.hide();
            vm.spinnerService.hide('ms-contactAdd-spinner');
        }

        //compare customerfields alredy saved and new.
        function makeCustomFields() {
            if (vm.hasEstData == false || vm.hasSettingsData == false) {
                return;
            }
            var field = $customCtrl.getCustArr();
            field.settingCus(vm.CusFieldsFromSettings).appCus(vm.contact.customFields);
            vm.contact.customFields = field.fullArr().result;
        }

        //start edit customer functions only
        if (vm.customertype === 'edit') {

            vm.title = "Edit Customer";
            vm.submitbutton = "Edit";
            $scope.$watch('vm.contactdetails', function(newVal) {
                console.log(newVal);
                if (newVal) {
                    vm.contacteditdetails = newVal;
                    bindUI();

                };
            }, true);

            function bindUI() {
                vm.contact = vm.contacteditdetails;
                loadSettingProfile();
                console.log(vm.contact.billingAddress);
                if (vm.contact.billingAddress !== undefined) {
                    vm.selectedItem = vm.contact.billingAddress.country;
                    vm.selectedItem1 = vm.contact.shippingAddress.s_country;
                }
            }

            function watchcustomefields() {
                $scope.$watch("vm.contact", function(data) {
                    vm.hasEstData = true;
                    //makeCustomFields();

                });
            }
            watchcustomefields();

            var editBilingAddress = false;
            var editshippingAddress = false;

            vm.editBillingCountry = editBillingCountry;

            function editBillingCountry(val) {
                editBilingAddress = true;
                if (val != null && val.hasOwnProperty('country')) {
                    vm.billingCountry = val.country;
                } else {
                    vm.billingCountry = val;
                }
            }
            //_______________________________________________________________

            vm.editShippingCountry = editShippingCountry;

            function editShippingCountry(val) {
                editshippingAddress = true;
                if (val != null && val.hasOwnProperty('country')) {
                    vm.shippingCountry = val.country;
                } else {
                    vm.shippingCountry = val;
                }

            }
            //________________________________________________________________________

        }//end edit customer functions only

        loadSettingProfile();

    } //end MsContactController

})();

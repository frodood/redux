(function() {
    'use strict';

    angular
        .module('app.estimates')
        .controller('estComposeController', estComposeController)
        .factory('estimateCopy', estimateCopy);

    /** @ngInject */
    function estComposeController($scope, $rootScope, estimateCopy, EstimateService, $mdPanel, $serviceCall, $mdToast, $document, $mdDialog, $mdMedia, $mdSidenav, $state, uploaderService, $imageUploader, AddressService, msSpinnerService) {
        var vm = this;

        vm.TDest = {};
        vm.toggleChildStates = toggleChildStates;
        vm.changeAddress = changeAddress;
        EstimateService.removeAll(0);
        EstimateService.removeTaxArray(0);
        vm.selectedItemChange = selectedItemChange;
        vm.loadEstNo = loadEstNo;
        vm.estPrefix = "";
        vm.estSequence = "";
        // vm.addProduct = addProduct;
        vm.calculatetotal = calculatetotal;
        vm.CalculateTax = CalculateTax;
        vm.salesTax = 0;
        vm.total = 0;
        vm.finalamount = finalamount;
        vm.famount = 0;
        vm.submit = submit;
        var ProductArray = [];
        vm.lineItems = [];
        var taxArr = [];
        vm.ship = 0;

        vm.currentCurrencyModel = {};

        //set customer edit details
        function selctedcustomerLoading(obj){
             vm.customerEditdetails = {};
            vm.customerEditdetails = obj.value;
            console.log( vm.customerEditdetails);
        };

        vm.brochureConfig = {
            restrict: "image/*|application/pdf",
            size: "2MB",
            crop: false,
            type: "brochure",
            maxCount: 1
        }

        vm.spinnerService = msSpinnerService;

        vm.ActiveAddressObj = [];
        vm.ObjbillingAddress = [];
        vm.ObjshippingAddress = [];

        vm.deleteProduct = deleteProduct;
        // vm.editProduct = editProduct;
        vm.addShipping = addShipping;
        vm.taxArray = [];

        vm.showUploadFile = false;
        vm.backState = 'app.estimates.est';
        checkParams();

        vm.selectedItem1 = [];

        $scope.$on('selectedProfile', function(ev, args) {
            var obj = [];
            obj.value = args.slctdProfile;
            vm.selectedItem1.value = args.slctdProfile;

            selectedItemChange(obj);

        });

        vm.getcurrencydetails = {};

        function loadCurrency(){
            
            vm.getcurrencydetails = vm.TDest;
            
        }
       
        function getCurrencyDetails(obj){
            vm.getcurrencydetails = {};
            vm.getcurrencydetails = obj;
            
        };

        //        loadAll();
        loadSettings();
        var LoginName = "sddfsdfs";

        vm.TDest = {
            "estimateNo": "",
            "baseCurrency": "",
            "changedCurrency": "",
            "isCurrencyChanged": false,
            "customFields": [],
            "deleteStatus": false,
            "email": "",
            "profileID": "",
            "profileName": "",
            "date": "",
            "validity": "",
            "paymentTerm": "",
            "comments": "",
            "customerRef": "",
            "billingAddress": "",
            "shippingAddress": "",
            "internalNote": "",
            "uploadImages": [],
            "discountAmount": "",
            "exchangeRate": 1,
            "favouriteStar": false,
            "favouriteStarNo": 1,
            "subTotal": "",
            "netAmount": "",
            "notes": "",
            "tags": [],
            "salesTaxAmount": "",
            "shipping": "",
            "taxAmounts": [],
            "status": "Valid",
            "lastTranDate": "",
            "createDate": new Date(),
            "modifyDate": new Date(),
            "createUser": "",
            "modifyUser": "",
            "sendMail": false,
            "viewed": false,
            "estimateProducts": [],
            "discountTerm": "",
            "discountPercentage": "",
            "anotherTax": "",
            "pattern": "",
            "contactNo": "",
            "mobileNo": "",
            "fax": "",
            "website": "",
            "pdfEstimateAttachment": false,
            "emailCustomerUponSavingEstimate": false,
            "changeCurrency": "",
            "createCompanyName":""
        };


        vm.TDest.billingAddress = {
            "city": "",
            "country": "",
            "zip": "",
            "state": "",
            "street": ""
        }
        vm.TDest.shippingAddress = {
            "s_city": "",
            "s_street": "",
            "s_zip": "",
            "s_state": "",
            "s_country": ""
        }

        vm.TDest.date = new Date();
        vm.TDest.validity = new Date();
        vm.TDest.shipping = parseFloat(0);
        vm.TDest.exchangeRate = 1;
        vm.paymentMethod = [];
        vm.checkpayments = [];
        vm.showShipping = false;

        //check for $state.params to fill estimate
        function checkParams() {
            if ($state.params.Data) {
                if ($state.params.appName == "profile") {
                    vm.backState = 'app.contacts.customer'
                    console.log($state.params.Data)

                    var client = $serviceCall.setClient("getProfileByKey", "profile");
                    client.ifSuccess(function(data) {
                        vm.selectedItem1 = data.profileName;

                        var client = {
                            display: data.profileName,
                            value: data
                        }

                        $rootScope.$broadcast('extupslctusr', client);
                        selectedItemChange(client);
                    });
                    client.ifError(function(data) {

                    });
                    client.uniqueID($state.params.Data.profileId);
                    client.postReq();
                }
            }
        }


        function loadSettings() {
            var settings = $serviceCall.setClient("getAllByQuery", "setting");
            settings.ifSuccess(function(data) {
                assignSettigsData(data);
            });
            settings.ifError(function(data) {

            });
            settings.postReq({
                "setting": "profile",
                "preference": "invoicePref,estimatePref,paymentPref,productPref"
            })
        }

        function assignSettigsData(val) {
            console.log(val[0]);
            console.log(val[0].preference.estimatePref.estimatePrefix);
            vm.settings = val;
            vm.estPrefix = val[0].preference.estimatePref.estimatePrefix;
            vm.estSequence = val[0].preference.estimatePref.estimateSequence;
            loadEstNo();
            vm.TDest.notes = val[0].preference.estimatePref.defaultNote;
            vm.TDest.comments = val[0].preference.estimatePref.defaultComment;
            vm.TDest.paymentTerm = val[0].preference.invoicePref.defaultPaymentTerms;
            vm.emailCustomerUpOnSavingEstimate = val[0].preference.estimatePref.emailCustomerUpOnSavingEstimate;
            vm.emailCustomerOption = val[0].preference.estimatePref.emailCustomerOption;

            if (vm.settings[0].preference.estimatePref.sendPdfEstimateAsAttachment === true) {
                vm.TDest.pdfEstimateAttachment = true;
            }



            if (vm.emailCustomerUpOnSavingEstimate) {
                if (vm.emailCustomerOption == "Send email in background") {
                    vm.TDest.emailCustomerUponSavingEstimate = true;
                }
            }

            console.log(vm.TDest);

            var value = "";
            var fieldArr = [];
            fieldArr = val[0].preference.estimatePref.cusFiel;
            for (var i = fieldArr.length - 1; i >= 0; i--) {
                vm.TDest.customFields.push({
                    labelShown: fieldArr[i].labelShown,
                    fields: fieldArr[i].fields,
                    type: fieldArr[i].type,
                    inputType: fieldArr[i].inputType,
                    showOnPdf: fieldArr[i].showOnPdf,
                    value: value
                });
            }

            vm.showAdditonalDetails = false;
            if (fieldArr.length != 0) {
                vm.showAdditonalDetails = true;
            }

            console.log(vm.TDest.customFields);
            loadEstNo();

            vm.defaultValidity = val[0].preference.estimatePref.defaultValidity;
            console.log(vm.defaultValidity);
            vm.enableShippingCharges = val[0].preference.invoicePref.enableShipping;

            if (vm.enableShippingCharges) {
                vm.shipping = false;
            } else {
                vm.shipping = true;
            }

            vm.TDest.baseCurrency = val[0].profile.baseCurrency;
            vm.TDest.changedCurrency = val[0].profile.baseCurrency;
            vm.TDest.createCompanyName = val[0].profile.companyName;
            loadcurrentCurrencyModelData();
            loadCurrency();
        }
        console.log(vm.TDest.isCurrencyChanged);


        function loadcurrentCurrencyModelData() {
      
            vm.currentCurrencyModel = {
                'currencyStatus': vm.TDest.isCurrencyChanged,
                'exchangeRate': vm.TDest.exchangeRate,
                'currencyType': vm.TDest.changedCurrency,
                'baseCurrency': vm.TDest.baseCurrency
            };
            console.log(vm.currentCurrencyModel);
        }

        var switchCurrency = $rootScope.$on('switchCurrActivity', function(event, args) {
            vm.currencyChangeObject = args;
            console.log(vm.currencyChangeObject);
            vm.TDest.isCurrencyChanged = vm.currencyChangeObject.currencyStatus;
            vm.TDest.changedCurrency = vm.currencyChangeObject.currencyType;
            vm.TDest.exchangeRate = parseFloat(vm.currencyChangeObject.exchangeRate);
            vm.ship = parseFloat(vm.TDest.shipping / vm.currencyChangeObject.exchangeRate);

            getCurrencyDetails(vm.TDest);
        });

        var addNewContact = $rootScope.$on('newContactActivity', function(event, args) {
            var newCustomer = args;
            console.log(newCustomer);
            assignCusData(newCustomer);
            
        });

        var editContact = $rootScope.$on('editContactActivity', function(event, args){
            var editCustomer = args;
            assignCusData(editCustomer);
        });

        var addProduct = $rootScope.$on('addProductActivity', function(event, args){
            calculatetotal();
        });

        var editProduct = $rootScope.$on('editProductActivity', function(event, args){
            
        });

        $scope.$on('$destroy', function() {
            // addNewContact();
            editContact();
            
        });

        $scope.$on('$destroy', function() {
            switchCurrency();
        });

        vm.changeCurrency = changeCurrency;

        function changeCurrency() {
            var currencyOBj = {
                baseCurrency: vm.TDest.baseCurrency,
                currencyChanged: vm.TDest.isCurrencyChanged,
                changedCurrency: vm.TDest.changedCurrency,
                exchangeRate: vm.TDest.exchangeRate
            }
            $mdDialog.show({
                templateUrl: 'app/main/estimates/dialogs/changeCurrency/changeCurrency.html',
                controller: 'estChangeCurrencyCtrl',
                controllerAs: 'vm',
                locals: {
                    currencyObject: currencyOBj,
                    total: vm.famount
                }
            }).then(function(data) {
                var data = data;
                if (data.currencyStatus == true) {
                    //vm.TDest.currencyChanged = true;
                    vm.TDest.isCurrencyChanged = true;
                    vm.TDest.changedCurrency = data.activeCurrency;
                    vm.TDest.exchangeRate = parseFloat(data.exchangeRate);
                    vm.TDest.shipping = parseFloat(vm.TDest.shipping / vm.TDest.exchangeRate);
                }

            }, function(data) {

            })
        }

        $scope.$watch("vm.defaultValidity", function() {
            if (vm.defaultValidity == "7 Days") {
                vm.sevenDays = new Date();
                vm.sevenDays.setDate(vm.sevenDays.getDate() + 7);
                vm.TDest.validity = vm.sevenDays;
                vm.showdate = false;
            }
        });

        $scope.$watch("vm.defaultValidity", function() {
            if (vm.defaultValidity == "14 Days") {
                vm.fourteendays = new Date();
                vm.fourteendays.setDate(vm.fourteendays.getDate() + 14);
                vm.TDest.validity = vm.fourteendays;
                vm.showdate = false;
            }
        });

        $scope.$watch("vm.defaultValidity", function() {
            if (vm.defaultValidity == "30 Days") {
                vm.thirtyDays = new Date();
                vm.thirtyDays.setDate(vm.thirtyDays.getDate() + 30);
                vm.TDest.validity = vm.thirtyDays;
                vm.showdate = false;
            }
        });

        ProductArray = EstimateService.getArry();

        function toggleChildStates(toggledState) {
            $state.go(toggledState);
        };

        //================change address============================
        vm.Billingaddress = true;
        vm.Shippingaddress = false;

        function changeAddress() {
            // vm.Billingaddress = !vm.Billingaddress;
            // vm.Shippingaddress = !vm.Shippingaddress;
            vm.Billingaddress = !vm.Billingaddress;
            vm.Shippingaddress = !vm.Shippingaddress;
            if (vm.Billingaddress == true) {
                vm.ActiveAddressObj = vm.ObjbillingAddress;
            }
            if (vm.Shippingaddress == true) {
                vm.ActiveAddressObj = vm.ObjshippingAddress;
            }
        }

        //=========Load Customer===========================================
        vm.querySearch = querySearch;
        vm.searchText = null;
        var customerNames = [];

        function querySearch(query) {

            var body = {
                where: "status = 'Active' and deleteStatus = false and (profileName LIKE" + "'" + query + "%' OR email LIKE" + "'" + query + "%')"
            }
            var profileClient = $serviceCall.setClient("getAllByQuery", "profile");

            profileClient.skip("0");
            profileClient.take("10");
            profileClient.class("Customer");
            profileClient.orderby("profileID");
            profileClient.isAscending("false");

            return profileClient.getSearch(body).then(function(response) {
                var data = response.data.result;
                var results = [];
                for (var i = 0, len = data.length; i < len; ++i) {
                    results.push({
                        display: data[i].profileName,
                        value: data[i],
                        email: data[i].email,
                        profileID: data[i].profileID,
                        cusAddress: data[i].billingAddress
                    });
                }
                return results;

            }, function(results) {
                console.log('error loading data');
            })

        }


        function loaDCus(val) {
            console.log(val);
            var client = $serviceCall.setClient("getAllByQuery", "profile");
            client.ifSuccess(function(data) {
                var data = data;
                if (data.result.length >= 1) {
                    customerNames = [];
                    for (var i = 0, len = data.result.length; i < len; ++i) {
                        customerNames.push({
                            display: data.result[i].profileName,
                            value: data.result[i],
                        });

                    }
                    console.log(customerNames);
                }

            });
            client.ifError(function(data) {
                console.log("error loading profile data")
            })
            client.skip(0);
            client.take(10);
            client.class("Customer")
            client.orderby("profileID");
            client.isAscending(true);
            client.postReq(val);

        }

        vm.enter = function(val) {
            loaDCus({
                where: "status = 'Active' and deleteStatus = false and (profileName LIKE" + "'" + val + "%' OR email LIKE" + "'" + val + "%')"
            })
        }


        function selectedItemChange(obj) {

            selctedcustomerLoading(obj);

            if (vm.selectedItem1 == null) {
                vm.showEditCustomer = false;
                vm.TDest.billingAddress = "";
                vm.TDest.shippingAddress = "";
                vm.TDest.contactNo = "";
                vm.TDest.mobileNo = "",
                    vm.TDest.email = "";
                vm.TDest.fax = "";
                vm.TDest.website = "";
            } else {

                vm.ObjbillingAddress = AddressService.setAddress(obj.value.profileName, obj.value.billingAddress.street, obj.value.billingAddress.city, obj.value.billingAddress.state, obj.value.billingAddress.zip, obj.value.billingAddress.country, obj.value.phone, obj.value.mobile, obj.value.fax, obj.value.email, obj.value.website);
                console.log(vm.ObjbillingAddress);
                vm.ObjshippingAddress = AddressService.setAddress(obj.value.profileName, obj.value.shippingAddress.s_street, obj.value.shippingAddress.s_city, obj.value.shippingAddress.s_state, obj.value.shippingAddress.s_zip, obj.value.shippingAddress.s_country, obj.value.phone, obj.value.mobile, obj.value.fax, obj.value.email, obj.value.website);
                vm.ActiveAddressObj = vm.ObjbillingAddress;

                if (obj.value) {
                    vm.showEditCustomer = true;
                    vm.TDest.profileName = obj.value.profileName;
                    vm.TDest.email = obj.value.email;
                    vm.TDest.profileID = obj.value.profileID;
                    vm.TDest.contactNo = obj.value.phone;
                    vm.TDest.mobileNo = obj.value.mobile;
                    vm.TDest.fax = obj.value.fax;
                    vm.TDest.website = obj.value.website;
                    vm.TDest.billingAddress = obj.value.billingAddress;
                    vm.TDest.shippingAddress = obj.value.shippingAddress;
                }

            }
        };

        function loadEstNo() {
            var client = $serviceCall.setClient("getNextNo", "estimate");
            client.ifSuccess(function(data) {
                var data = data;
                vm.estimateRefNo = data;

            });
            client.ifError(function(data) {
                console.log("error loading estimate No")
            })
            client.pattern(vm.estPrefix + vm.estSequence);
            client.getReq();
        }

        //add product Pop up
        // function addProduct(ev) {
        //     $mdDialog.show({
        //         templateUrl: 'app/main/estimates/dialogs/addproduct/addproduct.html',
        //         targetEvent: ev,
        //         controller: 'addEstProdCtrl',
        //         controllerAs: 'vm',
        //         locals: {
        //             exchangeRate: vm.TDest.exchangeRate,
        //             baseCurrency: vm.TDest.baseCurrency,
        //             changeCurrency: vm.TDest.changedCurrency,
        //             isCurrencyChanged: vm.TDest.isCurrencyChanged,
        //         }
        //     }).then(function(val) {
        //         calculatetotal();
        //     }, function(val) {

        //     })
        // }

        function deleteProduct(prod, index) {
            EstimateService.removeTax(prod, ProductArray);
            EstimateService.removeArray(prod, index);
            calculatetotal();
        }

        // function editProduct(val, index) {
        //     $mdDialog.show({
        //         templateUrl: 'app/main/estimates/dialogs/addproduct/editProduct.html',
        //         controller: 'editEstNewProd',
        //         controllerAs: 'vm',
        //         locals: {
        //             item: val,
        //             index: index,
        //             exchangeRate: vm.TDest.exchangeRate,
        //             changeCurrency: vm.TDest.changedCurrency
        //         }
        //     }).then(function(data) {

        //     }, function(data) {

        //     })
        // }



        vm.toggleChildStates = toggleChildStates;
        vm.lineItems = ProductArray.val;
        vm.sortableOptions = {
            handle: '.handle',
            forceFallback: true,
            ghostClass: 'line-item-placeholder',
            fallbackClass: 'line-item-ghost',
            fallbackOnBody: true,
            sort: true
        };

        vm.itemOrder = '';

        vm.preventDefault = preventDefault;

        function toggleChildStates(toggledState) {
            $state.go(toggledState);
        };

        function preventDefault(e) {
            e.preventDefault();
            e.stopPropagation();
        };

        vm.taxArray = EstimateService.getTaxArr();

        function calculatetotal() {
            vm.total = EstimateService.calculateTotal();
            vm.taxArray = EstimateService.getTaxArr();
            CalculateTax();
            finalamount();
        }

        function CalculateTax() {
            vm.salesTax = EstimateService.calculateTax();
        }

        function finalamount() {
            vm.TDest.shipping = parseInt(vm.ship * vm.TDest.exchangeRate)
            vm.famount = EstimateService.calculateNetAMount(vm.ship * vm.TDest.exchangeRate);
        };


        function submit() {

            if (vm.selectedItem1 == null) {
                $mdDialog.show(
                    $mdDialog.alert()
                    .parent(angular.element(document.body))
                    .title('Alert')
                    .content('Select a customer')
                    .ariaLabel('Alert Dialog Demo')
                    .ok('OK')
                    .targetEvent()
                );

            } else {
                if (vm.TDest.profileID != "") {
                    if (ProductArray.val.length > 0) {
                        if (vm.TDest.paymentTerm != "" || vm.TDest.paymentTerm != undefined) {

                            if (vm.imageArray.length != 0) {
                                for (var indexx = 0; indexx < vm.imageArray.length; indexx++) {

                                    if (vm.imageArray[0].type == "application/pdf") {
                                        vm.type = "brochure";
                                    }

                                    if (vm.imageArray[0].type == "image/jpeg" || vm.imageArray[0].type == "image/png") {
                                        vm.type = "image";
                                    }

                                    var client = $imageUploader.setImage(vm.imageArray[indexx].uniqueCode, 'estimate');
                                    client.ifSuccess(function(data) {

                                        vm.uploadImages = {};
                                        vm.uploadImages.ID = "";
                                        vm.uploadImages.name = vm.imageArray[0].name;
                                        vm.uploadImages.size = vm.imageArray[0].size;
                                        vm.uploadImages.uniqueCode = vm.imageArray[0].uniqueCode;
                                        vm.uploadImages.appGuid = "";
                                        vm.uploadImages.appName = "estimate";
                                        vm.uploadImages.createUser = "";
                                        vm.uploadImages.date = vm.TDest.createDate;
                                        vm.uploadImages.type = vm.type;

                                        vm.TDest.uploadImages.push(vm.uploadImages);
                                        console.log(vm.TDest.uploadImages);

                                        successSubmit();
                                    });
                                    client.ifError(function(data) {
                                        console.log('error upload file');
                                    });

                                    if (vm.imageArray[0].type == "application/pdf") {
                                        client.sendBrochure(vm.imageArray[indexx])
                                    }
                                    if (vm.imageArray[0].type == "image/jpeg" || vm.imageArray[0].type == "image/png") {
                                        client.sendImage(vm.imageArray[indexx])
                                    }
                                }

                            } else {
                                successSubmit();
                            }

                        } else {
                            $mdDialog.show(
                                $mdDialog.alert()
                                .parent(angular.element(document.body))
                                .title('Alert')
                                .content('Select a payment term')
                                .ariaLabel('Alert Dialog Demo')
                                .ok('OK')
                                .targetEvent()
                            );
                        }
                    } else {
                        $mdDialog.show(
                            $mdDialog.alert()
                            .parent(angular.element(document.body))
                            .title('Alert')
                            .content('Add a line item')
                            .ariaLabel('Alert Dialog Demo')
                            .ok('OK')
                            .targetEvent()
                        );
                    }
                } else {
                    $mdDialog.show(
                        $mdDialog.alert()
                        .parent(angular.element(document.body))
                        .title('Alert')
                        .textContent('Select a customer')
                        .ariaLabel('Alert Dialog Demo')
                        .ok('Ok')
                        .targetEvent()
                    );
                }

            }
        }

        //Start revers to base currency line items
        function reverseBackBasecurrency() {
            for (var i = ProductArray.val.length - 1; i >= 0; i--) {
                if (vm.TDest.currencyChanged == true) {
                    ProductArray.val[i].amount = parseFloat(ProductArray.val[i].amount);
                    ProductArray.val[i].price = parseFloat(ProductArray.val[i].price);
                }
            }
        }
        //End revers to base currency line items

        function popupEmailDialog(estimateData, profData, settings) {
            $mdDialog.show({
                templateUrl: 'app/main/estimates/dialogs/email/email.html',
                controller: 'estEmailCtrl',
                controllerAs: 'vm',
                locals: {
                    item: estimateData,
                    profData: profData,
                    estimatePref: settings[0].preference.estimatePref,
                    template: 'T_EMAIL_EST_NEWMAIL'
                }
            }).then(function(data) {

            }, function(data) {

            })
        }

        function successSubmit() {
        
            vm.spinnerService.show('est-compose-spinner');

            vm.customFields = [];
            reverseBackBasecurrency();

            vm.TDest.discountPercentage = 0;
            vm.TDest.estimateNo = "-999";
            vm.TDest.subTotal = parseFloat(vm.total);
            vm.TDest.netAmount = parseFloat(vm.famount);
            vm.TDest.discountAmount = 0;
            vm.TDest.salesTaxAmount = parseFloat(vm.salesTax);
            vm.TDest.status = "Valid";
            vm.TDest.pattern = vm.estPrefix + vm.estSequence;
            vm.TDest.shipping = parseFloat(vm.ship);
            console.log(vm.ship);
            console.log(vm.TDest.shipping);

            for (var j = vm.lineItems.length - 1; j >= 0; j--) {
                vm.lineItems[j].amount = vm.lineItems[j].amount;
                vm.lineItems[j].price = vm.lineItems[j].price;
            };

            for (var k = vm.taxArray.length - 1; k >= 0; k--) {
                vm.taxArray[k].salesTax = vm.taxArray[k].salesTax;
            };

            vm.TDest.estimateProducts = vm.lineItems;
            vm.TDest.taxAmounts = vm.taxArray;



            /*for (var i = vm.TDest.customFields.length - 1; i >= 0; i--) {
                if(vm.TDest.customFields[i].value!=""){
                    vm.customFields.push(vm.TDest.customFields[i]);
                }
            };*/

            for (var i = 0; vm.TDest.customFields.length > i; i++) {
                if (vm.TDest.customFields[i].value != "") {
                    vm.customFields.push(vm.TDest.customFields[i]);
                }
            };


            // vm.TDest.createDate = moment(vm.TDest.createDate).format('YYYY-MM-DD');
            // vm.TDest.validity = moment(vm.TDest.validity).format('YYYY-MM-DD');

            // if (vm.TDest.notes != 0) {
            //     var str = vm.TDest.notes.toString();
            //     var res = str.replace(new RegExp('\n', 'g'), '\\n');
            //     vm.TDest.notes = res;
            // }
            vm.TDest.customFields = vm.customFields;

            console.log(vm.TDest.uploadImages);
            var Estimate = {
                "estimate": vm.TDest,
                "image": vm.TDest.uploadImages,
                "permissionType": "add",
                "appName": "Estimates",
                "companyName": vm.settings[0].profile.companyName
            };

            var jsonString = JSON.stringify(Estimate);

            console.log(jsonString);
            console.log(vm.TDest.uploadImages);

            var client = $serviceCall.setClient("createEstimate", "process");
            client.ifSuccess(function(data) {
                console.log(data);
                vm.TDest.estimateNo = data.ID;
                $state.go('app.estimates.est.detail', {
                    itemId: vm.TDest.estimateNo
                });

                $mdToast.show(
                    $mdToast.simple()
                    .textContent('Estimate ' + data.ID + ' successfully saved')
                    .position('top right')
                    .hideDelay(3000)
                );
                vm.spinnerService.hide('est-compose-spinner');

                if (vm.emailCustomerOption == 'Display pop up and prompt') {
                    popupEmailDialog(vm.TDest, vm.settings[0].profile, vm.settings);
                }
            });
            client.ifError(function(data) {

                vm.spinnerService.hide('est-compose-spinner');

                if (data.data.isSuccess == false) {
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

                if (data.data.customMessage == null) {
                    $mdDialog.show(
                        $mdDialog.alert()
                        .parent(angular.element(document.body))
                        .title('Error')
                        .content('Error saving estimate')
                        .ariaLabel('Alert Dialog Demo')
                        .ok('OK')
                        .targetEvent()
                    );
                }

            })
            client.postReq(jsonString);
        }

        function saveDraft() {
            vm.TDest.discountPercentage = 0;
            vm.TDest.estimateNo = "-999";
            vm.TDest.subTotal = parseFloat(vm.total * vm.TDest.exchangeRate);
            vm.TDest.netAmount = parseFloat(vm.famount * vm.TDest.exchangeRate);
            vm.TDest.discountAmount = 0;
            vm.TDest.salesTaxAmount = parseFloat(vm.salesTax * vm.TDest.exchangeRate);
            vm.TDest.status = "Draft";
            vm.TDest.pattern = "DEST" + vm.estSequence;
            vm.TDest.estimateProducts = vm.lineItems;
            vm.TDest.taxAmounts = vm.taxArray;
            var Estimate = {
                "estimate": vm.TDest,
                "image": vm.TDest.uploadImages,
                "permissionType": "add",
                "appName": "Estimates"
            };
            var jsonString = JSON.stringify(Estimate);


            var client = $serviceCall.setClient("createEstimateDraft", "process");
            client.ifSuccess(function(data) {
                $state.go('app.estimates.est');

                $mdToast.show(
                    $mdToast.simple()
                    .textContent('Draft estimate ' + data.ID + ' successfully saved')
                    .position('top right')
                    .hideDelay(3000)
                );
            });
            client.ifError(function(data) {
                //     $mdToast.simple()
                //     .textContent('Error Saving Draft Estimate')
                //     .position('top right')
                //     .hideDelay(3000)
                // );
                if (data.data.isSuccess == false) {
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

                if (data.data.customMessage == null) {
                    $mdDialog.show(
                        $mdDialog.alert()
                        .parent(angular.element(document.body))
                        .title('Error')
                        .content('Error saving draft estimate')
                        .ariaLabel('Alert Dialog Demo')
                        .ok('OK')
                        .targetEvent()
                    );
                }

            })
            client.postReq(jsonString);

        }

        vm.cancel = function(ev) {
            if (vm.selectedItem1 == null) {
                $state.go('app.estimates.est');
            } else {
                var confirm = $mdDialog.confirm()
                    .title('Save estimate as draft?')
                    .content('')
                    .ariaLabel('Lucky day')
                    .targetEvent(ev)
                    .ok('save')
                    .cancel('clear');
                $mdDialog.show(confirm).then(function() {

                    if (vm.imageArray.length != 0) {
                        for (var indexx = 0; indexx < vm.imageArray.length; indexx++) {
                            var client = $imageUploader.setImage(vm.imageArray[indexx].uniqueCode, 'estimate');
                            client.ifSuccess(function(data) {

                                console.log(data);
                                if (vm.imageArray[0].type == "application/pdf") {
                                    vm.type = "brochure";
                                }
                                if (vm.imageArray[0].type == "image/jpeg" || vm.imageArray[0].type == "image/png") {
                                    vm.type = "image";
                                }
                                vm.uploadImages = {};
                                vm.uploadImages.ID = "";
                                vm.uploadImages.name = vm.imageArray[0].name;
                                vm.uploadImages.size = vm.imageArray[0].size;
                                vm.uploadImages.uniqueCode = vm.imageArray[0].uniqueCode;
                                vm.uploadImages.appGuid = "";
                                vm.uploadImages.appName = "estimate";
                                vm.uploadImages.createUser = "";
                                vm.uploadImages.date = vm.TDest.createDate;
                                vm.uploadImages.type = vm.type;

                                vm.TDest.uploadImages.push(vm.uploadImages);
                                saveDraft();

                            });
                            client.ifError(function(data) {

                            });

                            if (vm.imageArray[0].type == "application/pdf") {
                                client.sendBrochure(vm.imageArray[indexx])
                            }
                            if (vm.imageArray[0].type == "image/jpeg" || vm.imageArray[0].type == "image/png") {
                                client.sendImage(vm.imageArray[indexx])
                            }

                        }
                    } else {
                        saveDraft();
                    }

                }, function() {
                    $state.go('app.estimates.est');
                })


            }
        }

        function addShipping(val) {
            finalamount()
        }

        // vm.addContact = addContact;

        // function addContact() {
        //     $mdDialog.show({
        //         templateUrl: 'app/main/estimates/dialogs/contact/addContact.html',
        //         controller: 'addEstCusCtrl',
        //         controllerAs: 'vm'
        //     }).then(function(data) {
        //         var data = data;
        //         assignCusData(data);
        //     }, function(data) {

        //     })
        // };

        function assignCusData(val) {
            console.log(val)
            var cus = {
                display: val.profileName,
                value: val
            }
            vm.selectedItem1 = cus;
            $rootScope.$broadcast('extupslctusr', cus);
            selectedItemChange(cus)

        }

        // vm.editContact = editContact;

        // function editContact(val) {
        //     console.log(val);
        //     $mdDialog.show({
        //         templateUrl: 'app/main/estimates/dialogs/contact/addContact.html',
        //         controller: 'editEstCusCtrl',
        //         controllerAs: 'vm',
        //         locals: {
        //             item: val.value
        //         }
        //     }).then(function(data) {
        //         var data = data;
        //         assignCusData(data);
        //     }, function(data) {

        //     })
        // }

        //==========================================
        vm.uploadFileSample = uploadFile;
        vm.imageArray = [];

        function uploadFile(res) {
            vm.imageArray = [];
            if (res.hasOwnProperty('brochure')) {

                vm.imageArray = res.brochure;
                // vm.imageArray = vm.imageArray[0].name;
                vm.showUploadFile = true;
                vm.fileName = vm.imageArray[0].name;
                // loadImage();
                //vm.showBrochure = true;

            } else if (res.hasOwnProperty('image')) {
                vm.imageArray = [];
                vm.imageArray = res.image;
                vm.fileName = vm.imageArray[0].name;
                vm.showUploadFile = true;
                // loadImage();

            } else if (res.hasOwnProperty('all')) {
                console.log(res.all);
                vm.imageArray = res.all;
                vm.showUploadFile = true;
                vm.fileName = vm.imageArray[0].name;
                loadImage();
            }

        }

        function loadImage() {
            var reader = new FileReader();
            console.log(vm.imageArray);
            reader.readAsDataURL(vm.imageArray[0]);
            reader.onload = function() {
                vm.uploadFile = vm.imageArray[0].name;
                console.log(vm.uploadFile);
                if (!$scope.$$phase) {
                    $scope.$apply()
                }
            };
            reader.onerror = function(error) {
                console.log('Error: ', error);
            };
        };


    }
    //====================================================================
    function estimateCopy() {
        var invArr = {};

        return {
            setArr: function(val) {
                invArr = val;
                console.log(invArr)
                return invArr;
            },
            getInvArr: function() {
                return invArr;
            },
            deleteInvArr: function(val) {
                invArr = {};
                return invArr;
            }
        }
    }

})();

(function() {
    'use strict';

    angular
        .module('app.estimates')
        .controller('editEstCtrl', editEstCtrl);

    function editEstCtrl($scope, $rootScope, EstimateService, estimateCopy, $serviceCall, $mdToast, $document, $mdDialog, $mdMedia, $mdSidenav, $state, $setUrl, $customCtrl, uploaderService, $imageUploader, AddressService, msSpinnerService) {
        var vm = this;
        vm.TDest = {};

        vm.toggleChildStates = toggleChildStates;
        vm.changeAddress = changeAddress;

        EstimateService.removeAll(0);
        EstimateService.removeTaxArray(0);
        vm.selectedItemChange = selectedItemChange;

        vm.addProduct = addProduct;
        vm.calculatetotal = calculatetotal;
        vm.CalculateTax = CalculateTax;
        vm.salesTax = 0;
        vm.total = 0;
        vm.finalamount = finalamount;
        vm.famount = 0;
        vm.edit = edit;
        var ProductArray = [];
        vm.lineItems = [];
        var taxArr = [];

        vm.currentCurrencyModel = {};

        vm.brochureConfig = {
            restrict: "image/*|application/pdf",
            size: "2MB",
            crop: false,
            type: "brochure",
            maxCount: 1
        }

        vm.spinnerService = msSpinnerService;

        vm.showAdditionaDetails = true;
        vm.ActiveAddressObj = [];
        vm.ObjbillingAddress = [];
        vm.ObjshippingAddress = [];

        vm.deleteProduct = deleteProduct;
        vm.editProduct = editProduct;
        vm.addShipping = addShipping;
        vm.taxArray = [];
        vm.editCustomer = {};
        vm.showEditCustomer = true;
        vm.showUploadFile = false;

        vm.getcurrencydetails = {};

        function loadCurrency(){
            
            vm.getcurrencydetails = vm.TDest;
            
        }
        
        function getCurrencyDetails(obj){
            vm.getcurrencydetails = {};
            vm.getcurrencydetails = obj;
            
        };
       
        var estimateCopy = estimateCopy.getInvArr();
        console.log(estimateCopy);
        console.log($state.params);

        //set customer edit details
        function selctedcustomerLoading(obj){
             vm.customerEditdetails = {};
            vm.customerEditdetails = obj.value;
        };
        

        function loadDetailView() {

            var client = $serviceCall.setClient("getEstimateByKey", "estimate");
            client.ifSuccess(function(data) {
                var data = data;
                vm.details = data;
                vm.TDest = vm.details;
                console.log(vm.TDest);

                if(vm.TDest.length == 0){
              
                    vm.estDraftNo = $state.params.itemId;
                    console.log(vm.estDraftNo);
                    loadESTDRaft();
                }
                else{

                    vm.TDest.shipping = parseFloat(vm.TDest.shipping);

                    loadSettings();

                    vm.TDest.billingAddress = vm.details.billingAddress;
                    vm.TDest.validity = new Date(vm.details.validity);

                    vm.ship = vm.TDest.shipping / vm.TDest.exchangeRate;
                    console.log(vm.ship);

                    if (vm.TDest.uploadImages != 0) {
                        vm.showUploadFile = true;
                        vm.fileName = vm.TDest.uploadImages[0].name;
                    }
                    checkChangeCurrency();

                }

            });
            client.ifError(function(data) {
                console.log("error loading estimate data")
            })

            client.uniqueID($state.params.itemId); // send projectID as url parameters
            client.getReq();
        }

        loadDetailView()
        // var details = estimateCopy.getInvArr();
        // console.log(details);
        

        // console.log(vm.TDest);

        vm.hasSettingsData = false;
        vm.hasEstData = false;
        vm.CusFieldsFromSettings = {};
        console.log(vm.details);
        
            $scope.$watch("vm.details", function(data) {
                vm.hasEstData = true;
                makeCustomFields();
            });
        
        $scope.$on('selectedProfile', function(ev, args) {
            var obj = [];
            obj.value = args.slctdProfile;
            vm.selectedItem1.value = args.slctdProfile;
            selectedItemChange(obj);
        });

        // if (vm.TDest.notes != 0) {
        //     var str = vm.TDest.notes.toString();
        //     var res = str.replace(new RegExp('\\n', 'g'), '\n');
        //     vm.TDest.notes = res;
        // }


        function checkChangeCurrency() {

            for (var i = vm.TDest.estimateProducts.length - 1; i >= 0; i--) {
                EstimateService.setFullArr({
                    productName: vm.TDest.estimateProducts[i].productName,
                    price: parseFloat((vm.TDest.estimateProducts[i].price)),
                    quantity: vm.TDest.estimateProducts[i].quantity,
                    productUnit: vm.TDest.estimateProducts[i].productUnit,
                    discount: vm.TDest.estimateProducts[i].discount,
                    tax: vm.TDest.estimateProducts[i].tax,
                    olp: vm.TDest.estimateProducts[i].olp,
                    amount: parseFloat((vm.TDest.estimateProducts[i].amount)),
                    status: vm.TDest.estimateProducts[i].status,
                    productID: vm.TDest.estimateProducts[i].productID
                })
            }
            vm.TDest.netAmount = vm.TDest.netAmount;
            vm.TDest.subTotal = vm.TDest.subTotal;

        }
        

        function loadESTDRaft() {
         
            var Estimate = {
                "permissionType": "add",
                "appName": "Estimates"
            };
            var jsonString = JSON.stringify(Estimate);

            var client = $serviceCall.setClient("getestimateDraftByKey", "estimate");
            client.ifSuccess(function(data) {
                var data = data;

                console.log(data);
                vm.draftDetails = data;
                vm.TDest = vm.draftDetails;

                vm.TDest.shipping = parseFloat(vm.TDest.shipping);
               
                loadSettings();

                
                vm.TDest.validity = new Date(vm.TDest.validity);

                vm.ship = vm.TDest.shipping / vm.TDest.exchangeRate;
                console.log(vm.ship);

                if (vm.TDest.uploadImages != 0) {
                    vm.showUploadFile = true;
                    vm.fileName = vm.TDest.uploadImages[0].name;
                }

                
                // loadEstNo();
                checkChangeCurrency();
                vm.TDest.date = new Date(vm.TDest.date);

            });
            client.ifError(function(data) {
                console.log("error loading setting data")
            })
            client.uniqueID(vm.estDraftNo); // send projectID as url parameters
            client.postReq();

        }

        function loadEstNo() {

            console.log(vm.estPrefix);
            console.log(vm.estSequence);
            var client = $serviceCall.setClient("getNextNo", "estimate");
            client.ifSuccess(function(data) {
                var data = data;
                vm.TDest.estimateNo = data;

            });
            client.ifError(function(data) {
                console.log("error loading estimate No")
            })
            client.pattern(vm.estPrefix + vm.estSequence);
            client.getReq();
        }

        $scope.$watch("vm.draftDetails", function(data) {
            vm.hasEstData = true;
            makeCustomFields();
        });

       


        function loadSettings() {
    

            var settings = $serviceCall.setClient("getAllByQuery", "setting");
            settings.ifSuccess(function(data) {
                vm.CusFieldsFromSettings = data[0].preference.estimatePref.cusFiel;
                vm.hasSettingsData = true;

                assignSettigsData(data);
                getEditEstimateCustomerDetails();
                makeCustomFields();
            });
            settings.ifError(function(data) {

            });
            settings.postReq({
                "setting": "profile",
                "preference": "invoicePref,estimatePref,paymentPref,productPref,inventoryPref"
            })

        }

        function assignSettigsData(val) {
  
            vm.settings = val;

            vm.estPrefix = val[0].preference.estimatePref.estimatePrefix;
            vm.estSequence = val[0].preference.estimatePref.estimateSequence;


            if(vm.draftDetails !=0){
       
                if(vm.TDest.status == 'Draft'){
                     loadEstNo();
                }
               
            }

            vm.enableShippingCharges = val[0].preference.invoicePref.enableShipping;
            vm.TDest.baseCurrency = val[0].profile.baseCurrency;

            vm.emailCustomerUpOnSavingEstimate = val[0].preference.estimatePref.emailCustomerUpOnSavingEstimate;
            vm.emailCustomerOption = val[0].preference.estimatePref.emailCustomerOption;

            if (vm.enableShippingCharges) {
                vm.shipping = false;
            } else {
                vm.shipping = true;
            }

            if (val[0].profile.companyLogo.uniqueCode != '') {
                vm.companylogo = $setUrl.imagePath + 'setting/' + val[0].profile.companyLogo.uniqueCode;
            } else {
                vm.companylogo = val[0].profile.companyLogo.imageUrl;
            }

            loadcurrentCurrencyModelData();
            loadCurrency();

        }


        //START OF changecurrency directive config...............
        function loadcurrentCurrencyModelData() {
            vm.currentCurrencyModel = {
                'currencyStatus': vm.TDest.isCurrencyChanged,
                'exchangeRate': vm.TDest.exchangeRate,
                'currencyType': vm.TDest.changedCurrency,
                'baseCurrency': vm.TDest.baseCurrency
            };
        }

        var switchCurrency = $rootScope.$on('switchCurrActivity', function(event, args) {

            vm.currencyChangeObject = args;
            vm.TDest.isCurrencyChanged = vm.currencyChangeObject.currencyStatus;
            vm.TDest.changedCurrency = vm.currencyChangeObject.currencyType;
            vm.TDest.exchangeRate = parseFloat(vm.currencyChangeObject.exchangeRate);
            vm.ship = parseFloat(vm.TDest.shipping / vm.currencyChangeObject.exchangeRate);

            getCurrencyDetails(vm.TDest);

        });

        var addNewContact = $rootScope.$on('newContactActivity', function(event, args) {
            console.log(args);
            var newCustomer = args;

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
            switchCurrency();
            addNewContact();
            editContact();
            addProduct();
            editProduct();
        });
        //END OF changecurrency directive config


        function makeCustomFields() {
 
            if (vm.hasEstData == false || vm.hasSettingsData == false) {
                return;
            }
            var field = $customCtrl.getCustArr();
            field.settingCus(vm.CusFieldsFromSettings).appCus(vm.TDest.customFields);
            vm.TDest.customFields = field.fullArr().result;
            console.log(vm.TDest.customFields);

            vm.showAdditonalDetails = false;
            if (vm.TDest.customFields.length != 0) {
                vm.showAdditonalDetails = true;
            }

        }

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
                return results

            }, function(results) {
                console.log('error loading data')
            })
        }


        function loaDCus(val) {
            var client = $serviceCall.setClient("getAllByQuery", "profile");
            client.ifSuccess(function(data) {
                var data = data;
                if (data.result.length >= 1) {
                    customerNames = [];
                    for (var i = 0, len = data.result.length; i < len; ++i) {
                        customerNames.push({
                            display: data.result[i].profileName,
                            value: data.result[i]
                        });
                        if (data.result[i].profileID == vm.TDest.profileID) {
                            vm.editCustomer = {
                                "display": data.result[i].profileName,
                                "value": data.result[i]
                            };


                            console.log(vm.editCustomer);

                        };
                    }
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

        function getEditEstimateCustomerDetails() {
            var val = {
                where: "status = 'Active' and deleteStatus = false and (profileName LIKE" + "'" + vm.TDest.profileName + "%' OR email LIKE" + "'" + vm.TDest.profileName + "%')"
            };
            var client = $serviceCall.setClient("getAllByQuery", "profile");
            client.ifSuccess(function(data) {
                var data = data;
                if (data.result.length >= 1) {
                    //               customerNames = [];
                    for (var i = 0, len = data.result.length; i < len; ++i) {
                        //                        customerNames.push({
                        //                            display: data.result[i].profileName,
                        //                            value: data.result[i]
                        //                        });
                        if (data.result[i].profileID == vm.TDest.profileID) {

                            vm.editCustomer.display = data.result[i].profileName;
                            vm.editCustomer.value = data.result[i];

                            console.log(vm.editCustomer);

                            vm.selectedItem1 = vm.editCustomer;
                            console.log(vm.selectedItem1);
                            $rootScope.$broadcast('extupslctusr', vm.editCustomer);

                        };
                    }
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

        //add product Pop up
        function addProduct(ev) {
            $mdDialog.show({
                templateUrl: 'app/main/estimates/dialogs/addproduct/addproduct.html',
                targetEvent: ev,
                controller: 'addEstProdCtrl',
                controllerAs: 'vm',
                locals: {
                    exchangeRate: vm.TDest.exchangeRate,
                    baseCurrency: vm.TDest.baseCurrency,
                    changeCurrency: vm.TDest.changedCurrency,
                    isCurrencyChanged: vm.TDest.isCurrencyChanged,
                }
            }).then(function(val) {
                calculatetotal();
            }, function(val) {

            })
        }

        function deleteProduct(prod, index) {
            // EstimateService.ReverseTax(prod, index);
            EstimateService.removeTax(prod, ProductArray);
            EstimateService.removeArray(prod, index);
            calculatetotal();
        }

        function editProduct(val, index) {
            $mdDialog.show({
                templateUrl: 'app/main/estimates/dialogs/addproduct/editProduct.html',
                controller: 'editEstNewProd',
                controllerAs: 'vm',
                locals: {
                    item: val,
                    settings: vm.settings,
                    exchangeRate: vm.TDest.exchangeRate,
                    baseCurrency: vm.TDest.baseCurrency,
                    changeCurrency: vm.TDest.changedCurrency,
                    isCurrencyChanged: vm.TDest.isCurrencyChanged,
                    index: index
                }
            }).then(function(data) {
                console.log(data)
            }, function(data) {

            })
        }

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
            // vm.famount = parseFloat(vm.total) + parseFloat(vm.salesTax) +
            //     parseFloat(vm.ship);
        };


        function edit() {
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

                                        if (vm.TDest.uploadImages.length != 0) {
                                            vm.TDest.uploadImages[0] = vm.uploadImages;
                                        } else {
                                            vm.TDest.uploadImages.push(vm.uploadImages);
                                        }

                                        successSubmit();
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
                        .content('Select a customer')
                        .ariaLabel('Alert Dialog Demo')
                        .ok('OK')
                        .targetEvent()
                    );
                }

            }
        }

        function successSubmit() {

            vm.spinnerService.show('est-edit-spinner');
            vm.customFields = [];

            //reverseBackBasecurrency();
            vm.TDest.discountPercentage = 0;
            vm.TDest.subTotal = parseFloat(vm.total);
            vm.TDest.netAmount = parseFloat(vm.famount);
            vm.TDest.discountAmount = 0;
            vm.TDest.salesTaxAmount = parseFloat(vm.salesTax);  

            vm.TDest.shipping = parseFloat(vm.ship);
            console.log(vm.TDest.shipping);          

            vm.customFields = [];
            for (var i = 0; vm.TDest.customFields.length > i; i++) {
                if (vm.TDest.customFields[i].value != "") {
                    vm.customFields.push(vm.TDest.customFields[i]);
                }
            };
            vm.TDest.customFields = vm.customFields;

            vm.TDest.estimateProducts = vm.lineItems;

            // if (vm.TDest.notes != 0) {
            //     var str = vm.TDest.notes.toString();
            //     var res = str.replace(new RegExp('\n', 'g'), '\\n');
            //     vm.TDest.notes = res;
            // }

            vm.TDest.customFields = vm.customFields;
            vm.TDest.taxAmounts = vm.taxArray;
            vm.TDest.estimateNo = vm.TDest.estimateNo;

            console.log(vm.TDest);

            if (vm.TDest.status != "Draft") {
                var Estimate = {
                    "estimate": vm.TDest,
                    "image": vm.TDest.uploadImages,
                    "permissionType": "edit",
                    "appName": "Estimates"
                };

                var jsonString = JSON.stringify(Estimate);

                var client = $serviceCall.setClient("updateEstimate", "process");
                client.ifSuccess(function(data) {

                    $state.go('app.estimates.est.detail', {
                        itemId: vm.TDest.estimateNo
                    });

                    $mdToast.show(
                        $mdToast.simple()
                        .textContent('Estimate ' + data.ID + ' successfully edited')
                        .position('top right')
                        .hideDelay(3000)
                    );

                    vm.spinnerService.hide('est-edit-spinner');


                });
                client.ifError(function(data) {

                    vm.spinnerService.hide('est-edit-spinner');
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
                            .content('Error editing estimate')
                            .ariaLabel('Alert Dialog Demo')
                            .ok('OK')
                            .targetEvent()
                        );
                    }
                })

                client.postReq(jsonString);
            } else {
                vm.TDest.estimateNo = "-999";
                vm.TDest.status = "Valid";
                vm.TDest.pattern = vm.estPrefix + vm.estSequence;
                var EstimateDraftData = {
                    "estimate": vm.TDest,
                    "image": vm.TDest.uploadImages,
                    "permissionType": "add",
                    "appName": "Estimates",
                    "companyName": vm.settings[0].profile.companyName
                };

                var jsonStringDraftDate = JSON.stringify(EstimateDraftData);
                var client1 = $serviceCall.setClient("createEstimate", "process");
                client1.ifSuccess(function(data) {
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
                    deleteDraftEstimate();

                });
                client1.ifError(function(data) {
                    $mdToast.show(
                        $mdToast.simple()
                        .textContent('Error saving estimate')
                        .position('top right')
                        .hideDelay(3000)
                    );
                })
                client1.postReq(jsonStringDraftDate);
            }

        }


        function deleteDraftEstimate() {
            var client = $serviceCall.setClient("deleteDraft", "estimate");
            client.ifSuccess(function(data) {
                if (vm.TDest.status == "Draft") {
                    $mdToast.show(
                        $mdToast.simple()
                        .textContent('Estimate draft ' + vm.estDraftNo + ' successfully deleted')
                        .position('top right')
                        .hideDelay(3000)
                    );
                    $state.go('app.estimates.est');
                }

            });
            client.ifError(function(data) {
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
                        .content('Error deleting draft estimate')
                        .ariaLabel('Alert Dialog Demo')
                        .ok('OK')
                        .targetEvent()
                    );
                }

            })
            client.uniqueID(vm.estDraftNo)
            client.getReq();
        }

        vm.cancel = function(ev) {
            if (vm.TDest.status != "Draft") {
                $state.go('app.estimates.est');
            }
            else{

                var confirm = $mdDialog.confirm()
                    .title('Delete estimate draft?')
                    .content('This process is not reversible.')
                    .ariaLabel('Lucky day')
                    .targetEvent(ev)
                    .ok('Yes')
                    .cancel('No');
                $mdDialog.show(confirm).then(function() {

                    deleteDraftEstimate();

                }, function() {
                    $state.go('app.estimates.est');
                });

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
                loadImage();
                //vm.showBrochure = true;

            } else if (res.hasOwnProperty('image')) {
                vm.imageArray = [];
                vm.imageArray = res.image;
                vm.fileName = vm.imageArray[0].name;
                vm.showUploadFile = true;
                loadImage();

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
        //=================================================================
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
                    vm.TDest.isCurrencyChanged = true;
                    vm.TDest.changedCurrency = data.activeCurrency;
                    vm.TDest.exchangeRate = parseFloat(data.exchangeRate)
                    vm.TDest.shipping = parseFloat((vm.TDest.shipping / vm.TDest.exchangeRate) * data.exchangeRate);
                }

            }, function(data) {

            })
        } 
    }

})();
(function() {
    'use strict';

    angular
        .module('app.invoices')
        .controller('editRecinvoCtrl', editRecinvoCtrl);

    /** @ngInject */
    function editRecinvoCtrl($scope, $rootScope, Invoicecopy, InvoiceService, $serviceCall, $customCtrl, $mdToast, $document, $mdDialog, $mdMedia, $imageUploader, uploaderService, $mdSidenav, AddressService, $state) {
        var vm = this;

        vm.TDinv = {};

        vm.toggleChildStates = toggleChildStates;
        vm.changeAddress = changeAddress;
        vm.loadAll = loadAll;
        InvoiceService.removeAll(0);
        InvoiceService.removeTaxArray(0);
        vm.selectedItemChange = selectedItemChange;
        vm.Invprefix = "REC"
        vm.Invsequence = "0000"
        vm.addProduct = addProduct;
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
        

        vm.brochureConfig = {
            restrict: "image/*|application/pdf",
            size: "2MB",
            crop: false,
            type: "brochure",
            maxCount: 1
        }

        vm.deleteProduct = deleteProduct;
        vm.editProduct = editProduct;
        vm.addShipping = addShipping;
        vm.uploadFile = uploadFile;
        vm.taxArray = [];

        vm.ActiveAddressObj = [];
        vm.ObjbillingAddress = [];
        vm.ObjshippingAddress = [];

        vm.hasSettingsData = false;
        vm.hasRecinvoData = false;
        vm.CusFieldsFromSettings = {};
        var details = [];
        vm.settings; //settings data for common use 

        var LoginName = "sddfsdfs";
        loadRecInvoice();

        //var details = Invoicecopy.getInvArr();

        //Start added by dushmantha
        $scope.$watch("details", function(data) {
            vm.hasRecinvoData = true;
            makeCustomFields();
        });
        //End added by dushmantha

        

        

        // vm.TDinv.startDate = new Date();
        // vm.TDinv.occurences = 0;
        // vm.TDinv.shipping = parseFloat(0);
        vm.paymentMethod = [];
        vm.checkpayments = [];

        loadAll();
        loadSettings();
        vm.paymentMethod.push({
            paymentmethod: '-',
            paymentType: 'offline',
            activate: "Active"
        })
        vm.paymentMethod.push({
            paymentmethod: 'Offline Payments Only',
            paymentType: 'offline',
            activate: "Active"
        })

        //methords for add product directive
        vm.getcurrencydetails = {};

        function loadCurrency(){
            
            vm.getcurrencydetails = vm.TDinv;
            
        }
       
        function getCurrencyDetails(obj){
            vm.getcurrencydetails = {};
            vm.getcurrencydetails = obj;
            
        };

        var addProduct = $rootScope.$on('addProductActivity', function(event, args){
            calculatetotal();
            if (vm.TDinv.peymentTerm == "multipleDueDates") {
                updateMultiDueDate();
            }
        });
        //----------------------------------Edit line intem methords
        var editProduct = $rootScope.$on('editProductActivity', function(event, args){
            debugger;
           
            if (vm.TDinv.peymentTerm == "multipleDueDates") {
                    updateMultiDueDate();
            }
        });
        //----------------------------------Edit line intem methords
        //methords for add product directive

        function loadRecInvoice()
        {
            var Invoice = { "permissionType" : "add", "appName":"Invoices"};
            var jsonString = JSON.stringify(Invoice);

            var client =  $serviceCall.setClient("getRecurringInvoiceByKey","process");
            client.ifSuccess(function(data){
                details = data;
                vm.TDinv = details;
                fillView();
            });
            client.ifError(function(data){
            console.log("error loading setting data")
            })
            client.uniqueID($state.params.itemId); //send projectID as url parameters
            client.postReq(jsonString);
        }
        function fillView()
        {
            //Start make address objects
            vm.ObjbillingAddress = AddressService.setAddress("", details.billingAddress.street, details.billingAddress.city, details.billingAddress.state, details.billingAddress.zip, details.billingAddress.country, details.contactNo, "mobile", details.fax, details.email, details.website);
            vm.ObjshippingAddress = AddressService.setAddress("", details.shippingAddress.s_street, details.shippingAddress.s_city, details.shippingAddress.s_state, details.shippingAddress.s_zip, details.shippingAddress.s_country, details.contactNo, "mobile", details.fax, details.email, details.website);
            vm.ActiveAddressObj = vm.ObjbillingAddress;
            //End make address objects

            

            if (vm.TDinv.startDate != undefined || vm.TDinv.startDate != "") {
                vm.TDinv.startDate = new Date(vm.TDinv.startDate);
            }

            vm.ship = vm.TDinv.shipping /  vm.TDinv.exchangeRate

            vm.selectedItem1 = details.profileName
            //for (var i = details.invoiceLines.length - 1; i >= 0; i--) { 
            for(var i = 0; i < details.invoiceLines.length; i++){
                InvoiceService.setArray(details.invoiceLines[i]);
            }
            InvoiceService.removeTaxArray(0)
            for (var i = details.taxAmounts.length - 1; i >= 0; i--) {
                InvoiceService.setTaxArr(details.taxAmounts[i])
            }
            //vm.taxArray = InvoiceService.getTaxArr()
            vm.taxArray = vm.TDinv.taxAmounts;

        }
        function loadSettings() {
            var settings = $serviceCall.setClient("getAllByQuery", "setting");
            settings.ifSuccess(function(data) {
                vm.settings = data;
                vm.CusFieldsFromSettings = data[0].preference.invoicePref.cusFiel; //should un comment this
                vm.hasSettingsData = true;
                vm.TDinv.createCompanyName = data[0].profile.companyName;
                makeCustomFields();
                assignSettigsData(data);
            });
            settings.ifError(function(data) {

            });
            settings.postReq({
                "setting": "profile,payments,taxes",
                "preference": "invoicePref,paymentPref,productPref,inventoryPref"
            })
        }


        function assignSettigsData(val) {

            //vm.TDinv.customFields = val[0].preference.invoicePref.cusFiel;
            vm.TDinv.saveOption = val[0].preference.invoicePref.recurringInvoiceDefultAction;
            vm.enableShippingCharges = val[0].preference.invoicePref.enableShipping;
            vm.TDinv.allowPartialPayments = val[0].preference.invoicePref.allowPartialPayments;

            vm.TDinv.peymentTerm = val[0].preference.invoicePref.defaultPaymentTerms;
            vm.enableShippingCharges = val[0].preference.invoicePref.enableShipping;
            vm.TDinv.allowPartialPayments = val[0].preference.invoicePref.allowPartialPayments;
            //vm.TDinv.baseCurrency = val[0].profile.baseCurrency; //comented by dushmantha
            //vm.TDinv.changedCurrency = val[0].profile.baseCurrency; //comented by dushmantha

            //vm.TDinv.billingFrequance = val[0].preference.invoicePref.billingFrequency //commented by dushmantha to let update this feald by invoice data

            if (val[0].preference.paymentPref.paymentMethods.length >= 1) {
                for (var x = val[0].preference.paymentPref.paymentMethods.length - 1; x >= 0; x--) {
                    if (val[0].preference.paymentPref.paymentMethods[x].activate == true) {
                        vm.paymentMethod.push({
                            paymentmethod: val[0].preference.paymentPref.paymentMethods[x].paymentMethod,
                            paymentType: val[0].preference.paymentPref.paymentMethods[x].paymentType,
                            activate: val[0].preference.paymentPref.paymentMethods[x].activate
                        })
                    }
                };
            }
            for (var y = val[0].payments.length - 1; y >= 0; y--) {
                break; // added to remove online payment methords
                if (val[0].payments[y].activate == true) {
                    vm.checkpayments = val[0].payments;
                    vm.paymentMethod.push({
                        paymentmethod: val[0].payments[y].name,
                        paymentType: val[0].payments[y].paymentType,
                        activate: val[0].payments[y].activate
                    })
                }
            };
            if (vm.checkpayments.length >= 1) {
                vm.paymentMethod.push({
                    paymentmethod: 'All Online Payment Options',
                    paymentType: 'offline',
                    activate: "Active"
                })
            }
            loadcurrentCurrencyModelData()
            loadCurrency(); // method for new add product
        }



        function makeCustomFields() {
            if (vm.hasRecinvoData == false || vm.hasSettingsData == false) {
                return;
            }
            var field = $customCtrl.getCustArr();
            field.settingCus(vm.CusFieldsFromSettings).appCus(vm.TDinv.customFields);
            vm.TDinv.customFields = field.fullArr().result;
        }

        ProductArray = InvoiceService.getArry();


        function toggleChildStates(toggledState) {
            $state.go(toggledState);
        };

        function loadcurrentCurrencyModelData() {  
            vm.currentCurrencyModel = {
                'currencyStatus': vm.TDinv.isCurrencyChanged,
                'exchangeRate': vm.TDinv.exchangeRate,
                'currencyType': vm.TDinv.changedCurrency,
                'baseCurrency': vm.TDinv.baseCurrency
            };  
        }
        var switchCurrency = $rootScope.$on('switchCurrActivity', function(event, args) {  
            vm.currencyChangeObject = args;
            vm.TDinv.isCurrencyChanged = vm.currencyChangeObject.currencyStatus;
            vm.TDinv.changedCurrency = vm.currencyChangeObject.currencyType;
            vm.TDinv.exchangeRate = parseFloat(vm.currencyChangeObject.exchangeRate);
            vm.ship= parseFloat(vm.TDinv.shipping / vm.currencyChangeObject.exchangeRate);
            getCurrencyDetails(vm.TDinv); //for add product ditective
        });

        $scope.$on('$destroy', function() {
            switchCurrency();
            addProduct();
        });


        //================change address============================
        vm.Billingaddress = true;
        vm.Shippingaddress = false;

        function changeAddress() {
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
            vm.enter(query)
            var results = [];
            for (var i = 0, len = customerNames.length; i < len; ++i) {
                results.push(customerNames[i]);
            }
            return results;
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
                            value: data.result[i],
                        });
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

        function loadAll() {
            loaDCus({
                where: "status = 'Active' and deleteStatus = false"
            })
        }

        vm.enter = function(val) {
            loaDCus({
                where: "status = 'Active' and deleteStatus = false and (profileName LIKE" + "'" + val + "%' OR email LIKE" + "'" + val + "%')"
            })
        }


        function selectedItemChange(obj) {
            console.log(obj)
            if (vm.selectedItem1 == null) {
                vm.showEditCustomer = false;
                vm.showEditCustomer = false;
                vm.TDinv.billingAddress = "";
                vm.TDinv.shippingAddress = "";
                vm.TDinv.contactNo = "";
                vm.TDinv.email = "";
            } else {
                vm.showEditCustomer = true;
                vm.TDinv.profileName = obj.value.profileName;
                vm.TDinv.email = obj.value.email;
                vm.TDinv.profileID = obj.value.profileID;
                vm.TDinv.contactNo = obj.value.phone;
                vm.TDinv.billingAddress = obj.value.billingAddress;
                vm.TDinv.shippingAddress = obj.value.shippingAddress;
            }
        };

        //add product Pop up
        function addProduct(ev) {
            $mdDialog.show({
                templateUrl: 'app/main/invoices/dialogs/addproduct/addproduct.html',
                targetEvent: ev,
                controller: 'InvoiceaddProdCtrl',
                controllerAs: 'vm',
                locals: {
                    exchangeRate: vm.TDinv.exchangeRate,
                    baseCurrency: vm.TDinv.baseCurrency,
                    changedCurrency: vm.TDinv.changedCurrency,
                    isCurrencyChanged: vm.TDinv.isCurrencyChanged,
                }
            }).then(function(val) {
                calculatetotal();
            }, function(val) {

            })
        }  
        
        vm.toggleChildStates = toggleChildStates; 
        vm.lineItems = ProductArray.val;
        // console.log(vm.lineItems)
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
        vm.taxArray = InvoiceService.getTaxArr();

        function calculatetotal() {
            vm.total = InvoiceService.calculateTotal();
            vm.taxArray = InvoiceService.getTaxArr();
            CalculateTax();
            finalamount();
        }

        function CalculateTax() {
            vm.salesTax = InvoiceService.calculateTax();
        }

        function finalamount() {
            vm.TDinv.shipping = parseInt(vm.ship * vm.TDinv.exchangeRate) 
            vm.famount = InvoiceService.calculateNetAMount(vm.ship * vm.TDinv.exchangeRate); 
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
                if (vm.TDinv.profileID != "") {
                    if (ProductArray.val.length > 0) {
                        if (vm.TDinv.billingFrequance != "" || vm.TDinv.billingFrequance != undefined) {

                            //Start fill vm.TDinv.customFields for saving
                            vm.TDinv.customFields.forEach(function(v) {
                                delete v.fields;
                                delete v.$$hashKey;
                            });
                            //End fill vm.TDinv.customFields for saving
                            //Start uploading image
                            if (vm.imageArray.length > 0) {
                                for (var indexx = 0; indexx < vm.imageArray.length; indexx++) {

                                    if (vm.imageArray[0].type == "application/pdf") {
                                        vm.type = "brochure";
                                    }

                                    if (vm.imageArray[0].type == "image/jpeg" || vm.imageArray[0].type == "image/png") {
                                        vm.type = "image";
                                    }

                                    var client = $imageUploader.setImage(vm.imageArray[indexx].uniqueCode, 'invoice');
                                    client.ifSuccess(function(data) {
                                        // vm.TDinv.uploadImages = vm.imageArray;
                                        vm.uploadImages = {};
                                        vm.uploadImages.ID = "";
                                        vm.uploadImages.name = vm.imageArray[0].name;
                                        vm.uploadImages.size = vm.imageArray[0].size;
                                        vm.uploadImages.uniqueCode = vm.imageArray[0].uniqueCode;
                                        vm.uploadImages.appGuid = "";
                                        vm.uploadImages.appName = "invoice";
                                        vm.uploadImages.createUser = "";
                                        vm.uploadImages.date = "";
                                        vm.uploadImages.type = vm.type;
                                        vm.TDinv.uploadImages.push(vm.uploadImages);
                                        successSubmit();
                                    });
                                    client.ifError(function(data) {});
                                    if (vm.imageArray[0].type == "application/pdf") {
                                        client.sendBrochure(vm.imageArray[indexx]);
                                        vm.imageArray[indexx].type = "brochure";
                                    }
                                    if (vm.imageArray[0].type == "image/jpeg" || vm.imageArray[0].type == "image/png") {
                                        client.sendImage(vm.imageArray[indexx]);
                                        vm.imageArray[indexx].type = "image";
                                    }
                                }
                            } else {
                                successSubmit();
                            }
                            //End uploading image
                        } else {
                            $mdDialog.show(
                                $mdDialog.alert()
                                .parent(angular.element(document.body))
                                .content('Select the billing frequency')
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

        //Start revers to base currency line items added by dushmantha
        function reverseBackBasecurrency() {
            for (var i = ProductArray.val.length - 1; i >= 0; i--) {
                if (vm.TDinv.isCurrencyChanged == true) {
                    ProductArray.val[i].amount = parseFloat(ProductArray.val[i].amount);
                    ProductArray.val[i].price = parseFloat(ProductArray.val[i].price);
                }
            }
        }
        //End revers to base currency line items added by dushmantha

        function successSubmit() {
            if (vm.TDinv.saveOption == 'Save invoice and email customer' || vm.TDinv.saveOption == 'Save email and charge customer') {
                vm.TDinv.emailCustomerUponSavingInvoice = true;
            }

            reverseBackBasecurrency();

            //push customer fields only value not null.............
            vm.customFields = [];
            for (var i = vm.TDinv.customFields.length - 1; i >= 0; i--) {
                if (vm.TDinv.customFields[i].value != "") {
                    vm.customFields.push(vm.TDinv.customFields[i]);
                }
            };

            vm.TDinv.customFields = vm.customFields;  
            vm.TDinv.discountPercentage = 0;

            vm.TDinv.subTotal = parseFloat(vm.total);
            vm.TDinv.balanceDue = parseFloat(vm.famount);
            vm.TDinv.netAmount = parseFloat(vm.famount);
            vm.TDinv.discountAmount = 0;
            vm.TDinv.salesTaxAmount = parseFloat(vm.salesTax); 
            vm.TDinv.pattern = vm.Invprefix + vm.Invsequence;
            vm.TDinv.multiDueDates = [{
                  dueDate: vm.TDinv.dueDate,
                  percentage: "0",
                  dueDatePrice: parseFloat(vm.famount),
                  paymentStatus: 'Unpaid',
                  balance: parseFloat(vm.famount),
                  paidAmount : 0
            }];  
            vm.TDinv.invoiceLines = ProductArray.val;
            vm.TDinv.taxAmounts = vm.taxArray;

            var Invoice = {
                "recurringInvoice": vm.TDinv,
                "image": [],
                "permissionType": "add",
                "appName": "Invoices"
            };;
            var jsonString = JSON.stringify(Invoice);

            var client = $serviceCall.setClient("updateRecurringInvoice", "process");
            client.ifSuccess(function(data) {
                vm.TDinv.invoiceNo = data.ID;
                $state.go('app.invoices.rec.detailView', {
                    itemId: vm.TDinv.invoiceNo
                });

                $mdToast.show(
                    $mdToast.simple()
                    .textContent('Recurring profile ' + data.ID + ' successfully edited')
                    .position('top right')
                    .hideDelay(3000)
                );
            });
            client.ifError(function(data) {
                $mdToast.show(
                    $mdToast.simple()
                    .textContent('Error editing recurring profile')
                    .position('top right')
                    .hideDelay(3000)
                );
            })
            client.postReq(jsonString);
        }

        function deleteProduct(prod, index) {
            //InvoiceService.ReverseTax(prod, index); //commented by dushmantha
            InvoiceService.removeTax(prod, ProductArray); // added by dushmantha
            InvoiceService.removeArray(prod, index);
            calculatetotal();
        }

        function editProduct(val, index) {
            $mdDialog.show({
                templateUrl: 'app/main/invoices/dialogs/addproduct/editProduct.html',
                controller: 'InvoiceeditNewProd',
                controllerAs: 'vm',
                locals: {
                    item: val,
                    settings: vm.settings,
                    exchangeRate: vm.TDinv.exchangeRate,
                    baseCurrency: vm.TDinv.baseCurrency,
                    changedCurrency: vm.TDinv.changedCurrency,
                    isCurrencyChanged: vm.TDinv.isCurrencyChanged,
                    index: index
                }
            }).then(function(data) {

            }, function(data) {

            })
        }


        vm.cancel = function(ev) {
            $state.go('app.invoices.rec');
        }

        function addShipping(val) {
            finalamount()
        }

        vm.addContact = addContact;

        function addContact() {
            $mdDialog.show({
                templateUrl: 'app/main/invoices/dialogs/contact/addContact.html',
                controller: 'addCusCtrl',
                controllerAs: 'vm'
            }).then(function(data) {
                var data = data;
                assignCusData(data);
            }, function(data) {

            })
        };

        function assignCusData(val) {
            console.log(val)
            var cus = {
                display: val.profileName,
                value: val
            }
            vm.selectedItem1 = val.profileName;
            selectedItemChange(cus)

        }

        vm.editContact = editContact;

        function editContact(val) {

            $mdDialog.show({
                templateUrl: 'app/main/invoices/dialogs/contact/addContact.html',
                controller: 'editCusCtrl',
                controllerAs: 'vm',
                locals: {
                    item: val.value
                }
            }).then(function(data) {
                var data = data;
                assignCusData(data);
            }, function(data) {

            })
        }
        //=================file uploader=========================
        vm.uploadFile = uploadFile;
        vm.imageArray = [];

        function uploadFile(res) {
            vm.imageArray = [];
            if (res.hasOwnProperty('brochure')) {

                vm.imageArray = res.brochure;
                // vm.imageArray = vm.imageArray[0].name;
                //vm.showBrochure = true;

            } else if (res.hasOwnProperty('image')) {
                vm.imageArray = [];
                vm.imageArray = res.image;

            } else if (res.hasOwnProperty('all')) {
                console.log(res.all);
                vm.imageArray = res.all;
                console.log(vm.imageArray);
            }

        }
        vm.changeCurrency = changeCurrency;

        function changeCurrency() {
            var currencyOBj = {
                baseCurrency: vm.TDinv.baseCurrency,
                currencyChanged: vm.TDinv.isCurrencyChanged,
                changedCurrency: vm.TDinv.changedCurrency,
                exchangeRate: vm.TDinv.exchangeRate
            }

            $mdDialog.show({
                templateUrl: 'app/main/invoices/dialogs/changeCurrency/changeCurrency.html',
                controller: 'InvoChangeCurrencyCtrl',
                controllerAs: 'vm',
                locals: {
                    item: currencyOBj,
                    total: vm.famount
                }
            }).then(function(data) {
                var data = data;

                var data = data;
                // console.log(data)
                if (data.currencyStatus == true) {
                    vm.TDinv.isCurrencyChanged = true;
                    vm.TDinv.changedCurrency = data.currencyType;
                    vm.TDinv.exchangeRate = parseFloat(data.exchangeRate)
                    vm.TDinv.shipping = parseFloat((vm.TDinv.shipping / vm.TDinv.exchangeRate) * data.exchangeRate);
                    var temp2 = ProductArray.val;
                }
            }, function(data) {

            })
        }

    }
})();
(function() {
    'use strict';

    angular
        .module('app.invoices')
        .controller('copyRecCtrl', copyRecCtrl);

    /** @ngInject */
    function copyRecCtrl($scope, $rootScope, Invoicecopy, InvoiceService, $serviceCall, $mdToast, $document, $mdDialog, $mdMedia, $mdSidenav, AddressService, $customCtrl, $state, $imageUploader, uploaderService) {
        var vm = this;

        vm.TDinv = {};

        vm.toggleChildStates = toggleChildStates;
        vm.changeAddress = changeAddress;
        vm.loadAll = loadAll;
        InvoiceService.removeAll(0);
        InvoiceService.removeTaxArray(0);
        vm.selectedItemChange = selectedItemChange;
        vm.loadInvNo = loadInvNo;
        vm.Invprefix = "REC";
        vm.Invsequence = "00000";
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
        vm.deleteProduct = deleteProduct;
        vm.editProduct = editProduct;
        vm.addShipping = addShipping;
        vm.taxArray = [];

        vm.paymentMethod = [];
        vm.checkpayments = [];

        vm.brochureConfig = {
            restrict: "image/*|application/pdf",
            size: "2MB",
            crop: false,
            type: "brochure",
            maxCount: 1
        }


        //var LoginName = $auth.getSession().Name;
        var LoginName = "sddfsdfs";
        vm.TDinv.recurringInvoiceID = "";
        vm.TDinv.occurences = "";
        vm.TDinv.billingFrequance = "";
        vm.TDinv.internalNote = "";
        vm.TDinv.recurringstatus = "";
        vm.TDinv.invoiceNo = "";
        vm.TDinv.baseCurrency = "";
        vm.TDinv.changedCurrency = "";
        vm.TDinv.isCurrencyChanged = "";
        vm.TDinv.customFields = [];
        vm.TDinv.deleteStatus = false;
        vm.TDinv.displayShippingAddress = "";
        vm.TDinv.email = "";
        vm.TDinv.profileID = "";
        vm.TDinv.profileName = "";
        vm.TDinv.startDate = "";
        vm.TDinv.uploadImages = [];
        vm.TDinv.allowPartialPayments = "";
        vm.TDinv.billingAddress = "";
        vm.TDinv.comments = "";
        vm.TDinv.notes = "";
        vm.TDinv.invoiceLog = "";
        vm.TDinv.discountAmount = "";
        vm.TDinv.discountPercentage = "";
        vm.TDinv.exchangeRate = "";
        vm.TDinv.favouriteStar = false;
        vm.TDinv.favouriteStarNo = 1;
        vm.TDinv.subTotal = "";
        vm.TDinv.netAmount = "";
        vm.TDinv.paymentMethod = "";
        vm.TDinv.invoiceLines = [];
        vm.TDinv.tags = "";
        vm.TDinv.salesTaxAmount = "";
        vm.TDinv.shipping = "";
        vm.TDinv.shippingAddress = "";
        vm.TDinv.taxAmounts = [];
        vm.TDinv.status = "Active";
        vm.TDinv.lastTranDate = new Date();
        vm.TDinv.createDate = new Date();
        vm.TDinv.modifyDate = new Date();
        vm.TDinv.createUser = "";
        vm.TDinv.modifyUser = "";
        vm.TDinv.sendMail = "";
        vm.TDinv.viewed = "";
        vm.TDinv.peymentTerm = "";
        vm.TDinv.allowPartialPayments = "";
        vm.TDinv.pattern = "";
        vm.TDinv.discountTerm = "";
        vm.TDinv.saveOption = "";
        vm.TDinv.multiDueDates = [];
        vm.TDinv.duedate = "";
        vm.TDinv.invoiceStatus = "Unpaid";
        vm.TDinv.poNumber = "";
        vm.TDinv.lastEmailDate = "";
        vm.TDinv.paymentType = "";

        vm.ActiveAddressObj = [];
        vm.ObjbillingAddress = [];
        vm.ObjshippingAddress = [];

        vm.hasSettingsData = false;
        vm.hasRecinvoData = false;
        vm.CusFieldsFromSettings = {};
        vm.settings; //settings data for common use

        vm.enableShipping = false;

        var details = Invoicecopy.getInvArr();
        
        //Start added by dushmantha
        if(angular.equals(details, {}) )
        {debugger;
            //loadInvoice($state.params.itemId);
            loadRecInvoice($state.params.itemId,function(invoidata) {
                vm.TDinv = details;
                loadCustomer(invoidata.profileID);
                loadSettings();

                fillView();
            })
        }
        else
        {
            vm.TDinv = details;
            loadCustomer(details.profileID);
            loadSettings();
            fillView();
        }
        vm.TDinv.favouriteStarNo = 1;
        $scope.$watch("details", function(data) {
            vm.hasRecinvoData = true;
            makeCustomFields();
        });
        //End added by dushmantha


        vm.selectedItem1 = details.profileName;
        
        
        vm.taxArray = InvoiceService.getTaxArr()

        
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

        $scope.$on('selectedProfile', function(ev, args) {
            debugger;
            var obj = [];
            obj.value = args.slctdProfile;
            vm.selectedItem1.value = args.slctdProfile;

            selectedItemChange(obj);

        });

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

        //Start methords for contact popup directive
        var addNewContact = $rootScope.$on('newContactActivity', function(event, args) {
            var newCustomer = args;
            assignCusData(newCustomer);
         });
         var editContact = $rootScope.$on('editContactActivity', function(event, args){
                    var editCustomer = args;
                    assignCusData(editCustomer);
         });

        $scope.$on('$destroy', function() {
                    addNewContact();
                    editContact();
         });
        //End methords for contact popup directive
        
        function fillView()
        {
            vm.ship = vm.TDinv.shipping / vm.TDinv.exchangeRate

            //Start make address objects
            vm.ObjbillingAddress = AddressService.setAddress("", details.billingAddress.street, details.billingAddress.city, details.billingAddress.state, details.billingAddress.zip, details.billingAddress.country, details.contactNo, "mobile", details.fax, details.email, details.website);
            vm.ObjshippingAddress = AddressService.setAddress("", details.shippingAddress.s_street, details.shippingAddress.s_city, details.shippingAddress.s_state, details.shippingAddress.s_zip, details.shippingAddress.s_country, details.contactNo, "mobile", details.fax, details.email, details.website);
            vm.ActiveAddressObj = vm.ObjbillingAddress;
            //End make address objects

            //for (var i = details.invoiceLines.length - 1; i >= 0; i--) {
            for(var i = 0; i < details.invoiceLines.length; i++){
            InvoiceService.setArray(details.invoiceLines[i])
            }

            InvoiceService.removeTaxArray(0)
            for (var i = details.taxAmounts.length - 1; i >= 0; i--) {
                InvoiceService.setTaxArr(details.taxAmounts[i])
            }

            vm.TDinv.startDate = new Date();
            //vm.TDinv.occurences = 0;
            vm.TDinv.shipping = parseFloat(0);
            
        }

        function loadCustomer(val){ 
          var client = $serviceCall.setClient("getProfileByKey","profile");
             client.ifSuccess(function(data){ debugger;
                
                var cus = {
                    display:data.profileName,
                    value : data
                }
                vm.selectedItem1 = cus;
                $rootScope.$broadcast('extupslctusr',cus);
                selectedItemChange(cus); 
                
                
               });
               client.ifError(function(data){
                console.log("error loading profile data")
               })
               client.uniqueID(val);
               client.postReq();
        }

        function loadRecInvoice(invoID,callback)
        {debugger;
            var Invoice = { "permissionType" : "add", "appName":"Invoices"};
            var jsonString = JSON.stringify(Invoice);
            var client =  $serviceCall.setClient("getRecurringInvoiceByKey","process");
            client.ifSuccess(function(data){
                details = data;
                callback(details);
              //fillview(data);
              //loadAdvancePaymentDetails(data.profileID)
              
              //vm.ObjCusAddress = AddressService.setAddress(vm.inv.profileName,vm.inv.billingAddress.street,vm.inv.billingAddress.city,vm.inv.billingAddress.state,vm.inv.billingAddress.zip,vm.inv.billingAddress.country,vm.inv.contactNo,vm.inv.mobileNo,vm.inv.fax,vm.inv.email,vm.inv.website);
             
            });
            client.ifError(function(data){
              console.log("error loading invoice data")
            })
            
            client.uniqueID(invoID);
            client.postReq(jsonString);
        }

        function loadSettings() {
            var settings = $serviceCall.setClient("getAllByQuery", "setting");
            settings.ifSuccess(function(data) {
                if (data[0].preference.invoicePref.enableShipping != undefined) {
                    vm.enableShipping = data[0].preference.invoicePref.enableShipping;
                }
                vm.settings = data;
                vm.CusFieldsFromSettings = data[0].preference.invoicePref.cusFiel; //should un comment this
                vm.hasSettingsData = true;
                vm.TDinv.createCompanyName = data[0].profile.companyName;
                makeCustomFields();
                assignSettigsData(data);
                loadcurrentCurrencyModelData()
            });
            settings.ifError(function(data) {

            });
            settings.postReq({
                "setting": "profile,payments,taxes",
                "preference": "invoicePref,paymentPref,productPref,inventoryPref"
            })
        }
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



        function assignSettigsData(val) {
            loadInvNo();

            vm.TDinv.saveOption = val[0].preference.invoicePref.recurringInvoiceDefultAction;
            vm.enableShippingCharges = val[0].preference.invoicePref.enableShipping;
            vm.TDinv.allowPartialPayments = val[0].preference.invoicePref.allowPartialPayments;

            vm.TDinv.peymentTerm = val[0].preference.invoicePref.defaultPaymentTerms;
            vm.enableShippingCharges = val[0].preference.invoicePref.enableShipping;
            vm.TDinv.allowPartialPayments = val[0].preference.invoicePref.allowPartialPayments;
            //vm.TDinv.baseCurrency = val[0].profile.baseCurrency;
            //vm.TDinv.changedCurrency = val[0].profile.baseCurrency;
            //vm.TDinv.billingFrequance = val[0].preference.invoicePref.billingFrequency;

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

            loadcurrentCurrencyModelData(); 
            loadCurrency(); // method for new add product
        }

        function makeCustomFields() {
            if (vm.hasRecinvoData == false || vm.hasSettingsData == false) {
                return;
            }

            //Start added by dushmantha
            var field = $customCtrl.getCustArr();
            field.settingCus(vm.CusFieldsFromSettings).appCus(vm.TDinv.customFields);
            vm.TDinv.customFields = field.fullArr().result;
            //Start push property for ng-model data
            /*for(var i=0; i<= vm.TDinv.customFields.length -1; i++){
              vm.TDinv.customFields[i]['value'] = "";
            }*/
            //End push property for ng-model data
            //End added by dushmantha
        }

        ProductArray = InvoiceService.getArry();


        function toggleChildStates(toggledState) {
            $state.go(toggledState);
        };

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


        function selectedItemChange(obj) { debugger;
            console.log(obj)
            //Start informe profile popup diective that new profile hasbeen selected;
            vm.customerEditdetails = {};
            vm.customerEditdetails = obj.value;
            //End informe profile popup diective that new profile hasbeen selected;

            if (vm.selectedItem1 == null) {
                vm.showEditCustomer = false;
                vm.showEditCustomer = false;
                vm.TDinv.billingAddress = "";
                vm.TDinv.shippingAddress = "";
                vm.TDinv.contactNo = "";
                vm.TDinv.email = "";
            } else {

                vm.ObjbillingAddress = AddressService.setAddress(obj.value.profileName, obj.value.billingAddress.street, obj.value.billingAddress.city, obj.value.billingAddress.state, obj.value.billingAddress.zip, obj.value.billingAddress.country, obj.value.phone, obj.value.mobile, obj.value.fax, obj.value.email, obj.value.website);
                vm.ObjshippingAddress = AddressService.setAddress(obj.value.profileName, obj.value.shippingAddress.s_street, obj.value.shippingAddress.s_city, obj.value.shippingAddress.s_state, obj.value.shippingAddress.s_zip, obj.value.shippingAddress.s_country, obj.value.phone, obj.value.mobile, obj.value.fax, obj.value.email, obj.value.website);
                vm.ActiveAddressObj = vm.ObjbillingAddress;

                vm.showEditCustomer = true;
                vm.TDinv.profileName = obj.value.profileName;
                vm.TDinv.email = obj.value.email;
                vm.TDinv.profileID = obj.value.profileID;
                vm.TDinv.contactNo = obj.value.phone;
                vm.TDinv.billingAddress = obj.value.billingAddress;
                vm.TDinv.shippingAddress = obj.value.shippingAddress;
            }
        };

        function loadInvNo() {
            var client = $serviceCall.setClient("getNextNo", "invoice");
            client.ifSuccess(function(data) {
                var data = data;
                vm.recurringInvoiceID = data;
            });
            client.ifError(function(data) {
                console.log("error loading invoice No")
            })
            client.pattern("REC0000");
            client.getReq();
        }

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
            // vm.famount = parseFloat(vm.total) + parseFloat(vm.salesTax) +
            //     parseFloat(vm.ship);
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
                            successSubmit();
                        } else {
                            $mdDialog.show(
                                $mdDialog.alert()
                                .parent(angular.element(document.body))
                                .title('Alert')
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
            //vm.TDinv.exchangeRate = 1;
            vm.TDinv.invoiceNo = "-999";
            vm.TDinv.multiDueDates = [{
                  dueDate: vm.TDinv.dueDate,
                  percentage: "0",
                  dueDatePrice: parseFloat(vm.famount),
                  paymentStatus: 'Unpaid',
                  balance: parseFloat(vm.famount),
                  paidAmount : 0
            }]; 
            vm.TDinv.subTotal = parseFloat(vm.total);
            vm.TDinv.balanceDue = parseFloat(vm.famount);
            vm.TDinv.netAmount = parseFloat(vm.famount);
            vm.TDinv.discountAmount = 0;
            vm.TDinv.salesTaxAmount = parseFloat(vm.salesTax);
            vm.TDinv.invoiceStatus = "Unpaid";
            vm.TDinv.pattern = vm.Invprefix + vm.Invsequence; 
            vm.TDinv.invoiceLines = ProductArray.val;
            vm.TDinv.taxAmounts = vm.taxArray;

            var Invoice = {
                "recurringInvoice": vm.TDinv,
                "image": [],
                "permissionType": "add",
                "appName": "Invoices"
            };;
            var jsonString = JSON.stringify(Invoice);

            var client = $serviceCall.setClient("saveRecurringInvoice", "process");
            client.ifSuccess(function(data) {

                vm.TDinv.recurringInvoiceID = data.ID;
                $state.go('app.invoices.rec.detailView', {
                    itemId: vm.TDinv.recurringInvoiceID
                });

                $mdToast.show(
                    $mdToast.simple()
                    .textContent('Recurring profile ' + data.ID + ' successfully saved')
                    .position('top right')
                    .hideDelay(3000)
                );

                if (vm.settings[0].preference.invoicePref.emailCustomerOption == 'Display pop up and prompt') {
                    popupEmailDialog(vm.TDinv, vm.settings[0].profile, vm.settings);
                }
            });
            client.ifError(function(data) {
                $mdToast.show(
                    $mdToast.simple()
                    .textContent('Error saving invoice')
                    .position('top right')
                    .hideDelay(3000)
                );
            })
            client.postReq(jsonString);
        }

        function popupEmailDialog(invoiceData, profData, settings) {
            $mdDialog.show({
                templateUrl: 'app/main/invoices/dialogs/email/email.html',
                controller: 'InvoemailCtrl',
                controllerAs: 'vm',
                locals: {
                    item: invoiceData,
                    profData: profData,
                    template: 'T_EMAIL_REC_NEWMAIL',
                    type: 'recinvoice',
                    amount: '',
                    settings: settings
                }
            }).then(function(data) {

            }, function(data) {

            })
        }

        function deleteProduct(prod, index) {
            //InvoiceService.ReverseTax(prod, index);//comented by dushmantha
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
                console.log(data)
            }, function(data) {

            })
        }


        vm.cancel = function(ev) {

            if (vm.selectedItem1 == null) {
                $state.go('app.invoices.rec');
            } else {
                var confirm = $mdDialog.confirm()
                    .title('Save recurring profile as draft?')
                    .content('')
                    .ariaLabel('Lucky day')
                    .targetEvent(ev)
                    .ok('save')
                    .cancel('clear');
                $mdDialog.show(confirm).then(function() {
                    vm.TDinv.multiDueDates = [{
                        dueDate: vm.TDinv.dueDate,
                        percentage: "0",
                        dueDatePrice: vm.famount,
                        paymentStatus: 'Unpaid',
                        balance: vm.famount,
                        paidAmount: 0
                    }];

                    //vm.TDinv.discountPercentage = $rootScope.adddiscount;
                    vm.TDinv.invoiceNo = "-999";
                    vm.TDinv.status = "Draft"
                    vm.TDinv.invoiceStatus = "Unpaid"
                    vm.TDinv.pattern = "DREC" + vm.Invsequence;
                    vm.TDinv.taxAmounts = vm.taxArray;

                    vm.TDinv.invoiceLog = {
                        ActivityNo: "",
                        logID: "-888",
                        type: "Activity",
                        description: "Save as Draft" + " ",
                        status: "Active",
                        userName: LoginName,
                        lastTranDate: new Date(),
                        createDate: new Date(),
                        modifyDate: new Date(),
                        createUser: LoginName,
                        modifyUser: LoginName,
                        invoiceNo: ""
                    }
                    vm.TDinv.invoiceLines = ProductArray.val;
                    var jsonString = JSON.stringify(vm.TDinv);

                    var client = $serviceCall.setClient("insertRecInvoiceDraft", "invoice");
                    client.ifSuccess(function(data) {
                        $state.go('app.invoices.rec');

                        $mdToast.show(
                            $mdToast.simple()
                            .textContent('Draft invoice ' + data.ID + ' successfully saved')
                            .position('top right')
                            .hideDelay(3000)
                        );
                    });
                    client.ifError(function(data) {
                        $mdToast.show(
                            $mdToast.simple()
                            .textContent('Error saving draft invoice')
                            .position('top right')
                            .hideDelay(3000)
                        );
                    })
                    client.postReq(jsonString);
                }, function() {
                    $state.go('app.invoices.inv');
                })
            }

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
            debugger;
            if (val != undefined) {
                console.log(val)
                var cus = {
                    display: val.profileName,
                    value: val
                }
                vm.selectedItem1 = cus;
                $rootScope.$broadcast('extupslctusr', cus);
                selectedItemChange(cus);
            }
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

        //==========================================
        vm.uploadFile = uploadFile;
        vm.imageArray = [];

        function uploadFile(res) {

            if (res.hasOwnProperty('brochure')) {

                vm.imageArray = res.brochure;
              
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
        //=================================================================
        vm.changeCurrency = changeCurrency;

        function changeCurrency() {
            $mdDialog.show({
                templateUrl: 'app/main/invoices/dialogs/changeCurrency/changeCurrency.html',
                controller: 'changeCurrencyCtrl',
                controllerAs: 'vm',
                locals: {
                    item: "USD"
                }
            }).then(function(data) {
                var data = data;
                console.log(data)
                // assignCusData(data);
            }, function(data) {

            })
        }

    }
})();
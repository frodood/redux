(function ()
{
    'use strict';

    angular
        .module('app.invoices')
        .controller('editInvCtrl', editInvCtrl);

    function editInvCtrl($scope, $rootScope, Invoicecopy, InvoiceService, $serviceCall, $mdToast, $document, $mdDialog, $mdMedia, $mdSidenav,invoiceMultipleDueDatesService,AddressService, $state)
    {
         var vm = this;

        vm.TDinv = {};

        vm.toggleChildStates = toggleChildStates;
        vm.changeAddress = changeAddress;
        InvoiceService.removeAll(0);
        InvoiceService.removeTaxArray(0);
        vm.selectedItemChange = selectedItemChange;
       // vm.loadInvNo = loadInvNo;
        // vm.Invprefix = "INV"
        // vm.Invsequence = "0000"
        vm.addProduct = addProduct;
        vm.calculatetotal = calculatetotal;
        vm.CalculateTax = CalculateTax;
        vm.salesTax = 0;
        vm.total = 0;
        vm.finalamount = finalamount;
        vm.famount = 0;
        vm.submit  = submit;
        var ProductArray = [];
        vm.lineItems = [];
        var taxArr = [];
        vm.deleteProduct = deleteProduct;
        vm.editProduct = editProduct;
        vm.addShipping = addShipping;
        vm.MultiDuDates = MultiDuDates;
        vm.taxArray = [];
        vm.TDinv.isCurrencyChanged  = true;
        vm.enableShipping = false;
        vm.ship = 0;
        vm.backState = 'app.invoices.inv';
        vm.settings;
        
        loadINVDRaft();
       
        vm.selectedItem1 = [];
        var details = [];
        var IsfirstPeymentTermSet = false;

        $scope.$on('selectedProfile', function(ev, args){ debugger;
            var obj = [];
            obj.value = args.slctdProfile;
            vm.selectedItem1.value = args.slctdProfile;

            selectedItemChange(obj);

        });



        vm.showMoreInfo = false;
        
        

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

        //Start methords for contact popup directive
        var addNewContact = $rootScope.$on('newContactActivity', function(event, args) {
            var newCustomer = args;
            assignCusData(newCustomer);
         });
         var editContact = $rootScope.$on('editContactActivity', function(event, args){
            debugger;
                    var editCustomer = args;
                    assignCusData(editCustomer);
         });

        $scope.$on('$destroy', function() {
                    addNewContact();
                    editContact();
         });
        //End methords for contact popup directive
        
        function loadINVDRaft(){
            var Invoice = { "permissionType" : "add", "appName":"Invoices"};
              var jsonString = JSON.stringify(Invoice);

              var client =  $serviceCall.setClient("getInvoiceDraftByKey","invoice");
              client.ifSuccess(function(data){
                  var data = data;

                    loadSettings();
                    loaDCus(data.profileID);
                    
                  vm.TDinv = data;
                  vm.ship = vm.TDinv.shipping / vm.TDinv.exchangeRate;

                    if(vm.TDinv.invoiceLines){
                        for (var i = vm.TDinv.invoiceLines.length - 1; i >= 0; i--) {
                            InvoiceService.setArray(vm.TDinv.invoiceLines[i])
                        }
                    }
                    InvoiceService.removeTaxArray(0)
                    for (var i = vm.TDinv.taxAmounts.length - 1; i >= 0; i--) {
                        InvoiceService.setTaxArr(vm.TDinv.taxAmounts[i])
                    }
                    vm.taxArray = InvoiceService.getTaxArr();
                  fillview();
              });
              client.ifError(function(data){
                console.log("error loading setting data")
              })
              client.uniqueID($state.params.itemId); //details.invoiceNo send projectID as url parameters
              client.postReq();
        }

        function fillview()
        {
            details =  vm.TDinv;
            var invNo = details.invoiceNo;

            //Start Fill Multi due dates array
           //invoiceMultipleDueDatesService.ClearDateArray();
           invoiceMultipleDueDatesService.clearInvoiceMultiDateArray();
           for(var i = 0; vm.TDinv.multiDueDates.length > i; i++)
           {
           invoiceMultipleDueDatesService.setDateArray({
                        invoiceNo : "",
                        dueDate: new Date(vm.TDinv.multiDueDates[i].dueDate),
                        percentage: vm.TDinv.multiDueDates[i].percentage,
                        dueDatePrice: vm.TDinv.multiDueDates[i].dueDatePrice,
                        paymentStatus: vm.TDinv.multiDueDates[i].paymentStatus,
                        balance: vm.TDinv.multiDueDates[i].balance,
                        peymentTerm : "",
                        createDate   : new Date(),
                        modifyDate   : new Date(),
                        createUser   : "",
                        modifyUser   : "",
                        count: i
                    });
            }
           //End fill multiduedates array

           //var details = Invoicecopy.getInvArr();
            //loaDCusdata(details.profileID);
            vm.TDinv = details;

        }
        
        function loaDCusdata(profileID)
        {debugger;
            var client =  $serviceCall.setClient("getProfileByKey","profile");
            client.ifSuccess(function(data){
                    
                    //Start make address objects
                    vm.ObjbillingAddress = AddressService.setAddress("",data.billingAddress.street,data.billingAddress.city,data.billingAddress.state,data.billingAddress.zip,data.billingAddress.country,data.phone,data.mobile,data.fax,data.email,data.website);
                    vm.ObjshippingAddress = AddressService.setAddress("",data.shippingAddress.s_street,data.shippingAddress.s_city,data.shippingAddress.s_state,data.shippingAddress.s_zip,data.shippingAddress.s_country,data.phone,data.mobile,data.fax,data.email,data.website);
                    vm.ActiveAddressObj = vm.ObjbillingAddress;
                   //End make address objects
            });
            client.ifError(function(data){
                    
            });
            client.uniqueID(profileID);
            client.getReq();
        }
        console.log(details)

         vm.TDinv.startDate = new Date();
            vm.TDinv.shipping = parseFloat(0);
            vm.paymentMethod = [];
            vm.checkpayments = [];
            

             vm.paymentMethod.push({
                paymentmethod: 'Allow online and offline',
                paymentType: 'Offline',
                activate: "Active"
        })
            vm.paymentMethod.push({
                paymentmethod: 'Offline Payments Only',
                paymentType: 'Offline',
                activate: "Active"
        })

        function loadSettings(){
            var settings = $serviceCall.setClient("getAllByQuery","setting");
            settings.ifSuccess(function(data){
                if (data[0].preference.invoicePref.enableShipping != undefined) {
                    vm.enableShipping = data[0].preference.invoicePref.enableShipping;
                }
                vm.settings = data;
                vm.TDinv.createCompanyName = data[0].profile.companyName;
               assignSettigsData(data);
            });
            settings.ifError(function(data){

            });
            settings.postReq({"setting":"profile,payments,taxes","preference":"invoicePref,paymentPref,productPref,inventoryPref"})
        }
        //"setting":"profile,payments","preference":"invoicePref,paymentPref,productPref,inventoryPref"
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
        
        function loadInvNo() {
            var client = $serviceCall.setClient("getNextNo", "invoice");
            client.ifSuccess(function(data) {
                var data = data;
                vm.invoiceRefNo = data;
            });
            client.ifError(function(data) {
                console.log("error loading invoice No")
            })
            client.pattern(vm.Invprefix + vm.Invsequence);
            client.getReq();
        }


        function assignSettigsData(val){
             vm.Invprefix = val[0].preference.invoicePref.invoicePrefix;
             vm.Invsequence = val[0].preference.invoicePref.invoiceSequence;
            loadInvNo();

            if(vm.TDinv.peymentTerm == undefined || vm.TDinv.peymentTerm == "")
            {
            vm.TDinv.peymentTerm = val[0].preference.invoicePref.defaultPaymentTerms;
            }
            vm.enableShippingCharges = val[0].preference.invoicePref.enableShipping;
            vm.TDinv.allowPartialPayments = val[0].preference.invoicePref.allowPartialPayments;
            vm.TDinv.baseCurrency = val[0].profile.baseCurrency;
            vm.TDinv.changedCurrency = val[0].profile.baseCurrency;


            if(val[0].preference.paymentPref.paymentMethods.length >= 1) {
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
                if(vm.checkpayments.length >= 1){
                    vm.paymentMethod.push({
                            paymentmethod: 'All Online Payment Options',
                            paymentType: 'offline',
                            activate: "Active"
                        })
                }
                debugger;
                loadcurrentCurrencyModelData();
                loadCurrency(); // method for new add product
        }


         $scope.$watch("vm.TDinv.peymentTerm", function() { debugger;
            if (vm.TDinv.peymentTerm == "Due on Receipt" && IsfirstPeymentTermSet ) {
                vm.TDinv.dueDate = new Date();
                vm.dueOnReciept = new Date();
                vm.showdate = false;
            }
            if (vm.TDinv.peymentTerm == "Net 7 days" && IsfirstPeymentTermSet) {
                vm.sevenDays = new Date();
                vm.sevenDays.setDate(vm.sevenDays.getDate() + 7);
                vm.TDinv.dueDate = vm.sevenDays;
                vm.showdate = false;
            }
            if (vm.TDinv.peymentTerm == "Net 14 days" && IsfirstPeymentTermSet) {
                vm.fourteendays = new Date();
                vm.fourteendays.setDate(vm.fourteendays.getDate() + 14);
                vm.TDinv.dueDate = vm.fourteendays;
                vm.showdate = false;
            }
            if (vm.TDinv.peymentTerm == "Net 21 days" && IsfirstPeymentTermSet) {
                vm.twentyOneDays = new Date();
                vm.twentyOneDays.setDate(vm.twentyOneDays.getDate() + 21);
                vm.TDinv.dueDate = vm.twentyOneDays;
                vm.showdate = false;
            }
            if (vm.TDinv.peymentTerm == "Net 30 days" && IsfirstPeymentTermSet) {
                vm.thirtyDays = new Date();
                vm.thirtyDays.setDate(vm.thirtyDays.getDate() + 30);
                vm.TDinv.dueDate = vm.thirtyDays;
                vm.showdate = false;
                //$rootScope.termType = "Net 30 days"
            }
            if (vm.TDinv.peymentTerm == "Net 45 days" && IsfirstPeymentTermSet) {
                vm.fourtyFiveDays = new Date();
                vm.fourtyFiveDays.setDate(vm.fourtyFiveDays.getDate() + 45);
                vm.TDinv.dueDate = vm.fourtyFiveDays;
                vm.showdate = false;
                //$rootScope.termType = "Net 45 days"
            }
            if (vm.TDinv.peymentTerm == "Net 60 days" && IsfirstPeymentTermSet) {
                vm.sixtyDays = new Date();
                vm.sixtyDays.setDate(vm.sixtyDays.getDate() + 60);
                vm.TDinv.dueDate = vm.sixtyDays;
                vm.showdate = false;
            }
            if (vm.TDinv.peymentTerm == "Custom" && IsfirstPeymentTermSet) {
                vm.TDinv.dueDate = "";
                vm.showdate = false;
            }
            if (vm.TDinv.peymentTerm == "multipleDueDates" && IsfirstPeymentTermSet) {
                //$rootScope.termType = "multipleDueDates"
                vm.showdate = true;
            }
            if (vm.TDinv.peymentTerm != undefined)
            {
            IsfirstPeymentTermSet = true;
            }
        });
        
        ProductArray = InvoiceService.getArry();
        function MultiDuDates(){ debugger;
            if(ProductArray.val.length >= 1){
               $mdDialog.show({
                templateUrl: 'app/main/invoices/dialogs/multiDueDates/MultiDueDates.html',
                controller: 'InvomultiDueDatesCtrl',
                controllerAs: 'vm',
                currency : vm.TDinv.changedCurrency,
                locals:{
                        item : vm.famount,
                        invoice: vm.TDinv
                    }
            });
           }else{
             var tt = angular.copy(vm.TDinv.peymentTerm)
           
                $mdDialog.show(
                    $mdDialog.alert()
                    .parent(angular.element(document.body))
                    .title('Alert')
                    .content('Add a line item to configure multiple due dates')
                    .ariaLabel('Alert Dialog Demo')
                    .ok('OK')
                    .targetEvent()
                ).then(function() { 
                    vm.TDinv.peymentTerm =  tt;
                }, function() {});
          
             }
        }


        
        function toggleChildStates(toggledState){
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
        function loaDCus(val){
          var client = $serviceCall.setClient("getProfileByKey","profile");
             client.ifSuccess(function(data){
                var data = data;
                debugger;

                vm.selectedItem1.value = data;
                selectedItemChange(vm.selectedItem1);
                   var cus = {
                        display:data.profileName,
                        value : data
                    }

                   $rootScope.$broadcast('extupslctusr',cus);

                   //Start make address objects
                    vm.ObjbillingAddress = AddressService.setAddress("",data.billingAddress.street,data.billingAddress.city,data.billingAddress.state,data.billingAddress.zip,data.billingAddress.country,data.phone,data.mobile,data.fax,data.email,data.website);
                    vm.ObjshippingAddress = AddressService.setAddress("",data.shippingAddress.s_street,data.shippingAddress.s_city,data.shippingAddress.s_state,data.shippingAddress.s_zip,data.shippingAddress.s_country,data.phone,data.mobile,data.fax,data.email,data.website);
                    vm.ActiveAddressObj = vm.ObjbillingAddress;
                   //End make address objects
                
               });
               client.ifError(function(data){
                console.log("error loading profile data")
               })
               client.uniqueID(val);
               client.postReq();
        }

        


       function selectedItemChange(obj) {
            console.log(obj)
            //Start informe profile popup diective that new profile hasbeen selected;
            vm.customerEditdetails = {};
            vm.customerEditdetails = obj.value;
            //End informe profile popup diective that new profile hasbeen selected;
            
            if(vm.selectedItem1 == null){
                vm.showEditCustomer = false;
                vm.TDinv.billingAddress = "";
                vm.TDinv.shippingAddress = "";
                vm.TDinv.contactNo = "";
                vm.TDinv.email = "";
            }else{

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

        //add product Pop up
        /*function addProduct(ev){ debugger;
             $mdDialog.show({
                templateUrl: 'app/main/invoices/dialogs/addproduct/addproduct.html',
                targetEvent: ev,
                controller: 'addProdCtrl',
                controllerAs: 'vm',
                locals:{
                        exchangeRate : vm.TDinv.exchangeRate,
                        baseCurrency : vm.TDinv.baseCurrency,
                        changedCurrency : vm.TDinv.changedCurrency,
                        isCurrencyChanged : vm.TDinv.isCurrencyChanged,
                    }
            }).then(function(val){
                calculatetotal();
            },function(val){

            })
        }*/
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
                if (vm.TDinv.peymentTerm == "multipleDueDates") {
                    updateMultiDueDate();
                }
            }, function(val) {

            })
        }

         

        vm.toggleChildStates = toggleChildStates;
        vm.lineItems = ProductArray.val;
        vm.sortableOptions = {
            handle        : '.handle',
            forceFallback : true,
            ghostClass    : 'line-item-placeholder',
            fallbackClass : 'line-item-ghost',
            fallbackOnBody: true,
            sort          : true
        };

        vm.itemOrder = '';

        vm.preventDefault = preventDefault;
        
        function toggleChildStates(toggledState){
            $state.go(toggledState);
        };

        function preventDefault(e){
            e.preventDefault();
            e.stopPropagation();
        };

        vm.taxArray = InvoiceService.getTaxArr();
        function calculatetotal(){
            vm.total = InvoiceService.calculateTotal();
             vm.taxArray = InvoiceService.getTaxArr();
            CalculateTax();
            finalamount();
        }

        function CalculateTax() {
            vm.salesTax = InvoiceService.calculateTax();
        }
        
        function finalamount() {
            vm.TDinv.shipping = parseFloat(vm.ship * vm.TDinv.exchangeRate)
            vm.famount = InvoiceService.calculateNetAMount(vm.ship * vm.TDinv.exchangeRate);
        };



        function submit(){
            if(vm.selectedItem1 == null){
               $mdDialog.show(
                  $mdDialog.alert()
                  .parent(angular.element(document.body))
                  .title('Alert')
                  .content('Select a customer')
                  .ariaLabel('Alert Dialog Demo')
                  .ok('OK')
                  .targetEvent()
                ); 
            }else{
                if(vm.TDinv.profileID != ""){
                    if(ProductArray.val.length > 0){
                        if(vm.TDinv.peymentTerm != "" || vm.TDinv.peymentTerm != undefined){
                            successSubmit();  
                        }else{
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
                    }else{
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
                }else{
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

        function successSubmit(){ debugger;
            if(vm.TDinv.peymentTerm == "multipleDueDates"){
              var multiDueDates = invoiceMultipleDueDatesService.getArry();
              for (var i = multiDueDates.val.length - 1; i >= 0; i--) {
                  vm.TDinv.multiDueDates.push({
                        dueDate: multiDueDates.val[i].dueDate,
                        percentage:  multiDueDates.val[i].percentage,
                        dueDatePrice:  multiDueDates.val[i].dueDatePrice,
                        paymentStatus: 'Unpaid',
                        balance:  multiDueDates.val[i].balance,
                        paidAmount : 0
                    });
              }
              console.log(vm.TDinv.multiDueDates)
            }else{
              vm.TDinv.multiDueDates = [{
                        dueDate: vm.TDinv.dueDate,
                        percentage: "0",
                        dueDatePrice: vm.famount,
                        paymentStatus: 'Unpaid',
                        balance: vm.famount,
                        paidAmount : 0
                    }];
  
            }
            
            vm.TDinv.discountPercentage = 0;
            vm.TDinv.exchangeRate = 1;
            vm.TDinv.favouriteStar = false;
            vm.TDinv.favouriteStarNo = 1;
            vm.TDinv.deleteStatus = false;
            vm.TDinv.status = "Invoice";
            vm.TDinv.subTotal =  vm.total;
            vm.TDinv.netAmount = vm.famount;
            vm.TDinv.discountAmount = 0;
            vm.TDinv.salesTaxAmount = vm.salesTax;
            vm.TDinv.invoiceStatus = "Unpaid";
            vm.TDinv.pattern = vm.Invprefix+vm.Invsequence;
            vm.TDinv.taxAmounts = InvoiceService.getTaxArr();
            vm.TDinv.invoiceLines = ProductArray.val;
            

                var Invoice = {"invoice" : vm.TDinv, "image" :[], "draftInvoiceNo" : vm.TDinv.invoiceNo, "permissionType" : "edit", "appName":"Invoices", "invSequence":"GRN001" };;
                var jsonString = JSON.stringify(Invoice);
               
                var client =  $serviceCall.setClient("saveDraftToInvoice","process");
                client.ifSuccess(function(data){
                    vm.TDinv.invoiceNo = data.ID;
                    $state.go('app.invoices.inv.detailView', {itemId:  vm.TDinv.invoiceNo});

              $mdToast.show(
                  $mdToast.simple()
                    .textContent('Invoice '+ data.ID +' successfully saved')
                    .position('top right' )
                    .hideDelay(3000)
                );
             });
             client.ifError(function(data){
              $mdToast.show(
                  $mdToast.simple()
                    .textContent('Error saving invoice')
                    .position('top right' )
                    .hideDelay(3000)
                );
             })
              client.postReq(jsonString);
        }

        function deleteProduct(prod, index){
            InvoiceService.ReverseTax(prod, index);
            InvoiceService.removeArray(prod,index);
            calculatetotal();
        }

        /*function editProduct(val, index){ debugger;
             $mdDialog.show({
                templateUrl: 'app/main/invoices/dialogs/addproduct/editProduct.html',
                controller: 'editNewProd',
                controllerAs: 'vm',
                locals:{
                        item : val,
                        settings : vm.settings,
                        exchangeRate : vm.TDinv.exchangeRate,
                        baseCurrency : vm.TDinv.baseCurrency,
                        changedCurrency : vm.TDinv.changedCurrency,
                        isCurrencyChanged : vm.TDinv.isCurrencyChanged,
                        index : index
                    }
            }).then(function(data){
                console.log(data)
            },function(data){

            })
        }*/
        function editProduct(val, index){
             $mdDialog.show({
                templateUrl: 'app/main/invoices/dialogs/addproduct/editProduct.html',
                controller: 'InvoiceeditNewProd',
                controllerAs: 'vm',
                locals:{
                        item : val,
                        settings : vm.settings,
                        exchangeRate : vm.TDinv.exchangeRate,
                        baseCurrency : vm.TDinv.baseCurrency,
                        changedCurrency : vm.TDinv.changedCurrency,
                        isCurrencyChanged : vm.TDinv.isCurrencyChanged,
                        index : index
                    }
            }).then(function(data){
                console.log(data)
            },function(data){

            })
        }
      
        
        vm.cancel = function(ev){
            var confirm = $mdDialog.confirm()
                    .title('Delete invoice draft?')
                    .content('This process is not reversible.')
                    .ariaLabel('Lucky day')
                    .targetEvent(ev)
                    .ok('Yes')
                    .cancel('No');
                $mdDialog.show(confirm).then(function() {
                    

            var jsonString = JSON.stringify(vm.TDinv);

            var client =  $serviceCall.setClient("deleteDraft","invoice");
            client.ifSuccess(function(data){
               $state.go('app.invoices.inv'); 

              // $mdToast.show(
              //     $mdToast.simple()
              //       .textContent('Draft Invoice No '+ data.ID +'Successfully Saved')
              //       .position('top right' )
              //       .hideDelay(3000)
              //   );
             });
             client.ifError(function(data){
              $mdToast.show(
                  $mdToast.simple()
                    .textContent('Error saving draft invoice')
                    .position('top right' )
                    .hideDelay(3000)
                );
             })
             client.uniqueID(vm.TDinv.invoiceNo)
              client.postReq(jsonString);
                }, function(){
                 $state.go('app.invoices.inv');
            });
        }

        function addShipping(val){
            finalamount()
        }

        vm.addContact = addContact;

        function addContact(){ debugger;
            $mdDialog.show({
                templateUrl: 'app/main/invoices/dialogs/contact/addContact.html',
                controller: 'InvoaddCusCtrl',
                controllerAs: 'vm'
            }).then(function(data){
                var data = data;
                assignCusData(data);
            }, function(data){

            })
        };

        function assignCusData(val){
            console.log(val)
            var cus = {
                display:val.profileName,
                value : val
            }
            vm.selectedItem1 = val.profileName;
            $rootScope.$broadcast('extupslctusr',cus);
            selectedItemChange(cus)
            
        }

        vm.editContact = editContact;
        function editContact(val){
            
             $mdDialog.show({
                templateUrl: 'app/main/invoices/dialogs/contact/addContact.html',
                controller: 'InvoeditCusCtrl',
                controllerAs: 'vm',
                    locals:{
                        item : val.value
                    }
            }).then(function(data){
                var data = data;
                assignCusData(data);
            }, function(data){

            })
        }

        //==========================================
        vm.uploadFile = uploadFile;

        function uploadFile (){
            console.log("ghfhg")
          
            var position = $mdPanel.newPanelPosition()
            .absolute()
            .center()
            .center();
            var animation = $mdPanel.newPanelAnimation(); 
            animation.withAnimation($mdPanel.animation.FADE);
            var config = {
            animation: animation,
            attachTo: angular.element(document.body),
            controller: 'uploadCtrl',
            controllerAs: 'vm',
            templateUrl: 'app/main/invoices/dialogs/uploader/upload.html',
            panelClass: 'dialog-uploader',
            position: position,
            trapFocus: true,
            zIndex: 150,
            clickOutsideToClose: true,
            clickEscapeToClose: true,
            hasBackdrop: true
            };
            $mdPanel.open(config);
            
        }
        //=================================================================
        vm.changeCurrency = changeCurrency;

        function changeCurrency(){
           $mdDialog.show({
                templateUrl: 'app/main/invoices/dialogs/changeCurrency/changeCurrency.html',
                controller: 'changeCurrencyCtrl',
                controllerAs: 'vm',
                locals:{
                    item : "USD"
                }
            }).then(function(data){
                var data = data;
                console.log(data)
                // assignCusData(data);
            }, function(data){

            }) 
        }
       
    }

})();
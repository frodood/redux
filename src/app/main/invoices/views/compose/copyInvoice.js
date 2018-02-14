(function ()
{
    'use strict';

    angular
        .module('app.invoices')
        .controller('copyInvCtrl', copyInvCtrl);
    /** @ngInject */
    function copyInvCtrl($scope, $rootScope,$customCtrl, Invoicecopy, InvoiceService,invoiceMultipleDueDatesService, $serviceCall, $mdToast, $document, $mdDialog, $mdMedia, $mdSidenav,AddressService, $state ,$imageUploader )
    {debugger;
    	var vm = this;

        vm.TDinv = {};

        vm.toggleChildStates = toggleChildStates;
        vm.changeAddress = changeAddress;
        InvoiceService.removeAll(0);
        InvoiceService.removeTaxArray(0);
        vm.selectedItemChange = selectedItemChange;
        vm.loadInvNo = loadInvNo;
        vm.Invprefix = "INV";
        vm.Invsequence = "0000";
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
        vm.TDinv.isCurrencyChanged  = false;
        vm.backState = 'app.invoices.inv';

        vm.ActiveAddressObj = [];
        vm.ObjbillingAddress = [];
        vm.ObjshippingAddress = [];

        vm.paymentMethod = [];
        vm.checkpayments = [];

        
        vm.selectedItem1 = [];

        vm.brochureConfig = {
          restrict : "image/*|application/pdf",
          size : "2MB",
          crop : false,
          type : "brochure",
          maxCount : 1
        }

        $scope.$on('selectedProfile', function(ev, args){
            var obj = [];
            obj.value = args.slctdProfile;
            vm.selectedItem1.value = args.slctdProfile;

            selectedItemChange(obj);

        });

        vm.hasSettingsData = false;
        vm.hasRecinvoData = false;
        vm.CusFieldsFromSettings = {};
        vm.enableShipping = false;
        var details = Invoicecopy.getInvArr();
        //if(details.profileID == undefined){details.profileID = 11;}
        

        //Start added by dushmantha
        if(angular.equals(details, {}) )
        {
            //loadInvoice($state.params.itemId);
            loadInvoice($state.params.itemId,function(invoidata) {
                vm.TDinv = details;
                loaDCus(invoidata.profileID);
                loadSettings();

                fillView();
            })
        }
        else
        {
            vm.TDinv = details;
            loadSettings();
            loaDCus(details.profileID);

            fillView();
        }

        $scope.$watch("details", function(data){
          vm.hasRecinvoData = true;
          makeCustomFields();
        });
       //End added by dushmantha

        vm.TDinv = details; 

        

        vm.ship = vm.TDinv.shipping /  vm.TDinv.exchangeRate

        vm.TDinv.favouriteStarNo=1;
        vm.TDinv.balanceDue = 0;
        vm.TDinv.paid = 0;
        vm.TDinv.emailCustomerUponSavingInvoice = false;
        vm.TDinv.pdfInvoiceAttachment = false;
        vm.TDinv.website = "";

        loadcurrentCurrencyModelData();

        vm.selectedItem1 = details.profileName;
        
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
            for(var key in vm.TDinv.taxAmounts){
            InvoiceService.setTaxArr(vm.TDinv.taxAmounts[key])
            }

            //for (var i = details.invoiceLines.length - 1; i >= 0; i--) { 
            for(var i = 0; i < details.invoiceLines.length; i++){
            InvoiceService.setArray(details.invoiceLines[i]);
            }

            //Start make address objects
            vm.ObjbillingAddress = AddressService.setAddress("",details.billingAddress.street,details.billingAddress.city,details.billingAddress.state,details.billingAddress.zip,details.billingAddress.country,details.contactNo,"mobile",details.fax,details.email,details.website);
            vm.ObjshippingAddress = AddressService.setAddress("",details.shippingAddress.s_street,details.shippingAddress.s_city,details.shippingAddress.s_state,details.shippingAddress.s_zip,details.shippingAddress.s_country,details.contactNo,"mobile",details.fax,details.email,details.website);
            vm.ActiveAddressObj = vm.ObjbillingAddress;
           //End make address objects

           //Start Fill Multi due dates array
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
            debugger
           //End fill multiduedates array
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
                paymentType: 'offline',
                activate: "Active"
        })

        function loadInvoice(invoID,callback)
        {

            var client =  $serviceCall.setClient("getInvoiceByKey","process");
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
            client.getReq();
        }

        function loadSettings(){
            var settings = $serviceCall.setClient("getAllByQuery","setting");
            settings.ifSuccess(function(data){

            vm.CusFieldsFromSettings = data[0].preference.invoicePref.cusFiel; //should un comment this
            if(data[0].preference.invoicePref.enableShipping != undefined)
            {
                vm.enableShipping = data[0].preference.invoicePref.enableShipping;
            }
            vm.settings = data;
            vm.TDinv.createCompanyName = data[0].profile.companyName;
            vm.hasSettingsData = true;
            makeCustomFields();

               assignSettigsData(data);
            });
            settings.ifError(function(data){

            });
            settings.postReq({"setting":"profile,payments,taxes","preference":"invoicePref,paymentPref,productPref,inventoryPref"})
        }


        function assignSettigsData(val){

            //Start added by dushmantha
                
                vm.TDinv.pdfInvoiceAttachment = val[0].preference.invoicePref.pdfInvoiceAttachment;
            //End added by dushmantha

            vm.Invprefix = val[0].preference.invoicePref.invoicePrefix;
            vm.Invsequence = val[0].preference.invoicePref.invoiceSequence;

            var grnPrefix = val[0].preference.inventoryPref.ginPrefix;
            var ginSequence = val[0].preference.inventoryPref.ginSequence;
            vm.ginPattern = grnPrefix + ginSequence;
            loadInvNo();

            //vm.TDinv.peymentTerm = val[0].preference.invoicePref.defaultPaymentTerms;
            vm.enableShippingCharges = val[0].preference.invoicePref.enableShipping;
            vm.TDinv.allowPartialPayments = val[0].preference.invoicePref.allowPartialPayments;
            //vm.TDinv.baseCurrency = val[0].profile.baseCurrency;
            //vm.TDinv.changedCurrency = val[0].profile.baseCurrency;

            debugger;
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
                loadcurrentCurrencyModelData();
                loadCurrency();
        }

        function makeCustomFields()
        {
            
          if(vm.hasRecinvoData == false || vm.hasSettingsData == false)
          {
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

         $scope.$watch("vm.TDinv.peymentTerm", function() {
            if (vm.TDinv.peymentTerm == "Due on Receipt") {
                vm.TDinv.dueDate = new Date();
                vm.dueOnReciept = new Date();
                vm.showdate = false;
            }
        });
         $scope.$watch("vm.TDinv.peymentTerm", function() {
            if (vm.TDinv.peymentTerm == "Net 7 days") {
                vm.sevenDays = new Date();
                vm.sevenDays.setDate(vm.sevenDays.getDate() + 7);
                vm.TDinv.dueDate = vm.sevenDays;
                vm.showdate = false;
            }
        });

        $scope.$watch("vm.TDinv.peymentTerm", function() {
            if (vm.TDinv.peymentTerm == "Net 14 days") {
                vm.fourteendays = new Date();
                vm.fourteendays.setDate(vm.fourteendays.getDate() + 14);
                vm.TDinv.dueDate = vm.fourteendays;
                vm.showdate = false;
            }
        });

        $scope.$watch("vm.TDinv.peymentTerm", function() {
            if (vm.TDinv.peymentTerm == "Net 21 days") {
                vm.twentyOneDays = new Date();
                vm.twentyOneDays.setDate(vm.twentyOneDays.getDate() + 21);
                vm.TDinv.dueDate = vm.twentyOneDays;
                vm.showdate = false;
            }
        });

        $scope.$watch("vm.TDinv.peymentTerm", function() {
            if (vm.TDinv.peymentTerm == "Net 30 days") {
                vm.thirtyDays = new Date();
                vm.thirtyDays.setDate(vm.thirtyDays.getDate() + 30);
                vm.TDinv.dueDate = vm.thirtyDays;
                vm.showdate = false;
                //$rootScope.termType = "Net 30 days"
            }
        });

        $scope.$watch("vm.TDinv.peymentTerm", function() {
            if (vm.TDinv.peymentTerm == "Net 45 days") {
                vm.fourtyFiveDays = new Date();
                vm.fourtyFiveDays.setDate(vm.fourtyFiveDays.getDate() + 45);
                vm.TDinv.dueDate = vm.fourtyFiveDays;
                vm.showdate = false;
                //$rootScope.termType = "Net 45 days"
            }
        });

        $scope.$watch("vm.TDinv.peymentTerm", function() {
            if (vm.TDinv.peymentTerm == "Net 60 days") {
                vm.sixtyDays = new Date();
                vm.sixtyDays.setDate(vm.sixtyDays.getDate() + 60);
                vm.TDinv.dueDate = vm.sixtyDays;
                vm.showdate = false;
            }
        });

        $scope.$watch("vm.TDinv.peymentTerm", function() {
            if (vm.TDinv.peymentTerm == "Custom") {
                vm.TDinv.dueDate = "";
                vm.showdate = false;
            }
        });

        $scope.$watch("vm.TDinv.peymentTerm", function() {
            if (vm.TDinv.peymentTerm == "multipleDueDates") {
                //$rootScope.termType = "multipleDueDates"
                vm.showdate = true;
            }
        });
        ProductArray = InvoiceService.getArry();
        function MultiDuDates(){ 
            if(ProductArray.val.length >= 1){
               $mdDialog.show({
                templateUrl: 'app/main/invoices/dialogs/multiDueDates/MultiDueDates.html',
                controller: 'InvomultiDueDatesCtrl',
                controllerAs: 'vm',
                currency : vm.TDinv.changedCurrency,
                locals:{
                    item : vm.famount,
                    invoice : vm.TDinv
                }
            })  
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
                if(vm.Billingaddress == true)
                {
                    vm.ActiveAddressObj = vm.ObjbillingAddress;
                }
                if(vm.Shippingaddress == true)
                {
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


        function loaDCus(val){ debugger;
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

        


       function selectedItemChange(obj) { debugger;
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

                vm.ObjbillingAddress = AddressService.setAddress(obj.value.profileName,obj.value.billingAddress.street,obj.value.billingAddress.city,obj.value.billingAddress.state,obj.value.billingAddress.zip,obj.value.billingAddress.country,obj.value.phone,obj.value.mobile,obj.value.fax,obj.value.email,obj.value.website);
                vm.ObjshippingAddress = AddressService.setAddress(obj.value.profileName,obj.value.shippingAddress.s_street,obj.value.shippingAddress.s_city,obj.value.shippingAddress.s_state,obj.value.shippingAddress.s_zip,obj.value.shippingAddress.s_country,obj.value.phone,obj.value.mobile,obj.value.fax,obj.value.email,obj.value.website);
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

        function loadInvNo(){
            var client = $serviceCall.setClient("getNextNo","invoice");
            client.ifSuccess(function(data){
                var data = data;
                vm.invoiceRefNo = data;
            });
            client.ifError(function(data){
                console.log("error loading invoice No")
            })
            client.pattern(vm.Invprefix+vm.Invsequence);
            client.getReq();
        }

        //add product Pop up
        function addProduct(ev){
             $mdDialog.show({
                templateUrl: 'app/main/invoices/dialogs/addproduct/addproduct.html',
                targetEvent: ev,
                controller: 'InvoiceaddProdCtrl',
                controllerAs: 'vm',
                locals:{
                    exchangeRate : vm.TDinv.exchangeRate,
                    baseCurrency : vm.TDinv.baseCurrency,
                    changedCurrency : vm.TDinv.changedCurrency,
                    isCurrencyChanged : vm.TDinv.isCurrencyChanged,
                }
            }).then(function(val){
                calculatetotal();
                if(vm.TDinv.peymentTerm == "multipleDueDates") { 
                    updateMultiDueDate();
                }
            },function(val){

            })
        }

         
        function updateMultiDueDate(){
            var mulduedates = invoiceMultipleDueDatesService.getArry();
            debugger
            if(mulduedates.val.length > 0){  
                vm.testarr = angular.copy(mulduedates.val);
                invoiceMultipleDueDatesService.removeAllTheDates(0);
                for(var i=0; i<= vm.testarr.length-1; i++){
                    var latestDueprice = parseFloat((vm.famount * vm.testarr[i].percentage) / 100 ).toFixed(2); 
                    vm.testarr[i].dueDatePrice = latestDueprice;
                    invoiceMultipleDueDatesService.setDateArray(vm.testarr[i])
                }
            }
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
            vm.TDinv.shipping = parseInt(vm.ship * vm.TDinv.exchangeRate) 
            vm.famount = InvoiceService.calculateNetAMount(vm.ship * vm.TDinv.exchangeRate);
            // vm.famount = parseFloat(vm.total) + parseFloat(vm.salesTax) +
            //     parseFloat(vm.ship);
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

                            //Start fill vm.TDinv.customFields for saving
                            var hasValuelSet = false;
                            vm.TDinv.customFields.forEach(function(v){ 
                                delete v.fields;
                                delete v.$$hashKey;
                                if(v.value != "")
                                {
                                    hasValuelSet = true;
                                }
                            });
                            if(hasValuelSet == false){vm.TDinv.customFields = [];}
                            //End fill vm.TDinv.customFields for saving

                            if (vm.imageArray.length > 0) {
                                for (var indexx = 0; indexx < vm.imageArray.length; indexx++) {
                                    if (vm.imageArray[0].type == "application/pdf") {
                                        vm.type = "brochure";
                                    }

                                    if (vm.imageArray[0].type == "image/jpeg" || vm.imageArray[0].type == "image/png") {
                                        vm.type = "image";
                                    }

                                    vm.TDinv.uploadImages = [];
                                    vm.watingforServiceResponse = true;
                                    var client = $imageUploader.setImage(vm.imageArray[indexx].uniqueCode,'invoice');
                                    client.ifSuccess(function(data){ 
                                        vm.watingforServiceResponse = false;
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
                                    client.ifError(function(data){ 
                                            vm.watingforServiceResponse = false;
                                    });
                                    if(vm.imageArray[0].type=="application/pdf"){
                                    client.sendBrochure(vm.imageArray[indexx]);
                                    vm.imageArray[indexx].type = "brochure";
                                    }
                                    if(vm.imageArray[0].type=="image/jpeg" || vm.imageArray[0].type == "image/png"){
                                        client.sendImage(vm.imageArray[indexx]);
                                        vm.imageArray[indexx].type = "image";
                                    }
                                }
                            }else{
                                vm.watingforServiceResponse = true;
                               successSubmit();
                            }

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

        function successSubmit(){
            if(vm.settings[0].preference.invoicePref.emailCustomerUponSavingInvoice == true &&
             vm.settings[0].preference.invoicePref.emailCustomerOption == "Send email in background")
            {
                vm.TDinv.emailCustomerUponSavingInvoice = true;
            }

            if(vm.TDinv.peymentTerm == "multipleDueDates"){
                vm.TDinv.multiDueDates=[];
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

            //push customer fields only value not null.............
            vm.customFields=[];
            for (var i = vm.TDinv.customFields.length - 1; i >= 0; i--) {
                if(vm.TDinv.customFields[i].value!=""){
                    vm.customFields.push(vm.TDinv.customFields[i]);
                }
            };

            vm.TDinv.customFields = vm.customFields;
            
            vm.TDinv.discountPercentage = 0; 
            vm.TDinv.invoiceNo = "-999";
            vm.TDinv.status = "Invoice";
            vm.TDinv.subTotal =  vm.total;
            //vm.TDinv.subTotal =  parseFloat(vm.total*vm.TDinv.exchangeRate);
            vm.TDinv.netAmount = vm.famount;
            vm.TDinv.balanceDue = vm.famount;
            vm.TDinv.discountAmount = 0;
            vm.TDinv.salesTaxAmount = vm.salesTax;
            vm.TDinv.invoiceStatus = "Unpaid";
            vm.TDinv.pattern = vm.Invprefix+vm.Invsequence;

            vm.TDinv.invoiceLines = ProductArray.val;
            vm.TDinv.taxAmounts = vm.taxArray;

                //var Invoice = {"invoice" : vm.TDinv, "image" :[], "permissionType" : "add", "appName":"Invoices", "invSequence":"GRN001" };;
                var Invoice = {"invoice" : vm.TDinv, "image" :vm.TDinv.uploadImages, "permissionType" : "add", "appName":"Invoices", "invSequence": vm.ginPattern,"companyName": vm.settings[0].profile.companyName };
                var jsonString = JSON.stringify(Invoice);

                var client =  $serviceCall.setClient("createInvoice","process");
                client.ifSuccess(function(data){
                    vm.TDinv.invoiceNo = data.ID;
                    $state.go('app.invoices.inv.detailView', {itemId:  vm.TDinv.invoiceNo});

              $mdToast.show(
                  $mdToast.simple()
                    .textContent('Invoice '+ data.ID +' successfully saved')
                    .position('top right' )
                    .hideDelay(3000)
                );

                if(vm.settings[0].preference.invoicePref.emailCustomerOption=='Display pop up and prompt' &&
                vm.settings[0].preference.invoicePref.emailCustomerUponSavingInvoice == true)
                {
                    popupEmailDialog(vm.TDinv,vm.settings[0].profile,vm.settings);
                }
             });
             client.ifError(function(data){
              $mdToast.show(
                  $mdToast.simple()
                    .textContent('Error Saving Invoice')
                    .position('top right' )
                    .hideDelay(3000)
                );
             })
              client.postReq(jsonString);
        }

        function popupEmailDialog(invoiceData,profData,settings)
        {
            $mdDialog.show({
              templateUrl: 'app/main/invoices/dialogs/email/email.html',
              controller: 'InvoemailCtrl',
              controllerAs: 'vm',
              locals:{
                  item : invoiceData,
                  profData : profData,
                  template : 'T_EMAIL_INV_NEWMAIL',
                  type : 'invoice',
                  amount : '',
                  settings : settings
              }
            }).then(function(data){
              
            }, function(data){

            })
        }

        function deleteProduct(prod, index){
            console.log(prod);
            InvoiceService.removeTax(prod, ProductArray);
            InvoiceService.removeArray(prod,index);
            calculatetotal();
            if(vm.TDinv.peymentTerm == "multipleDueDates") { 
                updateMultiDueDate();
            }
        }

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
                if(vm.TDinv.peymentTerm == "multipleDueDates") { 
                    updateMultiDueDate();
                }
            },function(data){

            })
        }
      
        
        vm.cancel = function(ev){

             if (vm.selectedItem1 == null) {
                $state.go('app.invoices.inv'); 
            } else {
                var confirm = $mdDialog.confirm()
                    .title('Save invoice as draft?')
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
                        paidAmount : 0
                    }];

            vm.TDinv.discountPercentage = $rootScope.adddiscount;
            vm.TDinv.invoiceNo = "-999";
            vm.TDinv.status = "Draft"
            vm.TDinv.invoiceStatus = "Unpaid"
            vm.TDinv.pattern = "DINV"+vm.Invsequence;
            vm.TDinv.invoiceLines = ProductArray.val;

                // var Invoice = {"invoice" : vm.TDinv, "image" :[], "permissionType" : "add", "appName":"Invoices", "invSequence":"GRN001" };;
                // var jsonString = JSON.stringify(Invoice);
            var jsonString = JSON.stringify(vm.TDinv);

            var client =  $serviceCall.setClient("insertDraft","invoice");
            client.ifSuccess(function(data){
               $state.go('app.invoices.inv'); 

              $mdToast.show(
                  $mdToast.simple()
                    .textContent('Draft invoice '+ data.ID +' successfully saved')
                    .position('top right' )
                    .hideDelay(3000)
                );
             });
             client.ifError(function(data){
              $mdToast.show(
                  $mdToast.simple()
                    .textContent('Error saving draft invoice')
                    .position('top right' )
                    .hideDelay(3000)
                );
             })
              client.postReq(jsonString);
                }, function(){
                 $state.go('app.invoices.inv');
            })
            }
        }

        function addShipping(val){
            finalamount()
        }

        vm.addContact = addContact;

        function addContact(){
            $mdDialog.show({
                templateUrl: 'app/main/invoices/dialogs/contact/addContact.html',
                controller: 'addCusCtrl',
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
                controller: 'editCusCtrl',
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

        //=================file uploader=========================
        vm.uploadFile = uploadFile;
        vm.imageArray = []
        // function uploadFile (){
        //     invfileUploader.uploadFile()
        //     invfileUploader.result(function(arr){
        //         vm.imageArray = arr;                
        //     })
            
        // }

        function uploadFile(res) {
            vm.imageArray = [];
            if (res.hasOwnProperty('brochure')) {
              vm.imageArray = res.brochure;
              //vm.showBrochure = true;

            }else if(res.hasOwnProperty('image')){
              vm.imageArray = [];
              vm.imageArray = res.image;
              
            }else if(res.hasOwnProperty('all')){
              console.log(res.all);
              vm.imageArray = res.all;
              console.log(vm.imageArray);
            }

        }
        //===========================================================

        //==========================================
        /*vm.uploadFile = uploadFile;

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
            
        }*/
        //=================================================================
        vm.changeCurrency = changeCurrency;

        function changeCurrency(){
           $mdDialog.show({
                templateUrl: 'app/main/invoices/dialogs/changeCurrency/changeCurrency.html',
                controller: 'InvoChangeCurrencyCtrl',
                controllerAs: 'vm',
                locals:{
                    item : "USD",
                    total : vm.famount
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

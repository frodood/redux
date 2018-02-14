(function ()
{
    'use strict';

    angular
        .module('app.invoices')
        .controller('InvoiRecComposeController', InvoiRecComposeController);

    /** @ngInject */
    function InvoiRecComposeController($scope, InvoiceService, $rootScope, $mdPanel, $serviceCall, $mdToast, $document,  $mdDialog, $mdMedia, $mdSidenav,$imageUploader, uploaderService,AddressService, $state,msSpinnerService)
    {debugger;
        var vm = this;
        vm.spinnerService = msSpinnerService;

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
        vm.submit  = submit;
        var ProductArray = [];
        vm.lineItems = [];
        var taxArr = [];
        vm.deleteProduct = deleteProduct;
        vm.editProduct = editProduct;
        vm.addShipping = addShipping;
        vm.taxArray = [];

        vm.brochureConfig = {
          restrict : "image/*|application/pdf",
          size : "2MB",
          crop : false,
          type : "brochure",
          maxCount : 1
        }

        vm.settings; //settings data for common use
        vm.enableShipping = false;

        vm.ActiveAddressObj = [];
        vm.ObjbillingAddress = [];
        vm.ObjshippingAddress = [];
        
        loadAll();
        loadSettings();
        vm.selectedItem1 = [];

        $scope.$on('selectedProfile', function(ev, args){ debugger;
            var obj = [];
            obj.value = args.slctdProfile;
            vm.selectedItem1.value = args.slctdProfile;
            selectedItemChange(obj); 
        });

        

        //var LoginName = $auth.getSession().Name;
       var LoginName = "sddfsdfs";
       vm.TDinv.recurringInvoiceID = "";
       vm.TDinv.occurences="";
       vm.TDinv.billingFrequance = "";
       vm.TDinv.internalNote = "";
       vm.TDinv.recurringstatus = "";
       vm.TDinv.invoiceNo = "";
       vm.TDinv.baseCurrency = "";
       vm.TDinv.changedCurrency = "";
       vm.TDinv.isCurrencyChanged = false;
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
       vm.TDinv.invoiceLog="";
       vm.TDinv.discountAmount = "";
       vm.TDinv.discountPercentage = "";
       vm.TDinv.exchangeRate = 1;
       vm.TDinv.favouriteStar = false;
       vm.TDinv.favouriteStarNo = 1;
       vm.TDinv.subTotal = "";
       vm.TDinv.netAmount = "";
       vm.TDinv.paymentMethod = "";
       vm.TDinv.invoiceLines = [];
       vm.TDinv.tags = [];
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
       vm.TDinv.website = "";
       vm.TDinv.balanceDue = 0;
       vm.TDinv.paid = 0;
       vm.TDinv.emailCustomerUponSavingInvoice = false;
       vm.TDinv.pdfInvoiceAttachment = false;
       vm.TDinv.refType = "Recurring";
       vm.TDinv.refID = "";
       vm.ship = 0; 


            vm.TDinv.startDate = new Date();
            vm.TDinv.occurences = "";
            vm.TDinv.shipping = parseFloat(0);
            vm.paymentMethod = [];
            vm.checkpayments = [];
            

             /*vm.paymentMethod.push({
                paymentmethod: '-',
                paymentType: 'offline',
                activate: "Active"
        })*/
        vm.paymentMethod.push({
            paymentmethod: 'Allow online and offline',
            paymentType: 'Offline',
            activate: "Active"
        })
        vm.TDinv.paymentMethod = "Allow online and offline";
            vm.paymentMethod.push({
                paymentmethod: 'Offline Payments Only',
                paymentType: 'offline',
                activate: "Active"
        })

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

        function loadSettings(){
            var settings = $serviceCall.setClient("getAllByQuery","setting");
            settings.ifSuccess(function(data){
              if(data[0].preference.invoicePref.enableShipping != undefined)
                {
                    vm.enableShipping = data[0].preference.invoicePref.enableShipping;
                }
                vm.TDinv.createCompanyName = data[0].profile.companyName;
              vm.settings = data;
               assignSettigsData(data);
            });
            settings.ifError(function(data){

            });
            settings.postReq({"setting":"profile,payments,taxes","preference":"invoicePref,paymentPref,productPref,inventoryPref"})
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



        function assignSettigsData(val){

            //Start added by dushmantha
                vm.TDinv.customFields = val[0].preference.invoicePref.cusFiel;
                //Start push property for ng-model data
                for(var i=0; i<= vm.TDinv.customFields.length -1; i++){
                  vm.TDinv.customFields[i]['value'] = "";
                }
                //End push property for ng-model data
            //End added by dushmantha

            loadInvNo();
            vm.TDinv.notes=val[0].preference.invoicePref.defaultNote;
            vm.TDinv.comments = val[0].preference.invoicePref.defaultComment;

            vm.TDinv.saveOption = val[0].preference.invoicePref.recurringInvoiceDefultAction;
            vm.enableShippingCharges = val[0].preference.invoicePref.enableShipping;
            vm.TDinv.allowPartialPayments = val[0].preference.invoicePref.allowPartialPayments;

            vm.TDinv.peymentTerm = val[0].preference.invoicePref.defaultPaymentTerms;
            vm.enableShippingCharges = val[0].preference.invoicePref.enableShipping;
            vm.TDinv.allowPartialPayments = val[0].preference.invoicePref.allowPartialPayments;
            vm.TDinv.baseCurrency = val[0].profile.baseCurrency;           
            if (!vm.TDinv.isCurrencyChanged) {
              vm.TDinv.changedCurrency = val[0].profile.baseCurrency;
            }
            vm.TDinv.billingFrequance = val[0].preference.invoicePref.billingFrequency

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
                loadCurrency(); // method for new add product
        }

        checkParams()

        //check for $state.params to fill invoice
        function checkParams(){ debugger;
            if($state.params.Data){
                if($state.params.appName == "profile"){
                     vm.backState = 'app.contacts.customer'
                    console.log($state.params.Data.profileId)

                    setCustomer($state.params.Data.profileId);
                }else if($state.params.appName == "invoice"){
                   var Invoice = { "permissionType" : "add", "appName":"Invoices"};
                  var jsonString = JSON.stringify(Invoice);

                   var client = $serviceCall.setClient("getInvoiceByKey","process");
                    client.ifSuccess(function(data){
                        ///vm.selectedItem1 = data.profileName;
                        vm.TDinv.comments = data.comments;
                        vm.TDinv.shipping = data.shipping;
                        vm.TDinv.notes = data.notes;
                        vm.TDinv.exchangeRate = data.exchangeRate;
                        vm.TDinv.changedCurrency = data.changedCurrency;
                        vm.TDinv.isCurrencyChanged = data.isCurrencyChanged;
                        vm.TDinv.baseCurrency = data.baseCurrency;

                        vm.ship = vm.TDinv.shipping /  vm.TDinv.exchangeRate

                        vm.famount = data.netAmount;
                        loadcurrentCurrencyModelData()

                        //for (var i = data.invoiceLines.length - 1; i >= 0; i--) {
                        for(var i = 0; i < data.invoiceLines.length; i++){
                            InvoiceService.setArray(data.invoiceLines[i])
                        }
                        InvoiceService.removeTaxArray(0)
                        for (var i = data.taxAmounts.length - 1; i >= 0; i--) {
                            InvoiceService.setTaxArr(data.taxAmounts[i])
                        }
                        vm.taxArray = InvoiceService.getTaxArr();
                        /*var client={
                            display:data.profileName,
                            value : data
                        }*/
                        //selectedItemChange(client);
                        setCustomer($state.params.Data.profileID);
                        setSelectTaxes();
                    });
                    client.ifError(function(data){

                    });
                    client.uniqueID($state.params.Data.invoiceNo); // send projectID as url parameters
                    client.postReq(jsonString);
                }
            }
        }

        function setCustomer(profileID) {
            var client = $serviceCall.setClient("getProfileByKey", "profile");
            client.ifSuccess(function(data) {
                //vm.selectedItem1 = data.profileName;
                vm.customerEditdetails = data;

                var customertobeselected = {
                    display: data.profileName,
                    value: data
                }
                vm.selectedItem1 = customertobeselected;
                $rootScope.$broadcast('extupslctusr', customertobeselected);
                selectedItemChange(customertobeselected);
            });
            client.ifError(function(data) {

            });
            client.uniqueID(profileID); // send projectID as url parameters
            client.postReq();
        }

        function setSelectTaxes(){

        }
        ProductArray = InvoiceService.getArry();
    
        
        function toggleChildStates(toggledState){
            $state.go(toggledState);
        };

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


        function loaDCus(val){
          var client = $serviceCall.setClient("getAllByQuery","profile");
             client.ifSuccess(function(data){
                var data = data;
                if(data.result.length >= 1){
               customerNames = [];
                    for (var i = 0, len = data.result.length; i < len; ++i) {
                        customerNames.push({
                            display: data.result[i].profileName,
                            value: data.result[i],
                        });
                    }
                }
                
               });
               client.ifError(function(data){
                console.log("error loading profile data")
               })
               client.skip(0);
               client.take(10);
               client.class("Customer") 
               client.orderby("profileID");
               client.isAscending(true);
               client.postReq(val);  
        }

        function loadAll(){
            loaDCus({where : "status = 'Active' and deleteStatus = false"})
        }

        vm.enter = function(val){
             loaDCus({where : "status = 'Active' and deleteStatus = false and (profileName LIKE" +"'" +val+"%' OR email LIKE"+"'"+val+"%')"})
        }


       function selectedItemChange(obj) {

            //Start informe profile popup diective that new profile hasbeen selected;
            vm.customerEditdetails = {};
            vm.customerEditdetails = obj.value;
            //End informe profile popup diective that new profile hasbeen selected;
            
            console.log(obj)
            if(vm.selectedItem1 == null){
                vm.showEditCustomer = false;
                vm.showEditCustomer = false;
                vm.TDinv.billingAddress = "";
                vm.TDinv.shippingAddress = "";
                vm.TDinv.contactNo = "";
                vm.TDinv.fax = "";
                vm.TDinv.email = "";
                vm.TDinv.mobileNo    = "";
            }else{
              if(obj.value){

                vm.ObjbillingAddress = AddressService.setAddress(obj.value.profileName,obj.value.billingAddress.street,obj.value.billingAddress.city,obj.value.billingAddress.state,obj.value.billingAddress.zip,obj.value.billingAddress.country,obj.value.phone,obj.value.mobile,obj.value.fax,obj.value.email,obj.value.website);
                vm.ObjshippingAddress = AddressService.setAddress(obj.value.profileName,obj.value.shippingAddress.s_street,obj.value.shippingAddress.s_city,obj.value.shippingAddress.s_state,obj.value.shippingAddress.s_zip,obj.value.shippingAddress.s_country,obj.value.phone,obj.value.mobile,obj.value.fax,obj.value.email,obj.value.website);
                vm.ActiveAddressObj = vm.ObjbillingAddress;

                vm.showEditCustomer = true;
                vm.TDinv.profileName = obj.value.profileName;
                vm.TDinv.email = obj.value.email;
                vm.TDinv.profileID = obj.value.profileID;
                vm.TDinv.contactNo = obj.value.phone;
                vm.TDinv.fax       = obj.value.fax;
                vm.TDinv.mobileNo    = obj.value.mobile;
                vm.TDinv.billingAddress = obj.value.billingAddress;
                vm.TDinv.shippingAddress = obj.value.shippingAddress;
                vm.TDinv.website = obj.value.website;
              }
            }
        };

        function loadInvNo(){
             var client = $serviceCall.setClient("getNextNo","invoice");
             client.ifSuccess(function(data){
                var data = data;
               vm.recurringInvoiceID = data;
               });
               client.ifError(function(data){
                console.log("error loading invoice No")
               })
               client.pattern("REC00000");
               client.getReq();
        }

         vm.toggleChildStates = toggleChildStates;

        
        vm.lineItems = ProductArray.val;
        // console.log(vm.lineItems)
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
            // vm.famount = parseFloat(vm.total) + parseFloat(vm.salesTax) +
            //     parseFloat(vm.ship);
        };


        function submit(){ debugger;
          vm.spinnerService.show('recinv-compose-spinner');
          if(vm.TDinv.occurences == null || vm.TDinv.occurences.toString() == "")
          {
            $mdDialog.show(
                  $mdDialog.alert()
                  .parent(angular.element(document.body))
                  .title('Alert')
                  .htmlContent("Enter the total occurences for this recurring profile."+'<br>'+"Type '0' to make it indefinite")
                  .ariaLabel('Alert')
                  .ok('OK')
                  .targetEvent()
                );
            vm.spinnerService.hide('recinv-compose-spinner');
          }
          else if(vm.TDinv.occurences < 0)
          {
            $mdDialog.show(
                  $mdDialog.alert()
                  .parent(angular.element(document.body))
                  .title('Alert')
                  .htmlContent( "The occurences value should be positive number")
                  .ariaLabel('Alert')
                  .ok('OK')
                  .targetEvent()
                );
            vm.spinnerService.hide('recinv-compose-spinner');
          }
          else if(vm.selectedItem1 == null){
               $mdDialog.show(
                  $mdDialog.alert()
                  .parent(angular.element(document.body))
                  .title('Alert')
                  .content('Select a customer')
                  .ariaLabel('Alert')
                  .ok('OK')
                  .targetEvent()
                );
               vm.spinnerService.hide('recinv-compose-spinner');
            }else{
                if(vm.TDinv.profileID != ""){
                    if(ProductArray.val.length > 0){
                        if(vm.TDinv.billingFrequance != "" || vm.TDinv.billingFrequance != undefined){
                            
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

                            //Start uploading image
                            if (vm.imageArray.length > 0) {
                                for (var indexx = 0; indexx < vm.imageArray.length; indexx++) {

                                    if (vm.imageArray[0].type == "application/pdf") {
                                        vm.type = "brochure";
                                    }

                                    if (vm.imageArray[0].type == "image/jpeg" || vm.imageArray[0].type == "image/png") {
                                        vm.type = "image";
                                    }

                                    var client = $imageUploader.setImage(vm.imageArray[indexx].uniqueCode,'invoice');
                                    client.ifSuccess(function(data){ 
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
                                    client.ifError(function(data){ 
                                      vm.spinnerService.hide('recinv-compose-spinner');
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
                               successSubmit();
                            }
                            //End uploading image
                        }else{
                           $mdDialog.show(
                          $mdDialog.alert()
                          .parent(angular.element(document.body))
                          .title('Alert')
                          .content('Select the billing frequency')
                          .ariaLabel('Alert')
                          .ok('OK')
                          .targetEvent()
                        );  
                           vm.spinnerService.hide('recinv-compose-spinner');
                        }
                    }else{
                        $mdDialog.show(
                          $mdDialog.alert()
                          .parent(angular.element(document.body))
                          .title('Alert')
                          .content('Add a line item')
                          .ariaLabel('Alert')
                          .ok('OK')
                          .targetEvent()
                        ); 
                        vm.spinnerService.hide('recinv-compose-spinner');
                    }
                }else{
                     $mdDialog.show(
                      $mdDialog.alert()
                      .parent(angular.element(document.body))
                      .title('Alert')
                      .content('Select a customer')
                      .ariaLabel('Alert')
                      .ok('OK')
                      .targetEvent()
                    ); 
                    vm.spinnerService.hide('recinv-compose-spinner'); 
                }
                
            }
        }

          //Start revers to base currency line items added by dushmantha
          function reverseBackBasecurrency()
          { 
              for (var i = ProductArray.val.length - 1; i >= 0; i--) {
                  if(vm.TDinv.isCurrencyChanged == true){
                      ProductArray.val[i].amount = parseFloat(ProductArray.val[i].amount);
                      ProductArray.val[i].price = parseFloat(ProductArray.val[i].price);
                  }
              }
          }
          //End revers to base currency line items added by dushmantha

          function popupEmailDialog(invoiceData,profData,settings)
          {
              $mdDialog.show({
                templateUrl: 'app/main/invoices/dialogs/email/email.html',
                controller: 'InvoemailCtrl',
                controllerAs: 'vm',
                locals:{
                    item : invoiceData,
                    profData : profData,
                    template : 'T_EMAIL_REC_NEWMAIL',
                    type : 'recinvoice',
                    amount : '',
                    settings : settings
                }
              }).then(function(data){
                
              }, function(data){

              })
          }

          function successSubmit(){ 
            if(vm.TDinv.saveOption == 'Save invoice and email customer' || vm.TDinv.saveOption == 'Save email and charge customer')
            {
              vm.TDinv.emailCustomerUponSavingInvoice = true;
            }
            

            reverseBackBasecurrency();

            //push customer fields only value not null.............
            vm.customFields=[];
            
            for (var i = 0;vm.TDinv.customFields.length > i; i++) {
                if(vm.TDinv.customFields[i].value!=""){
                    vm.customFields.push(vm.TDinv.customFields[i]);
                }
            };

            vm.TDinv.customFields = vm.customFields;



            vm.TDinv.discountPercentage = 0;
            vm.TDinv.invoiceNo = "-999";
            vm.TDinv.multiDueDates = [{
                  dueDate: vm.TDinv.dueDate,
                  percentage: "0",
                  dueDatePrice: parseFloat(vm.famount),
                  paymentStatus: 'Unpaid',
                  balance: parseFloat(vm.famount),
                  paidAmount : 0
            }];

            vm.TDinv.subTotal =  parseFloat(vm.total);
            vm.TDinv.netAmount = parseFloat(vm.famount);
            vm.TDinv.balanceDue =  parseFloat(vm.famount);
            vm.TDinv.discountAmount = 0;
            vm.TDinv.salesTaxAmount =  parseFloat(vm.salesTax);
            vm.TDinv.invoiceStatus = "Unpaid";
            vm.TDinv.pattern = vm.Invprefix+vm.Invsequence;

            vm.TDinv.invoiceLines = ProductArray.val;
            
            vm.TDinv.taxAmounts = vm.taxArray;

                var Invoice = {"recurringInvoice" : vm.TDinv, "image" :[], "permissionType" : "add", "appName":"Invoices" };;
                var jsonString = JSON.stringify(Invoice);

                var client =  $serviceCall.setClient("saveRecurringInvoice","process");
                client.ifSuccess(function(data){ 
                    vm.TDinv.recurringInvoiceID = data.ID; 
                    $state.go('app.invoices.rec.detailView', {itemId:  vm.TDinv.recurringInvoiceID});

              $mdToast.show(
                  $mdToast.simple()
                    .textContent('Recurring profile '+ data.ID +' successfully saved')
                    .position('top right' )
                    .hideDelay(3000)
                );
              vm.spinnerService.hide('recinv-compose-spinner');

              if(vm.settings[0].preference.invoicePref.emailCustomerOption=='Display pop up and prompt')
                {
                    //popupEmailDialog(vm.TDinv,vm.settings[0].profile,vm.settings); // commented due to EX-1487
                }

             });
             client.ifError(function(data){ 
              vm.spinnerService.hide('recinv-compose-spinner');
              if(data.data.message == undefined || data.data.message.includes("Unexpected token"))
                {

                    $mdDialog.show(
                      $mdDialog.alert()
                      .parent(angular.element(document.body))
                      .title('Error')
                      .content('Error saving recuring invoice')
                      .ok('OK')
                      .targetEvent()
                    );

                }else
                {
                    $mdDialog.show(
                      $mdDialog.alert()
                      .parent(angular.element(document.body))
                      .title('Error')
                      .content(data.data.customMessage)
                      .ok('OK')
                      .targetEvent()
                    );
                }
             })
              client.postReq(jsonString);
        }

        function deleteProduct(prod, index){
            //InvoiceService.ReverseTax(prod, index); //comented by dushmantha
            InvoiceService.removeTax(prod, ProductArray); // added by dushmantha
            InvoiceService.removeArray(prod,index);
            calculatetotal();
        }

        
      
        
        vm.cancel = function(ev){

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
                        paidAmount : 0
                    }];

            //vm.TDinv.discountPercentage = $rootScope.adddiscount;
            vm.TDinv.invoiceNo = "-999";
            vm.TDinv.status = "Draft"
            vm.TDinv.invoiceStatus = "Unpaid"
            vm.TDinv.pattern = "DREC"+vm.Invsequence;
            vm.TDinv.subTotal =  vm.total;
            vm.TDinv.netAmount = vm.famount;
            vm.TDinv.discountAmount = 0;
            vm.TDinv.salesTaxAmount = vm.salesTax;

            vm.TDinv.taxAmounts = vm.taxArray;

            vm.TDinv.invoiceLog = {
                    ActivityNo   : "",
                    logID        : "-888",
                    type         : "Activity",
                    description  : "Save as Draft"+" ",
                    status       : "Active",
                    userName     : LoginName,
                    lastTranDate : new Date(),
                    createDate   : new Date(),
                    modifyDate   : new Date(),
                    createUser   : LoginName,
                    modifyUser   : LoginName,
                    invoiceNo    : ""
              }
            vm.TDinv.invoiceLines = ProductArray.val;

                // var Invoice = {"invoice" : vm.TDinv, "image" :[], "permissionType" : "add", "appName":"Invoices", "invSequence":"GRN001" };;
                // var jsonString = JSON.stringify(Invoice);
            var jsonString = JSON.stringify(vm.TDinv);

            var client =  $serviceCall.setClient("insertRecInvoiceDraft","invoice");
            client.ifSuccess(function(data){
               $state.go('app.invoices.rec'); 

              $mdToast.show(
                  $mdToast.simple()
                    .textContent('Draft recurring profile '+ data.ID +' successfully saved')
                    .position('top right' )
                    .hideDelay(3000)
                );
             });
             client.ifError(function(data){
              $mdToast.show(
                  $mdToast.simple()
                    .textContent('Error saving draft recurring profile')
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
                controller: 'InvoaddCusCtrl',
                controllerAs: 'vm'
            }).then(function(data){
                var data = data;
                assignCusData(data);
            }, function(data){

            })
        };

        function assignCusData(val){  debugger;
          if(val != undefined)
            {
            console.log(val)
            var cus = {
                display:val.profileName,
                value : val
            }
            vm.selectedItem1 = cus;//val.profileName;
            $rootScope.$broadcast('extupslctusr',cus);
            selectedItemChange(cus);
          }
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

        //==========================================
        /*vm.uploadFile = uploadFile;

        function uploadFile (){
          
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
            var currencyOBj = {
                baseCurrency : vm.TDinv.baseCurrency,
                currencyChanged : vm.TDinv.isCurrencyChanged,
                changedCurrency : vm.TDinv.changedCurrency,
                exchangeRate : vm.TDinv.exchangeRate
            }
            
            var temp1 = ProductArray.val;
           $mdDialog.show({
                templateUrl: 'app/main/invoices/dialogs/changeCurrency/changeCurrency.html',
                controller: 'InvoChangeCurrencyCtrl',
                controllerAs: 'vm',
                locals:{
                    item : currencyOBj,
                    total : vm.famount
                }
            }).then(function(data){ 
                var data = data;
               // console.log(data)
                if(data.currencyStatus == true){
                    vm.TDinv.isCurrencyChanged = true;
                    vm.TDinv.changedCurrency = data.currencyType;
                    vm.TDinv.exchangeRate = parseFloat(data.exchangeRate)
                    vm.TDinv.shipping = parseFloat((vm.TDinv.shipping/vm.TDinv.exchangeRate)*data.exchangeRate);
                    var temp2 = ProductArray.val;
                }

            }, function(data){

            }) 
        }

    }
})();
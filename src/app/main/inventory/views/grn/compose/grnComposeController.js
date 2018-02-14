(function() {
    'use strict';

    angular
        .module('app.inventory')
        .controller('grnComposeController', grnComposeController);

    /** @ngInject */
    function grnComposeController($scope, $rootScope, InventoryService, $mdPanel, $document, $imageUploader, $mdDialog, $mdMedia, $mdSidenav, $state, $mdToast, $serviceCall, settingSummary, AddressService, msSpinnerService) {
        var vm = this;
        vm.loadAll = loadAll;
        vm.querySearch = querySearch;
        vm.searchText = null;
        vm.toggleChildStates = toggleChildStates;
        vm.changeAddress = changeAddress;
        vm.loadingItems = false;
        InventoryService.removeAll(0);
        vm.settingSummary = settingSummary;
        vm.selectedItemChange = selectedItemChange;
        vm.currentThread = null;

        vm.selectedThreads = [];

        vm.addProduct = addProduct;
        vm.deleteProduct = deleteProduct;
        vm.editProduct = editProduct;

        vm.submit = submit;
        vm.cancel = cancel;
        vm.profileID = "";
        vm.inventoryPattern = "";
        vm.backState = 'app.inventory.grn';
        vm.showMoreInfo = false;
        var ProductArray = [];
        vm.itemDetails = [];
        vm.image = [];
        //vm.contact.firstName=contact.firstName;

        vm.brochureConfig = {
            restrict: "image/*|application/pdf",
            size: "2MB",
            crop: false,
            type: "brochure",
            maxCount: 1
        }

        vm.contact = {};

        vm.ActiveAddressObj = [];
        vm.ObjbillingAddress = [];
        vm.ObjshippingAddress = [];

        loadAll();
        loadSettings();

        function toggleChildStates(toggledState) {
            $state.go(toggledState);
        };
        // 
        ProductArray = InventoryService.getArry();
        vm.itemDetails = ProductArray.val;

        vm.grn = {
            "GRNno": "",
            "internalNote": "",
            "comment": "",
            "note": "",
            "email": "",
            "customFields":[],
            "contactNo": "",
            "fax": "",
            "mobileNo": "",
            "website": "",
            "inventoryClass": "",
            "GRNType": "",
            "date": "",
            "createdDate": "",
            "inventoryFavourite": "",
            "customerNames": "",
            "profileID":"",
            "billAddress": {},
            "shipAddress": {},
            "itemDetails": [],
            "addressType": "",
            "deleteStatus": "",
            "favouriteStarNo": "",
            "tag": [],
            "cancelStatus": "",
            "createUser": "",
            "modifyUser": ""
        };

        checkParams();

        vm.grn.date = new Date();

        if (vm.settingSummary.length > 0) {
            vm.inventoryPattern = vm.settingSummary[0].preference.inventoryPref.grnPrefix + vm.settingSummary[0].preference.inventoryPref.grnSequence;
            // loadInvNo(vm.inventoryPattern);   
        }


        $rootScope.$on('selectedProfile',function(event, args){ 
            vm.selectedItem1 = args.slctdProfile; 
            debugger;
            assignCusData(vm.selectedItem1)
        });


        //__________define Address fields________

        vm.grn.billAddress = {
            "city": "",
            "country": "",
            "zip": "",
            "state": "",
            "street": ""
        }

        vm.billAddress = {
            "city": "",
            "country": "",
            "zip": "",
            "state": "",
            "street": ""
        }

        vm.grn.shipAddress = {
            "s_city": "",
            "s_street": "",
            "s_zip": "",
            "s_state": "",
            "s_country": ""
        }

        vm.shipAddress = {
            "s_city": "",
            "s_street": "",
            "s_zip": "",
            "s_state": "",
            "s_country": ""
        }

        //================change address============================
        vm.Billingaddress = true;
        vm.Shippingaddress = false;

        // function changeAddress() {
        //     vm.Billingaddress = !vm.Billingaddress;
        //     vm.Shippingaddress = !vm.Shippingaddress;
        // }

         function checkParams() {
             debugger;
            if ($state.params.Data) {
                 if ($state.params.hasOwnProperty('appName')) {
                    //Start loading Profile
                    if ($state.params.appName == "profile") {
                        vm.backState = 'app.contacts.customer'

                        setSupplier($state.params.Data.profileId);

                    }
                    //End loading Profile
                 }
            }
        }

        function setSupplier(profileID){

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

        var settings = $serviceCall.setClient("getAllByQuery", "setting");
        settings.ifSuccess(function(data) {
            assignSettigsData(data);
        });
        settings.ifError(function(data) {

        });
        settings.postReq({
            "preference": "inventoryPref"
        })


        function loadSettings() {
            var settings = $serviceCall.setClient("getAllByQuery", "setting");
            settings.ifSuccess(function(data) {
                assignSettigsData(data);
            });
            settings.ifError(function(data) {

            });
            settings.postReq({
                "preference": "inventoryPref"
            })
        }

        function assignSettigsData(val) {
            debugger;
            vm.grn.customFields = val[0].preference.inventoryPref.reciptCusFiel;
            vm.grn.note=val[0].preference.inventoryPref.defaultNote;
                //Start push property for ng-model data
                for(var i=0; i<= vm.grn.customFields.length -1; i++){
                  vm.grn.customFields[i]['value'] = "";
                }
            vm.Invprefix = val[0].preference.inventoryPref.grnPrefix;
            vm.Invsequence = val[0].preference.inventoryPref.grnSequence;
            loadInvNo();

        }

        //add product Pop up
        function addProduct(ev) {
            $mdDialog.show({
                templateUrl: 'app/main/inventory/dialogs/addproduct/addproduct.html',
                targetEvent: ev,
                controller: 'addProdCtrl',
                controllerAs: 'vm'
            }).then(function(val) {
                vm.grn.itemDetails = InventoryService.getArry().val;
                console.log("itemDetails");
                console.log(vm.grn.itemDetails);
            }, function(val) {

            })
        }

        function deleteProduct(prod, index) {
            InventoryService.removeArray(prod, index);
        }

        function editProduct(val, index) {
            debugger;
            $mdDialog.show({
                templateUrl: 'app/main/inventory/dialogs/addproduct/editproduct.html',
                controller: 'editNewProd',
                controllerAs: 'vm',
                locals: {
                    item: val,
                    index: index
                }
            }).then(function(data) {

            }, function(data) {

            })
        }

        //=============================uploadFile============================
        vm.uploadFile = uploadFile;
        vm.imageArray = []

        function uploadFile(res) {
            vm.imageArray = [];
            if (res.hasOwnProperty('brochure')) {
                vm.imageArray = res.brochure;
            } else if (res.hasOwnProperty('image')) {
                vm.imageArray = [];
                vm.imageArray = res.image;
            } else if (res.hasOwnProperty('all')) {
                console.log(res.all);
                vm.imageArray = res.all;
            }
        }
        //=================================================================

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
            client.class("")
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
                where: "status = 'Active' and deleteStatus = false and profileClass = 'Supplier' and (profileName LIKE" + "'" + val + "%' OR email LIKE" + "'" + val + "%')"
            })
        }

        function assignCusData(val) {
            console.log(val)
            var cus = {
                display: val.profileName,
                value: val
            }
            // vm.selectedItem1 = val.profileName;
            vm.selectedItem1 = cus;
            selectedItemChange(cus)

        }

        function selectedItemChange(obj) {
            console.log(obj)
            vm.customerEditdetails = {};
            vm.customerEditdetails = obj.value;

            if (vm.selectedItem1 == null) {
                vm.showEditCustomer = false;
                vm.grn.billAddress = "";
                vm.grn.shipAddress = "";
                vm.grn.contactNo = "";
                vm.grn.fax = "";
                vm.grn.mobileNo = "";
                vm.grn.website = "";
                vm.grn.email = "";
            } else {

                vm.ObjbillingAddress = AddressService.setAddress(obj.value.profileName,obj.value.billingAddress.street,obj.value.billingAddress.city,obj.value.billingAddress.state,obj.value.billingAddress.zip,obj.value.billingAddress.country,obj.value.phone,obj.value.mobile,obj.value.fax,obj.value.email,obj.value.website);
                vm.ObjshippingAddress = AddressService.setAddress(obj.value.profileName,obj.value.shippingAddress.s_street,obj.value.shippingAddress.s_city,obj.value.shippingAddress.s_state,obj.value.shippingAddress.s_zip,obj.value.shippingAddress.s_country,obj.value.phone,obj.value.mobile,obj.value.fax,obj.value.email,obj.value.website);
                vm.ActiveAddressObj = vm.ObjbillingAddress;


                vm.showEditCustomer = true;
                if ( obj.hasOwnProperty('value') ) {
                vm.grn.customerNames = obj.value.profileName;
                vm.grn.profileID=obj.value.profileID;
                vm.grn.email = obj.value.email;
                vm.profileID = obj.value.profileID;
                vm.grn.contactNo = obj.value.phone;
                vm.grn.fax = obj.value.fax;
                vm.grn.mobileNo = obj.value.mobile;
                vm.grn.website = obj.value.website;
                vm.grn.billAddress = obj.value.billingAddress;
                vm.grn.shipAddress = obj.value.shippingAddress;

                // if (vm.grn.billAddress != "") {
                //     if (vm.grn.billAddress.street != "") {
                //         vm.billAddress.street = vm.grn.billAddress.street + ",";
                //     }


                //     if ((vm.grn.billAddress.city != "") && (vm.grn.billAddress.zip != "")) {
                //         vm.billAddress.city = vm.grn.billAddress.city + " ";
                //         vm.billAddress.zip = vm.grn.billAddress.zip + ",";
                //     } else {
                //         if (vm.grn.billAddress.city != "") {
                //             vm.billAddress.city = vm.grn.billAddress.city + ",";
                //         }


                //         if (vm.grn.billAddress.zip != "") {
                //             vm.billAddress.zip = vm.grn.billAddress.zip + ",";
                //         }
                //     }

                //     if (vm.grn.billAddress.state != "") {
                //         vm.billAddress.state = vm.grn.billAddress.state + ",";
                //     }
                // }



                // if (vm.grn.shipAddress != "") {
                //     if (vm.grn.shipAddress.s_street != "") {
                //         vm.shipAddress.s_street = vm.grn.shipAddress.s_street + ",";
                //     }


                //     if ((vm.grn.shipAddress.s_city != "") && (vm.grn.shipAddress.s_zip != "")) {
                //         vm.shipAddress.s_city = vm.grn.shipAddress.s_city + " ";
                //         vm.shipAddress.s_zip = vm.grn.shipAddress.s_zip + ",";
                //     } else {
                //         if (vm.grn.shipAddress.s_city != "") {
                //             vm.shipAddress.s_city = vm.grn.shipAddress.s_city + ",";
                //         }


                //         if (vm.grn.shipAddress.s_zip != "") {
                //             vm.shipAddress.s_zip = vm.grn.shipAddress.s_zip + ",";
                //         }
                //     }

                //     if (vm.grn.shipAddress.s_state != "") {
                //         vm.shipAddress.s_state = vm.grn.shipAddress.s_state + ",";
                //     }
                // }

            }
        }
        };



        function submit() {
            msSpinnerService.show('grn-compose-spinner1');
            if (vm.selectedItem1 == null) {
                msSpinnerService.hide('grn-compose-spinner1');
                $mdDialog.show(
                    $mdDialog.alert()
                    .parent(angular.element(document.body))
                    .title('Alert')
                    .content('Select a supplier')
                    .ariaLabel('Alert Dialog Demo')
                    .ok('OK')
                    .targetEvent()
                );
            } else {
                if (vm.profileID != "") {

                    if (ProductArray.val.length > 0) {

                        //Start fill vm.grn.customFields for saving
                            var hasValuelSet = false;
                            vm.grn.customFields.forEach(function(v){ 
                                delete v.fields;
                                delete v.$$hashKey;
                                if(v.value != "")
                                {
                                    hasValuelSet = true;
                                }
                            });
                            if(hasValuelSet == false){vm.grn.customFields = [];}
                            //End fill vm.grn.customFields for saving


                        if (vm.imageArray.length > 0) {
                             for (var indexx = 0; indexx < vm.imageArray.length; indexx++) {

                                if (vm.imageArray[0].type == "application/pdf") {
                                    vm.type = "brochure";
                                }

                                if (vm.imageArray[0].type == "image/jpeg" || vm.imageArray[0].type == "image/png") {
                                    vm.type = "image";
                                }

                                var client = $imageUploader.setImage(vm.imageArray[indexx].uniqueCode, 'inventory');
                                client.ifSuccess(function(data) {

                                    vm.uploadImages = {};
                                    vm.uploadImages.ID = "";
                                    vm.uploadImages.name = vm.imageArray[0].name;
                                    vm.uploadImages.size = vm.imageArray[0].size;
                                    vm.uploadImages.uniqueCode = vm.imageArray[0].uniqueCode;
                                    vm.uploadImages.appGuid = "";
                                    vm.uploadImages.appName = "inventory";
                                    vm.uploadImages.createUser = "";
                                    vm.uploadImages.date = "";
                                    vm.uploadImages.type = vm.type;

                                    vm.image.push(vm.uploadImages);
                                    console.log(vm.image);

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
                        msSpinnerService.hide('grn-compose-spinner1');
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
                    msSpinnerService.hide('grn-compose-spinner1');
                    $mdDialog.show(
                        $mdDialog.alert()
                        .parent(angular.element(document.body))
                        .title('Alert')
                        .content('Select a supplier')
                        .ariaLabel('Alert Dialog Demo')
                        .ok('OK')
                        .targetEvent()
                    );
                }

            }
        }

        // function successSubmit(){
        //             // if(vm.TDinv.peymentTerm == "multipleDueDates"){
        //             //   var multiDueDates = MultipleDudtesService.getArry();
        //             //   for (var i = multiDueDates.val.length - 1; i >= 0; i--) {
        //             //       vm.TDinv.multiDueDates.push({
        //             //             dueDate: multiDueDates.val[i].dueDate,
        //             //             percentage:  multiDueDates.val[i].percentage,
        //             //             dueDatePrice:  multiDueDates.val[i].dueDatePrice,
        //             //             paymentStatus: 'Unpaid',
        //             //             balance:  multiDueDates.val[i].balance,
        //             //             paidAmount : 0
        //             //         });
        //             //   }
        //             //   console.log(vm.TDinv.multiDueDates)
        //             // }else{
        //             //   vm.TDinv.multiDueDates = [{
        //             //             dueDate: vm.TDinv.dueDate,
        //             //             percentage: "0",
        //             //             dueDatePrice: vm.famount,
        //             //             paymentStatus: 'Unpaid',
        //             //             balance: vm.famount,
        //             //             paidAmount : 0
        //             //         }];

        //             // }

        //             vm.TDinv.discountPercentage = 0;
        //             vm.TDinv.exchangeRate = 1;
        //             vm.TDinv.invoiceNo = "-999";
        //             vm.TDinv.status = "Invoice";
        //             vm.TDinv.subTotal =  parseFloat(vm.total/vm.TDinv.exchangeRate);
        //             vm.TDinv.netAmount = parseFloat(vm.famount/vm.TDinv.exchangeRate);
        //             vm.TDinv.discountAmount = 0;
        //             vm.TDinv.salesTaxAmount = parseFloat(vm.salesTax/vm.TDinv.exchangeRate);
        //             vm.TDinv.invoiceStatus = "Unpaid";
        //             vm.TDinv.pattern = vm.Invprefix+vm.Invsequence;

        //             vm.TDinv.invoiceLines = ProductArray.val;
        //             vm.TDinv.taxAmounts = [];

        //                 var Invoice = {"invoice" : vm.TDinv, "image" :[], "permissionType" : "add", "appName":"Invoices", "invSequence":"GRN001" };;
        //                 var jsonString = JSON.stringify(Invoice);

        //                 var client =  $serviceCall.setClient("createInvoice","process");
        //                 client.ifSuccess(function(data){
        //                     vm.TDinv.invoiceNo = data.ID;
        //                     $state.go('app.invoices.inv.detailView', {itemId:  vm.TDinv.invoiceNo});

        //               $mdToast.show(
        //                   $mdToast.simple()
        //                     .textContent('Invoice No '+ data.ID +'Successfully Saved')
        //                     .position('top right' )
        //                     .hideDelay(3000)
        //                 );
        //              });
        //              client.ifError(function(data){
        //               $mdToast.show(
        //                   $mdToast.simple()
        //                     .textContent('Error Saving Invoice')
        //                     .position('top right' )
        //                     .hideDelay(3000)
        //                 );
        //              })
        //               client.postReq(jsonString);
        //         }

        function successSubmit() {

            var client = $serviceCall.setClient("getNextGRNnoRead", "inventory"); // method name and service
            client.ifSuccess(function(data) { //sucess 

                vm.grn.GRNno = (data).toString();

                if (vm.grn.note != 0) {
                    // var str = vm.grn.note.toString();
                    var res = vm.grn.note.replace(/<br\s*[\/]?>/gi, "\n");
                    vm.grn.note = res;
                }

                vm.grn.inventoryLog = {
                    inventoryID: "",
                    inventoryClass: "GRN",
                    logID: "",
                    description: "",
                    UIHeight: "30px",
                    status: "Active",
                    userName: "",
                    lastTranDate: new Date()
                }


                // if (vm.selectedItem != null)
                //     vm.gin.billAddress["country"] = vm.selectedItem.country;
                // if (vm.selectedItem1 != null)
                //     if (vm.selectedItem1.country == undefined) {
                //         vm.gin.shipAddress["s_country"] = vm.selectedItem1;
                //     } else {
                //         vm.gin.shipAddress["s_country"] = vm.selectedItem1.country;
                //     }

                vm.grn.inventoryFavourite = false;
                vm.grn.inventoryClass = "GRN";
                vm.grn.favouriteStarNo = 1;
                vm.grn.deleteStatus = false;
                vm.grn.GRNType = "GRN";
                vm.grn.cancelStatus = false;
                vm.grn.pattern = vm.inventoryPattern;

                var grnObj = {};

                grnObj = {
                    "inventory": vm.grn,
                    "image": vm.image,
                    "appName": "Inventory",
                    "permissionType": "add"

                }

                var jsonString = JSON.stringify(grnObj)

                var client = $serviceCall.setClient("saveInventory", "process"); // method name and service
                client.ifSuccess(function(data) {

                    msSpinnerService.hide('grn-compose-spinner1');

                    console.log(data);
                    vm.grn.GRNno = data.ID;
                    $mdToast.show(
                        $mdToast.simple()
                        .textContent('GRN '+vm.grn.GRNno+' successfully saved')
                        .position('top right')
                        .theme('success-toast')
                        .hideDelay(2000)
                    );
                    $state.go('app.inventory.grn.detail', {
                        itemID: vm.grn.GRNno,
                        status: vm.grn.inventoryClass
                    });

                })
                client.ifError(function(data) {
                    msSpinnerService.hide('grn-compose-spinner1');
                    debugger;
                    if(data.hasOwnProperty('data') && data.data.hasOwnProperty('customMessage') && data.data.customMessage!=null && data.data.customMessage!=""){
                        $mdDialog.show(
                        $mdDialog.alert()
                        .parent(angular.element(document.body))
                        .title('Alert')
                        .content(data.data.customMessage)
                        .ariaLabel('Alert Dialog Demo')
                        .ok('OK')
                        .targetEvent()
                    );
    
                    }
                    else{
                    $mdDialog.show(
                        $mdDialog.alert()
                        .parent(angular.element(document.body))
                        .title('Alert')
                        .content('There was an error saving the data.')
                        .ariaLabel('Alert Dialog Demo')
                        .ok('OK')
                        .targetEvent()
                    );
                }
                })

                client.postReq(jsonString);
            })
            client.ifError(function(data) { //falce
                console.log("error loading setting data")
            })
            client.pattern(vm.inventoryPattern);
            client.getReq();




        }


        function cancel() {
            $state.go('app.inventory.grn');
        }

        function loadInvNo(val) {
            var client = $serviceCall.setClient("getNextGRNnoRead", "inventory"); // method name and service
            client.ifSuccess(function(data) { //sucess 
                vm.grn.GRNno = (data).toString()

            })
            client.ifError(function(data) { //falce
                console.log("error loading setting data")


            })
            client.pattern(vm.inventoryPattern);
            client.getReq();
        }

        //===================Add Contact Pop up=======================
        vm.addContact = addContact;

        function addContact(){
            $mdDialog.show({
                templateUrl: 'app/main/inventory/dialogs/contact/addContact.html',
                controller: 'addCusCtrl',
                controllerAs: 'vm'
            }).then(function(data){
                var data = data;
                assignCusData(data);//parse data which gets from contact controller to 
                                    //assign in this controller
            }, function(data){

            })
        };

        //__once the add contact pop up will close "assignCusData" function will get called.
        //in "assignCusData" it will create a object and call  "selectedItemChange" function to assign profile data.
        

        //_____Open the pop for edit contact_________
        vm.editContact = editContact;
        function editContact(val){
            
             $mdDialog.show({
                templateUrl: 'app/main/inventory/dialogs/contact/addContact.html',
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

        //==========================================



    }
})();
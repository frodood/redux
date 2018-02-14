(function() {
    'use strict';

    angular
        .module('app.inventory')
        .controller('ginComposeController', ginComposeController);

    /** @ngInject */
    function ginComposeController($scope, $rootScope, InventoryService, $mdPanel, $document, $imageUploader, fileUploaderInven, $mdDialog, $mdMedia, $mdSidenav, $state, $mdToast, $serviceCall, settingSummary, AddressService, msSpinnerService) {
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

        var ProductArray = [];
        vm.itemDetails = [];
        vm.image = [];
        vm.backState = 'app.inventory.gin';

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
        vm.showMoreInfo = false;

        loadAll();
        loadSettings();
        checkParams();

        function toggleChildStates(toggledState) {
            $state.go(toggledState);
        };
        // 
        ProductArray = InventoryService.getArry();
        vm.itemDetails = ProductArray.val;

        vm.gin = {
            "GINno": "",
            "internalNote": "",
            "comment": "",
            "customFields":[],
            "note": "",
            "email": "",
            "contactNo": "",
            "fax": "",
            "mobileNo": "",
            "website": "",
            "inventoryClass": "",
            "GINType": "",
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

        
        function checkParams() {
             debugger;
             console.log($state.params.Data);
            if ($state.params.Data) {
                 if ($state.params.hasOwnProperty('appName')) {
                    //Start loading Profile
                    if ($state.params.appName == "profile") {
                        vm.backState = 'app.contacts.customer'

                        setCustomer($state.params.Data.profileId);

                    }
                    //End loading Profile
                 }
            }
        }

        vm.gin.date = new Date();
        $rootScope.$on('selectedProfile',function(event, args){ 
            vm.selectedItem1 = args.slctdProfile; 
            debugger;
            assignCusData(vm.selectedItem1)
        });



        if (vm.settingSummary.length > 0) {
            vm.inventoryPattern = vm.settingSummary[0].preference.inventoryPref.ginPrefix + vm.settingSummary[0].preference.inventoryPref.ginSequence;
            // loadInvNo(vm.inventoryPattern);   
        }

        //__________define Address fields________

        vm.gin.billAddress = {
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

        vm.gin.shipAddress = {
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

        function setCustomer(profileID){
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

            console.log(val);

            vm.gin.customFields = val[0].preference.inventoryPref.issueCusFiel;
            vm.gin.note=val[0].preference.inventoryPref.defaultNote;
                //Start push property for ng-model data
                for(var i=0; i<= vm.gin.customFields.length -1; i++){
                  vm.gin.customFields[i]['value'] = "";
                }

            console.log(vm.gin.customFields);

            vm.Invprefix = val[0].preference.inventoryPref.ginPrefix;
            vm.Invsequence = val[0].preference.inventoryPref.ginSequence;
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
                vm.gin.itemDetails = InventoryService.getArry().val;
                console.log("itemDetails");
                console.log(vm.gin.itemDetails);
            }, function(val) {

            })
        }

        function deleteProduct(prod, index) {
            InventoryService.removeArray(prod, index);
        }

        function editProduct(val, index) {
            // debugger;
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

        // function uploadFile() {
        //     // debugger;
        //     fileUploaderInven.uploadFile()
        //     fileUploaderInven.result(function(arr) {
        //         vm.imageArray = arr;
        //     })

        // }
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


        // //=============================uploadFile============================
        //         vm.uploadFile = uploadFile;

        //         function uploadFile (){
        //             console.log("uploadFile")

        //             var position = $mdPanel.newPanelPosition()
        //             .absolute()
        //             .center()
        //             .center();
        //             var animation = $mdPanel.newPanelAnimation(); 
        //             animation.withAnimation($mdPanel.animation.FADE);
        //             var config = {
        //             animation: animation,
        //             attachTo: angular.element(document.body),
        //             controller: 'uploadCtrl',
        //             controllerAs: 'vm',
        //             templateUrl: 'app/main/inventory/dialogs/uploader/upload.html',
        //             panelClass: 'dialog-uploader',
        //             position: position,
        //             trapFocus: true,
        //             zIndex: 150,
        //             clickOutsideToClose: true,
        //             clickEscapeToClose: true,
        //             hasBackdrop: true
        //             };
        //             $mdPanel.open(config);

        //         }
        //         //=================================================================

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
                where: "status = 'Active' and deleteStatus = false and profileClass = 'Customer' and (profileName LIKE '" + val + "%' OR email LIKE '" + val + "%')"
            })
        }

        function assignCusData(val) {
            // debugger;
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

            vm.customerEditdetails = {};
            vm.customerEditdetails = obj.value;
            
            if (vm.selectedItem1 == null) {
                vm.showEditCustomer = false;
                vm.gin.billAddress = "";
                vm.gin.shipAddress = "";
                vm.gin.contactNo = "";
                vm.gin.fax = "";
                vm.gin.mobileNo = "";
                vm.gin.website = "";
                vm.gin.email = "";
            } else {
                vm.ObjbillingAddress = AddressService.setAddress(obj.value.profileName,obj.value.billingAddress.street,obj.value.billingAddress.city,obj.value.billingAddress.state,obj.value.billingAddress.zip,obj.value.billingAddress.country,obj.value.phone,obj.value.mobile,obj.value.fax,obj.value.email,obj.value.website);
                vm.ObjshippingAddress = AddressService.setAddress(obj.value.profileName,obj.value.shippingAddress.s_street,obj.value.shippingAddress.s_city,obj.value.shippingAddress.s_state,obj.value.shippingAddress.s_zip,obj.value.shippingAddress.s_country,obj.value.phone,obj.value.mobile,obj.value.fax,obj.value.email,obj.value.website);
                vm.ActiveAddressObj = vm.ObjbillingAddress;

                vm.showEditCustomer = true;
                if ( obj.hasOwnProperty('value') ) {
    

                vm.gin.customerNames = obj.value.profileName;
                vm.gin.email = obj.value.email;
                vm.gin.profileID=obj.value.profileID;
                vm.profileID = obj.value.profileID;
                vm.gin.contactNo = obj.value.phone;
                vm.gin.fax = obj.value.fax;
                vm.gin.mobileNo = obj.value.mobile;
                vm.gin.website = obj.value.website;
                vm.gin.billAddress = obj.value.billingAddress;
                vm.gin.shipAddress = obj.value.shippingAddress;

                // if (vm.gin.billAddress != "") {
                //     if (vm.gin.billAddress.street != "") {
                //         vm.billAddress.street = vm.gin.billAddress.street + ",";
                //     }


                //     if ((vm.gin.billAddress.city != "") && (vm.gin.billAddress.zip != "")) {
                //         vm.billAddress.city = vm.gin.billAddress.city + " ";
                //         vm.billAddress.zip = vm.gin.billAddress.zip + ",";
                //     } else {
                //         if (vm.gin.billAddress.city != "") {
                //             vm.billAddress.city = vm.gin.billAddress.city + ",";
                //         }


                //         if (vm.gin.billAddress.zip != "") {
                //             vm.billAddress.zip = vm.gin.billAddress.zip + ",";
                //         }
                //     }

                //     if (vm.gin.billAddress.state != "") {
                //         vm.billAddress.state = vm.gin.billAddress.state + ",";
                //     }
                // }



                // if (vm.gin.shipAddress != "") {
                //     if (vm.gin.shipAddress.s_street != "") {
                //         vm.shipAddress.s_street = vm.gin.shipAddress.s_street + ",";
                //     }


                //     if ((vm.gin.shipAddress.s_city != "") && (vm.gin.shipAddress.s_zip != "")) {
                //         vm.shipAddress.s_city = vm.gin.shipAddress.s_city + " ";
                //         vm.shipAddress.s_zip = vm.gin.shipAddress.s_zip + ",";
                //     } else {
                //         if (vm.gin.shipAddress.s_city != "") {
                //             vm.shipAddress.s_city = vm.gin.shipAddress.s_city + ",";
                //         }


                //         if (vm.gin.shipAddress.s_zip != "") {
                //             vm.shipAddress.s_zip = vm.gin.shipAddress.s_zip + ",";
                //         }
                //     }

                //     if (vm.gin.shipAddress.s_state != "") {
                //         vm.shipAddress.s_state = vm.gin.shipAddress.s_state + ",";
                //     }
                // }
            }

            }
        };



        function submit() {

            msSpinnerService.show('gin-compose-spinner1');
            // if (vm.imageArray.length > 0) {
            //     for (var indexx = 0; indexx < vm.imageArray.length; indexx++) { 
            //         var client = $imageUploader.setImage(vm.imageArray[indexx].uniqueCode);
            //         client.ifSuccess(function(data){ 

            //         });
            //         client.ifError(function(data){ 

            //         });
            //         client.sendImage(vm.imageArray[indexx])         
            //     }
            // };


            if (vm.selectedItem1 == null) {
                msSpinnerService.hide('gin-compose-spinner1');
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
                if (vm.profileID != "") {
                    if (ProductArray.val.length > 0) {

                            //Start fill vm.gin.customFields for saving
                            var hasValuelSet = false;
                            vm.gin.customFields.forEach(function(v){ 
                                delete v.fields;
                                delete v.$$hashKey;
                                if(v.value != "")
                                {
                                    hasValuelSet = true;
                                }
                            });
                            if(hasValuelSet == false){vm.gin.customFields = [];}
                            //End fill vm.gin.customFields for saving

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
                        msSpinnerService.hide('gin-compose-spinner1');
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
                    msSpinnerService.hide('gin-compose-spinner1');
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

            var client = $serviceCall.setClient("getNextGINnoRead", "inventory"); // method name and service
            client.ifSuccess(function(data) { //sucess 
                vm.gin.GINno = (data).toString();

                if (vm.gin.note != 0) {
                    // var str = vm.gin.note.toString();
                    var res = vm.gin.note.replace(/<br\s*[\/]?>/gi, "\n");
                    vm.gin.note = res;
                }

                vm.gin.inventoryLog = {
                    inventoryID: "",
                    inventoryClass: "GIN",
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

                vm.gin.inventoryFavourite = false;
                vm.gin.inventoryClass = "GIN";
                vm.gin.favouriteStarNo = 1;
                vm.gin.deleteStatus = false;
                vm.gin.GINType = "GIN";
                vm.gin.cancelStatus = false;
                vm.gin.pattern = vm.inventoryPattern;

                var ginObj = {};

                ginObj = {
                    "inventory": vm.gin,
                    "image": vm.image,
                    "appName": "Inventory",
                    "permissionType": "add"

                }

                var jsonString = JSON.stringify(ginObj)

                var client = $serviceCall.setClient("saveInventory", "process"); // method name and service
                client.ifSuccess(function(data) {
                    msSpinnerService.hide('gin-compose-spinner1');
                    console.log(data);
                    vm.gin.GINno = data.ID;
                    $mdToast.show(
                        $mdToast.simple()
                        .textContent('GIN '+vm.gin.GINno+' successfully saved')
                        .position('top right')
                        .theme('success-toast')
                        .hideDelay(2000)
                    );
                    $state.go('app.inventory.gin.detail', {
                        itemID: vm.gin.GINno,
                        status: vm.gin.inventoryClass
                    });
                })
                client.ifError(function(data) {
                    msSpinnerService.hide('gin-compose-spinner1');
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
                    msSpinnerService.hide('gin-compose-spinner1');
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
            $state.go('app.inventory.gin');
        }

        function loadInvNo(val) {
            var client = $serviceCall.setClient("getNextGINnoRead", "inventory"); // method name and service
            client.ifSuccess(function(data) { //sucess 
                vm.gin.GINno = (data).toString()

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
            debugger;
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
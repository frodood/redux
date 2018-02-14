(function() {
    'use strict';
    angular
        .module('app.creditnotes')
        .controller('creComposeController', creComposeController)
    /** @ngInject */
    function creComposeController($scope, $rootScope, $imageUploader, creditnoteService, $mdPanel, $auth, $serviceCall, $mdToast, $document, $mdDialog, $mdMedia, $mdSidenav, $state, AddressService, settingData, msSpinnerService) {
        var vm = this,
            dis,
            showTaxes,
            loginName,
            creditClient;
        creditnoteService.removeAll(0);
        creditnoteService.removeTaxArray(0);
        vm.addProduct = addProduct;
        vm.calculatetotal = calculatetotal;
        vm.CalculateTax = CalculateTax;
        vm.salesTax = 0;
        vm.total = 0;
        vm.famount = 0;
        var ProductArray = [];
        vm.lineItems = [];
        var taxArr = [];
        vm.deleteProduct = deleteProduct;
        vm.editProduct = editProduct;
        vm.saveDis = false;
        vm.toggleChildStates = toggleChildStates;
        vm.submit = submit;
        vm.changeAddress = changeAddress;
        vm.querySearch = querySearch;
        vm.searchText = null;
        vm.Billingaddress = true;
        vm.Shippingaddress = false;
        vm.selectedItemChange = selectedItemChange;
        vm.selectedItem1 = null;
        vm.validateInvoice = false;
        vm.changeShipping = changeShipping;
        loginName = $auth.getSession().Name;
        vm.ActiveAddressObj = [];
        vm.ObjbillingAddress = [];
        vm.ObjshippingAddress = [];
        vm.selectedItem1 = [];
        vm.setMedia = setMedia;

        
        
        vm.brochureConfig = {
            restrict: "image/*|application/pdf",
            size: "2MB",
            crop: false,
            type: "brochure",
            maxCount: 1
        }
        vm.backState = 'app.estimates.est';
        checkParams();

        //set customer edit details
        function selctedcustomerLoading(obj){
             vm.customerEditdetails = {};
            vm.customerEditdetails = obj.value;
            console.log( vm.customerEditdetails);
        };

        vm.spinnerService = msSpinnerService;

        function setMedia(res) {
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
                // loadImage();
            }
        }

        function getCurrencyDetails(obj) {
            vm.getcurrencydetails = {};
            vm.getcurrencydetails = obj;
        };
        $scope.$on('selectedProfile', function(ev, args) {
            var obj = [];
            obj.value = args.slctdProfile;
            vm.selectedItem1.value = args.slctdProfile;
            selectedItemChange(obj);
        });

        //check for $state.params to customer detail fill creditnote... 
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

        function createObj() {
            creditClient = new credit();
            creditClient.appRedirection().assignSettigsData().loadcreditNo();
        }

        vm.TDCreditNote = {
            "creditNoteNo": "",
            "baseCurrency": "",
            "changedCurrency": "",
            "isCurrencyChanged": "",
            "customFields": [],
            "deleteStatus": false,
            "email": "",
            "profileID": "",
            "profileName": "",
            "date": new Date(),
            "invoiceRefNo": [],
            "comments": "",
            "billingAddress": {
                "city": "",
                "country": "",
                "zip": "",
                "state": "",
                "street": ""
            },
            "shippingAddress": {
                "s_city": "",
                "s_street": "",
                "s_zip": "",
                "s_state": "",
                "s_country": ""
            },
            "internalNote": "",
            "uploadImages": "",
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
            "taxAmounts": "",
            "status": "",
            "lastTranDate": "",
            "createDate": new Date(),
            "modifyDate": new Date(),
            "createUser": "",
            "modifyUser": "",
            "sendMail": "",
            "viewed": "",
            "creditNoteProducts": [],
            "balance": 0,
            "fax": "",
            "contactNo": ""
        }

        function credit() {
            this.client;
            this.stngData = settingData;
            this.prefix = "";
            this.sequence = "";
            this.creditPref;
            this.settingProf;
            this.invoicePref;
            this.productPref;
            this.tax;
        }

        credit.prototype = {
            appRedirection: function(){
                if ($state.params.appName) {
                    switch($state.params.appName){
                        case 'invoice':
                            loadInvoiceByID($state.params.Data.invoiceNo)
                            break;
                        default :
                            console.log('app name not exist')
                    }
                } 
                return this;
            },
            loadcreditNo: function() {
                this.client = $serviceCall.setClient("getNextNo", "creditNote");
                this.client.ifSuccess((function(data) {
                    var data = data;
                    console.log(data);
                    vm.creditNoteNo = data;
                }).bind(this));
                this.client.ifError((function(data) {
                    console.log("error loading creditNote No")
                }).bind(this));
                this.client.pattern(this.prefix + this.sequence);
                this.client.getReq();
                return this;
            },
            assignSettigsData: function() {
                if (this.stngData && Array.isArray(this.stngData)) {
                    this.creditPref = this.stngData[0].preference.creditNotePref;
                    this.invoicePref = this.stngData[0].preference.invoicePref;
                    this.productPref = this.stngData[0].preference.productPref;
                    this.settingProf = this.stngData[0].profile;
                    this.tax = this.stngData[0].taxes;
                    this.prefix = this.creditPref.creditNotePrefix;
                    this.sequence = this.creditPref.creditNoteSequence;
                    this.displayDiscount = this.invoicePref.enableDisscounts;
                    vm.TDCreditNote.pattern = this.prefix + this.sequence;
                    vm.baseCurrency = this.settingProf.baseCurrency;
                    vm.custField = this.creditPref.CusFiel;
                    if (this.displayDiscount) {
                        vm.TDCreditNote.discountTerm = this.creditPref.disscountItemsOption
                    }
                    GetCustFields(this.stngData);

                    showTaxes = this.invoicePref.enableTaxes
                    vm.TDCreditNote.baseCurrency = vm.baseCurrency;
                    vm.TDCreditNote.changedCurrency = vm.baseCurrency;
                    var stnCls = new settingCls();
                    stnCls.getTaxes(this.tax).getproUnits(this.productPref);
                }

                getCurrencyDetails(vm.TDCreditNote);
                return this;
            },
            oopQuerySearch: function(query) {
                //var body = {"where": "status = 'Active' and deleteStatus = false and profileName LIKE '" + query + "%' "}
                var body = {
                    where: "status = 'Active' and deleteStatus = false and (profileName LIKE" + "'" + query + "%' OR email LIKE" + "'" + query + "%')"
                }
                this.client = $serviceCall.setClient("getAllByQuery", "profile");
                this.client.skip("0");
                this.client.take("10");
                this.client.class("Customer");
                this.client.orderby("profileID");
                this.client.isAscending("false");
                return this.client.getSearch(body).then(function(response) {
                    var data = response.data.result;
                    var results = [];
                    for (var i = 0, len = data.length; i < len; ++i) {
                        results.push({
                            display: data[i].profileName,
                            value: data[i],
                        });
                    }
                    return results
                }, function(results) {
                    console.log('error loading data')
                })
            },
            checkInvoice: function(_val) {
                if (_val !== "") {
                    this.client = $serviceCall.setClient("getAllByQuery", "invoice");
                    this.client.ifSuccess((function(data) {
                        var data = data.result;
                    
                        if (data.length == 0) {
                            vm.validateInvoice = true;
                            vm.getRefNo = true;
                            vm.invoiceError = "This Invoice No does not belong to this customer/company or it is already Paid";
                        } else if (data[0].peymentTerm === 'multipleDueDates') {
                            vm.validateInvoice = true;
                            vm.getRefNo = true;
                            vm.invoiceError = "Can't enter credit note for multiple due date invoice";
                        } else {
                            vm.validateInvoice = false;
                            vm.getRefNo = false;
                        }
                    }).bind(this));
                    this.client.ifError((function(data) {
                        vm.validateInvoice = true;
                        vm.getRefNo = true;
                        vm.invoiceError = "please select a customer";
                    }).bind(this));
                    this.client.postReq({
                        'where': 'invoiceStatus <> "Paid" and invoiceNo = "' + _val + '"'
                    });
                } else {
                    vm.validateInvoice = false;
                }
            },
            saveDraftReq: function(mtd, srv, body) {
                var client = $serviceCall.setClient(mtd, srv);
                client.ifSuccess(function(data) {
                    $state.go('app.creditnotes.cre');
                    $mdToast.show(
                        $mdToast.simple()
                        .textContent('Successfully saved')
                        .position('top right')
                        .hideDelay(3000)
                    );
                });
                client.ifError(function(data) {
                    $mdToast.show(
                        $mdToast.simple()
                        .textContent('Error Saving creditnote')
                        .position('top right')
                        .hideDelay(3000)
                    );
                })
                client.postReq(body);
            }
        }

         function GetCustFields(arr){
       
            vm.TDCreditNote.customFields = [];
            var CustArr = [];
            if (arr[0].preference) {

                if(arr[0].preference.productPref)
                  CustArr = arr[0].preference.creditNotePref.cusFiel; 
                if (CustArr.length > 0) {
                  for(var i=0; i<= CustArr.length-1; i++){
                    vm.TDCreditNote.customFields.push(CustArr[i]);
                  }
                }  
            }     
        }  


        function loadInvoiceByID(invoiceID){
            var client = $serviceCall.setClient("getAllByQuery", "invoice");
            client.ifSuccess(function(response) {
                if (response.result && response.result.length>0) {                    
                    var data = response.result[0];
                    setCreditFromInv(data);
                }

            });
            client.ifError(function(data) {
                
            });
            client.postReq({
                'where': 'invoiceStatus <> "Paid" and invoiceNo = "' + invoiceID + '"'
            });
        }
        function setCreditFromInv(data){                
            assignCusData(data)
            vm.TDCreditNote.invoiceRefNo.push(data.invoiceNo);
            for(var i=0; i<= data.invoiceLines.length-1; i++){
                creditnoteService.setFullArr({
                    invoiceNo : data.invoiceLines[i].invoiceNo,
                    productID : data.invoiceLines[i].productID,
                    productName: data.invoiceLines[i].productName,
                    price: data.invoiceLines[i].price,
                    quantity: data.invoiceLines[i].quantity,
                    productUnit: data.invoiceLines[i].productUnit,
                    discount: data.invoiceLines[i].discount,
                    tax: data.invoiceLines[i].tax,
                    olp: data.invoiceLines[i].olp,
                    amount: data.invoiceLines[i].amount,
                    status: data.invoiceLines[i].status
                }); 
            }

            ProductArray = creditnoteService.getArry();
            vm.lineItems = ProductArray.val;

            vm.TDCreditNote.shipping = data.shipping;
            vm.changeShipping()

            console.log(data)
        }
        createObj();
        vm.checkInvoice = creditClient.checkInvoice;

        function settingCls() { // javascript closure  
            this.individualTaxes = [];
            this.multiplelTaxes = [];
            this.getTaxes = function(arr) {
                vm.individualTax = [];
                if (arr) {
                    this.individualTaxes = arr.individualTaxes;
                    this.multiplelTaxes = arr.multipleTaxGroup;
                }
                if (this.individualTaxes.length > 0) {
                    for (var i = 0; i <= this.individualTaxes.length - 1; i++) {
                        if (this.individualTaxes[i].activate) { // only dispaly activate = true individual taxes
                            vm.individualTax.push(this.individualTaxes[i]);
                        }
                    }
                }
                if (this.multiplelTaxes.length > 0) {
                    for (var j = 0; j <= this.multiplelTaxes.length - 1; j++) {
                        if (this.multiplelTaxes[j].activate) { // only dispaly activate = true multiple taxes
                            vm.individualTax.push(this.multiplelTaxes[j]);
                        }
                    }
                }
                return this;
            }
            this.getproUnits = function(arr) {
                vm.UnitOfMeasure = [];
                this.productUnits = arr.units;
                if (this.productUnits.length > 0) {
                    for (var i = 0; i <= this.productUnits.length - 1; i++) {
                        if (this.productUnits[i].activate) { // only dispaly activate = true Units
                            vm.UnitOfMeasure.push(this.productUnits[i].unitsOfMeasurement);
                        }
                    }
                }
                return this;
            }
        }
        //=========Load Customer===========================================
        function querySearch(query) {
            return creditClient.oopQuerySearch(query);
        }

        function selectedItemChange(obj) {

            selctedcustomerLoading(obj)
            if (vm.selectedItem1 == null) {
                vm.showEditCustomer = false;
                vm.TDCreditNote.billingAddress = "";
                vm.TDCreditNote.shippingAddress = "";
                vm.TDCreditNote.contactNo = "";
                vm.TDCreditNote.email = "";
                vm.TDinv.fax = "";
                vm.TDCreditNote.website = "";
            } else {
                vm.ObjbillingAddress = AddressService.setAddress(obj.value.profileName, obj.value.billingAddress.street, obj.value.billingAddress.city, obj.value.billingAddress.state, obj.value.billingAddress.zip, obj.value.billingAddress.country, obj.value.phone, obj.value.mobile, obj.value.fax, obj.value.email, obj.value.website);
                vm.ObjshippingAddress = AddressService.setAddress(obj.value.profileName, obj.value.shippingAddress.s_street, obj.value.shippingAddress.s_city, obj.value.shippingAddress.s_state, obj.value.shippingAddress.s_zip, obj.value.shippingAddress.s_country, obj.value.phone, obj.value.mobile, obj.value.fax, obj.value.email, obj.value.website);
                vm.ActiveAddressObj = vm.ObjbillingAddress;
                vm.showEditCustomer = true;
                vm.TDCreditNote.profileName = obj.value.profileName;
                vm.TDCreditNote.email = obj.value.email;
                vm.TDCreditNote.profileID = obj.value.profileID;
                vm.TDCreditNote.contactNo = obj.value.phone;
                vm.TDCreditNote.fax = obj.value.fax;
                vm.TDCreditNote.billingAddress = obj.value.billingAddress;
                vm.TDCreditNote.shippingAddress = obj.value.shippingAddress;
                vm.TDCreditNote.website = obj.value.website;
                vm.TDCreditNote.mobileNo = obj.value.mobile;
            }
        };
        vm.checkpayments = [];
        ProductArray = creditnoteService.getArry();

        function toggleChildStates(toggledState) {
            $state.go(toggledState);
        };
        //================change address============================
        function changeAddress() {

            vm.Billingaddress = !vm.Billingaddress;
            vm.Shippingaddress = !vm.Shippingaddress;
            if (vm.Billingaddress == true) {
                vm.ActiveAddressObj = vm.ObjbillingAddress;
            }
            if (vm.Shippingaddress == true) {
                vm.ActiveAddressObj = vm.ObjshippingAddress;
            }
        };
        //add product Pop up
        // function addProduct(ev) {
        //     $mdDialog.show({
        //         templateUrl: 'app/main/creditnotes/dialogs/addproduct/addproduct.html',
        //         targetEvent: ev,
        //         controller: 'addProdCtrlCre',
        //         controllerAs: 'vm'
        //     }).then(function(val) {
        //         calculatetotal();
        //     }, function(val) {
        //     })
        // }
        var addNewContact = $rootScope.$on('newContactActivity', function(event, args) {
            var newCustomer = args;
            console.log(newCustomer);
            assignCusData(newCustomer);
        });
        var editContact = $rootScope.$on('editContactActivity', function(event, args) {
            var editCustomer = args;
            assignCusData(editCustomer);
        });

        var addProduct = $rootScope.$on('addProductActivity', function(event, args) {
            calculatetotal();
        });
        var editProduct = $rootScope.$on('editProductActivity', function(event, args) {
            calculatetotal();
        });

        $scope.$on('$destroy', function() {
            addNewContact();
            editContact();
            addProduct();
            editProduct();
        });

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
        vm.taxArray = creditnoteService.getTaxArr();

        function calculatetotal() {
            vm.total = creditnoteService.calculateTotal();
            vm.taxArray = creditnoteService.getTaxArr();
            CalculateTax();
            changeShipping();
        }

        function CalculateTax() {
            vm.salesTax = creditnoteService.calculateTax();
        }

        function changeShipping() {
            if (vm.TDCreditNote.shipping === "") {
                vm.TDCreditNote.shipping = 0;
            }
            vm.famount = parseFloat(vm.TDCreditNote.shipping) + parseFloat(vm.total);
        }

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
                if (vm.TDCreditNote.profileID != "") {
                    if (ProductArray.val.length > 0) {
                        if (vm.imageArray.length > 0) {
                            
                            vm.TDCreditNote.uploadImages = [];
                            for (var indexx = 0; indexx < vm.imageArray.length; indexx++) {
                              
                                if (vm.imageArray[0].type == "application/pdf") {

                                    vm.type = "brochure";
                                }

                                if (vm.imageArray[0].type == "image/jpeg" || vm.imageArray[0].type == "image/png") {
                                    vm.type = "image";
                                }

                                vm.TDCreditNote.uploadImages.push({
                                    ID: "",
                                    name: vm.imageArray[indexx].name,
                                    size: vm.imageArray[indexx].size,
                                    uniqueCode: vm.imageArray[indexx].uniqueCode,
                                    appGuid: "",
                                    appName: "creditnote",
                                    date: new Date(),
                                    createUser: "",
                                    type: vm.type
                                })
                                var client = $imageUploader.setImage(vm.imageArray[indexx].uniqueCode, 'creditnote');
                                client.ifSuccess(function(data) {
                                    successSubmit();
                                });
                                client.ifError(function(data) {
                                    
                                });
                                // client.sendImage(vm.imageArray[indexx])
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

            vm.spinnerService.show('cre-compose-spinner');
            vm.saveDis = true;
            vm.TDCreditNote.creditNoteProducts = vm.lineItems;
            vm.TDCreditNote.taxAmounts = vm.taxArray;
            vm.TDCreditNote.subTotal = vm.total;
            vm.TDCreditNote.netAmount = vm.famount;
            vm.TDCreditNote.balance = vm.famount;
            vm.TDCreditNote.salesTaxAmount = parseFloat(vm.salesTax * vm.TDCreditNote.exchangeRate);

            vm.customFields = [];
            for (var i = 0; vm.TDCreditNote.customFields.length > i; i++) {
                if (vm.TDCreditNote.customFields[i].value != "") {
                    vm.customFields.push(vm.TDCreditNote.customFields[i]);
                }
            };

            vm.TDCreditNote.customFields = vm.customFields;

            var serviceObj = {
                "creditNote": vm.TDCreditNote,
                "image": vm.TDCreditNote.uploadImages,
                "appName": 'CreditNotes',
                'permissionType': 'add'
            }

            var jsonString = JSON.stringify(serviceObj);
            // oop type http post req
            var cc = new sendPost("createCreditNote", "process", jsonString);
            cc.getClent().send().getRes(function(result) {
                var data = result
                vm.saveDis = false;
         
                if (data.success) {
                    $mdToast.show(
                      $mdToast.simple()
                        .textContent('CreditNote '+vm.creditNoteNo+' successfully saved.')
                        .position('top right' )
                        .hideDelay(3000)
                    );
                    $state.go('app.creditnotes.cre.detail', {
                        'itemId': data.ID
                    });
                    vm.spinnerService.hide('cre-compose-spinner');
                } else {
                    vm.spinnerService.hide('cre-compose-spinner');
                    $mdDialog.show(
                        $mdDialog.alert()
                        .parent(angular.element(document.body))
                        .content(data.customMessage)
                        .ariaLabel('Alert Dialog Demo')
                        .ok('OK')
                        .targetEvent()
                    );
                }
            });
        }

        function deleteProduct(prod, index) {
            creditnoteService.removeTax(prod, ProductArray);
            creditnoteService.removeArray(prod, index);
            calculatetotal();
        }

        function editProduct(val, index) {
            $mdDialog.show({
                templateUrl: 'app/main/creditnotes/dialogs/addproduct/editProduct.html',
                controller: 'editNewProdCre',
                controllerAs: 'vm',
                locals: {
                    item: val
                }
            }).then(function(data) {
                calculatetotal();
            }, function(data) {
            })
        }
        vm.cancel = function(ev) {
            $state.go('app.creditnotes.cre');
        }

        function calculatetotal() {
            vm.total = creditnoteService.calculateTotal();
            vm.taxArray = creditnoteService.getTaxArr();
            CalculateTax();
            finalamount();
        }
        //return net amount from creditnoteService     
        function finalamount() {
            if (vm.TDCreditNote.shipping == "") {
                vm.ship = 0
            } else {
                vm.ship = vm.TDCreditNote.shipping;
            }
            vm.famount = creditnoteService.calculateNetAMount(vm.ship);
            // vm.famount = parseFloat(vm.total) + parseFloat(vm.salesTax) +
            //     parseFloat(vm.ship);
        };
        // vm.addContact = addContact;

        // function addContact() {
        //     $mdDialog.show({
        //         templateUrl: 'app/main/creditnotes/dialogs/contact/addContact.html',
        //         controller: 'addCusCtrlCre',
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
            vm.selectedItem1 = cus; //val.profileName;
            $rootScope.$broadcast('extupslctusr', cus);
            selectedItemChange(cus)
        }
        // vm.editContact = editContact;

        // function editContact(val) {
        //     $mdDialog.show({
        //         templateUrl: 'app/main/creditnotes/dialogs/contact/addContact.html',
        //         controller: 'editCusCtrlCre',
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
        vm.imageArray = []
        //=================================================================
        vm.changeCurrency = changeCurrency;

        function changeCurrency() {
            var currencyOBj = {
                baseCurrency: vm.TDCreditNote.baseCurrency,
                currencyChanged: vm.TDCreditNote.currencyChanged,
                changedCurrency: vm.TDCreditNote.changedCurrency,
                exchangeRate: vm.TDCreditNote.exchangeRate
            }
            $mdDialog.show({
                templateUrl: 'app/main/creditnotes/dialogs/changeCurrency/changeCurrency.html',
                controller: 'creChangeCurrencyCtrl',
                controllerAs: 'vm',
                locals: {
                    item: currencyOBj
                }
            }).then(function(data) {
                var data = data;
                // console.log(data)
                if (data.currencyStatus == true) {
                    vm.TDCreditNote.currencyChanged = true;
                    vm.TDCreditNote.changedCurrency = data.currencyType;
                    vm.TDCreditNote.exchangeRate = parseFloat(data.exchangeRate)
                    vm.TDCreditNote.shipping = parseFloat((vm.TDCreditNote.shipping / vm.TDCreditNote.exchangeRate) * data.exchangeRate);
                }
            }, function(data) {
            })
        }
        //////////////////////////////////////////////////////////////////
        //////////////////////////////////////////////////////////////////
        /// oop type post requests ///////////////////////////////////////
        function parentCls(mtd, srv) {
            this.client = $serviceCall.setClient(mtd, srv);
            this.getClent = function() {
                return this;
            }
        }

        function clildRes() {
            parentCls.apply(this, arguments);
            this.result;
            this.client.ifSuccess(function() {})
            this.client.ifError(function() {})
            this.getRes = function(callback) {
                this.client.ifSuccess((function(data) {
                    this.result = data;
                    this.result.success = true;
                    callback(this.result);
                }).bind(this));
                this.client.ifError((function(data) {
                    this.result = data;
                    this.result.success = false;
                    callback(this.result);
                }).bind(this));
            }
        }

        function sendPost(mtd, srv, body) {
            clildRes.apply(this, arguments);
            this.send = function() {
                this.client.postReq(body)
                return this;
            }
        }
        clildRes.prototype = new parentCls();
        sendPost.prototype = new clildRes();
        //////////////////////////////////////////////////////////////////
        //////////////////////////////////////////////////////////////////
        /// oop type post requests ///////////////////////////////////////
    }
})();

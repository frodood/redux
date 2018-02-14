(function() {
    'use strict';

    angular
        .module('app.invoices')
        .controller('invComposeController', invComposeController)
        .factory('Invoicecopy', Invoicecopy);

    /** @ngInject */
    function invComposeController($scope, $setUrl, $rootScope, Invoicecopy, invoiceMultipleDueDatesService, $imageUploader, uploaderService, InvoiceService, $mdPanel, $serviceCall, $mdToast, $document, $mdDialog, $mdMedia, $mdSidenav, AddressService, $state,msSpinnerService) {

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
        vm.Invprefix = ""; //"INV"
        vm.Invsequence = ""; //0000"
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

        vm.ActiveAddressObj = [];
        vm.ObjbillingAddress = [];
        vm.ObjshippingAddress = [];

        vm.deleteProduct = deleteProduct;
        //vm.editProduct = editProduct;
        vm.addShipping = addShipping;
        vm.MultiDuDates = MultiDuDates;
        vm.taxArray = [];
        vm.TDinv.isCurrencyChanged = false;
        vm.backState = 'app.invoices.inv';
        vm.addDueDate = addDueDate;
        vm.settings; //settings data for common use
        vm.enableShipping = false;
        vm.watingforServiceResponse = false;
        vm.getPayement = getPayement;
        loadAll();
        loadSettings();
        vm.selectedItem1 = [];
        vm.ship = 0;

        vm.showMoreInfo = false;

        vm.brochureConfig = {
            restrict: "image/*|application/pdf",
            size: "2MB",
            crop: false,
            type: "brochure",
            maxCount: 1
        }

        $scope.$on('selectedProfile', function(ev, args) {
            debugger;
            var obj = [];
            obj.value = args.slctdProfile;
            vm.selectedItem1.value = args.slctdProfile;

            selectedItemChange(obj);

        });

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
            calculatetotal();
            if (vm.TDinv.peymentTerm == "multipleDueDates") {
                    updateMultiDueDate();
            }
        });
        //----------------------------------
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

        function getPayement(methordList, selectedMethord) {
            for (var i = 0; methordList.length > i; i++) {
                if (methordList[i].paymentmethod == selectedMethord) {
                    vm.TDinv.paymentType = methordList[i].paymentType;
                }
            }
        }
        //check for $state.params to fill invoice
        function checkParams() {
            debugger;
            if ($state.params.Data) {
                if ($state.params.hasOwnProperty('appName')) {

                    //Start loading Profile
                    if ($state.params.appName == "profile") {
                        vm.backState = 'app.contacts.customer'

                        setCustomer($state.params.Data.profileId);

                    }
                    //End loading Profile

                    //Start loading Estimat
                    if ($state.params.appName == "estimate") {
                        debugger;
                        vm.backState = 'app.estimates.est';
                        setCustomer($state.params.Data.profileID);
                        var client = $serviceCall.setClient("getEstimateByKey", "estimate");
                        client.ifSuccess(function(data) {

                            vm.TDinv.invoiceLines = data.estimateProducts
                            debugger
                            vm.TDinv.baseCurrency = data.baseCurrency;
                            vm.TDinv.changedCurrency = data.changedCurrency;
                            vm.TDinv.poNumber = data.customerRef;
                            if (vm.TDinv.poNumber == "-") {
                                vm.TDinv.poNumber = ""
                            };
                            vm.TDinv.isCurrencyChanged = data.isCurrencyChanged;
                            vm.TDinv.paymentTerm = data.paymentTerm;
                            vm.TDinv.notes = data.notes;
                            if (vm.TDinv.notes == "-") {
                                vm.TDinv.notes = ""
                            };
                            vm.TDinv.comments = data.comments;
                            if (vm.TDinv.comments == "-") {
                                vm.TDinv.comments = ""
                            };

                            vm.TDinv.shipping = data.shipping;
                            vm.TDinv.exchangeRate = data.exchangeRate;
                            vm.TDinv.isCurrencyChanged = data.isCurrencyChanged;

                            vm.ship = vm.TDinv.shipping / vm.TDinv.exchangeRate;
                            vm.famount = data.netAmount;

                            loadcurrentCurrencyModelData()
                            for (var i = data.estimateProducts.length - 1; i >= 0; i--) {
                                InvoiceService.setArray(data.estimateProducts[i])
                            }

                            InvoiceService.removeTaxArray(0)
                            for (var i = data.taxAmounts.length - 1; i >= 0; i--) {
                                InvoiceService.setTaxArr(data.taxAmounts[i])
                            }
                            vm.taxArray = InvoiceService.getTaxArr();

                            if (data.uploadImages.length > 0) {
                                ImageDataSynchronizer("estimate/", data.uploadImages);
                            }

                            vm.TDinv.refType = "Estimate";
                            vm.TDinv.refID = $state.params.Data.estimateNo;

                            var client = {
                                display: data.profileName,
                                value: data
                            }
                            selectedItemChange(client);
                            setSelectTaxes()

                        });
                        client.ifError(function(data) {

                        });
                        client.uniqueID($state.params.Data.estimateNo); // send projectID as url parameters
                        client.postReq();

                    }
                    //End loading Estimate

                    //Start loading Expense
                    if ($state.params.appName == "expense") {
                        debugger;
                        vm.backState = 'app.expenses.exp.detail';

                        var client = $serviceCall.setClient("getExpenseByKey", "expense");
                        client.ifSuccess(function(data) {
                            debugger;
                            console.log(data);
                            ExpenceProductCheck(function(data) {
                                debugger;
                            }, "expense-" + data.category, data);
                            vm.TDinv.comments = "Expense: " + $state.params.Data.expenseID;
                            vm.TDinv.tags = data.tags;
                            /*vm.TDinv.paymentTerm = data.paymentTerm;
                            vm.TDinv.notes = data.notes;
                            if(vm.TDinv.notes == "-"){vm.TDinv.notes = ""};
                            vm.TDinv.comments = data.comments;
                            if(vm.TDinv.comments == "-"){vm.TDinv.comments = ""};
                            vm.TDinv.shipping = data.shipping;*/

                            if (data.uploadImage.length > 0) {
                                ImageDataSynchronizer("expense/", data.uploadImage);
                            }

                            vm.TDinv.refType = "Expense";
                            vm.TDinv.refID = $state.params.Data.expenseID;

                        });
                        client.ifError(function(data) {

                        });
                        client.uniqueID($state.params.Data.expenseID); // send projectID as url parameters
                        client.postReq();
                        debugger;
                        if ($state.params.Data.type == "contact") {
                            setCustomer($state.params.Data.profileId);
                        }
                    }
                    //End loading Expense

                    //Start loading project
                    if ($state.params.appName == "project") {
                        debugger;
                        vm.backState = 'app.projects.pro';
                        if ($state.params.Data.profileId != undefined && $state.params.Data.profileId != "-1") {
                            setCustomer($state.params.Data.profileId);
                        }
                        var client = $serviceCall.setClient("getProjectBillData", "project");
                        client.ifSuccess(function(data) {
                            debugger;
                            console.log(data);

                            for (var i = 0; i < data.billItems.length; i++) {
                                ProjectProductCheckBillItems(function(data) {
                                    debugger;
                                }, "project-" + data.billItems[i].product, data);
                            }

                            for (var i = 0; i < data.expenseItem.length; i++) {
                                ProjectProductCheckExpenseItem(function(data) {
                                    debugger;
                                }, "project-" + data.expenseItem[i].product, data);
                            }

                            vm.TDinv.comments = "Project: " + $state.params.Data.billID;
                            /*vm.TDinv.paymentTerm = data.paymentTerm;
                            vm.TDinv.notes = data.notes;
                            if(vm.TDinv.notes == "-"){vm.TDinv.notes = ""};
                            vm.TDinv.comments = data.comments;
                            if(vm.TDinv.comments == "-"){vm.TDinv.comments = ""};
                            vm.TDinv.shipping = data.shipping;*/



                            vm.TDinv.refType = "Project";
                            vm.TDinv.refID = $state.params.Data.billID;

                        });
                        client.ifError(function(data) {

                        });
                        client.billID($state.params.Data.billID); // send projectID as url parameters
                        client.getReq();

                        if ($state.params.Data.type == "contact") {
                            setCustomer($state.params.Data.profileId);
                        }
                    }
                    //End loading project
                }
            }
        }

        function ProjectProductCheckExpenseItem(callback, productCode, data) {
            var JSON_para = {
                "where": "productCode = '" + productCode + "' "
            };
            debugger;
            var client = $serviceCall.setClient("getAllByQuery", "product");
            client.ifSuccess(function(Result_data) {
                debugger;

                if (data != null && Result_data.result.length == 0) // if new product
                {
                    var productOBJ = {
                        "productCategory": "Product",
                        "productCode": "",
                        "productUnit": "Each",
                        "productName": "",
                        "uploadBrochure": [],
                        "uploadImages": [],
                        "brand": "",
                        "costPrice": 0,
                        "customFields": [],
                        "date": "",
                        "deleteStatus": false,
                        "description": "",
                        "favouriteStar": false,
                        "favouriteStarNo": 1,
                        "inventoryEnabled": "No",
                        "inventory": "No",
                        "productPrice": "",
                        "productTax": {},
                        "progressShow": false,
                        "status": "Temporary",
                        "stockLevel": 0,
                        "tags": [],
                        "lastTranDate": "",
                        "productLog": {},
                        "productID": "",
                        "createDate": new Date(),
                        "modifyDate": new Date(),
                        "createUser": "",
                        "modifyUser": "",
                        "baseCurrency": ""
                    }

                    productOBJ.deleteStatus = true;
                    productOBJ.productName = data.expenseItem[0].product;
                    productOBJ.productPrice = data.expenseItem[0].price;
                    productOBJ.productTax = data.expenseItem[0].expenseTax;
                    productOBJ.productCode = "project-" + data.expenseItem[0].product;
                    var aditionalData = {};
                    aditionalData.quantity = data.expenseItem[0].quantity;
                    aditionalData.total = data.expenseItem[0].total;
                    createProductfromOtherApp(function() {
                        callBack(true);
                    }, productOBJ, aditionalData);
                } else // if existing product
                { //Result_data.result[0].productPrice
                    InvoiceService.setFullArr({
                        invoiceNo: "",
                        productID: Result_data.result[0].productID,
                        productName: Result_data.result[0].productName,
                        price: data.expenseItem[0].price,
                        quantity: data.expenseItem[0].quantity,
                        productUnit: 'Each',
                        discount: 0,
                        tax: data.expenseItem[0].expenseTax,
                        olp: undefined,
                        amount: data.expenseItem[0].total,
                        status: "Temporary"
                    });
                    callBack(true);
                }

            });
            client.ifError(function(data) {
                callBack(false);
            });
            client.postReq(JSON_para);
        }

        function ProjectProductCheckBillItems(callback, productCode, data) {
            var JSON_para = {
                "where": "productCode = '" + productCode + "' "
            };
            var client = $serviceCall.setClient("getAllByQuery", "product");
            client.ifSuccess(function(Result_data) {
                debugger;

                if (data != null && Result_data.result.length == 0) // if new product
                {
                    var productOBJ = {
                        "productCategory": "Product",
                        "productCode": "",
                        "productUnit": "Each",
                        "productName": "",
                        "uploadBrochure": [],
                        "uploadImages": [],
                        "brand": "",
                        "costPrice": 0,
                        "customFields": [],
                        "date": "",
                        "deleteStatus": false,
                        "description": "",
                        "favouriteStar": false,
                        "favouriteStarNo": 1,
                        "inventoryEnabled": "No",
                        "inventory": "No",
                        "productPrice": "",
                        "productTax": {},
                        "progressShow": false,
                        "status": "Temporary",
                        "stockLevel": 0,
                        "tags": [],
                        "lastTranDate": "",
                        "productLog": {},
                        "productID": "",
                        "createDate": new Date(),
                        "modifyDate": new Date(),
                        "createUser": "",
                        "modifyUser": "",
                        "baseCurrency": ""
                    }

                    productOBJ.deleteStatus = true;
                    productOBJ.productName = data.billItems[0].product;
                    productOBJ.productPrice = data.billItems[0].price;
                    productOBJ.productTax = {
                        taxName: "No Tax",
                        activate: "True",
                        compound: "False",
                        rate: "0",
                        type: "individualtaxes",
                        ID: "0",
                        individualTaxes: ""
                    };//data.tax;
                    productOBJ.productCode = "project-" + data.billItems[0].product;
                    var aditionalData = {};
                    aditionalData.quantity = data.billItems[0].quantity;
                    aditionalData.total = data.billItems[0].total;
                    createProductfromOtherApp(function() {
                        callBack(true);
                    }, productOBJ, aditionalData);
                } else // if existing product
                {
                    InvoiceService.setFullArr({
                        invoiceNo: "",
                        productID: Result_data.result[0].productID,
                        productName: Result_data.result[0].productName,
                        price: data.billItems[0].price,
                        quantity: data.billItems[0].quantity,
                        productUnit: 'Each',
                        discount: 0,
                        tax: Result_data.result[0].productTax,
                        olp: undefined,
                        amount: data.billItems[0].total,
                        status: "Temporary"
                    });
                    callBack(true);
                }

            });
            client.ifError(function(data) {
                callBack(false);
            });
            client.postReq(JSON_para);
        }

        function ExpenceProductCheck(callback, productCode, data) {
            console.log($state.params.Data.taxIncludeWithExpense);



            var JSON_para = {
                "where": "productCode = '" + productCode + "' "
            };
            var client = $serviceCall.setClient("getAllByQuery", "product");
            client.ifSuccess(function(Result_data) {
                debugger;

                if (data != null && Result_data.result.length == 0) // if new product
                {
                    var productOBJ = {
                        "productCategory": "Product",
                        "productCode": "",
                        "productUnit": "Each",
                        "productName": "",
                        "uploadBrochure": [],
                        "uploadImages": [],
                        "brand": "",
                        "costPrice": 0,
                        "customFields": [],
                        "date": "",
                        "deleteStatus": false,
                        "description": "",
                        "favouriteStar": false,
                        "favouriteStarNo": 1,
                        "inventoryEnabled": "No",
                        "inventory": "No",
                        "productPrice": "",
                        "productTax": {},
                        "progressShow": false,
                        "status": "Temporary",
                        "stockLevel": 0,
                        "tags": [],
                        "lastTranDate": "",
                        "productLog": {},
                        "productID": "",
                        "createDate": new Date(),
                        "modifyDate": new Date(),
                        "createUser": "",
                        "modifyUser": "",
                        "baseCurrency": ""
                    }

                    productOBJ.deleteStatus = true;
                    productOBJ.productName = data.category;
                    if (!$state.params.Data.taxIncludeWithExpense) {
                        debugger;
                        productOBJ.productPrice = data.amount;
                    } else {
                        debugger;
                        productOBJ.productPrice = data.totalValue;
                    }
                    // productOBJ.productPrice = data.amount;

                    console.log(data.tax);

                    productOBJ.productTax = {
                        taxName: "No Tax",
                        activate: "True",
                        compound: "False",
                        rate: "0",
                        type: "individualtaxes",
                        ID: "0",
                        individualTaxes: ""
                    }
                    // if(!$state.params.Data.taxIncludeWithExpense){

                    // }
                    // else{
                    //     productOBJ.productTax = data.tax;
                    // }

                    productOBJ.productCode = "expense-" + data.category;
                    var aditionalData = {};
                    aditionalData.quantity = 1;

                    //check billing include tax true or false...
                    debugger;
                    if (!$state.params.Data.taxIncludeWithExpense) {
                        aditionalData.total = data.amount;
                    } else {
                        debugger;
                        aditionalData.total = data.totalValue;
                    }

                    productOBJ.productPrice = data.amount;
                    productOBJ.productTax = data.tax;

                    createProductfromOtherApp(function() {
                        callBack(true);
                    }, productOBJ, aditionalData);
                } else // if existing product
                {
                    Result_data.result[0].productTax = {
                        taxName: "No Tax",
                        activate: "True",
                        compound: "False",
                        rate: "0",
                        type: "individualtaxes",
                        ID: "0",
                        individualTaxes: ""
                    }

                    if (!$state.params.Data.taxIncludeWithExpense) {
                        Result_data.result[0].productPrice = data.amount
                    } else {
                        Result_data.result[0].productPrice = data.totalValue;
                    }

                    debugger;
                    InvoiceService.setFullArr({
                        invoiceNo: "",
                        productID: Result_data.result[0].productID,
                        productName: Result_data.result[0].productName,
                        price: Result_data.result[0].productPrice,
                        quantity: 1,
                        productUnit: 'Each',
                        discount: 0,
                        tax: Result_data.result[0].productTax,
                        olp: undefined,
                        amount: Result_data.result[0].productPrice,
                        status: "Temporary"
                    });
                }

            });
            client.ifError(function(data) {
                callBack(false);
            });
            client.postReq(JSON_para);
        }

        function createProductfromOtherApp(callback, Product_data, aditionalData) {
            debugger;

            vm.showMsg = false;

            vm.prod = angular.copy(Product_data);
            console.log(vm.prod);

            var productData = Product_data;
            
            productData.deleteStatus = false;

            productData.todaydate = new Date();
            productData.productLog = {
                userName: "",
                lastTranDate: new Date(),
                description: "Product Added By",
                productCode: "",
                productNum: "",
                UIHeight: '30px;',
                type: "activity",
                status: "Temporary",
                createDate: new Date(),
                modifyDate: new Date(),
                createUser: "",
                modifyUser: "",
                logID: "-888",
                productID: ""
            };

            var product = {
                "product": productData,
                "image": [],
                "appName": 'Products',
                'permissionType': 'add'
            };
            var stringObj = JSON.stringify(product);

            var client = $serviceCall.setClient("insertProduct", "process");
            client.ifSuccess(function(product_data) {
                debugger;
                if (vm.showMsg == true) {
                    $mdToast.show(
                        $mdToast.simple()
                        .textContent('Product saved successfully')
                        .position('top right')
                        .hideDelay(3000)
                    )

                    callBack(true);

                }

                console.log(vm.prod);
                if (aditionalData != {}) // if call is from project app
                {
                    InvoiceService.setFullArr({
                        invoiceNo: "",
                        productID: product_data.ID,
                        productName: vm.prod.productName,
                        price: vm.prod.productPrice,
                        quantity: aditionalData.quantity,
                        productUnit: 'Each',
                        discount: 0,
                        tax: vm.prod.productTax,
                        olp: undefined,
                        amount: aditionalData.total,
                        status: "Temporary"
                    });
                } else // if call is from estimate app
                {
                    InvoiceService.setFullArr({
                        invoiceNo: "",
                        productID: product_data.ID,
                        productName: vm.prod.productName,
                        price: vm.prod.productPrice,
                        quantity: 1,
                        productUnit: 'Each',
                        discount: 0,
                        tax: vm.prod.productTax,
                        olp: undefined,
                        amount: vm.prod.productPrice,
                        status: "Temporary"
                    });
                }
                //updateDueDates();
                callBack(true);
            });
            client.ifError(function(product_data) {
                callBack(false);
                $mdToast.show(
                    $mdToast.simple()
                    .textContent('Error saving product')
                    .position('top right')
                    .hideDelay(3000)
                );
            });
            client.postReq(stringObj);
        }

        function setCustomer(profileID) {
            debugger;
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

        function ImageDataSynchronizer(FromApp, ImageArray) {

            if (ImageArray.type == "brochure") {
                var Path = $setUrl.brochurePath + FromApp + ImageArray.uniqueCode;
                processbrochurefile(Path, ImageArray);
            }
            if (ImageArray[0].type == "image") {
                var Path = $setUrl.imagePath + FromApp + ImageArray[0].uniqueCode;
                processimagefile(Path, ImageArray[0]);
            }

        }

        function processimagefile(imageURL, imageDetails) {

            var xhr = new XMLHttpRequest();
            xhr.open('GET', imageURL, true);
            xhr.responseType = 'blob';

            xhr.onload = function(e) {
                if (this.status == 200) {
                    // Note: .response instead of .responseText
                    var blob = new Blob([this.response], {
                        type: 'image/jpeg'
                    });
                    blob.lastModified = Math.floor(Date.now() / 1000);
                    blob.lastModifiedDate = Date.now();
                    blob.name = imageDetails.name;
                    blob.uniqueCode = imageDetails.uniqueCode;
                    blob.webkitRelativePath = imageDetails.webkitRelativePath;

                    vm.imageArray.push(blob);

                }
            };
            xhr.send();

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
            debugger
            vm.currencyChangeObject = args;
            vm.TDinv.isCurrencyChanged = vm.currencyChangeObject.currencyStatus;
            vm.TDinv.changedCurrency = vm.currencyChangeObject.currencyType;
            vm.TDinv.exchangeRate = parseFloat(vm.currencyChangeObject.exchangeRate);
            vm.ship = parseFloat(vm.TDinv.shipping / vm.currencyChangeObject.exchangeRate);

            // var productCopyArr = angular.copy(InvoiceService.getArry());
            // var prodArray = [];
            // prodArray = InvoiceService.getArry();
            // for (var i = prodArray.val.length - 1; i >= 0; i--) {
            //     InvoiceService.ReverseTax(prodArray.val[i], 1);
            //     InvoiceService.removeArray(prodArray.val[i], 1);
            // }
            // for (var i = productCopyArr.val.length - 1; i >= 0; i--) {
            //     InvoiceService.setFullArr({
            //         productName: productCopyArr.val[i].productName,
            //         price: parseFloat((productCopyArr.val[i].price) / vm.currencyChangeObject.exchangeRate),
            //         quantity: productCopyArr.val[i].quantity,
            //         productUnit: productCopyArr.val[i].productUnit,
            //         discount: productCopyArr.val[i].discount,
            //         tax: productCopyArr.val[i].tax,
            //         olp: productCopyArr.val[i].olp,
            //         amount: parseFloat((productCopyArr.val[i].amount) / vm.currencyChangeObject.exchangeRate),
            //         status: productCopyArr.val[i].status
            //     })
            // }
            getCurrencyDetails(vm.TDinv); //for add product ditective
        });

        $scope.$on('$destroy', function() {
            switchCurrency();
            addProduct();
        });


        function processbrochurefile(brochureURL, imageDetails) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', brochureURL, true);
            xhr.responseType = 'blob';

            xhr.onload = function(e) {
                if (this.status == 200) {
                    // Note: .response instead of .responseText
                    var blob = new Blob([this.response], {
                        type: 'application/pdf'
                    });
                    blob.lastModified = Math.floor(Date.now() / 1000);
                    blob.lastModifiedDate = Date.now();
                    blob.name = imageDetails.name;
                    blob.uniqueCode = imageDetails.uniqueCode;
                    blob.webkitRelativePath = imageDetails.webkitRelativePath;

                    vm.imageArray.push(blob);
                }
            };
            xhr.send();
        }


        //var LoginName = $auth.getSession().Name;
        var LoginName = "sddfsdfs";

        //invoice Obj
        vm.TDinv = {
            "invoiceNo": "",
            "baseCurrency": "",
            "changedCurrency": "",
            "CountryOfchangedCurrency": "",
            "isCurrencyChanged": false,
            "customFields": [],
            "deleteStatus": false,
            "displayShippingAddress": "",
            "email": "",
            "multiDueDates": [],
            "profileID": "",
            "profileName": "",
            "startDate": "",
            "uploadImages": [],
            "allowPartialPayments": "",
            "billingAddress": [],
            "comments": "",
            "notes": "",
            "invoiceLog": {},
            "discountAmount": 0,
            "dueDate": "",
            "discountPercentage": 0, //saves the dicount
            "favouriteStar": false,
            "favouriteStarNo": 1,
            "subTotal": "",
            "netAmount": "",
            "paymentMethod": "",
            "invoiceLines": [],
            "tags": [],
            "salesTaxAmount": 0,
            "shipping": "",
            "shippingAddress": [],
            "taxAmounts": [],
            "status": "Invoice",
            "peymentTerm": "",
            "paymentType": "",
            "lastTranDate": new Date(),
            "createDate": new Date(),
            "modifyDate": new Date(),
            "createUser": LoginName,
            "modifyUser": LoginName,
            "poNumber": "",
            "pattern": "",
            "sendMail": false,
            "viewed": false,
            "lastEmailDate": "",
            "invoiceStatus": "Unpaid",
            "discountTerm": "Individual Items",
            "recurringInvoiceID": "0",
            "contactNo": "",
            "fax": "",
            "mobileNo": "",
            "balanceDue": 0,
            "paid": 0,
            "emailCustomerUponSavingInvoice": false,
            "pdfInvoiceAttachment": false,
            "website": "",
            "refType": "",
            "refID": ""
        };

        vm.TDinv.billingAddress = {
            "city": "",
            "country": "",
            "zip": "",
            "state": "",
            "street": ""
        }

        vm.TDinv.shippingAddress = {
            "s_city": "",
            "s_street": "",
            "s_zip": "",
            "s_state": "",
            "s_country": ""
        }
        checkParams();

        vm.TDinv.startDate = new Date();
        vm.TDinv.shipping = parseFloat(0);
        vm.TDinv.exchangeRate = 1;
        vm.paymentMethod = [];
        vm.checkpayments = [];


        vm.paymentMethod.push({
            paymentmethod: 'Allow online and offline',
            paymentType: 'Offline',
            activate: "Active"
        })
        vm.TDinv.paymentMethod = "Allow online and offline";
        vm.paymentMethod.push({
            paymentmethod: 'Offline Payments Only',
            paymentType: 'Offline',
            activate: "Active"
        })

        //load all the settings data
        function loadSettings() {
            var settings = $serviceCall.setClient("getAllByQuery", "setting");
            settings.ifSuccess(function(data) {
                vm.settings = data;
                if (data[0].preference.invoicePref.enableShipping != undefined) {
                    vm.enableShipping = data[0].preference.invoicePref.enableShipping;
                }
                vm.TDinv.createCompanyName = data[0].profile.companyName
                assignSettigsData(data);
            });
            settings.ifError(function(data) {

            });
            settings.postReq({
                "setting": "profile,payments,taxes",
                "preference": "invoicePref,paymentPref,productPref,inventoryPref"
            })
        }

        // assign settings data to fields
        function assignSettigsData(val) {

            //Start added by dushmantha

            vm.TDinv.pdfInvoiceAttachment = val[0].preference.invoicePref.pdfInvoiceAttachment;

            vm.TDinv.customFields = val[0].preference.invoicePref.cusFiel;
            //Start push property for ng-model data
            for (var i = 0; i <= vm.TDinv.customFields.length - 1; i++) {
                vm.TDinv.customFields[i]['value'] = "";
            }
            //End push property for ng-model data
            //End added by dushmantha

            vm.Invprefix = val[0].preference.invoicePref.invoicePrefix;
            vm.Invsequence = val[0].preference.invoicePref.invoiceSequence;
            vm.TDinv.notes = val[0].preference.invoicePref.defaultNote;
            if (vm.TDinv.comments == "") {
                vm.TDinv.comments = val[0].preference.invoicePref.defaultComment;
            }
            var grnPrefix = val[0].preference.inventoryPref.ginPrefix;
            var ginSequence = val[0].preference.inventoryPref.ginSequence;
            vm.ginPattern = grnPrefix + ginSequence;
            loadInvNo();

            vm.TDinv.peymentTerm = val[0].preference.invoicePref.defaultPaymentTerms;
            vm.enableShippingCharges = val[0].preference.invoicePref.enableShipping;
            vm.TDinv.allowPartialPayments = val[0].preference.invoicePref.allowPartialPayments;
            vm.TDinv.baseCurrency = val[0].profile.baseCurrency;
            
            if (!vm.TDinv.isCurrencyChanged) {
              vm.TDinv.changedCurrency = val[0].profile.baseCurrency;
            }

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
                    paymentType: 'Offline',
                    activate: "Active"
                })
            }
            loadcurrentCurrencyModelData();
            loadCurrency();
        }

        //_______________change  due date according to the payment term
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
                //vm.TDinv.dueDate = "";
                vm.showdate = false;
            }
        });

        $scope.$watch("vm.TDinv.peymentTerm", function() {
            if (vm.TDinv.peymentTerm == "multipleDueDates") {
                //$rootScope.termType = "multipleDueDates"
                vm.showdate = true;
            }
        });

        function addDueDate() {
            vm.TDinv.peymentTerm = "Custom"
        }

        //________get invoice products from invoiceService Factory
        ProductArray = InvoiceService.getArry();

        //______open MultidueDates popup
        function MultiDuDates() {
            if (ProductArray.val.length >= 1) {
                $mdDialog.show({
                    templateUrl: 'app/main/invoices/dialogs/multiDueDates/MultiDueDates.html',
                    controller: 'InvomultiDueDatesCtrl',
                    controllerAs: 'vm',
                    currency: vm.TDinv.changedCurrency,
                    locals: {
                        item: vm.famount,
                        invoice: vm.TDinv
                    }
                })
            } else {
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
                    vm.TDinv.peymentTerm = tt;
                }, function() {});

            }
        }

        function toggleChildStates(toggledState) {
            $state.go(toggledState);
        };

        //================change address(toggle from blling address to shipping)============================
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
        //______Initially load 10 customers______________________________
        function loadAll() {
            loaDCus({
                where: "status = 'Active' and deleteStatus = false"
            })
        }
        //______load customers according to the search criteria_____________
        //in this it will check the type letters with either profile name or email
        vm.enter = function(val) {
            loaDCus({
                where: "status = 'Active' and deleteStatus = false and (profileName LIKE" + "'" + val + "%' OR email LIKE" + "'" + val + "%')"
            })
        }

        //______once the profile name is selcted fill up the profile data_______
        function selectedItemChange(obj) {

            //Start informe profile popup diective that new profile hasbeen selected;
            vm.customerEditdetails = {};
            vm.customerEditdetails = obj.value;
            //End informe profile popup diective that new profile hasbeen selected;


            vm.Billingaddress = true;
            vm.Shippingaddress = false;
            console.log(obj)
            if (vm.selectedItem1 == null || vm.selectedItem1.value.length == 0) {
                vm.showEditCustomer = false;
                vm.TDinv.billingAddress = "";
                vm.TDinv.shippingAddress = "";
                vm.TDinv.contactNo = "";
                vm.TDinv.email = "";
                vm.TDinv.fax = "";
                vm.TDinv.mobileNo = "";
            } else {

                vm.ObjbillingAddress = AddressService.setAddress(obj.value.profileName, obj.value.billingAddress.street, obj.value.billingAddress.city, obj.value.billingAddress.state, obj.value.billingAddress.zip, obj.value.billingAddress.country, obj.value.phone, obj.value.mobile, obj.value.fax, obj.value.email, obj.value.website);
                vm.ObjshippingAddress = AddressService.setAddress(obj.value.profileName, obj.value.shippingAddress.s_street, obj.value.shippingAddress.s_city, obj.value.shippingAddress.s_state, obj.value.shippingAddress.s_zip, obj.value.shippingAddress.s_country, obj.value.phone, obj.value.mobile, obj.value.fax, obj.value.email, obj.value.website);
                vm.ActiveAddressObj = vm.ObjbillingAddress;

                if (obj.value) {
                    vm.showEditCustomer = true;
                    vm.TDinv.profileName = obj.value.profileName;
                    vm.TDinv.email = obj.value.email;
                    vm.TDinv.profileID = obj.value.profileID;
                    vm.TDinv.contactNo = obj.value.phone;
                    vm.TDinv.fax = obj.value.fax;
                    vm.TDinv.mobileNo = obj.value.mobile;
                    vm.TDinv.billingAddress = obj.value.billingAddress;
                    vm.TDinv.shippingAddress = obj.value.shippingAddress;
                    vm.TDinv.website = obj.value.website;
                }
            }
        };
        //____________Load next Invoice No_________
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

        

        function updateMultiDueDate() {
            var mulduedates = invoiceMultipleDueDatesService.getArry();
            debugger
            if (mulduedates.val.length > 0) {
                vm.testarr = angular.copy(mulduedates.val);
                invoiceMultipleDueDatesService.removeAllTheDates(0);
                for (var i = 0; i <= vm.testarr.length - 1; i++) {
                    var latestDueprice = parseFloat((vm.famount * vm.testarr[i].percentage) / 100); // removed by dushmantha .toFixed(2) 7_19
                    vm.testarr[i].dueDatePrice = latestDueprice;
                    invoiceMultipleDueDatesService.setDateArray(vm.testarr[i])
                }
            }
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

        //get atx array from InvoiceServicefactory
        vm.taxArray = InvoiceService.getTaxArr();

        //return subtotal from InvoiceService
        function calculatetotal() {
            vm.total = InvoiceService.calculateTotal();
            vm.taxArray = InvoiceService.getTaxArr();
            CalculateTax();
            finalamount();
        }

        //return tax calculation from InvoiceService
        function CalculateTax() {
            vm.salesTax = InvoiceService.calculateTax();
        }
        //return net amount from InvoiceService     
        function finalamount() {
            vm.TDinv.shipping = parseFloat(vm.ship * vm.TDinv.exchangeRate)
            vm.famount = InvoiceService.calculateNetAMount(vm.ship * vm.TDinv.exchangeRate);
        };

        function submit() {
                var pc1 = 0;
            if (vm.TDinv.peymentTerm == "multipleDueDates") {
                var tempmultiDueDates = invoiceMultipleDueDatesService.getArry();

                
                var percentageCount = 0;
                for (var i = tempmultiDueDates.val.length - 1; i >= 0; i--) {
                    
                    percentageCount += tempmultiDueDates.val[i].percentage;
                }
                if(percentageCount != 100)
                {
                    $mdDialog.show(
                        $mdDialog.alert()
                        .parent(angular.element(document.body))
                        .title('Alert')
                        .content('Select due dates to cover total amount')
                        .ok('OK')
                        .targetEvent()
                    );
                    vm.spinnerService.hide('inv-compose-spinner');
                    return;
                }
            }

             vm.spinnerService.show('inv-compose-spinner');
            debugger;
            var startDate_copy = angular.copy(vm.TDinv.startDate);
            var dueDate_copy = angular.copy(vm.TDinv.dueDate);
            startDate_copy.setHours(0,0,0,0);
            dueDate_copy.setHours(0,0,0,0);

            if(startDate_copy > dueDate_copy)
            {
                $mdDialog.show(
                    $mdDialog.alert()
                    .parent(angular.element(document.body))
                    .title('Alert')
                    .content('Select a due date greater than or equal to invoice date')

                    .ok('OK')
                    .targetEvent()
                );
                vm.spinnerService.hide('inv-compose-spinner');
                return;
            }

            if (vm.selectedItem1 == null || vm.selectedItem1.value == undefined) {
                $mdDialog.show(
                    $mdDialog.alert()
                    .parent(angular.element(document.body))
                    .title('Alert')
                    .content('Select a customer')
                    .ok('OK')
                    .targetEvent()
                );
                vm.spinnerService.hide('inv-compose-spinner');
            } else {
                if (vm.TDinv.profileID != "") {
                    if (ProductArray.val.length > 0) {
                        if (vm.TDinv.peymentTerm != "" || vm.TDinv.peymentTerm != undefined) {

                            //Start fill vm.TDinv.customFields for saving
                            var hasValuelSet = false;
                            vm.TDinv.customFields.forEach(function(v) {
                                delete v.fields;
                                delete v.$$hashKey;
                                if (v.value != "") {
                                    hasValuelSet = true;
                                }
                            });
                            if (hasValuelSet == false) {
                                vm.TDinv.customFields = [];
                            }
                            //End fill vm.TDinv.customFields for saving

                            if (vm.imageArray.length > 0) {
                                for (var indexx = 0; indexx < vm.imageArray.length; indexx++) {

                                    if (vm.imageArray[0].type == "application/pdf") {
                                        vm.type = "brochure";
                                    }

                                    if (vm.imageArray[0].type == "image/jpeg" || vm.imageArray[0].type == "image/png") {
                                        vm.type = "image";
                                    }


                                    vm.watingforServiceResponse = true;
                                    vm.TDinv.uploadImages = [];
                                    var client = $imageUploader.setImage(vm.imageArray[indexx].uniqueCode, 'invoice');
                                    client.ifSuccess(function(data) {
                                        vm.watingforServiceResponse = false;
                                        // vm.TDinv.uploadImages = vm.imageArray;
                                        // vm.TDinv.uploadImages[0].type = vm.type;
                                        // vm.TDinv.uploadImages[0].name = 'invoice';
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
                                    client.ifError(function(data) {
                                        vm.watingforServiceResponse = false;
                                        vm.spinnerService.hide('inv-compose-spinner');
                                    });
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
                                vm.watingforServiceResponse = true;
                                successSubmit();
                            }

                        } else {
                            $mdDialog.show(
                                $mdDialog.alert()
                                .parent(angular.element(document.body))
                                .title('Alert')
                                .content('Select a payment term')
                                .ok('OK')
                                .targetEvent()
                            );
                            vm.spinnerService.hide('inv-compose-spinner');
                        }
                    } else {
                        $mdDialog.show(
                            $mdDialog.alert()
                            .parent(angular.element(document.body))
                            .title('Alert')
                            .content('Add a line item')
                            .ok('OK')
                            .targetEvent()
                        );
                        vm.spinnerService.hide('inv-compose-spinner');
                    }
                } else {
                    $mdDialog.show(
                        $mdDialog.alert()
                        .parent(angular.element(document.body))
                        .title('Alert')
                        .content('Select a customer')
                        .ok('OK')
                        .targetEvent()
                    );
                    vm.spinnerService.hide('inv-compose-spinner');
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

        function popupEmailDialog(invoiceData, profData, settings) {
            $mdDialog.show({
                templateUrl: 'app/main/invoices/dialogs/email/email.html',
                controller: 'InvoemailCtrl',
                controllerAs: 'vm',
                locals: {
                    item: invoiceData,
                    profData: profData,
                    template: 'T_EMAIL_INV_NEWMAIL',
                    type: 'invoice',
                    amount: '',
                    settings: settings
                }
            }).then(function(data) {

            }, function(data) {

            })
        }

        function successSubmit() {

            if (vm.settings[0].preference.invoicePref.emailCustomerUponSavingInvoice == true &&
                vm.settings[0].preference.invoicePref.emailCustomerOption == "Send email in background") {
                vm.TDinv.emailCustomerUponSavingInvoice = true;
            }

            reverseBackBasecurrency();
            if (vm.TDinv.peymentTerm == "multipleDueDates") {
                var multiDueDates = invoiceMultipleDueDatesService.getArry();
                for (var i = multiDueDates.val.length - 1; i >= 0; i--) {
                    vm.TDinv.multiDueDates.push({
                        dueDate: multiDueDates.val[i].dueDate,
                        percentage: multiDueDates.val[i].percentage,
                        dueDatePrice: parseFloat(multiDueDates.val[i].dueDatePrice),
                        paymentStatus: 'Unpaid',
                        balance: parseFloat(multiDueDates.val[i].balance),
                        paidAmount: 0
                    });
                }
                console.log(vm.TDinv.multiDueDates)
            } else {
                vm.TDinv.multiDueDates = [{
                    dueDate: vm.TDinv.dueDate,
                    percentage: "100",
                    dueDatePrice: parseFloat(vm.famount),
                    paymentStatus: 'Unpaid',
                    balance: parseFloat(vm.famount),
                    paidAmount: 0
                }];

            }

            //push customer fields only value not null.............
            vm.customFields = [];

            for (var i = 0; vm.TDinv.customFields.length > i; i++) {
                if (vm.TDinv.customFields[i].value != "") {
                    vm.customFields.push(vm.TDinv.customFields[i]);
                }
            };
            vm.TDinv.customFields = vm.customFields;


            vm.TDinv.discountPercentage = 0;

            vm.TDinv.invoiceNo = "-999";
            vm.TDinv.status = "Invoice";
            vm.TDinv.subTotal = parseFloat(vm.total);
            vm.TDinv.netAmount = parseFloat(vm.famount);
            vm.TDinv.balanceDue = parseFloat(vm.famount);
            vm.TDinv.discountAmount = 0;
            vm.TDinv.salesTaxAmount = parseFloat(vm.salesTax);
            vm.TDinv.invoiceStatus = "Unpaid";
            vm.TDinv.pattern = vm.Invprefix + vm.Invsequence;
            // vm.TDinv.shipping = vm.ship * vm.TDinv.exchangeRate;


            vm.TDinv.invoiceLines = ProductArray.val;
            // vm.TDinv.taxAmounts = [];

            vm.TDinv.taxAmounts = vm.taxArray;

            var Invoice = {
                "invoice": vm.TDinv,
                "image": vm.TDinv.uploadImages,
                "permissionType": "add",
                "appName": "Invoices",
                "invSequence": vm.ginPattern,
                "companyName": vm.settings[0].profile.companyName
            };
            var jsonString = JSON.stringify(Invoice);

            var client = $serviceCall.setClient("createInvoice", "process");
            client.ifSuccess(function(data) {
                vm.watingforServiceResponse = false;
                vm.TDinv.invoiceNo = data.ID;
                $state.go('app.invoices.inv.detailView', {
                    itemId: vm.TDinv.invoiceNo
                });

                $mdToast.show(
                    $mdToast.simple()
                    .textContent('Invoice ' + data.ID + ' successfully saved')
                    .position('top right')
                    .hideDelay(3000)
                );
                 vm.spinnerService.hide('inv-compose-spinner');

                console.log("Going to clear multi due dates");
                var multiDueDates = invoiceMultipleDueDatesService.getArry();
                var catchDateArr = invoiceMultipleDueDatesService.clearInvoiceMultiDateArray();
                console.log("due dates cleared");
                if (vm.settings[0].preference.invoicePref.emailCustomerOption == 'Display pop up and prompt' &&
                    vm.settings[0].preference.invoicePref.emailCustomerUponSavingInvoice == true) {
                    popupEmailDialog(vm.TDinv, vm.settings[0].profile, vm.settings);
                }

            });
            client.ifError(function(data) {
                 vm.spinnerService.hide('inv-compose-spinner');
                vm.watingforServiceResponse = false;

                if (data.data.message == undefined || data.data.message.includes("Unexpected token")) {

                    $mdDialog.show(
                        $mdDialog.alert()
                        .parent(angular.element(document.body))
                        .title('Error')
                        .content('Error saving invoice')
                        .ok('OK')
                        .targetEvent()
                    );

                } else {
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

        function deleteProduct(prod, index) { 
            //InvoiceService.ReverseTax(prod, ProductArray); // commented by dushmantha
            InvoiceService.removeTax(prod, ProductArray);
            InvoiceService.removeArray(prod,index);
            calculatetotal();
            if (vm.TDinv.peymentTerm == "multipleDueDates") {
                updateMultiDueDate();
            }
        }

        

        vm.cancel = function(ev) {

            if (vm.selectedItem1 == null || vm.selectedItem1.value == undefined) {
                $state.go('app.invoices.inv');
            } else {
                var confirm = $mdDialog.confirm()
                    .title('Save invoice as draft?')
                    .content('')
                    .ariaLabel('Lucky day')
                    .targetEvent(ev)
                    .ok('save')
                    .cancel('cancel');
                $mdDialog.show(confirm).then(function() {
                    vm.TDinv.multiDueDates = [{
                        dueDate: vm.TDinv.dueDate,
                        percentage: 0,
                        dueDatePrice: vm.famount,
                        paymentStatus: 'Unpaid',
                        balance: vm.famount,
                        paidAmount: 0
                    }];

                    vm.TDinv.discountPercentage = $rootScope.adddiscount;
                    vm.TDinv.invoiceNo = "-999";
                    vm.TDinv.status = "Draft"
                    vm.TDinv.invoiceStatus = "Draft"
                    vm.TDinv.pattern = "DINV" + vm.Invsequence;
                    vm.TDinv.invoiceLines = ProductArray.val;
                    vm.TDinv.subTotal = vm.total;
                    vm.TDinv.netAmount = vm.famount;
                    vm.TDinv.discountAmount = 0;
                    vm.TDinv.salesTaxAmount = vm.salesTax;
                    vm.TDinv.taxAmounts = vm.taxArray;

                    // var Invoice = {"invoice" : vm.TDinv, "image" :[], "permissionType" : "add", "appName":"Invoices", "invSequence":"GRN001" };;
                    // var jsonString = JSON.stringify(Invoice);
                    var jsonString = JSON.stringify(vm.TDinv);

                    var client = $serviceCall.setClient("insertDraft", "invoice");
                    client.ifSuccess(function(data) {
                        $state.go('app.invoices.inv');

                        $mdToast.show(
                            $mdToast.simple()
                            .textContent('Draft invoice ' + data.ID + ' successfully saved')
                            .position('top right')
                            .hideDelay(3000)
                        );
                    });
                    client.ifError(function(data) {

                        if (data.data.message == undefined || data.data.message.includes("Unexpected token")) {

                            $mdDialog.show(
                                $mdDialog.alert()
                                .parent(angular.element(document.body))
                                .title('Error')
                                .content('Error saving draft invoice')
                                .ok('OK')
                                .targetEvent()
                            );

                        } else {
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
                }, function() {
                    $state.go('app.invoices.inv');
                })
            }
        }

        function addShipping(val) {
            finalamount()
        }

        //_______Add Contact Pop up____________________
        vm.addContact = addContact;

        function addContact() {
            $mdDialog.show({
                templateUrl: 'app/main/invoices/dialogs/contact/addContact.html',
                controller: 'InvoaddCusCtrl',
                controllerAs: 'vm'
            }).then(function(data) {
                var data = data;
                assignCusData(data); //parse data which gets from contact controller to 
                //assign in this controller
            }, function(data) {

            })
        };

        //__once teh add contact pop up will close this function will get called.
        //in this it will create a object and call  selectedItemChange function to assign profile data.
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

        //_____Open the pop for edit contact_________
        vm.editContact = editContact;

        function editContact(val) {

            $mdDialog.show({
                templateUrl: 'app/main/invoices/dialogs/contact/addContact.html',
                controller: 'InvoeditCusCtrl',
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
        //=========================Open up a pop up for currency change========================================
        vm.changeCurrency = changeCurrency;

        function changeCurrency() {

            var currencyOBj = {
                baseCurrency: vm.TDinv.baseCurrency,
                currencyChanged: vm.TDinv.isCurrencyChanged,
                changedCurrency: vm.TDinv.changedCurrency,
                exchangeRate: vm.TDinv.exchangeRate,
                CountryOfchangedCurrency: vm.TDinv.CountryOfchangedCurrency
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
                debugger;
                var data = data;
                // console.log(data)
                if (data.currencyStatus == true) {
                    vm.TDinv.isCurrencyChanged = true;
                    vm.TDinv.changedCurrency = data.currencyType;
                    vm.TDinv.exchangeRate = parseFloat(data.exchangeRate)
                    vm.TDinv.shipping = parseFloat(vm.TDinv.shipping / vm.TDinv.exchangeRate); // edited by dushmantha
                    //parseFloat((vm.TDinv.shipping/vm.TDinv.exchangeRate)*data.exchangeRate);
                    vm.TDinv.CountryOfchangedCurrency = data.CountryOfchangedCurrency;
                }
                if (data.isCurrencyReset == true) {
                    vm.TDinv.isCurrencyChanged = false;
                    vm.TDinv.changedCurrency = data.currencyType;
                    vm.TDinv.exchangeRate = parseFloat(data.exchangeRate)
                    vm.TDinv.shipping = parseFloat(vm.TDinv.shipping * data.oldExchangeRete); // edited by dushmantha
                    //parseFloat((vm.TDinv.shipping/vm.TDinv.exchangeRate)*data.exchangeRate);
                    vm.TDinv.CountryOfchangedCurrency = data.CountryOfchangedCurrency;
                }

            }, function(data) {

            })
        }

    }
    //====================================================================
    function Invoicecopy() {
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
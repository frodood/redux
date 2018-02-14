(function() {
    'use strict';

    angular
        .module('app.invoices')
        .controller('InvoiceaddProdCtrl', InvoiceaddProdCtrl)
        .controller('InvoiceeditNewProd', InvoiceeditNewProd);

    /** @ngInject */
    function InvoiceaddProdCtrl($scope, $rootScope, InvoiceService, invoiceMultipleDueDatesService, isCurrencyChanged, exchangeRate, baseCurrency, changedCurrency, $serviceCall, $mdToast, $document, $mdDialog, $mdMedia, $mdSidenav, $state) {
        var vm = this;
        debugger
        vm.cancel = cancel;
        vm.product = {};
        vm.enableTax = false;
        vm.showProduct = false;
        vm.disableProd = false;
        vm.showMsg = true;
        vm.getqty = false;
        vm.disableAddProd = false;
        vm.setqty = setqty;
        vm.setprice = setprice;
        vm.setDiscount = setDiscount;
        vm.setUOM = setUOM;
        vm.calAMount = calAMount;
        vm.setTax = setTax;
        vm.customError = "";
        vm.addproductToarray = addproductToarray;
        vm.getProdDetails = getProdDetails;
        vm.RedyToAddProduc = RedyToAddProduc;

        vm.exchangeRate = exchangeRate;
        loadSettigns();

        vm.selctedProd = null;
        vm.searchedProd = null;

        if (!isCurrencyChanged) {
            vm.baseCurrency = baseCurrency;
        } else {
            vm.baseCurrency = changedCurrency;
        }

        var cleanUpFunc = $rootScope.$on('selectedProduct', function(event, args) {

            vm.selctedProd = [];
            vm.selctedProd.dis = args.slctdProduct.productName;
            vm.selctedProd.valuep = args.slctdProduct;
            if (vm.selctedProd.dis != vm.searchedProd) {
                setProduct("selected-product")
            }
            if (isCurrencyChanged) {
                vm.selctedProd.valuep.productPrice = parseFloat((vm.selctedProd.valuep.productPrice / exchangeRate)); //removed 7_19 .toFixed(2)
            }
            selectedItemChange(args.slctdProduct.productName);
            //do something with product.
        });

        $rootScope.$on('dirupsnewprod', function(event, args) {

            vm.searchedProd = args;
            debugger;
            if (vm.selctedProd.dis != vm.searchedProd) {
                setProduct("new-product")
            }
        });

        $scope.$on('$destroy', function() {
            cleanUpFunc();
        });

        function setProduct(InputType) {
            if (InputType == "new-product") {
                vm.qty = 1; //added by dushmatha
                vm.Sqty = 1; //added by dushmatha
                vm.selctedProd = [];
                vm.promoItems = [];
                vm.promoItems.push({
                    productName: '',
                    price: '',
                    tax: '',
                    ProductUnit: "Each",
                    qty: '',
                    discount: '',
                    olp: '',
                    status: '',
                    prodID: ''
                });

                vm.SProductUnit = "Each"
                vm.Sprice = 0;
                vm.promoItems[0].tax = ({
                    taxName: "",
                    activate: "True",
                    compound: "False",
                    rate: "0",
                    type: "individualtaxes",
                    ID: "0",
                    individualTaxes: ""
                });

                vm.Stax = ({
                    taxName: "No Tax",
                    activate: "True",
                    compound: "False",
                    rate: "0",
                    type: "individualtaxes",
                    ID: "0",
                    individualTaxes: ""
                });
                vm.calAMount();
            } else if (InputType == "selected-product") {
                vm.searchedProd = null;
            }
        }

        $scope.$watch("qty", function() {
            if (vm.qty != null) {
                vm.showProduct = false;
            }
        });

        vm.qty = "";
        vm.Sqty = 1;
        vm.discount = 0;
        vm.Amount = 0;

        vm.prod = {
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
            "status": "Active",
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

        vm.promoItems = [];
        /*vm.promoItems.push({
            productName: '',
            price: 0,
            tax: '',
            ProductUnit: "Each",
            qty: 1,
            discount: '',
            olp: '',
            status: '',
            prodID : ''
        });*/ //multiline commente added by dushmantha
        //start added by dushmantha
        vm.promoItems.push({
            productName: '',
            price: '',
            tax: '',
            ProductUnit: "Each",
            qty: 1,
            discount: '',
            olp: '',
            status: '',
            prodID: ''
        });
        //end added by dushmantha

        vm.SProductUnit = "Each"
        vm.Sprice = 0;
        /*vm.promoItems[0].tax = ({
                    taxName: "No Tax",
                    activate: "True",
                    compound: "False",
                    rate: "0",
                    type: "individualtaxes",
                    ID:"0",
                    individualTaxes:""
                });*/ //multiline commente added by dushmantha
        //start added by dushmantha
        vm.promoItems[0].tax = ({
            taxName: "",
            activate: "True",
            compound: "False",
            rate: "0",
            type: "individualtaxes",
            ID: "0",
            individualTaxes: ""
        });
        //end added by dushmantha


        vm.Stax = ({
            taxName: "No Tax",
            activate: "True",
            compound: "False",
            rate: "0",
            type: "individualtaxes",
            ID: "0",
            individualTaxes: ""
        });

        //=========================Load Settigs=========================================
        vm.taxes = [];
        vm.UnitOfMeasure = [];
        vm.enableTax = false;
        vm.displayDiscountLine = true;

        function loadSettigns() {
            var settings = $serviceCall.setClient("getAllByQuery", "setting");
            settings.ifSuccess(function(data) {
                addSettigsData(data);
            });
            settings.ifError(function(data) {

            });
            settings.postReq({
                "setting": "profile,taxes",
                "preference": "invoicePref,productPref,inventoryPref"
            })
        }

        function addSettigsData(val) {
            vm.displayTax = val[0].preference.invoicePref.enableTaxes;
            vm.Showdiscount = val[0].preference.invoicePref.enableDisscounts;
            //vm.baseCurrency = val[0].profile.baseCurrency;

            //__________enable or disable tax _______
            if (vm.displayTax == true) {
                vm.enableTax = false;
            } else {
                vm.enableTax = true;
            }

            //____________________enable discount ____
            if (vm.Showdiscount == true) {
                vm.displayDiscountLine = false;
            }

            //__________Add Units to array
            for (var z = val[0].preference.productPref.units.length - 1; z >= 0; z--) {
                if (val[0].preference.productPref.units[z].activate == true)
                    vm.UnitOfMeasure.push(val[0].preference.productPref.units[z])
            };
            //___________Add taxes to array____________________________________________
            for (var x = val[0].taxes.individualTaxes.length - 1; x >= 0; x--) {
                if (val[0].taxes.individualTaxes[x].activate == true)
                    vm.taxes.push(val[0].taxes.individualTaxes[x]);
            };
            for (var y = val[0].taxes.multipleTaxGroup.length - 1; y >= 0; y--) {
                if (val[0].taxes.multipleTaxGroup[y].activate == true)
                    vm.taxes.push(val[0].taxes.multipleTaxGroup[y]);
            };
            //______________________________________________________________________

        }


        //===========Load Products===========================================




        vm.querySearch = querySearch;
        var proName = [];
        loadAll();

        function querySearch(query) {
            var results = [];
            for (var i = 0, len = proName.length; i < len; ++i) {
                results.push(proName[i]);
            }
            return results;
        }


        function loaDProd(val) {
            var client = $serviceCall.setClient("getAllByQuery", "product");
            client.ifSuccess(function(data) {
                var data = data;
                if (data.result.length > 0) {
                    proName = [];
                    for (var i = 0, len = data.result.length; i < len; ++i) {
                        proName.push({
                            dis: data.result[i].productName,
                            valuep: data.result[i]
                        });
                    }
                }

            });
            client.ifError(function(data) {
                console.log("error loading profile data")
            })
            client.skip(0);
            client.take(10);
            client.orderby("productCode");
            client.isAscending(false);
            client.postReq(val);
        }

        function loadAll() {
            loaDProd({
                where: "deleteStatus = false and status = 'Active'"
            })
        }

        vm.enter = function(val) {
            //start added by dushmantha
            vm.qty = 1;
            vm.promoItems[0].ProductUnit = "Each";
            vm.promoItems[0].tax = ({
                taxName: "No Tax",
                activate: "True",
                compound: "False",
                rate: "0",
                type: "individualtaxes",
                ID: "0",
                individualTaxes: ""
            });
            //end added by dushmantha

            loaDProd({
                where: "deleteStatus = false and status = 'Active' and productName LIKE" + "'" + val + "%'"
            })
        }
        //==============================================================================================

        //=======Close Dialog====================
        function cancel() {
            $mdDialog.cancel();
        }

        //=================================================
        function RedyToAddProduc() {
            //alert("test");
        }

        function selectedItemChange(val) {
            debugger;
            vm.qty = 1; //added by dushmatha
            vm.Sqty = 1; //added by dushmatha
            if (vm.selctedProd == null) {
                vm.promoItems = [];
                vm.promoItems.push({
                    productName: '',
                    price: '',
                    tax: '',
                    ProductUnit: "",
                    qty: '',
                    discount: '',
                    olp: '',
                    status: '',
                    prodID: ''
                });

                vm.SProductUnit = "Each"
                vm.Sprice = 0;
                vm.promoItems[0].tax = ({
                    taxName: "",
                    activate: "True",
                    compound: "False",
                    rate: "0",
                    type: "individualtaxes",
                    ID: "0",
                    individualTaxes: ""
                });

                vm.Stax = ({
                    taxName: "No Tax",
                    activate: "True",
                    compound: "False",
                    rate: "0",
                    type: "individualtaxes",
                    ID: "0",
                    individualTaxes: ""
                });
            } else {
                vm.getqty = false;
                vm.promoItems.tax = 0;
                var prodArr = InvoiceService.getArry();
                if (prodArr.val.length > 0) {
                    for (var i = prodArr.val.length - 1; i >= 0; i--) {
                        if (prodArr.val[i].productCode == vm.selctedProd.valuep.productCode) {
                            console.log("you have added this")
                        } else {
                            console.log("no")
                        }
                    }
                }

                vm.Sprice = vm.selctedProd.valuep.productPrice;
                if (vm.selctedProd.valuep.productTax == 0) {
                    vm.Stax = ({
                        taxName: "No Tax",
                        activate: "True",
                        compound: "False",
                        rate: "0",
                        type: "individualtaxes",
                        ID: "0",
                        individualTaxes: ""
                    });
                } else {
                    vm.Stax = vm.selctedProd.valuep.productTax;
                }

                vm.SProductUnit = vm.selctedProd.valuep.productUnit
                vm.sprodID = vm.selctedProd.valuep.productID
                vm.promoItems[0] = {
                    productName: val,
                    price: vm.selctedProd.valuep.productPrice,
                    tax: vm.Stax,
                    ProductUnit: vm.selctedProd.valuep.productUnit,
                    qty: vm.Sqty,
                    discount: vm.discount,
                    olp: vm.olp,
                    status: "available",
                    prodID: vm.selctedProd.valuep.productID
                }

            }
            vm.calAMount();
        }

        //=======================================================
        function setqty(val) {
            if (vm.promoItems[0].status == "available") {
                if (vm.selctedProd.valuep.inventory == "Yes") {
                    if (vm.selctedProd.valuep.quantity >= val) {
                        vm.getqty = false;
                        vm.Sqty = val;
                        vm.promoItems[0].qty = val;
                    } else {
                        vm.getqty = true;

                        vm.qty = "1";
                    }
                } else {
                    vm.Sqty = val;
                    vm.promoItems[0].qty = val;
                }
            } else {
                vm.Sqty = val;
                vm.promoItems[0].qty = val;
            }
            vm.SproductName = vm.searchedProd;
            if (vm.promoItems[0].status != "available")
                vm.promoItems[0].status = "unavailable"
            vm.calAMount();
        }
        //===================================================
        function setUOM(val) {
            vm.showProduct = false;
            vm.SProductUnit = val.ProductUnit;
        }

        //====================================================
        function setprice(pd) {
            vm.showProduct = false;
            vm.Sprice = pd;
            vm.calAMount();
        }

        //===================================================
        function setDiscount(val) {
            vm.discount = val;
            vm.calAMount();
        }

        //===================================================
        function calAMount() {
            debugger;
            vm.Amount = 0;
            vm.disc = 0;
            vm.totall = 0;
            vm.totall = vm.Sprice * vm.Sqty;

            if (isNaN(vm.totall)) {
                vm.totall = 0;
            }
            if(vm.discount == undefined || vm.discount == ""){
                vm.Amount=0;
            }
            else{
                 vm.disc = parseFloat(vm.totall * vm.discount / 100);
            }
            // if ($rootScope.discounts == "Individual Items") {
           

            if(vm.Sprice == "" || vm.Sprice == undefined){
                vm.Amount = 0;
            }
            else{
                vm.Amount = vm.totall - vm.disc;
            }
            
            // } else {
            //     vm.Amount = vm.totall;
            // }
            // if ($rootScope.currencyStatus == true) {
            //     vm.Amount = parseFloat(vm.Amount * $rootScope.exchangeRate);
            // }
            return (vm.Amount); //removed 7_19 .toFixed(2)
        }

        //============================================================
        function setTax(pDis) {
            for (var i = vm.taxes.length - 1; i >= 0; i--) {
                if (vm.taxes[i].taxName == pDis) {
                    vm.Ptax = ({
                        taxName: pDis,
                        activate: vm.taxes[i].activate,
                        compound: vm.taxes[i].compound,
                        rate: vm.taxes[i].rate,
                        type: vm.taxes[i].type,
                        ID: vm.taxes[i].taxID,
                        individualTaxes: vm.taxes[i].individualTaxes
                    });
                }
            };
            vm.Stax = vm.Ptax;
        }

        //====================================================
        function addproductToarray(item) {
            debugger;
            if (vm.searchedProd != item && vm.searchedProd != null) {
                item = vm.searchedProd;
            }
            if (item == undefined || item == "") {
                vm.customError = "Please select a product to continue";
                return;

            } else if (item.length < 3) {
                vm.customError = "Product name should equal or greater than 3 characters";
                return;
            } else {
                vm.customError = "";
            }
            vm.promoItems[0].price =  parseFloat(vm.promoItems[0].price) *  parseFloat(exchangeRate);

            if (vm.promoItems[0].status == "available") {
                if (vm.selctedProd.valuep.inventory == "Yes") {
                    if (vm.selctedProd.valuep.quantity >= vm.Sqty) {
                        vm.getqty = false;
                    } else {
                        vm.getqty = true;
                    }
                }
            }
            if (vm.getqty == true) {

            } else {
                vm.disableAddProd = true;
                getProdDetails(item);
            }
        }

        //========================================================
        function getProdDetails(val) {
            if(vm.discount == undefined || vm.discount == ""){
                vm.discount = 0;
            }
            if (vm.promoItems[0].productName == null) {
                vm.showProduct = true;
            } else if (vm.promoItems[0].qty == null) {
                vm.showProduct = true;
            } else if (vm.promoItems[0].ProductUnit == null) {
                vm.showProduct = true;
            } else if (vm.promoItems[0].price == null || vm.promoItems[0].price == "0") {
                vm.showProduct = true;
            } else {
                if (vm.selctedProd != null && vm.selctedProd.dis != undefined) {
                    vm.disableProd = false;

                    var priceforset   =(parseFloat(vm.promoItems[0].price)); ////removed 7_19 .toFixed(2)
                    var amountfrotest =(parseFloat(vm.Amount) * parseFloat(exchangeRate) );  //removed 7_19 .toFixed(2)

                    vm.promoItems[0] = {
                        productName: val,
                        price: vm.Sprice,
                        tax: vm.Stax,
                        ProductUnit: vm.SProductUnit,
                        qty: vm.Sqty,
                        discount: vm.discount,
                        olp: vm.olp,
                        status: vm.Sstatus,
                        prodID: vm.sprodID
                    }
                    InvoiceService.setFullArr({
                        invoiceNo: "",
                        productID: vm.selctedProd.valuep.productID,
                        productName: vm.promoItems[0].productName,
                        price: priceforset,
                        quantity: vm.promoItems[0].qty,
                        productUnit: vm.promoItems[0].ProductUnit,
                        discount: vm.promoItems[0].discount,
                        tax: vm.promoItems[0].tax,
                        olp: vm.promoItems[0].olp,
                        amount: amountfrotest,
                        status: "available"
                    });
                    // updateDueDates();
                    $mdDialog.hide();
                } else {
                    vm.Sstatus = "unavailable";
                    vm.sprodID = ""

                    vm.promoItems[0] = {
                        productName: vm.searchedProd,
                        price: vm.Sprice,
                        tax: vm.Stax,
                        ProductUnit: vm.SProductUnit,
                        qty: vm.Sqty,
                        discount: vm.discount,
                        olp: vm.olp,
                        status: vm.Sstatus,
                        prodID: vm.sprodID
                    }

                    var confirm = $mdDialog.confirm()
                        .title('Would you like to save this product for future use?')
                        .content('')
                        .ariaLabel('Lucky day')
                        .targetEvent()
                        .ok('save')
                        .cancel('cancel');
                    $mdDialog.show(confirm).then(function(item) {
                        vm.showMsg = true;
                        callProductService(function(data) {
                            if (data) {
                                $mdDialog.hide();
                            }
                        });

                    }, function() {
                        vm.showMsg = false;
                        //vm.prod.deleteStatus = true;
                        //callProductService();
                        //Start added by dushmatha
                        InvoiceService.setFullArr({
                            invoiceNo: "",
                            productID: "",
                            productName: vm.promoItems[0].productName,
                            price: vm.promoItems[0].price,
                            quantity: vm.promoItems[0].qty,
                            productUnit: vm.promoItems[0].ProductUnit,
                            discount: vm.discount,
                            tax: vm.promoItems[0].tax,
                            olp: vm.promoItems[0].olp,
                            amount: vm.Amount,
                            status: "Temporary"
                        });
                        //vm.promoItems[0].status
                        //End added by dushmantha
                    });

                    vm.disableProd = false;
                    $mdDialog.hide();
                }
            }
        }
        //=========================================================
        function updateDueDates() {
            var UpdateArr = [];
            UpdateArr = angular.copy(invoiceMultipleDueDatesService.getArry());


            if (UpdateArr.val.length > 0) {
                // for (var i = UpdateArr.length - 1; i >= 0; i--) {
                // invoiceMultipleDueDatesService.removeAllTheDates(UpdateArr.val)
                // }
            }

            var netAmount = 0;
            // var subTotal = InvoiceService.calculateTotal();
            var tt = 0;
            //  tt  = InvoiceService.calculateTax()
            tt = InvoiceService.calculateNetAMount(0);
            netAmount = tt + vm.promoItems[0].price;
            var newAmount = 0;
            for (var i = UpdateArr.val.length - 1; i >= 0; i--) {

                newAmount = parseFloat(netAmount * UpdateArr.val[i].percentage / 100)

                invoiceMultipleDueDatesService.calDateArray({
                    invoiceNo: "",
                    dueDate: UpdateArr.val[i].dueDate,
                    percentage: UpdateArr.val[i].percentage,
                    dueDatePrice: newAmount,
                    paymentStatus: UpdateArr.val[i].paymentStatus,
                    balance: newAmount,
                    peymentTerm: "",
                    createDate: new Date(),
                    modifyDate: new Date(),
                    createUser: "",
                    modifyUser: "",
                    count: UpdateArr.val[i].count
                });
            }


        }
        //=========================================================
        function callProductService(callBack) {
            debugger;
            vm.prod.productName = vm.promoItems[0].productName;
            vm.prod.productPrice = vm.promoItems[0].price;
            vm.prod.productUnit = vm.promoItems[0].ProductUnit;
            var prodArr = [];
            prodArr = InvoiceService.getArry();
            for (var i = prodArr.length - 1; i >= 0; i--) {
                if (vm.promoItems[0].tax != undefined) {
                    if (vm.promoItems[0].tax.taxName == prodArr[i].taxName)
                        vm.prod.productTax = {
                            ID: "",
                            activate: prodArr[i].activate,
                            compound: prodArr[i].compound,
                            labelIndividualTaxStatus: prodArr[i].labelIndividualTaxStatus,
                            positionID: prodArr[i].positionID,
                            rate: prodArr[i].rate,
                            taxID: prodArr[i].taxID,
                            taxName: prodArr[i].taxName,
                            type: prodArr[i].type,
                            individualTaxes: prodArr[i].individualTaxes,
                        };
                } else {
                    vm.promoItems[0].tax = {};
                }

            }
            vm.prod.todaydate = new Date();
            vm.prod.productLog = {
                userName: "",
                lastTranDate: new Date(),
                description: "Product Added By",
                productCode: "",
                productNum: "",
                UIHeight: '30px;',
                type: "activity",
                status: "Active",
                createDate: new Date(),
                modifyDate: new Date(),
                createUser: "",
                modifyUser: "",
                logID: "-888",
                productID: ""
            };

            var product = {
                "product": vm.prod,
                "image": [],
                "appName": 'Products',
                'permissionType': 'add'
            };
            var stringObj = JSON.stringify(product)

            var client = $serviceCall.setClient("insertProduct", "process");
            client.ifSuccess(function(data) {
                if (vm.showMsg == true) {
                    $mdToast.show(
                        $mdToast.simple()
                        .textContent('Product Saved Successfully')
                        .position('top right')
                        .hideDelay(3000)
                    )
                }

                InvoiceService.setFullArr({
                    invoiceNo: "",
                    productID: data.ID,
                    productName: vm.promoItems[0].productName,
                    price: vm.promoItems[0].price,
                    quantity: vm.promoItems[0].qty,
                    productUnit: vm.promoItems[0].ProductUnit,
                    discount: vm.discount,
                    tax: vm.promoItems[0].tax,
                    olp: vm.promoItems[0].olp,
                    amount: vm.Amount,
                    status: vm.promoItems[0].status
                });

                // updateDueDates();
                callBack(true);
                //$mdDialog.hide();
            });
            client.ifError(function(data) {
                debugger;
                if (data.data.message == undefined || data.data.message.includes("Unexpected token")) {
                    $mdDialog.show(
                        $mdDialog.alert()
                        .parent(angular.element(document.body))
                        .title('Error')
                        .content('Error Saving Product')
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

                callBack(false);
            });
            client.postReq(stringObj);
        }


    }

    function InvoiceeditNewProd($rootScope, $scope, InvoiceService, item, index, isCurrencyChanged, exchangeRate, baseCurrency, changedCurrency, settings, $serviceCall, $mdToast, $document, $mdDialog) {
        debugger;
        var vm = this;
        vm.cancel = cancel;
        vm.test = {};
        vm.test = angular.copy(item);
        // if( vm.test.discount == ""  vm.test.discount == undefined)
        // {
        //      vm.test.discount=0;
        // }
        // $rootScope.$broadcast('extupslctprd',vm.test.productName);
        console.log(vm.test);
        vm.test.price = parseFloat(vm.test.price) / exchangeRate;
        vm.test.amount = parseFloat(vm.test.amount) / exchangeRate;
        //added by dushmantha
        vm.index = index;
        //vm.test.amount = parseFloat(vm.test.amount * exchangeRate).toFixed(2);
        //vm.test.price = parseFloat(vm.test.price * exchangeRate).toFixed(2);
        //added by dushmantha
        vm.prevProd = angular.copy(vm.test);
        var ProductArray = angular.copy(InvoiceService.getArry());
        vm.edit = edit;

        if (!isCurrencyChanged) {
            vm.baseCurrency = baseCurrency;
        } else {
            vm.baseCurrency = changedCurrency;
        }


        //loadSettigns();
        calAMount();

        //=======Close Dialog====================
        function cancel() {

            $mdDialog.hide();
        }

        //=========================Load Settigs=========================================
        vm.taxes = [];
        vm.UnitOfMeasure = [];
        vm.enableTax = false;
        vm.displayDiscountLine = true;
        vm.setTax = setTax;
        addSettigsData(settings);
        /*function loadSettigns(){
            var settings = $serviceCall.setClient("getAllByQuery","setting");
        settings.ifSuccess(function(data){
            addSettigsData(data);
        });
        settings.ifError(function(data){

        });
        settings.postReq({"setting":"profile,taxes","preference":"invoicePref,productPref,inventoryPref"})
        }*/

        function addSettigsData(val) {
            vm.displayTax = val[0].preference.invoicePref.enableTaxes;
            vm.Showdiscount = val[0].preference.invoicePref.enableDisscounts;
            //vm.baseCurrency = val[0].profile.baseCurrency; //comented by dushmantha
            //__________enable or disable tax _______
            if (vm.displayTax == true) {
                vm.enableTax = false;
            } else {
                vm.enableTax = true;
            }

            //____________________enable discount ____
            if (vm.Showdiscount == true) {
                vm.displayDiscountLine = false;
            }

            //__________Add Units to array
            for (var z = val[0].preference.productPref.units.length - 1; z >= 0; z--) {
                if (val[0].preference.productPref.units[z].activate == true)
                    vm.UnitOfMeasure.push(val[0].preference.productPref.units[z])
            };
            //___________Add taxes to array____________________________________________
            for (var x = val[0].taxes.individualTaxes.length - 1; x >= 0; x--) {
                if (val[0].taxes.individualTaxes[x].activate == true)
                    vm.taxes.push(val[0].taxes.individualTaxes[x]);
            };
            for (var y = val[0].taxes.multipleTaxGroup.length - 1; y >= 0; y--) {
                if (val[0].taxes.multipleTaxGroup[y].activate == true)
                    vm.taxes.push(val[0].taxes.multipleTaxGroup[y]);
            };
            //______________________________________________________________________

        }


        //=================================================
        vm.calculateAMount = function(obj) {
            vm.test.price = obj.price;
            calAMount();
        }

        //======================================================================
        function calAMount() {
            debugger;
            //vm.Amount = 0;
            vm.disc = 0;
            vm.totall = 0;
            vm.totall = vm.test.price * vm.test.quantity;
            vm.disc = parseFloat(vm.totall * vm.test.discount / 100);
           
            if(vm.test.price ==  "" || vm.test.price == undefined){
                vm.test.amount = 0;
            }
            else{
                vm.test.amount = parseFloat(vm.totall - vm.disc); //removed 7_19 .toFixed(2)
            }
          
        }
        //========================================================================
        vm.stocks = false;
        vm.stockcount = 0;
        vm.checkStock = function(val) {
            var client = $serviceCall.setClient("getAllByQuery", "product");
            client.ifSuccess(function(data) {
                for (var i = data.result.length - 1; i >= 0; i--) {
                    if (data.result[i].productName.toLowerCase() == item.productName.toLowerCase()) {
                        vm.checkAvaialability = true;
                        vm.checkavailableStock = data.result[i].inventory;
                        vm.stockcount = parseInt(data.result[i].quantity);
                    }
                }
                if (vm.checkAvaialability == true) {
                    if (vm.checkavailableStock == "No") {
                        vm.stocks = false;
                        calAMount();
                    } else {
                        if (vm.stockcount >= val) {
                            vm.stocks = false;
                            calAMount();
                        } else {
                            vm.stocks = true;
                        }
                    }
                } else {
                    calAMount();

                }
            });
            client.ifError(function(data) {
                console.log("Error")
            });
            client.skip(0);
            client.take(10);
            client.orderby("productCode");
            client.isAscending(false);
            client.postReq({
                where: "deleteStatus = 'false' and status = 'Active'"
            });
        }

        //====================================================================
        function edit(tst, index) {debugger
            if(tst.discount == "" || tst.discount == undefined){
                tst.discount = 0;
            }
            if (vm.stocks == true) {
                
            } else { 
                tst.price = parseFloat(tst.price) * exchangeRate;
                tst.amount = parseFloat(tst.amount) * exchangeRate;
                InvoiceService.ReverseTax(vm.prevProd, ProductArray); 
                InvoiceService.editArray(tst, index, exchangeRate); // added by dushmantha
                $mdDialog.hide(tst);
            }

        };
        //==============================================================================

        vm.changeDiscount = changeDiscount;

        function changeDiscount(val) {
            debugger;
            vm.test.discount = val;
            calAMount();
        }

        //==========================================================
        function setTax(pDis) {
            for (var i = vm.taxes.length - 1; i >= 0; i--) {
                if (vm.taxes[i].taxName == pDis) {
                    var activate = vm.taxes[i].activate;
                    var compound = vm.taxes[i].compound;
                    var rate = vm.taxes[i].rate;
                    var type = vm.taxes[i].type;
                    var individualTaxes = vm.taxes[i].individualTaxes;

                    vm.Ptax = ({
                        taxName: pDis,
                        activate: activate,
                        compound: compound,
                        rate: rate,
                        type: type,
                        individualTaxes: individualTaxes
                    });
                }
            };
            vm.test.tax = vm.Ptax;
        }

    }
})();
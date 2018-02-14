(function() {
    'use strict';

    angular
        .module('app.creditnotes')
        .controller('addProdCtrlCre', addProdCtrlCre)
        .controller('editNewProdCre', editNewProdCre)
        .directive('roundDir', roundDir);


    /** @ngInject */
    function roundDir($filter) {
        return {
            require: 'ngModel',
            restrict: 'A',
            scope: {
                model: '=ngModel',
                roundDir: "="
            },
            link: function(scope, element, attrs, ngModel) {

                scope.$watch('model', function() {
                    if (!scope.roundDir) scope.roundDir = '';
                    ngModel.$viewValue = scope.roundDir + " " + $filter('valRndUp')(ngModel.$viewValue);
                    ngModel.$render();
                })
            }
        };
    };

    /** @ngInject */
    function addProdCtrlCre($scope, creditnoteService, $rootScope, $serviceCall, $mdToast, $document, $mdDialog, $mdMedia, $mdSidenav, $state) {
        var vm = this;
        vm.cancel = cancel;
        vm.product = {}
        vm.enableTax = false;
        vm.showProduct = false;
        vm.disableProd = false;
        vm.showMsg = true;
        vm.getqty = false;
        vm.disableAddProd = false;
        vm.proHide = false;
        vm.selectedItemChange = selectedItemChange;
        vm.setqty = setqty;
        vm.setprice = setprice;
        vm.setDiscount = setDiscount;
        vm.setUOM = setUOM;
        vm.calAMount = calAMount;
        vm.setTax = setTax;
        vm.addproductToarray = addproductToarray;
        vm.getProdDetails = getProdDetails;
        vm.RedyToAddProduc = RedyToAddProduc;
        loadSettigns();

        $rootScope.$on('selectedProduct', function(event, args) {
            vm.proHide = false;
            vm.selctedProd = [];
            vm.selctedProd.dis = args.slctdProduct.productName;
            vm.selctedProd.valuep = args.slctdProduct;
            selectedItemChange(args.slctdProduct);
        });

        $rootScope.$on('dirupsnewprod', function(event, args) {

            vm.proHide = true;
            vm.selctedProd = null;
        });

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
            vm.baseCurrency = val[0].profile.baseCurrency;
            console.log(vm.baseCurrency)
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
                if (val[0].preference.productPref.units[z].activate == true) {
                    vm.UnitOfMeasure.push(val[0].preference.productPref.units[z])
                }
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
        vm.selctedProd = null;
        vm.searchedProd = null;

        $rootScope.$on('dirupsnewprod', function(event, args) {
            vm.searchedProd = args;
        });

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
            alert("test");
        }

        function selectedItemChange(val) {
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
                var prodArr = creditnoteService.getArry();
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
                    olp: (vm.olp) ? vm.olp : "",
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
            vm.Amount = 0;
            vm.disc = 0;
            vm.totall = 0;
            vm.totall = vm.Sprice * vm.Sqty;

            if (isNaN(vm.totall)) {
                vm.totall = 0;
            }
            // if ($rootScope.discounts == "Individual Items") {
            vm.disc = parseFloat(vm.totall * vm.discount / 100);
            vm.Amount = vm.totall - vm.disc;
            // } else {
            //     vm.Amount = vm.totall;
            // }
            // if ($rootScope.currencyStatus == true) {
            //     vm.Amount = parseFloat(vm.Amount * $rootScope.exchangeRate);
            // }
            return (vm.Amount);
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
            vm.proHide = false;
            if (!item) {
                vm.proHide = true;
                return false;
            }
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
            $rootScope.exchangeRate = ($rootScope.exchangeRate) ? $rootScope.exchangeRate : 1;

            console.log($rootScope.exchangeRate)
            if (vm.promoItems[0].productName == null) {
                vm.showProduct = true;
            } else if (vm.promoItems[0].qty == null) {
                vm.showProduct = true;
            } else if (vm.promoItems[0].ProductUnit == null) {
                vm.showProduct = true;
            } else if (vm.promoItems[0].price == null || vm.promoItems[0].price == "0") {
                vm.showProduct = true;
            } else {
                if (vm.selctedProd != null) {
                    vm.disableProd = false;

                    vm.promoItems[0] = {
                        productName: vm.selctedProd.valuep.productName,
                        price: vm.Sprice,
                        tax: vm.Stax,
                        ProductUnit: vm.SProductUnit,
                        qty: vm.Sqty,
                        discount: vm.discount,
                        olp: (vm.olp) ? vm.olp : "",
                        status: vm.Sstatus,
                        prodID: vm.sprodID
                    }

                    creditnoteService.setFullArr({
                        invoiceNo: "",
                        productID: vm.selctedProd.valuep.productID,
                        productName: vm.promoItems[0].productName,
                        price: parseFloat(vm.promoItems[0].price / $rootScope.exchangeRate),
                        quantity: vm.promoItems[0].qty,
                        productUnit: vm.promoItems[0].ProductUnit,
                        discount: vm.promoItems[0].discount,
                        tax: vm.promoItems[0].tax,
                        olp: (vm.promoItems[0].olp) ? vm.promoItems[0].olp : "",
                        amount: parseFloat(vm.Amount / $rootScope.exchangeRate),
                        status: "available"
                    });
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
                        olp: (vm.olp) ? vm.olp : "",
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
                        vm.prod.deleteStatus = true;
                        callProductService();
                    });

                    vm.disableProd = false;
                    $mdDialog.hide();
                }
            }
        }
        //=========================================================

        //=========================================================
        function callProductService(callBack) {
            vm.prod.productName = vm.promoItems[0].productName;
            vm.prod.productPrice = vm.promoItems[0].price;
            vm.prod.productUnit = vm.promoItems[0].ProductUnit;
            var prodArr = [];
            prodArr = creditnoteService.getArry();
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

                creditnoteService.setFullArr({
                    invoiceNo: "",
                    productID: data.ID,
                    productName: vm.promoItems[0].productName,
                    price: vm.promoItems[0].price,
                    quantity: vm.promoItems[0].qty,
                    productUnit: vm.promoItems[0].ProductUnit,
                    discount: vm.discount,
                    tax: vm.promoItems[0].tax,
                    olp: (vm.promoItems[0].olp) ? vm.promoItems[0].olp : "",
                    amount: vm.Amount,
                    status: vm.promoItems[0].status
                });
                callBack(true);
                //$mdDialog.hide();
            });
            client.ifError(function(data) {
                $mdToast.show(
                    $mdToast.simple()
                    .textContent('Error Saving Product')
                    .position('top right')
                    .hideDelay(3000)
                );

                callBack(false);
            });
            client.postReq(stringObj);
        }


    };

    /** @ngInject */
    function editNewProdCre($scope, creditnoteService, item, $serviceCall, $mdToast, $document, $mdDialog,$rootScope) {
        var vm = this;
        vm.cancel = cancel;
        vm.test = {};
        vm.test = angular.copy(item);
        vm.prevProd = angular.copy(vm.test);
        var ProductArray = angular.copy(creditnoteService.getArry());
        vm.edit = edit;
        vm.setTax = setTax;

        loadSettigns();
        calAMount();

        //=======Close Dialog====================
        function cancel() {
            $mdDialog.hide();
        }

        vm.taxes = [];
        vm.UnitOfMeasure = [];
        vm.enableTax = false;
        vm.displayDiscountLine = true;

        $rootScope.$on('selectedProduct', function(event, args) {
            vm.proHide = false;
            vm.selctedProd = [];
            vm.selctedProd.dis = args.slctdProduct.productName;
            vm.selctedProd.valuep = args.slctdProduct;
            selectedItemChange(args.slctdProduct);
        });


        function selectedItemChange(val) {
            vm.qty = 1; //added by dushmatha
            vm.Sqty = 1; //added by dushmatha
            if (vm.selctedProd == null) {
          
            } else {   
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
 
                vm.test.productName = val.productName;
                vm.test.price = vm.selctedProd.valuep.productPrice;
                vm.test.tax =  vm.Stax;
                vm.test.ProductUnit = vm.selctedProd.valuep.productUnit;
                vm.test.qty = vm.Sqty;
                vm.test.discount = (vm.discount) ? vm.discount : 0;
                vm.test.olp =  (vm.olp) ? vm.olp : "";
                vm.test.prodID = vm.selctedProd.valuep.productID;
                vm.test.status =  "available"; 

            }
            calAMount();
        }



        function loadSettigns() {

            var settings = $serviceCall.setClient("getAllByQuery", "setting");
            settings.ifSuccess(function(data) {
                addSettigsData(data);
            });
            settings.ifError(function(data) {

            });
            settings.postReq({
                "setting": "taxes",
                "preference": "invoicePref,productPref,inventoryPref"
            })
        }

        function addSettigsData(val) {
            vm.displayTax = val[0].preference.invoicePref.enableTaxes;
            vm.Showdiscount = val[0].preference.invoicePref.enableDisscounts;

            //__________enable or disable tax _______
            if (vm.DisplayTaxes == true) {
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
                if (val[0].preference.productPref.units[z].activate == true) {
                    vm.UnitOfMeasure.push(val[0].preference.productPref.units[z])
                }
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
            //vm.Amount = 0;
            vm.disc = 0;
            vm.totall = 0;
            vm.totall = vm.test.price * vm.test.quantity;
            vm.disc = parseFloat(vm.totall * vm.test.discount / 100);
            vm.test.amount = parseFloat(vm.totall - vm.disc);
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
        function edit(tst, index) {
            if (vm.stocks == true) {} else {
                creditnoteService.ReverseTax(vm.prevProd, ProductArray);
                creditnoteService.removeArray(tst, index);

                creditnoteService.setFullArr({
                    productName: tst.productName,
                    price: tst.price,
                    quantity: tst.quantity,
                    productUnit: tst.productUnit,
                    discount: tst.discount,
                    tax: tst.tax,
                    olp: (tst.olp) ? tst.olp : "",
                    amount: vm.test.amount,
                    status: tst.status,
                    invoiceNo: "",
                    productID: ""
                })
                debugger
                $mdDialog.hide(tst);
            }
        };
        //==============================================================================

        vm.changeDiscount = changeDiscount;

        function changeDiscount(val) {
            vm.test.discount = val;
            calAMount();
        }

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
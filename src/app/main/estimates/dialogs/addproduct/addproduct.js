(function() {
    'use strict';

    angular
        .module('app.estimates')
        .controller('addEstProdCtrl', addEstProdCtrl)
        .controller('editEstNewProd', editEstNewProd);

    /** @ngInject */
    function addEstProdCtrl($scope, $rootScope, EstimateService, isCurrencyChanged, changeCurrency, baseCurrency, exchangeRate, $serviceCall, $mdToast, $document, $mdDialog, $mdMedia, $mdSidenav, $state) {
        var vm = this;
        vm.cancel = cancel;
        vm.product = {};
        vm.showProduct = false;
        vm.disableProd = false;
        vm.showMsg = true;
        vm.getqty = false;
        vm.disableAddProd = false;
        loadSettigns();
        vm.selectedItemChange = selectedItemChange;
        vm.setqty = setqty;
        vm.setprice = setprice;
        vm.setDiscount = setDiscount;
        vm.setUOM = setUOM;
        vm.calAMount = calAMount;
        vm.calAMountChange = calAMountChange;
        vm.setTax = setTax;
        vm.addproductToarray = addproductToarray;
        vm.getProdDetails = getProdDetails;
       

        vm.selctedProd = null;
        vm.searchedProd = null;

        var cleanUpFunc = $rootScope.$on('selectedProduct', function(event, args) {
            debugger;
            vm.selctedProd = [];
            vm.selctedProd.dis = args.slctdProduct.productName;
            vm.selctedProd.valuep = args.slctdProduct;
            console.log(vm.selctedProd);
            debugger;
            if (vm.selctedProd.dis != vm.searchedProd) {
                debugger;
                setProduct("selected-product")
            }

            if (isCurrencyChanged) {
                vm.selctedProd.valuep.productPrice = parseFloat(vm.selctedProd.valuep.productPrice / exchangeRate);
            }
            selectedItemChange(args.slctdProduct.productName);
            //do something with product.

        });

        $rootScope.$on('dirupsnewprod', function(event, args) {

            vm.searchedProd = args;

            if (vm.selctedProd.dis != vm.searchedProd) {
                setProduct("new-product")
            }
        });

        $scope.$on('$destroy', function() {
            cleanUpFunc();

        });

        function setProduct(InputType) {
            debugger;
            if (InputType == "new-product") {

                vm.qty = 1; //added by dushmatha
                vm.Sqty = 1; //added by dushmatha
                vm.selctedProd = [];
                vm.promoItems = [];
                vm.promoItems.push({
                    productName: '',
                    price: '',
                    tax: '',
                    productUnit: "Each",
                    qty: '',
                    discount: '',
                    olp: '',
                    status: '',
                    prodID: ''
                });

                console.log(vm.promoItems);

                vm.SProductUnit = "Each";
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

        vm.changeCurrency = changeCurrency;


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
            "stockLevel": "",
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
        vm.promoItems.push({
            productName: '',
            price: 0,
            tax: '',
            productUnit: "Each",
            qty: '',
            discount: '',
            olp: '',
            status: '',
            prodID: '',
        });

        vm.SProductUnit = "Each"
        vm.Sprice = 0;
        vm.promoItems[0].tax = ({
            taxName: "No Tax",
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

        //=========================Load Settigs=========================================
        vm.taxes = [];
        vm.UnitOfMeasure = [];
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
                "preference": "invoicePref,estimatePref,productPref"
            })
        }

        function addSettigsData(val) {

            vm.Showdiscount = val[0].preference.invoicePref.enableDisscounts;

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
        vm.selctedProd = null;
        vm.searchedProd = null;
        vm.querySearch = querySearch;
        var proName = [];
        loadAll();

        function querySearch(query) {
            var results = [];
            for (var i = 0, len = proName.length; i < len; ++i) {
                results.push(proName[i]);
            }
            return results;

            //       var body = {where : "status = 'Active' and deleteStatus = false and (productName LIKE" +"'" +query+"%')"}
            //       var client =  $serviceCall.setClient("getAllByQuery","product"); 

            //       client.skip("0");
            //       client.take("10");
            //       client.class("product");
            //       client.orderby("");
            //       client.isAscending("false");

            //       return client.getSearch(body).then(function(data){
            //         var data = response.data.result;
            //         console.log(data);
            //         var results = [];
            //         for (var i = 0, len = data.length; i < len; ++i) {
            //           results.push({
            //            dis: data.result[i].productName      
            //        });
            //       }
            //       return results;

            //   },function(results){
            //     console.log('error loading data');
            // }) 

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
            vm.qty = 1;
            vm.promoItems[0].productUnit = "Each";
            vm.promoItems[0].tax = ({
                taxName: "No Tax",
                activate: "True",
                compound: "False",
                rate: "0",
                type: "individualtaxes",
                ID: "0",
                individualTaxes: ""
            });
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
        function selectedItemChange(val) {
            vm.qty = 1;

            if (vm.selctedProd == null) {
                vm.promoItems = [];
                vm.promoItems.push({
                    productName: '',
                    price: 0,
                    tax: '',
                    productUnit: "",
                    qty: '',
                    discount: '',
                    olp: '',
                    status: '',
                    prodID: ''
                });

                vm.SProductUnit = "Each";
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
                vm.Sqty = vm.qty;
                vm.getqty = false;
                vm.promoItems.tax = 0;
                var prodArr = EstimateService.getArry();
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
                    vm.promoItems[0].tax = vm.Stax;
                } else {
                    vm.Stax = vm.selctedProd.valuep.productTax;
                    vm.promoItems[0].tax = vm.Stax;
                }

                vm.SProductUnit = vm.selctedProd.valuep.productUnit;
                vm.sprodID = vm.selctedProd.valuep.productID;
                vm.promoItems[0] = {
                    productName: val,
                    price: vm.selctedProd.valuep.productPrice,
                    tax: vm.Stax,
                    productUnit: vm.selctedProd.valuep.productUnit,
                    qty: vm.Sqty,
                    discount: vm.discount,
                    olp: vm.olp,
                    status: "available",
                    prodID: vm.selctedProd.valuep.productID
                }

                vm.calAMount();
            }


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
            vm.SProductUnit = val.productUnit;
        }

        //====================================================
        function setprice(pd) {
            console.log(pd);
            vm.showProduct = false;
            vm.Sprice = pd;
            vm.calAMountChange();
        }

        //===================================================
        function setDiscount(val, price) {

            if (val == "" || val == null) {
                val = 0;
            }
            vm.discount = val;
            vm.Sprice = price
            vm.calAMountChange();
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
            vm.disc = parseFloat(vm.totall * vm.discount / 100);
            vm.Amount = vm.totall - vm.disc;
            return (vm.Amount);
        }

        function calAMountChange() { 
            vm.Amount = 0;
            vm.disc = 0;
            vm.totall = 0;

            vm.totall = vm.Sprice * vm.Sqty; 
            vm.disc = parseFloat(vm.totall * vm.discount / 100);

            vm.Amount = vm.totall - vm.disc;  
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
            if (vm.searchedProd != item && vm.searchedProd != null) {
                item = vm.searchedProd;
            }
       
            console.log(vm.promoItems[0].productName);

            if (item == undefined || item == "") {
                vm.customError = "Please select a product to continue";
                return;
            } else {
             
                vm.customError = "";
            }
            vm.promoItems[0].price =  parseFloat(vm.promoItems[0].price) *  parseFloat(exchangeRate);

            if (item.length < 3) {
           
                vm.customError = "Product name should equal or greater than 3 characters";
                return;
            } else {
         
                vm.customError = "";
            }



            console.log(item);
            console.log(vm.selctedProd);
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

                console.log(vm.selctedProd);
                vm.disableAddProd = true;
                getProdDetails(item);
            }
        }

        //========================================================
        function getProdDetails(val) {
            console.log(vm.promoItems[0].productName);
            console.log(vm.prod.productName);
            // if(vm.prod.productName == undefined || vm.prod.productName == "")
            // {
            //     vm.customError = "Please select a product to continue";
            //     return;
            // }
            if (vm.promoItems[0].productName == null) {
                vm.showProduct = true;
            } else if (vm.promoItems[0].qty == null) {
                vm.showProduct = true;
            } else if (vm.promoItems[0].productUnit == null) {
                vm.showProduct = true;
            } else if (vm.promoItems[0].price == null || vm.promoItems[0].price == "0") {
                vm.showProduct = true;
            } else {
                if (vm.selctedProd != null && vm.selctedProd.dis != undefined) {
                    vm.disableProd = false;

                    var priceforset   =(parseFloat(vm.promoItems[0].price));
                    var amountfrotest =(parseFloat(vm.Amount) * parseFloat(exchangeRate) );  

                    vm.promoItems[0] = {
                        productName: val,
                        price: vm.Sprice,
                        tax: vm.Stax,
                        productUnit: vm.SProductUnit,
                        qty: vm.Sqty,
                        discount: vm.discount,
                        olp: vm.olp,
                        status: vm.Sstatus,
                        prodID: vm.sprodID
                    }

                    EstimateService.setFullArr({
                        estimateNo: "",
                        productID: vm.selctedProd.valuep.productID,
                        productName: vm.promoItems[0].productName,
                        price:priceforset,
                        quantity: vm.promoItems[0].qty,
                        productUnit: vm.promoItems[0].productUnit,
                        discount: vm.promoItems[0].discount,
                        tax: vm.promoItems[0].tax,
                        olp: vm.promoItems[0].olp,
                        amount: amountfrotest,
                        status: "available"
                    });
                    $mdDialog.hide();
                } else {
                    vm.Sstatus = "unavailable";
                    vm.sprodID = "";

                    vm.promoItems[0] = {
                        productName: vm.searchedProd,
                        price: vm.Sprice,
                        tax: vm.Stax,
                        productUnit: vm.SProductUnit,
                        qty: vm.Sqty,
                        discount: vm.discount,
                        olp: vm.olp,
                        status: vm.Sstatus,
                        prodID: vm.sprodID
                    }

                    var confirm = $mdDialog.confirm()
                        .title('Alert')
                        .content('Would you like to save this product for future use?')
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

                        // vm.prod.deleteStatus = true;
                        // callProductService();
                        EstimateService.setFullArr({
                            estimateNo: "",
                            productID: "",
                            productName: vm.promoItems[0].productName,
                            price: vm.promoItems[0].price,
                            quantity: vm.promoItems[0].qty,
                            productUnit: vm.promoItems[0].productUnit,
                            discount: vm.discount,
                            tax: vm.promoItems[0].tax,
                            olp: vm.promoItems[0].olp,
                            amount: vm.Amount,
                            status: vm.promoItems[0].status
                        });
                    });

                    vm.disableProd = false;
                    $mdDialog.hide();
                }
            }
        }

        //=========================================================
        function callProductService(callBack) {

            vm.prod.productName = vm.promoItems[0].productName;
            vm.prod.productPrice = vm.promoItems[0].price;
            vm.prod.productUnit = vm.promoItems[0].productUnit;
            var prodArr = [];
            prodArr = EstimateService.getArry();


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

                EstimateService.setFullArr({
                    estimateNo: "",
                    productID: data.ID,
                    productName: vm.promoItems[0].productName,
                    price: vm.promoItems[0].price,
                    quantity: vm.promoItems[0].qty,
                    productUnit: vm.promoItems[0].productUnit,
                    discount: vm.discount,
                    tax: vm.promoItems[0].tax,
                    olp: vm.promoItems[0].olp,
                    amount: vm.Amount,
                    status: vm.promoItems[0].status
                });
                callBack(true);
                //$mdDialog.hide();
            });
            client.ifError(function(data) {
                if (data.data.isSuccess == false) {
                    $mdDialog.show(
                        $mdDialog.alert()
                        .parent(angular.element(document.body))
                        .title('Error')
                        .content(data.data.customMessage)
                        .ariaLabel('Alert Dialog Demo')
                        .ok('OK')
                        .targetEvent()
                    );
                }

                if (data.data.customMessage == null) {
                    $mdDialog.show(
                        $mdDialog.alert()
                        .parent(angular.element(document.body))
                        .title('Error')
                        .content('Error Saving Product.')
                        .ariaLabel('Alert Dialog Demo')
                        .ok('OK')
                        .targetEvent()
                    );
                }

                callBack(false);
            });
            client.postReq(stringObj);
        }


    }

    function editEstNewProd($scope, $rootScope, EstimateService, item, index, $serviceCall, $mdToast, $document, $mdDialog, exchangeRate, changeCurrency) {
        console.log(exchangeRate);
        var vm = this;
        vm.cancel = cancel;
        vm.index = index;
        console.log(index);
        vm.test = {};
        vm.test = angular.copy(item); 
        console.log(vm.test);
       
        // vm.editProd = {};
        // vm.editProd.display = vm.test.productName;
        // vm.editProd.value = vm.test;
        // $rootScope.$broadcast('extupslctprd',vm.editProd);

        vm.selctedProd = null;
        vm.searchedProd = null;

        vm.test.price = parseFloat(vm.test.price / exchangeRate);
        // vm.selctedProd.dis = vm.test.productName;

        vm.promoItems = [];
        vm.promoItems.push({
            productName: vm.test.productName,
            price: vm.test.price,
            tax: vm.test.tax,
            productUnit: vm.test.productUnit,
            qty: vm.test.quantity,
            discount: vm.test.discount,
            olp: vm.test.olp,
            status: vm.test.status,
            prodID: vm.test.productID
        });
        
        // vm.selctedProd.valuep = args.slctdProduct;

        $rootScope.displayProductName = vm.test.productName;
        
    //     function preloadProduct(){
    //         $rootScope.$broadcast('extupslctprd',vm.test);
    //     }
            
    //    preloadProduct();

        var cleanUpFunc = $rootScope.$on('selectedProduct', function(event, args) {
            vm.selctedProd = [];
            debugger;
            
           if(vm.selctedProd === null){

           }
            vm.selctedProd.dis = args.slctdProduct.productName;
            vm.selctedProd.valuep = args.slctdProduct;
            console.log(vm.selctedProd);

            // if (vm.selctedProd.dis != vm.searchedProd) {
            //     setProduct("selected-product")
            // }

            vm.selctedProd.valuep.productPrice = parseFloat(vm.selctedProd.valuep.productPrice / exchangeRate);
            
            selectedItemChange(args.slctdProduct.productName);
            //do something with product.

        });

        $scope.$on('$destroy', function() {
            cleanUpFunc();
            $rootScope.displayProductName = "";
            
        });
        

        function selectedItemChange(val) {
            debugger;
            vm.qty = 1;
            vm.Sqty = 1;
            vm.test.discount = 0;
            vm.test.olp = "";

            // if (vm.selctedProd == null) {
            //     vm.promoItems = [];
            //     vm.promoItems.push({
            //         productName: '',
            //         price: 0,
            //         tax: '',
            //         productUnit: "",
            //         qty: '',
            //         discount: '',
            //         olp: '',
            //         status: '',
            //         prodID: ''
            //     });

            //     vm.SProductUnit = "Each";
            //     vm.Sprice = 0;
            //     vm.promoItems[0].tax = ({
            //         taxName: "",
            //         activate: "True",
            //         compound: "False",
            //         rate: "0",
            //         type: "individualtaxes",
            //         ID: "0",
            //         individualTaxes: ""
            //     });

            //     vm.Stax = ({
            //         taxName: "No Tax",
            //         activate: "True",
            //         compound: "False",
            //         rate: "0",
            //         type: "individualtaxes",
            //         ID: "0",
            //         individualTaxes: ""
            //     });

            // } 
            debugger;
                vm.Sqty = vm.qty;

                vm.getqty = false;
                vm.promoItems.tax = 0;
                vm.test.tax = vm.promoItems.tax;
                var prodArr = EstimateService.getArry();
                // if (prodArr.val.length > 0) {
                //     for (var i = prodArr.val.length - 1; i >= 0; i--) {
                //         if (prodArr.val[i].productCode == vm.selctedProd.valuep.productCode) {
                //             console.log("you have added this")
                //         } else {
                //             console.log("no")
                //         }
                //     }
                // }
                if(vm.selctedProd === null){
                    vm.Sprice = vm.test.price;
                    
                    vm.SProductUnit = vm.test.productUnit;
                    vm.sprodID = vm.test.productID;
                    vm.promoItems[0] = {
                        productName: val,
                        price: vm.Sprice,
                        tax: vm.test.tax,
                        productUnit: vm.test.productUnit,
                        qty: vm.test.quantity,
                        discount: vm.test.discount,
                        olp: vm.test.olp,
                        status: "available",
                        prodID: vm.test.productID
                    }
                }
                else{
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
                        vm.promoItems[0].tax = vm.Stax;
                    } else {
                        vm.Stax = vm.selctedProd.valuep.productTax;
                        vm.promoItems[0].tax = vm.Stax;
                    }

                    vm.SProductUnit = vm.selctedProd.valuep.productUnit;
                    vm.sprodID = vm.selctedProd.valuep.productID;
                    vm.promoItems[0] = {
                        productName: val,
                        price: vm.selctedProd.valuep.productPrice,
                        tax: vm.Stax,
                        productUnit: vm.selctedProd.valuep.productUnit,
                        qty: vm.Sqty,
                        discount: vm.test.discount,
                        olp: vm.test.olp,
                        status: "available",
                        prodID: vm.selctedProd.valuep.productID
                    }
                }
                

                vm.test.quantity = vm.promoItems[0].qty;
                vm.test.price = vm.promoItems[0].price;

                calAMount();
            


        }

        // function setProduct(InputType) {
        //         vm.selctedProd = [];
        //         vm.promoItems = [];
        //         vm.promoItems.push({
        //             productName: '',
        //             price: '',
        //             tax: '',
        //             productUnit: "Each",
        //             qty: '',
        //             discount: '',
        //             olp: '',
        //             status: '',
        //             prodID: ''
        //         });

        //         console.log(vm.promoItems);
        // }

        // vm.test.price = parseFloat(vm.test.price) / exchangeRate;
        // vm.test.amount = parseFloat(vm.test.amount) / exchangeRate;

        vm.prevProd = angular.copy(vm.promoItems[0]);
        console.log(vm.prevProd);

        var ProductArray = angular.copy(EstimateService.getArry());
        vm.edit = edit;
        vm.exchangeRate = exchangeRate;

        // vm.test.price = vm.test.amount;

        loadSettigns();
        calAMount();

        vm.changeCurrency = changeCurrency;

        //=======Close Dialog====================
        function cancel() {
            $mdDialog.hide();
        }

        //=========================Load Settigs=========================================
        vm.taxes = [];
        vm.UnitOfMeasure = [];
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
                "preference": "invoicePref,estimatePref,productPref"
            })
        }

        function addSettigsData(val) {
            vm.Showdiscount = val[0].preference.invoicePref.enableDisscounts;

            // vm.baseCurrency = val[0].profile.baseCurrency;



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

            console.log(obj);
            // vm.test.price = obj.price;
            calAMount();
        }

        //======================================================================
        function calAMount() {
            debugger;
            
            vm.test.price = vm.promoItems[0].price;
            vm.test.quantity = vm.promoItems[0].qty;
            //vm.Amount = 0;
            vm.disc = 0;
            vm.totall = 0;
            vm.totall = vm.test.price * vm.test.quantity;
            vm.disc = parseFloat(vm.totall * vm.test.discount / 100);
            debugger;
            if(vm.test.price == "" || vm.test.price == undefined){
            vm.test.amount = 0;
            }
            else{
                vm.test.amount = parseFloat(vm.totall - vm.disc);
            }
            
            
        }

        //========================================================================
        // vm.stocks = false;
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
                        // vm.stocks = false;
                        calAMount();
                    } else {
                        if (vm.stockcount >= val) {
                            // vm.stocks = false;
                            calAMount();
                        } else {
                            // vm.stocks = true;
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
        function edit(tst, promoItems, index) { 
            
            // if (vm.stocks == true) {
                var test = {};
                
            // } else { 
                debugger;
                test.price = parseFloat(promoItems.price) * exchangeRate;
                test.productUnit = promoItems.productUnit;
                
                test.tax = promoItems.tax;
                test.amount = parseFloat(tst.amount) * exchangeRate;

                if(promoItems.qty == "" || promoItems.qty == undefined){
                    test.quantity = 0;
                }
                else{
                    test.quantity = promoItems.qty;
                }

                if(tst.discount == "" || tst.discount == undefined){
                    test.discount= 0;
                }
                else{
                    test.discount= tst.discount;
                }
               
                test.olp = tst.olp;
                test.productID = promoItems.prodID;
                test.status = promoItems.status;
                test.productName = promoItems.productName;


                
                EstimateService.ReverseTax(vm.prevProd, ProductArray); 
                EstimateService.editArray(test, index, exchangeRate); // added by dushmantha
                $mdDialog.hide(test);
            // } 
        };
        //==============================================================================

        vm.changeDiscount = changeDiscount;

        function changeDiscount(val) {
            vm.test.discount = val;
            calAMount();
        }

        //==========================================================
        vm.setTax = setTax;

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
            vm.promoItems[0].tax = vm.Ptax;
        }

    }
})();
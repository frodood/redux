(function() {
    'use strict';

    angular
        .module('app.inventory')
        .controller('addProdCtrl', addProdCtrl);


    /** @ngInject */
    function addProdCtrl($scope, $rootScope, InventoryService, $serviceCall, $mdToast, $document, $mdDialog, $mdMedia, $mdSidenav, $state) {
        var vm = this;
        vm.cancel = cancel;
        vm.product = {}
        vm.enableTax = false;
        vm.showProduct = false;
        vm.disableProd = false;
        vm.showMsg = true;
        vm.getqty = false;
        vm.productNotExists = false;
        vm.disableAddProd = false;
        vm.selectedItemChange = selectedItemChange;
        vm.setqty = setqty;
        vm.addproductToarray = addproductToarray;
        vm.getProdDetails = getProdDetails;
        vm.preventDefault = preventDefault;
        loadSettings();
        vm.Sqty = 1;
        vm.Amount = 0;

         vm.prod = {
            "productName": "",
            "productUnit": "Each",
            "quantity": 1,
            "comment": "",
            "storeName": ""
        }

        vm.promoItems = [];
        vm.promoItems.push({
            productName: '',
            productUnit: "Each",
            quantity: 1,
            comment: ''
        });

        vm.quantity = 1;
        vm.promoItems.quantity = vm.quantity;
        
        $scope.$watch("quantity", function() {
            if (vm.quantity != null) {
                vm.showProduct = false;
            }
        });

        vm.comment = "";
        vm.promoItems.quantity = vm.Sqty;
        vm.SProductUnit = "Each";
        vm.UnitOfMeasure = [];

       
        // vm.enableTax = false;
        // vm.displayDiscountLine = true;

        $rootScope.$on('selectedProduct',function(event, args){
            vm.selectedProd = [];
            vm.selectedProd.dis = args.slctdProduct.productName;
            vm.selectedProd.valuep = args.slctdProduct;
            selectedItemChange(args.slctdProduct);
            //do something with product.

        });

        function loadSettings() {
            var settings = $serviceCall.setClient("getAllByQuery", "setting");
            settings.ifSuccess(function(data) {
                addSettigsData(data);
            });
            settings.ifError(function(data) {

            });
            settings.postReq({
                // "setting": "taxes",
                "preference": "productPref,inventoryPref"
            })
        }

        function addSettigsData(val) {
            // vm.displayTax = val[0].preference.invoicePref.enableTaxes;
            // vm.Showdiscount = val[0].preference.invoicePref.enableDisscounts;

            //__________enable or disable tax _______
            // if (vm.DisplayTaxes == true) {
            //     vm.enableTax = false;
            // } else {
            //     vm.enableTax = true;
            // }

            //____________________enable discount ____
            // if (vm.Showdiscount == true) {
            //     vm.displayDiscountLine = false;
            // }

            //__________Add Units to array
            for (var z = val[0].preference.productPref.units.length - 1; z >= 0; z--) {
                if (val[0].preference.productPref.units[z].activate == true)
                    vm.UnitOfMeasure.push(val[0].preference.productPref.units[z])
            };
            //___________Add taxes to array____________________________________________
            // for (var x = val[0].taxes.individualTaxes.length - 1; x >= 0; x--) {
            //     if (val[0].taxes.individualTaxes[x].activate == true)
            //         vm.taxes.push(val[0].taxes.individualTaxes[x]);
            // };
            // for (var y = val[0].taxes.multipleTaxGroup.length - 1; y >= 0; y--) {
            //     if (val[0].taxes.multipleTaxGroup[y].activate == true)
            //         vm.taxes.push(val[0].taxes.multipleTaxGroup[y]);
            // };
            //______________________________________________________________________

        }


        //===========Load Products===========================================
        vm.querySearch = querySearch;
        var proName = [];
        loadAll();

        function querySearch(query) {
            // debugger;
            vm.enter(query)
            var results = [];
            for (var i = 0, len = proName.length; i < len; ++i) {
                results.push(proName[i]);
            }
            return results;
        }


        function loaDProd(val) {
            var client = $serviceCall.setClient("getAllByQuery", "product");
            // debugger;
            client.ifSuccess(function(data) {
                // debugger;
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
                where: "deleteStatus = false and inventory = 'Yes'"
            })
        }

        vm.enter = function(val) {
            vm.Sqty = 1;
            vm.promoItems.productUnit = "Each";
                loaDProd({
                    where: "deleteStatus = false and inventory = 'Yes' and status = 'Active' and productName LIKE '" + val + "%'"
                })
            }
            //==============================================================================================

        //=======Close Dialog====================
        function cancel() {
            $mdDialog.cancel();
        }

        //=================================================
        function selectedItemChange(val) {
            debugger;
            if (vm.selectedProd == null) {
                vm.promoItems = [];
                vm.promoItems.push({
                    productName: '',
                    productUnit: "Each",
                    quantity: 1,
                    comment: ''
                });

                vm.SProductUnit = "Each"
                vm.Sprice = 0;
                // vm.promoItems[0].tax = ({
                // taxName: "No Tax",
                // activate: "True",
                // compound: "False",
                // rate: "0",
                // type: "individualtaxes",
                // ID: "0",
                // individualTaxes: ""
                // });

                // vm.Stax = ({
                //     taxName: "No Tax",
                //     activate: "True",
                //     compound: "False",
                //     rate: "0",
                //     type: "individualtaxes",
                //     ID: "0",
                //     individualTaxes: ""
                // });
            } else {
                debugger;
                vm.getqty = false;
                // vm.promoItems.tax = 0;
                var itemDetails = InventoryService.getArry();
                if (itemDetails.val.length > 0) {
                    for (var i = itemDetails.val.length - 1; i >= 0; i--) {
                        if (itemDetails.val[i].productCode == vm.selectedProd.valuep.productCode) {
                            console.log("you have added this")
                        } else {
                            console.log("no")
                        }
                    }
                }

                // vm.Sprice = vm.selectedProd.valuep.productPrice;
                // if (vm.selectedProd.valuep.productTax == 0) {
                //     vm.Stax = ({
                //         taxName: "No Tax",
                //         activate: "True",
                //         compound: "False",
                //         rate: "0",
                //         type: "individualtaxes",
                //         ID: "0",
                //         individualTaxes: ""
                //     });
                // } else {
                //     vm.Stax = vm.selectedProd.valuep.productTax;
                // }

                vm.SProductUnit = vm.selectedProd.valuep.productUnit
                vm.sprodID = vm.selectedProd.valuep.productID
                debugger;
                vm.promoItems[0] = {
                    productName: val,
                    productUnit: vm.selectedProd.valuep.productUnit,
                    quantity: vm.Sqty,
                    comment: vm.comment
                }

            }
        }

        //=======================================================
        function setqty(val) {
            debugger;
            if (vm.promoItems[0].status == "available") {
                if (vm.selectedProd.valuep.inventory == "Yes") {
                    if (vm.selectedProd.valuep.quantity >= val) {
                        vm.getqty = false;
                        vm.Sqty = val;
                        vm.promoItems[0].quantity = val;
                    } else {
                        vm.getqty = true;

                        vm.quantity = "1";
                    }
                } else {
                    vm.Sqty = val;
                    vm.promoItems[0].quantity = val;
                }
            } else {
                vm.Sqty = val;
                vm.promoItems[0].quantity = val;
            }
            vm.SproductName = vm.selectedProd;
        }
        //===================================================
        // function setUOM(val) {
        //     debugger;
        //     vm.showProduct = false;
        //     vm.SProductUnit = val;
        // }

        //====================================================
        // function setprice(pd) {
        //     vm.showProduct = false;
        //     vm.Sprice = pd;
        //     vm.calAMount();
        // }

        //===================================================
        // function setDiscount(val) {
        //     vm.discount = val;
        //     vm.calAMount();
        // }

        //===================================================
        // function calAMount() {
        //     vm.Amount = 0;
        //     vm.disc = 0;
        //     vm.totall = 0;
        //     vm.totall = vm.Sprice * vm.Sqty;
        //     // if ($rootScope.discounts == "Individual Items") {
        //     vm.disc = parseFloat(vm.totall * vm.discount / 100);
        //     vm.Amount = vm.totall - vm.disc;
        //     // } else {
        //     //     vm.Amount = vm.totall;
        //     // }
        //     // if ($rootScope.currencyStatus == true) {
        //     //     vm.Amount = parseFloat(vm.Amount * $rootScope.exchangeRate);
        //     // }
        //     return (vm.Amount).toFixed(2);
        // }

        //============================================================
        // function setTax(pDis) {
        //     for (var i = vm.taxes.length - 1; i >= 0; i--) {
        //         if (vm.taxes[i].taxName == pDis) {
        //             vm.Ptax = ({
        //                 taxName: pDis,
        //                 activate: vm.taxes[i].activate,
        //                 compound: vm.taxes[i].compound,
        //                 rate: vm.taxes[i].rate,
        //                 type: vm.taxes[i].type,
        //                 ID: vm.taxes[i].taxID,
        //                 individualTaxes: vm.taxes[i].individualTaxes
        //             });
        //         }
        //     };
        //     vm.Stax = vm.Ptax;
        // }

        //====================================================
        function addproductToarray(item) {
            vm.comment = vm.promoItems.comment;
            vm.SProductUnit = vm.promoItems[0].productUnit
            // console.log("addproductToarray");
            // console.log(vm.promoItems[0]);
            // console.log(vm.selectedProd);

            vm.promoItems.productName = vm.promoItems[0].productName.dis;

            if (vm.promoItems[0].status == "available") {
                if (vm.selectedProd.valuep.inventory == "Yes") {
                    if (vm.selectedProd.valuep.quantity >= vm.Sqty) {
                        vm.getqty = false;
                    } else {
                        vm.getqty = true;
                    }
                }
            }
            if (vm.getqty == true) {

            } else {
                vm.disableAddProd = true;
                // console.log("item");
                // console.log(item);
                getProdDetails(item);
            }
        }

        //========================================================
        function getProdDetails(val) {
            debugger;
            if (vm.promoItems[0].productName == null) {
                vm.showProduct = true;
            } else if (vm.promoItems[0].quantity == null) {
                vm.showProduct = true;
            } else if (vm.promoItems[0].productUnit == null) {
                vm.showProduct = true;                
            } else {
                if (vm.selectedProd != null) {
                    vm.disableProd = false;
                    vm.promoItems[0] = {
                        productName: val,
                        productUnit: vm.SProductUnit,
                        quantity: vm.Sqty,
                        comment: vm.comment
                    }
                    console.log(vm.promoItems[0]);
                    InventoryService.setArray({
                        GINno: "",
                        productID: vm.selectedProd.valuep.productID,
                        productName: vm.promoItems[0].productName,
                        comment: vm.promoItems[0].comment,
                        quantity: vm.promoItems[0].quantity,
                        productUnit: vm.promoItems[0].productUnit
                    });
                    $mdDialog.hide();
                } else {
                    // vm.Sstatus = "unavailable";
                    // vm.sprodID = ""

                    // vm.promoItems[0] = {
                    //     productName: val,
                    //     productUnit: vm.SProductUnit,
                    //     quantity: vm.Sqty,
                    //     comment: vm.comment
                    // }

                    // var confirm = $mdDialog.confirm()
                    //     .title('Would you like to save this product for future use?')
                    //     .content('')
                    //     .ariaLabel('Lucky day')
                    //     .targetEvent()
                    //     .ok('save')
                    //     .cancel('cancel');
                    // $mdDialog.show(confirm).then(function(item) {
                    //     vm.showMsg = true;
                    //     callProductService(function(data) {
                    //         if (data) {
                    //             $mdDialog.hide();
                    //         }
                    //     });

                    // }, function() {
                    //     vm.showMsg = false;
                    //     vm.prod.deleteStatus = true;
                    //     callProductService();
                    // });

                    // vm.disableProd = false;
                    // $mdDialog.hide();

                    vm.productNotExists = true;
                    
                }
            }
        }

        //=========================================================
        function callProductService(callBack) {
            vm.prod.productName = vm.promoItems[0].productName;
            vm.prod.productUnit = vm.promoItems[0].productUnit;
            var itemDetails = [];
            itemDetails = InventoryService.getArry();

            vm.itemDetails.todaydate = new Date();
            vm.itemDetails.productLog = {
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
                "product": vm.itemDetails,
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

                InventoryService.setArray({
                    GINno: "",
                    productID: vm.selectedProd.valuep.productID,
                    productName: vm.promoItems[0].productName,
                    comment: vm.promoItems[0].comment,
                    quantity: vm.promoItems[0].quantity,
                    productUnit: vm.promoItems[0].productUnit
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

        function preventDefault() {

        }


    }


})();

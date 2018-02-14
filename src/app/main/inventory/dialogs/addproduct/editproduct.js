(function() {
    'use strict';

    angular
        .module('app.inventory')
        .controller('editNewProd', editNewProd);


    /** @ngInject */
    function editNewProd($scope, $rootScope, InventoryService, item, index, $serviceCall, $mdToast, $document, $mdDialog) {
        var vm = this;
        vm.cancel = cancel;
        vm.test = {};
        vm.index = index;
        vm.test = angular.copy(item);
        vm.prevProd = angular.copy(vm.test);
        console.log(vm.test);

        $rootScope.displayProductName = vm.test.productName;

        vm.promoItems = [];
        vm.promoItems.push({
            productName: vm.test.productName,
            productUnit: vm.test.productUnit,
            quantity: vm.test.quantity,
            comment: vm.test.comment
        });
       
        var ProductArray = angular.copy(InventoryService.getArry());
        vm.edit = edit;

        loadSettings();

        vm.selectedProd = null;
        vm.searchedProd = null;
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

        //=======Close Dialog====================
        function cancel() {

            $mdDialog.hide();
        }

        //=========================Load Settigs=========================================
        vm.taxes = [];
        vm.UnitOfMeasure = [];
        vm.enableTax = false;
        vm.displayDiscountLine = true;
       

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
                addSettingsData(data);
            });
            settings.ifError(function(data) {

            });
            settings.postReq({
                "preference": "productPref,inventoryPref"
            })
        }

        function addSettingsData(val) {
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

        $scope.$on('$destroy', function() {
            $rootScope.displayProductName = "";
        });

        //=================================================
        function selectedItemChange(val) {
            
            

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

                vm.SProductUnit = vm.selectedProd.valuep.productUnit;
                vm.sprodID = vm.selectedProd.valuep.productID;
                vm.Sqty = 1;
                debugger;
                vm.promoItems[0] = {
                    productName: val,
                    productUnit: vm.selectedProd.valuep.productUnit,
                    quantity: vm.Sqty,
                    comment: vm.comment
                }

            }
        }

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
                    } else {
                        if (vm.stockcount >= val) {
                            vm.stocks = false;
                        } else {
                            vm.stocks = true;
                        }
                    }
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
        function edit(tst, index, proNam) {
            
            console.log(vm.promoItems[0]);
            console.log(proNam);

            if(proNam === undefined){
                vm.promoItems[0].productName = vm.promoItems[0].productName;
            }
            else{
                vm.promoItems[0].productName = proNam;
            }

            var test = {};
            test.productName = vm.promoItems[0].productName;
            test.quantity = vm.promoItems[0].quantity;
            test.productUnit = vm.promoItems[0].productUnit;
            test.comment = vm.promoItems[0].comment;
            test.productID = tst.productID;
            console.log(test)

            debugger;
            if (vm.stocks == true) {} else {                
                // InventoryService.removeArray(vm.promoItems[0], index);
                InventoryService.editArray(test ,index);
                    // if ($rootScope.termType) {
                    //     if ($rootScope.termType == "multipleDueDates") {
                    //         $scope.UpdateDates();
                    //     }
                    // }
                $mdDialog.hide(test);
            }

        };
        //==============================================================================

        // vm.changeDiscount = changeDiscount;

        // function changeDiscount(val) {
        //     vm.test.discount = val;
        //     calAMount();
        // }

        //==========================================================
        // vm.setTax = setTax;

        // function setTax(pDis){
        //     for (var i = vm.taxes.length - 1; i >= 0; i--) {
        //         if (vm.taxes[i].taxName == pDis) {
        //             var activate = vm.taxes[i].activate;
        //             var compound = vm.taxes[i].compound;
        //             var rate = vm.taxes[i].rate;
        //             var type = vm.taxes[i].type;
        //             var individualTaxes = vm.taxes[i].individualTaxes;

        //             vm.Ptax = ({
        //                 taxName: pDis,
        //                 activate: activate,
        //                 compound: compound,
        //                 rate: rate,
        //                 type: type,
        //                 individualTaxes: individualTaxes
        //             });
        //         }
        //     };
        //     vm.test.tax = vm.Ptax;
        // }

    }
})();

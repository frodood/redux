(function()
{
	'use strict';

	angular
		.module('app.core')
		.controller('MsProductLineItemController', MsProductLineItemController)
		.directive('msProductLineItem', msProductLineItem);

	/** @ngInject */
	function msProductLineItem()
	{
		var productlookupDirective = {
			restrict   : 'EA',
			scope: {
                msappName : "=",
                mslineitemtype : "=",
                msselectedlineitem : "=",
                mscurrencydetails : "="
			},
			transclude : false,
			controller : MsProductLineItemController,
			controllerAs : 'vm',
			bindToController : true
		};

		return productlookupDirective;
	}

	/** @ngInject */
	function MsProductLineItemController($rootScope, $scope, $element, $attrs, $serviceCall, $mdDialog, $mdToast, $document, InvoiceService, invoiceMultipleDueDatesService, creditnoteService, EstimateService){
        var vm = this;

        vm.cancel = cancel;
        vm.product = {};
        vm.enableTax = false;
        vm.showProduct = false;
        vm.disableProd = false;
        vm.showMsg = true;
        vm.getqty = false;
        vm.disableAddProd = false;
        vm.newProductPermission = false;
        vm.setqty = setqty;
        vm.setprice = setprice;
        vm.setDiscount = setDiscount;
        vm.setUOM = setUOM;
        vm.calAMount = calAMount;
        vm.setTax = setTax;
        vm.customError = "";
        vm.submit = submit;
        vm.getProdDetails = getProdDetails;
        vm.searchProduct = searchProduct;
        var productCollection = [];
        vm.selctedProd = null;
        vm.searchedProd = null;
        vm.selectedProduct = {};
        vm.selectedProduct.display = "";
        vm.qty = "";
        vm.Sqty = "";
        vm.cannoteditProductName = false;

        if(vm.mslineitemtype === 'new line'){
            vm.productHeader = 'New';
        }
        if(vm.mslineitemtype === 'edit line'){
            vm.Sqty = vm.qty;
        }
        
        loadSettigns();
        $element.bind('click', function(event) {
            $mdDialog.show({
                templateUrl: 'app/core/directives/ms-product-line-item/ms-product-lineItem.html',
                targetEvent: event,
                controller: function() {
                    return vm;
                },
                controllerAs: 'vm',
                clickOutsideToClose: false
            });
        });
     
        $scope.$watch('vm.mscurrencydetails', function(newVal) {
                
                console.log(newVal);
                if (newVal) {
                    vm.mscurrencydetails = newVal;
                    console.log(vm.mscurrencydetails);

                if (!vm.mscurrencydetails.isCurrencyChanged) {
                    vm.baseCurrency = vm.mscurrencydetails.baseCurrency;
                } else {
                    vm.baseCurrency = vm.mscurrencydetails.changedCurrency;
                }

                };
        }, true);

        
        if(vm.mslineitemtype === 'edit line'){
            
             vm.productHeader = 'Edit';

            vm.msselectedlineitem = function(prodline, index) {
                editProduct(prodline, index);
            };
            // loadSettigns();
        }

        function editProduct(prodline, index){
            vm.index = index;
            // vm.Sqty = parseFloat(vm.qty);
           
            
            if(vm.msappName === 'Credit Notes'){
                vm.ProductArray = angular.copy(creditnoteService.getArry());
            }
            if(vm.msappName === 'Invoices'){
                vm.ProductArray = angular.copy(InvoiceService.getArry());
            }
            if(vm.msappName === 'Estimates'){
                vm.ProductArray = angular.copy(EstimateService.getArry());
            }
            
            console.log(vm.mscurrencydetails.exchangeRate);
            vm.editprod = angular.copy(prodline);
            console.log(vm.editprod);
            vm.editprod.price = parseFloat(vm.editprod.price / vm.mscurrencydetails.exchangeRate);
            // vm.selctedProd.dis = vm.test.productName;
             if(vm.msappName === 'Invoices'){
                vm.selectedProduct.display = vm.editprod.productName;
             }
             if(vm.msappName === 'Credit Notes'){
                 vm.selectedProduct.display = vm.editprod.productName;
             }
             if(vm.msappName === 'Estimates'){
                 vm.selectedProduct.display = vm.editprod.productName;
             }
             
            vm.promoItems = [];
            vm.promoItems.push({
                productName: vm.editprod.productName,
                price: vm.editprod.price,
                tax: vm.editprod.tax,
                ProductUnit: vm.editprod.productUnit,
                qty: vm.editprod.quantity,
                discount: vm.editprod.discount,
                olp: vm.editprod.olp,
                status: vm.editprod.status,
                prodID: vm.editprod.productID
            });
        
            vm.prevProd = angular.copy(prodline);
            vm.discount = vm.editprod.discount;
            vm.Sprice = vm.editprod.price;
            
            vm.qty = parseFloat(vm.editprod.quantity);
            vm.Sqty =  vm.qty;
            vm.olp = vm.editprod.olp;
        
            vm.Stax = vm.editprod.tax;
            setDiscount(vm.editprod.discount);
            setqty(vm.Sqty);
            setTax(vm.Stax);
        }
        
        //this can be the main function which takes in diffrenet queries.
        function loadProduct(queryBody, searchedItem) {

            var getProductsSrvc =  $serviceCall.setClient("getAllByQuery","product"); 

            getProductsSrvc.skip("0");
            getProductsSrvc.take("10");
            getProductsSrvc.orderby("productCode");
            getProductsSrvc.isAscending("false");

            return getProductsSrvc.getSearch(queryBody).then(function(response){
              
                productCollection = [];

                var data = response.data.result;
                console.log(data);

                for (var i = 0, len = data.length; i < len; ++i) {
                    productCollection.push({
                     display: data[i].productName,
                    	value: data[i]           
                    });
                }

                vm.cannoteditProductName = false;

                if(productCollection.length <= 0){
                    // console.log(searchedItem);
                    
                    vm.searchedProd = searchedItem;
                    if(vm.mslineitemtype === 'new line' ){
                        if(vm.msappName !== 'Credit Notes'){
                            if (vm.selctedProd.dis != vm.searchedProd) {
                            setProduct("new-product")
                            }
                        }
                    }

                    
                }

                return productCollection

            },function(results){
                console.log(results);
            }) 
        }

         //========================================================================
         //FOR EDIT 
        // vm.stocks = false;
        // vm.stockcount = 0;
        // vm.checkStock = function(val) {
        //     var client = $serviceCall.setClient("getAllByQuery", "product");
        //     client.ifSuccess(function(data) {
        //         for (var i = data.result.length - 1; i >= 0; i--) {
        //             if (data.result[i].productName.toLowerCase() == item.productName.toLowerCase()) {
        //                 vm.checkAvaialability = true;
        //                 vm.checkavailableStock = data.result[i].inventory;
        //                 vm.stockcount = parseInt(data.result[i].quantity);
        //             }
        //         }
        //         if (vm.checkAvaialability == true) {
        //             if (vm.checkavailableStock == "No") {
        //                 vm.stocks = false;
        //                 calAMount();
        //             } else {
        //                 if (vm.stockcount >= val) {
        //                     vm.stocks = false;
        //                     calAMount();
        //                 } else {
        //                     vm.stocks = true;
        //                 }
        //             }
        //         } else {
        //             calAMount();

        //         }
        //     });
        //     client.ifError(function(data) {
        //         console.log("Error")
        //     });
        //     client.skip(0);
        //     client.take(10);
        //     client.orderby("productCode");
        //     client.isAscending(false);
        //     client.postReq({
        //         where: "deleteStatus = 'false' and status = 'Active'"
        //     });
        // }

        function searchProduct(loadOrigin, searchTxt){
        	if(searchTxt === '' || searchTxt === undefined){
        		return loadProduct({where : "status = 'Active' and deleteStatus = false"});
        	}else{
        		return loadProduct({where : "deleteStatus = false and status = 'Active' and productName LIKE"+"'"+searchTxt+"%'"},searchTxt);
        	}
        }

        vm.selectedItemChange = selectedItemChange;

		function selectedItemChange(obj){
        
            console.log(obj);
            vm.selctedProd = [];
            vm.selctedProd.dis = obj.value.productName;
            vm.selctedProd.valuep = obj.value;
      
            if(vm.mslineitemtype === 'new line'){
                if (vm.selctedProd.dis != vm.searchedProd) {
                    setProduct("selected-product")
                }
            }
           
            if (vm.mscurrencydetails.isCurrencyChanged) {
                vm.selctedProd.valuep.productPrice = parseFloat((vm.selctedProd.valuep.productPrice / vm.mscurrencydetails.exchangeRate)); //removed 7_19 .toFixed(2)

            }

            selectedproductLineItem(vm.selctedProd.dis)
        }

        function selectedproductLineItem(val){
            vm.qty = 1; //added by dushmatha
            vm.Sqty = 1; //added by dushmatha
            vm.discount = 0;
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
                
                if(vm.msappName === 'Credit Notes'){
                    var prodArr = creditnoteService.getArry();
                }
                if(vm.msappName === 'Invoices'){
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
                }
                if(vm.msappName === 'Estimates'){
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
        
        function setProduct(InputType) {
            if (InputType == "new-product") {
                if(vm.msappName !== 'Credit Notes'){
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
                vm.calAMount();
                }
                else{
                    vm.newProductPermission = true;
                }
                
            } else if (InputType == "selected-product") {
                vm.searchedProd = null;
            }
        }

        function calAMount() {
          
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

        //=======================================================
        function setqty(val) {
    
            if (vm.promoItems[0].status == "available") {
                if(vm.mslineitemtype === 'new line'){
                     if (vm.selctedProd.valuep.inventory == "Yes") {
                    if (vm.selctedProd.valuep.quantity >= val) {
                        vm.getqty = false;
                        vm.Sqty = val;
                        vm.promoItems[0].qty = val;
                    } else {
                        vm.getqty = true;

                        vm.qty = "";
                    }
                    } else {
                        vm.Sqty = val;
                        vm.promoItems[0].qty = val;
                    }
                }
               
                if(vm.mslineitemtype === 'edit line'){
                        vm.Sqty = parseFloat(val);
                        vm.promoItems[0].qty = val;
                }
               
            } else {
                vm.Sqty = parseFloat(val);
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

        vm.qty = 1;
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

        function defaultproductlinedetails(){
            vm.promoItems = [];

        if(vm.mslineitemtype === 'new line'){
        
            vm.promoItems.push({
            productName: '',
            price: 0,
            tax: '',
            ProductUnit: "Each",
            qty: 1,
            discount: '',
            olp: '',
            status: '',
            prodID: ''
        });

        vm.SProductUnit = "Each"
        vm.Sprice = 0;
        //start added by dushmantha
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
        vm.Stax = ({
            taxName: "No Tax",
            activate: "True",
            compound: "False",
            rate: "0",
            type: "individualtaxes",
            ID: "0",
            individualTaxes: ""
        });

        }
        }

        defaultproductlinedetails();
        

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

        //=======Close Dialog====================
        function cancel() {
            vm.selectedProduct = {};
            vm.selectedProduct.display = "";
            defaultproductlinedetails();
            vm.newProductPermission = false;
            vm.Amount = 0;
            vm.cannoteditProductName = false;
            vm.customError = false;
            vm.showProduct = false;
            vm.getqty = false;
            vm.cannoteditProductName =false;
            $mdDialog.cancel();
        }

        //====================================================
        function submit(item) {

            if(vm.mslineitemtype === 'new line'){
                if (vm.searchedProd != item && vm.searchedProd != null) {
                item = vm.searchedProd;
                
                }
            if (item == undefined || item == "") {
                vm.customError = "Please select a product to continue";
                return;

            } else if (item.length < 3) {
                vm.customError = "Product name should equal or greater than 3 characters";
                return;  
            } 
            else {
                vm.customError = "";
            }
    

            vm.promoItems[0].price =  parseFloat(vm.promoItems[0].price) *  parseFloat(vm.mscurrencydetails.exchangeRate);
            console.log(vm.promoItems[0].price);
            if (vm.promoItems[0].status == "available") {
                if(vm.msappName!== 'Credit Notes'){
                    if (vm.selctedProd.valuep.inventory == "Yes") {
                    if (vm.selctedProd.valuep.quantity >= vm.Sqty) {
                        vm.getqty = false;
                    } else {
                        vm.getqty = true;
                    }
                    }
                }
            }
            if (vm.getqty == true) {

            } else {
                vm.disableAddProd = true;
                getProdDetails(item);
            }

            }
            
            if(vm.mslineitemtype === 'edit line'){
                
                if (vm.promoItems[0].productName == null) {
                    vm.showProduct = true;
                } else if (vm.promoItems[0].qty == null) {
                    vm.showProduct = true;
                } else if (vm.promoItems[0].ProductUnit == null) {
                    vm.showProduct = true;
                } else if (isNaN(vm.promoItems[0].price) || vm.promoItems[0].price == "0") {
                    vm.showProduct = true;     

                }
                else{
                if(vm.discount == undefined || vm.discount == ""){
                vm.discount = 0;
                }
                var test = {};
          
                test.price = parseFloat(vm.promoItems[0].price) * vm.mscurrencydetails.exchangeRate;
                test.amount = parseFloat(test.amount) * vm.mscurrencydetails.exchangeRate;
                test.productUnit = vm.promoItems[0].ProductUnit;
                
                if(vm.Stax !== undefined){
                    test.tax = vm.Stax;
                }
                else{
                     test.tax = vm.promoItems[0].tax;
                }
                
          
                test.amount = parseFloat(vm.Amount) * vm.mscurrencydetails.exchangeRate;

                if(vm.promoItems[0].qty == "" || vm.promoItems[0].qty == undefined){
                    test.quantity = 1;
                }
                else{
                    test.quantity = vm.promoItems[0].qty;
                }

                if(vm.discount == "" || vm.discount == undefined){
                    test.discount= 0;
                }
                else{
                    test.discount= vm.discount;
                }
              
                if(vm.productSearchText === vm.promoItems[0].productName){
                     test.productName = vm.promoItems[0].productName;

                test.olp = vm.olp;
                test.productID = vm.promoItems[0].prodID;
                test.status = vm.promoItems[0].status;

                console.log(test);
                console.log(vm.ProductArray);
                console.log(vm.prevProd);
                if(vm.msappName === 'Invoices'){
                InvoiceService.ReverseTax(vm.prevProd, vm.ProductArray); 
                InvoiceService.editArray(test, vm.index, vm.mscurrencydetails.exchangeRate); // added by dushmantha
                }

                if(vm.msappName === 'Credit Notes'){
                creditnoteService.ReverseTax(vm.prevProd, vm.ProductArray); 
                creditnoteService.editArray(test, vm.index, vm.mscurrencydetails.exchangeRate); // added by dushmantha
                }

                if(vm.msappName === 'Estimates'){
                EstimateService.ReverseTax(vm.prevProd, vm.ProductArray); 
                EstimateService.editArray(test, vm.index, vm.mscurrencydetails.exchangeRate); // added by dushmantha
                }

                $scope.$emit('editProductActivity', 'edit');
                $mdDialog.hide(); 
                }
                else{
                        vm.cannoteditProductName = true;

                }

                
        
                

            }    
                 
            }
        }

        //========================================================
        function getProdDetails(val) {
  
            console.log(vm.promoItems[0].price);
     
            
            if (vm.promoItems[0].productName == null) {
                vm.showProduct = true;
            } else if (vm.promoItems[0].qty == null) {
                vm.showProduct = true;
            } else if (vm.promoItems[0].ProductUnit == null) {
                vm.showProduct = true;
            } else if (isNaN(vm.promoItems[0].price) || vm.promoItems[0].price == "0") {
                vm.showProduct = true;
            } else {
                if(vm.discount == undefined || vm.discount == ""){
                     vm.discount = 0;
                }
                if (vm.selctedProd != null && vm.selctedProd.dis != undefined) {
                    vm.disableProd = false;

                    var priceforset   =(parseFloat(vm.promoItems[0].price)); ////removed 7_19 .toFixed(2)
                    var amountfrotest =(parseFloat(vm.Amount) * parseFloat(vm.mscurrencydetails.exchangeRate) );  //removed 7_19 .toFixed(2)

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
                    if(vm.msappName === 'Invoices'){
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
                    }

                    if(vm.msappName === 'Estimates'){
                        EstimateService.setFullArr({
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
                    }
                    
                    if(vm.msappName === 'Credit Notes'){
                        creditnoteService.setFullArr({
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
                    }
                   
                    // updateDueDates();
                    
                    vm.selectedProduct.display = undefined;
                    vm.newProductPermission = false;
                    defaultproductlinedetails();
                    vm.Amount = 0;
                    vm.olp = "";
                    $scope.$emit('addProductActivity', 'add');
                    $mdDialog.hide();
                    
                } else {
                    
                    if(vm.msappName !== 'Credit Notes'){
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
                                vm.selectedProduct = {};
                                vm.selectedProduct.display = "";
                                defaultproductlinedetails();
                                vm.Amount = 0;
                                vm.olp = "";
                                $scope.$emit('addProductActivity', 'add');
                                $mdDialog.hide();
                            }
                        });

                    }, function() {
                        
                        vm.showMsg = false;
                       if(vm.mscurrencydetails.baseCurrency !== vm.mscurrencydetails.changedCurrency){
                            vm.promoItems[0].price = vm.promoItems[0].price * vm.mscurrencydetails.exchangeRate;
                            vm.Amount = vm.Amount * vm.mscurrencydetails.exchangeRate;
                        }
                        //vm.prod.deleteStatus = true;
                        //callProductService();
                        //Start added by dushmatha
                        console.log(vm.promoItems[0].price);
                        if(vm.msappName === 'Invoices'){
                            InvoiceService.setFullArr({
                            invoiceNo: "",
                            productID: "",
                            // productName: vm.promoItems[0].productName,
                            productName : vm.productSearchText,
                            price: vm.promoItems[0].price,
                            quantity: vm.promoItems[0].qty,
                            productUnit: vm.promoItems[0].ProductUnit,
                            discount: vm.discount,
                            tax: vm.promoItems[0].tax,
                            olp: vm.promoItems[0].olp,
                            amount: vm.Amount,
                            status: "Temporary"
                            });
                        }

                        if(vm.msappName === 'Estimates'){
                            EstimateService.setFullArr({
                            invoiceNo: "",
                            productID: "",
                            // productName: vm.promoItems[0].productName,
                            productName: vm.productSearchText,
                            price: vm.promoItems[0].price,
                            quantity: vm.promoItems[0].qty,
                            productUnit: vm.promoItems[0].ProductUnit,
                            discount: vm.discount,
                            tax: vm.promoItems[0].tax,
                            olp: vm.promoItems[0].olp,
                            amount: vm.Amount,
                            status: "Temporary"
                            });
                        }


                        
                        //vm.promoItems[0].status
                        //End added by dushmantha
                        vm.selectedProduct = {};
                        vm.selectedProduct.display = "";
                        defaultproductlinedetails();
                        vm.Amount = 0;
                        vm.olp = "";
                        $scope.$emit('addProductActivity', 'add');

                       
                    });

                    vm.disableProd = false;
                  
                    $mdDialog.hide();
                    }
                    else{
                        vm.newProductPermission = true;
                    }
                    
                }
            }
        }
        //=========================================================

        //=========================================================
        function callProductService(callBack) {
           
            // vm.prod.productName = vm.promoItems[0].productName;
            vm.prod.productName = vm.productSearchText;
            vm.prod.productPrice = vm.promoItems[0].price;
            vm.prod.productUnit = vm.promoItems[0].ProductUnit;

            if(vm.mscurrencydetails.baseCurrency !== vm.mscurrencydetails.changedCurrency){
               vm.prod.productPrice = vm.prod.productPrice * vm.mscurrencydetails.exchangeRate;
               vm.Amount = vm.Amount * vm.mscurrencydetails.exchangeRate;
               console.log(vm.prod.productPrice);
            }
            var prodArr = [];
            if(vm.msappName === 'Invoices'){
                prodArr = InvoiceService.getArry();
            }
            if(vm.msappName === 'Estimates'){
                prodArr = EstimateService.getArry();
            }
            
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

                if(vm.msappName === 'Invoices'){
                    InvoiceService.setFullArr({
                    invoiceNo: "",
                    productID: data.ID,
                    // productName: vm.promoItems[0].productName,
                    productName : vm.productSearchText,
                    price: vm.prod.productPrice,
                    quantity: vm.promoItems[0].qty,
                    productUnit: vm.promoItems[0].ProductUnit,
                    discount: vm.discount,
                    tax: vm.promoItems[0].tax,
                    olp: vm.promoItems[0].olp,
                    amount: vm.Amount,
                    status: vm.promoItems[0].status
                    });
                }

                if(vm.msappName === 'Estimates'){
                    EstimateService.setFullArr({
                    invoiceNo: "",
                    productID: data.ID,
                    // productName: vm.promoItems[0].productName,
                    productName : vm.productSearchText,
                    price: vm.prod.productPrice,
                    quantity: vm.promoItems[0].qty,
                    productUnit: vm.promoItems[0].ProductUnit,
                    discount: vm.discount,
                    tax: vm.promoItems[0].tax,
                    olp: vm.promoItems[0].olp,
                    amount: vm.Amount,
                    status: vm.promoItems[0].status
                    });
                }
                // updateDueDates();
                callBack(true);
                //$mdDialog.hide();
            });
            client.ifError(function(data) {
             
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

        

        

    };

    })();

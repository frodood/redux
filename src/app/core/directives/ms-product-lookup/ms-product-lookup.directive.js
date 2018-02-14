(function()
{
	'use strict';

	angular
		.module('app.core')
		.controller('MsProductLookupController', MsProductLookupController)
		.directive('msProductLookup', msProductLookup);

	/** @ngInject */
	function msProductLookup()
	{
		var productlookupDirective = {
			restrict   : 'EA',
			scope: {
				placeholder : '=',
				required : '=',
				editoptions : '='
			},
			transclude : true,
			templateUrl: 'app/core/directives/ms-product-lookup/ms-product-lookup.html',
			controller : MsProductLookupController,
			controllerAs : 'vm',
			bindToController : true
		};

		return productlookupDirective;
	}

	/** @ngInject */
	function MsProductLookupController($rootScope, $scope, $element, $attrs, $serviceCall, $mdDialog){
		var vm = this;

		vm.selectedItemChange = selectedItemChange;
		vm.searchProduct = searchProduct;
		vm.createNewProduct = createNewProduct;
		vm.selectedProduct = {};

		var selectedItemSpecifics;

		var productCollection = []; //all products will be loaded into this array.

    vm.selectedProduct = {display:$rootScope.displayProductName}; //tempory solution for edit product name preselected by divani
    
		var externalSlctdProduct = $rootScope.$on('extupslctprd',function(event, args){
            vm.selectedProduct = {};
			vm.selectedProduct = args;
			vm.productSearchText = args.display;
			console.log(vm.selectedProduct);
        });

        $rootScope.$on('$destroy', function() {
            externalSlctdProduct();
        });

		function selectedItemChange(product){
			console.log(product);
			$scope.$emit('selectedProduct', {slctdProduct : product.value});
		}

		function createNewProduct(newProductSearchTxt){
			console.log(newProductSearchTxt);
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

                for (var i = 0, len = data.length; i < len; ++i) {
                    productCollection.push({
                        display: data[i].productName,
                    	value: data[i]           
                    });
                }

                if(productCollection.length <= 0){
                	// console.log(searchedItem);
                	$rootScope.$broadcast('dirupsnewprod',searchedItem);
                }

                return productCollection

            },function(results){
                console.log(results);
            }) 
        }

        function searchProduct(loadOrigin, searchTxt){

        	if(loadOrigin === 'default'){
        		return loadProduct({where : "status = 'Active' and deleteStatus = false"});
        	}else{
        		return loadProduct({where : "deleteStatus = false and inventory = 'Yes' and status = 'Active' and productName LIKE"+"'"+searchTxt+"%'"},searchTxt);
        	}
        }

	};
 
})();

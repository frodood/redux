(function ()
{
    'use strict';

    angular
        .module('app.inventory')
        .factory('InventoryService', InventoryService);

    /** @ngInject */
    function InventoryService($rootScope)
    {

    	var productArray = {val: []};
	    // var editProdArray = {val:[]};
	    // var taxArr = [];
	    var compountTrue = [];
	    // var finalAmount = 0;
    	// var total = 0;
    	// var tax = 0;

    	return {
	        setArray: function(newVal) {
	            productArray.val.push(newVal);
	            return productArray;
	        },
	        getArry: function(){
	        	return productArray;
	        },
	        removeArray: function(newVals, index) {
            	productArray.val.splice(productArray.val.indexOf(newVals), 1);
            	return productArray;
        	},
        	removeAll:function(newVals){
        		productArray.val.splice(newVals);
        		return productArray;
        	},
        	setEditProdArr : function(newVal){
        		editProdArray.val.push(newVal);
        		return editProdArray;
        	},
        	removeEditProdArr: function(newVal, index){
        		editProdArray.val.splice(editProdArray.val.indexOf(newVals), 1);
            	return editProdArray;
        	}, 
            setFullArr: function(obj){
                this.setArray(obj);
                
			},
			editArray: function(newVals, index) {
				productArray.val[index].productName = newVals.productName;
				productArray.val[index].quantity = newVals.quantity;
				productArray.val[index].productUnit = newVals.productUnit;
				productArray.val[index].comment = newVals.comment;
				productArray.val[index].productID = newVals.productID;
			
			}
    	}
    }

})();
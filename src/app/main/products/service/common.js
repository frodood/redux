(function(){
	'use strict';

    angular
        .module('app.products')
        .factory('commonFact', commonFact);

    /** @ngInject */
    function commonFact(){
    	var service = {
    		sortItems : sortItems
    	}

    	return service;

    	function sortItems(arr,key){
    		if (!key) {
    			return arr.sort();
    		}
    		else if (arr.isArray() && arr.length > 0) {
    			return arr.sort(function(a,b){
    				return b[key] - a[key];
    			})
    		}
    	}
    }

})();
(function ()
{
    'use strict';

    angular
        .module('app.core')
        .filter('toTrusted', toTrustedFilter)
        .filter('htmlToPlaintext', htmlToPlainTextFilter)
        .filter('nospace', nospaceFilter)
        .filter('humanizeDoc', humanizeDocFilter)
        .filter('toDateObject', toDateObject)
        .filter('toTimeObject', toTimeObject)
		.filter('removeSpaces', removeSpaces)
        .filter('removeSpaceLowercase', removeSpaceLowercase)
        .filter('isEmptyObj', isEmptyObj)
        .filter('toArray', toArray)
        .filter('valRndUp', valueRoundUp)
        .filter('qtyRndUp', quantityRoundUp)
        .filter('unitPriceRndUp', unitPriceRoundUp)
        .filter('timeFormate', timeFormate);

    function addCommas(nStr){
        nStr += '';
        var x = nStr.split('.');
        var x1 = x[0];
        var x2 = x.length > 1 ? '.' + x[1] : '';
        var rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ',' + '$2');
        }
        return x1 + x2;
    }

    /** @ngInject */
    function unitPriceRoundUp(profileSettingsContextService){
        return function (input) {
            if(isNaN(input)) return input;
            var unitPlaces = profileSettingsContextService.getGlblDecimalPlaces();
            var unitpriceDecimalPlaces = parseInt(unitPlaces.unitDecimalPlaces);
         
            var factor = "1" + Array(+(unitpriceDecimalPlaces > 0 && unitpriceDecimalPlaces + 1)).join("0");
            // parseFloat(vm.test.netAmount).toFixed(2);
       
            // return Math.round(parseFloat((input * factor) / factor).toFixed(unitpriceDecimalPlaces))
            if(Number.isInteger(input) === false){
                return addCommas(((input * factor) / factor).toFixed(unitpriceDecimalPlaces));
                
            }
            else{
                return addCommas(((input * factor) / factor).toFixed(2));
            }
            
            
        };
    }

    /** @ngInject */
    function quantityRoundUp(profileSettingsContextService){
        return function (input) {
            if(isNaN(input)) return input;
            var input = parseFloat(input);
            var qtyplaces = profileSettingsContextService.getGlblDecimalPlaces();
            var quantityDecimalPlaces = parseInt(qtyplaces.quantityDecimalPlaces);
            var factor = "1" + Array(+(quantityDecimalPlaces > 0 && quantityDecimalPlaces + 1)).join("0");
            // return Math.round(input * factor) / factor;
            if(Number.isInteger(input) === false){
             
                return ((input * factor) / factor).toFixed(quantityDecimalPlaces);
            }
            else{
             
                return ((input * factor) / factor).toFixed(2);
            }
        };
    }

    /** @ngInject */
    function valueRoundUp(profileSettingsContextService){
        return function (input) {
            if(isNaN(input)) return input;
            var valueplaces = profileSettingsContextService.getGlblDecimalPlaces();
            var valueDecimalPlaces = parseInt(valueplaces.valueDecimalPlaces);
            var factor = "1" + Array(+(valueDecimalPlaces > 0 && valueDecimalPlaces + 1)).join("0");
            // return Math.round(input * factor) / factor;
             return addCommas(((input * factor) / factor).toFixed(valueDecimalPlaces));
           
        };
    }

    /** @ngInject */
    function removeSpaceLowercase(){
        return function (text) {
            var str = text.replace(/\s+/g, '');
            return str.toLowerCase();
        };
    }

    /** @ngInject */
    function toArray(){
        return function (input) {
            if (!input) {
                return [];
            }
            return Object.keys(input);
        };
    }

    /** @ngInject */
    function isEmptyObj(){
        var cell;
        return function(obj){
            for (cell in obj){
                if(obj.hasOwnProperty(cell)){
                    return false;
                }
            }
            return true;
        };
    }
		
	/** @ngInject */
    function removeSpaces(){
        return function(string) {
			if (!angular.isString(string)) {
				return string;
			}
			return string.replace(/[\s]/g, '');
		};
	}

    /** @ngInject */
    function toDateObject($filter){
        return function(value) {
            var datenow = moment(value);

            if(datenow.isValid){
                var tempDate = new Date(datenow);
                return $filter('date')(tempDate, 'MMM d, y');
            }
        };
    }

    /** @ngInject */
    function toTimeObject($filter){
        return function(value) {
            var timenow = moment(value);

            if(timenow.isValid){
                var tempTime = new Date(timenow);
                return $filter('date')(tempTime, 'h:mma');
            }
        };
    }

    /** @ngInject */
    function toTrustedFilter($sce)
    {
        return function (value)
        {
            return $sce.trustAsHtml(value);
        };
    }

    /** @ngInject */
    function htmlToPlainTextFilter()
    {
        return function (text)
        {
            return String(text).replace(/<[^>]+>/gm, '');
        };
    }

    /** @ngInject */
    function nospaceFilter()
    {
        return function (value)
        {
            return (!value) ? '' : value.replace(/ /g, '');
        };
    }

    /** @ngInject */
    function humanizeDocFilter()
    {
        return function (doc)
        {
            if ( !doc )
            {
                return;
            }
            if ( doc.type === 'directive' )
            {
                return doc.name.replace(/([A-Z])/g, function ($1)
                {
                    return '-' + $1.toLowerCase();
                });
            }
            return doc.label || doc.name;
        };
    }

    function timeFormate(){

        return function (totalHour)
        {
            var fullHour = totalHour.split(".")[0] || 0,
                fullMin  = totalHour.split(".")[1] || 0
            
            return(angular.copy( fullHour + "h " + fullMin + "m "));
        }
        
    }

})();

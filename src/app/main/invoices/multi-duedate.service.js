(function ()
{
    'use strict';
    angular
        .module('app.invoices')
        .factory('invoiceMultipleDueDatesService', invoiceMultipleDueDatesService);

    /** @ngInject */
    function invoiceMultipleDueDatesService($rootScope)
    {
        var dateArray = {
        val: []
        };
        var getDateArr = {
            val: []
        };
        //$rootScope.showmsg = false;
        return {

            // latest invoice factory
            setDateArray: function(newVal) {
            // latest invoice factory
                dateArray.val.push(newVal);
                return dateArray;
            },
            setDateArrayTwo: function(newVal) {
                dateArray.val.push(newVal);
                return dateArray;
            },
            clearInvoiceMultiDateArray: function() {
                $rootScope.checkArr = [];
                dateArray.val = [];
                console.log(dateArray);
                return dateArray;
            },
            removeDateArray: function(newVals, index) {
                dateArray.val.splice(dateArray.val.indexOf(newVals), 1);
                return dateArray;
            },
            removeAllTheDates : function(newVals){
                dateArray.val.splice(newVals);
                return dateArray;
            },

            getArry: function(){
                return dateArray;
            },

            calDateArray: function(val) {
                //$rootScope.showmsg = false;
                var calPercentatge = 0;
                for (var i = $rootScope.checkArr.length - 1; i >= 0; i--) {
                    calPercentatge += parseFloat($rootScope.checkArr[i].percentage);
                };
                if (calPercentatge == 100) {
                    this.setDateArray(val);
                } else {
                    $rootScope.showmsg = true;
                }
            },
        }
    }
})();
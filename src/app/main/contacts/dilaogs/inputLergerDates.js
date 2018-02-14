  (function ()
  {
    'use strict';

    angular
        .module('app.contacts')
        .controller('DialogControllerLeger', DialogControllerLeger);

    function DialogControllerLeger($mdDialog,$serviceCall,$mdToast,dateFrom,dateTo)
    {
      debugger;
      var vm=this;

      vm.cancelDialog = cancelDialog;

      vm.submitLegerDates = submitLegerDates;

      vm.dFrom=new Date(dateFrom);
      vm.dTo=new Date(dateTo);

      // var temp = (moment.utc(dateFrom));
      // var tempE = (moment.utc(dateTo));


      function cancelDialog() {
        $mdDialog.cancel();
      }


      function submitLegerDates(skip, take,dateFrom, dateTo){
        debugger;

        // dateFrom = moment(dateFrom).format('YYYY-MM-DD HH:mm:ss');
        // dateTo = moment(dateTo).format('YYYY-MM-DD HH:mm:ss');

        console.log(dateFrom);
        console.log(dateTo);

        var dFrom= vm.dFrom.toISOString();
        var dTo = vm.dTo.toISOString();

        var serviceObj = {
            "skip" : skip,
            "take" : take,
            "dFrom" : dFrom,
            "dTo" : dTo,
        }

        $mdDialog.hide(serviceObj);      
      }

    }

  })();


(function()
{
  'use strict';

  angular
  .module('app.settings')
  .controller('DialogindividualtaxController',DialogindividualtaxController);

  /** @ngInject */
  function DialogindividualtaxController($rootScope,$mdDialog,$mdSidenav)
  {
    	// use the below code on all child view controllers
    	var vm = this;

    	vm.toggleSidenav = toggleSidenav;

      function toggleSidenav(sidenavId)
      {
        $mdSidenav(sidenavId).toggle();
      }
    	// dont change above code !

      vm.submit=submit;

      console.log($rootScope.individualTaxes);
      
      function submit() {

        vm.sameTaxName=false;
        for (var i = $rootScope.individualTaxes.length - 1; i >= 0; i--) {
         var currentTax = $rootScope.individualTaxes[i].taxName;
         var newTax = vm.taxName;
         if(currentTax.toLowerCase()==newTax.toLowerCase()){
          vm.sameTaxName=true;
          vm.erromessage="Tax already exist"
          break;
        }else{
          vm.sameTaxName=false;
          vm.erromessage=""
        }
      }

      if(!vm.sameTaxName){

        var number = Math.random();
        console.log(Math.random());

        var obj={};
        obj.taxID=number;
        obj.taxName=vm.taxName;
        obj.rate=vm.rate;
        obj.activate=true;
        obj.compound=vm.compound;
        obj.type="individualtaxes";
        obj.positionID=number;
        obj.labelIndividualTaxStatus="Inactivate";

        $mdDialog.hide(obj);
      }



    };

    vm.cancel = function() {
      $mdDialog.cancel();
    };


  }
})();
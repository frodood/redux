(function()
{
  'use strict';

  angular
  .module('app.settings')
  .controller('DialogindividualtaxEditController',DialogindividualtaxEditController);

  /** @ngInject */
  function DialogindividualtaxEditController($rootScope,$mdDialog,individualtax,$mdSidenav, data)
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
      vm.individualtax=individualtax;
      console.log(vm.individualtax.compound);
      vm.taxName=vm.individualtax.taxName;
      vm.rate=vm.individualtax.rate;
      vm.compound=vm.individualtax.compound;

      function submit(){
        var edit={};
        debugger;
        for (var i = data.length - 1; i >= 0; i--) {
          
            var currentTax = data[i].taxName;
            var newTax = vm.taxName;
            console.log(i,vm.individualtax.taxName,newTax);
            console.log(i,currentTax,newTax);
            debugger
            if(vm.individualtax.taxName.toLowerCase() !== newTax.toLowerCase()){
              debugger;
              if(currentTax.toLowerCase()==newTax.toLowerCase()){
                debugger;
              vm.sameTaxName=true;
              vm.erromessage="Tax already exist";
              break;
              }else{
                debugger;
                vm.sameTaxName=false;
                vm.erromessage=""
              }
            }
            else{
              debugger;
              vm.sameTaxName=false;
              vm.erromessage=""
            }
            
        }

        if(!vm.sameTaxName){
            edit.taxID=vm.individualtax.taxID;
            edit.taxName=vm.taxName;
            edit.rate=vm.rate;
            edit.activate=true;
            edit.compound=vm.compound;
            edit.type="individualtaxes";
            edit.positionID=vm.individualtax.positionID;
            edit.labelIndividualTaxStatus="Inactivate";
            $mdDialog.hide(edit);
        }

       
      };

      vm.cancel = function() {
        $mdDialog.cancel();
      };


    }
  })();
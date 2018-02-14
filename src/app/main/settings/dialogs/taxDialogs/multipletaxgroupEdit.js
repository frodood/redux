(function()
{
  'use strict';

  angular
  .module('app.settings')
  .controller('DialogmultipletaxgroupEditController',DialogmultipletaxgroupEditController);

  /** @ngInject */
  function DialogmultipletaxgroupEditController($rootScope,$mdDialog,multipletaxgroup,$mdSidenav,data)
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
      vm.selectedtaxe=selectedtaxe;
      vm.deleteselecttax=deleteselecttax;
      vm.loadAllIndividualTaxes=[];

      vm.individualTaxesEdit = new Array();
      for (var i = $rootScope.individualTaxes.length - 1; i >= 0; i--) {
        if($rootScope.individualTaxes[i].activate==true){
          if($rootScope.individualTaxes[i].taxID !== 0.001){
           vm.loadAllIndividualTaxes.push($rootScope.individualTaxes[i]);
         }
       }
     }
     // vm.loadAllIndividualTaxes=$rootScope.individualTaxes;

     vm.multipletaxgroupEdit = angular.copy(multipletaxgroup);

    
     vm.mulipleTaxName=vm.multipletaxgroupEdit.taxName;
     vm.individualTaxesEdit=vm.multipletaxgroupEdit.individualTaxes;
     vm.multipletaxgroupEdit.labelMultipleTaxStatus="Inactivate";

     function loadselctedindivitax(){
      vm.loadselctedtax= vm.individualTaxesEdit;
      console.log(vm.loadselctedtax);
      
    }

    function selectedtaxe(tax){

     console.log(tax);
     var taxJson = JSON.parse(tax);
     var available = false;
    // if(taxJson.compound){
      for (var j = vm.individualTaxesEdit.length - 1; j >= 0; j--) {
        // if(vm.individualTaxesEdit[j].compound ) {
        //   available = true;
        //   vm.text="Only one compund tax can be associated to a tax group along with other taxes.";
        //   break;
        // }

        // if(vm.individualTaxesEdit[j].taxName==taxJson.taxName) {
        //   available = true; 
        //   vm.text="";
        //   break;
        // }

        if(vm.individualTaxesEdit[j].compound ) {

          if(taxJson.compound==true){
            available = true;
             if(vm.individualTaxesEdit[j].taxName == taxJson.taxName){
              vm.text="You cannot add same tax again";
            }
            else{
               vm.text="Only one compound tax can be associated to a tax group along with other taxes.";
            }

          }
          else{
            available = false;
            vm.text="";
          }
        //   else{
        //    vm.text="";
        // vm.individualTaxes.push(JSON.parse(tax));
        //   }
        // break;
        }

        else if(vm.individualTaxesEdit[j].taxName == taxJson.taxName){
        available = true; 
        vm.text="You cannot add same tax again";
        break;
        }


      }

      if(!available){
        vm.text="";
        vm.individualTaxesEdit.push(JSON.parse(tax));
      }

      for(var i=0; i < vm.individualTaxesEdit.length; i++ ){
        console.log(i);
        vm.individualTaxesEdit[i].positionID=i;
      }

      console.log(vm.individualTaxesEdit);
      loadselctedindivitax()

    };

    function deleteselecttax(loadselctedtax, index){  
    debugger;
    vm.individualTaxesEdit.splice(index, 1);
    }

   function submit() {
      var obj={};

      for(var j=0; j<data.length; j++){
        var currentTax = data[j].taxName;
        var newTax = vm.mulipleTaxName;
        if(vm.multipletaxgroupEdit.taxName.toLowerCase() !== newTax.toLowerCase()){
          if(currentTax.toLowerCase()==newTax.toLowerCase()){
            vm.sameTaxName=true;
            vm.erromessage="Tax group already exist";
            break;
          }else{
            vm.sameTaxName=false;
            vm.erromessage="";
          }
        }
        else{
          vm.sameTaxName=false;
          vm.erromessage="";
        }
        
      }

      if(!vm.sameTaxName){
        obj.multipleTaxGroupID=vm.multipletaxgroupEdit.multipleTaxGroupID;
        obj.taxName=vm.mulipleTaxName;
        obj.individualTaxes=vm.individualTaxesEdit;
        obj.activate=true;
        obj.type="multipletaxgroup";
        obj.labelMultipleTaxStatus="Inactivate";
        $mdDialog.hide(obj);
      }
     
   };

  vm.sortableOptions = {

 orderChanged: function(event) {//Do what you want
  console.log(event);
  console.log(event.dest.index);
  console.log(event.source.itemScope.item.taxID);
  
  console.log(event.dest.sortableScope.modelValue[event.dest.index].taxID);
  //$scope.individualtaxes.push({positionId:event.dest.index});
  if(event.source.itemScope.item.taxID == event.dest.sortableScope.modelValue[event.dest.index].taxID){
    vm.individualTaxesEdit[event.dest.index].positionID=event.dest.index;
    console.log(vm.individualTaxesEdit[event.dest.index].positionID);
    vm.individualTaxesEdit[event.source.index].positionID=event.source.index;
    for (var i=0; i< vm.individualTaxesEdit.length; i++){
      vm.individualTaxesEdit[i].positionID=i;
    }

  }
//when else part others position id hav to change according to current index
}

};

vm.cancel = function() {
  $mdDialog.cancel();
};


}
})();
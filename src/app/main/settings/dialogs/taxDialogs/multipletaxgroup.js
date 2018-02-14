(function()
{
  'use strict';

  angular
  .module('app.settings')
  .controller('DialogmultipletaxgroupController',DialogmultipletaxgroupController);

  /** @ngInject */
  function DialogmultipletaxgroupController($rootScope,$mdDialog,$mdSidenav)
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
      vm.selcetedtax=selcetedtax;
      vm.deleteselecttax=deleteselecttax;
      vm.loadAllIndividualTaxes=[];
      //load All individualTaxes.........

      for (var i = $rootScope.individualTaxes.length - 1; i >= 0; i--) {
        if($rootScope.individualTaxes[i].activate==true){
          if($rootScope.individualTaxes[i].taxID !== 0.001){
           vm.loadAllIndividualTaxes.push($rootScope.individualTaxes[i]);
         }
       }
     }
      //vm.loadAllIndividualTaxes=$rootScope.individualTaxes;
      console.log(vm.loadAllIndividualTaxes);
      vm.loadAllMultipleTaxGroups=$rootScope.multipletaxGroup;

      vm.individualTaxes= vm.loadAllIndividualTaxes;
      console.log(vm.individualTaxes);

      vm.individualTaxes = new Array();

      function loadselctedindivitax(){
        vm.loadselctedtax=vm.individualTaxes;
        console.log(vm.individualTaxes);
      } 

      function selcetedtax(tax){
        console.log(tax);
        var taxJson = JSON.parse(tax);
        var available = false;

    // if(taxJson.compound){
      for (var j = vm.individualTaxes.length - 1; j >= 0; j--) {
        if(vm.individualTaxes[j].compound ) {

          if(taxJson.compound==true){
            available = true;
            if(vm.individualTaxes[j].taxName == taxJson.taxName){
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
        // break;
      }
      // debugger;
      else if(vm.individualTaxes[j].taxName == taxJson.taxName){
        available = true; 
        vm.text="You cannot add same tax again";
        break;
      }

      // if(vm.individualTaxes[j].taxName==taxJson.taxName) {
      //   available = true; 
      //   vm.text="";
      //   break;
      // }
    }

    if(!available){
      vm.text="";
      vm.individualTaxes.push(JSON.parse(tax));
    }

    for(var i=0; i < vm.individualTaxes.length; i++ ){
      console.log(i);
      vm.individualTaxes[i].positionID=i;
    }

    console.log(vm.individualTaxes);
    loadselctedindivitax()
  }

  function deleteselecttax(loadselctedtax, index){  
   vm.individualTaxes.splice(index, 1);
 }

 function submit() {

  vm.sameTaxName=false;
  for(var j=0; j<vm.loadAllMultipleTaxGroups.length; j++){
    var currentTax = vm.loadAllMultipleTaxGroups[j].taxName;
    var newTax = vm.taxName;
    if(currentTax.toLowerCase()==newTax.toLowerCase()){
      vm.sameTaxName=true;
      vm.erromessage="Tax group already exist";
      break;
    }else{
      vm.sameTaxName=false;
    }
  }

  if(!vm.sameTaxName){
    var number = Math.random();
    console.log(Math.random());
    var obj={};
    obj.multipleTaxGroupID=number;
    obj.taxName=vm.taxName;
    obj.individualTaxes=vm.individualTaxes;
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
    vm.individualTaxes[event.dest.index].positionID=event.dest.index;
    console.log(vm.individualTaxes[event.dest.index].positionID);
    vm.individualTaxes[event.source.index].positionID=event.source.index;
    for (var i=0; i< vm.individualTaxes.length; i++){
      vm.individualTaxes[i].positionID=i;
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
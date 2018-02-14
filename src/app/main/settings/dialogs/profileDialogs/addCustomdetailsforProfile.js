(function()
{
  'use strict';

  angular
  .module('app.settings')
  .controller('DialogprofileController',DialogprofileController);

  /** @ngInject */
  function DialogprofileController($scope,$mdDialog,$mdSidenav,data)
  {
    	// use the below code on all child view controllers
    	var vm = this;

    	vm.toggleSidenav = toggleSidenav;

      vm.submit=submit;

      vm.fields=[];

      vm.inputType="";

      function toggleSidenav(sidenavId)
      {
        $mdSidenav(sidenavId).toggle();
      }
    	// dont change above code !
     
     vm.sameLabelName=false;
     function submit() {
      
      for (var i = data.length - 1; i >= 0; i--) {
       var oldLabel= data[i].labelShown;
       var newLabel = vm.labelShown;
       if(oldLabel.toLowerCase()==newLabel.toLowerCase()){
        vm.sameLabelName=true;
        vm.erromessage="Label already exist";
        break;
      }else{
        vm.sameLabelName=false;
        vm.erromessage="";
      }
    }

    if(!vm.sameLabelName){
      vm.type="textBox";
      var number = Math.random();
      var obj={};
      obj.id=number;
      obj.labelShown=vm.labelShown;
      obj.inputType=vm.inputType;
      obj.fields=vm.fields;
      obj.type=vm.type;
      obj.showOnPdf=vm.showOnPdf;
      $mdDialog.hide(obj);
    }  
    
  };

  vm.cancel = function() {
    $mdDialog.cancel();
  };


}
})();
(function()
{
  'use strict';

  angular
  .module('app.settings')
  .controller('DialogEditprofileController',DialogEditprofileController);

  /** @ngInject */
  function DialogEditprofileController($scope,$mdDialog,cusFieldsProfileedit,data,$mdSidenav)
  {
    	// use the below code on all child view controllers
    	var vm = this;

    	vm.toggleSidenav = toggleSidenav;

      vm.submit=submit;

      vm.fields=[];

      vm.inputType="";
      
      vm.type="textBox";

      function toggleSidenav(sidenavId)
      {
        $mdSidenav(sidenavId).toggle();
      }
    	// dont change above code 
      vm.cusFieldsProfileedit=cusFieldsProfileedit;

      vm.type=vm.cusFieldsProfileedit.type;
      console.log(vm.type);
      vm.labelShown=vm.cusFieldsProfileedit.labelShown;
      vm.inputType=vm.cusFieldsProfileedit.inputType;
      vm.fields=vm.cusFieldsProfileedit.fields;
      vm.showOnPdf=vm.cusFieldsProfileedit.showOnPdf;

      function submit() {
      var objEdit={};

      for (var i = data.length - 1; i >= 0; i--) {
        var oldLabel= data[i].labelShown;
        var newLabel = vm.labelShown;
        debugger;
        if(vm.cusFieldsProfileedit.labelShown.toLowerCase() !== newLabel.toLowerCase()){
          if(oldLabel.toLowerCase()==newLabel.toLowerCase()){
            vm.sameLabelName=true;
            vm.erromessage="Label already exist";
            break;
          }else{
            vm.sameLabelName=false;
            vm.erromessage="";
          }
        }
        else{
          vm.sameLabelName=false;
          vm.erromessage="";
        }
       
      }
      
      if(!vm.sameLabelName){
        if(vm.type=='textBox'){
          objEdit.id=vm.cusFieldsProfileedit.id;
          objEdit.labelShown=vm.labelShown;
          objEdit.inputType=vm.inputType;
          objEdit.fields=[];
          objEdit.type=vm.type;
          objEdit.showOnPdf=vm.showOnPdf;
          console.log(objEdit);
          $mdDialog.hide(objEdit);
        }
      }
       

      };

      vm.cancel = function() {
        $mdDialog.cancel();
      };


    }
  })();
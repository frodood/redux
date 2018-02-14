(function()
{
  'use strict';

  angular
  .module('app.settings')
  .controller('DialogrolesEditController',DialogrolesEditController);

  /** @ngInject */
  function DialogrolesEditController($mdDialog,roleEdit,$apis,$mdSidenav,$mdToast,role)
  {
    	// use the below code on all child view controllers
    	var vm = this;

    	vm.toggleSidenav = toggleSidenav;

      function toggleSidenav(sidenavId)
      {
        $mdSidenav(sidenavId).toggle();
      }
      // dont change above code !
      vm.oldRole=roleEdit.roleName;

      vm.rolesEdit=angular.copy(roleEdit);
      console.log(vm.rolesEdit);
      vm.submit=submit;
      vm.toggle=toggle;
  
      vm.settingDisabled=false;
      vm.dashboardDisabled=false;
      if(vm.rolesEdit.roleName=="Super admin"){
        vm.settingDisabled=true;
        vm.dashboardDisabled=true;
      }

      vm.sameRole=false;
      function submit(obj) {
        for (var i = role.length - 1; i >= 0; i--) {
            var currentRole = role[i].roleName;
            var newRole = obj.roleName;
            if(vm.oldRole.toLowerCase() !== newRole.toLowerCase()){

                if(currentRole.toLowerCase() == newRole.toLowerCase()){
                vm.sameRole=true;
                vm.erromessage="Role already exist"
                break;
                }else{
                  vm.sameRole=false;
                  vm.erromessage="";
                }
            }
            else{
              vm.sameRole=false;
              vm.erromessage="";
            }
        }

        if(!vm.sameRole){
          obj.editable=true;
          var apis = $apis.getApis();
          apis.ifSuccess(function(data){
            var toast = $mdToast.simple().content( obj.roleName+' role successfully updated').action('OK').highlightAction(false).position("top right");
            $mdToast.show(toast).then(function() {});
          });
          apis.ifError(function(data){
            var toast = $mdToast.simple().content('There was an error, when role updated').action('OK').highlightAction(false).position("top right");
            $mdToast.show(toast).then(function() {});
          });
          apis.apisPermission('update',obj);
          $mdDialog.hide(obj);
        }
        
        

        };
      
      
        function toggle(app){
            console.log(app.view);
            
             for (var i = vm.rolesEdit.appPermission.length - 1; i >= 0; i--){ 
                 if(vm.rolesEdit.appPermission[i].appName==app.appName){
                     if(app.view){
                         vm.rolesEdit.appPermission[i]={view:true,add:true,edit:true,cancel:true,delete:true,appName:app.appName,label:app.appName}; 
                     }
                     else{
                          vm.rolesEdit.appPermission[i]={view:false,add:false,edit:false,cancel:false,delete:false,appName:app.appName,label:app.appName}; 
                         
                     }
                 }
             }
            
            
        }

        vm.cancel = function() {
          $mdDialog.cancel();
        };


      }
    })();
(function()
{
  'use strict';

  angular
  .module('app.settings')
  .controller('DialogusersEditController',DialogusersEditController);

  /** @ngInject */
  function DialogusersEditController($rootScope,$mdDialog,edituserDetails,$apis,$mdSidenav,$mdToast)
  {
    	// use the below code on all child view controllers
    	var vm = this;

    	vm.toggleSidenav = toggleSidenav;

      vm.submit=submit;
      vm.reSendInvite=reSendInvite;
      vm.lastName="";

      vm.button="Edit";

      function toggleSidenav(sidenavId)
      {
        $mdSidenav(sidenavId).toggle();
      }
    	// dont change above code !
      vm.edituserDetails=edituserDetails;
      console.log(vm.edituserDetails);

      vm.roleRequired=false;
      vm.dis=true;
      vm.button="Edit";
      vm.inviteUserEmail=vm.edituserDetails.inviteUserEmail;
      vm.firstName=vm.edituserDetails.firstName;
      vm.lastName=vm.edituserDetails.lastName;
      vm.role=vm.edituserDetails.role[0];

      //load all roles.............
      vm.roles=$rootScope.roles;
      console.log(vm.roles);

// for (var i = vm.roles.length - 1; i >= 0; i--) {
//   console.log(vm.roles[i].roleName);
//   if(vm.roles[i].roleName=='user'){
//     console.log(vm.roles[i].roleName);
//     vm.role=vm.roles[i];
//     console.log(vm.role);
//   }
// }

function submit() {
//edit user details here...............
if(vm.role=="" || vm.role==null)
{
  vm.roleRequired=true;
}
else{
  var editobj={};
  editobj.role=[];
  editobj.inviteUserEmail=vm.inviteUserEmail;
  editobj.firstName=vm.firstName;
  editobj.lastName=vm.lastName;
  editobj.role.push(vm.role);
  editobj.editable=true;
  editobj.activate=true;
  vm.editobj=editobj;

  var permission={};
  permission.roles=[];
  permission.activate=true;
  permission.email=vm.inviteUserEmail;
  permission.firstName=vm.firstName;
  permission.lastName = vm.lastName;
  permission.roles.push(vm.role);
  vm.permission=permission;

  var apis = $apis.getApis();
  apis.ifSuccess(function(data){
    console.log(data);
    var toast = $mdToast.simple().content( vm.editobj.firstName+' user successfully invited').action('OK').highlightAction(false).position("top right");
    $mdToast.show(toast).then(function() {});
  });
  apis.ifError(function(data){
    console.log(data);
    var toast = $mdToast.simple().content('There was an error, when user invited').action('OK').highlightAction(false).position("top right");
    $mdToast.show(toast).then(function() {});
  })
  apis.apisPermission('invite',permission); 

//when new user 
// vm.invite={};
// vm.invite.UserID="";
// vm.invite.EmailAddress=vm.inviteUserEmail;
// vm.invite.Name=vm.firstName+" "+vm.lastName;
// vm.invite.Password="";
// vm.invite.ConfirmPassword="";
// vm.invite.Active=false;
// apis.authPost('RegisterTenantUser',vm.invite);
//apis.getUser(vm.permission);

$mdDialog.hide(editobj);
}

};

//resent invitation................
function reSendInvite(){
  var apis = $apis.getApis();
  apis.ifSuccess(function(data){
   var toast = $mdToast.simple().content( vm.editobj.firstName+' user successfully invited again').action('OK').highlightAction(false).position("top right");
   $mdToast.show(toast).then(function() {});
 });
  apis.ifError(function(data){
   var toast = $mdToast.simple().content('There was an error, when user invited').action('OK').highlightAction(false).position("top right");
   $mdToast.show(toast).then(function() {});
 })
  apis.apisPermission('invite',vm.permission); 
};

vm.cancel = function() {
  $mdDialog.cancel();
};


}
})();

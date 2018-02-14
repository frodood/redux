(function()
{
  'use strict';

  angular
  .module('app.settings')
  .controller('DialogPendingUserController',DialogPendingUserController);

  /** @ngInject */
  function DialogPendingUserController($rootScope,$mdDialog,getPendingUserDetails,$apis,$mdToast,$mdSidenav)
  {
    	// use the below code on all child view controllers
    	var vm = this;

    	vm.toggleSidenav = toggleSidenav;

      function toggleSidenav(sidenavId)
      {
        $mdSidenav(sidenavId).toggle();
      }
    	// dont change above code !
      vm.lastName="";
      vm.getPendingUserDetails=getPendingUserDetails;
      vm.inviteUserEmail=vm.getPendingUserDetails.Email;

      //vm.getPendingUserDetails.Name

      var str = vm.getPendingUserDetails.Name;
      var name = str.split(" ",2);
      console.log(name);
      console.log(name[0]);
      if(name[1]==undefined){
        name[1]="";
        console.log(name[1]);
      }
      else{
        console.log(name[1]);
      }

      vm.firstName=name[0];
      vm.lastName=name[1];


      vm.submit=submit;
// vm.reSendInvite=reSendInvite;

vm.roleRequired=false;

vm.roles=$rootScope.roles;
console.log(vm.roles);

function submit() {
  if(vm.role=="" || vm.role==null)
  {
    vm.roleRequired=true;
  }
  else{
   var obj={};
   obj.role=[];
   obj.inviteUserEmail=vm.inviteUserEmail;
   obj.firstName=vm.firstName;
   obj.lastName=vm.lastName;
   obj.role.push(JSON.parse(vm.role));
   obj.editable=false;
   obj.activate=true;
   console.log(obj);

   var apis = $apis.getApis();
   apis.ifSuccess(function(data){
    console.log(data);
    if(data.Success){
       var toast = $mdToast.simple().content( obj.firstName+' user successfully accepted').action('OK').highlightAction(false).position("top right");
       $mdToast.show(toast).then(function() {});
       $mdDialog.hide(obj);
    }
    else{
      var toast = $mdToast.simple().content('You have exceeded the user limit').action('OK').highlightAction(false).position("top right");
      $mdToast.show(toast).then(function() {});
    }

  });
   apis.ifError(function(data){
    console.log(data);
    var toast = $mdToast.simple().content('There was an error, when user accepted').action('OK').highlightAction(false).position("top right");
    $mdToast.show(toast).then(function() {});
  })
   //apis.authReqPcode('AcceptRequest',vm.inviteUserEmail,vm.getPendingUserDetails.Code);
  apis.acceptUser(vm.inviteUserEmail,vm.getPendingUserDetails.Code);
   $mdDialog.hide(obj);
 }

};

//resent invitation................
// function reSendInvite(){

// }

vm.cancel = function() {
  $mdDialog.cancel();
};


}
})();
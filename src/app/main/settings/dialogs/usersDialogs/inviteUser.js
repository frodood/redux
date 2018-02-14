(function() {
    'use strict';

    angular
        .module('app.settings')
        .controller('DialogusersController', DialogusersController);

    /** @ngInject */
    function DialogusersController($rootScope, $mdDialog, $apis, $mdToast, $mdSidenav) {
        // use the below code on all child view controllers
        var vm = this;

        vm.toggleSidenav = toggleSidenav;

        function toggleSidenav(sidenavId) {
            $mdSidenav(sidenavId).toggle();
        }
        // dont change above code !

        vm.submit = submit;

        vm.button = "Add";

        vm.roleRequired = false;

        vm.roles = $rootScope.roles;

        vm.users = $rootScope.users;
        debugger;
        console.log(vm.roles);

        vm.lastName = "";

        function submit() {
            if (vm.role == "" || vm.role == null) {
                vm.roleRequired = true;
            } else {
                var obj = {};
                obj.role = [];
                obj.inviteUserEmail = vm.inviteUserEmail;
                obj.firstName = vm.firstName;
                obj.lastName = vm.lastName;
                obj.role.push(vm.role);
                obj.editable = false;
                obj.activate = true;
                console.log(obj);
                vm.obj = obj;

                vm.checkSameEmails = false;
                for (var j = 0; j < vm.users.length; j++) {
                    if(vm.users[j].inviteUserEmail == vm.inviteUserEmail){
                        console.log(vm.users.inviteUserEmail);
                        console.log(vm.inviteUserEmail);
                        vm.checkSameEmails = true;
                    }
                }

                var permission = {};
                permission.roles = [];
                permission.activate = true;
                permission.email = vm.inviteUserEmail;
                permission.firstName = vm.firstName;
                permission.lastName = vm.lastName;
                permission.roles.push(vm.role);
                console.log(permission);

                vm.invite = {};
                vm.invite.UserID = "";
                vm.invite.EmailAddress = vm.inviteUserEmail;
                vm.invite.Name = vm.firstName + " " + vm.lastName;
                vm.invite.Password = "";
                vm.invite.ConfirmPassword = "";
                vm.invite.Active = false;

                var apis = $apis.getApis();
                apis.ifSuccess(function(data) {
                    debugger;
                    if (data.Success == true) {
                        debugger;
                        var apisPerm = $apis.getApis();
                            apisPerm.ifSuccess(function(dataPermission) {

                                if (dataPermission.isSuccess == true) {
                                    debugger;
                                    var toast = $mdToast.simple().content(obj.firstName + ' user successfully invited').action('OK').highlightAction(false).position("top right");
                                    $mdToast.show(toast).then(function() {});
                                    debugger;
                                    $mdDialog.hide(obj);
                                } else {
                                    var toast = $mdToast.simple().content('there was a error when permission setting').action('OK').highlightAction(false).position("top right");
                                    $mdToast.show(toast).then(function() {});
                                }

                            });
                            apisPerm.ifError(function(dataPermission) {
                                console.log(dataPermission);
                                var toast = $mdToast.simple().content('there was a error when permission').action('OK').highlightAction(false).position("top right");
                                $mdToast.show(toast).then(function() {});
                            });
                            debugger;
                            if(!vm.checkSameEmails){
                                 apisPerm.apisPermission('invite', permission);
                            }
                           
                    }
                    else{
                        var toast = $mdToast.simple().content('You have exceeded the user limit').action('OK').highlightAction(false).position("top right");
                        $mdToast.show(toast).then(function() {});
                    }

                });
                apis.ifError(function(data) {
                    console.log(data);
                    var toast = $mdToast.simple().content('There was an error, when user invited').action('OK').highlightAction(false).position("top right");
                    $mdToast.show(toast).then(function() {});
                });
                debugger;
                if(!vm.checkSameEmails){
                    apis.getUser(vm.obj.inviteUserEmail);
                }
                else{
                    vm.showerrorMsg = 'You cannot add exist user again';
                }
               
                
            }

        };

        vm.cancel = function() {
            $mdDialog.cancel();
        };


    }
})();

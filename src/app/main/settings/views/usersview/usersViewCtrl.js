(function() {
    'use strict';

    angular
        .module('app.settings')
        .controller('usersViewController', usersViewController);

    /** @ngInject */
    function usersViewController($scope, $rootScope, $http, $log, $document, $mdDialog, $mdMedia, $mdToast, $serviceCall, $mdSidenav, $state, msApi, $auth, $apis, $window, msSpinnerService) {
        // use the below code on all child view controllers
        var vm = this;

        vm.toggleSidenav = toggleSidenav;

        vm.spinnerService = msSpinnerService;

        vm.settingLoadUsersDetailsSpinnerLoaded = settingLoadUsersDetailsSpinnerLoaded;

        function settingLoadUsersDetailsSpinnerLoaded(UsersDetailsSpinner){
            UsersDetailsSpinner.show('setting-loadUsersDetails-spinner');
        }

        function toggleSidenav(sidenavId) {
            $mdSidenav(sidenavId).toggle();
        }
        // dont change above code !

        vm.acceptUser = acceptUser;
        vm.inviteUsers = inviteUsers;
        vm.inviteUsersEdit = inviteUsersEdit;
        vm.deleteUserRow = deleteUserRow;
        vm.roles = roles;
        vm.rolesEdit = rolesEdit;
        vm.deleteRole = deleteRole;
        vm.saveUser = saveUser;
        vm.invitedUser={};
        vm.reSendEmail = reSendEmail;
        vm.cancelPendingUserRow = cancelPendingUserRow;

        vm.pendingInvi = [];

        function getHost() {
			var host = window.location.protocol + '//' + window.location.hostname;
			if (host.indexOf("localhost") !== -1 || host.indexOf("127.0.0.1") !== -1) {
				host = window.location.protocol + '//' + "gowinda.developer.12thdoor.com";
			}
			return host;
        }
        function getTenantID() {
		var host = window.location.hostname;
		if (host.indexOf("localhost") !== -1 || host.indexOf("127.0.0.1") !== -1) {
			host = "gowinda.developer.12thdoor.com"; //test host 
		}
		return host;
	    }
        //check plan status
        //apis/plan/current
        vm.planStatus="";
        
        function getPlanUpgrade(){

			return 	$http({
						url: getHost()+'/services/duosoftware.subscription.service/subscription/getActiveSubscribedPlansForAccount?accountCode='+getTenantID(),
						method: "POST",
						headers: {
							securityToken:$rootScope.cc_sessionInfo.SecurityToken
						}
					}).then(getCurrentPlan).catch(currentPlanError);


			function getCurrentPlan(response){
                console.log(response.data[0]);
                vm.planStatus = response.data[0];
                if(vm.planStatus !== '12d-free-plan'){
                    vm.showUserAddBtn = true;
                }
                else{
                    vm.showUserAddBtn = false;
                }
			}

			function currentPlanError(error){
				$log.error();
			}
	
        }
        getPlanUpgrade();

        function loadSetting() {
            var client = $serviceCall.setClient("getAll", "setting");
            client.ifSuccess(function(data) {
                console.log(data[0]);
                vm.Settings12thdoor = data[0];
                console.log(vm.Settings12thdoor.users.user);
                $rootScope.users = vm.Settings12thdoor.users.user;
                $rootScope.roles = vm.Settings12thdoor.users.roles;
                console.log($rootScope.roles);
                vm.pendingInviterUserEmail = [];
                loadPendingRequest();
                vm.spinnerService.hide('setting-loadUsersDetails-spinner');
            });
            client.ifError(function(data) {
                vm.spinnerService.hide('setting-loadUsersDetails-spinner');
                var toast = $mdToast.simple().content('There was an error, when data loading').action('OK').highlightAction(false).position("top right");
                $mdToast.show(toast).then(function() {});
            })

            client.skip(0);
            client.take(1);
            client.orderby();
            client.getReq();
        };
        loadSetting();

        function saveUser() {
            console.log(vm.invitedUser);
            debugger;
            var client = $serviceCall.setClient("saveUser", "setting"); // method name and service
            client.ifSuccess(function(data) { //sucess  
                var toast = $mdToast.simple().content('Users and roles successfully saved').action('OK').highlightAction(false).position("top right");
                $mdToast.show(toast).then(function() {});
            });
            client.ifError(function(data) { //false
                var toast = $mdToast.simple().content('There was an error saving the data').action('OK').highlightAction(false).position("top right");
                $mdToast.show(toast).then(function() {});
            })
            // client.tab('users');
            client.postReq(vm.invitedUser);

        };

        function updateUser(){
            debugger;
            var client = $serviceCall.setClient("singleupdate", "setting"); // method name and service
            client.ifSuccess(function(data) { //sucess  
                var toast = $mdToast.simple().content('Users and roles successfully saved').action('OK').highlightAction(false).position("top right");
                $mdToast.show(toast).then(function() {});
            });
            client.ifError(function(data) { //false
                var toast = $mdToast.simple().content('There was an error saving the data').action('OK').highlightAction(false).position("top right");
                $mdToast.show(toast).then(function() {});
            })
            client.tab('users');
            client.postReq(vm.Settings12thdoor.users);
        }

        function loadPendingRequest(){
            debugger;
            // var apisPenReq = $apis.getApis();
            // apisPenReq.ifSuccess(function(data) {
            //     console.log(data);
            //     if (data.AddUserRequests != null) {
            //         vm.pendingInvi = data.AddUserRequests;
            //     }
            // });
            // apisPenReq.ifError(function(data) {
            //     console.log(data);
            //     var toast = $mdToast.simple().content('There was an error').action('OK').highlightAction(false).position("top right");
            //     $mdToast.show(toast).then(function() {});
            // })
            // apisPenReq.authReq('GetAllPendingTenantRequests');

             var client = $serviceCall.setClient("getPendingUsers", "setting"); // method name and service
            client.ifSuccess(function(data) {//sucess 
                if (data) {
                    vm.pendingInvi = data;
                    console.log(vm.pendingInvi);
                }
            });
            client.ifError(function(data) { //false
                var toast = $mdToast.simple().content('There was an error').action('OK').highlightAction(false).position("top right");
                $mdToast.show(toast).then(function() {});
            })
            client.getReq();
        }

        //invite user
        function inviteUsers(ev) {
            if(vm.showUserAddBtn){
                $mdDialog.show({
                    controller: 'DialogusersController',
                    controllerAs: 'vm',
                    templateUrl: 'app/main/settings/dialogs/usersDialogs/inviteUser.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose: true
                })
                .then(function(answer) {
                    debugger;
                    vm.invitedUser=answer;
                    // vm.Settings12thdoor.users.user.push(answer);
                    vm.saveUser();
                   loadPendingRequest();
                }, function() {
                    $scope.status = 'You cancelled the dialog.';
                });
            }
            else{
                $mdDialog.show(
                    $mdDialog.alert()
                    .title('Unable to add users')
                    .parent(angular.element(document.body))
                    .content('Now you are in a free plan, please upgrade your plan to get more user slots.')
                    .ariaLabel('Alert Dialog Demo')
                    .ok('OK')
                );
            }
            
        };

        //edit Invite user
        function inviteUsersEdit(edituserDetails, ev) {
            $mdDialog.show({
                    controller: 'DialogusersEditController',
                    controllerAs: 'vm',
                    templateUrl: 'app/main/settings/dialogs/usersDialogs/inviteUserEdit.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    locals: {
                        edituserDetails: edituserDetails
                       
                    },
                    clickOutsideToClose: true
                })
                .then(function(answer) {
                    console.log(answer.inviteUserEmail);
                    for (var i = vm.Settings12thdoor.users.user.length - 1; i >= 0; i--) {
                        if (vm.Settings12thdoor.users.user[i].inviteUserEmail == answer.inviteUserEmail) {
                            console.log(vm.Settings12thdoor.users.user[i]);
                            vm.Settings12thdoor.users.user[i] = answer;
                            updateUser();
                        }
                    }
                }, function() {
                    $scope.status = 'You cancelled the dialog.';
                });
        };

        function deleteUserRow(loadInviteUser, index) {
            var apis = $apis.getApis();
            apis.ifSuccess(function(data) {
                console.log(data);

                vm.ownerEmail = data.Email;

                if (loadInviteUser.inviteUserEmail == vm.ownerEmail) {
                    $mdDialog.show(
                        $mdDialog.alert()
                        .title('Alert')
                        .parent(angular.element(document.body))
                        .content('Cannot delete this user')
                        .ariaLabel('Alert Dialog Demo')
                        .ok('OK')
                    );
                } else {
                    var confirm = $mdDialog.confirm()
                        .title('Do you wish to delete ' + loadInviteUser.firstName + ' ?')
                        .content('')
                        .ariaLabel('')
                        .targetEvent()
                        .ok('Ok')
                        .cancel('Cancel');

                    $mdDialog.show(confirm).then(function() {
                        var apis = $apis.getApis();
                        apis.ifSuccess(function(data) {
                            console.log(data);
                            var toast = $mdToast.simple().content(loadInviteUser.firstName + ' user successfully deleted').action('OK').highlightAction(false).position("top right");
                            $mdToast.show(toast).then(function() {});
                        });
                        apis.ifError(function(data) {
                            console.log(data);
                            var toast = $mdToast.simple().content('There was an error, when user deleted').action('OK').highlightAction(false).position("top right");
                            $mdToast.show(toast).then(function() {});
                        })
                        apis.authReq('RemoveUser', loadInviteUser.inviteUserEmail);

                        //    for (var j = vm.Settings12thdoor.users.user.length - 1; j >= 0; j--) {
                        //   if(vm.Settings12thdoor.users.user[j].inviteUserEmail==loadInviteUser.inviteUserEmail){
                        //     console.log(vm.Settings12thdoor.user.user[j]);
                        //     vm.Settings12thdoor.users.roles.splice(j, 1);
                        //   }
                        // }
                        vm.Settings12thdoor.users.user[index].activate = false;
                        vm.Settings12thdoor.users.user.splice(index, 1);
                        updateUser();

                    });
                }

            });

            apis.ifError(function(data) {
                console.log(data);
                var toast = $mdToast.simple().content('There was an error, when load admin details').action('OK').highlightAction(false).position("top right");
                $mdToast.show(toast).then(function() {});
            });
            console.log(window.location.hostname);
            apis.getSession('GetSession', window.location.hostname);

        }

        //canclePendingUser....
        function cancelPendingUserRow(inviteUseremail, index) {
            console.log(inviteUseremail);
            var confirm = $mdDialog.confirm()
                .title('Do you wish to cancel ' + inviteUseremail + ' ?')
                .content('')
                .ariaLabel('')
                .targetEvent()
                .ok('Ok')
                .cancel('Cancel');

            $mdDialog.show(confirm).then(function() {
                var apis = $apis.getApis();
                apis.ifSuccess(function(data) {
                    console.log(data);
                    var toast = $mdToast.simple().content(inviteUseremail + ' user successfully cancelled').action('OK').highlightAction(false).position("top right");
                    $mdToast.show(toast).then(function() {});
                });
                apis.ifError(function(data) {
                    console.log(data);
                    var toast = $mdToast.simple().content('There was an error, when user cancelled').action('OK').highlightAction(false).position("top right");
                    $mdToast.show(toast).then(function() {});
                })
                apis.authReq('CancelAddUser', inviteUseremail);
                vm.pendingInvi.splice(index,1);

            });
        }


        function reSendEmail(resendEmail){
            var apis = $apis.getApis();
            apis.ifSuccess(function(data) {
                var toast = $mdToast.simple().content('invitation successfuly resend').action('OK').highlightAction(false).position("top right");
                $mdToast.show(toast).then(function() {});
            })
            apis.ifError(function(data) {
            var toast = $mdToast.simple().content('There was an error, when user invited').action('OK').highlightAction(false).position("top right");
            $mdToast.show(toast).then(function() {});
            });
            // apis.getUser(resendEmail,'user');
            apis.authReq('AddUser', resendEmail+'/user');
        }

        //add roles
        function roles(ev) {
            $mdDialog.show({
                    controller: 'DialogrolesController',
                    controllerAs: 'vm',
                    templateUrl: 'app/main/settings/dialogs/usersDialogs/roles.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose: true
                })
                .then(function(answer) {
                    vm.Settings12thdoor.users.roles.push(answer);
                    updateUser();
                }, function() {
                    $scope.status = 'You cancelled the dialog.';
                });
        };
        
        //add roles
        function rolesEdit(roleEdit, ev) {
            console.log(roleEdit.roleName);

            if(roleEdit.roleName == "Super admin")
            {
                vm.activeRole=true;
                 $mdDialog.show(
                        $mdDialog.alert()
                        .title('Alert')
                        .parent(angular.element(document.body))
                        .content('You cannot edit Super admin role')
                        .ariaLabel('Alert Dialog Demo')
                        .ok('OK')
                );
            }
            else{
                 vm.activeRole=false;
            }
    

        if(!vm.activeRole){
            $mdDialog.show({
            controller: 'DialogrolesEditController',
            controllerAs: 'vm',
            templateUrl: 'app/main/settings/dialogs/usersDialogs/rolesEdit.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            locals: {
                roleEdit: roleEdit,
                role: vm.Settings12thdoor.users.roles
            },
            clickOutsideToClose: true
        })
        .then(function(answer) {
            for (var i = vm.Settings12thdoor.users.roles.length - 1; i >= 0; i--) {
                if (vm.Settings12thdoor.users.roles[i].id == answer.id) {
                    vm.Settings12thdoor.users.roles[i] = answer;
                    break;
                }
            }
            updateUser();
        }, function() {
            $scope.status = 'You cancelled the dialog.';
        });
        }

        
          
        };

        function deleteRole(role, index) {
            debugger;
            for (var i = vm.Settings12thdoor.users.user.length - 1; i >= 0; i--) {
                console.log(vm.Settings12thdoor.users.user[i].role[0].roleName);
                if (vm.Settings12thdoor.users.user[i].role[0].id == role.id) {
                    $mdDialog.show($mdDialog.alert().parent(angular.element(document.body)).content('You cannot delete this role. If you want to remove this role ,you have to delete user bound with perticular role').ariaLabel('').ok('OK').targetEvent());
                    break;
                } else {
                    for (var j = vm.Settings12thdoor.users.roles.length - 1; j >= 0; j--) {
                        if (vm.Settings12thdoor.users.roles[j].id == role.id) {
                            console.log(vm.Settings12thdoor.users.roles[j]);
                            vm.Settings12thdoor.users.roles.splice(j, 1);
                        }
                    }
                }
            }
            updateUser();
        }

        //GetPendingTenantRequest....................................................................
        function GetPendingTenantRequests() {

            var apis = $apis.getApis();
            apis.ifSuccess(function(data) {
                console.log(data);
                if (data !== null) {
                    vm.getPendingUser = data;
                }

            });
            apis.ifError(function(data) {
                //console.log('Pending Request Cannot Display');
                var toast = $mdToast.simple().content('Pending request cannot display').action('OK').highlightAction(false).position("top right");
                $mdToast.show(toast).then(function() {});
            })
            //   $http.get("http://" + window.location.hostname + "/auth/tenant/GetPendingTenantRequest")
            //   .success(function(data){
            //     vm.getPendingUser=data;
            //     console.log($scope.getPendingUser);
            // }).error(function(){
            //     console.log(data);
            // });

            apis.authReq('GetPendingTenantRequest', '');
        }

        GetPendingTenantRequests();

        function acceptUser(getPendingUserDetails, ev) {
            if(vm.showUserAddBtn){
                $mdDialog.show({
                    controller: 'DialogPendingUserController',
                    controllerAs: 'vm',
                    templateUrl: 'app/main/settings/dialogs/usersDialogs/setPendingUser.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    locals: {
                        getPendingUserDetails: getPendingUserDetails
                    },
                    clickOutsideToClose: true
                })
                .then(function(answer) {
                    vm.Settings12thdoor.users.user.push(answer);
                    updateUser();
                    for (var j = vm.getPendingUser.length - 1; j >= 0; j--) {
                        if (vm.getPendingUser[j].Email == answer.inviteUserEmail) {
                            console.log(vm.getPendingUser[j].Email);
                            vm.getPendingUser.splice(j, 1);
                        }
                    }
                }, function() {
                    $scope.status = 'You cancelled the dialog.';
                });
            }
            else{
                $mdDialog.show(
                $mdDialog.alert()
                .title('Unable to accept users')
                .parent(angular.element(document.body))
                .content('You have exceeded the user limit, please purchase more user slots to add users.')
                .ariaLabel('Alert Dialog Demo')
                .ok('OK')
                );
            }

        };
    }
})();

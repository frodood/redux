(function() {
    'use strict';

    angular
        .module('app.settings')
        .controller('DialogcheckAccountController', DialogcheckAccountController);

    /** @ngInject */
    function DialogcheckAccountController($rootScope, $mdDialog, $apis, $mdToast, $mdSidenav, $window, $http) {
        // use the below code on all child view controllers
        var vm = this;

        vm.toggleSidenav = toggleSidenav;

        function toggleSidenav(sidenavId) {
            $mdSidenav(sidenavId).toggle();
        }
        // dont change above code !

        vm.title = "Check Account";
        vm.confirm = confirm;
        vm.progress = false;

        function getAdminOwnerbyTenantId(){
            var getAdminOwner = $apis.getApis();
            getAdminOwner.ifSuccess(function(data) {
                vm.username = data[0].Email;
            });
            getAdminOwner.ifError(function(data) {

            })
            getAdminOwner.authReq('GetTenantAdmin', window.location.host);

        }

        getAdminOwnerbyTenantId();

        function confirm() {

            vm.progress = true;
            var apis = $apis.getApis();
            apis.ifSuccess(function(data) {
                var obj = JSON.parse(data);

                if (obj) {
                    var apisdeleteaccount = $apis.getApis();
                    apisdeleteaccount.ifSuccess(function(data) {
                        console.log(data);
                        if(data.Status){
                        vm.errorWhenEnterwrongDetails = "";
                        $mdDialog.show(
                            $mdDialog.alert()
                            .parent(angular.element(document.body))
                            .title('Request to cancel account successful')
                            .content('Please check your email for instructions to complete the process. You will be signed out shortly.')
                            .ok('Close')
                        );
                        setTimeout(function(){ 
                            $mdDialog.hide();

                            var stripWildcard = function(rawDomain){
                                rawDomain = rawDomain.substring(rawDomain.indexOf('.') + 1);
                                return rawDomain;
                            };

                            // var defaultDomain = stripWildcard(window.location.host);
                            var defaultDomain = window.location.host;

                            location.replace('http://' + defaultDomain + '/logout.php');

                        }, 5000);

                        }
                        else{
                            vm.errorWhenEnterwrongDetails = "You cannot process your request";
                        }

                    });
                    apisdeleteaccount.ifError(function(data) {

                    })
                    apisdeleteaccount.authReq('deleteinit', window.location.host);

                } else {
                    vm.progress = false;
                    vm.errorWhenEnterwrongDetails = "Incorrect password !"
                }
            });
            apis.ifError(function(data) {
                vm.progress = false;

            })
            apis.authReq_1('checklogin', vm.username + '/' + vm.password);

        }

        vm.cancel = function() {
            $mdDialog.cancel();
        };


    }
})();
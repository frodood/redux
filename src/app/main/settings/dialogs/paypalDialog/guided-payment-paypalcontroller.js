(function() {
    'use strict';

    angular
        .module('app.settings')
        .controller('GuidedPaymentpaypalController', GuidedPaymentpaypalController);

    /** @ngInject */
    function GuidedPaymentpaypalController($rootScope,$scope, $setUrl, $http, $helpers, $mdDialog, $apis, $mdToast, $mdSidenav,$paymentgateway) {
        
        var vm = this;
        vm.EmailConfimationError = false;
        vm.toolbarHeader = "Setup Paypal";
        vm.submitButton = "Save";
        vm.ViewHelp = false;
        vm.ShowHelp = ShowHelp;
        vm.back = back;
        vm.toggleSidenav = toggleSidenav;
        var securityToken=$helpers.getCookie("securityToken");
        vm.paypal = {
          email :"",
          email_confirm : ""
        };

        vm.copyToClipboard = copyToClipboard;
        vm.disableSubmitButton = false;

        function toggleSidenav(sidenavId) {
            $mdSidenav(sidenavId).toggle();
        }
        // dont change above code !

        vm.submit = submit;

        function ShowHelp()
        {
            vm.ViewHelp = true;
        }
        function back()
        {
            vm.ViewHelp = false;
        }

        function copyToClipboard(text){
            // document.getElementById("2checkoutId").style.background = "blue";
            var input = document.createElement('textarea');
            document.body.appendChild(input);
            input.value = text;
            input.focus();
            input.select();
            document.execCommand('Copy');
            debugger;
            input.remove();
            var el = document.getElementsByClassName("2checkoutId")[0];
            var range = document.createRange();
            range.selectNodeContents(el);
            var sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        }

        function submit() { debugger;
            vm.disableSubmitButton = true;
            if(vm.paypal.email != vm.paypal.email_confirm)
            {
                vm.EmailConfimationError = true;
                return;
            }
            else
            {
                vm.EmailConfimationError = false;
            }
            
          var clientS = $paymentgateway.setClient('paypal','insertAccKeys');
          clientS.ifSuccess(function(data) {   
            if(data.status){
                var toast = $mdToast.simple().content('paypal payment gateway successfully configured').action('OK').highlightAction(false).position("top right");
                $mdToast.show(toast).then(function() {});
                $mdDialog.hide();

              }else{
                var toast = $mdToast.simple().content('paypal configuration failed').action('OK').highlightAction(false).position("top right");
                $mdToast.show(toast).then(function() {});
                vm.disableSubmitButton = false;
              }
          });
          clientS.ifError(function(data) {
            var toast = $mdToast.simple().content('paypal configuration failed').action('OK').highlightAction(false).position("top right");
                $mdToast.show(toast).then(function() {});
                 vm.disableSubmitButton = false;
          }) 
          clientS.postReq(vm.paypal);
        };

        vm.cancel = function() {
            $mdDialog.cancel();
        };


    }
})();

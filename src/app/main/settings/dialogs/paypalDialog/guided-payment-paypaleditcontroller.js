(function() {
    'use strict';

    angular
        .module('app.settings')
        .controller('EditGuidedPaymentpaypalController', EditGuidedPaymentpaypalController);

    /** @ngInject */
    function EditGuidedPaymentpaypalController($rootScope,$scope, $setUrl, $http, $helpers, $mdDialog, $apis, $mdToast, $mdSidenav,$paymentgateway,accesskey) {
        
        var vm = this;
        vm.toolbarHeader = "Edit Paypal";
        vm.submitButton = "edit";
        vm.ViewHelp = false;
        vm.ShowHelp = ShowHelp;
        vm.back = back;
        vm.toggleSidenav = toggleSidenav;
        var securityToken=$helpers.getCookie("securityToken");
        
        vm.paypal = {
          email : accesskey,
          email_confirm : accesskey
        };

        function toggleSidenav(sidenavId) {
            $mdSidenav(sidenavId).toggle();
        }
        // dont change above code !

        vm.submit = submit;

        vm.copyToClipboard = copyToClipboard;
        vm.disableSubmitButton = false;

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
           var clientS = $paymentgateway.setClient('paypal','deleteClient');
                  clientS.ifSuccess(function(data) {   
                    if(data.status){
                        // paymentgatewayRegisterStatus();
                        // if(vm.paymentdetails.activate)
                        // {
                        //   inactivepayment(vm.paymentdetails);  
                        // } 
                        
                        // var toast = $mdToast.simple().content('Successfully unregistered from 2Checkout').action('OK').highlightAction(false).position("top right");
                        // $mdToast.show(toast).then(function() {});
                        // vm.checkoutRegisterbtnDisabled = false;
                        // vm.checkoutRejectbtnDisabled = true;

                      }else{
                        var toast = $mdToast.simple().content('Deleteting Paypal payment gateway settings failed').action('OK').highlightAction(false).position("top right");
                        $mdToast.show(toast).then(function() {});
                        vm.disableSubmitButton = false;
                      }
                  });
                  clientS.ifError(function(data) {
                    var toast = $mdToast.simple().content('Deleteting Paypal payment gateway settings failed').action('OK').highlightAction(false).position("top right");
                        $mdToast.show(toast).then(function() {});
                        vm.disableSubmitButton = false;
                  }) 
                  clientS.deleteReq(); 
            
          var clientS = $paymentgateway.setClient('paypal','insertAccKeys');
          clientS.ifSuccess(function(data) {   
            if(data.status){
                var toast = $mdToast.simple().content('Paypal payment gateway successfully edited').action('OK').highlightAction(false).position("top right");
                $mdToast.show(toast).then(function() {});
                $mdDialog.hide();

              }else{
                var toast = $mdToast.simple().content('Paypal configuration failed').action('OK').highlightAction(false).position("top right");
                $mdToast.show(toast).then(function() {});
                vm.disableSubmitButton = false;
              }
          });
          clientS.ifError(function(data) {
            var toast = $mdToast.simple().content('Paypal configuration failed').action('OK').highlightAction(false).position("top right");
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
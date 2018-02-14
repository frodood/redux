(function() {
    'use strict';

    angular
        .module('app.settings')
        .controller('GuidedPaymentWebxpayController', GuidedPaymentWebxpayController);

    /** @ngInject */
    function GuidedPaymentWebxpayController($rootScope,$scope, $setUrl, $http, $helpers, $mdDialog, $apis, $mdToast, $mdSidenav,$paymentgateway) {
        
        var vm = this;
        vm.toolbarHeader = "Setup WebXPay";
        vm.submitButton = "Save";
        vm.ViewHelp = false;
        vm.ShowHelp = ShowHelp;
        vm.back = back;
        vm.toggleSidenav = toggleSidenav;
        var securityToken=$helpers.getCookie("securityToken");
        vm.webxpay = {
          pkey :"",
          skey:""
        };

        function toggleSidenav(sidenavId) {
            $mdSidenav(sidenavId).toggle();
        }
        // dont change above code !

        vm.submit = submit;
        vm.copyToClipboard = copyToClipboard;

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
            var el = document.getElementsByClassName("webxpayId")[0];
            var range = document.createRange();
            range.selectNodeContents(el);
            var sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        }

        function submit() { debugger;
            console.log(vm.webxpay);
          var clientS = $paymentgateway.setClient('webxpay','insertAccKeys');
          clientS.ifSuccess(function(data) {   
            if(data.status){
                var toast = $mdToast.simple().content('Webxpay payment gateway successfully configured').action('OK').highlightAction(false).position("top right");
                $mdToast.show(toast).then(function() {});
                $mdDialog.hide();

              }else{
                var toast = $mdToast.simple().content('Webxpay configuration failed').action('OK').highlightAction(false).position("top right");
                $mdToast.show(toast).then(function() {});
              }
          });
          clientS.ifError(function(data) {
            var toast = $mdToast.simple().content('Webxpay configuration failed').action('OK').highlightAction(false).position("top right");
                $mdToast.show(toast).then(function() {});
          }) 
          clientS.postReq(vm.webxpay);
        };

        vm.cancel = function() {
            $mdDialog.cancel();
        };


    }
})();

(function() {
    'use strict';

    angular
        .module('app.settings')
        .controller('EditGuidedPaymentWebxpayController', EditGuidedPaymentWebxpayController);

    /** @ngInject */
    function EditGuidedPaymentWebxpayController($rootScope,$scope, $setUrl, $http, $helpers, $mdDialog, $apis, $mdToast, $mdSidenav,$paymentgateway, accesskey) {
        
        var vm = this;
        vm.toolbarHeader = "Edit WebXPay";
        vm.submitButton = "edit";
        console.log(accesskey);
        vm.ViewHelp = false;
        vm.ShowHelp = ShowHelp;
        vm.back = back;
        vm.toggleSidenav = toggleSidenav;
        var securityToken=$helpers.getCookie("securityToken");
       
        vm.webxpay = {
          pkey :"",
          skey:accesskey
        };

        function toggleSidenav(sidenavId) {
            $mdSidenav(sidenavId).toggle();
        }
        // dont change above code !

        vm.submit = submit;
        vm.copyToClipboard = copyToClipboard;

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
            var el = document.getElementsByClassName("webxpayId")[0];
            var range = document.createRange();
            range.selectNodeContents(el);
            var sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        }

        function submit() { debugger;
            var clientW = $paymentgateway.setClient('webxpay','deleteClient');
                  clientW.ifSuccess(function(data) {   
                    if(data.status){
                        // if(vm.paymentdetails.activate)
                        // {
                        //   inactivepayment(vm.paymentdetails);  
                        // } 
                        // var toast = $mdToast.simple().content('Successfully unregistered from Webxpay').action('OK').highlightAction(false).position("top right");
                        // $mdToast.show(toast).then(function() {});
                        // vm.webxpayRegisterbtnDisabled = false;
                        // vm.webxpayRejectbtnDisabled = true;
                      }else{
                        var toast = $mdToast.simple().content('Webxpay deleting failed').action('OK').highlightAction(false).position("top right");
                        $mdToast.show(toast).then(function() {});
                      }
                  });
                  clientW.ifError(function(data) {
                    var toast = $mdToast.simple().content('Webxpay deleting failed').action('OK').highlightAction(false).position("top right");
                        $mdToast.show(toast).then(function() {});
                  }) 
                  clientW.deleteReq();

            console.log(vm.webxpay);
          var clientS = $paymentgateway.setClient('webxpay','insertAccKeys');
          clientS.ifSuccess(function(data) {   
            if(data.status){
                var toast = $mdToast.simple().content('Webxpay payment gateway successfully edited').action('OK').highlightAction(false).position("top right");
                $mdToast.show(toast).then(function() {});
                $mdDialog.hide();

              }else{
                var toast = $mdToast.simple().content('Webxpay configuration failed').action('OK').highlightAction(false).position("top right");
                $mdToast.show(toast).then(function() {});
              }
          });
          clientS.ifError(function(data) {
            var toast = $mdToast.simple().content('Webxpay configuration failed').action('OK').highlightAction(false).position("top right");
                $mdToast.show(toast).then(function() {});
          }) 
          clientS.postReq(vm.webxpay);
        };

        vm.cancel = function() {
            $mdDialog.cancel();
        };
    }
})();
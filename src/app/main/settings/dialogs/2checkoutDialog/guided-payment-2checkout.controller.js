(function() {
    'use strict';

    angular
        .module('app.settings')
        .controller('GuidedPayment2CheckoutController', GuidedPayment2CheckoutController);

    /** @ngInject */
    function GuidedPayment2CheckoutController($rootScope,$scope, $setUrl, $http, $helpers, $mdDialog, $apis, $mdToast, $mdSidenav,$paymentgateway) {
        
        var vm = this;
        vm.toolbarHeader = "Setup 2Checkout";
        vm.submitButton = "Save";
        vm.ViewHelp = false;
        vm.ShowHelp = ShowHelp;
        vm.back = back;
        vm.toggleSidenav = toggleSidenav;
        var securityToken=$helpers.getCookie("securityToken");
        vm.twoCheckOut = {
          sid :"",
          skey:""
        };

        vm.copyToClipboard = copyToClipboard;

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
            
          var clientS = $paymentgateway.setClient('2checkout','insertAccKeys');
          clientS.ifSuccess(function(data) {   
            if(data.status){
                var toast = $mdToast.simple().content('2Checkout payment gateway successfully configured').action('OK').highlightAction(false).position("top right");
                $mdToast.show(toast).then(function() {});
                $mdDialog.hide();

              }else{
                var toast = $mdToast.simple().content('2Checkout configuration failed').action('OK').highlightAction(false).position("top right");
                $mdToast.show(toast).then(function() {});
              }
          });
          clientS.ifError(function(data) {
            var toast = $mdToast.simple().content('2Checkout configuration failed').action('OK').highlightAction(false).position("top right");
                $mdToast.show(toast).then(function() {});
          }) 
          clientS.postReq(vm.twoCheckOut);
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
        .controller('EditGuidedPayment2CheckoutController', EditGuidedPayment2CheckoutController);

    /** @ngInject */
    function EditGuidedPayment2CheckoutController($rootScope,$scope, $window, $setUrl, $http, $helpers, $mdDialog, $apis, $mdToast, $mdSidenav,$paymentgateway,twocheckoutDetails) {
        
        var vm = this;
        vm.toolbarHeader = "Edit 2Checkout";
        vm.submitButton = "edit";
        vm.ViewHelp = false;
        vm.ShowHelp = ShowHelp;
        vm.back = back;
        vm.toggleSidenav = toggleSidenav;
        var securityToken=$helpers.getCookie("securityToken");
        console.log(twocheckoutDetails);
        vm.twoCheckOut = {
          sid :twocheckoutDetails,
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
            var el = document.getElementsByClassName("2checkoutId")[0];
            var range = document.createRange();
            range.selectNodeContents(el);
            var sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        }

    

        function submit() { debugger;

           var clientS = $paymentgateway.setClient('2checkout','deleteClient');
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
                        var toast = $mdToast.simple().content('Deleteting 2Checkout payment gateway settings failed').action('OK').highlightAction(false).position("top right");
                        $mdToast.show(toast).then(function() {});
                      }
                  });
                  clientS.ifError(function(data) {
                    var toast = $mdToast.simple().content('Deleteting 2Checkout payment gateway settings failed').action('OK').highlightAction(false).position("top right");
                        $mdToast.show(toast).then(function() {});
                  }) 
                  clientS.deleteReq(); 
            
          var clientS = $paymentgateway.setClient('2checkout','insertAccKeys');
          clientS.ifSuccess(function(data) {   
            if(data.status){
                var toast = $mdToast.simple().content('2Checkout payment gateway successfully edited').action('OK').highlightAction(false).position("top right");
                $mdToast.show(toast).then(function() {});
                $mdDialog.hide();

              }else{
                var toast = $mdToast.simple().content('2Checkout configuration failed').action('OK').highlightAction(false).position("top right");
                $mdToast.show(toast).then(function() {});
              }
          });
          clientS.ifError(function(data) {
            var toast = $mdToast.simple().content('2Checkout configuration failed').action('OK').highlightAction(false).position("top right");
                $mdToast.show(toast).then(function() {});
          }) 
          clientS.postReq(vm.twoCheckOut);
        };

        vm.cancel = function() {
            $mdDialog.cancel();
        };

    }
})();
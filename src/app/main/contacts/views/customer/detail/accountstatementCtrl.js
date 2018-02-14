    (function ()
{
    'use strict';

    angular
        .module('app.contacts')
        .controller('accounctStatementCtrl', accounctStatementCtrl);

    /** @ngInject */
   // customerController.$inject = ['$scope', '$rootScope', '$document', '$mdDialog', '$mdMedia', '$mdSidenav', '$state', 'msApi', 'Customer','$serviceCall','$mdToast','$stateParams','contactEditService'];

    function accounctStatementCtrl($scope, $rootScope, $document, $mdDialog, $mdMedia, $mdSidenav, $state, msApi, $serviceCall,$mdToast,$stateParams,contactEditService, msSpinnerService)
    {

      
    debugger;
     loadLegerData();

    

    }
})();


    function loadLegerData(){

        debugger;


        var client =  $serviceCall.setClient("getProfileByKey","profile"); // method name and service
        client.ifSuccess(function(data){  
        console.log(data);

        var profileLog = {
              profileID    : profileID,
              logID        : "-888",
              type         : "Activity",
              description  : "",
              UIHeight     : "30px",
              status       : "Active",
              userName     : "",
              lastTranDate : new Date(),
              createDate   : new Date(),
              modifyDate   : new Date(),
              createUser   : "",
              modifyUser   : ""
              
        }

      

        vm.contact = {
            "profileName"     : "",
            "email"           : "",
            "firstName"       : "",
            "lastName"        : "",
            "billingAddress"  : {},
            "shippingAddress" : {},
            "phone"           : "",
            "mobile"          : "",
            "fax"             : "",
            "website"         : "",
            "profileLog"      : {},
            "status"          : "",
            "profileID"       : "",
            "deleteStatus"    : "",
            "favouriteStar"   : "",
            "favouriteStarNo" : "",
            "createDate"      : "",
            "profileClass"    : "",
            "profileType"     : "",
            "profileCategory" : "",
            "lastTranDate"    : "",
            "modifyDate"      : "",
            "createUser"      : "",
            "modifyUser"      : "",
            "adminMail"       : "",
            "image"           : []
          }

          var editImage = [];


            console.log(data.email);

            vm.contact.profileName=data.profileName;
            vm.contact.email=data.email;
            vm.contact.firstName=data.firstName;
            vm.contact.lastName=data.lastName;
            vm.contact.billingAddress.street=data.billingAddress.street;
            vm.contact.billingAddress.city=data.billingAddress.city;            
            vm.contact.billingAddress.state=data.billingAddress.state;
            vm.contact.billingAddress.zip=data.billingAddress.zip;
            vm.contact.billingAddress.country= data.billingAddress.country;
            vm.contact.fax=data.fax;
            vm.contact.mobile=data.mobile;
            vm.contact.phone=data.phone;
            vm.contact.website=data.website;
            vm.contact.status=data.status;

            console.log(vm.contact);


            


    })
    client.ifError(function(data){ 
    console.log("error loading profile data")
    })
    client.uniqueID(profileID); 
    client.postReq();





    
    vm.legerDetail = [];
    var client =  $serviceCall.setClient("getLegerAllByProfile","process");
            client.ifSuccess(function(data){   

                var data = data;   
                console.log(data);        
                    

                    vm.invoices=data.invoices;
                    vm.payments=data.payments;
                    vm.credits=data.credits;
                    vm.balanceBF=data.balanceBF;
                    vm.balanceDue=data.balanceDue;

                    
                   // $scope.Leger = [];

                    vm.legerDetail = data.detail;
                    console.log(vm.legerDetail);

                    vm.customerSummary = data.summary;
                    console.log(vm.customerSummary);

                    vm.periodDate = data;
                   

        })
        client.ifError(function(data){ 
             console.log(data)
            $mdDialog.show(
                $mdDialog.alert()
                .parent(angular.element(document.body))
                .title('Alert')
                .content('There was an error retreving the data.')
                .ariaLabel('Alert Dialog Demo')
                .ok('OK')
                .targetEvent()
            );
        })
        client.uniqueID($state.params.itemID);
        client.skip(0);
        client.take(10);
        // client.FromDate(dateFrom);
        // client.ToDate(dateTo);
        client.postReq();
  }
(function ()
{
    'use strict';

    angular
    .module('app.contacts')
    .controller('customerComposeController', customerComposeController);

    /** @ngInject */
    function customerComposeController($scope, $rootScope, $document, $mdDialog, $mdMedia, $mdSidenav, $state,$mdToast,$serviceCall, msSpinnerService)
    {
        var vm = this;
        vm.toggleChildStates = toggleChildStates;

        vm.loadingItems = false;

        vm.currentThread = null;

        vm.selectedThreads = [];

        vm.submit=submit; 

        vm.querySearchShipping = querySearchShipping;

        //vm.querySearch = querySearch;

        vm.loadPro = loadPro;

        vm.onChange = onChange;

        vm.cancel = cancel;

        vm.addressChange = addressChange;

        //vm.selectedItemChange = selectedItemChange;

        vm.disableSave = false;

        loadPro();
        loadCountries();

        vm.contact = {};
        $scope.contactCompose = {};

        vm.spinnerService = msSpinnerService;

        function toggleChildStates(toggledState){
            $state.go(toggledState);
        };

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
            "image"           : [],
            //"age"             : "",
            //"NIC"             : "",
            "notes"           : "",
            "customFields"    : []
          }

         
          vm.showBilling = true;

          //__________define Address fields________

          vm.contact["billingAddress"] = {
            city    : "",
            country : "",
            state   : "",
            street  : "",
            zip     : ""
          };
          vm.contact["shippingAddress"] = {
            s_city    : "",
            s_country : "",
            s_state   : "",
            s_street  : "",
            s_zip     : ""
          };
        //========================================

        //________________toggle button to change address_____
          function addressChange(){
          
              vm.showShipping = !vm.showShipping;
              vm.showBilling = !vm.showBilling;
          }

          //______________Copy shipping Address to Billing Address__________________________________________________________
          var cb = false;
          function onChange(cb){

            vm.contact.shippingAddress["s_street"] = vm.contact.billingAddress["street"];
            vm.contact.shippingAddress["s_city"] = vm.contact.billingAddress["city"];
            if (vm.selectedItem != null) {
              vm.contact.shippingAddress["s_country"] = vm.selectedItem.country;
            }
            vm.contact.shippingAddress["s_zip"] = vm.contact.billingAddress["zip"];
            vm.contact.shippingAddress["s_state"] = vm.contact.billingAddress["state"];
            vm.selectedItemShipping = vm.selectedItem.country 
            if (cb == false) {
              vm.contact.shippingAddress["s_street"] = "";
              vm.contact.shippingAddress["s_city"] = "";
              vm.contact.shippingAddress["s_country"] = "";
              vm.contact.shippingAddress["s_zip"] = "";
              vm.contact.shippingAddress["s_state"] = "";
              vm.selectedItemShipping=null;
              vm.searchText1="";
            }
        }

        vm.allCountries = [];
        vm.allCountriesForBilling=[];

        function querySearchShipping(query) {
            vm.results = [];

                for (var i = 0, len = vm.allCountries.length; i < len; ++i) {
                   
                    if (vm.allCountries[i].country.toUpperCase().startsWith(query.toUpperCase()) ) {
                        vm.results.push(vm.allCountries[i]);
                    }
                }
                return vm.results;
            }

        function loadCountries(){
          var client =  $serviceCall.setClient("getCountries","profile"); // method name and service
          client.ifSuccess(function(data){   
            if(data.length > 0){
               for (var i = data.length - 1; i >= 0; i--) {
                 vm.allCountries.push({
                  country: data[i].country_name
                 })
               }
            }
          })
          client.ifError(function(data){ 
          
          })
          client.postReq();
        }

        function querySearch(query) {
            vm.results = [];
            
                for (var i = vm.allCountriesForBilling.length - 1; i >= 0; i--) {

                    if (vm.allCountriesForBilling[i].country.startsWith(query.toLowerCase())) {
                        vm.results.push(vm.allCountriesForBilling[i]);
                    }
                }
                return vm.results;
        }

        function loadPro(){
          var client =  $serviceCall.setClient("getCountries","profile"); // method name and service
          client.ifSuccess(function(data){  
           //console.log(data)
                if(data.length > 0){
                  //vm.allCountriesForBilling=[]
                  for (var i = data.length - 1; i >= 0; i--) {
                    vm.allCountriesForBilling.push({
                      country: data[i].country_name + ", " +  data[i].country_code
                    })
                  }
                }
          })
          client.ifError(function(data){ 
          
          })
          
          client.postReq();
        }


function loadSettingProfile(){
     var client =  $serviceCall.setClient("getAllByQuery","setting"); // method name and service
        client.ifSuccess(function(data){
            if (data.length>0) {
                console.log(data);
                vm.currency=data[0].profile.baseCurrency;
                vm.profileDataFields=data[0].preference.contactPref.customerCusFiel;
                console.log(vm.profileDataFields);

                 getCustFiled(vm.profileDataFields,function(){

                        
                  });
                
            }  
         
        })
        client.ifError(function(data){ 
            console.log(data);
       
        })
        
        client.postReq({
                "setting":"profile",
                "preference":"contactPref"
            });
}
loadSettingProfile();


  function getCustFiled(arr,callback){
  
    var fieldArr = arr;
    console.log(fieldArr);
    var value="";

    for(var l=0; l<= fieldArr.length -1; l++){
        vm.contact.customFields.push({
          labelShown:fieldArr[l].labelShown,
          fields:fieldArr[l].fields,
          type:fieldArr[l].type,
          inputType:fieldArr[l].inputType,
          showOnPdf: fieldArr[l].showOnPdf,
          value:value
        });

      console.log(vm.contact.customFields);
    }
    callback();
  }

 
        function submit(contactCompose){
          console.log(contactCompose);
          console.log(vm.contact);
          // if(contactCompose.$invalid==true){
          //   $scope.contactCompose.$invalid = true;
          // }

          if(!vm.contact.email || vm.contact.email == ""){
             $mdDialog.show(
                $mdDialog.alert()
                .parent(angular.element(document.body))
                .title('Alert')
                .content('Enter an email address.')
                .ariaLabel('Alert Dialog Demo')
                .ok('OK')
                .targetEvent()
              );

             vm.disableSave = false;
            

           }else if(vm.contact.profileName == ""){
            $mdDialog.show(
                $mdDialog.alert()
                .parent(angular.element(document.body))
                .title('Alert')
                .content('Enter a business or individual name.')
                .ariaLabel('Alert Dialog Demo')
                .ok('OK')
                .targetEvent()
              );

            vm.disableSave = false;
            $scope.contactCompose.$invalid = false;

           }else{
            debugger;

            vm.spinnerService.show('conCustomer-compose-spinner');

            vm.disableSave = true;
           

            vm.contact.profileLog = {
                    profileID    : "",
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


                if(vm.selectedItem != null)
                vm.contact.billingAddress["country"] = vm.selectedItem.country;
                if(vm.selectedItemShipping != null)
                  if(vm.selectedItemShipping.country == undefined){
                    vm.contact.shippingAddress["s_country"] = vm.selectedItemShipping;
                  }else{
                    vm.contact.shippingAddress["s_country"] = vm.selectedItemShipping.country;
                  }
                  
                  vm.contact.favouriteStar = false;
                  vm.contact.status = "Active";
                  vm.contact.favouriteStarNo = 1;
                  vm.contact.deleteStatus = false;
                  vm.contact.createDate = new Date();
                  vm.contact.profileClass = "Customer";
                  vm.contact.profileType = "Customer";
                  vm.contact.modifyDate = new Date();

                  vm.customFields=[];

                  for (var i = 0; vm.contact.customFields.length > i; i++) {
                      if(vm.contact.customFields[i].value!=""){
                          vm.customFields.push(vm.contact.customFields[i]);
                      }
                  };
                  
                  
                  vm.contact.customFields = vm.customFields;

                  //vm.contact.age=vm.contact.age.toString();
                  vm.contact.phone=vm.contact.phone.toString();
                  vm.contact.mobile=vm.contact.mobile.toString();
                  vm.contact.fax=vm.contact.fax.toString();

                  var profileObj={};

                  profileObj={
                    "profile": vm.contact,
                    "image"  : vm.contact.image,
                    "appName" : "Contacts",
                    "permissionType":"add"
                  }

                var jsonString = JSON.stringify(profileObj) 

                var client =  $serviceCall.setClient("saveProfile","process"); // method name and service
                client.ifSuccess(function(data){
                 $scope.contactCompose.$invalid = true;   
                     console.log(data);
                  $mdToast.show(
                    $mdToast.simple()
                      .textContent('Customer successfully saved')
                      .position('top right')
                      .theme('success-toast')
                      .hideDelay(2000)
                  );
                  vm.spinnerService.hide('conCustomer-compose-spinner');
                 $state.go("app.contacts.customer");
                })
                client.ifError(function(data){ 

                vm.spinnerService.hide('conCustomer-compose-spinner');

                vm.disableSave = false;
                $scope.contactCompose.$invalid = false;
                // if(data.data.isSuccess == false){
                //     $mdToast.show(
                //     $mdToast.simple()
                //     .textContent(data.data.customMessage)
                //     .position('top right')
                //     .hideDelay(3000)
                //     );
                // }

                // if(data.data.customMessage == null){
                //     $mdToast.show(
                //         $mdToast.simple()
                //         .textContent('Error Saving Customer')
                //         .position('top right')
                //         .hideDelay(3000)
                //     );
                // }
                if(data.data.isSuccess == false){
                    $mdDialog.show(
                    $mdDialog.alert()
                    .parent(angular.element(document.body))
                    .title('Error')
                    .content(data.data.customMessage)
                    .ariaLabel('Alert Dialog Demo')
                    .ok('OK')
                    .targetEvent()
                    );

                }

                if(data.data.customMessage == null){
                    $mdDialog.show(
                    $mdDialog.alert()
                    .parent(angular.element(document.body))
                    .title('Error')
                    .content('Error saving customer')
                    .ariaLabel('Alert Dialog Demo')
                    .ok('OK')
                    .targetEvent()
                    );
                }


                
                })
                
                
                client.postReq(jsonString);
           }


        }

        function cancel(){
          $state.go('app.contacts.customer');
        }

        
        
    }
})();
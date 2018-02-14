(function ()
{
    'use strict';

    angular
    .module('app.contacts')
    .controller('supplierComposeController', supplierComposeController);

    /** @ngInject */
    function supplierComposeController($scope, $rootScope, $document, $mdDialog, $mdMedia, $mdSidenav, $state,$mdToast,$serviceCall, msSpinnerService)
    {
        var vm = this;
        vm.toggleChildStates = toggleChildStates;

        vm.loadingItems = false;

        vm.currentThread = null;

        vm.selectedThreads = [];

        vm.submit=submit;

        vm.querySearch1 = querySearch1;

        vm.querySearch = querySearch;

        vm.loadPro = loadPro;

        vm.onChange = onChange;

        vm.cancel = cancel;

        vm.addressChange = addressChange;

        vm.disableSave = false;

        $scope.supplierCompose={};

        loadPro();
        loadCountries();

        vm.spinnerService = msSpinnerService;


        function toggleChildStates(toggledState){
            $state.go(toggledState);
        };


        
        function toggleChildStates(toggledState){
            $state.go(toggledState);
        };

        vm.supplier = {
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
            "customFields"    : []
          }

          //__________define Address fields________

          vm.supplier["billingAddress"] = {
            city    : "",
            country : "",
            state   : "",
            street  : "",
            zip     : ""
          };
          vm.supplier["shippingAddress"] = {
            s_city    : "",
            s_country : "",
            s_state   : "",
            s_street  : "",
            s_zip     : ""
          };
        //========================================

        vm.showBilling = true;

        //________________toggle button to change address_____
          function addressChange(){
          
              vm.showShipping = !vm.showShipping;
              vm.showBilling = !vm.showBilling;
          }

          //______________Copy shipping Address to Billing Address__________________________________________________________
          var cb = false;

          function onChange(cb){

            vm.supplier.shippingAddress["s_street"] = vm.supplier.billingAddress["street"];
            vm.supplier.shippingAddress["s_city"] = vm.supplier.billingAddress["city"];
            if (vm.selectedItem != null) {
              vm.supplier.shippingAddress["s_country"] = vm.selectedItem.country;
            }
            vm.supplier.shippingAddress["s_zip"] = vm.supplier.billingAddress["zip"];
            vm.supplier.shippingAddress["s_state"] = vm.supplier.billingAddress["state"];
            vm.selectedItem1 = vm.selectedItem.country 
            if (cb == false) {
              vm.supplier.shippingAddress["s_street"] = "";
              vm.supplier.shippingAddress["s_city"] = "";
              vm.supplier.shippingAddress["s_country"] = "";
              vm.supplier.shippingAddress["s_zip"] = "";
              vm.supplier.shippingAddress["s_state"] = "";
              vm.selectedItemShipping=null;
              vm.searchText1="";
            }
        }

         vm.allCountries = [];

        function querySearch(query) {
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

        function querySearch1(query) {
            vm.results = [];
            
                for (var i = vm.allCountriesForBilling.length - 1; i >= 0; i--) {

                    if (vm.allCountriesForBilling[i].country.toUpperCase().startsWith(query.toUpperCase())) {
                        vm.results.push(vm.allCountriesForBilling[i]);
                    }
                }
                return vm.results;
        }

        function loadPro(){
          var client =  $serviceCall.setClient("getCountries","profile"); // method name and service
          client.ifSuccess(function(data){  
           console.log(data)
                if(data.length > 0){
                  vm.allCountriesForBilling=[]
                  for (var i = data.length - 1; i >= 0; i--) {
                    vm.allCountriesForBilling.push({
                      country: data[i].country_name //.toLowerCase() + ", " +  data[i].country_code
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
                    vm.profileDataFields=data[0].preference.contactPref.supplierCusFiel;
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
        // vm.custArr = [];
        // //var fieldArr = arr[0].preference.expensePref.cusFiel;
        // var fieldArr = arr;
        // console.log(fieldArr);

        // for(var l=0; l<= fieldArr.length -1; l++){
        //   vm.custArr.push(fieldArr[l]);
        //   console.log(vm.custArr);
        // }
        // callback();

            var fieldArr = arr;
    console.log(fieldArr);
    var value="";

    for(var l=0; l<= fieldArr.length -1; l++){
        vm.supplier.customFields.push({
          labelShown:fieldArr[l].labelShown,
          fields:fieldArr[l].fields,
          type:fieldArr[l].type,
          inputType:fieldArr[l].inputType,
          showOnPdf: fieldArr[l].showOnPdf,
          value:value
        });

      console.log(vm.supplier.customFields);
    }

    callback();
      }


        function submit(){        


          if(!vm.supplier.email || vm.supplier.email == ""){
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

          }else if(vm.supplier.profileName == ""){
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
            $scope.supplierCompose.$invalid = false;

          }else{

            vm.spinnerService.show('conSupplier-compose-spinner');
            vm.disableSave = true;

            vm.supplier.profileLog = {
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
                vm.supplier.billingAddress["country"] = vm.selectedItem.country;
                if(vm.selectedItem1 != null)
                  if(vm.selectedItem1.country == undefined){
                    vm.supplier.shippingAddress["s_country"] = vm.selectedItem1;
                  }else{
                    vm.supplier.shippingAddress["s_country"] = vm.selectedItem1.country;
                  }
                  
                  vm.supplier.favouriteStar = false;
                  vm.supplier.status = "Active";
                  vm.supplier.favouriteStarNo = 1;
                  vm.supplier.deleteStatus = false;
                  vm.supplier.createDate = new Date();
                  vm.supplier.profileClass = "Supplier";
                  vm.supplier.profileType = "Supplier";
                  vm.supplier.modifyDate = new Date();

                 // vm.supplier.age=vm.supplier.age.toString();
                  vm.supplier.phone=vm.supplier.phone.toString();
                  vm.supplier.mobile=vm.supplier.mobile.toString();
                  vm.supplier.fax=vm.supplier.fax.toString();

                  vm.customFields=[];

                  for (var i = 0; vm.supplier.customFields.length > i; i++) {
                      if(vm.supplier.customFields[i].value!=""){
                          vm.customFields.push(vm.supplier.customFields[i]);
                      }
                  };
                   
                  
                  vm.supplier.customFields = vm.customFields;

                  var profileObj={};

                  profileObj={
                    "profile": vm.supplier,
                    "image"  : vm.supplier.image,
                    "appName" : "Contacts",
                    "permissionType":"add"

                  }

                var jsonString = JSON.stringify(profileObj) 

                var client =  $serviceCall.setClient("saveProfile","process"); // method name and service
                client.ifSuccess(function(data){   
                  $scope.supplierCompose.$invalid = true;
                     console.log(data);
                  $mdToast.show(
                    $mdToast.simple()
                      .textContent('Supplier successfully saved')
                      .position('top right')
                      .theme('success-toast')
                      .hideDelay(2000)
                  );
                  vm.spinnerService.hide('conSupplier-compose-spinner');
                 $state.go("app.contacts.supplier");
                })
                client.ifError(function(data){ 
                  vm.spinnerService.hide('conSupplier-compose-spinner');
                  vm.disableSave = false;
                  $scope.supplierCompose.$invalid = false;
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
                    .content('Error saving supplier')
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
          $state.go('app.contacts.supplier');
        }
    }
})();
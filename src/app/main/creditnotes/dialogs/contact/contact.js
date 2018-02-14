(function ()
{
    'use strict';

    angular
        .module('app.creditnotes')
        .controller('addCusCtrlCre', addCusCtrlCre);

    /** @ngInject */
    function addCusCtrlCre($scope,  $serviceCall, $mdToast, $document, $mdDialog, $mdMedia, $mdSidenav, $state)
    {
    	var vm = this;
    	vm.title = "New Customer";
    	vm.cb = false;
    	vm.showShipping = false;
    	vm.showBilling = true;
    	vm.cancel = cancel;
    	vm.addressChange = addressChange;
    	vm.contact = {};
    	vm.billingCountry = "";
	    vm.shippingCountry = "";

    	vm.contact = {
    		"image"			  :[],
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
		    //"profileLog"      : {}, // commented by dushmantha
		    "status"          : "",
		    "profileID"       : "",
		    "deleteStatus"    : false,
		    "favouriteStar"   : false,
		    "favouriteStarNo" : 1,
		    "createDate"      : "",
		    "profileClass"    : "Customer",
		    "profileType"     : "Customer",
		    "profileCategory" : "",
		    "lastTranDate"    : "",
		    "modifyDate"      : "",
		    "createUser"      : "",
		    "modifyUser"      : "",
		    "adminMail"       : ""
    	}

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

		//_______________Close Dialog Box__________
    	function cancel(){
    		$mdDialog.hide();
    	}

    	//________change address_________________________
		function addressChange() {
		    vm.showShipping = !vm.showShipping;
		    vm.showBilling = !vm.showBilling;
		}

		//______________Copy shipping Address to Billing Address________________________
		vm.onChange = function(cb) {
		     vm.contact.shippingAddress["s_street"] = vm.contact.billingAddress["street"];
		    vm.contact.shippingAddress["s_city"] = vm.contact.billingAddress["city"];
		    if (vm.selectedItem != null) {
		      vm.contact.shippingAddress["s_country"] = vm.selectedItem.country;
		    }
		    vm.contact.shippingAddress["s_zip"] = vm.contact.billingAddress["zip"];
		    vm.contact.shippingAddress["s_state"] = vm.contact.billingAddress["state"];
		    vm.selectedItem1 = vm.selectedItem.country 
		    if (cb == false) {
		      vm.contact.shippingAddress["s_street"] = "";
		      vm.contact.shippingAddress["s_city"] = "";
		      vm.contact.shippingAddress["s_country"] = "";
		      vm.contact.shippingAddress["s_zip"] = "";
		      vm.contact.shippingAddress["s_state"] = "";
		    }
		}

		vm.invalidmail = false;
		//______check whether added email address already exist___________
		 vm.validateEmail = function(obj){
		    vm.emailExsist = false;

		    var re = /\S+@\S+\.\S+/;
		    if(re.test(obj) == true){
		      vm.invalidmail = false;
		    }else{
		      vm.invalidmail = true;
		    }
		}

		//vm.addContact 
		vm.submit= function(){ 
		if (vm.contact.profileName == "") {

	    var toast = $mdToast.simple()
	                .content('Please add Company or Individual Name')
	                .action('OK')
	                .highlightAction(false)
	                .position("bottom right");
	              $mdToast.show(toast).then(function () {
	              });
		} else if (vm.contact.email == "") {
	         var toast = $mdToast.simple()
	                .content('Please enter your email')
	                .action('OK')
	                .highlightAction(false)
	                .position("bottom right");
	              $mdToast.show(toast).then(function () {
	              });
		    } else if(vm.emailExsist == true){
	           var toast = $mdToast.simple()
	                .content('the email is already in use')
	                .action('OK')
	                .highlightAction(false)
	                .position("bottom right");
	              $mdToast.show(toast).then(function () {
	              });
	      }else if(vm.invalidmail == true){
	        var toast = $mdToast.simple()
	                .content('Please add a valid email address')
	                .action('OK')
	                .highlightAction(false)
	                .position("bottom right");
	              $mdToast.show(toast).then(function () {
	              });
	      }else {
		    	/*vm.contact.profileLog = {
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
	          }*/ // commented by dushmatha

	           if(vm.selectedItem != null)
	            vm.contact.billingAddress["country"] = vm.selectedItem.country;
	            if(vm.selectedItem1 != null)
	          if(vm.selectedItem1.country == undefined){
	            vm.contact.shippingAddress["s_country"] = vm.selectedItem1;
	          }else{
	            vm.contact.shippingAddress["s_country"] = vm.selectedItem1.country;
	          }
	            vm.contact.status = "Active";
	            vm.contact.createDate = new Date();
	            vm.contact.profileClass = "Customer";
	            vm.contact.profileType = "Customer";
	            vm.contact.modifyDate = new Date();

	            vm.profObj = {"profile" : vm.contact, "permissionType" : "add", "appName":"Contacts"}

	          var jsonString = JSON.stringify(vm.profObj) 

	          var client = $serviceCall.setClient("saveProfile", "process");
	          client.ifSuccess(function(data){
	          	$mdToast.show(
	            $mdToast.simple()
	              .textContent('Customer Successfully Registerd')
	              .position('bottom right')
	              .theme('success-toast')
	              .hideDelay(2000)
	          	);
	            vm.contact.profileID = data.ID;
	            $mdDialog.hide(vm.contact)
	          });
	          client.ifError(function(data){
	          	$mdDialog.show(
	              $mdDialog.alert()
	              .parent(angular.element(document.body))
	              .content('There was an error saving the data.')
	              .ariaLabel('Alert Dialog Demo')
	              .ok('OK')
	              .targetEvent()
	            );
	          });
	          client.postReq(jsonString);
	         
	    }
	}
	vm.allcountries = [];
	loadCountries();

	function loadCountries(){
		var country = $serviceCall.setClient("getCountries","profile");
		country.ifSuccess(function(data){
			if(data.length > 1){
				for (var i = data.length - 1; i >= 0; i--) {
				vm.allcountries.push({
		            country: data[i].country_name //.toLowerCase() + ", " +  data[i].country_code // commented by dushmantha
		        })
		    	}
			}
		});
		country.ifError(function(data){
		});
		country.postReq();
	}

	//______________________________get country for billing address___________________________________
	vm.selectedItem = null;
    vm.billingquerySearch = billingquerySearch;
    vm.billingSearch = null;

    function billingquerySearch(query) { 
        vm.results = [];
            for (var i = vm.allcountries.length - 1; i >= 0; i--) {
                if (vm.allcountries[i].country.toLowerCase().indexOf(query.toLowerCase()) != -1) {
                    vm.results.push(vm.allcountries[i]);
                }
            }
            return vm.results;
    }

    //______________________________get country for shipping address___________________________________
    vm.selectedItem1 = null;
    vm.querySearch = querySearch;
    vm.searchText = null;

    function querySearch(query) {
        vm.results = [];

            for (var i = 0, len = vm.allcountries.length; i < len; ++i) {
                if (vm.allcountries[i].country.toLowerCase().indexOf(query.toLowerCase()) != -1) {
                    vm.results.push(vm.allcountries[i]);
                }
            }
            return vm.results;
        }

    }
})();

(function ()
{
    'use strict';

    angular
        .module('app.creditnotes')
        .controller('editCusCtrlCre', editCusCtrlCre);

    /** @ngInject */
    function editCusCtrlCre($scope,  $serviceCall, $mdToast, item, $document, $mdDialog, $mdMedia, $mdSidenav, $state)
    {


    	var vm  = this;
    	vm.title = "Edit Customer";
    	vm.cb = false;
    	vm.showShipping = false;
    	vm.showBilling = true;
    	vm.cancel = cancel;
    	vm.addressChange = addressChange;
    	vm.contact = {};
    	vm.contact = item;
    	vm.selectedItem = null;
		vm.selectedItem1 = null;


		vm.selectedItem = item.billingAddress.country;
		vm.selectedItem1 = item.shippingAddress.s_country;

		var editBilingAddress = false;
		var editshippingAddress = false;

    	//_______________Close Dialog Box__________
    	function cancel(){
    		$mdDialog.hide();
    	}

    	//________change address_________________________
		function addressChange() {
		    vm.showShipping = !vm.showShipping;
		    vm.showBilling = !vm.showBilling;
		}


		vm.allcountries = [];
		loadCountries();

		function loadCountries(){
			var country = $serviceCall.setClient("getCountries","profile");
			country.ifSuccess(function(data){
				if(data.length > 1){
					for (var i = data.length - 1; i >= 0; i--) {
					vm.allcountries.push({
			            country: data[i].country_name //.toLowerCase() + ", " +  data[i].country_code // commented by dushmantha
			        })
			    	}
				}
			});
			country.ifError(function(data){
			});
			country.postReq();
		}

		//______________________________get country for billing address___________________________________

	    vm.billingquerySearch = billingquerySearch;
	    vm.billingSearch = null;

	    function billingquerySearch(query) { 
	        vm.results = [];
	            for (var i = vm.allcountries.length - 1; i >= 0; i--) {
	                if (vm.allcountries[i].country.toLowerCase().indexOf(query.toLowerCase()) != -1) {
	                    vm.results.push(vm.allcountries[i]);
	                }
	            }
	            return vm.results;
	    }

	    //______________________________get country for shipping address___________________________________
	    
	    vm.querySearch = querySearch;
	    vm.searchText = null;

	    function querySearch(query) {
	        vm.results = [];

	            for (var i = 0, len = vm.allcountries.length; i < len; ++i) {
	                if (vm.allcountries[i].country.toLowerCase().indexOf(query.toLowerCase()) != -1) {
	                    vm.results.push(vm.allcountries[i]);
	                }
	            }
	            return vm.results;
	        }
	    //_______________________________________________________________
	    vm.editBillingCountry = editBillingCountry;

	    function editBillingCountry(val){ 
	    	editBilingAddress = true;
	    	if(val != null && val.hasOwnProperty('country'))
	    	{
	    		vm.billingCountry = val.country;
	    	}else
	    	{
	    	vm.billingCountry  = val;
	    	}
	    }

	    //_______________________________________________________________
	    vm.editShippingCountry = editShippingCountry;
	    function editShippingCountry(val){ 
	    	editshippingAddress = true;
	    	if(val != null && val.hasOwnProperty('country'))
	    	{
	    		vm.shippingCountry = val.country;
	    	}else
	    	{
	    	 vm.shippingCountry = val;
	    	}
	    	
	    }
	    //________________________________________________________________________
	    vm.submit = submit;

	    function submit(cusDetails){ 

	    	if(editBilingAddress == true){
	    		cusDetails.billingAddress.country = vm.billingCountry;
	    	}

	    	if(editshippingAddress == true){
	    		cusDetails.shippingAddress.s_country = vm.shippingCountry;
	    	}

	    	//vm.profObj = {"profile" : vm.contact, "permissionType" : "add", "appName":"Contacts"}
	        //var jsonString = JSON.stringify(vm.profObj)
	        var jsonString = {"profile" : cusDetails, "permissionType" : "edit", "appName":"Contacts"} 

	        var client = $serviceCall.setClient("updateProfile", "process");
	          client.ifSuccess(function(data){
	          	$mdToast.show(
	            $mdToast.simple()
	              .textContent('Customer Successfully Registerd')
	              .position('bottom right')
	              .theme('success-toast')
	              .hideDelay(2000)
	          	);
	            vm.contact.profileID = data.ID;
	            $mdDialog.hide(cusDetails)
	          });
	          client.ifError(function(data){
	          	$mdDialog.show(
	              $mdDialog.alert()
	              .parent(angular.element(document.body))
	              .content('There was an error saving the data.')
	              .ariaLabel('Alert Dialog Demo')
	              .ok('OK')
	              .targetEvent()
	            );
	          });
	          client.postReq(jsonString);
	    	
	    }

	    vm.invalidmail = false;
		//______check whether added email address already exist___________
		 vm.validateEmail = function(obj){
		    vm.emailExsist = false;

		    var re = /\S+@\S+\.\S+/;
		    if(re.test(obj) == true){
		      vm.invalidmail = false;
		    }else{
		      vm.invalidmail = true;
		    }
		}

		vm.onChange = function(cb) { 
		     vm.contact.shippingAddress["s_street"] = vm.contact.billingAddress["street"];
		    vm.contact.shippingAddress["s_city"] = vm.contact.billingAddress["city"];
		    if (vm.selectedItem != null) {

		    	if(vm.selectedItem != null && vm.selectedItem.hasOwnProperty('country'))
		    	{
		    		vm.contact.shippingAddress["s_country"] = vm.selectedItem.country;
		    		vm.shippingCountry = vm.selectedItem.country;
		      		vm.selectedItem1 = vm.selectedItem.country;
		    		vm.billingCountry = vm.selectedItem.country;
		    	}else
		    	{
		    		vm.contact.shippingAddress["s_country"] = vm.selectedItem;
		    		vm.shippingCountry = vm.selectedItem;
		      		vm.selectedItem1 = vm.selectedItem;
		    		vm.billingCountry = vm.selectedItem;
		    	}
		      
		      
		    }
		    vm.contact.shippingAddress["s_zip"] = vm.contact.billingAddress["zip"];
		    vm.contact.shippingAddress["s_state"] = vm.contact.billingAddress["state"];
		    
		    if (cb == false) {
		      vm.contact.shippingAddress["s_street"] = "";
		      vm.contact.shippingAddress["s_city"] = "";
		      vm.contact.shippingAddress["s_country"] = "";
		      vm.contact.shippingAddress["s_zip"] = "";
		      vm.contact.shippingAddress["s_state"] = "";
		    }
		}

    }
    })();
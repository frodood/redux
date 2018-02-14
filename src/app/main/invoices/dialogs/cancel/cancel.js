 (function ()
{
    'use strict';

    angular
        .module('app.invoices')
        .controller('cancelRecCtrl', cancelRecCtrl)


 function cancelRecCtrl($scope, item, $serviceCall, $mdToast, $document, $mdDialog, $mdMedia, $mdSidenav, $state)
    {


    	var vm  = this;
      vm.cancelD = item;
      vm.todayDate = new Date();
      vm.cancelD.startDate = new Date(vm.cancelD.startDate);
      vm.close = close;
    	vm.TDinv = {
            "invoiceNo"              : "",
            "baseCurrency"           : item.baseCurrency,
            "changedCurrency"        : item.changedCurrency,
            "isCurrencyChanged"      : false,
            "customFields"           : [],
            "deleteStatus"           : false,
            "displayShippingAddress" : "",
            "email"                  : item.email,
            "multiDueDates"          : [],
            "profileID"              : item.profileID,
            "profileName"            : item.profileName,
            "startDate"              : new Date(),
            "uploadImages"           : [],
            "allowPartialPayments"   : "",
            "billingAddress"         : item.billingAddress,
            "comments"               : item.comments,
            "notes"                  : "",
            "invoiceLog"             : {},
            "discountAmount"         : 0,
            "dueDate"                : new Date(),
            "discountPercentage"     : 0,//saves the dicount
            "favouriteStar"          : false,
            "favouriteStarNo"        : 1,
            "subTotal"               : item.subTotal,
            "netAmount"              : item.netAmount,
            "paymentMethod"          : "",
            "invoiceLines"           : item.invoiceLines,
            "tags"                   : item.tags,
            "salesTaxAmount"         : 0,
            "shipping"               : "",
            "shippingAddress"        : item.shippingAddress,
            "taxAmounts"             : [],
            "status"                 : "Invoice",
            "peymentTerm"            : "",
            "lastTranDate"           : new Date(),
            "createDate"             : new Date(),
            "modifyDate"             : new Date(),
            "createUser"             : "",
            "modifyUser"             : "",
            "currencyChanged"        : false,
            "poNumber"               : "",
            "pattern"                : "DINV"+"0000",
            "sendMail"               : false,
            "viewed"                 : false,
            "lastEmailDate"          : "",
            "invoiceStatus"          : "Draft",
            "discountTerm"           : "Individual Items",
            "recurringInvoiceID"     : "0",
            "contactNo"              : ""
        };
 vm.TDinv.multiDueDates = [{
     dueDate: new Date(),
        percentage: "0",
        dueDatePrice: item.netAmount,
        paymentStatus: 'Unpaid',
        balance: item.netAmount,
        paidAmount : 0
    }];
       

       function close(){
       	$mdDialog.hide()
       }
 
      // vm.occurenc =   - new Date(item.startDate);
      var today = new Date()
      var startDate = new Date(item.startDate);
      vm.daysBetween = daysBetween;
       daysBetween(startDate,today );

       function daysBetween( date1, date2 ) {
		  //Get 1 day in milliseconds
		  var one_day=1000*60*60*24;

		  // Convert both dates to milliseconds
		  var date1_ms = date1.getTime();
		  var date2_ms = date2.getTime();

		  // Calculate the difference in milliseconds
		  var difference_ms = date2_ms - date1_ms;
		    
		  // Convert back to days and return
		  vm.occurenc = Math.round(difference_ms/one_day)
		  //console.log() ; 
		}


      vm.cancelRec = cancelRec; 

      vm.prorate = false;

      function cancelRec(){
        if(vm.prorate == true){
        	saveInvDraft()
        }else {
        	cancelProfile();
        }
      };


      function saveInvDraft(){
      	 var jsonString = JSON.stringify(vm.TDinv);

            var client =  $serviceCall.setClient("insertDraft","invoice");
            client.ifSuccess(function(data){
               //$state.go('app.invoices.inv'); 

              $mdToast.show(
                  $mdToast.simple()
                    .textContent('Draft invoice '+ data.ID +' successfully saved')
                    .position('top right' )
                    .hideDelay(3000)
                );
              cancelProfile()
             });
             client.ifError(function(data){
              $mdToast.show(
                  $mdToast.simple()
                    .textContent('Error saving draft invoice')
                    .position('top right' )
                    .hideDelay(3000)
                );
             })
              client.postReq(jsonString);

      }

      	function cancelProfile(){
      		vm.cancelD.status = "Cancelled"
                var recObj = {"recurringInvoice" : vm.cancelD, "image" :[], "permissionType" : "delete", "appName":"Invoices" };
                //var Invoice = { "permissionType" : "add", "appName":"Invoices"};
                var jsonString = JSON.stringify(recObj);

                var client =  $serviceCall.setClient("CancelRecurringInvoice","process");
               client.ifSuccess(function(data){
                 
                
                $mdToast.show(
                    $mdToast.simple()
                      .textContent('Profile Successfully Cancelled')
                      .position('top right' )
                      .hideDelay(3000)
                  );

                $mdDialog.hide()
               });
               client.ifError(function(data){
                console.log("error loading setting data")
               })
               client.uniqueID($state.params.itemId); // send projectID as url parameters
               //client.GRNPattern("GRN0001");
                client.postReq(jsonString);
      	}

      

    }
})();
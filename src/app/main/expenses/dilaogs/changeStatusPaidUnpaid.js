(function ()
{
	'use strict';

	angular
		.module('app.expenses')
		.controller('dialogChangeStatusCtrl',dialogChangeStatusCtrl);

	function dialogChangeStatusCtrl($mdDialog,obj,$serviceCall,$mdToast){
		var vm=this;


  //$scope.urlDomain = $urlLocation.setUrl();
  vm.statusChange={};
  vm.statusChange=angular.copy(obj);
  //console.log($scope.statusChange);
  vm.statusChange.dueDate = new Date(vm.statusChange.dueDate);

  vm.calanderfun = calanderfun;

  vm.submit = submit;

  vm.cancel = cancel;

  console.log(vm.statusChange);

  if(obj.status == "Paid"){

    vm.statusChange.status = "Unpaid";
    vm.statusChange.dueDate = new Date();
  }
  else{
    vm.statusChange.status = "Paid";
 
  }

  function calanderfun(obj){
 
  	    console.log(obj);
	    if (obj.status == "Paid") {
	      obj.dueDate = undefined;
	      obj.status=vm.statusChange.status;
	    } else if (obj.status == "Unpaid") {
	      vm.statusChange.dueDate = new Date();
	      obj.dueDate=vm.statusChange.dueDate;
	      obj.status=vm.statusChange.status;
	      
	    };

  }

  function submit(statusChange){
	console.log(statusChange);
          if(vm.statusChange.status == 'Paid'){
            vm.statusChange.dueDate="";
          }
          vm.updateddata=statusChange;
         
          var serviceObj = {
                "expense": vm.updateddata,
                "image": vm.updateddata.uploadImage,
                "appName": "Expenses",
                "permissionType": "edit"
            }

            vm.serviceObj = JSON.stringify(serviceObj);


          var client =$serviceCall.setClient("updateExpense","process");
          client.ifSuccess(function(data){
            StatusChange(obj);
          	$mdDialog.hide(vm.ExpenseStatus);
          });
          client.ifError(function(data){
          	if(data.data.isSuccess == false){
                    $mdToast.show(
                    $mdToast.simple()
                    .textContent(data.data.customMessage)
                    .position('top right')
                    .hideDelay(3000)
                    );
            }

            if(data.data.customMessage == null){
                $mdToast.show(
                    $mdToast.simple()
                    .textContent('Error Updating Expense') 
                    .position('top right')
                    .hideDelay(3000)
                );
            }

          });
          client.postReq(vm.serviceObj);

          
        }

        function cancel(){
        	$mdDialog.cancel();
        }

      function StatusChange(obj){
	        if (vm.statusChange.status == 'Paid') {
  
	          obj.status = vm.statusChange.status;
	          obj.dueDate="";
	          vm.ExpenseStatus = "Mark as Unpaid";
	        }else if (vm.statusChange.status == 'Unpaid') {
        
	          obj.status = vm.statusChange.status;
	          obj.dueDate=vm.statusChange.dueDate;
	          vm.ExpenseStatus = "Mark as Paid";
	        };

      }

	}
})();
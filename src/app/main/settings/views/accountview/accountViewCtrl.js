(function()
{
  'use strict';

  angular
  .module('app.settings')
  .controller('accountsViewController',accountsViewController);

  /** @ngInject */
  function accountsViewController($scope, $rootScope, $document, $mdDialog, $mdMedia, $serviceCall, $mdSidenav, $state, msApi, $auth, $apis, $http, $helpers, $mdToast)
  {
    var securityToken=$helpers.getCookie("securityToken");
    	// use the below code on all child view controllers
    	var vm = this;
      vm.selectedApplicationForImport = "";
      vm.selectedApplicationForExport = "";
      vm.ApplicationsForImport = {};
      vm.ApplicationsForExport = {};
      vm.fromDate = new Date();
      vm.toDate = new Date();
      vm.uploading = false;
      vm.downloading = false;
      
      vm.importData = importData;
      vm.exportData = exportData;
      vm.dowloadTemplate = dowloadTemplate;
    	vm.toggleSidenav = toggleSidenav;
      vm.filedata = {};

      //------------------------------------------Start loading Applications For Import
      
      var reporting = $serviceCall.setClient("getApplicationsforImport","process");
      reporting.ifSuccess(function(data){
      vm.ApplicationsForImport = data;
      });
      reporting.ifError(function(data){
        $mdToast.show(
                  $mdToast.simple()
                    .textContent('Error Loading Applications')
                    .position('top right' )
                    .hideDelay(3000)
                );
      });
      reporting.getReq();
      //------------------------------------------End loading Applications For Import

      //------------------------------------------Start loading Applications For Export
      var reporting = $serviceCall.setClient("getApplicationsforExport","process");
      reporting.ifSuccess(function(data){
      vm.ApplicationsForExport = data;
      });
      reporting.ifError(function(data){
        $mdToast.show(
                  $mdToast.simple()
                    .textContent('Error Loading Applications')
                    .position('top right' )
                    .hideDelay(3000)
                );
      });
      reporting.getReq();
      //------------------------------------------End loading Applications For Export

      //--------------------------------
    	function toggleSidenav(sidenavId)
    	{
    		$mdSidenav(sidenavId).toggle();
    	}
    	// dont change above code !
      
      //------------------------------------------Start Import Data
      function importData()
      {
        if(vm.filedata.fileReady != true){

          if(vm.selectedApplicationForImport == "")
          {
            $mdDialog.show(
                    $mdDialog.alert()
                    .parent(angular.element(document.body))
                    .content('Please select application to continue')
                    .ariaLabel('Alert Dialog')
                    .ok('OK')
                    .targetEvent()
                  );
            return;
          }
          if(parseFloat(vm.filedata.filesize) > 2000000)
          {
            $mdDialog.show(
                        $mdDialog.alert()
                        .parent(angular.element(document.body))
                        .title('Alert')
                        .content('Maximum file size allowed for upload is 2 MB')
                        .ok('OK')
                        .targetEvent()
                      );

            return;
          }
          else if(vm.filedata.filesize == undefined)
          {
            $mdDialog.show(
                        $mdDialog.alert()
                        .parent(angular.element(document.body))
                        .title('Alert')
                        .content('Selected file is empty or not supported')
                        .ok('OK')
                        .targetEvent()
                      );
            return;
          }
        }
        else if(vm.filedata.fileReady == undefined)
        {
          $mdDialog.show(
                        $mdDialog.alert()
                        .parent(angular.element(document.body))
                        .title('Alert')
                        .content('Selected file is empty or not supported')
                        .ok('OK')
                        .targetEvent()
                      );
          return;
        }
          var postJson = {data : vm.filedata.base64, application : vm.selectedApplicationForImport};
          var reporting = $serviceCall.setClient("createByFile","process");
            reporting.ifSuccess(function(data){
              console.log(data);
            vm.uploading = false;

            if(data.isSuccess){
              $mdToast.show(
                  $mdToast.simple()
                    .textContent(vm.selectedApplicationForImport+' data has ben uploaded successfully')
                    .position('top right' )
                    .hideDelay(3000)
                );
            }
            else{
              $mdDialog.show(
                      $mdDialog.alert()
                      .parent(angular.element(document.body))
                      .title('Error')
                      .content(data.customMessage)
                      .ok('OK')
                      .targetEvent()
              );
            }
                
            });
            reporting.ifError(function(data){
              vm.uploading = false;
              debugger;
              if(data.data.message == undefined || data.data.message.includes("Unexpected token"))
                {

                    $mdDialog.show(
                      $mdDialog.alert()
                      .parent(angular.element(document.body))
                      .title('Error')
                      .content('Error While Uploading Data')
                      .ok('OK')
                      .targetEvent()
                    );

                }else
                {
                    $mdDialog.show(
                      $mdDialog.alert()
                      .parent(angular.element(document.body))
                      .title('Error')
                      .content(data.data.customMessage)
                      .ok('OK')
                      .targetEvent()
                    );
                }

            });
            reporting.postReq(postJson);
            vm.uploading = true;
      }
      //------------------------------------------End Import Data
      
      //var accountSettingsCSVPicker = $document.find('#accountSettingsCSVPicker');
      
      //------------------------------------------Start Watching For file To Base64 encode
      $scope.$watch("vm.filedata", function(data,e){
        if(data != null && data.filename != undefined && data.filename.includes(".csv"))
        {debugger;
          if(parseFloat(vm.filedata.filesize) > 2000000)
          {
            $mdDialog.show(
                      $mdDialog.alert()
                      .parent(angular.element(document.body))
                      .title('Alert')
                      .content('Maximum file size allowed for upload is 2 MB')
                      .ok('OK')
                      .targetEvent()
                    );
          }
          else
          {
            data.fileReady = true;
          }
        }
        
      });
      //------------------------------------------End Watching For file To Base64 encode

      //------------------------------------------Start Common methord convert to CSV
      function ConvertToCSV(objArray,IsTemplate) { debugger;
            var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
            var str = '';

            for (var i = 0; i < array.length; i++) {
                
                if(IsTemplate == true) // check if json object array
                {
                  var line = '';
                  var columnCount = 0;
                  for (var index in array[i]) {
                      if (columnCount > 0) {line += ','}
                      columnCount++;
                      line += array[i][index];
                  }
                  str += line + '\r\n';
                }
                else // json array
                {
                  var line = '';
                  var columnCount = 0;
                  for (var index in array[0]) {
                      if (columnCount > 0) {line += ','}
                      columnCount++;

                      if(i == 0)
                      {
                      line += array[i][index];
                      }
                      else
                      {
                        line += array[i][array[0][index]];
                      }

                  }
                  str += line + '\r\n';
                }
            }

            return str;
        }
      //------------------------------------------End Common methord convert to CSV

      
      //------------------------------------------Start Downloading Data
      function dowloadTemplate()
      { 
        if(vm.selectedApplicationForImport == "")
        {
          $mdDialog.show(
                  $mdDialog.alert()
                  .parent(angular.element(document.body))
                  .content('Please select application to continue')
                  .ariaLabel('Alert Dialog')
                  .ok('OK')
                  .targetEvent()
                );
          return;
        }
        //------------------------------------------Start getImportHeaderDataSet
        var reporting = $serviceCall.setClient("getImportHeaderDataSet","process");
        reporting.ifSuccess(function(data){
        
            //-------------------------Create Object
            /*var items = [
                  { name: "Item 1", color: "Green", size: "X-Large" },
                  { name: "Item 2", color: "Green", size: "X-Large" },
                  { name: "Item 3", color: "Green", size: "X-Large" }];*/

            var items = data;
            //-------------------------Convert Object to JSON
            var jsonObject = JSON.stringify(items);

            //-------------------------Convert JSON to CSV & Display CSV
            var CSV_file = ConvertToCSV(jsonObject,true);
             var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:attachment/csv,' + encodeURI(CSV_file);
            hiddenElement.target = '_blank';
            hiddenElement.download = vm.selectedApplicationForImport +'ImportTemplate.csv';
            hiddenElement.click();
            //----------------------------------------------------------
        });
        reporting.ifError(function(data){
          $mdToast.show(
                    $mdToast.simple()
                      .textContent('Error Loading Template')
                      .position('top right' )
                      .hideDelay(3000)
                  );
        });
        reporting.application(vm.selectedApplicationForImport);
        reporting.getReq();
        //------------------------------------------End getImportHeaderDataSet
      }
      //------------------------------------------End Downloading Data
      function exportData()
      {debugger;
        if(vm.selectedApplicationForExport == "")
        {
          $mdDialog.show(
                  $mdDialog.alert()
                  .parent(angular.element(document.body))
                  .content('Please select application to continue')
                  .ariaLabel('Alert Dialog')
                  .ok('OK')
                  .targetEvent()
                );
          return;
        }
        vm.downloading = true;
        //------------------------------------------Start getExportData
        var reporting = $serviceCall.setClient("getExportData","process");
        reporting.ifSuccess(function(data){ 
        vm.downloading = false;
            var items = data.result
            //-------------------------Convert Object to JSON
            var jsonObject = JSON.stringify(items);

            //-------------------------Convert JSON to CSV & Display CSV
            var CSV_file = ConvertToCSV(jsonObject,false);
             var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:attachment/csv,' + encodeURI(CSV_file);
            hiddenElement.target = '_blank';
            hiddenElement.download = vm.selectedApplicationForExport +'ExportedData.csv';
            hiddenElement.click();
            //----------------------------------------------------------
        });
        reporting.ifError(function(data){
          vm.downloading = false;
          $mdToast.show(
                    $mdToast.simple()
                      .textContent('Error Exporting data')
                      .position('top right' )
                      .hideDelay(3000)
                  );
        });
        reporting.application(vm.selectedApplicationForExport);
        reporting.ToDate(moment(vm.toDate).format('MM/DD/YYYY h:mm a'));
        reporting.FromDate(moment(vm.fromDate).format('MM/DD/YYYY h:mm a'));
        reporting.getReq();
        //------------------------------------------End getExportData
      }

      //..............START Cancel Account..........................
      vm.cancelTenantAccount = cancelTenantAccount;

      function cancelTenantAccount(ev){
          var confirm = $mdDialog.confirm()
            .title('Warning!')
            .textContent('PLEASE EXPORT YOUR DATA IF REQUIRED PRIOR TO GOING AHEAD. THIS PROCESS IS NOT REVERSIBLE AND CANNOT BE UNDONE. You will receive an email with cancellation instructions and logged out of your account.')
            .ariaLabel('Lucky day')
            .targetEvent(ev)
            .ok('OK')
            .cancel('Cancel');

          $mdDialog.show(confirm).then(function() {

            $mdDialog.show({
              controller: 'DialogcheckAccountController',
              controllerAs: 'vm',
              templateUrl: 'app/main/settings/dialogs/accountDialogs/checkAccount.html',
              parent: angular.element(document.body),
              clickOutsideToClose: true
            })
            .then(function(answer) {
                
            }, function() {
                $scope.status = 'You cancelled the dialog.';
            });

            
          }, function() {
            $scope.status = 'You decided to keep your debt.';
          });

      }
      //..............END Cancel Account..........................




  }
})();
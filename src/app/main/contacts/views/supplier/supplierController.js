(function() {
  'use strict';

  angular
    .module('app.contacts')
    .controller('supplierController', supplierController);

  /** @ngInject */
  function supplierController($scope, $rootScope, $document, $mdDialog, $mdMedia, $mdSidenav, $state, msApi, $serviceCall, $mdToast,supplierEditService, msSpinnerService) {
    var vm = this;

    vm.contactColors = ['blue-bg', 'blue-grey-bg', 'orange-bg', 'pink-bg', 'purple-bg', 'green-bg', 'red-bg'];

    // vm.supplierSummaryData = Supplier.result;
    vm.spinnerService = msSpinnerService;

    vm.primaryToolbarContext = true;

    vm.toggleChildStates = toggleChildStates;

    vm.loadingItems = false;

    vm.currentItem = null;

    vm.selectedThreads = [];

    vm.openItem = openItem;

    vm.closeThread = closeThread;

    vm.isSelected = isSelected;

    vm.toggleSelectThread = toggleSelectThread;

    vm.selectThreads = selectThreads;

    vm.deselectThreads = deselectThreads;

    vm.toggleSelectThreads = toggleSelectThreads;

    vm.setThreadStatus = setThreadStatus;

    vm.toggleThreadStatus = toggleThreadStatus;

    vm.showAdvancedEditDialog = showAdvancedEditDialog;

    vm.changeStatus = changeStatus;

    vm.starfunc = starfunc;

    vm.ContactDelete = ContactDelete;

    vm.filterFavourite = filterFavourite;

    vm.filterActive = filterActive;

    vm.sortAll = sortAll;

    vm.inventoryReceived = inventoryReceived;

    vm.defaultCancel = defaultCancel;

    

    vm.pageObj = {
           service : 'profile',
            method : 'getAllByQuery',
            orderby: '',
            isAscending : 'false',
            class : 'Supplier',
            body : {
                "where": "deleteStatus = false AND profileClass = 'Supplier' order by createDate DESC"
            }
            
        } 

        vm.pageGap=10;
        $scope.$broadcast("getPageObj", vm.pageObj);
        
        vm.indexno=1;  

        vm.supListSpinnerLoaded = supListSpinnerLoaded;

        function supListSpinnerLoaded(detailSpinner){
            detailSpinner.show('sup-list-spinner'); 
        }
        
    init();

    /**
     * Initialize
     */
    function init() {

    }

    function inventoryReceived(val){        
        var passingDataContact = {
            //itemID : val.profileID,
            Data : {profileId : val.profileID},
            appName : "profile"
        }
        
        $state.go('app.inventory.grnCompose',passingDataContact);
    }


    vm.testarr = [{
            name: "Starred",
            id: "favouriteStarNo",
            src: "img/ic_grade_48px.svg",
            upstatus: false,
            downstatus: false,
            divider: true,
            close: false
          }, {
            //name: vm.sortName,
            name:"Supplier",
            id: "profileName",
            upstatus: false,
            downstatus: false,
            divider: false,
            close: false
          }, {
           // name: vm.sortEmail,
            name: "Email",
            id: "email",
            upstatus: false,
            downstatus: false,
            divider: false,
            close: false
          }, 
          // {
          //  // name: vm.sortPerson,
          //   name : "Customer",
          //   id: "firstName",
          //   upstatus: false,
          //   downstatus: false,
          //   divider: true,
          //   close: false
          // },
           {
            name: "Active",
            id: "status",
            upstatus: false,
            downstatus: false,
            divider: false,
            close: false
          }, {
            name: "Inactive",
            id: "status",
            upstatus: false,
            downstatus: false,
            divider: false,
            close: false
          }];


          function starfunc(item, index){
       // pass sort object and index number       
            if (item.id === "favouriteStarNo") { 
                item.upstatus = false;
                item.downstatus = false;
                vm.testarr[vm.indexno].upstatus = false;
                vm.testarr[vm.indexno].downstatus = false;
                vm.testarr[vm.indexno].close = false;
                item.close = true;
                vm.indexno = index; 
                vm.orderby = "favouriteStarNo";
                vm.isAscending = true;
                
                loadAllSuppliers(vm.orderby,vm.isAscending);
                
                

              }else if(item.id === "status"){
                item.upstatus == false;     // hide current up icon
                item.downstatus = false;    // hide current down icon
                vm.testarr[vm.indexno].downstatus = false;  // hide previous down icon
                vm.testarr[vm.indexno].upstatus = false;    // hide previous up icon
                vm.testarr[vm.indexno].close = false;       // hide previous close icon
                item.close = true;
                vm.indexno = index;

                vm.orderby = "status";
                if (item.name=="Active") 
                    // vm.isAscending = true;
                  statusFilter({
                        "where": "deleteStatus = false AND status = 'Active' AND profileClass = 'Supplier' order by createDate DESC"
                    });
                else if (item.name=="Inactive") 
                    // vm.isAscending = false;
                  statusFilter({
                        "where": "deleteStatus = false AND status = 'Inactive' AND profileClass = 'Supplier' order by createDate DESC"
                    });

               
                // loadAllSuppliers(vm.orderby,vm.isAscending); 

                
                
              } else {
                if (item.upstatus == false && item.downstatus == false) {
                  item.upstatus = !item.upstatus;
                  item.close = true;

                  if (vm.indexno != index) {
                    vm.testarr[vm.indexno].upstatus = false; // hide previous up icon
                    vm.testarr[vm.indexno].downstatus = false; // hide previous down icon
                    vm.testarr[vm.indexno].close = false; // hide previous close icon
                    vm.indexno = index;
                  }
                } else {
                  item.upstatus = !item.upstatus;
                  item.downstatus = !item.downstatus;
                  item.close = true;
                } 

                if (item.upstatus) { 
                  vm.orderby = item.id;
                  vm.isAscending = true;
                 
                  loadAllSuppliers(vm.orderby,vm.isAscending);  
                  
                  vm.sortSelected = true
                }
                if (item.downstatus) { 
                  vm.orderby = item.id;
                  vm.isAscending = false;
                 
                loadAllSuppliers(vm.orderby,vm.isAscending);                
                  
                  vm.sortSelected = false
                }
              }

            }
            // sort function end 

            function loadAllSuppliers(orderby,Isascending){
               var whereClause;
              if (orderby == "" || orderby == "createDate"){
                // if (vm.sortSelected)
                //   whereClause = "deleteStatus = 'false' AND profileClass = 'Supplier' order by createDate";
                // else
                  whereClause = "deleteStatus = 'false' AND profileClass = 'Supplier' order by createDate DESC";
              }
              else{
                if (Isascending) 
                  whereClause = "deleteStatus = 'false' AND profileClass = 'Supplier' order by "+orderby+", createDate DESC";
                else
                  whereClause = "deleteStatus = 'false' AND profileClass = 'Supplier' order by "+orderby+" DESC, createDate DESC";       
              }
              vm.pageObj = {
                service : 'profile',
                method : 'getAllByQuery',
                body : {
                    "where": whereClause
                },
                orderby: '',
                isAscending : ''
        }

        $scope.$broadcast("getPageObj", vm.pageObj);

        }

        function statusFilter(whereClause){

          vm.pageObj = {
                service : 'profile',
                method : 'getAllByQuery',
                body : whereClause,
                orderby: '',
                isAscending : ''
        }

        $scope.$broadcast("getPageObj", vm.pageObj);

        }


        function defaultCancel(item) {
        
          vm.testarr[vm.indexno].upstatus = false;
          vm.testarr[vm.indexno].downstatus = false;
          item.close = false;    
          vm.orderby = "createDate",
          vm.isAscending = false;       
          loadAllSuppliers(vm.orderby,vm.isAscending);        
      }


      function favouriteFunction(favFuncForm){
          
        // change the favouriteStar to  opposite boolean value 
        // change the favouriteStarNo 1 or 0 
        if (favFuncForm.favouriteStarNo == 1)
            favFuncForm.favouriteStarNo = 0;

        else if (favFuncForm.favouriteStarNo == 0)
            favFuncForm.favouriteStarNo = 1;

        favFuncForm.favouriteStar = !favFuncForm.favouriteStar;


        favFuncForm.profileLog = {
            profileID: "",
            logID: "-888",
            type: "",
            description: "",
            UIHeight: "",
            status: "",
            userName: "",
            lastTranDate: "",
            createDate: "",
            modifyDate: "",
            createUser: "",
            modifyUser: ""
        }

        var favFuncObj = {
            "appName": "Contacts",
            "permissionType": "edit",
            "profile": favFuncForm,
            "image": favFuncForm.image
        }

        var jsonString = JSON.stringify(favFuncObj);


        var client = $serviceCall.setClient("updateProfile","process"); // method name and service
        client.ifSuccess(function(data){   
            //   if (favFuncForm.favouriteStar) {
            //     var toast = $mdToast.simple()
            //         .content('Add To Favourite')
            //         .action('OK')
            //         .highlightAction(false)
            //         .position("bottom right");
            //     favFuncForm.favouriteStarNo = 0;
            //     $mdToast.show(toast).then(function() {});
            // } else {
            //     var toast = $mdToast.simple()
            //         .content('Remove from Favourite')
            //         .action('OK')
            //         .highlightAction(false)
            //         .position("bottom right");
            //     favFuncForm.favouriteStarNo = 1;
            //     $mdToast.show(toast).then(function() {});
            // }
        })
        client.ifError(function(data){ 
        if(data.data.isSuccess == false){
                    $mdDialog.show(
                    $mdDialog.alert()
                    .parent(angular.element(document.body))
                    .title('Alert')
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
                    .content('Error occure while adding to favourite')
                    .ariaLabel('Alert Dialog Demo')
                    .ok('OK')
                    .targetEvent()
                    );
}

        })
        
        client.postReq(jsonString);
      }


      function filterFavourite(){   

        var whereClause = "deleteStatus = false AND favouriteStar = true AND profileClass = 'Supplier' order by createDate DESC"

        vm.pageObj = {
            service : 'profile',
            method : 'getAllByQuery',
            body : {"where" : whereClause},
            orderby: '',
            isAscending : ''
        }

        $scope.$broadcast("getPageObj", vm.pageObj)

        vm.testarr[vm.indexno].upstatus = false;
        vm.testarr[vm.indexno].downstatus = false;
        vm.testarr[vm.indexno].close = false;


      }

      function filterActive(){

        var whereClause = "deleteStatus = false AND status = 'Active' AND profileClass = 'Supplier' order by createDate DESC"

        vm.pageObj = {
            service : 'profile',
            method : 'getAllByQuery',
            body : {"where" : whereClause},
            orderby: '',
            isAscending : ''
        }

        $scope.$broadcast("getPageObj", vm.pageObj)

        vm.testarr[vm.indexno].upstatus = false;
        vm.testarr[vm.indexno].downstatus = false;
        vm.testarr[vm.indexno].close = false;

      }

      function sortAll(){
          
          var whereClause = "deleteStatus = 'false' AND profileClass = 'Supplier' order by createDate DESC"

          vm.pageObj = {
              service : 'profile',
              method : 'getAllByQuery',
              body : {"where" : whereClause},
              orderby: '',
              isAscending : ''
          }

          $scope.$broadcast("getPageObj", vm.pageObj)

           vm.testarr[vm.indexno].upstatus = false;
            vm.testarr[vm.indexno].downstatus = false;
            vm.testarr[vm.indexno].close = false;

          }



                //_______________Change status of the contact______________________________________________

    function changeStatus(statusChangeForm){
    
                if (statusChangeForm.status == "Active") statusChangeForm.status = "Inactive";
                else if (statusChangeForm.status == "Inactive") statusChangeForm.status = "Active";
            

            statusChangeForm.profileLog = {
                profileID: "",
                logID: "-888",
                type: "",
                description: "",
                UIHeight: "",
                status: "",
                userName: "",
                lastTranDate: "",
                createDate: "",
                modifyDate: "",
                createUser: "",
                modifyUser: ""
            }

            var statusObj = {
                "appName": "Contacts",
                "permissionType": "edit",
                "profile": statusChangeForm,
                "image": statusChangeForm.image
            }

            //changeStatus(statusChangeForm);
            var jsonString = JSON.stringify(statusObj);



            var client =  $serviceCall.setClient("updateProfile","process"); // method name and service
            client.ifSuccess(function(data){  
            })
            client.ifError(function(data){ 
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
                                    .content('Error occure while changing the status')
                                    .ariaLabel('Alert Dialog Demo')
                                    .ok('OK')
                                    .targetEvent()
                                    );
                }
                //changeStatus(obj);
            })
            client.postReq(jsonString);
        }
        //================================================================================================
    //___________________________DELETE CONTACT________________________________________________________
    function ContactDelete(deleteform, ev){

        var confirm = $mdDialog.confirm()
            .parent(angular.element(document.body))
            .title('Delete supplier?')
            .content('This process is not reversible')
            .ok('Delete')
            .cancel('Cancel')
            .targetEvent(ev);
        $mdDialog.show(confirm).then(function() {

            deleteform.profileLog = {
                profileID: "",
                logID: "-888",
                type: "",
                description: "",
                UIHeight: "",
                status: "",
                userName: "",
                lastTranDate: "",
                createDate: "",
                modifyDate: "",
                createUser: "",
                modifyUser: ""
            }
            
            if (deleteform.status == "Inactive") {

            var serviceObj = {
                "appName": "Contacts",
                "permissionType": "delete",
                "profile": deleteform,
                "image": deleteform.image
            }
            deleteform.deleteStatus = true;
            var jsonString = JSON.stringify(serviceObj);
            console.log(serviceObj);

            var client =  $serviceCall.setClient("deleteProfile","process"); // method name and service
            client.ifSuccess(function(data){
                    $mdToast.show(
                        $mdToast.simple()
                        .textContent('Supplier successfully deleted')
                        .position('top right')
                        .hideDelay(3000)
                    );
                    $state.go($state.current, {}, {
                        reload: true
                    });  
            })
            client.ifError(function(data){ 
         
                if(data.data.isSuccess == false){
                    $mdDialog.show(
                    $mdDialog.alert()
                    .parent(angular.element(document.body))
                    .title('Alert')
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
                    .content('Error deleting supplier')
                    .ariaLabel('Alert Dialog Demo')
                    .ok('OK')
                    .targetEvent()
                    );
            }
                  
            })
            client.postReq(jsonString);

            } else {
                $mdDialog.show(
                    $mdDialog.alert()
                    .parent(angular.element(document.body))
                    .title('Alert')
                    .content('Unable to delete supplier. Please inactivate instead.')
                    .ariaLabel('Alert Dialog Demo')
                    .ok('OK')
                );
            }
        })
    }

    function showAdvancedEditDialog(ev,uniqueID, favouriteStarNo, favouriteStar){
  
    $mdDialog.show({
      controller: 'DialogControllerEditSupplier',
      controllerAs: 'vm',
      templateUrl: 'app/main/contacts/dilaogs/editDialogBoxSupplier.html',
     // app/main/contacts/views/supplier/compose/supplierCompose.html
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose:true,
      locals:{
        profileID : uniqueID,
        favouriteStar : favouriteStar,
        favouriteStarNo : favouriteStarNo
      }
      
    })
    .then(function(answer) {
      $scope.status = 'You said the information was "' + answer + '".';
      loadAllSuppliers('createDate', false);
      
    }, function() {
      $scope.status = 'You cancelled the dialog.';
    });
  };


    function setPrimaryToolBar() {
      vm.primaryToolbarContext = !vm.primaryToolbarContext;
    };

    function toggleChildStates(toggledState) {
      $state.go(toggledState);
    };

    function openItem(item) {
      // Set the read status on the item
      // item.read = true;

      setPrimaryToolBar();

      // Assign item as the current item
      vm.currentItem = item;

      $state.go('app.contacts.supplier.detail', {
        // itemID : item.GINno,
        // status : item.inventoryClass
      });

    }

    /**
     * Close item
     */
    function closeThread() {
      vm.currentItem = null;

      setPrimaryToolBar();

      // Update the state without reloading the controller
      $state.go('app.contacts.supplier');
    }

    /**
     * Return selected status of the item
     *
     * @param item
     * @returns {boolean}
     */
    function isSelected(thread) {
      return vm.selectedThreads.indexOf(thread) > -1;
    }

    /**
     * Toggle selected status of the thread
     *
     * @param thread
     * @param event
     */
    function toggleSelectThread(thread, event) {
      if (event) {
        event.stopPropagation();
      }

      if (vm.selectedThreads.indexOf(thread) > -1) {
        vm.selectedThreads.splice(vm.selectedThreads.indexOf(thread), 1);
      } else {
        vm.selectedThreads.push(thread);
      }
    }

    /**
     * Select threads. If key/value pair given,
     * threads will be tested against them.
     *
     * @param [key]
     * @param [value]
     */
    function selectThreads(key, value) {
      // Make sure the current selection is cleared
      // before trying to select new threads
      vm.selectedThreads = [];

      for (var i = 0; i < vm.items.length; i++) {
        if (angular.isUndefined(key) && angular.isUndefined(value)) {
          vm.selectedThreads.push(vm.items[i]);
          continue;
        }

        if (angular.isDefined(key) && angular.isDefined(value) && vm.items[i][key] === value) {
          vm.selectedThreads.push(vm.items[i]);
        }
      }
    }

    /**
     * Deselect threads
     */
    function deselectThreads() {
      vm.selectedThreads = [];
    }

    /**
     * Toggle select threads
     */
    function toggleSelectThreads() {
      if (vm.selectedThreads.length > 0) {
        vm.deselectThreads();
      } else {
        vm.selectThreads();
      }
    }

    /**
     * Set the status on given thread, current thread or selected threads
     *
     * @param key
     * @param value
     * @param [thread]
     * @param [event]
     */
    function setThreadStatus(key, value, thread, event) {
      // Stop the propagation if event provided
      // This will stop unwanted actions on button clicks
      if (event) {
        event.stopPropagation();
      }

      // If the thread provided, do the changes on that
      // particular thread
      if (thread) {
        thread[key] = value;
        return;
      }

      // If the current thread is available, do the
      // changes on that one
      if (vm.currentItem) {
        vm.currentItem[key] = value;
        return;
      }

      // Otherwise do the status update on selected threads
      for (var x = 0; x < vm.selectedThreads.length; x++) {
        vm.selectedThreads[x][key] = value;
      }
    }


    /**
     * Toggle the value of the given key on given thread, current
     * thread or selected threads. Given key value must be boolean.
     *
     * @param key
     * @param thread
     * @param event
     */
    function toggleThreadStatus(key, thread, event) {

      favouriteFunction(thread);
      // Stop the propagation if event provided
      // This will stop unwanted actions on button clicks
      if (event) {
        event.stopPropagation();
      }

      // If the thread provided, do the changes on that
      // particular thread
      if (thread) {
        if (typeof(thread[key]) !== 'boolean') {
          return;
        }

        thread[key] = !thread[key];
        return;
      }

      // If the current thread is available, do the
      // changes on that one
      if (vm.currentItem) {
        if (typeof(vm.currentItem[key]) !== 'boolean') {
          return;
        }

        vm.currentItem[key] = !vm.currentItem[key];
        return;
      }

      // Otherwise do the status update on selected threads
      for (var x = 0; x < vm.selectedThreads.length; x++) {
        if (typeof(vm.selectedThreads[x][key]) !== 'boolean') {
          continue;
        }

        vm.selectedThreads[x][key] = !vm.selectedThreads[x][key];
      }
    }
  }
})();

  angular
  .module('app.contacts')
  .factory('supplierEditService', supplierEditService);
    supplierEditService.$inject = [];

    function supplierEditService(){

        var contactArray=[];

        return {
            setArray: function(newVal) {
                contactArray.push(newVal);
                return contactArray;
            },
            removeArray: function(newVals) {
                contactArray.splice(newVals, 1);
                return contactArray;
            },
            getArray: function(){
                return contactArray;
            }
        }
    }
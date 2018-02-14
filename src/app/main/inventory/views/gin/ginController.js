(function() {
    'use strict';

    angular
        .module('app.inventory')
        .controller('inventoryCtrlGIN', inventoryCtrlGIN);

    /** @ngInject */
    function inventoryCtrlGIN($scope, $getPdf, $rootScope, $document, $mdDialog, $mdMedia, $mdSidenav, $state, msApi, Issued, $serviceCall, $mdToast, AddressService) {

        console.log('INVENTORY 6.1.0.45');

        var vm = this;

        vm.contactColors = ['blue-bg', 'blue-grey-bg', 'orange-bg', 'pink-bg', 'purple-bg', 'green-bg', 'red-bg'];

        vm.inventoryGIN = Issued.result;

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

        vm.defaultCancel = defaultCancel;

        vm.starfunc = starfunc;

        vm.loadGINdetail = loadGINdetail;

        vm.SeparateAddress = SeparateAddress;

        vm.InventoryObject = InventoryObject;

        vm.deleteInventory = deleteInventory;

        vm.cancelStatus = cancelStatus;

        vm.emailCustomer = emailCustomer;

        vm.DownloadPDF = DownloadPDF;

        vm.printPdf = printPdf;

        vm.ObjCusAddress = [];

        vm.ObjCompanyAddress = [];

        vm.issueListSpinnerLoaded = issueListSpinnerLoaded;

        function issueListSpinnerLoaded(detailSpinner){
            detailSpinner.show('issue-list-spinner');
        }

        vm.pageObj = {
            service: 'inventory',
            method: 'getGINSummaryByQuery',
            body: {
                "where": "deleteStatus = 'false' order by createdDate DESC"
            },
            orderby: '',
            isAscending: ''
        }

        vm.pageGap = 15;
        vm.indexno = 1;

        //////////

        init();

        /**
         * Initialize
         */
        function init() {
            LoadSettings();
            if ($state.current.name === 'app.inventory.gin.detail') {
                loadGINdetail()
            }
        }

        vm.gin = {
            "GINno": "",
            "internalNote": "",
            "comment": "",
            "note": "",
            "email": "",
            "customFields":[],
            "contactNo": "",
            "fax": "",
            "mobileNo": "",
            "website": "",
            "inventoryClass": "",
            "GINType": "",
            "date": "",
            "createdDate": "",
            "inventoryFavourite": "",
            "customerNames": "",
            "profileID":"",
            "billAddress": {},
            "shipAddress": {},
            "itemDetails": [],
            "addressType": "",
            "deleteStatus": "",
            "favouriteStarNo": "",
            "tag": [],
            "cancelStatus": "",
            "createUser": "",
            "modifyUser": ""
        };

        // function openItem(item) {
        //   // Set the read status on the item
        //   // item.read = true;

        //   setPrimaryToolBar();

        //   // Assign item as the current item
        //   vm.currentItem = item;

        //   $state.go('app.inventory.gin.detail', {
        //     itemID : item.GINno,
        //     status : item.inventoryClass
        //   });

        // }

        function openItem(item) {
            // Set the read status on the item
            // item.read = true;

            setPrimaryToolBar();

            // Assign thread as the current thread
            console.log("=======");
            console.log(item);
            vm.currentItem = item;

            $state.go('app.inventory.gin.detail', {
                itemID: item.GINno,
                status: item.inventoryClass
            });




        }




function DownloadPDF(){ 
          /*var client = $getPdf.setPdfClient('generatePDF','process');
          if (client.checkStorage(vm.inv.invoiceNo + '.pdf')) {
          client.downloadStore();
          }else{
          
          client.setUrl(vm.inv.invoiceNo + '.pdf').uniqueID(vm.inv.invoiceNo).class('invoice').download();
          }*/

          var client = $getPdf.setPdfClient('generatePDF', 'process');
client.setUrl(vm.gin.GINno + '.pdf').uniqueID(vm.gin.GINno).class('gin').download();
        
        }

        function printPdf() {
        var client = $getPdf.setPdfClient('generatePDF', 'process');
        client.setUrl(vm.gin.GINno + '.pdf').uniqueID(vm.gin.GINno).class('gin').print();
        }

        function InventoryObject(callback) {
            var InventoryObject = {
                AddressOne: vm.AddressOne,
                AddressTwo: vm.AddressTwo,
                AddressThree: vm.AddressThree,
                AddressFour: vm.AddressFour
            }
            callback(InventoryObject);
        }

        function SeparateAddress(Address) {
            vm.AddressArr = [];
            vm.AddressArr = Address.split(",");
            vm.AddressOne = vm.AddressArr[0];
            vm.AddressTwo = vm.AddressArr[1];
            vm.AddressThree = vm.AddressArr[2];
            vm.AddressFour = vm.AddressArr[3];
        }


function emailCustomer(){
          
          $mdDialog.show({
              templateUrl: 'app/main/inventory/dialogs/email/email.html',
              controller: 'inventoryEmailCtrl',
              controllerAs: 'vm',
              locals:{
                  item : vm.gin,
                  profData : vm.profData,
                  template : 'T_EMAIL_INVENTORY_GIN_NEWMAIL',
                  type : 'inventoryGIN',
                  amount : ''
              }
          }).then(function(data){
              
          }, function(data){

          })
        }

        function LoadSettings() {
            var settings = $serviceCall.setClient("getAllByQuery", "setting");
            settings.ifSuccess(function(data) {
                var profileData = data;
                vm.profData = {};
                vm.profData = profileData[0].profile;
                var tempates = profileData[0].templates;
                vm.defaultNOte = data[0].preference.inventoryPref.defaultNote;
                if (data[0].profile.companyLogo) {
                    vm.companylogo = data[0].profile.companyLogo.imageUrl;
                }
                console.log(vm.companylogo)
                    // checkTemplate(tempates);

                vm.ObjCompanyAddress = AddressService.setAddress(vm.profData.companyName,vm.profData.street,vm.profData.city,vm.profData.state,vm.profData.zip,vm.profData.country,vm.profData.phoneNo,"",vm.profData.fax,vm.profData.companyEmail,vm.profData.website);

            });
            settings.ifError(function(data) {});
            settings.postReq({
                "setting": "profile,templates",
                "preference": "inventoryPref"
            })

        }

        function loadGINdetail() {

            console.log($state.params);
            console.log("------------------------");
            vm.historyType = "GIN";

            if ($state.params.itemID) {
                vm.currentThread = "aaaa";
                vm.currentItem = true;
                vm.primaryToolbarContext = false;
            }

            var client = $serviceCall.setClient("getGINByKey", "inventory");
            client.ifSuccess(function(data) {
                console.log("in success");
                // commentfunc.loadComments()
                var lineItems;

                vm.ViewInventory = [];
                vm.ViewInventory.push(data);
                console.log(data);
                // console.log(vm.ViewInventory[0].itemDetails);


                vm.NoteType = "ISSUED";
                vm.InventoryType = "GIN NO.";
                vm.InventoryTypeValue = data.GINno;


                vm.gin.GINno = data.GINno;
                vm.gin.internalNote = data.internalNote;
                vm.gin.comment = data.comment;
                vm.gin.note = data.note;
                vm.gin.note = vm.gin.note.replace(/(?:\r\n|\r|\n)/g, '<br/>');
                vm.gin.email = data.email;
                vm.gin.contactNo = data.contactNo;
                vm.gin.fax = data.fax;
                vm.gin.mobileNo = data.mobileNo;
                vm.gin.website = data.website;
                vm.gin.inventoryClass = data.inventoryClass;
                vm.gin.GINType = data.GINType;
                vm.gin.date = data.date;

                vm.gin.customFields=data.customFields;

                vm.gin.createdDate = data.createdDate;
                vm.gin.inventoryFavourite = data.inventoryFavourite;
                vm.gin.customerNames = data.customerNames;

                vm.gin.billAddress = data.billAddress;
                vm.gin.shipAddress = data.shipAddress;
                vm.gin.itemDetails = data.itemDetails;
                vm.gin.addressType = data.addressType;
                vm.gin.deleteStatus = data.deleteStatus;
                vm.gin.favouriteStarNo = data.favouriteStarNo;

                vm.gin.tag = data.tag;
                vm.gin.cancelStatus = data.cancelStatus;
                vm.gin.createUser = data.createUser;
                vm.gin.modifyUser = data.modifyUser;



                var customerNames = data.customerNames;

                // vm.lineItems=vm.ViewInventory[0].itemDetails;

                data.createdDate = new Date(data.createdDate)
                vm.date = data.createdDate;


                if (isNaN(data.billAddress))
                    vm.FullAddress = "";

                if (isNaN(data.shipAddress))
                    vm.FullAddress = "";


                if (data.addressType == "Address") {
                    vm.FullAddress = data.billAddress;
                } else if (data.addressType == "Shipping Address") {
                    vm.FullAddress = data.shipAddress;
                };

                if (vm.FullAddress) {
                    SeparateAddress(vm.FullAddress);
                };
                var cusNamesAutoArr = [];
                var cusNamesAutoArr = customerNames.split(" ");
                var cusNamesAutoArrOne = cusNamesAutoArr[0];
                var cusNamesAutoArrTwo = cusNamesAutoArr[1];
                var cusNamesAutoArrThree = cusNamesAutoArr[2];
                var cusNamesAutoArrFour = cusNamesAutoArr[3];
                var cusNamesAutoArrFive = cusNamesAutoArr[4];

                console.log(cusNamesAutoArrOne);
                if (cusNamesAutoArrOne == "AutoGIN") {
                    vm.customerNamesBindAuto = data.customerNames;
                    vm.customerNamesBind = "";
                } else {
                    vm.customerNamesBind = data.customerNames;
                }

                vm.ObjCusAddress = AddressService.setAddress(vm.gin.customerNames,vm.gin.billAddress.street,vm.gin.billAddress.city,vm.gin.billAddress.state,vm.gin.billAddress.zip,vm.gin.billAddress.country,vm.gin.contactNo,vm.gin.mobileNo,vm.gin.fax,vm.gin.email,vm.gin.website);
             
            })
            client.ifError(function(data) {
                console.log("error loading data");
            })
            client.uniqueID($state.params.itemID);
            client.getReq();
            // client.postReq();
        }

        vm.testarr = [{
            name: "Starred",
            id: "favouriteStarNo",
            Intype: "GIN",
            src: "img/ic_grade_48px.svg",
            upstatus: false,
            downstatus: false,
            divider: true,
            close: false
        }, {
            name: "Date",
            id: "createdDate",
            upstatus: false,
            downstatus: false,
            divider: false,
            close: false
        }, {
            name: "GINno",
            id: "GINno",
            upstatus: false,
            downstatus: false,
            divider: true,
            close: false
        }, {
            name: "Supplier",
            id: "customerNames",
            upstatus: false,
            downstatus: false,
            divider: false,
            close: false
        }, {
            name: "Cancelled",
            id: "cancelStatus",
            upstatus: false,
            downstatus: false,
            divider: false,
            close: false
        }];

        function starfunc(item, index) {

            if (item.id === "favouriteStarNo") {
                item.upstatus == false;
                item.downstatus = false;
                vm.testarr[vm.indexno].upstatus = false;
                vm.testarr[vm.indexno].downstatus = false;
                vm.testarr[vm.indexno].close = false;
                item.close = true;
                vm.indexno = index;
                vm.orderby = "favouriteStarNo";

                vm.isAscending = true;
                loadAllInventoryGIN(vm.orderby, vm.isAscending);

            } else if (item.id === "cancelStatus") {
                item.upstatus == false; // hide current up icon
                item.downstatus = false; // hide current down icon
                vm.testarr[vm.indexno].downstatus = false; // hide previous down icon
                vm.testarr[vm.indexno].upstatus = false; // hide previous up icon
                vm.testarr[vm.indexno].close = false; // hide previous close icon
                item.close = true;
                vm.indexno = index;
                vm.orderby = "cancelStatus";
                vm.isAscending = false;

                // loadAllInventoryGIN(vm.orderby, vm.isAscending);
                vm.pageObj = {
                    service: 'inventory',
                    method: 'getGINSummaryByQuery',
                    body: {
                        "where": "deleteStatus = false AND cancelStatus = true order by createdDate DESC"
                    },
                    orderby: '',
                    isAscending: ''
                }

                $scope.$broadcast("getPageObj", vm.pageObj);

            } else {
                if (item.upstatus == false && item.downstatus == false) {
                    item.upstatus = !item.upstatus;
                    item.close = true;

                    if ($scope.indexno != index) {
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

                    loadAllInventoryGIN(vm.orderby, vm.isAscending);

                }
                if (item.downstatus) {
                    vm.orderby = item.id;
                    vm.isAscending = false;

                    loadAllInventoryGIN(vm.orderby, vm.isAscending);

                }
            }
        }

        function loadAllInventoryGIN(orderby, isAscending) {
        
            var whereClause;
            if (orderby == "" || orderby == "createdDate") {
                if (isAscending)
                    whereClause = "deleteStatus = 'false' order by createdDate";
                else
                    whereClause = "deleteStatus = 'false' order by createdDate DESC";
            } else {
                if (isAscending)
                    whereClause = "deleteStatus = 'false' order by " + orderby + ", createdDate DESC";
                else
                    whereClause = "deleteStatus = 'false' order by " + orderby + " DESC, createdDate DESC";
            }
            vm.pageObj = {
                service: 'inventory',
                method: 'getGINSummaryByQuery',
                body: {
                    "where": whereClause
                },
                orderby: '',
                isAscending: ''
            }

            $scope.$broadcast("getPageObj", vm.pageObj);
        }

        function defaultCancel(item) {

            vm.testarr[vm.indexno].upstatus = false;
            vm.testarr[vm.indexno].downstatus = false;
            item.close = false;
            vm.orderby = "createdDate",
                vm.isAscending = false;
            loadAllInventoryGIN(vm.orderby, vm.isAscending);

        }

        function cancelStatus() {

            if (vm.cancelStatus != true) {
              
                var confirm = $mdDialog.confirm()
                    .title('Cancel GIN?')
                    .content('This process is not reversible')
                    .ariaLabel('Lucky day')
                    .ok('Yes')
                    .cancel('No');
                $mdDialog.show(confirm).then(function() {

                    var Inventory = {
                        "permissionType": "cancel",
                        "appName": "Inventory"
                    };
                    var jsonString = JSON.stringify(Inventory);

                    var client = $serviceCall.setClient("cancelGIN", "process");
                    client.ifSuccess(function(data) {
                        
                        vm.orderby = "";
                        vm.isAscending = false;
                        loadAllInventoryGIN(vm.orderby, vm.isAscending);

                        $mdToast.show(
                            $mdToast.simple()
                            .textContent('GIN '+$state.params.itemID+' successfully cancelled')
                            .position('top right')
                            .hideDelay(3000)
                        );
                        closeThread();
                    });
                    client.ifError(function(data) {
                        console.log("error cancelling data")

                        if(data.hasOwnProperty('data') && data.data.hasOwnProperty('customMessage') && data.data.customMessage!=null && data.data.customMessage!=""){
                        $mdDialog.show(
                        $mdDialog.alert()
                        .title('Alert')
                        .parent(angular.element(document.body))
                        .content(data.data.customMessage)
                        .ariaLabel('Alert Dialog Demo')
                        .ok('OK')
                        .targetEvent()
                    );
    
                    }
                    else{
                    $mdDialog.show(
                        $mdDialog.alert()
                        .parent(angular.element(document.body))
                        .title('Alert')
                        .content('There was an error cancelling the data.')
                        .ariaLabel('Alert Dialog Demo')
                        .ok('OK')
                        .targetEvent()
                    );
                }
                    })
                    client.uniqueID($state.params.itemID); // send projectID as url parameters
                    //client.GRNPattern("GRN0001");
                    client.postReq(jsonString);
                })
            } else {
                $mdDialog.show(
                    $mdDialog.alert()
                    .parent(angular.element(document.body))
                    .title('Alert')
                    .content('This Goods Issue is already Cancelled')
                    .ariaLabel('Alert Dialog Demo')
                    .ok('OK')
                )

            }
        }

        function deleteInventory() {
            var confirm = $mdDialog.confirm()
                .title('Do you wish to delete this Goods Issue ' + $state.params.itemID + '? ')
                    .content('This process is not reversible')
                    .ariaLabel('Lucky day')
                    .ok('Yes')
                    .cancel('No');
            $mdDialog.show(confirm).then(function() {

                    var Inventory = {
                        "permissionType": "delete",
                        "appName": "Inventory"
                    };
                    var jsonString = JSON.stringify(Inventory);

                    var client = $serviceCall.setClient("deleteGIN", "process");
                    client.ifSuccess(function(data) {
                        vm.orderby = "";
                        vm.isAscending = false;
                        loadAllInventoryGIN(vm.orderby, vm.isAscending);

                        $mdToast.show(
                            $mdToast.simple()
                            .textContent('GIN '+$state.params.itemID+' successfully deleted')
                            .position('top right')
                            .hideDelay(3000)
                        );
                        closeThread();


                    });
                    client.ifError(function(data) {
                        console.log("error deleting data")

                        if(data.hasOwnProperty('data') && data.data.hasOwnProperty('customMessage') && data.data.customMessage!=null && data.data.customMessage!=""){
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
                    else{
                    $mdDialog.show(
                        $mdDialog.alert()
                        .parent(angular.element(document.body))
                        .title('Alert')
                        .content('There was an error deleting the data.')
                        .ariaLabel('Alert Dialog Demo')
                        .ok('OK')
                        .targetEvent()
                    );
                }
                    })
                    client.uniqueID($state.params.itemID); // send projectID as url parameters
                    //client.GRNPattern("GRN0001");
                    client.postReq(jsonString);
                })
        }

        function setPrimaryToolBar() {
            vm.primaryToolbarContext = !vm.primaryToolbarContext;
        };

        function toggleChildStates(toggledState) {
            $state.go(toggledState);
        };



        /**
         * Close item
         */
        function closeThread() {
            vm.currentItem = null;

            setPrimaryToolBar();

            // Update the state without reloading the controller
            $state.go('app.inventory.gin');
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

        function favouriteFunction(favFuncForm) {

            favFuncForm.GINno = favFuncForm.GINno.toString();


            if (favFuncForm.favouriteStarNo == 1) {
                favFuncForm.favouriteStarNo = 0;
            } else if (favFuncForm.favouriteStarNo == 0) {
                favFuncForm.favouriteStarNo = 1;
            };

            favFuncForm.inventoryFavourite = !favFuncForm.inventoryFavourite;
            favFuncForm.inventoryClass = {
                inventoryClass: "GIN"
            };
            // favFuncForm.inventoryLog = {
            //   inventoryID: "",
            //   logID: "-888",
            //   type: "",
            //   description: "",
            //   UIHeight: "",
            //   status: "",
            //   userName: "",
            //   lastTranDate: "",
            //   createDate: "",
            //   modifyDate: "",
            //   createUser: "",
            //   modifyUser: ""
            // }

            var favFuncObj = {
                "appName": "Inventory",
                "permissionType": "edit",
                "inventory": favFuncForm,
                "image": favFuncForm.image
            }
            favFuncObj.inventory.inventoryClass = "GIN";
            var jsonString = JSON.stringify(favFuncObj);

            var client = $serviceCall.setClient("updateInventory", "process"); // method name and service
            client.ifSuccess(function(data) {
                // if (favFuncForm.inventoryFavourite) {
                //     favFuncForm.favouriteStarNo = 0;
                //     var toast = $mdToast.simple().content('Add To Favourite').action('OK').highlightAction(false).position("bottom right");
                //     $mdToast.show(toast).then(function() {});
                //     //obj.favouriteStarNo = 0;
                // } else if (!(favFuncForm.inventoryFavourite)) {
                //     favFuncForm.favouriteStarNo = 1;
                //     var toast = $mdToast.simple().content('Remove from Favourite').action('OK').highlightAction(false).position("bottom right");
                //     $mdToast.show(toast).then(function() {});
                //     //obj.favouriteStarNo = 1;
                // };
            })
            client.ifError(function(data) {
                var toast = $mdToast.simple().content('Error Occure while Adding to Favourite').action('OK').highlightAction(false).position("top right");
                $mdToast.show(toast).then(function() {

                });
            })

            client.postReq(jsonString);

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

(function() {
    'use strict';

    angular
        .module('app.estimates')
        .controller('estController', estController);

    /** @ngInject */
    function estController($scope, $rootScope, $document, estimateCopy, $stateParams, $serviceCall, $mdToast, $mdDialog, $mdMedia, $mdSidenav, $state, msApi, Summary, $apis, $getPdf, $setUrl,AddressService, msSpinnerService) {
        var vm = this;

        vm.contactColors = ['blue-bg', 'blue-grey-bg', 'orange-bg', 'pink-bg', 'purple-bg', 'green-bg', 'red-bg'];

        vm.asc = false;

        vm.dsc = false;

        vm.primaryToolbarContext = true;

        vm.showStatusDetailsView = true;

        vm.toggleChildStates = toggleChildStates;

        vm.loadingItems = true;

        vm.currentThread = null;

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

        vm.favouriteEstimates = favouriteEstimates;

        vm.sortEstimatNo = sortEstimatNo;

        vm.viewedEstimates=viewedEstimates;

        vm.defaultCancel = defaultCancel;

        vm.deleteRecord = deleteRecord;

        vm.loadDetailView = loadDetailView;

        vm.cancelStatus = cancelStatus;

        vm.starfunc = starfunc;

        vm.converToInvoice = converToInvoice;

        vm.emailCustomer = emailCustomer;

        vm.printPDF = printPDF;

        vm.sortarr = [];

        vm.downloadPDF = downloadPDF;

        vm.spinnerService = msSpinnerService;

        vm.estListSpinnerLoaded = estListSpinnerLoaded;

        function estListSpinnerLoaded(msListSpinner, estimateSummary){
            msListSpinner.show('est-list-spinner');
        }

        function detailsSpinnerStop(){
                vm.spinnerService.hide('est-list-spinner');
        }

        function loadbage(){
        var page = 1;
        // controller 
        vm.pageObj = {
        service: 'estimate',
        method: 'getEstimateSummaryByQuery',
        body: {
            "where": "deleteStatus = 'false' order by estimateNo DESC, createDate DESC"
        },
        orderby: 'createDate',
        isAscending: false
        }
        vm.pageGap = 10;

        $scope.$broadcast("getPageObj", vm.pageObj);
        
        }
        
        loadbage();

       

    
        
     

        //////////
        init()
        /**
         * Initialize
         */
        function init() {
 

            if ($state.current.name == "app.estimates.est.detail") {
                loadDetailView({ "where": "deleteStatus = false order by createDate DESC"});
       
            }
 

          
        }

        //refreshActivity for activity and comment side bar
        function refreshActivity() {
            $rootScope.$broadcast('rfrshAcH', {
                data: 'doupdate'
            });
        }

        //vm.approve = approve;
        vm.host = $apis.getHost();
        vm.AcceptStatus = AcceptStatus;
        vm.RejectedEstimate = RejectedEstimate;
        vm.editEstimate = editEstimate;
        vm.copyEstimate = copyEstimate;
        vm.checkCancel = false;
        vm.checkAccept = false;
        vm.checkRejected = false;
        vm.showAdditionalDetails = false;
        vm.displayShipToAddressEstimate = false;
        vm.emailCustomerOption = "";

        function setPrimaryToolBar() {
            vm.primaryToolbarContext = !vm.primaryToolbarContext;
        };

        function toggleChildStates(toggledState) {
            $state.go(toggledState);
        };

        function openItem(item) {
            console.log(item);
            // Set the read status on the item
            // item.read = true;
            setPrimaryToolBar();
            // Assign thread as the current thread
            vm.currentThread = item;
            if (item.status != "Draft") {
                $state.go('app.estimates.est.detail', {
                    itemId: item.estimateNo
                });
            } else {
                console.log(item);
                estimateCopy.setArr(item);
                // $state.go('app.estimates.edit');
                $state.go('app.estimates.edit', {
                    itemId: item.estimateNo
                });

            }
        }

        /**
         * Close thread
         */
        function closeThread() {
            
            vm.est = {};
            vm.currentThread = null;
            setPrimaryToolBar();
            // location.reload();
            // Update the state without reloading the controller
            $state.go('app.estimates.est');
            GetDataFromService({
                "where": "deleteStatus = 'false' order by estimateNo DESC, createDate DESC"
            });

        }

        vm.all=all;
        function all () {
            GetDataFromService({
                "where": "deleteStatus = false order by createDate DESC"
            });
        }


        /**
         * Return selected status of the thread
         *
         * @param thread
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

            for (var i = 0; i < vm.estimateSummary.length; i++) {
                if (angular.isUndefined(key) && angular.isUndefined(value)) {
                    vm.selectedThreads.push(vm.estimateSummary[i]);
                    continue;
                }

                if (angular.isDefined(key) && angular.isDefined(value) && vm.estimateSummary[i][key] === value) {
                    vm.selectedThreads.push(vm.estimateSummary[i]);
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
            if (vm.currentThread) {
                vm.currentThread[key] = value;
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
            console.log(thread.estimateNo);
            var client1 = $serviceCall.setClient("getEstimateByKey", "estimate");
            client1.ifSuccess(function(data) {
                var data = data;
                vm.getEstimateDataByKey = data;

                if (thread) {
                if (typeof(thread[key]) !== 'boolean') {
                    return;
                }
               
                if (thread.favouriteStarNo == 1)
                    thread.favouriteStarNo = 0;


                else if (thread.favouriteStarNo == 0)
                    thread.favouriteStarNo = 1;

                vm.getEstimateDataByKey.favouriteStarNo=thread.favouriteStarNo;

                thread.favouriteStar = !thread.favouriteStar;
                vm.getEstimateDataByKey.favouriteStar = !vm.getEstimateDataByKey.favouriteStar;

                //var udtateData = {invoice : thread, "image" :[], "permissionType" : "", "appName":"Invoices"};
                var Estimate = {
                    "estimate": vm.getEstimateDataByKey,
                    "image": vm.getEstimateDataByKey.uploadImages,
                    "permissionType": "edit",
                    "appName": "Estimates"
                };
                var jsonString = JSON.stringify(Estimate);
                
                console.log(jsonString);

                var client1 = $serviceCall.setClient("updateEstimate", "process");
                client1.ifSuccess(function(data) {

                });
                client1.ifError(function(data) {
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
                    .content('Error occure while adding to favourite')
                    .ariaLabel('Alert Dialog Demo')
                    .ok('OK')
                    .targetEvent()
                    );
                }
                })
                client1.postReq(jsonString);

                return;
            }

                //fillview(data);
               
            });
            client1.ifError(function(data) {
                console.log("error loading estimate data")
            })

            client1.uniqueID(thread.estimateNo); // send projectID as url parameters
            client1.getReq();

            // Stop the propagation if event provided
            // This will stop unwanted actions on button clicks
            if (event) {
                event.stopPropagation();
            }

            // If the thread provided, do the changes on that
            // particular thread


            // If the current thread is available, do the
            // changes on that one
            if (vm.currentThread) {
                if (typeof(vm.currentThread[key]) !== 'boolean') {
                    return;
                }

                vm.currentThread[key] = !vm.currentThread[key];
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


        function GetDataFromService(val) {
            vm.pageObj = {
                service: 'estimate',
                method: 'getEstimateSummaryByQuery',
                body: val,
                orderby: '',
                isAscending: ''
            }

            $scope.$broadcast("getPageObj", vm.pageObj);
        }

        function favouriteEstimates() {
            // if(page == 1){
            //     page = 0;

            GetDataFromService({
                "where": "deleteStatus = false AND favouriteStar = true order by createDate DESC"
            });
            // }else{
            //      page = 1;
            //    vm.estimateSummary =  vm.estimateSummary;
            // };
        }

        function viewedEstimates(){
             GetDataFromService({
                "where": "deleteStatus = false AND viewed = true order by createDate DESC"
            });
        }


        function sortEstimatNo() {
            var whereClause = "deleteStatus = false AND viewed = " + true + " order by createDate DESC";


            vm.pageObj = {
                service: 'estimate',
                method: 'getEstimateSummaryByQuery',
                body: {
                    "where": whereClause
                },
                orderby: '',
                isAscending: ''
            }

            $scope.$broadcast("getPageObj", vm.pageObj);

        }

        vm.removeFilters = removeFilters;

        function removeFilters() {
            page = 1;
            vm.asc = true;
            vm.dsc = false; 
        }

        vm.sortarr = [{
            name: "Starred",
            id: "favouriteStarNo",
            src: "img/ic_grade_48px.svg",
            upstatus: false,
            downstatus: false,
            divider: true,
            close: false
        }, {
            name: "Draft",
            id: "Draft",
            upstatus: false,
            downstatus: false,
            divider: true,
            close: false
        }, {
            name: "Date",
            id: "date",
            upstatus: false,
            downstatus: false,
            divider: true,
            close: false
        }, {
            name: "Estimate No",
            id: "estimateNo",
            upstatus: false,
            downstatus: false,
            divider: true,
            close: true
        }, {
            name: "Customer",
            id: "profileName",
            upstatus: false,
            downstatus: false,
            divider: true,
            close: false
        }, {
            name: "Amount",
            id: "netAmount",
            upstatus: false,
            downstatus: false,
            divider: true,
            close: false
        }, {
            name: "Validity",
            id: "validity",
            upstatus: false,
            downstatus: false,
            divider: true,
            close: false
        }, {
            name: "Valid",
            id: "status",
            upstatus: false,
            downstatus: false,
            divider: true,
            close: false
        }, {
            name: "Expired",
            id: "status",
            upstatus: false,
            downstatus: false,
            divider: true,
            close: false
        }, {
            name: "Rejected",
            id: "status",
            upstatus: false,
            downstatus: false,
            divider: true,
            close: false
        }, {
            name: "Accepted",
            id: "status",
            upstatus: false,
            downstatus: false,
            divider: true,
            close: false
        }, {
            name: "Cancelled",
            id: "status",
            upstatus: false,
            downstatus: false,
            divider: true,
            close: false
        }]


        vm.latest = 'createDate'; // by default it should be order by date in descending order 
        vm.indexno = 1;
        vm.prodSearch = 'createDate'; // by default it should be filter by date in descending order

        function starfunc(item, index) { // pass sort object and index number 
            if (item.id === "favouriteStarNo") {
                vm.prodSearch = null;
                item.upstatus == false;
                item.downstatus = false;
                vm.sortarr[vm.indexno].upstatus = false;
                vm.sortarr[vm.indexno].downstatus = false;
                vm.sortarr[vm.indexno].close = false;
                item.close = true;
                vm.indexno = index;
                //SortStarFunc();
                vm.orderby = "!favouriteStarNo";
                vm.isAscending = false;
                CheckFullArrayStatus(vm.orderby, vm.isAscending);

            } else if (item.id == "status") {
                console.log(item.name);
                vm.prodSearch = null;
                item.upstatus == false; // hide current up icon
                item.downstatus = false; // hide current down icon
                vm.sortarr[vm.indexno].downstatus = false; // hide previous down icon
                vm.sortarr[vm.indexno].upstatus = false; // hide previous up icon
                vm.sortarr[vm.indexno].close = false; // hide previous close icon
                item.close = true;
                vm.indexno = index;

                vm.pageObj = {
                    service: 'estimate',
                    method: 'getEstimateSummaryByQuery',
                    body: {
                        "where": "deleteStatus = false AND status = '"+item.name+"' order by createDate DESC"
                    },
                    orderby: '',
                    isAscending: ''
                }
                $scope.$broadcast("getPageObj", vm.pageObj);

            } else if (item.id == "Draft") {
                vm.prodSearch = null;
                item.upstatus == false; // hide current up icon
                item.downstatus = false; // hide current down icon
                vm.sortarr[vm.indexno].downstatus = false; // hide previous down icon
                vm.sortarr[vm.indexno].upstatus = false; // hide previous up icon
                vm.sortarr[vm.indexno].close = false; // hide previous close icon
                item.close = true;
                vm.indexno = index;
                LoadDrafts();
            } else {
                if (item.upstatus == false && item.downstatus == false) {
                    item.upstatus = !item.upstatus;
                    item.close = true;

                    if (vm.indexno != index) {
                        vm.sortarr[vm.indexno].upstatus = false; // hide previous up icon
                        vm.sortarr[vm.indexno].downstatus = false; // hide previous down icon
                        vm.sortarr[vm.indexno].close = false; // hide previous close icon
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
                    CheckFullArrayStatus(vm.orderby, vm.isAscending);
                }
                if (item.downstatus) {
                    vm.orderby = item.id;
                    vm.isAscending = false;
                    CheckFullArrayStatus(vm.orderby, vm.isAscending);

                }

            }
        }

        function CheckFullArrayStatus(orderby, IsAscending) {
            console.log(orderby);

            var whereClause;
            if (IsAscending)
                whereClause = "deleteStatus = 'false' order by " + orderby + ", createDate DESC";
            else
                whereClause = "deleteStatus = 'false' order by " + orderby + " DESC, createDate DESC";


            vm.pageObj = {
                service: 'estimate',
                method: 'getEstimateSummaryByQuery',
                body: {
                    "where": whereClause
                },
                orderby: '',
                isAscending: ''
            }

            $scope.$broadcast("getPageObj", vm.pageObj);
        }


        function getStatus(name, Isascending) {
            var whereClause;
            if (Isascending)
                whereClause = "deleteStatus = false AND status = '" + name + "' order by createDate DESC";
            else
                whereClause = "deleteStatus = false AND status = '" + name + "' order by createDate DESC";


            vm.pageObj = {
                service: 'estimate',
                method: 'getEstimateSummaryByQuery',
                body: {
                    "where": whereClause
                },
                orderby: '',
                isAscending: ''
            }

            $scope.$broadcast("getPageObj", vm.pageObj);
        }

        function LoadDrafts() {

            var whereClause;
            // if (Isascending) 
            // whereClause = "deleteStatus = 'false' order by estimateNo DESC, createDate DESC";
            // else
            //   whereClause = "deleteStatus = false  order by createDate DESC";          
            vm.pageObj = {
                service: 'estimate',
                method: 'getDraftByQuery',
                body: {"where": "deleteStatus = 'false' order by estimateNo DESC, createDate DESC"},
                orderby: 'createDate',
                isAscending: false
            }

            $scope.$broadcast("getPageObj", vm.pageObj);
        }

        function defaultCancel(item) {
            vm.sortarr[vm.indexno].upstatus = false;
            vm.sortarr[vm.indexno].downstatus = false;
            item.close = false;
            vm.orderby = "createDate",
                vm.isAscending = false;
            CheckFullArrayStatus(vm.orderby, vm.isAscending);
        }

        //Load data for the detail view
        function loadDetailView() {

            vm.primaryToolbarContext = false;
            vm.currentThread = "ssss";

            var client = $serviceCall.setClient("getEstimateByKey", "estimate");
            client.ifSuccess(function(data) {
                LoadSettings(data);
                var data = data;
                vm.getEstimateDataByKey = data;                
            });
            client.ifError(function(data) {
                vm.spinnerService.hide('est-details-spinner');
                console.log("error loading estimate data")
            })

            client.uniqueID($state.params.itemId); // send projectID as url parameters
            client.getReq();
        }

        function LoadSettings(detailsView) {
            var settings = $serviceCall.setClient("getAllByQuery", "setting");
            settings.ifSuccess(function(data) {
                var profileData = data;
                vm.profData = {};
                vm.profData = profileData[0].profile;
                vm.ObjCompanyAddress = AddressService.setAddress(vm.profData.companyName,vm.profData.street,vm.profData.city,vm.profData.state,vm.profData.zip,vm.profData.country,vm.profData.phoneNo,"",vm.profData.fax,vm.profData.companyEmail,vm.profData.website);
                vm.estimatePref = data[0].preference.estimatePref;
                vm.displayShipToAddressEstimate = vm.estimatePref.displayShipToAddressEstimate;
                vm.emailCustomerOption = vm.estimatePref.emailCustomerOption;
                vm.offinePayment=data[0].preference.invoicePref.offlinePayments;

                console.log(vm.estimatePref);
                var tempates = profileData[0].templates;
                vm.defaultNOte = data[0].preference.estimatePref.defaultNote;
                if (data[0].profile.companyLogo.uniqueCode != '') {
                    vm.companylogo = $setUrl.imagePath + 'setting/' + data[0].profile.companyLogo.uniqueCode;
                } else {
                    vm.companylogo = data[0].profile.companyLogo.imageUrl;
                }
                checkTemplate(tempates);
                callback(detailsView);

            });
            settings.ifError(function(data) {
                vm.spinnerService.hide('est-details-spinner');
            });
            settings.postReq({
                "setting": "profile,templates",
                "preference": "invoicePref,estimatePref"
            })

        }

        function callback(data) {
            vm.spinnerService.hide('est-details-spinner');
            vm.showStatusDetailsView = false;
            fillview(data)
        }

        function checkTemplate(arr) {
            vm.templateID = "4";
            if (Array.isArray(arr) && arr.length > 0) {
                for (var i = 0; i <= arr.length - 1; i++) {
                    if (arr[i].activated === true && arr[i].type === "Estimate") {
                        vm.templateID = arr[i].templateID;
                    }
                }
            }
        }

        function editEstimate(est) {
            // console.log(est);
            // estimateCopy.setArr(est);
            $state.go('app.estimates.edit', {
                'itemId': $state.params.itemId
            });
        }

        function copyEstimate(est) {
            // estimateCopy.setArr(est);
            $state.go('app.estimates.copy', {
                'itemId': $state.params.itemId
            });
        }

        vm.estDetailSpinnerLoaded = estDetailSpinnerLoaded;

        function estDetailSpinnerLoaded(detailSpinner){

            detailSpinner.show('est-details-spinner');
        }

        function fillview(val) {

            if (val.status != "Draft") {
                val.createDate = new Date(val.createDate);
                vm.est = {};
                vm.est = val;
                //binding setting profile data
                vm.ObjCusAddress = AddressService.setAddress(vm.est.profileName,vm.est.billingAddress.street,vm.est.billingAddress.city,vm.est.billingAddress.state,vm.est.billingAddress.zip,vm.est.billingAddress.country,vm.est.contactNo,vm.est.mobileNo,vm.est.fax,vm.est.email,vm.est.website);
                
                vm.est.notes = vm.est.notes.replace(/(?:\r\n|\r|\n)/g, '</br>');
                vm.offinePayment = vm.offinePayment.replace(/(?:\r\n|\r|\n)/g, '</br>');

                vm.showAdditionalDetails = false;
                if (vm.est.customFields != 0) {
                    vm.showAdditionalDetails = true;
                }
                vm.showShippingInDetailsView = false;

                console.log(vm.displayShipToAddressEstimate);
 
                    if(vm.est.shippingAddress.s_street == "" && vm.est.shippingAddress.s_city == ""
                      && vm.est.shippingAddress.s_state == "" && vm.est.shippingAddress.s_zip == "" && vm.est.shippingAddress.s_country == "")
                    { 
                      vm.showShippingInDetailsView = false;
                    }
                    else if (vm.displayShipToAddressEstimate == true) {
                        vm.showShippingInDetailsView = true;
                     
                    }
                      
                //End check if

                vm.estSatus = val.status;

                vm.checkCancel = false;
                vm.checkAccept = false;
                vm.checkRejected = false;
                if (val.status == "Rejected") {
                    vm.checkRejected = true;
                    vm.checkCancel = false;
                    vm.checkAccept = false;
                };

                if (val.status == "Cancelled") {
                    vm.checkCancel = true;
                    vm.checkAccept = false;
                    vm.checkRejected = false;
                };

                if (val.status == "Accepted") {
                    vm.checkAccept = true;
                    vm.checkCancel = false;
                    vm.checkRejected = false;
                };
      

            }

        }

        function updateEstimate(obj) {
            console.log(obj);
            var Estimate = {
                "estimate": obj,
                "image": obj.uploadImages,
                "permissionType": "edit",
                "appName": "Estimates"
            };
            var jsonString = JSON.stringify(Estimate);

            var client = $serviceCall.setClient("updateEstimate", "process");
            client.ifSuccess(function(data) {
                console.log(data);
                $mdToast.show(
                    $mdToast.simple()
                    .textContent('Estimate ' + obj.estimateNo + ' status ' + obj.status.toLowerCase())
                    .position('top right')
                    .hideDelay(3000)
                );

                //init().loadSummary();
            });
            client.ifError(function(data) {
                // $mdToast.show(
                //     $mdToast.simple()
                //     .textContent('Error Updating Estimate')
                //     .position('top right')
                //     .hideDelay(3000)
                // );
                if(obj.status == "Cancelled"){

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
                    .content('Error updating estimate')
                    .ariaLabel('Alert Dialog Demo')
                    .ok('OK')
                    .targetEvent()
                    );
                }

                }
                else{
                    $mdToast.show(
                        $mdToast.simple()
                        .textContent('Error updating estimate')
                        .position('top right')
                        .hideDelay(3000)
                    );
                }

            })
            client.postReq(jsonString);
        }

        function AcceptStatus(obj) {
            console.log(obj);
            var confirm = $mdDialog.confirm()
                .title('Change estimate status to accepted?')
                .content('This process is not reversible')
                .ariaLabel('Lucky day')
                .targetEvent()
                .ok('Yes')
                .cancel('No');

            $mdDialog.show(confirm).then(function() {
                obj.status = "Accepted";
                vm.checkAccept = true;
                vm.checkRejected = false;
                vm.checkCancel= false;
                updateEstimate(obj);
            })

        };

        function RejectedEstimate(obj) {
            console.log(obj);
            var confirm = $mdDialog.confirm()
                .title('Change estimate status to Rejected?')
                .content('This process is not reversible')
                .ariaLabel('Lucky day')
                .targetEvent()
                .ok('Yes')
                .cancel('No');

            $mdDialog.show(confirm).then(function() {
                obj.status = "Rejected";
                vm.checkRejected = true;
                vm.checkAccept = false;
                vm.checkCancel= false;
                updateEstimate(obj);
            })
        }

        function cancelStatus(obj) {
            var confirm = $mdDialog.confirm()
                .title('Cancel estimate?')
                .textContent(' This process is not reversible')
                .ariaLabel('Lucky day')
                .targetEvent()
                .ok('Yes')
                .cancel('No');
            $mdDialog.show(confirm).then(function() {
     
                obj.status = "Cancelled";

                var Estimate = {
                "estimate": obj,
                "image": obj.uploadImages,
                "permissionType": "cancel",
                "appName": "Estimates"
                };
                var jsonString = JSON.stringify(Estimate);

                var client = $serviceCall.setClient("cancelEstimate", "process");
                client.ifSuccess(function(data) {
                    vm.checkCancel= true;
                    vm.checkAccept = false;
                    vm.checkRejected = false;

                    refreshActivity();
                    $mdToast.show(
                        $mdToast.simple()
                        .textContent('Estimate ' + obj.estimateNo + ' successfully cancelled')
                        .position('top right')
                        .hideDelay(3000)
                    );

                });
                client.ifError(function(data) {
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
                    .content('Error updating estimate')
                    .ariaLabel('Alert Dialog Demo')
                    .ok('OK')
                    .targetEvent()
                    );
                }

                })
                client.uniqueID(obj.estimateNo);
                client.postReq(jsonString);
            })
        }

        function deleteRecord(obj) {
            var confirm = $mdDialog.confirm()
                .parent(angular.element(document.body))
                .title('Delete estimate?')
                .textContent(' This process is not reversible')
                .ok('Delete')
                .cancel('Cancel')
                .targetEvent();

            $mdDialog.show(confirm).then(function() {
                obj.deleteStatus = true

                var Estimate = {
                    "estimate": obj,
                    "image": obj.uploadImages,
                    "permissionType": "delete",
                    "appName": "Estimates"
                };
                var jsonString = JSON.stringify(Estimate);

                var client = $serviceCall.setClient("updateEstimate", "process");
                client.ifSuccess(function(data) {
                    $mdToast.show(
                        $mdToast.simple()
                        .textContent('Estimate ' + obj.estimateNo + ' successfully deleted')
                        .position('top right')
                        .hideDelay(3000)
                    );
                    closeThread();

                });
                client.ifError(function(data) {

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
                    .content('Error Deleting Estimate')
                    .ariaLabel('Alert Dialog Demo')
                    .ok('OK')
                    .targetEvent()
                    );
                }
                })
                client.postReq(jsonString);


            })
        }


        function emailCustomer() {

            $mdDialog.show({
                templateUrl: 'app/main/estimates/dialogs/email/email.html',
                controller: 'estEmailCtrl',
                controllerAs: 'vm',
                locals: {
                    item: vm.est,
                    profData: vm.profData,
                    estimatePref: vm.estimatePref,
                    template: 'T_EMAIL_EST_NEWMAIL'
                }
            }).then(function(data) {
 

            }, function(data) {

            });
        }

        function printPDF() {
            console.log(vm.est.estimateNo);
            var client = $getPdf.setPdfClient('generatePDF', 'process');
            client.setUrl(vm.est.estimateNo + '.pdf').uniqueID(vm.est.estimateNo).class('estimate').print();
        }

        function downloadPDF() {
            var client = $getPdf.setPdfClient('generatePDF', 'process');
            client.setUrl(vm.est.estimateNo + '.pdf').uniqueID(vm.est.estimateNo).class('estimate').download();
        }

        function converToInvoice(val) {
            console.log(val);
            var passingDataInvoice = {
                Data: {
                    estimateNo: val.estimateNo,
                    profileID: val.profileID
                },
                appName: "estimate"
            }

            $state.go('app.invoices.compose', passingDataInvoice);
        }


    }
})();

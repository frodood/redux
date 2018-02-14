(function ()
{
    'use strict';
 


    angular
        .module('app.payments')
        .controller('payController', payController);

    /** @ngInject */
    function payController($scope, $rootScope, $document, $mdDialog, $mdMedia, $mdSidenav,$getPdf, $state,$mdToast, msApi,$serviceCall, paymentSummary,settingSummary,$stateParams,AddressService,$apis,$cookies){
        var vm = this;

        vm.contactColors = ['blue-bg', 'blue-grey-bg', 'orange-bg', 'pink-bg', 'purple-bg', 'green-bg', 'red-bg'];

        // vm.folders = Primary.data;
        // vm.labels = Secondary.data;

        /*
            @desc paging data    
        */  

        vm.payListSpinnerLoaded = payListSpinnerLoaded;
        
        function payListSpinnerLoaded(detailsSpinner){
            detailsSpinner.show('pay-list-spinner');
        }

        vm.pageObj = {
            service : 'payment',
            method : 'getPaymentSummaryByQuery',
            body : {
                "where": "paymentStatus <> 'delete' order by 'paymentID', lastTranDate DESC"
            },
            orderby: '',
            isAscending : true
        }
        vm.pageGap = 10;

        vm.ObjCusAddress = [];
        vm.ObjCompanyAddress = [];

        vm.hostUrl = $apis.getHost();

        // start added by dushmantha
        if(paymentSummary.result == null)
        {
          paymentSummary.result = [];
        }
        //end added by dushmantha
        vm.paymentSummary = paymentSummary.result;

        vm.settingSummary = settingSummary;

        if (Array.isArray(vm.settingSummary)) {
          vm.setPrf = vm.settingSummary[0].profile;
          //Start fill company data
          vm.ObjCompanyAddress = AddressService.setAddress( vm.setPrf.companyName, vm.setPrf.street, vm.setPrf.city, vm.setPrf.state, vm.setPrf.zip, vm.setPrf.country, vm.setPrf.contactNo,vm.setPrf.phoneNo, vm.setPrf.fax, vm.setPrf.companyEmail, vm.setPrf.website);
          //End fill company data

          vm.companyLogo =  vm.setPrf.companyLogo.imageUrl; 
        } 

        vm.primaryToolbarContext = true;

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

        vm.orderby = "lastTranDate";

        vm.Isascending = false;

        vm.indexno = 1; 

        vm.starfunc = starfunc;

        vm.defaultCancel =  defaultCancel;

        vm.singleStarSort = singleStarSort;

        vm.singleCancelSort = singleCancelSort;

        vm.emailCustomer = emailCustomer;
        
        vm.DownloadPDF = downloadPdf;

        vm.printPdf = printPdf;

        vm.showCancelBtn = false;

        vm.formatDate = formatDate

        //Start Show Webx message
    
          var urlarray = $apis.getHost().split(".");
          urlarray.splice(0, 1);
      
          var Domainwithdot = "";
       
            for (var i = 0; i < urlarray.length; i++) { 
              Domainwithdot += "."+ urlarray[i];
            }
      debugger;
          var tempcookiesobj = $cookies.get('MiddleLayerMessage');
          $cookies.remove('MiddleLayerMessage', {domain: Domainwithdot , path: '/'});
          console.log(tempcookiesobj);

          if(tempcookiesobj != undefined)
          {
            tempcookiesobj = angular.fromJson(tempcookiesobj);
            if(tempcookiesobj.isSuccess == false)
            {
              $mdDialog.show(
                            $mdDialog.alert()
                            .parent(angular.element(document.body))
                            .content(tempcookiesobj.message.replace(/\+/g, ' '))
                            .ariaLabel('Alert Dialog Demo')
                            .ok('OK')
                            .targetEvent()
                        );
                        closeThread();
                        return;

            }else{ 
          
          $mdToast.show(
                      $mdToast.simple()
                      .textContent(tempcookiesobj.message.replace(/\+/g, ' '))
                      .position('top right')
                      .hideDelay(3000)
                  );
            }
              }else
          {
            console.log('MiddleLayerMessage undefined');
          }
          //End show webx message


        function formatDate(date){
          var dateOut = new Date(date);
          return dateOut;
        };

        

        ////////////////////////////////////////////////
        debugger
        init().loadBaseCurrency();



        vm.sortArr = [{
          name: "Starred",
          id: "favouriteStarNo",
          src: "img/ic_add_shopping_cart_48px.svg",
          upstatus : false,
          downstatus : false,
          divider: true,
          close: false
        }, {
          name: "Date",
          id: "lastTranDate",
          src: "img/ic_add_shopping_cart_48px.svg",
          upstatus : false,
          downstatus : false,
          divider: false,
          close: true
        }, {
          name: 'Payment No',
          id: 'receiptID',
          src: "img/ic_add_shopping_cart_48px.svg",
          upstatus : false,
          downstatus : false,
          divider: false,
          close: false
        }, {
          name: "Customer",
          id: "profileName",
          src: "img/ic_add_shopping_cart_48px.svg",
          upstatus : false,
          downstatus : false,
          divider: false,
          close: false
        }, {
          name: "Amount",
          id: "recievedAmount",
          src: "img/ic_add_shopping_cart_48px.svg",
          upstatus : false,
          downstatus : false,
          divider: false,
          close: false
        }, {
          name: "Payment Method",
          id: "paymentMethod",
          src: "img/ic_add_shopping_cart_48px.svg",
          upstatus : false,
          downstatus : false,
          divider: true,
          close: false
        }, {
          name: "Cancelled",
          id: "paymentStatus",
          src: "img/ic_add_shopping_cart_48px.svg",
          upstatus : false,
          downstatus : false,
          divider: false,
          close: false
        }];



        function downloadPdf() {
          var client = $getPdf.setPdfClient('generatePDF', 'process');
          client.setUrl(vm.fullPayment.receiptID + '.pdf').uniqueID(vm.fullPayment.receiptID).class('payment').download();
        }

        function printPdf() {    
            var client = $getPdf.setPdfClient('generatePDF', 'process');
            client.setUrl(vm.fullPayment.receiptID + '.pdf').uniqueID(vm.fullPayment.receiptID).class('payment').print();
        }

        function emailCustomer(){
        //get template id
          vm.template = "";
          /*for(var i = 0; settingSummary.templates.length > i; i++)
          {
            if(settingSummary.templates[i])
            settingSummary = settingSummary.templates[i].templateName;
          }*/
        //get template id
          console.log(vm.fullPayment);
          $mdDialog.show({
              templateUrl: 'app/main/payments/dialogs/email/email.html',
              controller: 'paymentse',
              controllerAs: 'vm',
              locals:{
                  item : vm.fullPayment,
                  profData : vm.setPrf,
                  template : vm.template,
                  cusemail : vm.profileDada.email
              }
          }).then(function(data){
              
          }, function(data){

          })
        }

    function singleStarSort(){        
        var whereClause = "favouriteStarNo = '0' order by lastTranDate DESC"
        vm.pageObj = {
            service : 'payment',
            method : 'getPaymentSummaryByQuery',
            body : {"where" : whereClause},
            orderby: '',
            isAscending : ''
        }

        $scope.$broadcast("getPageObj", vm.pageObj)
    }

    function singleCancelSort(){
        // var item = {
        //     name: "Cancelled",
        //     id: "paymentStatus",
        //     src: "img/ic_add_shopping_cart_48px.svg",
        //     upstatus : false,
        //     downstatus : false,
        //     divider: false,
        //     close: false
        // }
        // starfunc(item,0);
        var whereClause = ""
         vm.pageObj = {
            service : 'payment',
            method : 'getPaymentSummaryByQuery',
            body : {"where" : whereClause},
            orderby: '',
            isAscending : ''
        }

        $scope.$broadcast("getPageObj", vm.pageObj)
    }

    function defaultCancel(item){
        vm.sortArr[1].close = true;
        vm.sortArr[vm.indexno].upstatus = false;
        vm.sortArr[vm.indexno].downstatus = false;
        item.close = false; 
        vm.indexno = 1; 

        vm.orderby = "lastTranDate",
        vm.Isascending = false;
        loadAllpayments(vm.orderby,vm.Isascending); 
    }


    function starfunc(item, index) {
        if (item.id === "favouriteStarNo") { 
            item.upstatus == false;
            item.downstatus = false;
            vm.sortArr[vm.indexno].upstatus = false;
            vm.sortArr[vm.indexno].downstatus = false;
            vm.sortArr[vm.indexno].close = false;
            item.close = true;
            vm.indexno = index;  
            vm.orderby = "favouriteStarNo";
            vm.Isascending = true;
            loadAllpayments(vm.orderby,vm.Isascending); 

        } else if (item.id === "paymentStatus") {
            vm.latest = null;
            vm.prodSearch = null;
            item.upstatus == false;
            item.downstatus = false;
            vm.sortArr[vm.indexno].downstatus = false;
            vm.sortArr[vm.indexno].upstatus = false;
            vm.sortArr[vm.indexno].close = false;
            item.close = true;
            vm.indexno = index; 
            if (item.name == "Active") {
              vm.orderby = "paymentStatus";
              vm.Isascending = true;
              loadAllpayments(vm.orderby,vm.Isascending); 
            }else if (item.name == "Cancelled") {
              vm.orderby = "paymentStatus";
              vm.Isascending = false;
              loadAllpayments(vm.orderby,vm.Isascending); 
            }

        } else {

            if (item.upstatus == false && item.downstatus == false) {
                item.upstatus = !item.upstatus;
                item.close = true;
                if (vm.indexno != index) {
                    vm.sortArr[vm.indexno].upstatus = false;
                    vm.sortArr[vm.indexno].downstatus = false;
                    vm.sortArr[vm.indexno].close = false;
                    vm.indexno = index;                    
                }
            } else {
                item.upstatus = !item.upstatus;
                item.downstatus = !item.downstatus;
                item.close = true;
            }
            if (item.upstatus) { 
              vm.orderby = item.id;;
              vm.Isascending = true;
              loadAllpayments(vm.orderby,vm.Isascending); 
            }
            if (item.downstatus) {               
              vm.orderby = item.id;;
              vm.Isascending = false;
              loadAllpayments(vm.orderby,vm.Isascending); 
            }
        }
    } 

    function loadAllpayments(orderby,Isascending){
       

        var whereClause; 
 
        if (orderby == "" || orderby == "lastTranDate")
            whereClause = (Isascending) ? "paymentStatus <> 'delete' order by lastTranDate" : "paymentStatus <> 'delete' order by lastTranDate DESC" 
        else{
            if (Isascending) 
                whereClause = "paymentStatus <> 'delete' order by "+orderby+", lastTranDate DESC";
            else
                whereClause = "paymentStatus <> 'delete' order by "+orderby+" DESC, lastTranDate DESC";          
        }
        vm.pageObj = {
            service : 'payment',
            method : 'getPaymentSummaryByQuery',
            body : {"where" : whereClause},
            orderby: '',
            isAscending : ''
        }

        $scope.$broadcast("getPageObj", vm.pageObj)

    }

        /**
         * Initialize
         */
        function init(){  
            if($state.current.name === 'app.payments.pay.detail'){
              changeState();
            }else if ($state.current.name === 'app.payments.pay.online') {
              getPaymentByGUID()
            }

            var services = {
                loadBaseCurrency : loadBaseCurrency
            }
            return services

            /*
             * @name loadBaseCurrency
             * @desc filter the base currency from the settingobject
            */
            function loadBaseCurrency(){                
                if (vm.settingSummary.length > 0) {
                    vm.baseCurrency = vm.settingSummary[0].profile.baseCurrency;
                }
            }
 
        }

        function getPaymentByGUID(){ 
          var client =  $serviceCall.setClient("getPaymentByPaymentGUID","payment");
          client.ifSuccess(function(data){
              if (data.length > 0) {
                openItem(data[0])
                changeState();
              }else{
                closeThread()
                $mdDialog.show($mdDialog.alert().parent(angular.element(document.body)).content('Looks like there is no record regarding this payment ID. please check your payment id again').ariaLabel('').ok('OK').targetEvent(data));
              }
              
          });
          client.ifError(function(data){
              $mdDialog.show($mdDialog.alert().parent(angular.element(document.body)).content('Error Occure while redirect to the payment page. Please refresh the page').ariaLabel('').ok('OK').targetEvent(data));
          })
          client.gUID($state.params.itemID)
          client.getReq();
        }

        /*

            @desc favourite function to update the obj 
            @param _obj payment object 
        */
        function favouriteFunction(_obj){
            if (_obj.favouriteStarNo == 1 ) {
                _obj.favouriteStarNo = 0;
            }
            else if (_obj.favouriteStarNo == 0){
                _obj.favouriteStarNo = 1;
            }
            _obj.recievedAmount  = _obj.recievedAmount.toString();
            _obj.receiptID = _obj.receiptID.toString();
            _obj.favoriteStar = !_obj.favoriteStar;

            var paymentObj = {
                "payment" : _obj,
                "image": "",
                "appName" : "Payments",
                "permissionType" : "edit"
            } 
            var jsonString = JSON.stringify(paymentObj)

            var client =  $serviceCall.setClient("modifyPayment","process");
            client.ifSuccess(function(data){
                 
            });
            client.ifError(function(data){
                $mdDialog.show($mdDialog.alert().parent(angular.element(document.body)).content('Error Occure while Adding to Favourite').ariaLabel('').ok('OK').targetEvent(data));
            })
            client.postReq(jsonString);
        }

        function updateStatusInView(receiptID,status){
            vm.paymentSummary = vm.paymentSummary.filter(function( obj ) {
                if (obj.receiptID === receiptID ) {
                    obj.statusTxt = status
                }
                return obj
            });
        }


        function setPrimaryToolBar(){
            vm.primaryToolbarContext = !vm.primaryToolbarContext;
        };

        function toggleChildStates(toggledState){
            $state.go(toggledState);
        };

        function openItem(item)
        {
            // Set the read status on the item
            // item.read = true; 

            setPrimaryToolBar();
            // Assign thread as the current thread
            vm.currentThread = item;

            $state.go('app.payments.pay.detail', {itemID: item.receiptID});

        }

        /**
         * Close thread
         */
        function closeThread()
        {
            vm.currentThread = null;

            setPrimaryToolBar();

            // Update the state without reloading the controller
            $state.go('app.payments.pay');
        }

        /**
         * Return selected status of the thread
         *
         * @param thread
         * @returns {boolean}
         */
        function isSelected(thread)
        {
            return vm.selectedThreads.indexOf(thread) > -1;
        }

        /**
         * Toggle selected status of the thread
         *
         * @param thread
         * @param event
         */
        function toggleSelectThread(thread, event)
        {
            if ( event )
            {
                event.stopPropagation();
            }

            if ( vm.selectedThreads.indexOf(thread) > -1 )
            {
                vm.selectedThreads.splice(vm.selectedThreads.indexOf(thread), 1);
            }
            else
            {
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
        function selectThreads(key, value)
        {
            // Make sure the current selection is cleared
            // before trying to select new threads
            vm.selectedThreads = [];

            for ( var i = 0; i < vm.paymentSummary.length; i++ )
            {
                if ( angular.isUndefined(key) && angular.isUndefined(value) )
                {
                    vm.selectedThreads.push(vm.paymentSummary[i]);
                    continue;
                }

                if ( angular.isDefined(key) && angular.isDefined(value) && vm.paymentSummary[i][key] === value )
                {
                    vm.selectedThreads.push(vm.paymentSummary[i]);
                }
            }
        }

        /**
         * Deselect threads
         */
        function deselectThreads()
        {
            vm.selectedThreads = [];
        }

        /**
         * Toggle select threads
         */
        function toggleSelectThreads()
        {
            if ( vm.selectedThreads.length > 0 )
            {
                vm.deselectThreads();
            }
            else
            {
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
        function setThreadStatus(key, value, thread, event)
        {
            // Stop the propagation if event provided
            // This will stop unwanted actions on button clicks
            if ( event )
            {
                event.stopPropagation();
            }

            // If the thread provided, do the changes on that
            // particular thread
            if ( thread )
            {
                thread[key] = value;
                return;
            }

            // If the current thread is available, do the
            // changes on that one
            if ( vm.currentThread )
            {
                vm.currentThread[key] = value;
                return;
            }

            // Otherwise do the status update on selected threads
            for ( var x = 0; x < vm.selectedThreads.length; x++ )
            {
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
        function toggleThreadStatus(key, thread, event)
        {
            // Stop the propagation if event provided
            // This will stop unwanted actions on button clicks

            favouriteFunction(thread);

            if ( event )
            {
                event.stopPropagation();
            }

            // If the thread provided, do the changes on that
            // particular thread
            if ( thread )
            {
                if ( typeof(thread[key]) !== 'boolean' )
                {
                    return;
                }

                thread[key] = !thread[key];
                return;
            }

            // If the current thread is available, do the
            // changes on that one
            if ( vm.currentThread )
            {
                if ( typeof(vm.currentThread[key]) !== 'boolean' )
                {
                    return;
                }

                vm.currentThread[key] = !vm.currentThread[key];
                return;
            }

            // Otherwise do the status update on selected threads
            for ( var x = 0; x < vm.selectedThreads.length; x++ )
            {
                if ( typeof(vm.selectedThreads[x][key]) !== 'boolean' )
                {
                    continue;
                }

                vm.selectedThreads[x][key] = !vm.selectedThreads[x][key];
            }
        }




        /*

            detail view controllers and functions 

        */

        vm.loadFullPayments = loadFullPayments

        vm.fullPayment = null;

        vm.updatePayment = updatePayment; 


        function updatePayment(item,status){

            var confirm = $mdDialog.confirm()
                .title(status+' Payment?')
                .content('This process is not reversible.')
                .targetEvent()
                .ok('Ok')
                .cancel('Cancel');
            $mdDialog.show(confirm).then(function() {
                item.paymentStatus = status;
                addActivity(item,function(obj){
                    item.paymentLog = obj;
                    updatePaymentToService(item,status); // initial name was updatePayment
                })
            }, function() {
                $mdDialog.hide();
            });
        }

        function addActivity(item,callback){
            var obj = {
              "userName" : "",
              "lastTranDate" : new Date(),
              "description" : "payment "+item.paymentStatus+" by ",  
              "UIHeight" : "30px;", 
              "type" : "activity",
              "status" : "Active",
              "createDate": new Date(),
              "modifyDate": new Date(),
              "createUser":"",
              "modifyUser":"",
              "logID":"-888",
              "paymentID" :item.receiptID
            }
            callback(obj);
        }

        function updatePaymentToService(item,status){


            var statusTxt = (status === "Cancel" ) ? "Cancelled" : "Deleted";
            item.statusTxt = statusTxt;

            var paymentObj = {
                "payment" :item,
                "appName" : "Payments",
                "image" : "",
                "permissionType" : status
            }
            var jsonString = JSON.stringify(paymentObj);
 
            var client =  $serviceCall.setClient("updatePayment","process");
            client.ifSuccess(function(data){
                status = (status == 'delete')? "Delete" : status;
                $mdToast.show(
                  $mdToast.simple()
                    .textContent('Payment '+item.receiptID+' successfully '+statusTxt.toLowerCase())
                    .position('top right' )
                    .hideDelay(3000)
                );

               closeThread();
               updateStatusInView(item.receiptID,statusTxt)
            });
            client.ifError(function(data){
                  $mdDialog.show($mdDialog.alert().parent(angular.element(document.body)).title('Error Occure').content('Error occured while proforming the operation').ariaLabel('').ok('OK').targetEvent());
            })                
            client.postReq(jsonString); 
        } 
 

        function changeState(){
           if ($state.params.itemID && $state.params.itemID !== "") {
                vm.currentThread = "assas"
                vm.primaryToolbarContext = false;
                vm.paymentID = $state.params.itemID 
            }else if ($state.params.Data && $state.params.Data.paymentID) {              
                vm.currentThread = "assas"
                vm.primaryToolbarContext = false;
                vm.paymentID = $state.params.Data.paymentID;
                var obj = {'receiptID' :vm.paymentID  }
                vm.openItem(obj) 
            } 
        }

        function loadFullPayments(){ 
            
            vm.detailProgress = true;  
            changeState();
            
            var client =  $serviceCall.setClient("getFullPayment","payment");
            client.ifSuccess(function(data){
                if (ifArray(data)) {                    
                    vm.fullPayment = data[0];
                    getLatestPaymentId(vm.fullPayment.profileID);
                    vm.currentThread = vm.fullPayment;
                    vm.detailProgress = false;
                    loadFullProfile();
                    loadUAdvance();
                    checkUserCancellation(vm.fullPayment.profileID);
                } 
            });
            client.ifError(function(data){
                console.log("error loading full payment data")
            })               
            client.uniqueID(vm.paymentID);
            client.getReq();
        }

        function loadFullProfile(){
            vm.detailProgress = true;
            var profileClient =  $serviceCall.setClient("getProfileByKey","profile"); 
            profileClient.ifSuccess(function(data){
             vm.detailProgress = false;
              if (data) {
                vm.profileDada = data;  
                vm.ObjCusAddress = AddressService.setAddress(vm.profileDada.profileName,vm.profileDada.billingAddress.street,vm.profileDada.billingAddress.city,vm.profileDada.billingAddress.state,vm.profileDada.billingAddress.zip,vm.profileDada.billingAddress.country,vm.profileDada.phone,vm.profileDada.mobile,vm.profileDada.fax,vm.profileDada.email,vm.profileDada.website); //End set client address

              }
              
              if ($state.params.email) {
                  // emailCustomer();
              }
            });
            profileClient.ifError(function(data){
              console.log('error loading profile data')
            });
            profileClient.uniqueID(vm.fullPayment.profileID);
            profileClient.getReq();
        }

        function loadUAdvance(){
            vm.detailProgress = true;
            var profileClient =  $serviceCall.setClient("getUAmountByProfileID","payment"); 
            profileClient.ifSuccess(function(data){
            vm.detailProgress = false;

              if (data.length > 0) {
                vm.advancePaymentData = data[0];
                vm.fullPayment.outStandingPayment = data[0].uAmount;
              }
            });
            profileClient.ifError(function(data){
              console.log('error loading profile data')
            });
            profileClient.skip(0);
            profileClient.take(1);
            profileClient.profileID (vm.fullPayment.profileID);
            profileClient.getReq();
        }


        function getLatestPaymentId(profileID){

            var client =  $serviceCall.setClient("getAllByQuery","payment");
            client.ifSuccess(function(data){
                var data = data;
                if (data.length > 0) {            
                    data = data.sort(function(a,b){
                        return new Date(b.lastTranDate)  - new Date(a.lastTranDate);
                    })
                    vm.lastTranDate = data[0].lastTranDate; 
                }else
                    vm.lastTranDate = vm.fullPayment.lastTranDate
 
            });
            client.ifError(function(data){
                console.log("error loading full payment data")
            })               
            client.skip(0);
            client.take(100);
            client.orderby('receiptID');
            client.isAscending(true);
            client.postReq({
                "where":"paymentStatus <> 'Cancel' and paymentStatus <> 'delete' and profileID = '"+profileID+"'"
            }); 
        }

        function checkUserCancellation(profileID){
            vm.showCancelBtn = false;
            vm.detailProgress = true;  

            var client =  $serviceCall.setClient("getAllByQuery","payment");
            client.ifSuccess(function(response){ 
                vm.detailProgress = false;
                var payData = response.result[0];
                if (payData.receiptID === vm.fullPayment.receiptID) {
                  vm.showCancelBtn = true;
                }
            });
            client.ifError(function(response){
                console.log("error loading full payment data")
            })               
            client.skip(0);
            client.take(1);
            client.orderby('lastTranDate');
            client.isAscending(false);
            client.postReq({
                "where":"paymentStatus <> 'Cancel' and paymentStatus <> 'delete' and profileID = '"+profileID+"'"
            }); 
        }

    }
})();

function ifArray(arr){
   return (Array.isArray(arr) && arr.length > 0) ?  true :  false;
}
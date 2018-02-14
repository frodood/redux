(function ()
{
    'use strict';

    angular
        .module('app.invoices')
        .controller('invController', invController);

    /** @ngInject */
    function invController($scope,$apis,$cookies,$location,$getPdf, $rootScope, $document, Invoicecopy, $stateParams, $serviceCall, $mdToast, $mdDialog, $mdMedia, $mdSidenav, $state, msApi, Summary,AddressService, Recurring, msSpinnerService)
    {debugger;
        var vm = this;
        vm.spinnerService = msSpinnerService;
        vm.settings = [];
        vm.contactColors = ['blue-bg', 'blue-grey-bg', 'orange-bg', 'pink-bg', 'purple-bg', 'green-bg', 'red-bg'];

        // vm.folders = Primary.data;
        // vm.labels = Secondary.data;

        //vm.invoiceSummary = Summary.result;

        // if (! vm.invoiceSummary) {
        //   vm.invoiceSummary = []
        // }
        console.log($state.params);
		
		//Start Show Webx message
		
		var urlarray = $apis.getHost().split(".");
		urlarray.splice(0, 1);
		
		var Domainwithdot = "";
	   
		for (var i = 0; i < urlarray.length; i++) { 
			Domainwithdot += "."+ urlarray[i];
		}
		
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

        
        //vm.invoicesRecurring = Recurring.result;
        vm.showCancle = true;

        vm.asc = false;

        vm.dsc = false;

        vm.primaryToolbarContext = true;

        vm.toggleChildStates = toggleChildStates;

        vm.loadingItems = true;

        vm.currentThread = null;

        vm.showShipping = true;

        vm.paymentMethords = [];

        vm.selectedThreads = [];

        vm.IsCreditNoteReady = false;

        vm.openItem = openItem;

        vm.closeThread = closeThread;

        vm.isSelected = isSelected;

        vm.toggleSelectThread = toggleSelectThread;

        vm.selectThreads = selectThreads;

        vm.deselectThreads = deselectThreads;

        vm.toggleSelectThreads = toggleSelectThreads;

        vm.setThreadStatus = setThreadStatus;

        vm.toggleThreadStatus = toggleThreadStatus;

        vm.favouriteInvoices = favouriteInvoices;

        vm.UnPaidInvoices = UnPaidInvoices;

        vm.sortInvoiceNo = sortInvoiceNo;

        vm.paidInvoices = paidInvoices;

        vm.defaultCancel=defaultCancel;

        vm.loadDetailView = loadDetailView;

        vm.cancelStatus = cancelStatus;

        vm.starfunc = starfunc;

        vm.enterPayment = enterPayment;

        vm.copyInvoice = copyInvoice;

        vm.emailCustomer = emailCustomer;

        vm.creditNote = creditNote;

        vm.CopyAsRecurringProfile = CopyAsRecurringProfile;

        vm.DownloadPDF = DownloadPDF;

        vm.printPdf = printPdf;

        vm.sortarr = [];

        vm.UnappliedAdvances = 0;

        vm.ObjCusAddress = [];

        vm.ObjCompanyAddress = [];

        vm.backState = 'app.invoices.inv.detailView';

        vm.sendReminder = sendReminder;

        checkParamss();

        vm.invListSpinnerLoaded = invListSpinnerLoaded;

        vm.invoDetailSpinnerLoaded = invoDetailSpinnerLoaded;

        function invoDetailSpinnerLoaded(detailSpinner){

            detailSpinner.show('invo-details-spinner');
        }

        function invListSpinnerLoaded(msListSpinner){
            msListSpinner.show('inv-list-spinner');
        }

        function checkParamss(){
          console.log($state.params.Data);
            if($state.params.Data){ 
              $state.params.itemId = $state.params.Data.invoiceID;
              console.log($state.params.itemId);
            }
        }   

        function printPdf() {
        var client = $getPdf.setPdfClient('generatePDF', 'process');
        client.setUrl(vm.inv.invoiceNo + '.pdf').uniqueID(vm.inv.invoiceNo).class('invoice').print();
        }

        function DownloadPDF(){
          /*var client = $getPdf.setPdfClient('generatePDF','process');
          if (client.checkStorage(vm.inv.invoiceNo + '.pdf')) {
          client.downloadStore();
          }else{
          
          client.setUrl(vm.inv.invoiceNo + '.pdf').uniqueID(vm.inv.invoiceNo).class('invoice').download();
          }*/

          var client = $getPdf.setPdfClient('generatePDF', 'process');
          client.setUrl(vm.inv.invoiceNo + '.pdf').uniqueID(vm.inv.invoiceNo).class('invoice').download();
        
        }

        function emailCustomer(){  
          console.log(vm.inv);
          $mdDialog.show({
              templateUrl: 'app/main/invoices/dialogs/email/email.html',
              controller: 'InvoemailCtrl',
              controllerAs: 'vm',
              locals:{
                  item : vm.inv,
                  profData : vm.profData,
                  template : 'T_EMAIL_INV_NEWMAIL',
                  type : 'invoice',
                  amount : '',
                  settings : vm.settings
              }
          }).then(function(data){
              
          }, function(data){

          })
        }

        //Load data for the detail view
        vm.invSatus = "Unpaid";
        function loadDetailView(){

            vm.primaryToolbarContext = false;
            vm.currentThread  = "ssss";

            LoadSettings();

            var Invoice = { "permissionType" : "add", "appName":"Invoices"};
            var jsonString = JSON.stringify(Invoice);

            var client =  $serviceCall.setClient("getInvoiceByKey","process");
            client.ifSuccess(function(data){
              
                var data = data;
              fillview(data);
              loadAdvancePaymentDetails(data.profileID);
              
              vm.ObjCusAddress = AddressService.setAddress(vm.inv.profileName,vm.inv.billingAddress.street,vm.inv.billingAddress.city,vm.inv.billingAddress.state,vm.inv.billingAddress.zip,vm.inv.billingAddress.country,vm.inv.contactNo,vm.inv.mobileNo,vm.inv.fax,vm.inv.email,vm.inv.website);
             
            });
            client.ifError(function(data){
              vm.spinnerService.hide('invo-details-spinner');
              console.log("error loading invoice data")
            })
            //added by dushmantha
            debugger;
            var array = $state.params.itemId.split('|');
            if(array.length > 1)
            {
              $mdDialog.show(
                    $mdDialog.alert()
                    .parent(angular.element(document.body))
                    .title('Alert')
                    .content(array[1])

                    .ok('OK')
                    .targetEvent()
                );
            }
            //added by dushmantha
            client.uniqueID(array[0]); //$state.params.itemId send projectID as url parameters
            client.getReq(jsonString);
        }
        function loadAdvancePaymentDetails(profileID) {

            var client = $serviceCall.setClient("getUAmountByProfileID", "payment");
            client.skip("0");
            client.take("10");
            client.profileID(profileID);

            client.ifSuccess(function(data) {
              vm.spinnerService.hide('invo-details-spinner');
                console.log(data)
                var data = data;


                if (data.length > 0) {
                    if (!data[0].uAmount) data[0].uAmount = 0;

                    vm.UnappliedAdvances = angular.copy(parseFloat(data[0].uAmount));
                    

                    // if (data[0].uAmount == 0) $scope.receiveRequired = true
                    // else $scope.receiveRequired = false;
                }
            });
            client.ifError(function(data) {
              vm.spinnerService.hide('invo-details-spinner');
                console.log("error loading advance payment")
            })

            client.postReq();
        }
        function fillview(val){ 
            if(val.status != "Draft"){
                    val.startDate = new Date(val.startDate)
                     val.dueDate = new Date(val.dueDate)

                    var calculateDis = 0;
                    var totalDiscount = 0;
                    var subT = 0
                    var itemPrice = 0;
                        
                     vm.tot = 0;
                      vm.paid = 0;
                      vm.paidAmount = 0;
                      var getsin = 0;

                       vm.inv = {};
                    vm.inv = val;

                    //validate for go to creditnot option permition
                    if((vm.inv.invoiceStatus.toLowerCase() == "overdue" || vm.inv.invoiceStatus == "Unpaid" || vm.inv.invoiceStatus == "Partially Paid" ) && vm.inv.multiDueDates.length == 1)
                    {
                        vm.IsCreditNoteReady = true;
                    }
                    //validate for go to creditnot option permition
                    
                    vm.inv.notes = vm.inv.notes.replace(/(?:\r\n|\r|\n)/g, '<br/>');
                   
                  makePaymentMethords();
                  
                  vm.invSatus = val.invoiceStatus;

                 for (var x = 0; x <= val.multiDueDates.length - 1; x++) {
                    getsin = parseFloat(val.multiDueDates[x].balance/val.exchangeRate)
                    vm.singlebalance = parseFloat(val.netAmount - getsin); //removed 7_19 .toFixed(2)
                    vm.tot += parseFloat(val.multiDueDates[x].balance);
                   vm.paidAmount += parseFloat(val.multiDueDates[x].dueDatePrice - val.multiDueDates[x].balance);
                     vm.paid = parseFloat(vm.paidAmount); //removed 7_19 .toFixed(2)
                    vm.calBalance = parseFloat(vm.tot); //removed 7_19 .toFixed(2)
                   
                }

                //Start check if shipping address exixting // added by dushmantha
                if(vm.inv.shippingAddress != undefined)
                {
                if(vm.inv.shippingAddress.s_street == "" && vm.inv.shippingAddress.s_city == ""
                  && vm.inv.shippingAddress.s_state == "" && vm.inv.shippingAddress.s_zip == "" && vm.inv.shippingAddress.s_country == "")
                  { 
                  vm.showShipping = false;
                  }
                }
                //End check if shipping address exixting // added by dushmantha

            
         }
      }

        var page = 1;
        // controller // "deleteStatus = 'false' order by createDate DESC" // old code removed by dushmantha
            vm.pageObj = {
            service : 'invoice',
            method : 'getInvoiceSummaryByQuery',
            body : {
            "where": "deleteStatus = 'false' order by invoiceNo DESC, createDate DESC"
            },
            orderby: '',
            isAscending : true
            }
            vm.pageGap = 10;

        //////////
        vm.gotoRecurringProfile = gotoRecurringProfile;

        loadSettings();
        

        init().loadSummary();

        /**
         * Initialize
         */
        function init()
        {

          if($state.current.name == "app.invoices.inv.detailView"){
              loadDetailView();
          }
          if($state.current.name == "app.invoices.inv.detail"){
              loadDetailView();
          }

          var service = {
            loadSummary : loadSummary
          }
          return service;

          function loadSummary(){
            // if(vm.invoiceSummary.length > 0){
            //     // Load new threads
            //      for ( var i = 0; i < vm.invoiceSummary.length; i++ )
            //       {
            //          vm.invoiceSummary[i].startDate = new Date(vm.invoiceSummary[i].startDate); 
            //           // Hide the loading screen
            //   vm.loadingItems = false; 
            //       }
            //   vm.items =  vm.invoiceSummary;

              

            //    // Open the thread if needed
            //   if ( $state.params.itemId )
            //   {
            //       for ( var i = 0; i < vm.items.length; i++ )
            //       {
            //           if ( vm.items[i].invoiceNo === $state.params.itemId )
            //           {
            //               vm.openItem(vm.items[i]);
            //               break;
            //           }
            //       }
            //   }
            // }
          }
        }

        vm.approve = approve;

        function approve(obj){

              obj.emailCustomerUponSavingInvoice = vm.settings[0].preference.invoicePref.emailCustomerUponSavingInvoice
          

          console.log("sdasdasd");
          for (var x = obj.multiDueDates.length - 1; x >= 0; x--) {
             obj.multiDueDates[x].paymentStatus = "Unpaid";
         }
         obj.invoiceStatus = "Unpaid"
          
         var Invoice = {"invoice" : obj, "image" :obj.uploadImages, "permissionType" : "add", "appName":"Invoices", "invSequence":"GRN001" };;
                var jsonString = JSON.stringify(Invoice);

                var client =  $serviceCall.setClient("updateInvoice","process");
                client.ifSuccess(function(data){
                   

              $mdToast.show(
                  $mdToast.simple()
                    .textContent('Invoice '+ obj.invoiceNo +' successfully approved')
                    .position('top right' )
                    .hideDelay(3000)
                );

              init().loadSummary();
             });
             client.ifError(function(data){
              $mdToast.show(
                  $mdToast.simple()
                    .textContent('Error approving invoice')
                    .position('top right' )
                    .hideDelay(3000)
                );
             })
             client.postReq(jsonString);
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
            if(item.invoiceStatus != "Draft"){
              $state.go('app.invoices.inv.detail', {itemId: item.invoiceNo});
            }else{
              //Invoicecopy.setArr(item);
              if(item.invoiceStatus == "Draft")
              {
                Invoicecopy.setArr(item);
              }
              $state.go('app.invoices.edit', {itemId: item.invoiceNo});
            }
            

        }

        /**
         * Close thread
         */
        function closeThread()
        {
            vm.currentThread = null;

            setPrimaryToolBar();
             //location.reload();
            // Update the state without reloading the controller
            
            //aded bu dushmantha //   old code removed by dushmantha "where": "deleteStatus = 'false' order by createDate DESC"
            vm.loadingItems = false;
            vm.invoiceSummary = [];
            vm.items = null;

            var Invoice = {"where": "deleteStatus = 'false' order by invoiceNo DESC, createDate DESC"};
            var jsonString = JSON.stringify(Invoice);

            var client =  $serviceCall.setClient("getInvoiceSummaryByQuery","invoice");
            client.ifSuccess(function(data){
             vm.invoiceSummary = data.result;
             init().loadSummary();
            });
            client.ifError(function(data){
              console.log("error loading invoice data")
            })
            client.skip = 0;
            client.take = 10;
            client.isAscending = true;
            client.postReq(jsonString);

            
            
            
            //added by dushmantha


            $state.go('app.invoices.inv');

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

            for ( var i = 0; i < vm.items.length; i++ )
            {
                if ( angular.isUndefined(key) && angular.isUndefined(value) )
                {
                    vm.selectedThreads.push(vm.items[i]);
                    continue;
                }

                if ( angular.isDefined(key) && angular.isDefined(value) && vm.items[i][key] === value )
                {
                    vm.selectedThreads.push(vm.items[i]);
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

              if (thread.favouriteStarNo == 1)
              {
                thread.favouriteStarNo = 1;
              }
              else if (thread.favouriteStarNo == 0)
              {
                thread.favouriteStarNo = 0;
              }
          
            thread.favouriteStar = !thread.favouriteStar;
                 //var udtateData = {invoice : thread, "image" :[], "permissionType" : "edit", "appName":"Invoices"};
                //var inputObject = {'uniqueID': thread.invoiceNo, 'favouriteStarNo' : thread.favouriteStarNo};
                var inputObject = { "permissionType" : "add", "appName":"Invoices"};
                
                var jsonString = JSON.stringify(inputObject);
      
              //var client =  $serviceCall.setClient("update","invoice");
              var client =  $serviceCall.setClient("updateFavoriteStar","process");
             client.ifSuccess(function(data){
              
             });
             client.ifError(function(data){
              console.log("error ")
             })
             client.uniqueID(thread.invoiceNo);
             client.favouriteStarNo(thread.favouriteStarNo);

              client.postReq(jsonString);

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


         function GetDataFromService (val){
         vm.pageObj = {
            service : 'invoice',
            method : 'getInvoiceSummaryByQuery',
            body : val,
            orderby: '',
            isAscending : ''
        }

        $scope.$broadcast("getPageObj", vm.pageObj);
        }

        function favouriteInvoices(){
            // if(page == 1){
            //     page = 0;
             
            GetDataFromService({"where": "deleteStatus = false AND favouriteStar = true order by createDate DESC"});
        // }else{
        //      page = 1;
        //    vm.items =  vm.invoiceSummary;
        // };
        }


         function UnPaidInvoices(){
            // if(page == 1){
                page = 0;
            GetDataFromService({"where": "deleteStatus = false AND invoiceStatus = 'Unpaid' order by createDate DESC"});
                
        // }else{
        //      page = 1;
        //    vm.items =  vm.invoiceSummary;
        // };
        }


        function paidInvoices(){
           // if(page == 1){
                page = 0;
                GetDataFromService({"where": "deleteStatus = false AND invoiceStatus = 'Paid' order by createDate DESC"});
        // }else{
        //      page = 1;
        //    vm.items =  vm.invoiceSummary;
        // }; 
        }

        function sortInvoiceNo(){
        var whereClause = "deleteStatus = false AND viewed = "+true+" order by createDate DESC";          
          
        
        vm.pageObj = {
            service : 'invoice',
            method : 'getInvoiceSummaryByQuery',
            body : {
                "where": whereClause
            },
            orderby: '',
            isAscending : ''
        }

        $scope.$broadcast("getPageObj", vm.pageObj);
            
        }

          vm.removeFilters = removeFilters;

          function removeFilters(){ debugger;
                //page = 1;
                //vm.asc = true;
                 //vm.dsc = false;
                //vm.items =Summary.result;
                for(var i=0; i<=vm.sortarr.length -1; i++ ){

                  if(vm.sortarr[i].name != "Invoice No"){
                    vm.sortarr[i].upstatus = false;
                    vm.sortarr[i].downstatus = false;
                    vm.sortarr[i].close = false;
                  }
                }

                //item.close = false;    
                vm.orderby = "createDate",
                vm.isAscending = false;        
                CheckFullArrayStatus(vm.orderby,vm.isAscending);
          }

   vm.sortarr = [{
      name: "Starred",
      id: "favouriteStarNo",
      src: "img/ic_grade_48px.svg",
      upstatus: false,
      downstatus: false,
      divider: true,
      close: false
    },{
      name: "Draft",
      id: "Draft",
      upstatus: false,
      downstatus: false,
      divider: true,
      close: false
    },{
      name: "Date",
      id: "startDate",
      upstatus: false,
      downstatus: false,
      divider: true,
      close: false
    }, {
      name: "Invoice No",
      id: "invoiceNo",
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
      name: "Balance Due",
      id: "balanceDue",
      upstatus: false,
      downstatus: false,
      divider: true,
      close: false
    }, {
      name: "Due Date",
      id: "dueDate",
      upstatus: false,
      downstatus: false,
      divider: true,
      close: false
    }, {
      name: "Paid",
      id: "paymentStatus",
      upstatus: false,
      downstatus: false,
      divider: true,
      close: false
    }, {
      name: "Unpaid",
      id: "paymentStatus",
      upstatus: false,
      downstatus: false,
      divider: true,
      close: false
    }, {
      name: "Overdue",
      id: "paymentStatus",
      upstatus: false,
      downstatus: false,
      divider: true,
      close: false
    }, {
      name: "Partially Paid",
      id: "paymentStatus",
      upstatus: false,
      downstatus: false,
      divider: true,
      close: false
    }, {
      name: "Cancelled",
      id: "paymentStatus",
      upstatus: false,
      downstatus: false,
      divider: true,
      close: false
    }]


  vm.latest = '-createDate'; // by default it should be order by date in descending order 
  vm.indexno = 1;

  function starfunc (item, index) { // pass sort object and index number 
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
        vm.Isascending = false;
        CheckFullArrayStatus(vm.orderby,vm.isAscending);

      } else if (item.id === "paymentStatus" || item.id == "status") {

        vm.prodSearch = null;
        item.upstatus == false; // hide current up icon
        item.downstatus = false; // hide current down icon
        vm.sortarr[vm.indexno].downstatus = false; // hide previous down icon
        vm.sortarr[vm.indexno].upstatus = false; // hide previous up icon
        vm.sortarr[vm.indexno].close = false; // hide previous close icon
        item.close = true;
        vm.indexno = index;

         getStatus(item.name, item.id);

      }else if(item.id == "Draft"){
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
            CheckFullArrayStatus(vm.orderby,vm.isAscending); 
          
          
        }
        if (item.downstatus) { 
          vm.orderby = item.id;
          vm.isAscending = false;          
            CheckFullArrayStatus(vm.orderby,vm.isAscending);
          
        }
      }
    }

   function CheckFullArrayStatus (orderby,Isascending){
    var whereClause;
              if (Isascending) 
            whereClause = "deleteStatus = 'false' order by "+orderby+", createDate DESC";
          else
            whereClause = "deleteStatus = 'false' order by "+orderby+" DESC, createDate DESC";          
          
        
        vm.pageObj = {
            service : 'invoice',
            method : 'getInvoiceSummaryByQuery',
            body : {
                "where": whereClause
            },
            orderby: '',
            isAscending : ''
        }

        $scope.$broadcast("getPageObj", vm.pageObj);
   }


   function getStatus(name,Isascending){
    var whereClause;
              if (Isascending) 
            whereClause = "deleteStatus = false AND invoiceStatus = '"+name+"' order by createDate DESC";
          else
            whereClause = "deleteStatus = false AND invoiceStatus = '"+name+"' order by createDate DESC";          
          
        
        vm.pageObj = {
            service : 'invoice',
            method : 'getInvoiceSummaryByQuery',
            body : {
                "where": whereClause
            },
            orderby: '',
            isAscending : ''
        }

        $scope.$broadcast("getPageObj", vm.pageObj);
   }

   function LoadDrafts(){
     var whereClause;
              // if (Isascending) 
            whereClause = "deleteStatus = false  order by createDate DESC";
          // else
          //   whereClause = "deleteStatus = false  order by createDate DESC";          
    vm.pageObj = {
            service : 'invoice',
            method : 'getDraftSummaryByQuery',
            body : whereClause,
            orderby: '',
            isAscending : ''
        }

        $scope.$broadcast("getPageObj", vm.pageObj);
   }

   function defaultCancel(item){
    vm.sortarr[vm.indexno].upstatus = false;
   vm.sortarr[vm.indexno].downstatus = false;
    item.close = false;    
        vm.orderby = "createDate",
        vm.isAscending = false;        
        CheckFullArrayStatus(vm.orderby,vm.isAscending);
   }

   function makePaymentMethords()
   {
      if(vm.inv == undefined || vm.settings.length == 0){return;}
        //Start make payment methord image list
                   if(vm.paymentMethords.length == 0)
                   {
                     var tempPayMethordsList = [];
                     
                     if(vm.inv.paymentMethod == 'stripe'){tempPayMethordsList.push(vm.inv.paymentMethod);}

                     
                     
                     //Start add activated payment methords
                     
                     for (var y = vm.settings[0].payments.length - 1; y >= 0; y--) {
                        //Start commented fo removing online payment methords for apps
                        /*if (vm.settings[0].payments[y].activate == true) {
                          if(vm.inv.paymentMethod == 'All Online Payment Options'){tempPayMethordsList.push(vm.settings[0].payments[y].name);}
                          if(vm.inv.paymentMethod == 'Allow online and offline' || vm.inv.paymentMethod == ""){tempPayMethordsList.push(vm.settings[0].payments[y].name);}
                        }*/
                        //End commented fo removing online payment methords for apps
                      }
                     //End add activated payment methords
                     
                     for (var p = 0; p < tempPayMethordsList.length; p++) {
                        vm.paymentMethords.push('/assets/payment/'+ tempPayMethordsList[p]+'.png');
                      }
                    }
          //End make payment methord image list
        }

       function LoadSettings(){
        var settings = $serviceCall.setClient("getAllByQuery","setting");
          settings.ifSuccess(function(data){
            vm.settings = data;
            makePaymentMethords();
            var profileData = data;
            vm.profData = {};
            vm.profData = profileData[0].profile;

            vm.ObjCompanyAddress = AddressService.setAddress(vm.profData.companyName,vm.profData.street,vm.profData.city,vm.profData.state,vm.profData.zip,vm.profData.country,vm.profData.phoneNo,"",vm.profData.fax,vm.profData.companyEmail,vm.profData.website);

            var tempates = profileData[0].templates;
            vm.defaultNOte = data[0].preference.invoicePref.defaultNote;
          if(data[0].profile.companyLogo){
            vm.companylogo = data[0].profile.companyLogo.imageUrl;
          }

          vm.showShipping = data[0].preference.invoicePref.displayShipAddress;
          vm.showbankdetails = data[0].preference.invoicePref.checkedOfflinePayments;
          vm.offlinePayments= data[0].preference.invoicePref.offlinePayments; 
          vm.offlinePayments = vm.offlinePayments;
          vm.offlinePayments= vm.offlinePayments.replace(/(?:\r\n|\r|\n)/g, '<br/>');
          console.log( vm.companylogo);
          checkTemplate(tempates);
          });
          settings.ifError(function(data){
          });
          settings.postReq({"setting":"profile,payments,templates","preference":"paymentPref,invoicePref"})

        }
            function checkTemplate(arr){
              vm.templateID = "1"; 
                if (Array.isArray(arr) && arr.length > 0) {        
                  for(var i=0; i<=arr.length -1; i++ ){
                    if (arr[i].activated === true && arr[i].type === "Invoice") {
                      vm.templateID = arr[i].templateID;
                    }
                  }
                }
            }
   
   function gotoRecurringProfile(){   debugger;     
             var passingDatarecurringPRofile = {
              Data: {
                    invoiceNo: vm.inv.invoiceNo,
                    profileID: vm.inv.profileID
                },
                appName: "invoice"
              };

             /*{
                itemID : vm.inv.invoiceNo,
                profileID : "invoices"
            }*/
            $state.go('app.invoices.Recurringcompose',passingDatarecurringPRofile);
        }

   function copyInvoice(){ debugger;
          Invoicecopy.setArr(vm.inv);
          vm.inv.notes = vm.inv.notes.replace(/<br\s*[\/]?>/gi, "\n")
          var stateparajson = {
                itemId : vm.inv.invoiceNo
            }
          $state.go('app.invoices.copy',stateparajson);
        }
        
  function cancelStatus(){
    if (vm.invSatus == "Unpaid") {

      var confirm = $mdDialog.confirm()
       .title('Do you wish to cancel this Invoice ' + $state.params.itemId + '? ')
       .content('This process is not reversible')
       .ariaLabel('Lucky day')
       .ok('Yes')
       .cancel('No');
   $mdDialog.show(confirm).then(function() {
    
        var Invoice = { "permissionType" : "add", "appName":"Invoices"};
        var jsonString = JSON.stringify(Invoice);

        var client =  $serviceCall.setClient("cancelInvoice","process");
       client.ifSuccess(function(data){
         vm.orderby = "createDate";
        vm.Isascending = false;
        CheckFullArrayStatus(vm.orderby,vm.isAscending);
        debugger;
        $mdToast.show(
            $mdToast.simple()
              .textContent('Invoice '+vm.inv.invoiceNo+' successfully cancelled')
              .position('top right' )
              .hideDelay(3000)
          );
        closeThread();
        //loadDetailView();
       });

       client.ifError(function(data){
        console.log("error loading setting data")
       })
       client.uniqueID($state.params.itemId); // send projectID as url parameters
       //client.GRNPattern("GRN0001");
        client.postReq(jsonString);
   })
   }else {
        $mdDialog.show(
           $mdDialog.alert()
           .parent(angular.element(document.body))
           .title('')
           .content('This invoice cannot be Cancelled')
           .ariaLabel('Alert Dialog Demo')
           .ok('OK')
       )
                       
    }
  }

  function enterPayment(val){
    $mdDialog.show({
        templateUrl: 'app/main/invoices/dialogs/addPayment/addPayment.html',
        controller: 'InvoicePaymentCtrl',
        controllerAs: 'vm',
        locals:{
            item : vm.inv,
            balanceDue : vm.calBalance,
            changeCurrency : vm.inv.changedCurrency,
            UnappliedAdvances : vm.UnappliedAdvances,
            settings : vm.settings
        }
    }).then(function(data){ 
        loadDetailView();
    }, function(data){

    })
  }

  // function toggleHistoryComments(compID){
  //   $mdSidenav(compID).toggle();
  // }

  function CopyAsRecurringProfile(){
    $state.go('app.invoices.Recurringcompose')
  }

  function sendReminder(item) { debugger;
        if (vm.invSatus != "Paid") {

            var client = $serviceCall.setClient("sendPaymentEmailReminderByInvoiceNo", "process");
            client.ifSuccess(function(data) {
                $mdToast.show(
                    $mdToast.simple()
                    .textContent('Payment reminder email successfully sent')
                    .position('top right')
                    .hideDelay(3000)
                );
            });
            client.ifError(function(data) {
                console.log("Failed to send the Payment Reminder Email")
                if (data.hasOwnProperty('data') && data.data.hasOwnProperty('customMessage') && data.data.customMessage != null && data.data.customMessage != "") {
                    $mdDialog.show(
                        $mdDialog.alert()
                        .parent(angular.element(document.body))
                        .content(data.data.customMessage)
                        .ariaLabel('Alert Dialog Demo')
                        .ok('OK')
                        .targetEvent()
                    );

                } else {
                    $mdDialog.show(
                        $mdDialog.alert()
                        .parent(angular.element(document.body))
                        .content('Failed to send the Payment Reminder Email')
                        .ariaLabel('Alert Dialog Demo')
                        .ok('OK')
                        .targetEvent()
                    );
                }
            })
            client.uniqueID($state.params.itemId); // send projectID as url parameters
            //client.GRNPattern("GRN0001");
            client.getReq();

        } else {
            $mdDialog.show(
                $mdDialog.alert()
                .parent(angular.element(document.body))
                .title('')
                .content('Cannot send a Payment Reminder Email for a Paid Invoice')
                .ariaLabel('Alert Dialog Demo')
                .ok('OK')
            )

        }
    }
  
  function creditNote(){
    if((vm.inv.invoiceStatus.toLowerCase() == "overdue" || vm.inv.invoiceStatus == "Unpaid" || vm.inv.invoiceStatus == "Partially Paid") && vm.inv.multiDueDates.length == 1)
    {
      var passingDatacreditNote = {
                Data: {
                    invoiceNo: vm.inv.invoiceNo,
                    profileID: vm.inv.profileID
                },
                appName: "invoice"
            }
    $state.go('app.creditnotes.compose',passingDatacreditNote);
    }
  }

  //load all the settings data
        function loadSettings(){
            var settings = $serviceCall.setClient("getAll","setting");
            settings.ifSuccess(function(data){
            });
            settings.ifError(function(data){

            });
            settings.postReq();
        }

  


    }
})();
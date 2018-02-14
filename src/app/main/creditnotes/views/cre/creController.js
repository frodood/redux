(function() {
  'use strict';
  angular
    .module('app.creditnotes')
    .controller('creController', creController);
  /** @ngInject */
  function creController($scope, $rootScope, $document, $stateParams,AddressService, $getPdf, $serviceCall, $mdToast, $mdDialog, $mdMedia, $mdSidenav, $state, Summary) {
    var vm = this,
        prefix,
        sequence;
        
    vm.contactColors = ['blue-bg', 'blue-grey-bg', 'orange-bg', 'pink-bg', 'purple-bg', 'green-bg', 'red-bg'];
    // vm.folders = Primary.data;
    // vm.labels = Secondary.data;
    vm.creditNoteSum = Summary.result;
    if (!vm.creditNoteSum) {
      vm.creditNoteSum = []
    }  

    LoadSettings();

    vm.ObjCompanyAddress = [];

    vm.toggleChildStates = toggleChildStates;

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

    vm.defaultCancel = defaultCancel;

    vm.loadDetailView = loadDetailView;

    vm.starfunc = starfunc;

    vm.emailCustomer = emailCustomer; 

    vm.DownloadPDF = DownloadPDF;

    vm.printPdf = printPdf; 

    vm.enterPayment = enterPayment; 

    vm.removeFilters = removeFilters; 

    vm.updatteStatus

    vm.latest = '-createDate'; // by default it should be order by date in descending order 

    vm.indexno = 1;

    vm.invSatus = "Unpaid";

    var page = 1;

    vm.loadingItems = true;

    vm.currentThread = null;

    vm.formatDate = formatDate;
    
    vm.selectedThreads = [];
    
    vm.creListSpinnerLoaded = creListSpinnerLoaded;
    
    function creListSpinnerLoaded(listSpinner){
      listSpinner.show('cre-list-spinner');
    }

    vm.pageObj = {
      service: 'creditNote',
      method: 'getCreditNoteSummaryByQuery',
      body: {
        "where": "deleteStatus = 'false' order by date DESC"
      },
      orderby: '',
      isAscending: true
    }
    vm.pageGap = 10;

    vm.primaryToolbarContext = true;

    vm.updatteStatus = updatteStatus;
    
    vm.formatDate = formatDate

    function formatDate(date){
      var dateOut = new Date(date);
      return dateOut;
    };

    init().loadSummary();
    /**
     * Initialize
     */
    function formatDate(date){
      var dateOut = new Date(date);
      return dateOut;
    };

    vm.appliedInvoices = appliedInvoices;

    function appliedInvoices(appliedInvoice){
      console.log(appliedInvoice);
      vm.appliedInvoiceRef = appliedInvoice.toString();
      console.log(vm.appliedInvoiceRef);
    }

    function updateStatusInView(creditNote,type){
        vm.creditNoteSum = vm.creditNoteSum.map(function( obj ) {
     
            if (obj.creditNoteNo === creditNote.creditNoteNo ) {
                if (type === 'cancel') {
                  obj.cancelStatus = true
                  obj.status = "Cancelled";
                }else if (type === 'delete') { 
                  obj.deleteStatus = true;
                }else{
                  obj.status = type;
                  obj.balance = creditNote.balance
                }
            } 
            return obj
        });
    }

    function updatteStatus(type){
      var status = type;
      var confirm =  $mdDialog.confirm()
          .title(status[0].toUpperCase() + status.slice(1) + ' credit note?')
          .content('This process is not reversible')
          .ariaLabel('Lucky day')
          .targetEvent()
          .ok('Yes')
          .cancel('No');
          $mdDialog.show(confirm).then(function() {   
            sendReq(type)
          })
    }

    function sendReq(type){
      var client;
      var status;

      if (type === 'cancel') { 
        client = $serviceCall.setClient("cancelCreditNote", "process");
        status = 'cancelled';
      }else if (type === 'delete') { 
        client = $serviceCall.setClient("deleteCreditNote", "process");
        status = 'deleted';
      }

      var jsonString = {"permissionType" : "add", "appName":"CreditNotes" };
      jsonString  = JSON.stringify(jsonString);
 
      client.ifSuccess(function(data) {  
        $mdToast.show(
          $mdToast.simple()
          .textContent('Credit Note '+vm.creditNote.creditNoteNo+' successfully ' + status)
          .position('top right')
          .hideDelay(3000)
        );
        closeThread();
        updateStatusInView(vm.creditNote,type)

      });
      client.ifError(function(data) {
        console.log("error loading setting data")
      })
      client.uniqueID(vm.creditNote.creditNoteNo); // send projectID as url parameters 
      client.postReq(jsonString);
    }
    function printPdf() {
      var client = $getPdf.setPdfClient('generatePDF', 'process');
      client.setUrl(vm.creditNote.creditNoteNo + '.pdf').uniqueID(vm.creditNote.creditNoteNo).class('creditNote').print();
    }

    function DownloadPDF() {
      var client = $getPdf.setPdfClient('generatePDF', 'process');
      client.setUrl(vm.creditNote.creditNoteNo + '.pdf').uniqueID(vm.creditNote.creditNoteNo).class('creditNote').download();
    }

    function init() {
      if ($state.current.name == "app.creditnotes.cre.detailView") {
        loadDetailView();
      }
      if ($state.current.name == "app.creditnotes.cre.detail") {
        loadDetailView();
      }
      var service = {
        loadSummary: loadSummary
      }
      return service;

      function loadSummary() {
        if (vm.creditNoteSum.length > 0) {
          // Load new threads
          for (var i = 0; i < vm.creditNoteSum.length; i++) {
            vm.creditNoteSum[i].date = new Date(vm.creditNoteSum[i].date);
            // Hide the loading screen
            vm.loadingItems = false;
          }
          // Open the thread if needed
          if ($state.params.itemId) {
            for (var i = 0; i < vm.creditNoteSum.length; i++) {
              if (vm.creditNoteSum[i].creditNoteNo === $state.params.itemId) {
                vm.openItem(vm.creditNoteSum[i]);
                break;
              }
            }
          }
        }
      }
    }

    function setPrimaryToolBar() { vm.primaryToolbarContext = !vm.primaryToolbarContext; };

    function toggleChildStates(toggledState) { $state.go(toggledState);  };

    function openItem(item) {
      // Set the read status on the item
      // item.read = true;
      setPrimaryToolBar();
      // Assign thread as the current thread
      vm.currentThread = item;
      $state.go('app.creditnotes.cre.detail', {
        itemId: item.creditNoteNo
      });
    }
    /**
     * Close thread
     */
    function closeThread() {
      vm.currentThread = null;
      setPrimaryToolBar();
      // location.reload();
      // Update the state without reloading the controller
      $state.go('app.creditnotes.cre');
      GetDataFromService({
        "where": "deleteStatus = 'false' order by createDate DESC"
      });
    }
    /**
     * Return selected status of the thread
     *
     * @param thread
     * @returns {boolean}
     */
    function isSelected(thread) { return vm.selectedThreads.indexOf(thread) > -1; }
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
      for (var i = 0; i < vm.creditNoteSum.length; i++) {
        if (angular.isUndefined(key) && angular.isUndefined(value)) {
          vm.selectedThreads.push(vm.creditNoteSum[i]);
          continue;
        }
        if (angular.isDefined(key) && angular.isDefined(value) && vm.creditNoteSum[i][key] === value) {
          vm.selectedThreads.push(vm.creditNoteSum[i]);
        }
      }
    }
    /**
     * Deselect threads
     */
    function deselectThreads() { vm.selectedThreads = []; }
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
      // Stop the propagation if event provided
      // This will stop unwanted actions on button clicks
      favouriteFunction(thread);
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

    function favouriteFunction(_obj) {
      if (_obj.favouriteStarNo == 1) {
        _obj.favouriteStarNo = 0;
      } else if (_obj.favouriteStarNo == 0) {
        _obj.favouriteStarNo = 1;
      }
      _obj.favouriteStar = !_obj.favouriteStar;
      _obj.tags = _obj.tag;
      _obj.productLog = {};

      var serviceObj = {
        "creditNote": _obj,
        "appName": 'CreditNotes',
        'permissionType': 'edit',
      }
      var ref = angular.copy(_obj.favouriteStar);
      var jsonString = JSON.stringify(serviceObj)
      var client = $serviceCall.setClient("updateCreditNote", "process");
      client.ifSuccess(function(data) {
        _obj.favouriteStar = ref;
        
      });
      client.ifError(function(data) {
        $mdDialog.show($mdDialog.alert().parent(angular.element(document.body)).content('Error Occure while Adding to Favourite').ariaLabel('').ok('OK').targetEvent(data));
      })
      client.postReq(jsonString);
    }

    function GetDataFromService(val) {
      vm.pageObj = {
        service: 'creditNote',
        method: 'getCreditNoteSummaryByQuery',
        body: val,
        orderby: '',
        isAscending: ''
      }
      $scope.$broadcast("getPageObj", vm.pageObj);
    }

    function favouriteInvoices() {
      GetDataFromService({
        "where": "deleteStatus = false and favouriteStar=true order by lastTranDate DESC"
      });
    } 

    function removeFilters() {
      vm.orderby = "createDate",
      vm.isAscending = false;
      CheckFullArrayStatus(vm.orderby, vm.isAscending);
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
      name: "Date",
      id: "Date",
      upstatus: false,
      downstatus: false,
      divider: true,
      close: false
    }, {
      name: "Credit Note No",
      id: "creditNoteNo",
      upstatus: false,
      downstatus: false,
      divider: true,
      close: false
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
      name: "Invoice Ref",
      id: "invoiceRefNo",
      upstatus: false,
      downstatus: false,
      divider: true,
      close: false
    },// {
    //   name: "Balance Due",
    //   id: "balance",
    //   upstatus: false,
    //   downstatus: false,
    //   divider: true,
    //   close: false
    // }, 
    {
      name: "Balance",
      id: "balance",
      upstatus: false,
      downstatus: false,
      divider: true,
      close: false
    }, {
      name: "Unapplied",
      id: "status",
      upstatus: false,
      downstatus: false,
      divider: true,
      close: false
    }, {
      name: "Partially Applied",
      id: "status",
      upstatus: false,
      downstatus: false,
      divider: true,
      close: false
    }, {
      name: "Fully Applied",
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
        vm.Isascending = false;
        CheckFullArrayStatus(vm.orderby, vm.isAscending);
      } else if (item.id == "status") {
        vm.prodSearch = null;
        item.upstatus == false; // hide current up icon
        item.downstatus = false; // hide current down icon
        vm.sortarr[vm.indexno].downstatus = false; // hide previous down icon
        vm.sortarr[vm.indexno].upstatus = false; // hide previous up icon
        vm.sortarr[vm.indexno].close = false; // hide previous close icon
        item.close = true;
        vm.indexno = index;
        getStatus(item.name, item.id);
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

    function CheckFullArrayStatus(orderby, Isascending) {
      var whereClause;
      if (Isascending)
        whereClause = "deleteStatus = 'false' order by " + orderby + ", createDate DESC";
      else
        whereClause = "deleteStatus = 'false' order by " + orderby + " DESC, createDate DESC";
      vm.pageObj = {
        service: 'creditNote',
        method: 'getCreditNoteSummaryByQuery',
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
      // if (Isascending) {
      //   whereClause = "deleteStatus = false order by CASE WHEN status = '" + name + "' THEN 1  ELSE 2 END, createDate DESC";
      // } else {
      //   whereClause = "deleteStatus = false order by CASE WHEN status = '" + name + "' THEN 1  ELSE 2 END, createDate DESC";
      // }

      whereClause = "deleteStatus = false AND status = '"+name+"' order by createDate DESC";
   
      vm.pageObj = {
        service: 'creditNote',
        method: 'getCreditNoteSummaryByQuery',
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
      whereClause = "deleteStatus = false  order by createDate DESC";
      vm.pageObj = {
        service: 'invoice',
        method: 'getCreditNoteSummaryByQuery',
        body: whereClause,
        orderby: '',
        isAscending: ''
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

    function loadDetailView(updateStatus) {
       if ($state.params.itemId && $state.params.itemId !== "") {
            vm.currentThread = "assas"
            vm.primaryToolbarContext = false; 
        }else if ($state.params.Data && $state.params.Data.creditNoteID) {              
            vm.currentThread = "assas"
            vm.primaryToolbarContext = false;
            $state.params.itemId = $state.params.Data.creditNoteID;
            var obj = {'creditNoteNo' :$state.params.Data.creditNoteID  }
            vm.openItem(obj) 
        }
      var Invoice = {
        "permissionType": "add",
        "appName": "CreditNotes"
      };
      var jsonString = JSON.stringify(Invoice);
      var client = $serviceCall.setClient("getCreditNoteByKey", "process");
      client.ifSuccess(function(data) {
        var data = data;
        vm.creditNote = data;
        vm.creditNote.exchangeRate = (vm.creditNote.exchangeRate === "") ? 1 : vm.creditNote.exchangeRate; 
        setAddress()
        if (updateStatus) {
          updateStatusInView(vm.creditNote,vm.creditNote.status)
        }
      });
      client.ifError(function(data) {
        console.log("error loading invoice data")
      })
      client.uniqueID($state.params.itemId); // send projectID as url parameters
      client.postReq(jsonString);
    }


    function LoadSettings() {
      var settings = $serviceCall.setClient("getAllByQuery", "setting");
      settings.ifSuccess(function(data) {
        var profileData = data;
        vm.profData = {};
        vm.profData = profileData[0].profile;
        vm.baseCurrency = vm.profData.baseCurrency; 
        console.log(vm.profData.profile)
        var tempates = profileData[0].templates;
        vm.defaultNOte = data[0].preference.invoicePref.defaultNote;
        if (data[0].profile.companyLogo) {
          vm.companylogo = data[0].profile.companyLogo.imageUrl;
        }
        prefix = data[0].preference.creditNotePref.creditNotePrefix;
        sequence = data[0].preference.creditNotePref.creditNoteSequence;


        vm.showShipping = data[0].preference.invoicePref.displayShipAddress
        vm.showbankdetails = data[0].preference.invoicePref.checkedOfflinePayments;
        vm.offlinePayments = data[0].preference.invoicePref.offlinePayments; 
        checkTemplate(tempates);
      });
      settings.ifError(function(data) {});
      settings.postReq({
        "setting": "profile,templates",
        "preference": "creditNotePref,invoicePref"
      })
    }

    function setAddress(){
        vm.ObjCompanyAddress = AddressService.setAddress( vm.profData.companyName, vm.profData.street, vm.profData.city, vm.profData.state, vm.profData.zip, vm.profData.country, vm.profData.phoneNo,"", vm.profData.fax, vm.profData.companyEmail, vm.profData.website);       
        vm.ObjCusAddress = AddressService.setAddress(vm.creditNote.profileName,vm.creditNote.billingAddress.street,vm.creditNote.billingAddress.city,vm.creditNote.billingAddress.state,vm.creditNote.billingAddress.zip,vm.creditNote.billingAddress.country,vm.creditNote.contactNo,vm.creditNote.mobileNo,"",vm.creditNote.email,"");
        vm.creditNote.pattern = prefix + sequence;
        removeAdditionalCust();
    }

    function removeAdditionalCust(){ 
      var i = vm.creditNote.customFields.length
      while (i--) {
        if(!vm.creditNote.customFields[i].hasOwnProperty('value')){
          vm.creditNote.customFields.splice(i,1)
        }
      } 
    }


    function checkTemplate(arr) {
      vm.templateID = "1";
      if (Array.isArray(arr) && arr.length > 0) {
        for (var i = 0; i <= arr.length - 1; i++) {
          if (arr[i].activated === true && arr[i].type === "Invoice") {
            vm.templateID = arr[i].templateID;
          }
        }
      }
    } 

    function emailCustomer() {
      $mdDialog.show({
        templateUrl: 'app/main/creditnotes/dialogs/email/email.html',
        controller: 'emailCtrlCre',
        controllerAs: 'vm',
        locals: {
          item: vm.creditNote,
          profData : vm.profData
        }
      }).then(function(data) {}, function(data) {})
    }

    function enterPayment(){ 
      $mdDialog.show({
        templateUrl: 'app/main/creditnotes/dialogs/payment/payment.html',
        controller: 'creditPayment',
        controllerAs: 'vm',
        locals: {
          item: vm.creditNote
        }
      }).then(function(data) { 
        refreshActivity(function(){
          loadDetailView(true)
        });
      }, function(data) {})
    }

    function refreshActivity(callback) {
      console.log("refreshActivity")
      $rootScope.$broadcast('rfrshAcH', {
          data: 'doupdate'
      });
      callback()
    }
  }
})();

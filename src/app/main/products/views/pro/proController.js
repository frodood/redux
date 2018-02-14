(function ()
{
    'use strict';

    angular
        .module('app.products')
        .controller('proController', invController);

    /** @ngInject */
    function invController($scope, $rootScope, $document, $mdDialog, $mdMedia, $mdSidenav, $state, msApi, productSummary,$serviceCall,$mdToast,$mdPanel,$apis,$setUrl,$auth)
    {
        var vm = this;

        vm.contactColors = ['blue-bg', 'blue-grey-bg', 'orange-bg', 'pink-bg', 'purple-bg', 'green-bg', 'red-bg'];

        var loginName = ($auth.getSession()) ? $auth.getSession().Name : "";
        var userName =  ($auth.getUserName()) ? $auth.getUserName() : "";
         /*
            @desc paging data    
        */
 
        vm.pageObj = {
            service : 'product',
            method : 'getProductSummaryByQuery',
            body : {
                "appName":"Products", "permissionType":"add", "where":"deleteStatus = 'false' order by createDate DESC"
            },
            orderby: '',
            isAscending : ''
        }
        vm.pageGap = 10;

        vm.sortArr = [{
          name: "Starred"
          , id: "favouriteStarNo"
          , src: "img/ic_grade_48px.svg"
          , upstatus : false
          , downstatus : false
          , divider: true,
          close: false
        },{
          name: "Product Name"
          , id: "productName"
          , src: "img/ic_add_shopping_cart_48px.svg"
          , upstatus : false
          , downstatus : false
          , divider: false,
          close: false
        }, {
          name: "Product Code"
          , id: "productCode"
          , src: "img/ic_add_shopping_cart_48px.svg"
          , upstatus : false
          , downstatus : false
          , divider: false,
          close: false
        }, {
          name: "Price"
          , id: "productPrice"
          , src: "img/ic_add_shopping_cart_48px.svg"
          , upstatus : false
          , downstatus : false
          , divider: true,
          close: false
        }, {
          name: "Active"
          , id: "status"
          , src: "img/ic_add_shopping_cart_48px.svg"
          , upstatus : false
          , downstatus : false
          , divider: false,
          close: false
        }, {
          name: "Inactive"
          , id: "status"
          , src: "img/ic_add_shopping_cart_48px.svg"
          , upstatus : false
          , downstatus : false
          , divider: false,
          close: false
        }];  

        
        // vm.productSummary = productSummary.result;
        // addLatestImage(vm.productSummary);
 
        $scope.$watch('vm.productSummary',function(){ 
          var item = localStorage.getItem('imgData');
          item = (item) ? JSON.parse(item) : "";
         
          if (item !== "") {
            var key = Object.keys(item)[0];
            if (vm.productSummary && vm.productSummary.length > 0) {
              for(var i=0; i<=vm.productSummary.length-1; i++){
                if (vm.productSummary[i].productID === key ) {
                  var base64 = item[key];
                  vm.productSummary[i].firstImage =   base64;
                  localStorage.removeItem('imgData');
                  break;
                }
              }
            }                        
          }
        })

        $scope.$watch('vm.imageCode',function(){ 
          var item = localStorage.getItem('imgEditData');
          item = (item) ? JSON.parse(item) : ""; 

          if (item !== "") {
            var key = Object.keys(item)[0];
            if (vm.imageCode) {
              var base64 = item[key];
              vm.imageCode =   base64;
              localStorage.removeItem('imgEditData'); 
            }                        
          }
        })

        if (!vm.productSummary) {
          vm.productSummary = [];
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

        vm.defaultCancel = defaultCancel;

        vm.starfunc = starfunc;

        vm.indexno = 0;

        vm.orderby = "createDate",
        
        vm.isAscending = false;

        vm.favouriteFunction = favouriteFunction;

        vm.singleStarSort = singleStarSort;

        vm.singleCancelSort = singleCancelSort;

        vm.singleActiveSort = singleActiveSort;

        vm.imagePannel = imagePannel;

        vm.closeImgPanel = closeImgPanel;

        vm.loadFullProducts = loadFullProducts;

        vm.changeStatus = changeStatus;

        vm.editProduct = editProduct;

        vm.copyProduct = copyProduct;

        vm.deleteProduct = deleteProduct;

        vm.viewBrochure = viewBrochure;

        vm.printPDF = printPDF;

        vm.sortAll = sortAll;

        vm.sendMail = sendMail;

        vm.hostUrl = $apis.getHost();

        var mdPanel = $mdPanel;

        vm.proListSpinnerLoaded = proListSpinnerLoaded;

        function proListSpinnerLoaded(listSpinner){
            listSpinner.show('pro-list-spinner');
        }
 

        function getImgUrl(){
            return '/apis/media/tenant/twelthdoor/'
        }


        //////////

        init();

        /**
         * Initialize
         */
        function init()
        {
            if($state.current.name === 'app.products.pro.detail') 
              loadFullProducts();  
        }

        function deleteProduct(){
          var confirm = $mdDialog.confirm()
            .title('Delete product?')
            .content('This process is not reversible')
            .targetEvent()
            .ok('Delete')
            .cancel('Cancel');
          $mdDialog.show(confirm).then(function() {
              vm.fullProduct.deleteStatus = true;  
              var jsonString = JSON.stringify(vm.fullProduct)
              var client = $serviceCall.setClient('update','product');
              client.ifSuccess(function(data){
                $mdToast.show(
                  $mdToast.simple()
                    .textContent('Product successfully deleted.')
                    .position('top right' )
                    .hideDelay(3000)
                );
                updateStatusInView(vm.fullProduct.productID,vm.fullProduct.deleteStatus,'delete');
                closeThread();
              });
              client.ifError(function(data){
                $mdDialog.show(
                  $mdDialog.alert()
                  .parent(angular.element(document.body))
                  .title('Error')
                  .content('Error occur while deleting the product')
                  .ariaLabel('')
                  .ok('OK')
                  .targetEvent()
                  );
                vm.fullProduct.deleteStatus = false;
              });
              client.postReq(jsonString)              
        
          }, function() {});  
        }
        function loadAllProducts(orderby,isAscending){

            var whereClause;

            if (orderby == "" || orderby == "createDate")
                whereClause = "deleteStatus = 'false' order by createDate DESC";
            else{
                if (isAscending) 
                    whereClause = "deleteStatus = 'false' order by "+orderby+", createDate DESC";
                else
                    whereClause = "deleteStatus = 'false' order by "+orderby+" DESC, createDate DESC";                
            }

            vm.pageObj = {
                service : 'product',
                method : 'getProductSummaryByQuery',
                body : {
                    "appName":"Products", "permissionType":"add", "where":whereClause
                },
                orderby: '',
                isAscending : ''
            }

            $scope.$broadcast("getPageObj", vm.pageObj)

        }

        function statusFilter(whereClause){

             vm.pageObj = {
                service : 'product',
                method : 'getProductSummaryByQuery',
                body : whereClause,
                orderby: '',
                isAscending : ''
            }

            $scope.$broadcast("getPageObj", vm.pageObj)

        }

        function defaultCancel(item){ // pass sort array object when cancel icon click
          vm.sortArr[vm.indexno].upstatus = false;
          vm.sortArr[vm.indexno].downstatus = false;
          item.close = false; 
          vm.indexno = 1; 

          vm.orderby = "createDate",
          vm.isAscending = false;
          loadAllProducts(vm.orderby,vm.isAscending); 
        }

        function sortAll(){
          vm.orderby = "createDate",
          vm.isAscending = false;
          loadAllProducts(vm.orderby,vm.isAscending); 
        }

        function starfunc(item,index) { // pass sort object and index numbr 

          if (item.id === "favouriteStarNo") {   
            item.upstatus == false;
            item.downstatus = false;
            vm.sortArr[vm.indexno].upstatus = false;
            vm.sortArr[vm.indexno].downstatus = false;
            vm.sortArr[vm.indexno].close = false;
            item.close = true;
            vm.indexno = index;

            vm.orderby = "favouriteStar";
            vm.isAscending = false;
            loadAllProducts(vm.orderby,vm.isAscending); 
            // SortStarFunc();

          }else if(item.id === "status"){
            item.upstatus == false;     // hide current up icon
            item.downstatus = false;    // hide current down icon
            vm.sortArr[vm.indexno].downstatus = false;  // hide previous down icon
            vm.sortArr[vm.indexno].upstatus = false;    // hide previous up icon
            vm.sortArr[vm.indexno].close = false;       // hide previous close icon
            item.close = true;
            vm.indexno = index;
            // vm.CheckFullArrayStatus(item.name, item.id);
            if (item.name == "Active") {
            //   vm.orderby = "status";
            //   vm.isAscending = true;
            //   loadAllProducts(vm.orderby,vm.isAscending);
                statusFilter({
                            "where": "deleteStatus = 'false' and status = 'Active' order by createDate DESC"
                }); 
            }else if (item.name == "Inactive") {
            //   vm.orderby = "status";
            //   vm.isAscending = false;
            //   loadAllProducts(vm.orderby,vm.isAscending); 
                statusFilter({
                            "where": "deleteStatus = 'false' and status = 'Inactive' order by createDate DESC"
                }); 
            }

          }else{
            if (item.upstatus == false && item.downstatus == false) {
              item.upstatus = !item.upstatus;
              item.close = true;
              if (vm.indexno != index) {
                vm.sortArr[vm.indexno].upstatus = false; // hide previous up icon
                vm.sortArr[vm.indexno].downstatus = false; // hide previous down icon
                vm.sortArr[vm.indexno].close = false; // hide previous close icon
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
              loadAllProducts(vm.orderby,vm.isAscending); 
            }
            if (item.downstatus) {
              vm.orderby = item.id;
              vm.isAscending = false;
              loadAllProducts(vm.orderby,vm.isAscending); 
            }
          }
        }

        function singleStarSort(){        
            var whereClause = "deleteStatus = false and favouriteStar=true order by lastTranDate DESC"
            vm.pageObj = {
                service : 'product',
                method : 'getProductSummaryByQuery',
                body : {
                    "appName":"Products", "permissionType":"add", "where":whereClause
                },
                orderby: '',
                isAscending : ''
            }

            $scope.$broadcast("getPageObj", vm.pageObj)
        }
        function singleCancelSort(){
            var whereClause = "deleteStatus = 'false' and status = 'Inactive' order by lastTranDate DESC "
            vm.pageObj = {
                service : 'product',
                method : 'getProductSummaryByQuery',
                body : {
                    "appName":"Products", "permissionType":"add", "where":whereClause
                },
                orderby: '',
                isAscending : ''
            }
            $scope.$broadcast("getPageObj", vm.pageObj)
        }

        function singleActiveSort(){
            var whereClause = "deleteStatus = 'false' and status = 'Active' order by lastTranDate DESC "
            vm.pageObj = {
                service : 'product',
                method : 'getProductSummaryByQuery',
                body : {
                    "appName":"Products", "permissionType":"add", "where":whereClause
                },
                orderby: '',
                isAscending : ''
            }
            $scope.$broadcast("getPageObj", vm.pageObj)
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
            _obj.favouriteStar = !_obj.favouriteStar;
            _obj.tags = _obj.tag; 
            _obj.productLog = {};

           
            var jsonString = JSON.stringify(_obj) 

            var client =  $serviceCall.setClient("update","product");
            client.ifSuccess(function(data){ 
            });
            client.ifError(function(data){
                $mdDialog.show($mdDialog.alert().parent(angular.element(document.body)).content('Error Occure while Adding to Favourite').ariaLabel('').ok('OK').targetEvent(data));
            })
            client.postReq(jsonString);
        }

        function imagePannel(_uniqueCode){
            var position = mdPanel.newPanelPosition();
                position
                    .absolute()
                    .center()
                    .center(); 

            var config = { 
                attachTo: angular.element(document.body),
                controller: pannelCtrl, 
                templateUrl: 'app/main/products/views/pro/list/imgPanel.html',
                panelClass: 'demo-dialog-example',
                position: position,
                trapFocus: true,
                controllerAs: 'vm',
                zIndex: 150,
                clickOutsideToClose: true,
                clickEscapeToClose: true,
                hasBackdrop: true,
                locals : {
                    uniqueCode : _uniqueCode,
                    host : $apis.getHost()
                }
            };

            mdPanel.open(config);
        }

        function closeImgPanel(){

        }

        function pannelCtrl($scope,uniqueCode,host){
            var vm = this;
            vm.uniqueCode = uniqueCode;
            vm.host = host + '/apis/media/tenant/twelthdoor/' + uniqueCode;
            console.log(vm.host)
        }

        function editProduct(){
          $state.go('app.products.edit', {
            'itemID': $state.params.itemID
          });
        }
        function copyProduct(){
          $state.go('app.products.copy', {
            'itemID': $state.params.itemID
          });
        }

        function setPrimaryToolBar(){
            vm.primaryToolbarContext = !vm.primaryToolbarContext;
        };

        function toggleChildStates(toggledState){
            $state.go(toggledState);
        };

        function updateStatusInView(productID,status,type){
            vm.productSummary = vm.productSummary.filter(function( obj ) {
                if (type === 'cancel') {                  
                  if (obj.productID === productID ) {
                      obj.status = status
                  }
                }else{
                  if (obj.productID === productID ) {
                      obj.deleteStatus = status
                  }
                }
                return obj
            });
        };

        function openItem(item)
        {
            // Set the read status on the item
            // item.read = true;

            setPrimaryToolBar();

            // Assign thread as the current thread
            vm.currentThread = item;

            $state.go('app.products.pro.detail', {itemID: item.productCode});

            $scope.$on('$stateChangeSuccess',
                function onStateSuccess(event, toState, toParams, fromState) {
                  loadFullProducts();
                }
            );
        }

        /**
         * Close thread
         */
        function closeThread()
        {
            vm.currentThread = null;

            setPrimaryToolBar();

            // Update the state without reloading the controller
            $state.go('app.products.pro');
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

            for ( var i = 0; i < vm.productSummary.length; i++ )
            {
                if ( angular.isUndefined(key) && angular.isUndefined(value) )
                {
                    vm.selectedThreads.push(vm.productSummary[i]);
                    continue;
                }

                if ( angular.isDefined(key) && angular.isDefined(value) && vm.productSummary[i][key] === value )
                {
                    vm.selectedThreads.push(vm.productSummary[i]);
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



        function loadFullProducts(){
            vm.detailProgress = true;
            vm.disableBrochure = true;

            if ($state.params.itemID) {
                vm.currentThread = "assas"
                vm.primaryToolbarContext = false;
            }
            vm.productCode = $state.params.itemID 

            var client =  $serviceCall.setClient("getAllByQuery","product");
            client.ifSuccess(function(data){
              var data = data.result
                if (ifArray(data)) {                    
                    vm.fullProduct = data[0]; 
                    vm.primaryToolbarContext = false;
                    vm.detailProgress = false;
                    vm.currentThread = vm.fullProduct;
                    extractImage()
                };
                
            });
            client.ifError(function(data){
                console.log("error loading full product data")
            })                
            client.postReq({
              'where' : "productCode = '"+vm.productCode+"' "
            });
        }

        function extractImage(){
          vm.imageCode = "";
          if (vm.fullProduct.uploadImages.length > 0) {            
            vm.imageCode =   $setUrl.imagePath + 'product/'+ vm.fullProduct.uploadImages[0].uniqueCode; 
          }
          if(!$scope.$$phase) {
            $scope.$apply()
          }
          checkStatu()
        }

        function checkStatu(){
          vm.proStatus = (vm.fullProduct.status === 'Active') ? true : false;
          brochureCisible();
        }

        function brochureCisible(){
            if (vm.fullProduct.uploadBrochure.length > 0) {            
               vm.disableBrochure = false;
            }
                
        }

        function changeStatus(){
          vm.fullProduct.status = (vm.proStatus) ? 'Active' : 'Inactive';

          var serviceObj = {
            "product" : vm.fullProduct,
            "image" : vm.fullProduct.uploadImages,
            "appName" : 'Products',
            'permissionType' : 'edit',
            "inventoryEnabled" : {
              "inventoryEnabled" : vm.fullProduct.inventory
            },
            'invSequence' :''
          }
          var jsonString = JSON.stringify(serviceObj)

          var client =  $serviceCall.setClient("updateProduct","process"); // method name and service
          client.ifSuccess(function(data){
            var msg = (vm.proStatus) ? "Product status changed to active." : 'Product status changed to inactive'; 
            $mdToast.show(
                $mdToast.simple()
                  .textContent(msg)
                  .position('top right')
                  .hideDelay(3000)
            );

            updateStatusInView(vm.fullProduct.productID,vm.fullProduct.status,'cancel');
            refreshActivity();
            
          })
          client.ifError(function(data){
           $mdDialog.show(
                  $mdDialog.alert()
                  .parent(angular.element(document.body))
                  .content('There was an error editing the data.')
                  .ariaLabel('Alert Dialog Demo')
                  .ok('OK')
                  .targetEvent(data)
              );
          })
          
          client.postReq(jsonString);
        }

        function refreshActivity() {
          $rootScope.$broadcast('rfrshAcH', {
              data: 'doupdate'
          });
        }


        function viewBrochure(){
            var url; 
            if (vm.fullProduct.uploadBrochure.length > 0) {            
                url = $setUrl.brochurePath + 'product/' + vm.fullProduct.uploadBrochure[0].uniqueCode; 
            }
            window.open(url,'_blank');
        }

        function printPDF(){
           html2canvas($('#pdfView'), {
                onrendered: function (canvas) {
                  var imgData = canvas.toDataURL('image/jpeg');              
                  var options = {
                    orientation: "0",
                    unit: "px",
                    format: "a4"
                  };
                  var doc = new jsPDF(options, '', '', '');
                  console.log(doc.internal.pageSize.height);
                  console.log(doc.internal.pageSize.width);

                  var count = 0;
                  while (doc.internal.pageSize.height > count) {
                    count += 150;
                    doc.addPage();
                  }
                  doc.addImage(imgData, 'jpeg', 0, 0, doc.internal.pageSize.width, doc.internal.pageSize.height); 
                  doc.output('dataurlnewwindow');
                },
                width: 1320,
                height : 892
            });
        }

        function ifArray(arr){
          if (Array.isArray(arr) && arr.length > 0) 
            return true;
          else
            return false;
        }

        function sendMail(){
          $mdDialog.show({
            controller: 'emailControllerPro',
            controllerAs : 'vm',
            templateUrl: 'app/main/products/dilaogs/email/email.html',
            parent: angular.element(document.body),
            clickOutsideToClose:true,
            locals:{
              proCode : vm.fullProduct.productCode
            }
          })
        }
    }
})();

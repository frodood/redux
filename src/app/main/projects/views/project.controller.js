(function ()
{
    'use strict';

    angular
        .module('app.projects')
        .controller('ProjectsController', ProjectsController);

    /** @ngInject */
    function ProjectsController($scope,$state,$serviceCall,$setUrl,settingSummary,$mdDialog,$mdToast,$getPdf)
    {


        var vm = this;

        vm.catchName = "proTimer"; 

        vm.contactColors = ['blue-bg', 'blue-grey-bg', 'orange-bg', 'pink-bg', 'purple-bg', 'green-bg', 'red-bg'];

        vm.primaryToolbarContext = true;

        vm.toggleChildStates = toggleChildStates;

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

        vm.changeTab = changeTab;

        vm.editTimesheet = editTimesheet;

        vm.sendMail = sendMail;

        vm.sortAll = sortAll;

        vm.sortAllTime = sortAllTime;

        vm.starfunc = starfunc;

        vm.indexno = 1;

        vm.singleActiveSort = singleActiveSort;

        vm.singleStarSortTime = singleStarSortTime;

        vm.singleStarSortPro = singleStarSortPro;

        vm.defaultCancel = defaultCancel;

        vm.projectEdit = projectEdit;

        vm.changeStatus = changeStatus;

        vm.deleteProject = deleteProject;

        vm.DownloadPDF = downloadPdf;

        vm.goToEdit = goToEdit;

        vm.projectListSpinnerLoaded = projectListSpinnerLoaded;

        function projectListSpinnerLoaded(detailSpinner){
            detailSpinner.show('project-list-spinner');

        }

        vm.timesheetListSpinnerLoaded= timesheetListSpinnerLoaded;

        function timesheetListSpinnerLoaded(timedetailSpinner){
            timedetailSpinner.show('timesheet-list-spinner');
        }

        function goToEdit(item){ 
            $state.go('app.projects.timeEdit',{'itemID' : item.timesheetID})
        }

        function downloadPdf() {
          var client = $getPdf.setPdfClient('generatePDF', 'process');
          client.setUrl(vm.project.projectID + '.pdf').uniqueID(vm.project.projectID).class('project').download();
        }

        function printPdf() {    
            var client = $getPdf.setPdfClient('generatePDF', 'process');
            client.setUrl(vm.fullPayment.receiptID + '.pdf').uniqueID(vm.fullPayment.receiptID).class('payment').print();
        }

        function deleteProject(){
            var confirm = $mdDialog.confirm()
                .title('Would you like to Delete your Project ?')
                .content('Your Project Will Be Delete Permanently')
                .targetEvent()
                .ok('Delete')
                .cancel('Cancel');
              $mdDialog.show(confirm).then(function() {                  
                    vm.project.projectStatus = "delete";
                    updatePro("Deleted","delete"); 
              }, function() {});  

        }

        function changeStatus(){

            if (vm.status === "Active") {
                vm.project.projectStatus = "Active"
                vm.status = "Inactive"
            }else if(vm.status === "Inactive"){
                vm.status = "Active"
                vm.project.projectStatus = "Inactive"
            }
            updatePro("change the status",vm.project.projectStatus);
        }

        function updatePro(type,status){            
            var serviceObj = {
                "project" : vm.project,
                "image" : vm.project.uploadImage,
                "appName" : "Projects",
                "permissionType" : "edit"
            } 
            var client =  $serviceCall.setClient("update","project");
            client.ifSuccess(function(data){ 
                if (data.statusCode == 200) {
                    $mdToast.show(
                      $mdToast.simple()
                        .textContent('Successfully '+ type)
                        .position('top right' )
                        .hideDelay(3000)
                    );
                    closeThread();
                    updateStatusInView(vm.project.projectID,status)
                    $state.go("app.projects.pro")

                }
            });
            client.ifError(function(data){              
                $mdDialog.show(
                      $mdDialog.alert()
                      .parent(angular.element(document.body))
                      .title('Error')
                      .content('Error Occur While proforming the action. Please try again later.')
                      .ariaLabel('')
                      .ok('OK')
                      .targetEvent()
                      );
            })
            client.postReq(serviceObj); 
        }

        function updateStatusInView(projectID,status){
            vm.projectSummary = vm.projectSummary.filter(function( obj ) {
                if (obj.projectID === projectID ) {
                    obj.projectStatus = status
                }
                return obj
            });
        };

        function projectEdit(){
             $state.go('app.projects.projEdit',{itemID:vm.project.projectID}); 
        }

        function sortAll(){
          vm.orderby = "createDate",
          vm.isAscending = false;
          loadAllProjects(vm.orderby,vm.isAscending); 
        }

        function sortAllTime(){
          vm.orderby = "createDate",
          vm.isAscending = false;
          loadAllTimesheets(vm.orderby,vm.isAscending); 
        } 

        function editTimesheet(){ 
            $state.go('app.projects.timeEdit',{itemID :  vm.timesheet.timesheetID})
        }

        vm.pageObj = {
            service : 'project',
            body : '',
            orderby: '',
            isAscending : ''
        }

        vm.pageGap = 10;

        function checkState(){ 
            vm.indexno = 1;
            switch($state.current.name){
                case 'app.projects.pro' : 
                    vm.pageObj.method = 'getProjectSummaryByCurrentUser';   
                    vm.tabIndex = 0; 
                    setSortArrProject() 
                    vm.addHueClass = true;
                    loadAllProjects('createDate',false);               
                    break;
                case 'app.projects.timesheet' :
                    vm.pageObj.method = 'getTimeSheetSummaryByCurrentUser';  
                    vm.tabIndex = 1;   
                    setSorArrTimesheet() 
                    vm.addHueClass = false;   
                    loadAllTimesheets('date',false);          
                    break;
                case 'app.projects.pro.detail':
                    vm.pageObj.method = 'getProjectSummaryByCurrentUser';   
                    vm.tabIndex = 0; 
                    loadFullProject();
                    break;
                case 'app.projects.timesheet.detail':
                    vm.pageObj.method = 'getTimeSheetSummaryByCurrentUser';   
                    vm.tabIndex = 1; 
                    loadFullTimesheet();
                    break;
                default : 
                    console.log("not a valid status");
            }
        }

        function changeTab(type){
            switch(type){
                case 'timesheet' :  
                    toggleChildStates('app.projects.timesheet');
                    break;
                case 'project' : 
                    toggleChildStates('app.projects.pro');
                    break;

                default : 
                    console.log('invalid tab index ' + inv);
            }
        }

        function loadAllProjects(orderby,isAscending){

            var whereClause;

            if (orderby == "" || orderby == "createDate"){
                if (isAscending) 
                    whereClause = "AND projectStatus <> 'delete' order by createDate";
                else
                    whereClause = "AND projectStatus <> 'delete' order by createDate DESC";
            }
            else{
                if (isAscending) 
                    whereClause = "AND projectStatus <> 'delete' order by "+orderby+", createDate DESC";
                else
                    whereClause = "AND projectStatus <> 'delete' order by "+orderby+" DESC, createDate DESC";                
            }

            vm.pageObj = {
                service : 'project',
                method : 'getProjectSummaryByCurrentUser',
                body : {"where" : whereClause},
                orderby: '',
                isAscending : ''
            }

            $scope.$broadcast("getPageObj", vm.pageObj)
        }

        function loadAllTimesheets(orderby,isAscending){
            var whereClause;

            if (orderby == "" || orderby == "date")
                whereClause = "order by createDate DESC";
            else{
                if (isAscending) 
                    whereClause = "order by "+orderby+", createDate DESC";
                else
                    whereClause = "order by "+orderby+" DESC, createDate DESC";                
            }

            vm.pageObj = {
                service : 'project',
                method : 'getTimeSheetSummaryByCurrentUser',
                body : {"where" : whereClause},
                orderby: '',
                isAscending : ''
            }

            $scope.$broadcast("getPageObj", vm.pageObj)
        }

        function getStatusPro(name, Isascending) {
            var whereClause;
            if (Isascending) {
                whereClause = "AND projectStatus <> 'delete' order by CASE WHEN projectStatus = '" + name + "' THEN 1  ELSE 2 END, createDate DESC";
            } else {
                whereClause = "AND projectStatus <> 'delete'  order by CASE WHEN projectStatus = '" + name + "' THEN 1  ELSE 2 END, createDate DESC";
            }
            vm.pageObj = {
                service: 'project',
                method: 'getProjectSummaryByCurrentUser',
                body: {
                    "where": whereClause
                },
                orderby: '',
                isAscending: ''
            }
            $scope.$broadcast("getPageObj", vm.pageObj);
        }

        function getStatusTime(name, Isascending) {
            var whereClause;
            if (Isascending) {
                whereClause = "order by CASE WHEN billableStatus = '" + name + "' THEN 1  ELSE 2 END, createDate DESC";
            } else {
                whereClause = "order by CASE WHEN billableStatus = '" + name + "' THEN 1  ELSE 2 END, createDate DESC";
            }
            vm.pageObj = {
                service: 'project',
                method: 'getTimeSheetSummaryByCurrentUser',
                body: {
                    "where": whereClause
                },
                orderby: '',
                isAscending: ''
            }
            $scope.$broadcast("getPageObj", vm.pageObj);
        }

     	function setSortArrProject(){
			vm.sortArr = [{
				name: "Starred"
				, id: "favouriteStarNo"
				, src: "img/ic_grade_48px.svg"
				, upstatus : false
				, downstatus : false
				, divider: true,
				close: false
				},{
				name: "Date"
				, id: "createDate"
				, src: "img/ic_add_shopping_cart_48px.svg"
				, upstatus : false
				, downstatus : true
				, divider: false,
				close: true
				}, {
				name: "Project No"
				, id: "projectID"
				, src: "img/ic_add_shopping_cart_48px.svg"
				, upstatus : false
				, downstatus : false
				, divider: false,
				close: false
				}, {
				name: "Project Name"
				, id: "name"
				, src: "img/ic_add_shopping_cart_48px.svg"
				, upstatus : false
				, downstatus : false
				, divider: true,
				close: false
				}, {
				name: "Active"
				, id: "projectStatus"
				, src: "img/ic_add_shopping_cart_48px.svg"
				, upstatus : false
				, downstatus : false
				, divider: false,
				close: false
				}, {
				name: "Inactive"
				, id: "projectStatus"
				, src: "img/ic_add_shopping_cart_48px.svg"
				, upstatus : false
				, downstatus : false
				, divider: false,
				close: false
			}];   
        }

      	function setSorArrTimesheet(){
			vm.sortArr = [{
                name: "Starred"
                , id: "favouriteStarNo"
                , src: "img/ic_grade_48px.svg"
                , upstatus : false
                , downstatus : false
                , divider: true,
                close: false
                },{
				name: "Date"
				, id: "createDate"
				, src: "img/ic_add_shopping_cart_48px.svg"
				, upstatus : false
				, downstatus : true
				, divider: false,
				close: true
				}, {
				name: "Project"
				, id: "project"
				, src: "img/ic_add_shopping_cart_48px.svg"
				, upstatus : false
				, downstatus : false
				, divider: false,
				close: false
				}, {
				name: "Hours"
				, id: "totalHour"
				, src: "img/ic_add_shopping_cart_48px.svg"
				, upstatus : false
				, downstatus : false
				, divider: false,
				close: false
				},{
				name: "Task"
				, id: "task"
				, src: "img/ic_add_shopping_cart_48px.svg"
				, upstatus : false
				, downstatus : false
				, divider: false,
				close: false
				},{
				name: "User"
				, id: "user"
				, src: "img/ic_add_shopping_cart_48px.svg"
				, upstatus : false
				, downstatus : false
				, divider: true,
				close: false
				}, {
				name: "Billable"
				, id: "billableStatus"
				, src: "img/ic_add_shopping_cart_48px.svg"
				, upstatus : false
				, downstatus : false
				, divider: false,
				close: false
				}, {
				name: "Non-Billable"
				, id: "billableStatus"
				, src: "img/ic_add_shopping_cart_48px.svg"
				, upstatus : false
				, downstatus : false
				, divider: false,
				close: false
				}, {
				name: "Billed"
				, id: "billableStatus"
				, src: "img/ic_add_shopping_cart_48px.svg"
				, upstatus : false
				, downstatus : false
				, divider: false,
				close: false
			}];  
      	}

        function defaultCancel(item){ // pass sort array object when cancel icon click
          vm.sortArr[vm.indexno].upstatus = false;
          vm.sortArr[vm.indexno].downstatus = false;
          item.close = false; 
          vm.indexno = 1; 

          vm.orderby = "createDate",
          vm.isAscending = false;
          if (vm.tabIndex === 0) {
            loadAllProjects(vm.orderby,vm.isAscending); 
          }else{
            loadAllTimesheets(vm.orderby,vm.isAscending); 
          }
        }

        function starfunc(item,index) { // pass sort object and index numbr 
            if (vm.tabIndex === 0) {
                projectStar(item,index)
            }else{
                timesheetStar(item,index)
            }        
        }

        function projectStar(item,index){
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
            loadAllProjects(vm.orderby,vm.isAscending); 
            // SortStarFunc();

          }else if(item.id === "projectStatus"){
            item.upstatus == false;     // hide current up icon
            item.downstatus = false;    // hide current down icon
            vm.sortArr[vm.indexno].downstatus = false;  // hide previous down icon
            vm.sortArr[vm.indexno].upstatus = false;    // hide previous up icon
            vm.sortArr[vm.indexno].close = false;       // hide previous close icon
            item.close = true;
            vm.indexno = index;
            getStatusPro(item.name, item.id);
            if (item.name == "Active") {
              vm.orderby = "status";
              vm.isAscending = true;
              vm.loadAllProjects(vm.orderby,vm.isAscending); 
            }else if (item.name == "Inactive") {
              vm.orderby = "status";
              vm.isAscending = false;
              loadAllProjects(vm.orderby,vm.isAscending); 
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
              loadAllProjects(vm.orderby,vm.isAscending); 
            }
            if (item.downstatus) {
              vm.orderby = item.id;
              vm.isAscending = false;
              loadAllProjects(vm.orderby,vm.isAscending); 
            }
          }
        }

        function timesheetStar(item,index){
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

          }else if(item.id === "billableStatus"){
            item.upstatus == false;     // hide current up icon
            item.downstatus = false;    // hide current down icon
            vm.sortArr[vm.indexno].downstatus = false;  // hide previous down icon
            vm.sortArr[vm.indexno].upstatus = false;    // hide previous up icon
            vm.sortArr[vm.indexno].close = false;       // hide previous close icon
            item.close = true;
            vm.indexno = index;
            getStatusTime(item.name, item.id);
            if (item.name == "Active") {
              vm.orderby = "status";
              vm.isAscending = true;
              vm.loadAllProducts(vm.orderby,vm.isAscending); 
            }else if (item.name == "Inactive") {
              vm.orderby = "status";
              vm.isAscending = false;
              loadAllProducts(vm.orderby,vm.isAscending); 
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

        function favouriteFunctionPro(_obj){
            if (_obj.favouriteStarNo == 1 ) {
                _obj.favouriteStarNo = 0;
            }
            else if (_obj.favouriteStarNo == 0){
                _obj.favouriteStarNo = 1;
            }
            _obj.favouriteStar = !_obj.favouriteStar; 

           
            var jsonString = JSON.stringify({"project":_obj}) 

            var client =  $serviceCall.setClient("updateProjectSummary","project");
            client.ifSuccess(function(data){ 
            });
            client.ifError(function(data){
                $mdDialog.show($mdDialog.alert().parent(angular.element(document.body)).content('Error Occure while Adding to Favourite').ariaLabel('').ok('OK').targetEvent(data));
            })
            client.postReq(jsonString);
        }

        function favouriteFunctionTime(_obj){
            if (_obj.favouriteStarNo == 1 ) {
                _obj.favouriteStarNo = 0;
            }
            else if (_obj.favouriteStarNo == 0){
                _obj.favouriteStarNo = 1;
            }
            _obj.favouriteStar = !_obj.favouriteStar; 

           
            var jsonString = JSON.stringify({"timesheet":_obj}) 

            var client =  $serviceCall.setClient("updateTimesheetSummary","project");
            client.ifSuccess(function(data){ 
            });
            client.ifError(function(data){
                $mdDialog.show($mdDialog.alert().parent(angular.element(document.body)).content('Error Occure while Adding to Favourite').ariaLabel('').ok('OK').targetEvent(data));
            })
            client.postReq(jsonString);
        }

        function singleActiveSort(){
            var whereClause = "AND projectStatus <> 'delete'  and projectStatus = 'Active' order by createDate DESC "
            vm.pageObj = {
                service : 'project',
                method : 'getProjectSummaryByCurrentUser',
                body : {
                   "where":whereClause
                },
                orderby: '',
                isAscending : ''
            }
            $scope.$broadcast("getPageObj", vm.pageObj)
        }

        function singleStarSortPro(){
            var whereClause = "AND projectStatus <> 'delete'  and favouriteStar=true order by createDate DESC"
            vm.pageObj = {
                service : 'project',
                method : 'getProjectSummaryByCurrentUser',
                body : {
                    "where":whereClause
                },
                orderby: '',
                isAscending : ''
            }

            $scope.$broadcast("getPageObj", vm.pageObj)
        }

        function singleStarSortTime(){
            var whereClause = "AND favouriteStar=true order by createDate DESC"
            vm.pageObj = {
                service : 'project',
                method : 'getTimeSheetSummaryByCurrentUser',
                body : {
                   "where":whereClause
                },
                orderby: '',
                isAscending : ''
            }

            $scope.$broadcast("getPageObj", vm.pageObj)
        }

        function sendMail(){  

            $mdDialog.show({
              templateUrl: 'app/main/projects/dilaogs/email/email.html',
              controller: 'projectMail',
              controllerAs: 'vm',
              locals:{
                  item : vm.project,
                  profData : settingSummary[0].profile,
                  cusemail : ''
              }
            }).then(function(data){
              
            }, function(data){

            })
        }

        function setPrimaryToolBar(){
            vm.primaryToolbarContext = !vm.primaryToolbarContext;
        };

        function toggleChildStates(toggledState){
            $state.go(toggledState);
        };
        function openItem(item){
            // Set the read status on the item
            // item.read = true; 
            setPrimaryToolBar();

            // Assign thread as the current thread
            vm.currentThread = item; 
            if (vm.tabIndex === 0) {
                $state.go('app.projects.pro.detail', {itemID: item.projectID});
            }else{
                $state.go('app.projects.timesheet.detail', {itemID: item.timesheetID});
            }

            $scope.$on('$stateChangeSuccess',
                function onStateSuccess(event, toState, toParams, fromState) { 
                    if (vm.tabIndex === 0) {
                        loadFullProject();
                    }else{
                        loadFullTimesheet();
                    }
                }
            );
        }

        function closeThread(){
            vm.currentThread = null;

            setPrimaryToolBar();

            // Update the state without reloading the controller
            $state.go('app.projects.pro');
        }

        /**
         * Return selected status of the thread
         *
         * @param thread
         * @returns {boolean}
         */
        function isSelected(thread){
            return vm.selectedThreads.indexOf(thread) > -1;
        }

        /**
         * Toggle selected status of the thread
         *
         * @param thread
         * @param event
         */
        function toggleSelectThread(thread, event){
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
        function selectThreads(key, value){
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
        function deselectThreads(){
            vm.selectedThreads = [];
        }

        /**
         * Toggle select threads
         */
        function toggleSelectThreads(){
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
        function setThreadStatus(key, value, thread, event){
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
        function toggleThreadStatus(key, thread, event){
            // Stop the propagation if event provided
            // This will stop unwanted actions on button clicks
 
            if (vm.tabIndex === 0) {
                favouriteFunctionPro(thread)
            }else{
                favouriteFunctionTime(thread)
            }


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

 
        /**
         *detail view functionalities separately 
         *  
         *
         *  
         *
         *  
         *
         *  
         *
         */

        var client,
            CommentObj;
        
        vm.project = {};
        vm.task = {};
        vm.user = {};
        vm.balance = {};
        vm.commentProgress = false;
        vm.disableBrochure = true;
       
        /*
            declare class called 'proView'
        */
        var proView = (function(){
            
            var instance;
            // constructor of the proedit class 
            var proView = function(){
                this.client;
            }   
            /*
                class method to load all the project releted details 
            */
            proView.prototype.loadProject = function(){
                this.client =  $serviceCall.setClient("getAllByProjectID","project"); // method name and service
                this.client.ifSuccess((function(data){  //sucess
                    vm.project = data.result.project[0];
                    vm.task = data.result.task;
                    vm.user = data.result.user;
                    vm.balance = data.result.balance[0]; 
                    console.log(vm.balance) 

                    if (vm.project.projectStatus === "Active") {vm.status = "Inactive";}else{vm.status = "Active"}
                    
                    this.checkUpload()
                }).bind(this));
                this.client.ifError(function(data){ //falce
                    console.log("error loading project data")
                })
                this.client.projectID($state.params.itemID); // send projectID as url parameters
                this.client.getReq(); // get request if post then use 'postReq('jsonbody')'
                return this;
            }
            /*
                class method to load all the expense related to one project 
            */
            proView.prototype.getExpenseByID = function(){
                this.client = $serviceCall.setClient("getExpenseByTypeAndTypeID","expense");
                this.client.ifSuccess(function(data){ 
                   vm.expenseData = data.result;
                });
                this.client.ifError(function(data){
                    console.log("error loading expense data")
                });
                this.client.type("project");
                this.client.typeID($state.params.itemID);
                this.client.getReq();
                return this;
            }

            proView.prototype.checkUpload = function(){
                vm.disableBrochure = true;
                if (Array.isArray(vm.project.uploadImage) && vm.project.uploadImage.length > 0) {
                    vm.disableBrochure = false;
                }
                return this;
            }

            proView.prototype.setSettingVal = function(){
                var data = settingSummary; 
                this.profile = data[0].profile;
                vm.baseCurrency = this.profile.baseCurrency; 
                return this;
            }

            return {
                // singleton method return the current instance or  create new one 
                getInstance: function(){
                    if (instance == null) {
                        instance = new proView();
                        // Hide the constructor so the returned objected can't be new'd...
                        instance.constructor = null;
                    }
                    return instance;
                }
            } 
        })()

        var timesheetView = (function(){

            var instance;
            // constructor of the proedit class 
            function timesheetView(){
                this.client;
            }  
            timesheetView.prototype.loadTimesheet = function(){

                this.client =  $serviceCall.setClient("getTimesheetByKey","project");
                this.client.ifSuccess(function(response){
                    var data = response.result;     
                    vm.timesheet = data;
                    vm.timesheet.date = new Date( vm.timesheet.date);
                    vm.projectTime = {
                        proName : vm.timesheet.project,
                        proId : vm.timesheet.projectID
                    }
                    vm.taskTime = {
                        thr : vm.timesheet.rate,
                        taskName : vm.timesheet.task
                    }  
                    var fullHour = vm.timesheet.totalHour.split(".")[0] || 0,
                        fullMin  = vm.timesheet.totalHour.split(".")[1] || 0
             
                    vm.timesheet.totalHour = angular.copy( fullHour + "h " + fullMin + "m ")
                    console.log(data)
                })
                this.client.ifError(function(data){
                    console.log("error loading setting data")
                })
                this.client.timesheetID($state.params.itemID);  
                this.client.getReq();
            }

            return {
                // singleton method return the current instance or  create new one 
                getInstance: function(){
                    if (instance == null) {
                        instance = new timesheetView();
                        // Hide the constructor so the returned objected can't be new'd...
                        instance.constructor = null;
                    }
                    return instance;
                }
            } 
        })();

        /*
            contain all the functionalities inside the controller 
        */
        var ctrlHandler = (function(){
            var proEdit = function(){
                if ( vm.balance.billed > 0) {
                    $mdDialog.show(
                        $mdDialog.alert()
                        .parent(angular.element(document.body))
                        .title('Unable to edit')
                        .content('There are existing billed items for this project. Unable to edit details')
                        .ariaLabel('Alert Dialog Demo')
                        .ok('OK')
                        .targetEvent()
                    );
                }else{
                    $state.go("editProject",{"projectID": $state.params.itemID})
                }
            }
            var custBill = function(obj){
                $mdDialog.show({
                    templateUrl: 'project_partial/projectBillCustomer.html',
                    controller: "billCustomerCtrl"          
                });
            } 

            function viewBrochure(){
                var url; 
                if (vm.project.uploadImage.length > 0) {            
                    url = $setUrl.imagePath + 'project/' + vm.project.uploadImage[0].uniqueCode; 
                }
                window.open(url,'_blank');
            }

            function formatDate(date){
              var dateOut = new Date(date);
              return dateOut;
            };

            function billcustomer(){
                $mdDialog.show({
                    controller: 'billCustomerCtrl',
                    controllerAs : 'vm',
                    templateUrl: 'app/main/projects/dilaogs/bill/projectBillCustomer.html',
                    parent: angular.element(document.body),
                    clickOutsideToClose:true
                  })
            }


            return{
                proEdit : proEdit,
                custBill : custBill,
                viewBrochure : viewBrochure,
                formatDate : formatDate,
                billcustomer : billcustomer
            }    
        })();

        /*
            create a new object to the 'proView' class and call several methods 
        */
        function loadFullProject(){  
            if ($state.params.itemID) {
                vm.currentThread = "assas"
                vm.primaryToolbarContext = false; 
                client = proView.getInstance();
                client.loadProject().getExpenseByID().setSettingVal();
            }          
        }


        function loadFullTimesheet(){
             if ($state.params.itemID) {
                vm.currentThread = "assas"
                vm.primaryToolbarContext = false;  
                client = timesheetView.getInstance();
                client.loadTimesheet()
            }
        }


        checkState();
        /*
            trigger when the edit menu item is selected
            edit only enable if there are no billed hours remaining,
            otherwise it will not able to edit

            if edit is enable then move to new state
        */
        vm.editProject = ctrlHandler.proEdit;
        /*
            will trigger when the bill customer menu item choose 
            open a new dialog box and move to new controller called 'billCustomerCtrl'
        */
        vm.billCustomer =  ctrlHandler.custBill;

        vm.viewBrochure = ctrlHandler.viewBrochure;

        vm.formatDate = ctrlHandler.formatDate;

        vm.billcustomer = ctrlHandler.billcustomer;
    }
})();
// angular.module('app.projects')['_invokeQueue'].forEach(function(val) {
//     console.log(val[2][0])
// })
(function ()
{
    'use strict';

    var premissionType = ["admin","Super admin"];

    angular
        .module('app.projects')
        .controller('timesheetComposeController', timesheetComposeController);



    /** @ngInject */
    function timesheetComposeController($scope, $state,$mdDialog,$serviceCall,$timeSheetVals,$userDetails,$mdToast)
    {
        var vm = this; 


        vm.timeSheet = {
            date : new Date()
        };

        vm.status = "";

        vm.loggedObj = {};

        vm.hours = $timeSheetVals.getHours();

        vm.projectSelect = projectSelect;

        vm.submit = submit;

        vm.cancel = cancel;

        vm.newTask = newTask;

        vm.newUser = newUser;

        vm.toggleChildStates = toggleChildStates;

        vm.projectByUser = init;

        vm.disableUser = true;

        vm.showMsg = false;


        function init(obj){
            var proClient =  $serviceCall.setClient("getProjectsByUser","project"); // method name and service name 
            proClient.ifSuccess(function(response){ 
                var data = response.result;
                // vm.userData = response.users;
                vm.projectArr = [];
                for (var k=0; k <= data.length-1; k++){
                    vm.projectArr.push({
                        proName : data[k].name,
                        proId : data[k].projectID
                    })          
                }
                if (JSON.parse(vm.selectProject)) { 
                    var selectProject = JSON.parse(vm.selectProject)
                    vm.selectProject = vm.projectArr.find(function(o){o.proId === selectProject.proId});
                    vm.selectProject = JSON.stringify( vm.selectProject);
                }
            })
            proClient.ifError(function(data){
                console.log("error loading setting data")
            })
            proClient.skip("0");
            proClient.take("50");
            if (obj && obj.email) {
                proClient.user(obj.email);
            }
            proClient.postReq({where : "projectStatus = 'Active' "});

            // load task from setting app 
            var client =  $serviceCall.setClient("getAllByQuery","setting");
            client.ifSuccess(function(response){
                var data = response[0];
                var settingTask = [];
                settingTask = data.preference.project.task;
                vm.addtasks = [];
            })
            client.ifError(function(data){
                console.log("error loading setting data")
            })
            client.postReq({
                "preference":"project"
            });
        }



        function toggleChildStates(toggledState){
            $state.go(toggledState);
        };
     
        function projectSelect(item){
            var obj = JSON.parse(item)
            var client =  $serviceCall.setClient("getTaskByID","project");
            client.ifSuccess(function(data){ 

                setTaskByID(data.result)
                // getUserByID(obj);
 
                // if (vm.timeSheet.user) { 
                //     vm.timeSheet.user = vm.userData.find(function(o){o.email === vm.timeSheet.user.email })
                // }
            })
            client.ifError(function(data){
                console.log("error loading setting data")
            })
            client.skip("0");
            client.take("50");
            client.orderby("projectID");
            client.isAscending("false");
            client.postReq({
                "where":  "projectID = '"+obj.proId+"' "
            });
        }

        function setTaskByID(data){
            vm.addtasks = [];
            vm.addtasks = data;
        }

        function checkUser(){
            var client =  $serviceCall.setClient("getUserDetails","project");
            client.ifSuccess(function(data){ 
                var roleData = premissionType.find(function(o){o === data.role});
                if (roleData) {
                    vm.disableUser = false;
                    getAllUsers();
                }else{ 
                    data.firstName = data.name;
                    vm.userData = [];
                    vm.userData.push(data);
                    vm.timeSheet.user = vm.userData[0];
                    vm.disableUser = true;
                    init();
                };
            })
            client.ifError(function(data){
                console.log("error loading setting data");
            }) 
            client.getReq();
        }

        checkUser()

        function getAllUsers(){
            var client =  $serviceCall.setClient("getAllUsers","project");
            client.ifSuccess(function(res){ 
                var data = res; 
                setUserByID(data); 
            });
            client.ifError(function(data){
                console.log("error loading setting data")
            }); 
            client.getReq();
        }
        
        function getUserByID(obj){
            var client =  $serviceCall.setClient("getAllUsersByID","project");
            client.ifSuccess(function(res){ 
                var data = res.result; 
                setUserByID(data)  
            });
            client.ifError(function(data){
                console.log("error loading setting data")
            });
            client.projectID(obj.proId);
            client.getReq();
        }

        function setUserByID(data){
            vm.userData = []; 
            vm.userData = data;
        }

        function submit() {
             
            vm.showMsg = false;
            if (vm.status === "") {
                vm.showMsg = true;
                vm.errorMsg = "please select billing status";
            }else if (!vm.selectProject ) {
                vm.showMsg = true;
                vm.errorMsg = "please select a project";
            }else if (!vm.task ) {
                vm.showMsg = true;
                vm.errorMsg = "please select a task";
            }else{
                sendToService();
            }
        }

        function sendToService(){
            vm.submitProgress = true;

            vm.timeSheet.favoriteStar = false;
            vm.timeSheet.favoriteStarNo = 1;  
            if (typeof vm.selectProject != 'object') 
                vm.selectProject = JSON.parse(vm.selectProject)

            vm.timeSheet.project = vm.selectProject.proName;
            vm.timeSheet.projectID = vm.selectProject.proId; 

            if (typeof vm.task != 'object')  
                vm.task= JSON.parse(vm.task) 

            if (typeof vm.timeSheet.user != 'object')  
                vm.timeSheet.user= JSON.parse(vm.timeSheet.user) 

            vm.timeSheet.task = vm.task.taskName;
            vm.timeSheet.taskRate = vm.task.rate;
            vm.timeSheet.status = "Active";

            vm.timeSheet.modifyUser = ""
            vm.timeSheet.createUser = ""

            vm.timeSheet.totalHour = getTheHours(vm.hours);
            vm.timeSheet.billableStatus =  vm.status; 
        
            var serviceObj = {
                "timesheet" : vm.timeSheet,
                "image" :"",
                "appName" : "Projects",
                "permissionType" : "add"
            } 

            var client =  $serviceCall.setClient("insertTimesheet","project");
            client.ifSuccess(function(data){  
                vm.submitProgress = false;
                if (data.statusCode == 200){
                    $mdToast.show(
                      $mdToast.simple()
                        .textContent('Successfully Timesheet Added')
                        .position('top right' )
                        .hideDelay(3000)
                    );

                     $state.go("app.projects.timesheet");
                }else{
                    $mdDialog.show($mdDialog.alert().parent(angular.element(document.body)).title('error occurred ').content(data.customMessage).ariaLabel('').ok('OK').targetEvent());
                }
            });
            client.ifError(function(data){   
                vm.submitProgress = false;           
                $mdDialog.show($mdDialog.alert()
                    .parent(angular.element(document.body))
                    .title('Error occure')
                    .content('There was an error while inserting the data.')
                    .ariaLabel('Alert Dialog Demo')
                    .ok('OK')
                    .targetEvent());
            })
            client.postReq(serviceObj); 
        }

        function cancel(){
            vm.hours = $timeSheetVals.setHours(""); 
            $state.go("settings.timesheet")
        }

        function getTheHours(time){

            var hourTrue = false;
            var minTrue = false;
            var timesheetHour = 0;
            var timesheetMinute = 0;

            var arr = time.split(" "); 

            if (arr.length == 1) { 
                if (!oneTime(arr[0])) {
                    if (!isNaN(arr[0])) {
                        timesheetHour = parseInt(arr[0]); 
                    }else{
                        timeError();   
                    }
                }
            }
            else if(arr.length == 2){
                twoTime(arr)
            }
            else if (arr.length > 2) {  
                timeError();        
            }

            function oneTime(element){  
                if (element.match(/^\d{1,4}[hH]$/i)) {
                    timesheetHour += parseInt(element.split(element[element.length - 1])[0]);
                    return true;
                }else if (element.match(/^\d{1,2}[mM]$/i)) {
                    timesheetMinute += parseInt(element.split(element[element.length - 1])[0]);
                    return true;
                }else{
                    return false
                }
            }

            function twoTime(arr){
                for(var i=0; i<=arr.length-1; i++){
                    if (!oneTime(arr[i])) {
                        timeError()
                    }
                }
            }

            var hrInMin = Math.floor(timesheetMinute / 60)
            if (hrInMin > 0) {
                timesheetHour += hrInMin
                timesheetMinute = timesheetMinute % 60
            }
            return (timesheetMinute.toString().length == 2) ?timesheetHour.toString() + "."+timesheetMinute.toString() : timesheetHour.toString() + "." + "0" + timesheetMinute.toString();
        }

        function timeError(){            
            vm.showMsg = true;
            vm.submitProgress = false;
            vm.errorMsg = "invalid time format please follow '12h 40m' format";
            throw new Error("invalid time format please follow '12h 40m' format");
        }
 

        /// dialog box for adding new tast to project 
        function newTask(selectProject){
            if (!selectProject) {
                $mdDialog.show(
                    $mdDialog.alert()
                    .parent(angular.element(document.body))
                    .title('project is empty')
                    .content('please select a project')
                    .ariaLabel('Alert Dialog Demo')
                    .ok('OK')
                    .targetEvent()
                );
            }
            if (typeof selectProject !== "object") {
                selectProject = JSON.parse(selectProject)
            }
            $mdDialog.show({
                template: '<md-dialog style="max-width:960px;">\
                           <md-toolbar>\
                              <div class="md-toolbar-tools">\
                                 <h2>Add New Task</h2>\
                                 <span flex></span>\
                                 <md-button href class="md-icon-button" ng-click="vm.closeDialog()">\
                                    <md-icon md-svg-src="img/ic_close_24px.svg" aria-label="Close dialog"></md-icon>\
                                 </md-button>\
                              </div>\
                           </md-toolbar>\
                           <md-dialog-content style="width:850px" >\
                                <div layout-gt-sm="row">\
                                    <section-title title="New Task"></section-title>\
                                    <md-input-container class="md-block" flex-gt-sm ><label>project ID</label><input ng-model="vm.project" ng-disabled="true"></md-input-container>\
                                    <md-input-container flex ><label>task</label><md-select  ng-model="vm.task" flex><md-optgroup label="task"><md-option ng-repeat="item in vm.addtasks" ng-value="item">{{item.task}}</md-option></md-select></md-input-container>\
                              </div>\
                           </md-dialog-content>  <div class="md-actions" layout="row" >\
                              <md-button href ng-click="vm.addNewTask()" class="md-primary">Add</md-button>\
                           </div>\
                           <div class="md-actions" layout="row" >\
                              <md-button href ng-click="vm.closeDialog()" class="md-primary">cancel</md-button>\
                           </div>\
                        </md-dialog>',
                controller: newTaskCtrl,
                controllerAs : 'vm',
                locals : {
                    project : selectProject 
                }       
            }).then(function(result){
                if (result && result !== "") {
                    vm.addtasks.push({
                        thr : result.rate,
                        taskName : result.task
                    });
                    vm.task = {
                        thr : result.rate,
                        taskName : result.task
                    };
                }
            },function(response){

            })
        }

        function newUser(selectProject){
            if (!selectProject) {
                $mdDialog.show(
                    $mdDialog.alert()
                    .parent(angular.element(document.body))
                    .title('project is empty')
                    .content('please select a project')
                    .ariaLabel('Alert Dialog Demo')
                    .ok('OK')
                    .targetEvent()
                );
            }
            if (typeof selectProject !== "object" && selectProject) {
                selectProject = JSON.parse(selectProject)
            }
            $mdDialog.show({
                template: '<md-dialog style="max-width:960px;">\
                           <md-toolbar>\
                              <div class="md-toolbar-tools">\
                                 <h2>Add New Task</h2>\
                                 <span flex></span>\
                                 <md-button href class="md-icon-button" ng-click="vm.closeDialog()">\
                                    <md-icon md-svg-src="img/ic_close_24px.svg" aria-label="Close dialog"></md-icon>\
                                 </md-button>\
                              </div>\
                           </md-toolbar>\
                           <md-dialog-content style="width:850px" >\
                                <div layout-gt-sm="row">\
                                    <section-title title="New User"></section-title>\
                                    <md-input-container class="md-block" flex-gt-sm ><label>project ID</label><input ng-model="vm.project" ng-disabled="true"></md-input-container>\
                                    <md-input-container flex ><label>user</label><md-select  ng-model="vm.user" flex><md-optgroup label="User"><md-option ng-repeat="item in vm.userData" ng-value="item">{{item.firstName}} {{item.lastName}}</md-option></md-select></md-input-container>\
                              </div>\
                           </md-dialog-content>  <div class="md-actions" layout="row" >\
                              <md-button href ng-click="vm.addNewUser()" class="md-primary">Add</md-button>\
                           </div>\
                           <div class="md-actions" layout="row" >\
                              <md-button href ng-click="vm.closeDialog()" class="md-primary">cancel</md-button>\
                           </div>\
                        </md-dialog>',
                controller: newUserCtrl,
                controllerAs : 'vm',
                locals : {
                    project : selectProject 
                }       
            }).then(function(result){
                if (result && result !== "") {
                    vm.userData.push(result);
                    vm.timeSheet.user = result;
                }
            },function(response){

            })
        }
        // dialog box controller to add new task to project 

        function newTaskCtrl($scope,$serviceCall,project){
            var vm = this;

            vm.project = project.proId;

            var client =  $serviceCall.setClient("getAllByQuery","setting");
            client.ifSuccess(function(response){
                var data = response[0]; 
                vm.addtasks = data.preference.project.task; 
                getAllByProjectID();
            })
            client.ifError(function(data){
                console.log("error loading setting data")
            })
            client.postReq({
                "preference":"project"
            });

            function getAllByProjectID(){
                client=  $serviceCall.setClient("getAllByProjectID","project"); // method name and service
                client.ifSuccess(function(data){  //sucess
                    console.log(data) 
                    vm.item = data.project[0]; 
                    var proTasks = vm.item.tasks
                    for (var i=0; i<= proTasks.length-1; i++){
                        for (var k=0; k<= vm.addtasks.length-1; k++){
                            if (proTasks[i].taskName === vm.addtasks[k].task ) {
                                vm.addtasks.splice(k,1)
                            }
                        }
                    }
                    if(vm.addtasks.length ===0 ){
                        $mdDialog.show(
                            $mdDialog.alert()
                            .parent(angular.element(document.body))
                            .title('Tasks are not available')
                            .content('all the tasks are selected in this project. please add new tasks in settings and try again ')
                            .ariaLabel('Alert Dialog Demo')
                            .ok('OK')
                            .targetEvent()
                        );
                    }
                })
                client.ifError(function(data){ //falce
                    console.log("error loading setting data")
                })
                client.projectID(vm.project); // send projectID as url parameters
                client.getReq();
            }

            vm.closeDialog = function(){
                $mdDialog.hide("");
            }
            vm.addNewTask = function(){
                $mdDialog.hide(vm.task)
            }         
        }

        // dialog box controller to add new user to project 
        function newUserCtrl($scope,$serviceCall,project){
            var vm = this;

            vm.project = project.proId;
            var proUsers = [];;

            var client=  $serviceCall.setClient("getAllByProjectID","project"); // method name and service
            client.ifSuccess(function(data){  //sucess
                console.log(data) 
                var data =  data.project[0];
                for (var i=0; i<=data.staffs.length-1; i++){
                    proUsers.push(data.staffs[i].userItem)
                } 
                getAllByProjectID()
            })
            client.ifError(function(data){ //falce
                console.log("error loading setting data")
            })
            client.projectID(vm.project); // send projectID as url parameters
            client.getReq();


            function getAllByProjectID(){
                var proClient =  $serviceCall.setClient("getProAndUser","project"); // method name and service name 
                proClient.ifSuccess(function(response){
                    vm.userData = response.users; 
                    for (var i=0; i<= proUsers.length-1; i++){
                        for (var k=0; k<= vm.userData.length-1; k++){
                            if (proUsers[i].email === vm.userData[k].email ) {
                                vm.userData.splice(k,1)
                            }
                        }
                    }
                    if(vm.userData.length ===0 ){
                        $mdDialog.show(
                            $mdDialog.alert()
                            .parent(angular.element(document.body))
                            .title('User are not available')
                            .content('all the User are selected in this project. please invite new Users using settings and try again ')
                            .ariaLabel('Alert Dialog Demo')
                            .ok('OK')
                            .targetEvent()
                        );
                    }
                })
                proClient.ifError(function(data){
                    console.log("error loading setting data")
                })
                proClient.skip("0");
                proClient.take("1");
                proClient.orderby("");
                proClient.isAscending("");
                proClient.postReq({
                    where : "projectStatus <> 'delete'" 
                });
            }

            vm.closeDialog = function(){
                $mdDialog.hide("");
            }
            vm.addNewUser = function(){
                $mdDialog.hide(vm.user)
            }           
        }
    }    
})();
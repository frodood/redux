(function ()
{
    'use strict';

    angular
        .module('app.projects')
        .controller('projectComposeController', projectComposeController)
        .directive('autofocuss', ['$timeout', function($timeout) {
          return {
            restrict: 'A',
            link : function($scope, $element) {
              $timeout(function() {
                $element[0].focus();
              });
            }
          }
        }]);



    /** @ngInject */
    function projectComposeController($scope,$userDetails,$apis,$serviceCall,$imageUploader,$state,$mdDialog,$mdToast)
    {
        var vm = this; 

        vm.addstaff = addstaff;

        vm.contacts = [];

        vm.flatProjectVisible = false;

        vm.hourlyRateVisible = false;

        vm.staffHourRateDisable = true;

        vm.taskHourRateDisable = true;

        vm.showbilMethodDiv = true; 

        vm.userObject = []; 

        vm.selectedItem = "";

        vm.taskItem = "";

        vm.searchText = null;

        vm.userText = null;

        vm.taskText = null; 

        vm.userSearch = userSearch;

        vm.taskSearch = taskSearch;

        vm.addstaff = addstaff;

        vm.addtask = addtask;

        vm.removeTask = removeTask;

        vm.removeStaff = removeStaff;

        vm.onChange = onChange;

        vm.userChange = userChange;

        vm.taskChange = taskChange;

        vm.submit = submit;

        vm.setMedia = setMedia;

        vm.toggleChildStates = toggleChildStates;

        vm.imageArray = [];

        vm.myDate = new Date();

        loadAll();

        vm.brochureConfig = {
          restrict : "",
          size : "2MB",
          crop : false,
          type : "all",
          maxCount : 1
        }

        function setMedia(res){ 
            if(res.hasOwnProperty('all')){
            vm.imageArray = res.all;
          }
        }

        vm.project = {    
           "name":"",
           "date":new Date(),
           "descriptions":"",
           "profileID" : "",
           "profileName" : "",
           "bhours":"",
           "billingMethod":"",
           "projectType" : "",
           "projectAmount" : 0,
           "staffs":[],
           "tasks":[],
           "notes":"", 
           "favouriteStarNo":"",
           "projectStatus":"Active", 
           "uploadImage" : [],
           "fpAmount" : "",
           "projectLog":{
                "UIHeight" : '30px;', 
                "type" : "activity",
                "description" : "project added by",
                "status" : "Active"
            }
        }
         
        var apis = $apis.getApis();  
        
        vm.addstaffs = [];

        vm.addtasks = []; 

        vm.addtasks.push({
            tno: vm.addtasks.length + 1,
            thr: "",
            taskName : ""
        })
 
        $scope.$on('selectedProfile',function(event, args){  
            vm.selectedItem = args.slctdProfile;
        }); 

        function toggleChildStates(toggledState){
            $state.go(toggledState);
        };
        
        function addstaff() {
            vm.addstaffs.push({
                sno: vm.addstaffs.length + 1,
                userItem : '',
                shr: "",
            })
        }

        function addtask() {
            vm.addtasks.push({
                tno: vm.addtasks.length + 1,
                thr: "",
                taskName : ""
            })
        }

        function setUser(){
            var obj = vm.userObject.find(function(o){
                return o.email === apis.getMail()
            })

            vm.addstaffs.push({
                sno: vm.addstaffs.length + 1,
                userItem : {
                    firstName : obj.firstName,
                    email : obj.email,
                    roleName :  (obj.roleName) ?  obj.roleName : "",
                    lastName : ""
                },
                shr: "",
            }); 

            userChange(0,vm.addstaffs[0].userItem);
        }

        function uploadImage(){ 

            if (vm.imageArray.length > 0) {
                for (var indexx = 0; indexx < vm.imageArray.length; indexx++) { 
                    var client = $imageUploader.setImage(vm.imageArray[indexx].uniqueCode,'project');
                    client.ifSuccess(function(data){

                    });
                    client.ifError(function(data){ 

                    });
                    client.sendImage(vm.imageArray[indexx])         
                }
            }
        }

        function removeTask(index,item) {  
            vm.addtasks.splice(index, 1); 
            deleteKey(vm.taskItem, index);
            deleteKey(vm.taskText, index); 
            if (taskBackArr[index]) {
                vm.settingTask.push(taskBackArr[index]);
            }
        };  

        function removeStaff(index,item) {
            vm.addstaffs.splice(index, 1); 
            deleteKey(vm.userText, index);   
            item.userItem = null;
            if (userBackArr[index]) {
                vm.userObject.push(userBackArr[index]);
            }
        };

        function deleteKey(object, key) {
            var keys = Object.keys(object).sort(function (a, b) {
                return a - b;
            });

            keys.forEach(function (k) {
                if (k > key) {
                    object[k - 1] = object[k];
                }
            });
            delete object[keys.pop()];
        }

        function userSearch(query){  
            var res = vm.userObject.filter(function(obj){
                return obj.firstName.toLowerCase().indexOf(query.toLowerCase()) != -1;
            });   
            return res;    
        }

        function taskSearch(query){   
            var res = vm.settingTask.filter(function(obj){ 
                return obj.task.toLowerCase().indexOf(query.toLowerCase()) != -1;
            }); 
            return res;
        }


        var taskBackArr = [];
        var userBackArr = [];

        function userChange(index,item){ 
            debugger
            if (item && item.firstName) {
                vm.addstaffs[index].staffname = item.firstName + " " + item.lastName;
                vm.addstaffs[index].email = item.email;
                removeDup();   
            }else{
                if (userBackArr[index]) {
                    vm.userObject.push(userBackArr[index]);
                }
            }

            function removeDup(){
                userBackArr[index] = angular.copy(item);
                removeItem();
            }

            function removeItem(){
                for(var i=0; i<=vm.userObject.length-1; i++){
                    if (item.id === vm.userObject[i].id) {
                         vm.userObject.splice(i,1)
                    }
                }
            } 
            // removeFromAllStaff(item)
        }


        function taskChange(index,item){ 
            if (item && item.task) {
                vm.addtasks[index].taskName = item.task ;
                vm.addtasks[index].thr = item.rate;   
                vm.addtasks[index].id = item.id;   
                removeDup();   
            }else{
                if (taskBackArr[index]) {
                    vm.settingTask.push(taskBackArr[index]);
                }
            }

            function removeDup(){
                taskBackArr[index] = angular.copy(item);
                removeItem();
            }

            function removeItem(){
                for(var i=0; i<=vm.settingTask.length-1; i++){
                    if (item.id === vm.settingTask[i].id) {
                         vm.settingTask.splice(i,1)
                    }
                }
            }
            // removeFromAllTask(item);
        }

        function loadAll() {

            var client =  $serviceCall.setClient("getAllByQuery","setting");
            client.ifSuccess(function(data){ 
                var data = data[0];
                loadTasksFromSetting(data,function(){
                    loadUsersFromSetting(data.user,function(){
                        setUser();
                    })
                })
            });
            client.ifError(function(data){
                console.log("error loading setting data")
            })
            client.postReq({
                "preference":"project",
                "setting":"profile",
                "user" : "premissions"
            });     
        }

        function loadTasksFromSetting(data,callback){       
            vm.settingTask = []; 
            vm.settingTask = data.preference.project.task;
            vm.project.billingMethod = data.preference.project.defaultBillingMethod;
            onChange(vm.project.billingMethod); 
         
            callback(); 
        }   

        function loadUsersFromSetting(userObj,callback){
            vm.userObject = [];
            vm.userObject = angular.copy(userObj);
            callback();
        }

        function onChange(type) {
            switch(type){
                case "Hourly Staff Rate" : 
                    vm.staffHourRateDisable = false;
                    vm.showbilMethodDiv = true;
                    vm.hourlyRateVisible = false;
                    vm.flatProjectVisible = false;
                    vm.taskHourRateDisable = true;
                    break;
                case "Hourly Task Rate" : 
                    vm.taskHourRateDisable = false;
                    vm.showbilMethodDiv = true;
                    vm.staffHourRateDisable = true;
                    vm.hourlyRateVisible = false;
                    vm.flatProjectVisible = false;
                    break;
                case "Hourly Project Rate" : 
                    vm.hourlyRateVisible = true;
                    vm.flatProjectVisible = false;
                    vm.staffHourRateDisable = true;
                    vm.taskHourRateDisable = true;
                    vm.showbilMethodDiv = false;
                    break;
                case "Flat Project Amount" : 
                    vm.flatProjectVisible = true;
                    vm.hourlyRateVisible = false;
                    vm.staffHourRateDisable = true;
                    vm.taskHourRateDisable = true;
                    vm.showbilMethodDiv = false;
                    break;
                default : 
                    console.log('no such type')
            }  
        }

        function submit() {
            vm.submitProgress = true;
            if (vm.addstaffs.length === 0) {
                $mdDialog.show($mdDialog.alert().parent(angular.element(document.body)).title('Staff members required').content('Please add atleast one staff member').ariaLabel('').ok('OK').targetEvent());
                return false;
            }
            uploadImage()       
            vm.project.favouriteStar = false;
            vm.project.favouriteStarNo = 1; 
            vm.project.projectStatus = "Active";
            vm.project.staffs = [];
            vm.project.staffs = vm.addstaffs;
            if (vm.addstaffs.length > 0) {
                vm.project.projectType = "Default";
            }else{                
                vm.project.projectType = "Common";
            }
            vm.project.tasks = [];
            if (vm.addtasks[0] && vm.addtasks[0].taskName !== "" ) {
                vm.project.tasks = vm.addtasks;
            }else
            vm.project.todayDate = new Date();
            if (vm.project.bhours == "" || !vm.project.bhours)  
                vm.project.bhours = 0;
            if (vm.selectedItem && vm.selectedItem.profileName){
                vm.project.customerNames = vm.selectedItem.profileName;
                vm.project.profileID = vm.selectedItem.profileID;
            }else{
                vm.project.customerNames = "internal";
                vm.project.profileID = "-1"
            }

            vm.project.uploadImage = vm.imageArray.map(function(obj){
                var samObj = {
                    name : obj.name,
                    size : obj.size,
                    uniqueCode : obj.uniqueCode,
                }
                return samObj;
            })

            console.log(vm.project.uploadImage);

            var serviceObj = {
                "project" : vm.project,
                "image" : vm.project.uploadImage,
                "appName" : "Projects",
                "permissionType" : "add"
            } 

            var client =  $serviceCall.setClient("insert","project");
            client.ifSuccess(function(data){ 
                vm.submitProgress = false;
                if (data.statusCode == 200){
                    $mdToast.show(
                      $mdToast.simple()
                        .textContent('Successfully Project Added')
                        .position('top right' )
                        .hideDelay(3000)
                    );
                    $state.go("app.projects.pro")
                }
                else{
                    $mdDialog.show($mdDialog.alert().parent(angular.element(document.body)).title('error occurred ').content(data.customMessage).ariaLabel('').ok('OK').targetEvent());
                }
            });
            client.ifError(function(data){              
                vm.submitProgress = false;
                $mdDialog.show($mdDialog.alert().parent(angular.element(document.body)).title('error occurred ').content(data).ariaLabel('').ok('OK').targetEvent());
            })
            client.postReq(serviceObj);              
        }
    }    
})();
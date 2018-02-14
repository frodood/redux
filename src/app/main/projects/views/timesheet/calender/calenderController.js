(function ()
{
    'use strict';

    angular
        .module('app.projects')
        .controller('calendarController', calendarController);



    /** @ngInject */
    function calendarController($scope,$state,$mdDialog,$projectEvent,$rootScope,$timeout,$q,$interpolate,MaterialCalendarData,$serviceCall,$userDetails,$apis,$mdToast)
    {
        var vm = this;

        vm.catchName = 'sachilaRanawaka';     
        vm.timesheet = {
            "billableStatus": "Billable",
            "createDate": "",
            "createUser": "",
            "favoriteStar": false,
            "favouriteStarNo": 1,
            "lastTranDate":"",
            "modifyDate":  "",
            "modifyUser": "",
            "notes": "",
            "project": "",
            "projectID": "",
            "rate": "",
            "status": "Active",
            "task": "",
            "tickets": [], 
            "totalHour": "",
            "user": ""
        }

        $projectEvent.removeItem();
        // MaterialCalendarData.setDayContent(new Date())

        vm.toggleChildStates = toggleChildStates;  

        function toggleChildStates(toggledState){
            $state.go(toggledState);
        };

        vm.fullHour = "0h";

        vm.catche = function(){
            var testObject = [{
                name : 'sachilaRanawaka',
                stopTime : vm.stopTime 
            }];
            if(window.localStorage) {
                // localStorage can be used
                localStorage.setItem('sachilaRanawaka', JSON.stringify(testObject));
            } else {}
        }
 

        var proClient =  $serviceCall.setClient("getProjectsByUser","project");
        proClient.ifSuccess(function(response){
            var data = response.result
            vm.projectArr = [];
            for (var k=0; k <= data.length-1; k++){
                vm.projectArr.push({
                    proName : data[k].name,
                    proId : data[k].projectID
                })          
            }
        })
        proClient.ifError(function(data){
            console.log("error loading project data")
        })
        proClient.skip("0");
        proClient.take("100");
        proClient.postReq({where : "projectStatus = 'Active' "});

        // load task from setting app 

        var client =  $serviceCall.setClient("getAllByQuery","setting");
        client.ifSuccess(function(response){
            var data = response[0];
            var settingTask = [];
            settingTask = data.preference.project.task;
            vm.addtasks = [];
            for (var i=0; i<=settingTask.length-1; i++){
                vm.addtasks.push({ 
                    thr: settingTask[i].rate,
                    taskName : settingTask[i].task
                })
            }
        })
        client.ifError(function(data){
            console.log("error loading setting data")
        })
        client.postReq({
            "preference":"project"
        });
     

     

        var date = new Date();
        var d = date.getDate();
        var m = date.getMonth();
        var y = date.getFullYear();

        $rootScope.calendarArr = {};

        // To select a single date, make sure the ngModel is not an array.
        vm.selectedDate = new Date();
        vm.dayClick = function(date) {
            var key = [date.getFullYear(), numFmt(date.getMonth() + 1), numFmt(date.getDate())].join("-");
            if($rootScope.calendarArr.hasOwnProperty(key)){
                loadEvent($rootScope.calendarArr[key]);
            }else{
                newEventdialog(date);
            }   
        };

        vm.testDate = false;
        var numFmt = function(num) {
            num = num.toString();
            if (num.length < 2) {
                num = "0" + num;
            }
            return num;
        };

        var loadContentAsync = true;
        vm.setDayContent = function(date){
            var key = [date.getFullYear(), numFmt(date.getMonth() + 1), numFmt(date.getDate())].join("-");
            var data = ($rootScope.calendarArr[key] || [{
                name: ""
            }])[0].name;
            if (loadContentAsync) {
                var deferred = $q.defer();
                $timeout(function() {
                    deferred.resolve(data);
                });
                return deferred.promise;
            }
            return data;
        }
        function loadEvent(obj){
            $mdDialog.show({
                templateUrl: 'app/main/projects/dilaogs/timePop/timesheet.html',
                controller: 'viewEventCtrl',
                controllerAs : 'vm',
                locals : {
                    eventObj : obj,
                    fullTime : vm.fullHour
                }
            }).then(function(obj){ 
                addToCalendar(obj)
                vm.fullHour = angular.copy(obj.fullTime)
            });
        }

        function newEventdialog(selectedDate){
            $mdDialog.show({
                templateUrl: 'app/main/projects/dilaogs/timePop/timesheet.html',
                controller: 'newEventCtrl',
                controllerAs: 'vm',
                locals : {
                    selectedDate : selectedDate
                }
            }).then(function(obj){ 
                if (obj) {
                    addToCalendar(obj) 
                    calculateTime(obj); 
                }else{
                    $scope.$broadcast('close_calender');
                }
            });
        }

        function addToCalendar(obj){
            if (obj) {                  
                $rootScope.calendarArr[obj.date] = [];
                $rootScope.calendarArr[obj.date].push(obj)
                vm.eventTime = obj.hour; 
                vm.newObj = {};
                vm.newObj = obj;
                MaterialCalendarData.setDayContent(obj.fullDate, $interpolate('<p style="color:white"> {{eventTime}}</p>    <div style="margin-top: -16px;"><md-checkbox class="md-warn" ng-checked="{{newObj.status}}" style="margin-left: 0px;" aria-label="Bilable"><span style="margin-left:0px;color:white;">Bilable</span> </md-checkbox></div>')(vm));
                
            };

        }

        function calculateTime(obj){ 
            
            var hour = 0;
            var minute = 0; 
            var arr = obj.hour.split(" "); 

            if (arr.length == 1) { 
                if (!oneTime(arr[0])) {
                    if (!isNaN(arr[0])) {
                        hour = parseInt(arr[0]); 
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
                    hour += parseInt(element.split(element[element.length - 1])[0]);
                    return true;
                }else if (element.match(/^\d{1,2}[mM]$/i)) {
                    minute += parseInt(element.split(element[element.length - 1])[0]);
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


            if (vm.fullHour != "") {
                var timesheetHour = parseInt(vm.fullHour.split("h")[0])
                var timesheetMinute = parseInt(vm.fullHour.split("h")[1].split("m")[0]) || 0
                var totalHour = timesheetHour + hour;
                var totalMinute = timesheetMinute + minute;
                var hrInMin = Math.floor(totalMinute / 60)
                if (hrInMin > 0) {
                    totalHour += hrInMin
                    totalMinute = totalMinute % 60
                }

                vm.fullHour = (totalMinute.toString().length == 2) ?totalHour + "h "+totalMinute + "m" : totalHour + "h "+ "0" + totalMinute + "m" // add additional zoro to in front of minutes are only single number 

            }else{
                vm.fullHour = obj.hour
            }

            console.log(vm.fullHour)
        }

        function timeError(){            
            vm.showMsg = true;
            vm.submitProgress = false;
            vm.errorMsg = "invalid time format please follow '12h 40m' format";
            throw new Error("invalid time format please follow '12h 40m' format");
        }
 

    

        vm.projectSelect = function(item){ 
            var obj = JSON.parse(item)
            var client =  $serviceCall.setClient("getTaskByID","project");
            client.ifSuccess(function(data){ 
                setTaskByID(data.result)
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
        vm.submit = function(){
            if (!vm.selectProject) {
                $mdDialog.show(
                  $mdDialog.alert()
                  .parent(angular.element(document.body))
                  .title('Select a Project')
                  .content('please select a project ')
                  .ariaLabel('Alert Dialog Demo')
                  .ok('OK')
                  .targetEvent()
                );
            }else if(!vm.task){
                $mdDialog.show(
                  $mdDialog.alert()
                  .parent(angular.element(document.body))
                  .title('Select a Task')
                  .content('please select a Task ')
                  .ariaLabel('Alert Dialog Demo')
                  .ok('OK')
                  .targetEvent()
                );
            }else{
                vm.submitProgress = true;

                if (typeof vm.selectProject != 'object')  
                    vm.selectProject = JSON.parse(vm.selectProject)

                vm.timesheet.project = vm.selectProject.proName;
                vm.timesheet.projectID = vm.selectProject.proId;

                if (typeof vm.task != 'object')  
                    vm.task= JSON.parse(vm.task) 
                
                vm.timesheet.task = vm.task.taskName;
                vm.timesheet.rate = vm.task.rate;

                var apis = $apis.getApis();

                vm.timesheet.user = {
                    firstName : $userDetails.getName(),
                    email : apis.getMail(),
                    roleName :  $userDetails.getRole(),
                    lastName : ""
                }

                var serviceObj = {
                    "timesheet" : [],
                    "image" :"",
                    "appName" : "Projects",
                    "permissionType" : "add"
                },

                timesheet = [],
                ticket = $projectEvent.returnFUllArr();

                if (ticket && ticket.length > 0) { 
                    for (var i=0;i<=ticket.length-1; i++){
                        var backup = angular.copy(vm.timesheet);
                        backup.date =  angular.copy(ticket[i].fullDate);
                        backup.totalHour = getTheHours(ticket[i].hour);
                        backup.billableStatus = (ticket[i].status) ? "Billable" : "Non-Billable";
                        timesheet.push( backup);
                    }
                }
                serviceObj.timesheet = timesheet;


                var client =  $serviceCall.setClient("insertMultipleTimesheet","project");
                client.ifSuccess(function(data){  
                    if (data.statusCode == 200){
                        $mdToast.show(
                              $mdToast.simple()
                                .textContent('Successfully inserted')
                                .position('top right' )
                                .hideDelay(3000)
                            ); 
                        $state.go("app.projects.timesheet")
                    }
                });
                client.ifError(function(data){              
                    $mdDialog.show($mdDialog.alert().parent(angular
                        .element(document.body))
                        .title('Error occure')
                        .content('There was an error inserting the data.')
                        .ariaLabel('Alert Dialog Demo')
                        .ok('OK')
                        .targetEvent());

                    vm.submitProgress = false;
                })
                client.postReq(serviceObj);
            }
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
    }    
})();
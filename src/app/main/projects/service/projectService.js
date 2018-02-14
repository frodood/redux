(function(){
    'use strict'; 

    angular
        .module('app.projects')
        .factory('$projectEvent',projectEvent);

        projectEvent.$inject = [];

        function projectEvent(){

            var eventArr = {};
            var eventFullArr = [];
            var numFmt = function(num) {
                num = num.toString();
                if (num.length < 2) {
                    num = "0" + num;
                }
                return num;
            };
            return  {
                addEvent : function(times,date,bilable,type){ 
                    eventArr = {};
                    switch(type){
                        case "new"  :   var key = [date.getFullYear(), numFmt(date.getMonth() + 1), numFmt(date.getDate())].join("-");
                                        eventArr = {hour: times , date: key,fullDate: date, status: bilable };
                                        eventFullArr.push(eventArr)
                                        break;

                        case "return"   :   var key = [date.getFullYear(), numFmt(date.getMonth() + 1), numFmt(date.getDate())].join("-");
                                            eventArr = {hour: times , date: key,fullDate: date, status: bilable };
                                            eventFullArr.push(eventArr)
                                            return eventArr;
                                            break;

                        case "update"   :   var key = [date.getFullYear(), numFmt(date.getMonth() + 1), numFmt(date.getDate())].join("-");
                                            eventArr = {hour: times , date: key,fullDate: date, status: bilable };
                                            if (eventFullArr && eventFullArr.length > 0) {
                                                for (var i=0; i<=eventFullArr.length-1; i++){
                                                    if (eventFullArr[i].date === key) {
                                                        eventFullArr[i] = eventArr
                                                    }
                                                }
                                            }


                        default : console.log("type is invalid");
                    }               

                },
                returnAllEvents : function(){
                    return eventArr;
                },
                returnFUllArr : function(){
                    return eventFullArr
                },
                removeItem: function(){
                    eventFullArr = [];
                }

            }
        }

    angular
        .module('app.projects')
        .factory('$userDetails',userDetails);

        userDetails.$inject = [];

        function userDetails(){
            var userRole; 
            var userName;
            return{
                getRole : function(){
                    return userRole;
                },
                setRole : function(_obj){
                    userRole = _obj.roleName
                },
                getName : function(){
                    return userName;
                },
                setName : function(_name){
                    userName = _name
                }
            }
        } 


       


    angular
        .module('app.projects')
        .factory('$timeSheetVals',timeSheetVals)
        .directive('timeTracker',timeTracker)
        .controller('timeTrackerCtrl',timeTrackerCtrl);

        function timeTracker(){
            var directive= {
                restrict: 'E'
                , template: '<div style="position: absolute; z-index: 100; bottom: 0; right: 100px;min-width:  305px; max-width: 333px;overflow: hidden;" > <md-card > <md-card-content  style="background-color: rgba(0, 0, 0, 0.09);"> <div> <label style="font-size: 16px;position: relative;top: -4px;">{{vm.timeStatus | timerFilter }}</label>  <md-button ng-show="vm.startButton" type="button" class="md-icon-button" ng-click="vm.startTimer()" autofocus> <md-icon  md-font-icon="icon-play"> </md-icon><md-tooltip>Start</md-tooltip>  </md-button> <md-button ng-show="vm.pauseButton" type="button" class="md-icon-button" ng-click="vm.pauseTimer()" > <md-icon  md-font-icon="icon-pause"> </md-icon><md-tooltip>Pause</md-tooltip> </md-button> <md-button ng-show="vm.stopButton" type="button" class="md-icon-button" ng-click="vm.stopTimer()" > <md-icon md-font-icon="icon-stop"></md-icon><md-tooltip>Stop</md-tooltip> </md-button> <md-button type="button" class="md-icon-button" ng-click="vm.resetTimer()"><md-icon md-font-icon="icon-camera-timer"> </md-icon> <md-tooltip>Reset</md-tooltip> </md-button> </div> <div ></div></md-card-content></md-card></div>'
                , controller: timeTrackerCtrl
                , controllerAs : 'vm'
                , scope: {
                    timeStatus: '=',
                    catchName: '='
                }
            }
            return directive;            
        }

        timeTrackerCtrl.$inject = ["$scope", "$interval","$state", "$mdDialog","$projectEvent", "$timeout","$rootScope", "$window", "$filter", "MaterialCalendarData", "$interpolate","$timeSheetVals"];
        
        timeSheetVals.$inject = [];


        function timeTrackerCtrl($scope, $interval,$state, $mdDialog,$projectEvent, $timeout, $rootScope, $window, $filter, MaterialCalendarData, $interpolate,$timeSheetVals){
            var vm = this;

            vm.timeStatus = 0;
            //vm.startTime = 0;
            vm.lapTime = 0;
            vm.laps = [];
            vm.timerStatus = false;
            vm.todayDate = new Date();
            $timeout(function () {
                vm.startButton = true;
                vm.stopButton = false;
                vm.pauseButton = false;
                vm.initCatch();
            }, 1000);

            vm.initCatch = function () {
                if (localStorage.getItem(vm.catchName)) {
                    vm.remainTime = localStorage.getItem(vm.catchName);
                    console.log(JSON.parse(vm.remainTime));
                    var arr = JSON.parse(vm.remainTime);
                    if (vm.remainTime) {
                        vm.startButton = false;
                        vm.stopButton = true;
                        vm.pauseButton = true;
                        console.log("init working")
                        var strtTime = arr[0]['startTime'];
                        // var edTime = arr[0]['endTime'];
                        // console.log(new Date(edTime));
                        // console.log(new Date(strtTime))
                        vm.timeDiff = new Date()
                            .getTime() - new Date(strtTime)
                            .getTime();
                        console.log((vm.timeDiff))
                        vm.timeStatus = vm.timeDiff / 10;
                        runTimer();
                    };
                };
            }

            function saveToCatch() {
                var arr = [];
                var jsonArr = [];
                if (window.localStorage) {
                    if (localStorage.getItem(vm.catchName)) {
                        var arr = localStorage.getItem(vm.catchName);
                        var jsonArr = JSON.parse(arr);
                        // jsonArr[0]['startTime']  = angular.copy(jsonArr[0]['startTime'])
                        // jsonArr[0]['endTime'] = new Date();
                        console.log(JSON.stringify(jsonArr))
                        localStorage.setItem(vm.catchName, JSON.stringify(jsonArr));
                    }
                }
            }

            window.addEventListener("focus", function (event) {
                console.log("focus")
                vm.initCatch();
            });

            window.addEventListener("blur", function (event) {
                console.log("blur")
                saveToCatch();
            });

            window.addEventListener("beforeunload", function (e) {
                console.log("close working")
                saveToCatch();
            });

            vm.startTimer = function () {
                vm.startTime = vm.timeStatus;
                vm.startButton = false;
                vm.stopButton = true;
                vm.pauseButton = true;
                // catch data 
                if (!localStorage.getItem(vm.catchName)) {
                    var testObject = [{
                        name: vm.catchName
                        , startTime: new Date()
                }];
                    localStorage.setItem(vm.catchName, JSON.stringify(testObject));
                };
                runTimer();
            }

            vm.pauseTimer = function () {
                vm.pauseButton = false;
                vm.startButton = true;
                vm.timerStatus = !vm.timerStatus;
                if (vm.timeRun) {
                    $interval.cancel(vm.timeRun);
                    vm.startTime = vm.timeStatus;
                }
                console.log(vm.timeStatus / 100);
                vm.result = vm.timeStatus;
            }

            function runTimer() {
                if (vm.timeRun) {
                    $interval.cancel(vm.timeRun);
                }
                vm.timeUpdate = function () {
                    vm.timeStatus++;
                }
                vm.timeRun = $interval(vm.timeUpdate, 10);
            }

            vm.stopTimer = function () {
                vm.startButton = true;
                vm.stopButton = false;
                vm.pauseButton = false;
                if (window.localStorage) {
                    localStorage.removeItem(vm.catchName);
                };
                vm.timerStatus = !vm.timerStatus;
                if (vm.timeRun) {
                    $interval.cancel(vm.timeRun);
                    vm.startTime = vm.timeStatus;
                }
                console.log(vm.timeStatus / 100);
                vm.result = vm.timeStatus;
                loadNewEvent(function () {
                    vm.timeStatus = 0;
                    if(!vm.$$phase) {
                        vm.$apply();
                    }
                });
            }

            vm.resetTimer = function () {
                vm.startButton = true;
                vm.stopButton = false;
                vm.pauseButton = false;
                if (window.localStorage) {
                    localStorage.removeItem(vm.catchName);
                };
                vm.timeStatus = 0;
                vm.laps = [];
                $interval.cancel(vm.timeRun);
            }

            vm.lapTimer = function () {
                //console.log("Start Time 0: " + vm.startTime);
                vm.lapTime = vm.timeStatus - vm.startTime;
                //console.log("Status Time : " + vm.timeStatus);
                //console.log(vm.lapTime + " = " + vm.timeStatus + " - " +  vm.startTime);
                vm.startTime = vm.timeStatus;
                vm.laps.push(vm.lapTime);
            }

            vm.getTotal = function () {
                var total = 0;
                if (vm.laps.length == 0) {
                    total = 0;
                } else {
                    for (var i = 0; i < vm.laps.length; i++) {
                        total += vm.laps[i];
                    }
                    return total / 100 + " Sec";
                }
            }

            function loadNewEvent(callback) {
                vm.time = $filter('minuteFilter') ( vm.timeStatus)
                $timeSheetVals.setHours( vm.time);
                vm.timeStatus = 0;
                if ($state.current.name === "app.projects.timeCompose") {
                    $state.go($state.current, {}, {reload: true});
                }else{
                    $state.go("app.projects.timeCompose");
                }
            }

            function newEventCtrl(vm, time, $projectEvent, date, $rootScope) {
                vm.time = $filter('timerFilter')(time * 100);
                vm.addButtonStatus = true;
                vm.addNewEvent = function () {
                    $projectEvent.addEvent(vm.time, date, vm.task, vm.project, vm.bilableCheck, "new");
                    $mdDialog.hide($projectEvent.returnAllEvents());
                    //$mdDialog.hide();
                }
                vm.closeDialog = function () {
                    $mdDialog.hide();
                }
            }
        }

        function timeSheetVals(){

            var bhours = "";
            return {
                setHours : function(hour){
                    bhours = hour;
                },
                getHours : function(){
                    return bhours;
                }
            }
        }


    angular
        .module('app.projects')
        .filter('timerFilter',timerFilter);

        timerFilter.$inject = [];

        function timerFilter(){
            return function (time) {
                var ms = time;
                var seconds = Math.floor(ms / 100) % 60;
                var minutes = Math.floor(ms / 6000);
                var hours = Math.floor(ms / 360000);
                //var days = Math.floor(ms/ 8640000);
                if (minutes >= 60) minutes = minutes % 60;
                //if (hours >= 24) hours = hours % 24;
                if (hours < 10) {
                    hours = "0" + hours;
                }
                if (minutes < 10) {
                    minutes = "0" + minutes;
                }
                if (seconds < 10) {
                    seconds = "0" + seconds;
                }
                // return hours+':'+minutes+':'+seconds+':'+(ms%100);
                return hours + 'h ' + minutes + 'm ' + seconds + 's';
            }
        }

    angular
        .module('app.projects')
        .filter('minuteFilter',minuteFilter);

        minuteFilter.$inject = [];

        function minuteFilter(){
            return function (time) {
                var ms = time;
                var minutes = Math.floor(ms / 6000);
                var hours = Math.floor(ms / 360000);
                //var days = Math.floor(ms/ 8640000);
                if (minutes >= 60) minutes = minutes % 60;
                //if (hours >= 24) hours = hours % 24;
                if (hours < 10) {
                    hours = "0" + hours;
                }
                if (minutes < 10) {
                    minutes = "0" + minutes;
                }
                // return hours+':'+minutes+':'+seconds+':'+(ms%100);
                return hours + 'h ' + minutes + 'm';
            }
        }


    angular
        .module('app.projects')
        .directive('dragMe',dragMe);

        dragMe.$inject = [];

        function dragMe(){
            return {
                restrict: 'A',
                link: function(scope, elem, attr, ctrl) {
                    elem.draggable(); 
                }
            };
        }
})();
 
 


(function(){
    'use strict';
    angular
        .module('app.projects')
        .controller('newEventCtrl',newEventCtrl);

        newEventCtrl.$inject = ['$scope','selectedDate','$projectEvent','$mdDialog'];

        function newEventCtrl($scope,selectedDate,$projectEvent,$mdDialog){
            var vm = this;

            vm.addButtonStatus = true; 
            vm.bilableCheck = false;
            vm.status = false;

            vm.addNewEvent = function(){
                $projectEvent.addEvent(vm.time,selectedDate,vm.status,"new");
                $mdDialog.hide($projectEvent.returnAllEvents());
            }
            vm.closeDialog = function(){ 
                $mdDialog.hide();
            }
        }



    angular
        .module('app.projects')
        .controller('viewEventCtrl',viewEventCtrl);

        viewEventCtrl.$inject = ['$scope','eventObj','fullTime','$mdDialog','$projectEvent'];
        function viewEventCtrl($scope,eventObj,fullTime,$mdDialog,$projectEvent){
            var vm = this;

            vm.addButtonStatus = false;
            vm.time =  eventObj[0].hour;
            vm.fullDate = new Date(eventObj[0].fullDate);
            vm.status = eventObj[0].status;        

            vm.updateNewEvent = function(){     
                if (vm.time != eventObj[0].hour) {            
                    var oldHour = parseInt(eventObj[0].hour.split("h")[0]); 
                    var oldMinute = parseInt(eventObj[0].hour.split("h")[1].split("m")[0])  

                    var newHour = parseInt(vm.time.split("h")[0]); 
                    var newMinute = parseInt(vm.time.split("h")[1].split("m")[0]) 

                    var fullHour = parseInt(fullTime.split("h")[0]); 
                    var fullMinute = parseInt(fullTime.split("h")[1].split("m")[0]) 

                    fullHour -= oldHour;
                    fullMinute -= oldMinute;
                    if (fullMinute < 0) {
                        fullMinute = 60 + fullMinute
                        fullHour -= 1;
                    }

                    fullHour += newHour;
                    fullMinute += newMinute;
                    var hrInMin = Math.floor(fullMinute / 60)

                    if (fullMinute > 0) {
                        fullHour += hrInMin
                        fullMinute = fullMinute % 60
                    }
                    fullTime = (fullMinute.toString().length == 2) ?fullHour + "h "+fullMinute + "m" : fullHour + "h "+ "0" + fullMinute + "m" // add additional zoro to in front of minutes are only single number 


                    console.log(fullTime)
                }

                $projectEvent.addEvent(vm.time,vm.fullDate,vm.status,"update");
                var event = $projectEvent.returnAllEvents();
                event.fullTime = fullTime;
                $mdDialog.hide(event);
            }

            vm.closeDialog = function(){
                $mdDialog.hide();
            }
        }
})();

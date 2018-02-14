(function ()
{
    'use strict';

    var premissionType = ["admin","Super admin"];

    angular
        .module('app.projects')
        .controller('timesheetComposeControllerEdit', timesheetComposeControllerEdit);



    /** @ngInject */
    function timesheetComposeControllerEdit($scope,$state,$mdDialog,$serviceCall,$userDetails,$mdToast)
    {
    	var vm = this;

    	vm.projectSelect =  projectSelect;

        vm.toggleChildStates = toggleChildStates;

    	init();

    	function init(){
    		var client =  $serviceCall.setClient("getTimesheetByKey","project");
            client.ifSuccess(function(response){
                var data = response;     
                vm.timesheet = data;
                vm.timesheet.date = new Date( vm.timesheet.date);
                // vm.selectProject = JSON.stringify({
                //     proName : vm.timesheet.project,
                //     proId : vm.timesheet.projectID
                // })


                // vm.taskTime = {
                //     thr : vm.timesheet.rate,
                //     taskName : vm.timesheet.task
                // }  
                var fullHour = vm.timesheet.totalHour.split(".")[0] || 0,
                    fullMin  = vm.timesheet.totalHour.split(".")[1] || 0
         
                vm.timesheet.totalHour = angular.copy( fullHour + "h " + fullMin + "m ")
                
        		checkUser()
            })
            client.ifError(function(data){
                console.log("error loading setting data")
            })
            client.timesheetID($state.params.itemID);  
            client.getReq();
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
                    vm.timesheet.user = vm.userData[0];
                    vm.disableUser = true; 
                };
                getProByUser();
            })
            client.ifError(function(data){
                console.log("error loading setting data");
            }) 
            client.getReq();
        }

        function getProByUser(){
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
 
                var ind = vm.projectArr.findIndex(function(o){ return o.proId == vm.timesheet.projectID })
                vm.selectProject = JSON.stringify( vm.projectArr[ind]);
                projectSelect(vm.selectProject)

            })
            proClient.ifError(function(data){
                console.log("error loading setting data")
            })
            proClient.skip("0");
            proClient.take("50"); 
            proClient.getReq();
        }

        function projectSelect(item){
            var obj = JSON.parse(item)
            var client =  $serviceCall.setClient("getTaskByID","project");
            client.ifSuccess(function(data){ 

                setTaskByID(data.result)
                // getUserByID(obj);
 
                // if (vm.timeSheet.user) { 
                //     vm.timeSheet.user = vm.userData.find(function(o){o.email === vm.timeSheet.user.email })
                // }
 

                var ind = data.result.findIndex(function(o){ return o.taskName == vm.timesheet.task })
                vm.taskTime = JSON.stringify(data.result[ind]);

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

        function setUserByID(data){
            vm.userData = []; 
            vm.userData = data;
        }


        vm.submit = function(){
        	vm.submitProgress = true;
            debugger

            if (typeof vm.selectProject != 'object') 
                vm.selectProject = JSON.parse(vm.selectProject)

            vm.timesheet.project = vm.selectProject.proName;
            vm.timesheet.projectID = vm.selectProject.proId; 

            if (typeof vm.taskTime != 'object')  
                vm.taskTime= JSON.parse(vm.taskTime) 
     

            vm.timesheet.task = vm.taskTime.taskName;
            vm.timesheet.taskRate = vm.taskTime.rate;

            vm.timesheet.modifyUser = ""

            vm.timesheet.totalHour = getTheHours(vm.timesheet.totalHour); 
        
            var serviceObj = {
                "timesheet" : vm.timesheet,
                "image" :"",
                "appName" : "Projects",
                "permissionType" : "edit"
            } 

            var client =  $serviceCall.setClient("updateTimesheet","project");
            client.ifSuccess(function(data){  
            	vm.submitProgress = false;
                if (data.statusCode == 200)  {
                    $mdToast.show(
                      $mdToast.simple()
                        .textContent('Successfully Timesheet Edited')
                        .position('top right' )
                        .hideDelay(3000)
                    );
                    $state.go('app.projects.timesheet')
                }
            });
            client.ifError(function(data){      
            	vm.submitProgress = false;        
                $mdDialog.show($mdDialog.alert().parent(angular
                    .element(document.body))
                    .title('Error occure')
                    .content('There was an error while updating the data.')
                    .ariaLabel('Alert Dialog Demo')
                    .ok('OK')
                    .targetEvent());
            })
            client.postReq(serviceObj); 
        }


	    function toggleChildStates(toggledState){
	        $state.go(toggledState);
	    };


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
 
})();
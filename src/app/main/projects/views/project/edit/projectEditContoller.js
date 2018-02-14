(function(){
    'use strict';
    angular
        .module('app.projects')
        .controller('projectEditContoller',projectEditContoller);

    projectEditContoller.$inject = ["$scope","$rootScope","$state","$mdDialog","$serviceCall","$imageUploader"]

    function projectEditContoller($scope,$rootScope,$state,$mdDialog,$serviceCall,$imageUploader){

         
        var client,
            vm = this;

        vm.project = {};
        vm.task = {};
        vm.user = {};
        vm.balance = {};
        vm.proTasks = [];
        vm.userBackArr = [];


        $scope.$on('selectedProfile',function(event, args){  
            vm.selectedItem = args.slctdProfile;
        }); 

        /*
            declare class called 'proEdit'
        */
        var proEdit = (function(){
            var instance,
                cutomerNames = [],
                task = [],
                users = [],
                taskBackArr = [],
                userBackArr  = [];

            // constructor of the proedit class 
            function proEdit(){
                this.client;  
            }
            /*
               prototype methods of the 'proEdit'
            */
            proEdit.prototype = {
                /*
                     class method to load all the project releted details 
                */
                loadProject : function(){
                    this.client =  $serviceCall.setClient("getAllByProjectID","project"); // method name and service
                    this.client.ifSuccess((function(response){  //sucess
                        var data = response.result;
                        console.log(data) 
                        vm.project = data.project[0];
                        vm.task = data.task;
                        vm.user = data.user;
                        vm.balance = data.balance[0]; 
                        vm.project.date = (vm.project.date) ? new Date(vm.project.date) : new Date();
                        this.setTaskItem().setUserItems().setCustomerByID(vm.project).onChange (vm.project.billingMethod);                     

                    }).bind(this)) // send this to callback function otherwise can't call prototype methods inside callback
                    this.client.ifError(function(data){ //falce
                        console.log("error loading setting data")
                    }) 
                    this.client.projectID($state.params.itemID); // send projectID as url parameters
                    this.client.getReq(); // get request if post then use 'postReq('jsonbody')'
                    return this;
                },
                /*
                    load all project task to the 'vm.proTasks' array and 
                    display that array in the UI
                */
                setTaskItem : function(callback){
                    if (vm.project.tasks.length > 0) {
                        vm.proTasks = [];
                        for (var i=0; i<=vm.project.tasks.length-1; i++) {
                            var obj= angular.copy(vm.project.tasks[i]);
                            obj.taskItem = angular.copy( vm.project.tasks[i]);
                            taskBackArr.push(obj);
                            vm.proTasks.push(obj);
                        }
                    }
                    return this;
                },

                setUserItems : function(){
                    for (var i=0; i<=vm.project.staffs.length-1; i++) {  
                        var obj = angular.copy( vm.project.staffs[i]);                        
                        vm.userBackArr.push({ 
                            shr :vm.project.staffs[i].shr,
                            firstName : vm.project.staffs[i].userItem.firstName,
                            roleName : (vm.project.staffs[i].userItem.roleName) ? vm.project.staffs[i].userItem.roleName : "",
                            lastName : (vm.project.staffs[i].userItem.lastName) ? vm.project.staffs[i].userItem.lastName : "",
                            email : vm.project.staffs[i].email
                        }); 
                    } 

                    return this;
                },
                /*
                    in auto complete set the customer object by profile ID
                */
                setCustomerByID : function(item){
                    if (item.profileName !== "-1") {
                        var client = {
                                display: item.customerNames,
                                value: item
                        }  
                        $rootScope.$broadcast('extupslctusr', client); 
                    }
                    return this;
                },
                /*
                    change the fields according to the billing method 
                    pass the billing method as the parameter
                */
                onChange : function(_type){
                    switch(_type){
                        case "Hourly Staff Rate" :
                            vm.staffHourRateDisable = false;
                            vm.showbilMethodDiv = true;
                            vm.hourlyRateVisible = false;
                            vm.flatProjectVisible = false;
                            vm.taskHourRateDisable = true;
                            break;
                        case "Hourly Task Rate":
                            vm.hourlyRateVisible = false;
                            vm.flatProjectVisible = false;
                            vm.staffHourRateDisable = true;
                            vm.taskHourRateDisable = false;
                            vm.showbilMethodDiv = true;
                            break;
                        case "Hourly Project Rate":
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
                            console.log("no such type")
                    }
                    return this;
                },
                /*
                    load all the customers to the autocomplete 
                */
                loadCustomers : function(){
                    this.client =  $serviceCall.setClient("getAllByQuery","profile");
                    this.client.ifSuccess((function(data){
                        if (Array.isArray(data)) {
                            for (var i = 0, len = data.length; i < len; ++i) {
                                cutomerNames.push({
                                    display: data[i].profileName,
                                    value: data[i].profileName.toLowerCase(), 
                                    email : data[i].email,
                                    profileID : data[i].profileID,
                                    cusAddress: data[i].billingAddress           
                                });
                            }
                        } 
                        this.loadSetting(); // load all task and users from setting 
                    }).bind(this));
                    this.client.ifError(function(data){
                        console.log("error loading setting data")
                    });
                    this.client.skip("0");
                    this.client.take("50");
                    this.client.class("Customer");
                    this.client.orderby("profileID");
                    this.client.isAscending("false");
                    this.client.getReq();

                    return this;
                },

                /*
                   change the state 
                */
                toggleChildStates : function (toggledState){
                    $state.go(toggledState);
                },
                /*
                    load all task and users from setting 
                */
                loadSetting : function(){
                    this.client =  $serviceCall.setClient("getAllByQuery","setting");
                    this.client.ifSuccess((function(data){ 
                        var data  = data[0];
                        var sample_task = data.preference.project.task;
                        var sample_user = data.user;
                        if (Array.isArray(sample_task) && sample_task.length > 0) {
                            for (var i=0; i<= sample_task.length-1; i++){
                                task.push({
                                    taskName : sample_task[i].task ,
                                    thr :sample_task[i].rate,
                                    id :sample_task[i].id
                                })
                            }
                        }
                        if (Array.isArray(sample_user) && sample_user.length > 0) {
                            for (var i=0; i<= sample_user.length-1; i++){
                                users.push({ 
                                    shr :sample_user[i].shr,
                                    firstName : sample_user[i].firstName,
                                    roleName : (sample_user[i].role) ? sample_user[i].role : "",
                                    lastName : (sample_user[i].lastName) ? sample_user[i].lastName : "",
                                    email : sample_user[i].email
                                })
                            }
                        }
                        this.removeDupTasks().removeDupUser();
                        
                    }).bind(this));
                    this.client.ifError(function(data){
                        console.log("error loading setting data")
                    })
                    this.client.postReq({
                        "preference":"project",
                        "setting":"profile",
                        "user" : "premissions"
                    });
                    return true;
                },

                removeDupTasks : function(){ 

                    vm.project.tasks.forEach(function(item){ 
                        
                        var i = task.length;
                        while (i--) {
                           if (  task[i].id === item.id)   {
                                task.splice(i,1);
                           }
                        }

                    }); 
                    return this;
                },

                removeDupUser : function(){
                    vm.project.staffs.forEach(function(item){
                        var i = users.length;
                        while (i--) {
                           if (  users[i].email === item.email)   {
                                users.splice(i,1);
                           }
                        }
                    })
                },

                taskSearch : function(query){   
                    var res = task.filter(function(obj){ 
                        return obj.taskName.toLowerCase().indexOf(query.toLowerCase()) != -1;
                    });  
                    return res;
                },

                userSearch : function(query){  
                    
                    var res = users.filter(function(obj){
                        return obj.firstName.toLowerCase().indexOf(query.toLowerCase()) != -1;
                    });   
                    return res;    
                },

                removeTask : function(index,item) {    
                    vm.proTasks.splice(index, 1); 
                    deleteKey(item.taskItem, index);
                    deleteKey(vm.taskText, index); 
                    if (taskBackArr[index]) {
                        task.push(taskBackArr[index]); 
                        deleteKey(taskBackArr, index); 
                    }
                },  

                removeStaff : function(index,item) {  
                    vm.project.staffs.splice(index, 1); 
                    deleteKey(vm.userText, index);   
                    item.userItem = null;
                    if (vm.userBackArr[index]) {
                        users.push(vm.userBackArr[index]);
                        deleteKey(vm.userBackArr, index);  
                    }
                },
                /*
                    add new empty object to the task array 
                */
                addTask : function(){
                    var obj = {
                        tno : vm.proTasks.length + 1,
                        thr : "",
                        taskName : ""
                    }
                    obj.taskItem = '' ;
                    vm.proTasks.push(obj)

                    return this;
                },
                /*
                    add new empty object to the staff array 
                */
                addStaff : function(){
                    var obj = {
                        sno : vm.proTasks.length + 1,
                        shr : ""
                    }
                    obj.userItem = '' ;
                    vm.project.staffs.push(obj)

                    return this;
                },

                openBrochure : function(){ 
                    fileUploaderProject.uploadFile()
                    fileUploaderProject.result(function(arr){
                        vm.imageArray = [];
                        vm.imageArray = arr;
                    })
                },

                taskChange : function(index,item){  
                    debugger
                    if (item && item.taskName) { 
                        vm.proTasks[index].taskName = item.taskName ;
                        vm.proTasks[index].thr = item.thr;   
                        vm.proTasks[index].taskItem.tno = vm.proTasks.length + 1;  
                        removeDup();   
                    }else{
                        if (taskBackArr[index]) {
                            var checkV = false;

                            for(var i=0; i<=task.length-1; i++){
                                if (taskBackArr[index].id === task[i].id) {
                                    checkV = true;
                                    break;
                                }
                            }
                            if (!checkV) {
                                task.push(taskBackArr[index])
                            }                            
                        }
                    }

                    function removeDup(){
                        taskBackArr[index] = angular.copy(item);
                        removeItem();
                    }

                    function removeItem(){
                        for(var i=0; i<=task.length-1; i++){
                            if (item.id === task[i].id) {
                                 task.splice(i,1)
                            }
                        }
                    }
                },

                userChange : function(index,item){  
                    if (item && item.firstName) {
                        vm.project.staffs[index].staffname = item.firstName + " " + item.lastName;
                        vm.project.staffs[index].email = item.email;
                        removeDup();   
                    }else{
                        if (userBackArrv[index]) {
                            var checkV = false;

                            for(var i=0; i<=users.length-1; i++){
                                if (userBackArr[index].id === users[i].id) {
                                    checkV = true;
                                    break;
                                }
                            }
                            if (!checkV) {
                                users.push(userBackArr[index])
                            }                            
                        } 
                    }

                    function removeDup(){
                        vm.userBackArr[index] = angular.copy(item);
                        removeItem();
                    }

                    function removeItem(){
                        for(var i=0; i<=users.length-1; i++){
                            if (item.email === users[i].email) {
                                users.splice(i,1)
                            }
                        }
                    } 
                },

                /*
                    when staff or task item change, current object details will get updated 
                */
                itemChange : function(_index,_item,_type){
                    switch(_type){
                        case 'task' :                    
                            if (_item && _item.taskItem) {
                                vm.proTasks[_index].taskName = _item.taskName ;
                                vm.proTasks[_index].thr = _item.thr;  
                                vm.proTasks[_index].taskItem.tno = _item.tno;  
                            }
                            break;
                        case 'user' :
                            if (_item) {
                                vm.project.staffs[_index].shr = _item.shr ; 
                                vm.project.staffs[_index].sno = _item.sno ; 
                            }
                            break;
                        default :
                            console.log("no such type")
                    }
                }, 
                /*
                    form submit
                */
                submit : function(){
                    vm.submitProgress = true;

                    uploadImage((function(){
                        vm.project.tasks = []; 
                        for (var i=0; i<= vm.proTasks.length-1; i++){
                            vm.project.tasks.push(vm.proTasks[i].taskItem);
                        } 
                        if ( vm.selectedItem && vm.selectedItem.profileName){
                            vm.project.customerNames = vm.selectedItem.profileName;
                            vm.project.profileID = vm.selectedItem.profileID;

                        }else{
                            vm.project.customerNames = "internal";
                            vm.project.profileID = "-1"
                        }
                        var serviceObj = {
                            "project" : vm.project,
                            "image" : vm.project.uploadImage,
                            "appName" : "Projects",
                            "permissionType" : "edit"
                        } 
                        this.client =  $serviceCall.setClient("update","project");
                        this.client.ifSuccess(function(data){ 

                            if (data.statusCode == 200) 
                                $state.go("app.projects.pro.detail",{itemID :data.ID })
                        });
                        this.client.ifError(function(data){              
                            console.log(data);
                            vm.submitProgress = false;
                        })
                        this.client.postReq(serviceObj); 
                    }).bind(this));
                }
            }
            return {
                // singleton method return the current instance or  create new one 
                getInstance: function(){
                    if (instance == null) {
                        instance = new proEdit();
                        // Hide the constructor so the returned objected can't be new'd...
                        instance.constructor = null;
                    }
                    return instance;
                }
            } 
        })() 

        /*
           upload image to the relevent service and 
           update the project object
        */
        var uploadImage  = function(callback){
            if (vm.imageArray && vm.imageArray.length > 0) {
                for (var indexx = 0; indexx < vm.imageArray.length; indexx++) { 
                    var client = $imageUploader.setImage(vm.imageArray[indexx].uniqueCode,'project');
                    client.ifSuccess(function(data){

                    });
                    client.ifError(function(data){ 

                    });
                    client.sendImage(vm.imageArray[indexx])         
                }
            }
            callback();
        }
        
        /*
            create a new object to the 'proView' class and call several methods 
        */
        client = proEdit.getInstance();
        client.loadProject().loadCustomers(); 
        /*
            call the prototype 'onchange' method and change the rate fields according to the type
        */
        vm.onChange = client.onChange; 
        /*
            need to add new object to the task array when the addtask function executes
        */ 
        vm.addTask = client.addTask
        /*
            need to add new object to the user array when the addStaff function executes
        */ 
        vm.addStaff = client.addStaff 
        /*
            if task or user is change in autocomplete then this function will execute,
            new object will not add to the task or user array instead current object will be updated
        */ 
        vm.itemChange  = client.itemChange
        /*
            remove task from the relevent array 
        */
        vm.removeTask = client.removeTask
        /*
        /*
            remove Staff from the relevent array 
        */
        vm.removeStaff = client.removeStaff
        /*
            execute when form submit
        */
        vm.submit = client.submit
        /*
            filter the tasks 
        */

        vm.taskSearch = client.taskSearch;

        /*
            filter the users 
        */
        vm.userSearch = client.userSearch;

        /*
            change the state
        */
        vm.toggleChildStates = client.toggleChildStates;

        /*
            upload image function
        */
        vm.openBrochure = client.openBrochure;

        /*
            change the task
        */
        vm.taskChange = client.taskChange;
        /*
            change the user
        */
        vm.userChange = client.userChange;



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
        };
    }
})();

 

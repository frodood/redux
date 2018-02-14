(function(){
    'use strict';
    angular
        .module('app.projects')
        .controller('billCustomerCtrl',billCustomerCtrl);

        billCustomerCtrl.$inject = ['$scope','$mdDialog','$serviceCall','$stateParams','$q','$state','$mdToast'];

        function billCustomerCtrl($scope,$mdDialog,$serviceCall,$stateParams,$q,$state,$mdToast){            
            var vm = this,
                client,
                user,
                task,
                balance,
                project,
                billingObj = {},
                expenseData = [];


            vm.cb1 = false; //initaly checkbox1 will be unchecked 
            vm.cb2 = false; //initaly checkbox2 will be unchecked 
            vm.cb2Status = false // initiallyy checkbox2 is enable

            vm.submit = submit;

            vm.changeExpense = changeExpense;

            vm.closeDialog = closeDialog;

            vm.changeDate = changeDate

            /*
                create javascript class called billPro for hourly rate
            */

                var billPro = function(){
                    this.client; 
                }

            /*
                create javascript class called expensePro for get expenses
            */
                var expensePro = function(){        
                    this.client; 
                }

            /*
                this function will get the all the expenses relevent to the project id 
            */

                expensePro.prototype.getExpenseByID = function(){
                    this.client = $serviceCall.setClient("getExpenseByTypeAndTypeID","expense");
                    this.client.ifSuccess(function(data){
                        expenseData = data.result;       
                    });
                    this.client.ifError(function(data){
                        console.log("error loading expense data")
                    });
                    this.client.type("project");
                    this.client.typeID($stateParams.itemID);
                    this.client.getReq();

                    return this;
                }
            /* 
                when selecting the expense method this function will excecute
                check box will disabled according to the expense method 
            */
                expensePro.prototype.onChangeExpense = function(expenseMethod){
                    switch(expenseMethod){
                        case "iuep":
                            vm.cb2Status = true;
                            break;
                        case "ibep":            
                            vm.cb2Status = false;
                            break;
                        default:
                            console.log("no such type")
                    }
                    return this;
                }


            /*
                after form submit only, will come to this function 
                will check the expense method and redirect to the 
                relevent function 
            */

                expensePro.prototype.calcExpense = function(_type){

                    switch(_type){
                        case "iuep":
                            calc_other(expenseData)
                            break;
                        case "ibep":            
                            calc_ibep(expenseData);
                            break;
                        default:
                            console.log("no such type")
                    }
                    return this;
                }

            /*
                return the 'billPro' class instance 
            */
                expensePro.prototype.getBill = function(){
                    return new billPro();
                }

            /*  
                these are prototype class methods derived from the 'billPro' class
                in order to call this function need to create a object to this class and then call the function 
                eg :     
                    var client = new billPro();
                    client.getProject();

            */
                billPro.prototype.getProject = function(){ 
                    this.client =  $serviceCall.setClient("getAllByProjectID","project"); // method name and service
                    this.client.ifSuccess(function(data){  //sucess 
                        var data = data.result;
                        project = data.project[0];
                        task = data.task;
                        user = data.user;
                        balance = data.balance[0];
                        vm.billingMethod = project.billingMethod;
                        var onClient = new billPro(); // need to create new object to this class to access the 'onChangeBill' since its calling inside callback funciton 
                        onClient.onChangeBill(vm.billingMethod);
                        
                    })
                    this.client.ifError(function(data){ //falce
                        console.log("error loading setting data")
                    })
                    this.client.projectID($stateParams.itemID); // send projectID as url parameters
                    this.client.getReq();
                    return this;
                }

            /*
                return the 'expensePro' class instance 
            */
                billPro.prototype.getExpense = function(){
                    return new expensePro();
                }

            /* 
                when selecting the billing method this function will excecute
                check box will disabled according to the billing method 
            */
                billPro.prototype.onChangeBill = function(billMethod){
                    switch(billMethod){
                        case "Hourly Staff Rate" :
                            vm.cb1Status = false;
                            break;
                        case "Hourly Task Rate" :
                            vm.cb1Status = false;
                            break;
                        case "Hourly Project Rate" :
                            vm.cb1Status = true;
                            break;
                        case "Flat Project Amount" :
                            vm.cb1Status = true;
                            break;
                        default:
                            console.log("no such type exsist")
                    } 
                }

            /*
                after the form submit, ck the billing method
                if the billing method is "Hourly Staff Rate" or "Hourly Task Rate" then this function will trigger,
                pass the relevent object array and type ("Hourly Staff Rate" or  "Hourly Task Rate") as parameters 
            */
                billPro.prototype.get_HSR_HTR = function(_arr,_type){        
                    billingObj.billItems = [];
                    if (vm.cb1) {
                        if ( _arr.length > 0) { 
                            var billableTot  = 0,
                                billedTot    = 0,
                                nonBilledTot = 0,
                                pendingTot   = 0,
                                totalCost    = 0;

                            for (var i=0; i<=_arr.length-1; i++){
                                billableTot     = sumTime(_arr[i].bilable,billableTot);
                                nonBilledTot    = sumTime(_arr[i].nonBilable,nonBilledTot);
                                billedTot       = sumTime(_arr[i].billed,billedTot);
                                pendingTot      = sumTime(_arr[i].pending,pendingTot);
                                totalCost       = hrCost(_arr[i],totalCost); // calculate the total cost                     
                            }

                            billingObj.billItems.push({
                                product : project.name,
                                quantity : 1,
                                price : totalCost,
                                total : totalCost,
                                optional : vm.dateFrom + " to " + vm.dateTo 
                            })
                        }
                    }else if (!vm.cb1) {
                        if ( _arr.length > 0) {
                            for (var i=0; i<=_arr.length-1; i++){
                                billingObj.billItems.push({
                                    product : project.name,
                                    quantity : _arr[i].pending,
                                    price : (_type === "hsr") ? parseInt( _arr[i].shr ) : parseInt( _arr[i].thr ) ,
                                    total : hrCost(_arr[i]), // since this is one time cost sum no need to pass total 
                                    optional : vm.dateFrom + " to " + vm.dateTo 
                                })
                            }
                        }
                    } 

                    return this;
                }

                /*
                    after the form submit, ck the billing method
                    if the billing method is "hourly project Rate" or "flat project amount" then this function will trigger,
                    pass the relevent object and type ("hourly project Rate" or  "flat project Amount") as parameters 
                */


                billPro.prototype.get_HPR_FPR = function(_obj,_type){
                    billingObj.billItems = [];   
                    if (typeof _obj === 'object') {
                        billingObj.billItems.push({
                            product :  project.name,
                            quantity : 1,
                            price :  get_hpe_fpr_cost(_obj,project,_type),
                            total :  get_hpe_fpr_cost(_obj,project,_type),
                            optional : vm.dateFrom + " to " + vm.dateTo
                        })
                    }
                    return this;
                }
                /*

                    adjust min and max date acording to the from and to dates 

                */


                billPro.prototype.changeDate = function(){

                    if (vm.dateFrom && !vm.dateTo) {
                        vm.minDateFrom = vm.dateFrom;
                    }else if (!vm.dateFrom && vm.dateTo) {
                        vm.maxDateTo = vm.dateTo;
                    }else if (vm.dateFrom && vm.dateTo) {
                        vm.maxDateTo = vm.dateTo;
                        vm.minDateFrom = vm.dateFrom;
                    }

                    return this;
                }


                /*
                    pass the billing object to the prject serive     
                */

                billPro.prototype.billToService = function(){
                    billingObj.projectID = project.projectID;
                    billingObj.name = project.name;
                    billingObj.customerNames = project.customerNames;
                    billingObj.billingMethod = project.billingMethod;
                    billingObj.expenseMethod = vm.expenseMethod;
                    billingObj.dateFrom = vm.dateFrom;
                    billingObj.dateTo = vm.dateTo;
                    

                    var serviceObj = {
                        projectBill : billingObj
                    }

                    this.client = $serviceCall.setClient("insertBillData","project");
                    this.client.ifSuccess(function(data){
                        $mdToast.show(
                          $mdToast.simple()
                            .textContent('Successfully saved')
                            .position('top right' )
                            .hideDelay(3000)
                        );

                        $state.go('app.invoices.compose',{ Data : {billID : data.ID,profileId : project.profileID},appName: 'project'})
                        $mdDialog.hide();
                    });
                    this.client.ifError(function(data){
                        console.log("error occure while billing the project")
                    });
                    this.client.postReq(serviceObj)
                    return this;
                }


            /*
                create instance to billPro class and call chain methods
                client is not the class variable its global variable 
            */
                self.client = new billPro();
                self.client.getProject().getExpense().getExpenseByID();

            /*
                execute when the dialog box sbmited
            */
                function submit(){
                    self.client = new billPro();

                    switch(vm.billingMethod){
                        case "Hourly Staff Rate" :
                            self.client.get_HSR_HTR(user,'hsr').getExpense().calcExpense(vm.expenseMethod).getBill().billToService(); // pass the array and type and call the service
                            break;
                        case "Hourly Task Rate" :
                            self.client.get_HSR_HTR(task,'htr').getExpense().calcExpense(vm.expenseMethod).getBill().billToService(); // pass the array and type and call the service
                            break;
                        case "Hourly Project Rate" :
                            self.client.get_HPR_FPR(balance,'hpr').getExpense().calcExpense(vm.expenseMethod).getBill().billToService(); // pass the object and type and call the service
                            break;
                        case "Flat Project Amount" :
                            self.client.get_HPR_FPR(balance,'fpa').getExpense().calcExpense(vm.expenseMethod).getBill().billToService(); // pass the object and type and call the service
                            break;
                        default:
                            console.log("no such type exsist")
                    } 
                }

                function changeDate(){
                     self.client = new billPro();
                     self.client.changeDate();
                }

                function closeDialog(){
                    $mdDialog.hide();
                }


            /*
                execute when the expense method changed 
            */
                function changeExpense(){
                    var expenseClient = new expensePro();
                    expenseClient.onChangeExpense(vm.expenseMethod);
                }

            /*
                after the form submit, ck the expense method
                if the expense method is "Invoice unbilled expenses for project"  then this function will trigger
            */
                function calc_ibep(_arr){
                    billingObj.expenseItem = [];   
                    if (_arr.length > 0) {             
                        if (vm.cb2) {
                            var amount = 0;

                            for (var i=0; i<=_arr.length-1; i++){
                                amount +=parseInt( _arr[i].amount);
                            }
                            billingObj.expenseItem.push({
                                product : project.name,
                                quantity : 1,
                                price : parseInt(amount),
                                total : parseInt(amount),
                                optional : vm.dateFrom + " to " + vm.dateTo,
                                expenseTax : ''
                            })
                        }else if (!vm.cb2) {
                            for (var i=0; i<=_arr.length-1; i++){
                                billingObj.expenseItem.push({
                                    product : project.name,
                                    quantity : 1,
                                    price : parseInt(_arr[i].amount),
                                    total : parseInt(_arr[i].amount),
                                    optional : vm.dateFrom + " to " + vm.dateTo,
                                    expenseTax : _arr[i].tax
                                })
                            }
                        }   
                    }

                }
            /*
                after the form submit, if 'other' is seleted for the expense method 
                then this function will trigger
            */
            function calc_other(_arr){
                billingObj.expenseItem = []
                // if (_arr.length > 0) {  
                //     var amount = 0;
                //     for (var i=0; i<=_arr.length-1; i++){
                //         amount += parseInt(_arr[i].amount);
                //     }
                //     billingObj.expenseItem.push({
                //         product : project.name,
                //         quantity : 1,
                //         price : parseInt(amount),
                //         total : parseInt(amount),
                //         optional : vm.dateFrom + " to " + vm.dateTo 
                //     })
                // }
            }
        }
})();
 // end of the 'billCustomerCtrl' controller 

/*
    use to get the sum of the total time 
    pass the total time and one time then one time will be added to the total time 
    additionaly time devided to hours and minutes then the calculation occure
*/

function sumTime(_time,_total){
    var timeHour,
        timeMin,
        totalHour,
        totalMin,
        hrInMin; 

    timeHour = parseInt(_time.toString().split(".")[0]) || _time;
    timeMin  = parseInt(_time.toString().split(".")[1]) || 0;

    totalHour = parseInt(_total.toString().split(".")[0]) || _total;
    totalMin  = parseInt(_total.toString().split(".")[1]) || 0;

    totalHour += timeHour;
    totalMin += timeMin;

    /*
        if the sum of the minutes are more than 60 then the additional hours will be added 
        and minutes will be reduce to value below 60 
    */

    hrInMin = Math.floor(totalMin / 60)
    if (hrInMin > 0) {
        totalHour += hrInMin
        totalMin = totalMin % 60
    }
    return parseFloat(totalHour.toString()+ "." +totalMin.toString() );   
};

/*
    calculate the total cost for the staff  members or tasks 
    pass the user object and tatal cost,
    total cost initialy 0 and each iteration 'shrCost' function calles and,
    add the each users cost to total cost and return it 
*/
function hrCost(_obj,_total){
    var time = _obj.pending,
        hr   =  (_obj.shr) ?  parseInt(_obj.shr) : parseInt(_obj.thr)  || 0,  // hourly rate for staff or task        
        totalHourCost,
        totalMinCost,
        timeHour,
        timeMin;

    _total = _total || 0; // if _total is undefine then assign 0 

    timeHour = parseInt(time.toString().split(".")[0]) || parseInt(time);
    timeMin  = parseInt(time.toString().split(".")[1]) || 0;

    totalHourCost = timeHour * hr;
    totalMinCost = hr * (timeMin/60); // apply hourly rate for minutes 

    _total +=  totalHourCost + totalMinCost;
    return Math.round(_total * 100) / 100;  // round up to 2 decimal points 
};

/*
    calculate the total cost for the houly project rate or flat project amount 
    pass the user object and type,  and return the total cost 
*/

function get_hpe_fpr_cost(_obj,_project,_type){
    var hr = (_type === 'hpr') ? parseInt(_project.hpRate ) :parseInt( _project.fpAmount),
        time = _obj.pending,
        totalHourCost,
        totalMinCost,
        timeHour,
        timeMin,
        total = 0;


    timeHour = parseInt(time.toString().split(".")[0]) || parseInt(time);
    timeMin  = parseInt(time.toString().split(".")[1]) || 0;

    totalHourCost = timeHour * hr;
    totalMinCost = hr * (timeMin/60); // apply hourly rate for minutes 

    total =  totalHourCost + totalMinCost;
    return Math.round(total * 100) / 100;  // round up to 2 decimal points 

};

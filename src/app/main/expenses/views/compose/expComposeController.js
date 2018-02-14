(function() {
    'use strict';

    angular
        .module('app.expenses')
        .controller('expComposeController', expComposeController);

    /** @ngInject */
    function expComposeController($scope, $rootScope, $document, $mdDialog, $mdMedia, $mdSidenav, $state, settingSummary, supplierGetAll, $mdPanel, $serviceCall, $mdToast, uploaderService, $imageUploader, $apis, msSpinnerService) {

        var vm = this;
        vm.submit = submit;
        vm.querySearch = querySearch;

        vm.toggleChildStates = toggleChildStates;
        vm.settingSummary = settingSummary;

        vm.imageArray = [];
        vm.category = {};
        // vm.taxShow = true;

        vm.imageConfig = {
          restrict : "image/*",
          size : "2MB",
          crop : false,
          type : "image",
          maxCount : 1
        }

        vm.spinnerService = msSpinnerService;
        // vm.dueDate = new Date(vm.dueDate);

        // if (settingSummary[0].preference.expensePref.billingExpensesIncludeTax == true) {
        //     vm.taxShow = false;
        // }

        function getcustomFieldData() {
            if (vm.settingSummary[0]) {
                GetCategory(function() {
                    getCustFiled(vm.settingSummary, function() {
                        getTaxes()
                    });
                });
            }
        }

        getcustomFieldData();
        vm.supplierGetAll = supplierGetAll;
        console.log(vm.supplierGetAll);

        vm.expense = {
            "amount": "",
            "billable": "",
            "category": "",
            "type":"",
            "dueDate": "",
            "reference": "",
            "status": "",
            "tax": "",
            "salesTaxAmount":"",
            "uploadImage": [],
            "createDate": "",
            "description": "",
            "vendor": "",
            "favouriteStar": "",
            "favouriteStarNo": "",
            "tags": [],
            "totalValue": "",
            "totalValueLabel": "",
            "assignCustomer": "",
            "assignType": "",
            "assignID": "",
            "customFields": [],
            "baseCurrency":""
        }
        
        // vm.expense.tax={"activate":true,"compound":false,"labelIndividualTaxStatus":"Inactivate","positionID":"","rate":"0","taxID":0.001,"taxName":"No Tax","type":"individualtaxes"}

        vm.uploadFileSample = uploadFile;
        vm.imageArray = [];

        function uploadFile(res) {
            vm.imageArray = [];
            if (res.hasOwnProperty('brochure')) {
              
              vm.imageArray = res.brochure;
            //   vm.imageArray = vm.imageArray[0].name;
              vm.showUploadFile = true;
              vm.fileName = vm.imageArray[0].name;
              loadImage();
              //vm.showBrochure = true;

            }else if(res.hasOwnProperty('image')){
              vm.imageArray = [];
              vm.imageArray = res.image;
              vm.fileName = vm.imageArray[0].name;
              vm.showUploadFile = true;
              loadImage();

            }else if(res.hasOwnProperty('all')){
              console.log(res.all);
              vm.imageArray = res.all;
              vm.showUploadFile = true;
              vm.fileName = vm.imageArray[0].name;
              loadImage();
            }

        }

        function loadImage() {
            var reader = new FileReader();
            console.log(vm.imageArray);
            reader.readAsDataURL(vm.imageArray[0]);
            reader.onload = function() {
                vm.uploadFile = reader.result;
                console.log(vm.uploadFile);
                if (!$scope.$$phase) {
                    $scope.$apply()
                }
            };
            reader.onerror = function(error) {
                console.log('Error: ', error);
            };
        };

        //??upload service
        vm.expense.tax = {
            "activate": true,
            "compound": false,
            "labelIndividualTaxStatus": "Inactivate",
            "positionID": "",
            "rate": "0",
            "taxID": 0.001,
            "taxName": "No Tax",
            "type": "individualtaxes",
            "salesTax":""
        }

        vm.selectedItemSupplier = null;
        vm.searchTextSupplier = null;
        vm.querySearchSupplier = querySearchSupplier;
        vm.selectedItem = null;
        vm.searchText = null;
        //vm.querySearch = querySearch;

        vm.initialAmount = "Onlyamount";
        vm.totalText = "(Without Tax)";
        vm.finalAmount = finalAmount;
        vm.totalUSD = 0;
        vm.totalUSD = parseFloat(vm.totalUSD);
        vm.amountWithTax = 0.00;

        vm.supplierArr = [];
        vm.projectarr = [];
        vm.customerarr = [];
        vm.fullarr = [];
        vm.currentDate = new Date();

        vm.currency = vm.settingSummary[0].profile.baseCurrency;
        vm.expense.baseCurrency = vm.settingSummary[0].profile.baseCurrency;


        function GetCategory(callback) {
            vm.CategoryArray = [];
            var CatArr = vm.settingSummary[0].preference.expensePref.expenseCategories;

            for (var i = CatArr.length - 1; i >= 0; i--) {
                if (CatArr[i].activate) {
                    vm.CategoryArray.push(CatArr[i]);
                    console.log(vm.CategoryArray);
                }
            }
            callback();
        }


        function getTaxes() {

            vm.taxesArr = [];
            var individualTaxes = [];
            var multiplelTaxes = [];
            console.log(vm.settingSummary[0].taxes.individualTaxes);
            if (vm.settingSummary[0]) {
                individualTaxes = vm.settingSummary[0].taxes.individualTaxes;
                multiplelTaxes = vm.settingSummary[0].taxes.multipleTaxGroup;
            }
            if (individualTaxes.length > 0) {
                for (var i = 0; i <= individualTaxes.length - 1; i++) {
                    if (individualTaxes[i].activate) { // only dispaly activate = true individual taxes
                        vm.taxesArr.push(individualTaxes[i]);
                        console.log(vm.taxesArr);
                    }
                }
            }
            if (multiplelTaxes.length > 0) {
                for (var j = 0; j <= multiplelTaxes.length - 1; j++) {
                    if (multiplelTaxes[j].activate) { // only dispaly activate = true multiple taxes
                        vm.taxesArr.push(multiplelTaxes[j]);
                    }
                }
            }

        }

        function querySearchSupplier(query) {
            var results = [];
            for (var i = 0, len = vm.supplierArr.length; i < len; ++i) {
                if (vm.supplierArr[i].value.indexOf(query.toLowerCase()) != -1) {
                   
                    results.push(vm.supplierArr[i]);
                }
            }
            return results;
        }

        function querySearch(query) {
            
            var results = [];
            for (var i = 0, len = vm.fullarr.length; i < len; ++i) {
                if (vm.fullarr[i].value.indexOf(query.toLowerCase()) != -1) {
                    results.push(vm.fullarr[i]);
                }
            }
            return results;
        }

        function loadAllSupplier() {
            var data = vm.supplierGetAll.result;

            if (data.length > 0) {
                for (var i = data.length - 1; i >= 0; i--) {
                    if (data[i].status == "Active") {
                        vm.supplierArr.push({
                            display: data[i].profileName,
                            value: data[i].profileName.toLowerCase(),
                            id: data[i].profileID,
                            type: 'contact',
                            image: "img/ic_supervisor_account_24px.svg"
                        });
                    }
                };
            }
        }
        loadAll();

        loadAllSupplier();


        function loadAll() {
            var projectjson= {"where":"projectStatus = 'Active' order by createDate DESC"};
            var client = $serviceCall.setClient("getAllByQuery", "project"); // method name and service
            client.ifSuccess(function(data) {
                var data = data.result;
                // if (data.length > 0) {
                vm.projectarr = [];
                for (var i = data.length - 1; i >= 0; i--) {
                    
                    if(data[i].projectStatus == "Active"){
                        vm.projectarr.push({
                        display: data[i].name,
                        value: data[i].name.toLowerCase(),
                        id: data[i].projectID,
                        type: 'project',
                        image: "/assets/producticons/Projects.svg"
                        });
                    }
                    

                };
                console.log(vm.projectarr);
                loadcontactFunc();

            })
            client.ifError(function(data) {
                console.log("error loading project");
            })
            client.skip(0);
            client.take(100);
            client.orderby('');
            client.isAscending(false);

            client.postReq(projectjson);
        }


        function loadcontactFunc() {
            var client = $serviceCall.setClient("getAllByQuery", "profile"); // method name and service
            client.ifSuccess(function(data) {
                var data = data.result;
                if (data.length > 0) {
                    for (var i = data.length - 1; i >= 0; i--) {
                        if (data[i].status == "Active") {
                            vm.customerarr.push({
                                display: data[i].profileName,
                                value: data[i].profileName.toLowerCase(),
                                id: data[i].profileID,
                                type: 'contact',
                                email:data[i].email,
                                image: "/assets/producticons/Contacts.svg"
                            });
                        }
                    };
                    console.log(vm.customerarr);
                    
                    vm.fullarr = vm.customerarr.concat(vm.projectarr);
                    

                }

                console.log(vm.fullarr)

            })
            client.ifError(function(data) {
                console.log("error loading customers");

            })
            client.skip(0);
            client.take(100);
            client.class('Customer');
            client.orderby('profileID');
            client.isAscending(false);

            client.getReq();

        }

        angular.isUndefinedOrNull = function(val) {
            return angular.isUndefined(val) || val === null || val === ""
        }


        vm.calanderdisable = true;

        function calanderfun(obj) {

            if (obj.status == "Paid") {
                vm.ShowDate = true;
                vm.calanderdisable = true;

            } else if (obj.status == "Unpaid") {
                vm.ShowDate = false;
                vm.calanderdisable = false;
            };

        }
        calanderfun();
        //==========================================

        vm.changeStatus = changeStatus;

        function changeStatus(obj) {

            if (obj.status == "Paid") {
                vm.dueDate = null;
            }
        }

        function submit() {
            console.log(vm.imageArray)
            vm.category = JSON.parse(vm.category)
        
            vm.expense.customFields = vm.customFields;

            if (angular.isUndefinedOrNull(vm.selectedItemSupplier)) {
                vm.expense.vendor = "";
            } else {
                if (angular.isUndefinedOrNull(vm.selectedItemSupplier.display)) {
                    vm.expense.vendor = vm.selectedItemSupplier;
                } else {
                    vm.expense.vendor = vm.selectedItemSupplier.display;
                }
            }

            if (angular.isUndefinedOrNull(vm.selectedItem)) {
                vm.expense.assignCustomer = "";
                vm.expense.type = "";
                vm.expense.assignID = "";
            } else {
                if (angular.isUndefinedOrNull(vm.selectedItem.display)) {
                    vm.expense.assignCustomer = vm.selectedItem.display;
                    vm.expense.assignType = vm.selectedItem.type;
                    vm.expense.assignID = vm.selectedItem.id;
                } else {
                    vm.expense.assignCustomer = vm.selectedItem.display;
                    vm.expense.assignType = vm.selectedItem.type;
                    vm.expense.assignID = vm.selectedItem.id;
                }
            }

            vm.expense.category = vm.category.expenseCategory;
            vm.expense.type = vm.category.expenseType;

            console.log(vm.selectedItem);

            console.log(vm.expense.dueDate);

            //vm.imagearray = [];
            
            if (vm.expense.status == 'Paid') {
                vm.expense.dueDate = "";
            }

            vm.readonly = true;
            // if(String(vm.expense.tax)){
            //   vm.expense.tax=JSON.parse(vm.expense.tax);
            // }
            vm.expense.totalValueLabel = vm.totalText;
            vm.expense.totalValue = vm.totalUSD;
            vm.expense.salesTaxAmount = vm.expense.totalValue - vm.expense.amount;
            vm.expense.tax.salesTax = vm.expense.salesTaxAmount;
            vm.expense.createDate = new Date();
            console.log(vm.expense.createDate);
            if (vm.expense.dueDate == null || vm.expense.dueDate == "") {
                vm.expense.dueDate = "";
            } else {
                vm.expense.dueDate = vm.dueDate;
            }

            console.log(vm.expense.dueDate);
            vm.expense.disableForm = false;
            vm.expense.favouriteStar = false;
            vm.expense.favouriteStarNo = 1;

            vm.expense.deleteStatus = false;
            console.log(vm.expense.tags);



            if (vm.expense.description == null || vm.expense.description == "") {
                $mdDialog.show(
                    $mdDialog.alert()
                    .parent(angular.element(document.body))
                    .title('Alert')
                    .content('Add a description')
                    .ariaLabel('Alert')
                    .ok('OK')
                    .targetEvent()
                );
            } else {

                if (vm.category == null || vm.category == "") {
                    $mdDialog.show(
                        $mdDialog.alert()
                        .parent(angular.element(document.body))
                        .title('Alert')
                        .content('Select a category')
                        .ariaLabel('Alert')
                        .ok('OK')
                        .targetEvent()
                    );
                } else {
                    if (vm.expense.amount == null || vm.expense.amount == "") {
                        $mdDialog.show(
                            $mdDialog.alert()
                            .parent(angular.element(document.body))
                            .title('Alert')
                            .content('Enter an amount')
                            .ariaLabel('Alert')
                            .ok('OK')
                            .targetEvent()
                        );
                    } else {
                        if (vm.expense.status == 'Paid') {
                            vm.expense.dueDate = "";

                            if (vm.imageArray.length != 0) {
                                for (var indexx = 0; indexx < vm.imageArray.length; indexx++) {
                                    var client = $imageUploader.setImage(vm.imageArray[indexx].uniqueCode, 'expense');
                                    client.ifSuccess(function(data) {

                                        console.log(data);
                                        if (vm.imageArray[0].type == "image/jpeg" || vm.imageArray[0].type == "image/png") {
                                            vm.type = "image";
                                        }
                                        vm.uploadImages = {};
                                        vm.uploadImages.ID = "";
                                        vm.uploadImages.name = vm.imageArray[0].name;
                                        vm.uploadImages.size = vm.imageArray[0].size;
                                        vm.uploadImages.uniqueCode = vm.imageArray[0].uniqueCode;
                                        vm.uploadImages.appGuid = "";
                                        vm.uploadImages.appName = "expense";
                                        vm.uploadImages.createUser = "";
                                        vm.uploadImages.date = vm.expense.createDate;
                                        vm.uploadImages.type = vm.type;
                                        vm.expense.uploadImage.push(vm.uploadImages);
                                        successSubmit();
                                    });
                                    client.ifError(function(data) {});
                                    if (vm.imageArray[0].type == "image/jpeg" || vm.imageArray[0].type == "image/png") {
                                        client.sendImage(vm.imageArray[indexx]);
                                    }
                                    
                                }
                            } else {
                                successSubmit();
                            }



                        } else if (vm.expense.status == 'Unpaid') {
                            vm.expense.dueDate = vm.dueDate;
                            console.log(vm.dueDate);
                            console.log(vm.expense.dueDate);

                            if (vm.expense.dueDate == null || vm.expense.dueDate == "") {
                                $mdDialog.show(
                                    $mdDialog.alert()
                                    .parent(angular.element(document.body))
                                    .title('Alert')
                                    .content('Please add Due date')
                                    .ariaLabel('Alert')
                                    .ok('OK')
                                    // .targetEvent(ev)
                                );
                            } else {
                                //submit new expense data.........................................
                                if (vm.imageArray.length != 0) {

                                    for (var indexx = 0; indexx < vm.imageArray.length; indexx++) {
                                        var client = $imageUploader.setImage(vm.imageArray[indexx].uniqueCode, 'expense');
                                        client.ifSuccess(function(data) {

                                            console.log(data);
                                            if (vm.imageArray[0].type == "image/jpeg" || vm.imageArray[0].type == "image/png") {
                                                vm.type = "image";
                                            }
                                            vm.uploadImages = {};
                                            vm.uploadImages.ID = "";
                                            vm.uploadImages.name = vm.imageArray[0].name;
                                            vm.uploadImages.size = vm.imageArray[0].size;
                                            vm.uploadImages.uniqueCode = vm.imageArray[0].uniqueCode;
                                            vm.uploadImages.appGuid = "";
                                            vm.uploadImages.appName = "expense";
                                            vm.uploadImages.createUser = "";
                                            vm.uploadImages.date = vm.expense.createDate;
                                            vm.uploadImages.type = vm.type;
                                            vm.expense.uploadImage.push(vm.uploadImages);
                                            successSubmit();
                                        });
                                        client.ifError(function(data) {});
                                        if (vm.imageArray[0].type == "image/jpeg" || vm.imageArray[0].type == "image/png") {
                                            client.sendImage(vm.imageArray[indexx]);
                                        }
                                    }
                                } else {

                                    successSubmit();
                                }

                            }
                        }

                    }

                }

            }

        }

        function successSubmit() {

            vm.spinnerService.show('exp-compose-spinner');

            console.log(vm.expense.customFields);

            vm.customFields=[];
            
            for (var i=0; i<= vm.expense.customFields.length -1; i++) {
                if(vm.expense.customFields[i].value!=""){
                    vm.customFields.push(vm.expense.customFields[i]);
                }
            };
            
            vm.expense.customFields = vm.customFields;

            var serviceObj = {
                "expense": vm.expense,
                "image": vm.expense.uploadImage,
                "appName": "Expenses",
                "permissionType": "add"
            }

            console.log(JSON.stringify(serviceObj));

            vm.serviceObj = JSON.stringify(serviceObj);

            var stringObj = JSON.stringify($rootScope.Settings12thdoor);

            var client = $serviceCall.setClient("saveExpense", "process"); // method name and service
            client.ifSuccess(function(data) {
                console.log("saved new expence");
                $mdToast.show(
                    $mdToast.simple()
                    .textContent('Expense successfully saved')
                    .position('top right')
                    .theme('success-toast')
                    .hideDelay(2000)
                );
                vm.spinnerService.hide('exp-compose-spinner');
                $state.go("app.expenses.exp");
                
            })
            client.ifError(function(data) {
                vm.spinnerService.hide('exp-compose-spinner');
                if(data.data.isSuccess == false){
                    $mdDialog.show(
                    $mdDialog.alert()
                    .parent(angular.element(document.body))
                    .title('Error')
                    .content(data.data.customMessage)
                    .ariaLabel('Alert Dialog Demo')
                    .ok('OK')
                    .targetEvent()
                    );

                }

                if(data.data.customMessage == null){
                    $mdDialog.show(
                    $mdDialog.alert()
                    .parent(angular.element(document.body))
                    .title('Error')
                    .content('Error saving expense')
                    .ariaLabel('Alert Dialog Demo')
                    .ok('OK')
                    .targetEvent()
                    );
                }



            })

            client.postReq(vm.serviceObj);


        }

        function finalAmount(obj) {
            debugger;
            console.log(obj.amount);

            console.log(obj);
            var amountWithTax;
            var taxObj;

            if (obj.amount != "" && obj.amount != null && obj.tax.taxName != "No Tax") {
                taxObj = obj.tax;
                console.log(taxObj);
                if (taxObj.type == "individualtaxes") {
                    amountWithTax = (parseFloat(obj.amount) / 100) * parseInt(taxObj.rate);
                    vm.totalUSD = parseFloat(obj.amount) + parseFloat(amountWithTax);
                    vm.amountWithTax = amountWithTax;
                    vm.initialAmount = "Fullamount";
                    vm.totalText = "(With Tax)";
                    vm.fullamount = angular.copy(vm.totalUSD);
                } else if (taxObj.type == "multipletaxgroup") {
                    calculateMultipleTax(obj, taxObj);
                }
            } else if (obj.tax.taxName == "No Tax" || obj.tax == null) {
                if(obj.amount=="" || obj.amount==undefined){
                    vm.totalUSD = 0;
                }
                else{
                     vm.totalUSD = parseFloat(obj.amount);
                }
               
                vm.initialAmount = "Onlyamount";
                vm.totalText = "(Without Tax)";
            }
        }

        function calculateMultipleTax(obj, taxObj) {
            console.log(obj);
            var sumCompundFalse = 0.0;
            var compoundArr = [];

            for (var i = 0; i <= taxObj.individualTaxes.length - 1; i++) {
                if (taxObj.individualTaxes[i].compound === false && taxObj.individualTaxes[i].activate === true) {
                    var amountWithTax = (parseFloat(obj.amount) / 100) * parseInt(taxObj.individualTaxes[i].rate);
                    sumCompundFalse += amountWithTax;
                } else if (taxObj.individualTaxes[i].compound === true && taxObj.individualTaxes[i].activate === true) {
                    compoundArr.push(taxObj.individualTaxes[i]);
                }
            }

            vm.totalUSD = parseFloat(obj.amount) + sumCompundFalse;

            if (compoundArr.length > 0) {
                compoundArr = compoundArr.sort(function(a, b) {
                    return a.positionID - b.positionID;
                });
                for (var k = 0; k <= compoundArr.length - 1; k++) {
                    var amountWithTax = (parseFloat(vm.totalUSD) / 100) * parseInt(compoundArr[k].rate);
                    vm.totalUSD += amountWithTax;
                }
            }
            vm.fullamount = angular.copy(vm.totalUSD);
            vm.initialAmount = "Fullamount";
            vm.totalText = "(With Tax)";
        }

        function loadSettingProfile() {
            var client = $serviceCall.setClient("getAllByQuery", "setting"); // method name and service
            client.ifSuccess(function(data) {
                if (data.length > 0) {
                    console.log(data);
                    vm.currency = data[0].profile.baseCurrency;
                    vm.expense.baseCurrency = vm.currency;
                }

            })
            client.ifError(function(data) {
                console.log(data);

            })

            client.postReq({
                "setting": "profile",
            });
        }
        loadSettingProfile();

        function getCustFiled(arr, callback) {
            // vm.custArr = [];
            // var fieldArr = arr[0].preference.expensePref.cusFiel;
            // console.log(fieldArr);

            // for (var l = 0; l <= fieldArr.length - 1; l++) {
            //     vm.custArr.push(fieldArr[l]);
            //     console.log(vm.custArr);
            // }

            vm.customFields = [];
            console.log(arr);
            var value = "";
            var fieldArr = [];
            fieldArr = arr[0].preference.expensePref.cusFiel;
            for (var i=0; i<= fieldArr.length -1; i++) {
                vm.customFields.push({
                    labelShown: fieldArr[i].labelShown,
                    fields: fieldArr[i].fields,
                    type: fieldArr[i].type,
                    inputType: fieldArr[i].inputType,
                    showOnPdf: fieldArr[i].showOnPdf,
                    value: value
                });
            }
            callback();
        }


        function calanderfun() {

        }


        function toggleChildStates(toggledState) {
            $state.go('app.expenses.exp');
            //$state.go(toggledState);
        };

        // function uploader(ev) {
        //     var position = $mdPanel.newPanelPosition()
        //         .absolute()
        //         .center()
        //         .center();
        //     var animation = $mdPanel.newPanelAnimation();
        //     animation.withAnimation($mdPanel.animation.FADE);
        //     var config = {
        //         animation: animation,
        //         attachTo: angular.element(document.body),
        //         controller: dialogExpCtrl,
        //         controllerAs: 'vm',
        //         templateUrl: 'app/main/expenses/dilaogs/uploader/uploader.html',
        //         panelClass: 'dialog-uploader',
        //         position: position,
        //         trapFocus: true,
        //         zIndex: 150,
        //         clickOutsideToClose: true,
        //         clickEscapeToClose: true,
        //         hasBackdrop: true,
        //     };
        //     $mdPanel.open(config);
        // }


        // function dialogExpCtrl($scope, mdPanelRef) {
        //     var vm = this;

        //     vm.closeDialog = closeDialog;

        //     vm.uploadItem = uploadItem;

        //     vm.files = [];

        //     function closeDialog() {
        //         mdPanelRef.close();
        //     }

        //     function uploadItem() {
        //         mdPanelRef.close().then(function(mdPanelRef) {
        //             expFileUploader.onClose(vm.files);
        //         });
        //     }
        // }

    }
})();

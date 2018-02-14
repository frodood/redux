(function() {
    'use strict';

    angular
        .module('app.expenses')
        .controller('expEditController', expEditController);

    /** @ngInject */
    function expEditController($scope, $rootScope, $document, $mdDialog, $mdMedia, $mdSidenav, $state, settingSummary, supplierGetAll, $mdPanel, $serviceCall, $mdToast, uploaderService, $imageUploader, $apis, $setUrl, $customCtrl, msSpinnerService) {
        var vm = this;

        vm.Edit_Expense = {};
        vm.ngDisabled = false;
        vm.calanderdisable = true;

        vm.toggleChildStates = toggleChildStates;

        vm.finalAmount = finalAmount;

        vm.updateexpenses = updateexpenses;

        vm.supplierGetAll = supplierGetAll;

        vm.hasSettingsData = false;
        vm.hasEstData = false;
        vm.CusFieldsFromSettings = {};
        vm.uploadImage = [];
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

        vm.settingSummary = settingSummary;

        // vm.dueDate = new Date();

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

        console.log(settingSummary[0]);
        if (settingSummary[0].preference.expensePref.cusFiel != 0) {
            vm.CusFieldsFromSettings = settingSummary[0].preference.expensePref.cusFiel;
            vm.hasSettingsData = true;
            makeCustomFields();
        }

        vm.expense = {
            "amount": "",
            "billable": "",
            "category": "",
            "type":"",
            "dueDate": "",
            "reference": "",
            "status": "",
            "tax": "",
            "uploadImage": [],
            "createDate": "",
            "description": "",
            "vendor": "",
            "favouriteStar": "",
            "favouriteStarNo": "",
            "tags": [
            ],
            "totalValue": "",
            "totalValueLabel": "",
            "assignCustomer": "",
            "assignType": "",
            "assignID": "",
            "customFields": [],
            "baseCurrency":""
        }

        vm.expense.tax = {
            "activate": true,
            "compound": false,
            "labelIndividualTaxStatus": "Inactivate",
            "positionID": "",
            "rate": "0",
            "taxID": 0.001,
            "taxName": "No Tax",
            "type": "individualtaxes",
            "salesTax" : ""
        }

        vm.expense.uploadImage = [];

        function toggleChildStates(toggledState) {
            $state.go('app.expenses.exp');
        };

        vm.getTaxSelect = getTaxSelect;

        function getTaxSelect() {
     
            vm.expense.tax = vm.taxesArr.find(function(obj) {
                return obj.taxID === vm.expense.tax.taxID;
            })
            console.log(vm.expense.tax)
        }

        vm.changeStatus = changeStatus;

        function changeStatus(obj) {

            if (obj.status == "Paid") {
                vm.dueDate = null;
            }
        }



        vm.uploadFileSample = uploadFile;
        vm.imageArray = [];

        function uploadFile(res) {
            vm.imageArray = [];
            vm.uploadImage = vm.imageArray;
            if (res.hasOwnProperty('brochure')) {
              
              vm.imageArray = res.brochure;
              vm.imageArray = vm.imageArray[0].name;
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

            vm.uploadImage = vm.imageArray;

        }

        function loadImage() {
            var reader = new FileReader();
            console.log(vm.imageArray);
            reader.readAsDataURL(vm.imageArray[0]);
            reader.onload = function() {
                vm.uploadFile = reader.result;
                
                if (!$scope.$$phase) {
                    $scope.$apply()
                }
            };
            reader.onerror = function(error) {
                console.log('Error: ', error);
            };
        };

        function makeCustomFields() {
            if (vm.hasEstData == false || vm.hasSettingsData == false) {
                return;
            }
            var field = $customCtrl.getCustArr();
            field.settingCus(vm.CusFieldsFromSettings).appCus(vm.customFields);
            vm.customFields = field.fullArr().result;
            console.log(vm.customFields);
            
        }

        function loadCurrentImage(uploadedImageCurrent) {
            if (uploadedImageCurrent[0].uploadImage.length > 0) {
                vm.uploadFile = $setUrl.imagePath + 'expense/' + uploadedImageCurrent[0].uploadImage[0].uniqueCode;
            }
        };

        //Get currency from profile settings...........................................
        function loadSettingProfile() {
            var client = $serviceCall.setClient("getAllByQuery", "setting");
            client.ifSuccess(function(data) {
                if (data.length > 0) {
                    console.log(data);
                    vm.currency = data[0].profile.baseCurrency;
                    vm.expense.baseCurrency = vm.currency;
                }
            })
            client.ifError(function(data) {
                console.log("error loading setting profile data")

            })
            client.postReq({
                "setting": "profile",
            });
        }

        loadSettingProfile();

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

        function getCustFiled(arr, callback) {

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


        function getTaxes() {

            vm.taxesArr = [];
            var individualTaxes = [];
            var multiplelTaxes = [];

            if (vm.settingSummary[0]) {
                individualTaxes = vm.settingSummary[0].taxes.individualTaxes;
                multiplelTaxes = vm.settingSummary[0].taxes.multipleTaxGroup;
            }
            if (individualTaxes.length > 0) {
                for (var i = 0; i <= individualTaxes.length - 1; i++) {
                    if (individualTaxes[i].activate) { // only dispaly activate = true individual taxes
                        vm.taxesArr.push(individualTaxes[i]);
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
            console.log(vm.taxesArr)

        }
        //Load All Expense data.........................................

        function loadAllExpenseData() {

            var client = $serviceCall.setClient("getExpenseByKey", "expense");
            client.ifSuccess(function(data) {
                console.log(data);
                vm.Edit_Expense = [];
                vm.selectedItem = [];
                vm.selectedItemSup = [];
                vm.Edit_Expense.push(data);
                loadCurrentImage(vm.Edit_Expense);


                vm.customFields = vm.Edit_Expense[0].customFields;
                vm.Edit_Expense[0].createDate = new Date(vm.Edit_Expense[0].createDate);
                console.log(vm.Edit_Expense[0]);

                if (vm.Edit_Expense[0].dueDate == "") {
                    vm.Edit_Expense[0].dueDate = "";
                } else {
                    vm.dueDate = new Date(vm.Edit_Expense[0].dueDate);
                }

                vm.currentDate = new Date(vm.Edit_Expense[0].createDate);
                console.log(vm.currentDate);
                vm.selectedItemSup.display = vm.Edit_Expense[0].vendor;

                vm.totalUSD = vm.Edit_Expense[0].totalValue;
                vm.totalText = vm.Edit_Expense[0].totalValueLabel;
                vm.selectedItem.display = vm.Edit_Expense[0].assignCustomer;
                vm.selectedItem.type = vm.Edit_Expense[0].assignType;
                vm.selectedItem.id = vm.Edit_Expense[0].assignID;

                vm.expense = vm.Edit_Expense[0];

                vm.expense.description = vm.Edit_Expense[0].description;
                vm.category.expenseCategory = vm.Edit_Expense[0].category;
                vm.category.expenseType = vm.Edit_Expense[0].type;
                console.log(vm.category);

                if (vm.category) {
                    for(var i=0; i<= vm.CategoryArray.length-1; i++ ){
                        if (vm.CategoryArray[i].expenseCategory === vm.category.expenseCategory) {
                            vm.category = vm.CategoryArray[i];
                            break;
                        }
                    }
                }

                vm.expense.reference = vm.Edit_Expense[0].reference;
                vm.expense.amount = vm.Edit_Expense[0].amount;

                vm.expense.status = vm.Edit_Expense[0].status;
                vm.expense.taxNameShow = vm.Edit_Expense[0].tax.taxName;
                vm.expense.taxRate = vm.Edit_Expense[0].tax.rate;
                vm.expense.tax = vm.Edit_Expense[0].tax;
                console.log(vm.Edit_Expense[0].tax.taxName);
                getTaxSelect();
                vm.expense.tags = vm.Edit_Expense[0].tags;

                // vm.expense.uploadImage = vm.Edit_Expense[0].uploadImage;
                vm.uploadImage = vm.Edit_Expense[0].uploadImage;
            

                vm.amountWithTax = (parseFloat(vm.Edit_Expense[0].amount) / 100) * parseInt(vm.Edit_Expense[0].tax.rate);

                console.log(vm.selectedItem);

                if (vm.Edit_Expense[0].status == "Paid") {
                    vm.calanderdisable = true;
                    vm.ngDisabled = true;
                    vm.checkAbility = true;

                } else if (vm.Edit_Expense[0].status == "Unpaid") {
                    vm.calanderdisable = false;
                    vm.ngDisabled = false
                } else {
                    vm.calanderdisable = true;
                    vm.Edit_Expense[0].dueDate = "";
                }

                if(vm.Edit_Expense[0].vendor == ""){
                    vm.selectedItemSup=null;
                }

                if(vm.Edit_Expense[0].assignCustomer == ""){
                    vm.selectedItem=null;
                }



            })
            client.ifError(function(data) {
                console.log("error loading expense data")

            })
            client.uniqueID($state.params.itemId);
            client.getReq();
        }

        loadAllExpenseData();

        $scope.$watch("vm.Edit_Expense", function(data) {
            vm.hasEstData = true;
            makeCustomFields();
        });


        loadAll();


        //supplier autocpmplete
        vm.selectedItemSup = null;
        vm.searchTextSup = null;
        vm.querySearchSupplier = querySearchSupplier;
        vm.selectedItem = null;
        vm.searchText = null;
        vm.querySearch = querySearch;

        vm.projectarr = [];
        vm.customerarr = [];
        vm.supplierArr = [];
        vm.fullarr = [];


        function querySearchSupplier(query) {

            var results = [];
            for (var i = 0, len = vm.supplierArr.length; i < len; ++i) {
                if (vm.supplierArr[i].value.indexOf(query.toLowerCase()) != -1) {
                    results.push(vm.supplierArr[i]);
                }
            }
            return results;
        }
        //project and contact autocomplete

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

            var supplier = vm.supplierGetAll.result;
            if (supplier.length > 0) {

                for (var i = supplier.length - 1; i >= 0; i--) {
                    if (supplier[i].status == "Active") {
                        vm.supplierArr.push({
                            display: supplier[i].profileName,
                            value: supplier[i].profileName.toLowerCase(),
                            id: supplier[i].profileID,
                            type: 'contact',
                            image: "img/ic_supervisor_account_24px.svg"
                        });
                    }
                };
            }
        }

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
            var client = $serviceCall.setClient("getAllByQuery", "profile");
            client.ifSuccess(function(data) {
                var data = data.result;
                console.log(data);
                vm.customerarr = [];
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
                console.log(vm.fullarr);

            })
            client.ifError(function(data) {
                console.log("error loading customer");

            })
            client.skip(0);
            client.take(10);
            client.class("Customer");
            client.orderby("profileID");
            client.isAscending(false);
            client.postReq();
        }

        vm.AmountToggle = 1;

        function AmountToggleFunc(amount, tax) {
            if (vm.AmountToggle == 1) {
                vm.totalUSD = parseInt(amount) + parseInt(tax);
                vm.AmountToggle = 2;
                if (vm.Edit_Expense.tax == null || vm.Edit_Expense.tax == "") {
                    $mdDialog.show(
                        $mdDialog.alert()
                        .parent(angular.element(document.body))
                        .title('Alert')
                        .content('Please add tax')
                        .ariaLabel('Alert')
                        .ok('OK')
                        .targetEvent(ev)
                    );
                }
            } else if (vm.AmountToggle == 2) {
                vm.totalUSD = parseInt(amount);
                vm.AmountToggle = 1;
            };

        }

        vm.initialAmount = "Onlyamount";

        function finalAmount(obj) {
            var amountWithTax;
            var taxObj;

            if (obj.amount != "" && obj.amount != null) {
         

                taxObj = obj.tax;
                console.log(taxObj);

                vm.amountWithTax = (parseFloat(obj.amount) / 100) * parseInt(taxObj.rate);
                vm.totalUSD = parseFloat(obj.amount) + parseFloat(vm.amountWithTax);
                vm.initialAmount = "Fullamount";
                vm.totalText = "(With Tax)";
                vm.fullamount = angular.copy(vm.totalUSD);

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
            vm.fullamount = angular.copy($scope.totalUSD);
            vm.initialAmount = "Fullamount";
            vm.totalText = "(With Tax)";
        }

        function changeAmount() {
            var taxObj;
            if (angular.isUndefinedOrNull(obj.tax)) {
                vm.totalUSD = parseFloat(obj.amount)
                vm.initialAmount = "Onlyamount";
                vm.totalText = "(Without Tax)";
            } else if (vm.initialAmount == "Fullamount") {
                vm.totalUSD = parseFloat(obj.amount);
                vm.initialAmount = "Onlyamount";
                vm.totalText = "(Without Tax)";
            } else if (vm.initialAmount == "Onlyamount") {
                vm.totalUSD = vm.fullamount;
                vm.initialAmount = "Fullamount";
                vm.totalText = "(With Tax)";
            };
        }

        function calanderfun(obj) {
            console.log(obj)
            if (obj.status == "Paid") {
                vm.calanderdisable = true;
                obj.dueDate = undefined;
            } else if (obj.status == "Unpaid") {
                vm.calanderdisable = false;
            };
        }

        function successSubmit() {

            vm.spinnerService.show('exp-edit-spinner');
            
            vm.customFields=[];
            
            for (var i=0; i<= vm.expense.customFields.length -1; i++) {
                if(vm.expense.customFields[i].value!=""){
                    vm.customFields.push(vm.expense.customFields[i]);
                }
            };
            vm.expense.customFields = vm.customFields;

            console.log(vm.expense.customFields);

            vm.updatedFormdata = vm.expense;

            var serviceObj = {
                "expense": vm.updatedFormdata,
                "image": vm.expense.uploadImage,
                "appName": "Expenses",
                "permissionType": "edit"
            }

            var jsonString = JSON.stringify(serviceObj);

            var client = $serviceCall.setClient("updateExpense", "process"); // method name and service
            client.ifSuccess(function(data) {
                var toast = $mdToast.simple().
                content('Expense '+vm.updatedFormdata.expenseID+' successfully edited')
                    .action('OK').highlightAction(false)
                    .position("top right");
                $mdToast.show(toast).then(function() {});
                vm.spinnerService.hide('exp-edit-spinner');
                $state.go("app.expenses.exp");
            })
            client.ifError(function(data) {
                vm.spinnerService.hide('exp-edit-spinner');
                
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
                    .content('Error editing expense')
                    .ariaLabel('Alert Dialog Demo')
                    .ok('OK')
                    .targetEvent()
                    );
                }

            })
            client.postReq(jsonString);


        }

        function updateexpenses() {
            vm.expense.customFields = vm.customFields;

            if (vm.selectedItemSup == undefined || vm.selectedItemSup == null) {
                vm.expense.vendor = "";
            } else {
                if (vm.selectedItemSup.display == undefined || vm.selectedItemSup.display == null) {
                    vm.expense.vendor = vm.selectedItemSup;
                } else {
                    vm.expense.vendor = vm.selectedItemSup.display;
                }
            }

            if (vm.selectedItem == undefined || vm.selectedItem == null) {
                vm.expense.assignCustomer = "";
                vm.expense.type = "";
                vm.expense.assignID = "";
            } else {
                if (vm.selectedItem.display == undefined || vm.selectedItem.display == null) {
                    vm.expense.assignCustomer = vm.selectedItem;
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

            if (vm.expense.status == 'Paid') {
                vm.expense.dueDate = "";
            }

            vm.expense.totalValueLabel = vm.totalText;
            vm.expense.totalValue = vm.totalUSD;
            vm.expense.salesTaxAmount = vm.expense.totalValue - vm.expense.amount;
            vm.expense.tax.salesTax = vm.expense.salesTaxAmount;
            vm.expense.favouriteStar = false;
            vm.expense.favouriteStarNo = 1;



            if (vm.expense.description == null || vm.expense.description == "") {
                $mdDialog.show(
                    $mdDialog.alert()
                    .parent(angular.element(document.body))
                    .title('Alert')
                    .content('Please add description')
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
                        .content('Please add category')
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
                            .content('Please add amount')
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
                                        
                                        if(vm.expense.uploadImage.length !=0){
                                            vm.expense.uploadImage[0]=vm.uploadImages;
                                        }
                                        else{
                                            vm.expense.uploadImage.push(vm.uploadImages);
                                        }
                                        

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
                                    .content('Please add Due Date')
                                    .ariaLabel('Alert')
                                    .ok('OK')
                                    // .targetEvent(ev)
                                );
                            } else {

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

                                            if(vm.expense.uploadImage.length !=0){
                                            vm.expense.uploadImage[0]=vm.uploadImages;
                                            }
                                            else{
                                                vm.expense.uploadImage.push(vm.uploadImages);
                                            };

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

    }
})();

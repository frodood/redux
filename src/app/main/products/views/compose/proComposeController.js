(function ()
{
    'use strict';

    angular
        .module('app.products')
        .controller('proComposeController', proComposeController)
        .directive('capitalize',capitalize)
        .directive("limitTo",limitTo)
        .directive('noSpecialChar',noSpecialChar);

        function noSpecialChar(){            
            return {
              require: 'ngModel',
              restrict: 'A',
              link: function(scope, element, attrs, modelCtrl) {
                modelCtrl.$parsers.push(function(inputValue) {
                  if (inputValue == null)
                    return ''
                  var cleanInputValue = inputValue.replace(/[^\w\s\-\ ]/gi, '');
                  if (cleanInputValue != inputValue) {
                    modelCtrl.$setViewValue(cleanInputValue);
                    modelCtrl.$render();
                  }
                  return cleanInputValue;
                });
              }
            }
        }

        function limitTo(){
             return {
                restrict: "A",
                link: function(scope, elem, attrs) {
                    var limit = parseInt(attrs.limitTo);
                    angular.element(elem).on("keypress", function(e) {
                        if (this.value.length == limit) e.preventDefault();
                    });
                }
            }
        }
        function capitalize(){
            return {
              require: 'ngModel',
              link: function(scope, element, attrs, modelCtrl) {
                var capitalize = function(inputValue) {
                  if (inputValue == undefined) inputValue = '';
                  var capitalized = inputValue.toUpperCase();
                  if (capitalized !== inputValue) {
                    modelCtrl.$setViewValue(capitalized);
                    modelCtrl.$render();
                  }
                  return capitalized;
                }
                modelCtrl.$parsers.push(capitalize);
                capitalize(scope[attrs.ngModel]); // capitalize initial value
              }
            };
        }



    /** @ngInject */
    function proComposeController($scope, $rootScope, $document,commonFact, $mdDialog, $mdMedia, $mdSidenav,$mdToast, $state,settingSummary,uploaderService,$imageUploader,$serviceCall,$mdPanel,$auth, msSpinnerService )
    {
        var vm = this, 
            individualTaxes = [],
            multiplelTaxes = [],
            uploadFileChips = [];

        vm.spinnerService = msSpinnerService;

        var loginName = ($auth.getSession()) ? $auth.getSession().Name : "";
        var userName =  ($auth.getUserName()) ? $auth.getUserName() : "";

        vm.brochureConfig = {
          restrict : "image/*|application/pdf",
          size : "2MB",
          crop : false,
          type : "brochure",
          maxCount : 1
        }

        vm.imageConfig = {
          restrict : "image/*",
          size : "2MB",
          crop : false,
          type : "image",
          maxCount : 1
        }

        function setMedia(res){ 
          if (res.hasOwnProperty('brochure')) {
              vm.brochureFiles = [];
              vm.brochureFiles = res.brochure;
              vm.proBrochure = vm.brochureFiles[0].name
              vm.showBrochure = true;
              vm.fileExtension = vm.brochureFiles[0].name.split('.').pop();
              vm.fileName = vm.brochureFiles[0].name.split('.')[0];
              vm.uploadFileChips.push(vm.brochureFiles[0].name);

          }else if(res.hasOwnProperty('image')){
              vm.imageArray = [];
              vm.imageArray = res.image;
              loadImage();
          }else if(res.hasOwnProperty('all')){
            console.log(res.all)
          }
        }

        uploaderService.setArraysEmpty();

        angular.extend(vm, {
            submit: submit,
            finalAmount: finalAmount,
            imageArray  : [],
            brochureFiles : [],
            stockDisabled : false,
            settingSummary : settingSummary,
            toggleChildStates : toggleChildStates,
            changeInventory : changeInventory,
            checkProductCode : checkProductCode, 
            proStatus : true,
            showBrochure : false,
            maxLength : 20,
            setMedia : setMedia
        });

        vm.totalUSD = 0;
        vm.totalUSD = parseFloat(vm.totalUSD);
        vm.amountWithTax = 0.00;

        init().prevState();

        vm.product = {
          "productCategory" : "",
          "productCode"     : "", 
          "productUnit"     : "",
          "productName"     : "",  
          "brand"           : "",
          "costPrice"       : "",
          "customFields"    : [],
          "date"            : "",
          "deleteStatus"    : "",
          "description"     : "",
          "favouriteStar"   : "",
          "favouriteStarNo" : "",
          "inventory"       : "", 
          "productPrice"    : "",
          "productTax"      : {},
          "salesTaxAmount"  : "0",
          "productTotalPrice" :"",
          "progressShow"    : "",
          "status"          : "", 
          "tags"            : [], 
          "lastTranDate"    : "",
          "productLog"      : {},
          "productID"       : "",
          "createDate"      : "",
          "modifyDate"      : "",
          "createUser"      : "",
          "modifyUser"      : "",
          "baseCurrency"    : "",
          "quantity"        : "",
          "uploadBrochure"  : [],
          "uploadImages"    : []
        };  

        vm.product.productTax = {
            "activate": true,
            "compound": false,
            "labelIndividualTaxStatus": "Inactivate",
            "positionID": "",
            "rate": "0",
            "taxID": 0.001,
            "taxName": "No Tax",
            "type": "individualtaxes"
        }

        if (vm.settingSummary.length > 0) {
            GetProductCategory(vm.settingSummary,function(){   // get product category from settings 
                GetProductBrand(vm.settingSummary,function(){    // get product brands from settings 
                  GetCustFields(vm.settingSummary,function(){    // get product customer fields from settings 
                    GetProUnits(vm.settingSummary,function(){    // get product units from settings 
                        GetProTaxes(vm.settingSummary,function(){  // get product taxes from settings 
                            GetBaseCurrency(vm.settingSummary)       // get product base currency from settings 
                            if (vm.settingSummary[0].preference) {
                                vm.inventoryPattern = vm.settingSummary[0].preference.inventoryPref.grnPrefix + vm.settingSummary[0].preference.inventoryPref.grnSequence;
                            }
                        });
                    });
                  });
                });
            });
        }
        

        function init(){
            var service =  {
                prevState : prevState
            }

            return service;

            function prevState(){
                vm.prevState = ($state.params.appID) ? 'app.contacts.customer' : 'app.products.pro';
            }
        };
        function toggleChildStates(toggledState){ 
            $state.go(toggledState);
        };

        function GetBaseCurrency(arr){
            if(arr[0].profile)
               vm.product.baseCurrency = arr[0].profile.baseCurrency;
        };

        function loadImage(){
            var reader = new FileReader();
            reader.readAsDataURL(vm.imageArray[0]);

            reader.onload = function () { 
                vm.uploadFile = reader.result

                if(!$scope.$$phase) {
                  $scope.$apply()
                }
            };
            reader.onerror = function (error) {
                console.log('Error: ', error);
            };
        };

        function GetProTaxes(arr,callback){

            individualTaxes = [];
            multiplelTaxes = []; 

            vm.taxesArr = [];  
            if(arr[0] && arr[0].taxes){    
                individualTaxes = arr[0].taxes.individualTaxes; 
                multiplelTaxes = arr[0].taxes.multipleTaxGroup; 
            }

            if (individualTaxes.length > 0) {
                for(var i=0; i<=individualTaxes.length-1; i++){
                    if(individualTaxes[i].activate){            // only dispaly activate = true individual taxes
                        vm.taxesArr.push(individualTaxes[i]); 
                    }
                }
            }
            if (multiplelTaxes.length > 0) {
                for(var j=0; j<=multiplelTaxes.length-1; j++){
                    if(multiplelTaxes[j].activate){             // only dispaly activate = true multiple taxes
                        vm.taxesArr.push(multiplelTaxes[j]); 
                    }
                }
            } 
            callback();
        }

        // calculate tax amount..............................
        function finalAmount(obj) {
           
            console.log(obj);

            var amountWithTax;
            var taxObj;

            vm.totalUSD = parseFloat(obj.productPrice);

            if (obj.productPrice != "" && obj.productPrice != null && obj.productTax.taxName != "No Tax") {
                debugger;
                taxObj = obj.productTax;
                console.log(taxObj);
                if (taxObj.type == "individualtaxes") {
                    amountWithTax = (parseFloat(obj.productPrice) / 100) * parseInt(taxObj.rate);
                    vm.totalUSD = parseFloat(obj.productPrice) + parseFloat(amountWithTax);
                    console.log(amountWithTax);
                    vm.amountWithTax = amountWithTax;
                    
                } else if (taxObj.type == "multipletaxgroup") {
                    calculateMultipleTax(obj, taxObj);
                }
            } else if (obj.productTax.taxName == "No Tax" || obj.productTax == null) {
                    debugger;
                if(obj.productPrice=="" || obj.productPrice==undefined){
                    vm.totalUSD = 0;
                }
                else{
                     vm.totalUSD = parseFloat(obj.productPrice);
                }
            }
        }

        function calculateMultipleTax(obj, taxObj) {
            console.log(obj);
            var sumCompundFalse = 0.0;
            var compoundArr = [];

            for (var i = 0; i <= taxObj.individualTaxes.length - 1; i++) {
                if (taxObj.individualTaxes[i].compound === false && taxObj.individualTaxes[i].activate === true) {
                    var amountWithTax = (parseFloat(obj.productPrice) / 100) * parseInt(taxObj.individualTaxes[i].rate);
                    sumCompundFalse += amountWithTax;
                } else if (taxObj.individualTaxes[i].compound === true && taxObj.individualTaxes[i].activate === true) {
                    compoundArr.push(taxObj.individualTaxes[i]);
                }
            }

            vm.totalUSD = parseFloat(obj.productPrice) + sumCompundFalse;
            console.log(vm.totalUSD);

            if (compoundArr.length > 0) {
                compoundArr = compoundArr.sort(function(a, b) {
                    return a.positionID - b.positionID;
                });
                for (var k = 0; k <= compoundArr.length - 1; k++) {
                    var amountWithTax = (parseFloat(vm.totalUSD) / 100) * parseInt(compoundArr[k].rate);
                    vm.totalUSD += amountWithTax;
                    console.log(amountWithTax);
                    console.log(vm.totalUSD);
                    // vm.totalUSD += amountWithTax;
                }
            }
            
            
        }

        function GetProUnits(arr,callback){
            vm.proUnits = [];
            var ProductUnits = [];
                if (arr[0].preference) {
                    if(arr[0].preference.productPref)
                        ProductUnits = arr[0].preference.productPref.units;
                        if (ProductUnits.length > 0) {
                            for(var i=0; i<= ProductUnits.length -1; i++){
                                if(ProductUnits[i].activate){  // only dispaly activate = true Units
                                    vm.proUnits.push(ProductUnits[i].unitsOfMeasurement);
                                    if (ProductUnits[i].unitsOfMeasurement == "Each") {  // if unit name "each" is exist in the settings app then it should be pre selected in the form 
                                        vm.product.productUnit= ProductUnits[i].unitsOfMeasurement;
                            }  
                        }
                    }                    
                }
            }      
            callback();
        }

        function GetCustFields(arr,callback){
            vm.product.customFields = [];
            var CustArr = [];
            if (arr[0].preference) {

                if(arr[0].preference.productPref)
                  CustArr = arr[0].preference.productPref.cusFiel; 
                if (CustArr.length > 0) {
                  for(var i=0; i<= CustArr.length-1; i++){
                    vm.product.customFields.push(CustArr[i]);
                  }
                }  
            }     
            callback();
        }   

        function GetProductBrand(arr,callback){
          vm.proBrandArray = [];
          var BrandArray = [];
            if (arr[0].preference) { 

              if(arr[0].preference.productPref)
                BrandArray = arr[0].preference.productPref.productBrands; 
                if (BrandArray.length > 0) {
                    for (var i = BrandArray.length - 1; i >= 0; i--) {
                        if (BrandArray[i].activate) {  // only dispaly activate = true Brand
                            vm.proBrandArray.push(BrandArray[i].productBrand);
                        }
                    }
                }   
            }   

          vm.proBrandArray = commonFact.sortItems(vm.proBrandArray)
          callback();
        }

        function GetProductCategory(arr,callback){
          vm.categoryArray = [];
          var CatArray = [];
          if (arr[0].preference) {            
              if(arr[0].preference.productPref)
                CatArray = arr[0].preference.productPref.productCategories; 
              if (CatArray.length > 0) {
                for (var i = CatArray.length - 1; i >= 0; i--) {
                  if (CatArray[i].activate) {  // only dispaly activate = true categories
                        vm.categoryArray.push(CatArray[i].productCategory);
                  }
                }
              }   
          } 
          vm.categoryArray = commonFact.sortItems(vm.categoryArray)
          callback();
        }

        function changeInventory(type) { // inventory tracking yes or no 
            debugger;
            if (type == "No") {
                vm.stockDisabled = true; // disable stock level
                vm.product.quantity = "";
            } else if (type == "Yes") {
                vm.stockDisabled = false; // enable stock level
                vm.product.quantity = "0";
            };
        }
        function checkProductCode(){
            vm.productCodeExsist = false;
            vm.submitProgress = false;
            vm.proCodeErr = '';
            if (vm.product.productCode != "") {
                var client =  $serviceCall.setClient("getAllByQuery","product"); // method name and service
                client.ifSuccess(function(data){  //sucess 
                    var data = data.result;
                    if (data.length > 0) {
                        vm.productCodeExsist = true;
                        vm.submitProgress = true; 
                        vm.proCodeErr = 'Product code already exist';
                    }else{

                        vm.productCodeExsist = false;
                        vm.submitProgress = false; 
                    }
                })
                client.ifError(function(data){ //falce
                    vm.productCodeExsist = true;
                    vm.submitProgress = false;
                    vm.proCodeErr = 'please enter different product code';
                })
                client.skip(0);
                client.take(1);
                client.orderby('productCode');
                client.isAscending(false);
                client.postReq( {
                    where: "productCode = '" +vm.product.productCode + "'",
                }); 
            }      
        }

        function isNormalInteger(str) { // check weather string is integer
          return /^\d+$/.test(str);
        }

        function submit() {
            vm.product.createDate = new Date();
            vm.product.modifyDate = new Date();

            vm.product.productTotalPrice = vm.totalUSD;
            vm.product.salesTaxAmount = vm.totalUSD - vm.product.productPrice;
        
            if(vm.product.salesTaxAmount == 0 || vm.product.salesTaxAmount == "NaN"){
                vm.product.salesTaxAmount = "0";
            }
            console.log(vm.product.salesTaxAmount);
            

            if (!vm.product.productPrice) 
               vm.product.productPrice = "0";
            
            if(vm.product.productTax)  
               vm.product.productTax = vm.product.productTax;
               

            else{
                if (individualTaxes.length > 0) {
                    for(var i=0; i<=individualTaxes.length-1; i++){
                        if(individualTaxes[i].activate){            // only dispaly activate = true individual taxes 
                            if (individualTaxes[i].taxName == "No Tax")  // if tax name "each" is exist in the settings app then it should be pre selected in the form 
                               vm.product.productTax= individualTaxes[i]
                        }
                    }
                }
            }
            console.log(vm.product.productTax);
            
            




            if (!vm.productCodeExsist) 
               saveRequest();
        }

        function saveRequest(){
            vm.submitProgress = true; // show the progress bar
            vm.proCodeErr = ' ';
            var today = new Date();
            var dd = today.getDate();
            var mm = today.getMonth() + 1; 
            var yyyy = today.getFullYear();

            if (dd < 10) 
                dd = '0' + dd          
            if (mm < 10) 
                mm = '0' + mm

            today = mm + '/' + dd + '/' + yyyy; // get current date
 

            if (vm.imageArray.length > 0) {
                for (var indexx = 0; indexx < vm.imageArray.length; indexx++) { 
                    var client = $imageUploader.setImage(vm.imageArray[indexx].uniqueCode,'product');
                    client.ifSuccess(function(data){                    
                    });
                    client.ifError(function(data){ 
                    });
                    client.sendImage(vm.imageArray[indexx])         
                }
            };
            if (vm.brochureFiles.length > 0) {
                for (var indexx = 0; indexx < vm.brochureFiles.length; indexx++) {
                    var client = $imageUploader.setImage(vm.brochureFiles[indexx].uniqueCode,'product');
                    client.ifSuccess(function(data){                    
                    });
                    client.ifError(function(data){ 
                    });
                    client.sendBrochure(vm.brochureFiles[indexx])     
                  // http call for brochure upload            
                }
            };
          
            vm.product.progressShow = false;
            vm.product.deleteStatus = false;
            vm.product.favouriteStar = false;

            vm.product.status = (vm.proStatus) ? "Active" : "Inactive";

            vm.product.costPrice = (vm.product.costPrice === "") ? 0 : parseFloat(vm.product.costPrice);
            vm.product.productPrice = (vm.product.productPrice === "") ? 0 : parseFloat(vm.product.productPrice);

            vm.product.favouriteStarNo = 1;
            vm.product.date = today; 
            vm.product.lastTranDate = new Date() // for backend services 
 
            vm.product.image = []; 
            if (vm.imageArray.length > 0) {
                for(var i=0; i<= vm.imageArray.length-1; i++){
                  var test = {
                    ID : "",
                    name : vm.imageArray[i].name,
                    size : vm.imageArray[i].size,
                    uniqueCode : vm.imageArray[i].uniqueCode,
                    appGuid : "",
                    appName : "product",
                    date : new Date(),
                    createUser : "",
                    type : "image"
                  }
                  vm.product.image.push(test);
                  vm.product.uploadImages.push(test);
                }
            }  
            if (vm.brochureFiles.length > 0) {
                for(var i=0; i<= vm.brochureFiles.length-1; i++){
                    var test = {
                        ID : "",
                        name : vm.brochureFiles[i].name,
                        size : vm.brochureFiles[i].size,
                        uniqueCode : vm.brochureFiles[i].uniqueCode,
                        appGuid : "",
                        appName : "product",
                        date : new Date(),
                        createUser : "",
                        type : "brochure"
                    }
                    vm.product.image.push(test);
                    vm.product.uploadBrochure.push(test);
                }
            }  
          
            vm.product.productLog = {
                userName : userName,
                lastTranDate : new Date(),
                description : "Product Added By " +loginName,
                productCode :"",
                productNum : "",
                UIHeight : '30px;', 
                type : "activity",
                status : "Active",
                createDate:new Date(),
                modifyDate:new Date(),
                createUser:userName,
                modifyUser:userName,
                logID:"-888",
                productID :""
            }; 

            vm.product.customFields.forEach(function(v){ delete v.fields });

            vm.spinnerService.show('pro-compose-spinner');

            var serviceObj = {
                "product" : vm.product,
                "image" : vm.product.image,
                "inventoryEnabled" : {
                    "inventoryEnabled" : vm.product.inventory
                },
                "appName" : 'Products',
                'permissionType' : 'add',
                'invSequence' : vm.inventoryPattern
            }
            var jsonString = JSON.stringify(serviceObj);

            var client =  $serviceCall.setClient("insertProduct","process"); // method name and service
            client.ifSuccess(function(result){  //sucess 
                if (result.statusCode === 200) {
                    $mdToast.show(
                      $mdToast.simple()
                        .textContent('Product successfully saved.')
                        .position('top right' )
                        .hideDelay(3000)
                    );
                    vm.submitProgress = false; 
                    console.log(result)
                    if (result.ID){
                        var thumbnails = {};
                        thumbnails[result.ID] = vm.uploadFile;  
                        localStorage.setItem("imgData", JSON.stringify(thumbnails));
                    }
                    vm.spinnerService.hide('pro-compose-spinner');
                    $state.go("app.products.pro"); 
                }else{
                    vm.spinnerService.hide('pro-compose-spinner');
                    
                    $mdDialog.show(
                    $mdDialog.alert()
                    .parent(angular.element(document.body))
                    .content(result.customMessage)
                    .ariaLabel('Alert Dialog Demo')
                    .ok('OK')
                    .targetEvent()
                    );
                }
                // $state.go("app.products.pro.newDetail",{'itemID' : data.ID});

            })
            client.ifError(function(data){ //falce 
              vm.spinnerService.hide('pro-compose-spinner');
                var data = data.data
                $mdDialog.show(
                    $mdDialog.alert()
                    .parent(angular.element(document.body))
                    .content(data.message)
                    .ariaLabel('Alert Dialog Demo')
                    .ok('OK')
                    .targetEvent()
                    );
                vm.submitProgress = false;
            })
            client.skip(10);
            client.postReq(jsonString);
        }
    }
})();

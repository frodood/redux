(function ()
{
    'use strict';

    angular
        .module('app.products')
        .controller('proCopyController', proCopyController);

    /** @ngInject */
    function proCopyController($scope, $rootScope, $document, commonFact, $mdDialog, $mdToast,$mdMedia, $mdSidenav, $state,settingSummary,uploaderService,$imageUploader,$serviceCall,$apis,$setUrl,$auth, msSpinnerService)
    {
        var vm = this, 
            individualTaxes = [],
            multiplelTaxes = []; 


        vm.spinnerService = msSpinnerService;

        var loginName = ($auth.getSession()) ? $auth.getSession().Name : "";

        var userName =  ($auth.getUserName()) ? $auth.getUserName() : "";

        uploaderService.setArraysEmpty();

        vm.stockDisabled = false;

        vm.showBrochure = false;

        vm.settingSummary = settingSummary;

        vm.toggleChildStates = toggleChildStates;

        vm.changeInventory = changeInventory;

        vm.checkProductCode = checkProductCode;

        vm.setMedia = setMedia;
 
        vm.copy = copy;

        vm.finalAmount = finalAmount,

        vm.totalUSD = 0;
        vm.totalUSD = parseFloat(vm.totalUSD);
        vm.amountWithTax = 0.00;

        vm.brochureFiles = [];
        
        vm.imageArray = [];

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
              vm.brochureFiles = res.brochure;;
              if (vm.brochureFiles.length > 0) {
                vm.proBrochure = vm.brochureFiles[0].name; 
                vm.fileExtension = vm.proBrochure.split('.').pop();
                vm.fileName = vm.proBrochure.split('.')[0]; 
                vm.showBrochure = true;
              }


          }else if(res.hasOwnProperty('image')){
              vm.imageArray = [];
              vm.imageArray = res.image;
              loadImage();
          }else if(res.hasOwnProperty('all')){
              console.log(res.all)
          }
        }
  

        init().checkState();

 
        if (vm.settingSummary.length > 0) {
            GetProductCategory(vm.settingSummary,function(){   // get product category from settings 
                GetProductBrand(vm.settingSummary,function(){    // get product brands from settings 
                    GetCustFields(vm.settingSummary,function(){    // get product customer fields from settings 
                        GetProTaxes(vm.settingSummary,function(){  // get product taxes from settings  
                          if (vm.settingSummary[0].preference) {
                              vm.inventoryPattern = vm.settingSummary[0].preference.inventoryPref.grnPrefix + vm.settingSummary[0].preference.inventoryPref.grnSequence;
                          }
                        }); 
                    });
                });
            });
        }      

        function init(){
            var service = {
                checkState : checkState
            }
            return service;            
            function checkState(){
                if ($state.params.itemID) {
                    loadFullProduct()
                }
            }
        }

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

        function loadCurrentImage(){
            if (vm.fullProduct.uploadImages.length > 0) {            
              vm.uploadFile =  $setUrl.imagePath + 'product/'+  vm.fullProduct.uploadImages[0].uniqueCode; 
            }
            if (vm.fullProduct.uploadBrochure.length > 0) {            
              vm.proBrochure =   vm.fullProduct.uploadBrochure[0].uniqueCode;  
              var name = vm.fullProduct.uploadBrochure[0].name
              vm.fileExtension = name.split('.').pop();
              vm.fileName = name.split('.')[0]; 
              vm.showBrochure = true;
            }
        };

        function loadFullProduct(){
            vm.productCode = $state.params.itemID 

            var client =  $serviceCall.setClient("getAllByQuery","product");
            client.ifSuccess(function(data){
              var data = data.result
                if (ifArray(data)) {                    
                    vm.fullProduct = data[0];  
                    vm.productCode = angular.copy(vm.fullProduct.productCode) 
                    vm.fullProduct.productCode = ""
                    if (vm.fullProduct.productTax) {
                        for(var i=0; i<= vm.taxesArr.length-1; i++ ){
                            if (vm.taxesArr[i].taxID === vm.fullProduct.productTax.taxID) {
                                vm.fullProduct.productTax = vm.taxesArr[i];
                                break;
                            }
                        }
                    } 
                } 
                GetProUnits(vm.settingSummary,function(){    // get product units from settings 
                    GetBaseCurrency();
                    changeInventory();
                    loadCurrentImage();
                })
            });
            client.ifError(function(data){
                console.log("error loading full product data")
            })                
            client.postReq({
              'where' : "productCode = '"+vm.productCode+"' "
            });
        }

        function toggleChildStates(toggledState){
            $state.go(toggledState,{'itemID':vm.productCode});
        };

        function GetBaseCurrency(){
            if(vm.settingSummary[0].profile)
               vm.fullProduct.baseCurrency = vm.settingSummary[0].profile.baseCurrency;
        }

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
                                    // if (ProductUnits[i].unitsOfMeasurement == "Each") {  // if unit name "each" is exist in the settings app then it should be pre selected in the form 
                                    //     vm.fullProduct.productUnit= ProductUnits[i].unitsOfMeasurement;
                                    // }  
                        }
                    }                    
                }
            }      
            callback();
        }

        function GetCustFields(arr,callback){
            vm.proCustArr = [];
            var CustArr = [];
            if (arr[0].preference) {

                if(arr[0].preference.productPref)
                  CustArr = arr[0].preference.productPref.cusFiel; 
                if (CustArr.length > 0) {
                  for(var i=0; i<= CustArr.length-1; i++){
                    vm.proCustArr.push(CustArr[i]);
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

        function changeInventory() { // inventory tracking yes or no 
            if (vm.fullProduct.inventory == "No") {
                vm.stockDisabled = true; // disable stock level
                vm.fullProduct.quantity = "";
            } else if (vm.fullProduct.inventory == "Yes") {
                vm.stockDisabled = false; // enable stock level
                vm.fullProduct.quantity = "0";
            };
        }
        function checkProductCode(){
            vm.productCodeExsist = false;
            vm.submitProgress = false;
            vm.proCodeErr = '';
            if (vm.fullProduct.productCode != "") {
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
                    where: "productCode = '" +vm.fullProduct.productCode + "'",
                }); 
            } 
        }

        function isNormalInteger(str) { // check weather string is integer
          return /^\d+$/.test(str);
        }


        function copy(){
            if (!vm.productCodeExsist) 
                saveCopyProduct();
        }
        function saveCopyProduct(){


            vm.submitProgress = true;  
            vm.proCodeErr = '';
            vm.fullProduct.image = [];

            if (vm.imageArray.length > 0) {
                vm.fullProduct.uploadImages = [];
                for (var indexx = 0; indexx < vm.imageArray.length; indexx++) {
                    var client = $imageUploader.setImage(vm.imageArray[indexx].uniqueCode,'product');
                    client.ifSuccess(function(data){                    
                    });
                    client.ifError(function(data){ 
                    });
                    client.sendImage(vm.imageArray[indexx])   
                } 
                if (vm.imageArray.length > 0) {
                   
                  for(var i=0; i<= vm.imageArray.length-1; i++){
                    vm.fullProduct.uploadImages.push({
                      ID : "",
                      name : vm.imageArray[i].name,
                      size : vm.imageArray[i].size,
                      uniqueCode : vm.imageArray[i].uniqueCode,
                      appGuid : "",
                      appName : "product",
                      date : new Date(),
                      createUser : "",
                      type : "image"
                    })
                    vm.fullProduct.image.push({
                      ID : "",
                      name : vm.imageArray[i].name,
                      size : vm.imageArray[i].size,
                      uniqueCode : vm.imageArray[i].uniqueCode,
                      appGuid : "",
                      appName : "product",
                      date : new Date(),
                      createUser : "",
                      type : "image"
                    })
                  }
                }  
            };
            if (vm.brochureFiles.length > 0) {

                vm.fullProduct.uploadBrochure = [];

                for (var indexx = 0; indexx < vm.brochureFiles.length; indexx++) {
                  // http call for brochure upload  
                    var client = $imageUploader.setImage(vm.brochureFiles[indexx].uniqueCode,'product');
                    client.ifSuccess(function(data){                    
                    });
                    client.ifError(function(data){ 
                    });
                    client.sendBrochure(vm.brochureFiles[indexx])  
                } 
                if (vm.brochureFiles.length > 0) {
                  
                  for(var i=0; i<= vm.brochureFiles.length-1; i++){
                    vm.fullProduct.uploadBrochure.push({
                      ID : "",
                      name : vm.brochureFiles[i].name,
                      size : vm.brochureFiles[i].size,
                      uniqueCode : vm.brochureFiles[i].uniqueCode,
                      appGuid : "",
                      appName : "product",
                      date : new Date(),
                      createUser : "",
                      type : "brochure"
                    })
                    vm.fullProduct.image.push({
                      ID : "",
                      name : vm.brochureFiles[i].name,
                      size : vm.brochureFiles[i].size,
                      uniqueCode : vm.brochureFiles[i].uniqueCode,
                      appGuid : "",
                      appName : "product",
                      date : new Date(),
                      createUser : "",
                      type : "brochure"
                    })
                  }
                }  
            }; 

            vm.spinnerService.show('pro-copy-spinner');   
                
            vm.fullProduct.tags; 
            vm.fullProduct.modifyDate = new Date();  

            vm.fullProduct.productTotalPrice = vm.totalUSD;
            vm.fullProduct.salesTaxAmount = vm.totalUSD - vm.fullProduct.productPrice;
        
            if(vm.fullProduct.salesTaxAmount == 0 || vm.fullProduct.salesTaxAmount == "NaN"){
                vm.fullProduct.salesTaxAmount = "0";
            }
            
            vm.fullProduct.costPrice = (vm.fullProduct.costPrice === "") ? 0 : parseFloat(vm.fullProduct.costPrice);
            vm.fullProduct.productPrice = (vm.fullProduct.productPrice === "") ? 0 : parseFloat(vm.fullProduct.productPrice);


            vm.fullProduct.customFields.forEach(function(v){ delete v.fields });
            
            vm.fullProduct.productLog = {
                  userName : userName,
                  lastTranDate : new Date(),
                  description : "Product Edited By " + loginName,
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
            vm.fullProduct.productID = null;
            var serviceObj = {
                "product" : vm.fullProduct,
                "image" : vm.fullProduct.image,
                "appName" : 'Products',
                'permissionType' : 'add'
            }
            var jsonString = JSON.stringify(serviceObj)  

            var client =  $serviceCall.setClient("insertProduct","process"); // method name and service
            client.ifSuccess(function(result){  //sucess 

                $mdToast.show(
                  $mdToast.simple()
                    .textContent('Product successfully saved.')
                    .position('top right' )
                    .hideDelay(3000)
                );

              if (result.ID){
                  var thumbnails = {};
                  thumbnails[result.ID] = vm.uploadFile;  
                  localStorage.setItem("imgData", JSON.stringify(thumbnails));
              }

              vm.spinnerService.hide('pro-copy-spinner');
 
              $state.go("app.products.pro")
              // $state.go("home");

            })
            client.ifError(function(data){ //falce

              vm.spinnerService.hide('pro-copy-spinner');  
              console.log(data)
              var data = data.data;
              
              $mdDialog.show(
                  $mdDialog.alert()
                  .parent(angular.element(document.body))
                  .content(data.message)
                  .ariaLabel('Alert Dialog Demo')
                  .ok('OK')
                  .targetEvent()
              );
            })
            //client.projectID($stateParams.projectid); // send projectID as url parameters
            client.postReq(jsonString);        
        }
        
        function ifArray(arr){
          if (Array.isArray(arr) && arr.length > 0) 
            return true;
          else
            return false;
        }
    }
})();
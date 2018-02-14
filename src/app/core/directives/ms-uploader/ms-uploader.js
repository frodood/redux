(function(){
	'use strict';

	 angular
        .module('app.core') 
        .factory('uploaderService',uploaderService);

     /** @ngInject */
    function uploaderService(){

        var testArray = [];
        var basicinfo = [];
        var testArraybrochure = [];
        var basicinfobrochure = [];
        var imageString = [];

        var service = {
            setArraysEmpty : setArraysEmpty,
            setArraybrochure : setArraybrochure,
            loadArraybrochure : loadArraybrochure,
            loadBasicArraybrochure : loadBasicArraybrochure,
            BasicArraybrochure : BasicArraybrochure,
            setArray : setArray,
            loadArray : loadArray,
            loadBasicArray : loadBasicArray,
            BasicArray : BasicArray,
            removeArray : removeArray,
            removebasicArraybrochure : removebasicArraybrochure,
            removebasicArray : removebasicArray,
            removebasicArrayForInvoice : removebasicArrayForInvoice,
            saveToPdf : saveToPdf

        }
        return service;

        function setArraysEmpty(){
            testArray = [];
            basicinfo = [];
            testArraybrochure = [];
            basicinfobrochure = [];
        }
        function setArraybrochure(newVal) {
            testArraybrochure.push(newVal);
            return testArraybrochure;
        }
        function loadArraybrochure(){  
            return testArraybrochure;
            
        }
        function loadBasicArraybrochure(){              
            return basicinfobrochure;
        }
        function BasicArraybrochure(name,size,uniqueCode) {
            basicinfobrochure.push({'name': name , 'size': size,'uniqueCode': uniqueCode});
            console.log(basicinfobrochure);
            return basicinfobrochure;
        }
        function setArray(newVal) {
            testArray.push(newVal);
            return testArray;
        }
        function loadArray(){   
            return testArray;            
        }
        function loadBasicArray(){   
            return basicinfo;            
        }
        function BasicArray(name,size,uniqueCode) { 

            basicinfo.push({'name': name , 'size': size,'uniqueCode': uniqueCode});
            console.log(basicinfo);
            return basicinfo;
        }
        function removeArray(arr,type){

            if(type == "image") {
                for (var i = arr.length - 1; i >= 0; i--) {
                    testArray.splice(arr[i], 1);
                }
                console.log(testArray);
                return testArray;
            }
            else if(type == "brochure") {
                for (var i = arr.length - 1; i >= 0; i--) {
                    testArraybrochure.splice(arr[i], 1);
                };
                console.log(testArraybrochure);
                return testArraybrochure;
            }  
        }
        function removebasicArraybrochure(arr){
            for (var i = arr.length - 1; i >= 0; i--) {
                basicinfobrochure.splice(arr[i], 1);
            };
            console.log(basicinfobrochure);
            return basicinfobrochure;
        }
        function removebasicArray(arr){       
            for (var i = arr.length - 1; i >= 0; i--) {
                basicinfo.splice(arr[i], 1);
            };
            console.log(basicinfo);
            return basicinfo;    
        }
        function removebasicArrayForInvoice(arr){     
            basicinfo.splice(arr, 1);
            return basicinfo;    
        }
        function saveToPdf(string){
            imageString = string;
        }
        function setArraysEmpty(){
            return imageString;
        }
    }


	angular
        .module('app.core')
        .directive('uploader',uploader);
        
    /** @ngInject */
    function uploader($rootScope,$mdToast,uploaderService){
    	var directive = {
    		restrict: 'E',
			template: "<div class='ms-uploadercontent' ng-init='showUploadImage=false'>\
						   <div id='drop-files' ondragover='return false' layout='column' layout-align='space-around center' ng-style='{height : imgHeight }'>\
							    \
							      <div flex layout layout-align='center center' ng-show='!showUploadImage' >\
							         <md-icon  md-font-icon='icon-cloud-upload'></md-icon>\
							         <label for='file-upload' style='font-size:12px;margin-left:10px' class='ng-binding'>{{label}}</label><input  id='file-upload' type='file' style='display: none;'>\
							      </div>\
							      <div flex ng-show='showUploadImage'  >\
							      	<img class='showImg' id='upload-image' src='#' ng-style='{height : contentImg}'  />\
							      </div>\
							   </div>\
							</div>\
						</div>",
			scope:{			 
				label:'@',
				uploadType:'@',
				fileType : '@',
				imgHeight : '@'
			},
			link : linkFunc
    	}
    	return directive;

    	function linkFunc(scope,element){ 
	    	// Makes sure the dataTransfer information is sent when we
			// Drop the item in the drop box.
			jQuery.event.props.push('dataTransfer');
			scope.imgHeight= scope.imgHeight + 'px'
			scope.contentImg= (parseInt(scope.imgHeight) - 5) + 'px'
			console.log(scope.contentImg)
			// file/s on a single drag and drop
			var files;			
			// total of all the files dragged and dropped
			var filesArray = [];
			
			var sampleArray = [];
			var sampleArraybrochure = [];
			var fileType;
			scope.btnVisibility = false;

			function uniqueCode(){
				var date = new Date();
				var components = [
				    date.getYear(),
				    date.getMonth(),
				    date.getDate(),
				    date.getHours(),
				    date.getMinutes(),
				    date.getSeconds(),
				    date.getMilliseconds()
				];
				return components.join("");
			}

			element.find("#file-upload").bind('change',function(changeEvent){
		        scope.$apply(function () {
		            scope.fileread = changeEvent.target.files;
		            console.log(scope.fileread)
		        }); 
		        if (scope.fileType == 'single') {
			        if (scope.fileread.length > 1) {
						var backFile = {};
						backFile = scope.fileread[0];
						scope.fileread  = [];
						scope.fileread.push(backFile)
					}
					restartFiles();
		        }

		        if (scope.uploadType == "image") {
		        	for(var u=0; u<=scope.fileread.length-1; u++){ 		        			
		        		var extension = scope.fileread[u].name.split('.').pop();
		        		scope.fileread[u].uniqueCode = uniqueCode() +"." +extension;

				  		fileType = scope.fileread[u].type.split("/")[0];
				  		if (fileType == 'image') {
				  			scope.btnVisibility = true;
							filesArray.push(scope.fileread[u]);
							uploaderService.setArray(scope.fileread[u]);
							uploaderService.BasicArray(scope.fileread[u].name,scope.fileread[u].size,scope.fileread[u].uniqueCode);
							sampleArray.push({'name': scope.fileread[u].name, 'size': scope.fileread[u].size, 'uniqueCode' : scope.fileread[u].uniqueCode});
				  		}				 
					}

				}else if (scope.uploadType == "brochure") {

		        	for(var u=0; u<=scope.fileread.length-1; u++){ 		
		        		var extension = scope.fileread[u].name.split('.').pop();
		        		scope.fileread[u].uniqueCode = uniqueCode() +"." +extension;

				  		fileType = scope.fileread[u].type.split("/")[0];
				  		if (fileType == 'application' || fileType == 'image') {
				  			scope.btnVisibility = true;
							filesArray.push(scope.fileread[u]);
							uploaderService.setArraybrochure(scope.fileread[u]);
							uploaderService.BasicArraybrochure(scope.fileread[u].name,scope.fileread[u].size, scope.fileread[u].uniqueCode);
							sampleArraybrochure.push({'name': scope.fileread[u].name, 'size': scope.fileread[u].size, 'uniqueCode' : scope.fileread[u].uniqueCode});	
						}					 
					}

				}
				showImage(scope.fileread)        
		    })
			
			// Bind the drop event to the dropzone.
			element.find("#drop-files").bind('drop', function(changeEvent) {
					
				// Stop the default action, which is to redirect the page
				// To the dropped file
				
				files = changeEvent.dataTransfer.files || changeEvent.dataTransfer.files;
				if (scope.fileType == 'single') {
					
					if (files.length > 1) {
						var backFile = {};
						backFile = files[0];
						files  = [];
						files.push(backFile)
					}
					restartFiles();
				}

				if (scope.uploadType == "image") {

				  for(var indexx = 0; indexx < files.length; indexx++) {	
		        		var extension = files[indexx].name.split('.').pop();
		        		files[indexx].uniqueCode = uniqueCode() +"." +extension;		  		  
				  		fileType = files[indexx].type.split("/")[0];
				  		if (fileType == 'image') {
				  			scope.btnVisibility = true;
							filesArray.push(files[indexx]);
							uploaderService.setArray(files[indexx]);
							uploaderService.BasicArray(files[indexx].name,files[indexx].size,files[indexx].uniqueCode);
							sampleArray.push({'name': files[indexx].name, 'size': files[indexx].size, 'uniqueCode' : files[indexx].uniqueCode});
				  		}				 
					}

				}else if (scope.uploadType == "brochure") {

					 for(var indexx = 0; indexx < files.length; indexx++) {
		        		var extension = files[indexx].name.split('.').pop();
		        		files[indexx].uniqueCode = uniqueCode() +"." +extension;
				  		fileType = files[indexx].type.split("/")[0];

				  		if (fileType == 'application' || fileType == 'image' ) {
				  			scope.btnVisibility = true;
							filesArray.push(files[indexx]);
							uploaderService.setArraybrochure(files[indexx]);
							uploaderService.BasicArraybrochure(files[indexx].name,files[indexx].size,files[indexx].uniqueCode);
							sampleArraybrochure.push({'name': files[indexx].name, 'size': files[indexx].size, 'uniqueCode' : files[indexx].uniqueCode});	
						}					 
					}

				} 
				showImage(files)
			});	


			function showImage(file){
				scope.showUploadImage = true;
				var reader = new FileReader();

		        reader.onload = function (e) {
		            $('#upload-image').attr('src', e.target.result);
		        }

		        reader.readAsDataURL(file[0]);

		        scope.$apply()
			}

 
			function restartFiles() {			
				// We need to remove all the images and li elements as
				// appropriate. We'll also make the upload button disappear
				 $rootScope.$apply(function(){
					scope.showUploadButton = false;
					scope.showDeleteButton = false;
					scope.showUploadTable = false;
					scope.btnVisibility = false;
				 })		
				// And finally, empty the array
				uploaderService.removeArray(filesArray,scope.uploadType);
				uploaderService.removebasicArray(sampleArray);
				uploaderService.removebasicArraybrochure(sampleArraybrochure);
				filesArray = [];

				
				return false;
			}
			// Just some styling for the drop file container.
			element.find('#drop-files').bind('dragenter', function() {
				$(this).css({'box-shadow' : 'inset 0px 0px 20px rgba(0, 0, 0, 0.1)', 'border' : '2px dashed rgb(255,64,129)'});
				return false;
			});
			
			element.find('#drop-files').bind('drop', function() {
				$(this).css({'box-shadow' : 'none', 'border' : '2px dashed rgba(0,0,0,0.2)'});
				return false;
			});
			
		
			element.find('#deletebtn').click(restartFiles);
    	}

    }

   
})();
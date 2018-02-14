(function(){
	angular
		.module('app.expenses')
		.factory('fileUploader',fileUploader)
		.controller('dialogCtrl',dialogCtrl);

	fileUploader.$inject = ['$mdPanel'];

	function fileUploader($mdPanel){
		var service = {
			uploadFile : uploadFile,
			result : result,
			onClose : onClose
		}

		return service;


        function result(func){
        	result = func;
        	return this;
        }

		function uploadFile(type){
			var imageArray = [];
			var brochureFiles = [];
			var result;

        	var position = $mdPanel.newPanelPosition()
                .absolute()
                .center()
                .center();

            var animation = $mdPanel.newPanelAnimation(); 
            animation.withAnimation($mdPanel.animation.FADE);

            var config = {
                animation: animation,
                attachTo: angular.element(document.body),
                controller: 'dialogCtrl',
                controllerAs: 'vm',
                templateUrl: 'app/main/expenses/dilaogs/uploader/uploader.html',
                panelClass: 'dialog-uploader',
                position: position,
                trapFocus: true,
                zIndex: 150,
                clickOutsideToClose: true,
                clickEscapeToClose: true,
                hasBackdrop: true,
                locals : {
                    type : type
                }
            }; 
            $mdPanel.open(config);
		};
		function onClose(data,type){  
            setUniqueCode(data,type);
        }

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

        function setUniqueCode(data,type){
            if (data.length > 0) {
                if (type === 'brochure') {                    
                    brochureFiles = [];
                    angular.forEach(data,function(obj){
                        var extension = obj.lfFile.name.split('.').pop(); 
                        obj.lfFile.uniqueCode = uniqueCode() +"." +extension; 
                        brochureFiles.push(obj.lfFile);
                    }); 
                    result(brochureFiles);
                }
                else if (type === 'image') {                    
                    imageArray = [];
                    angular.forEach(data,function(obj){
                        var extension = obj.lfFile.name.split('.').pop(); 
                        obj.lfFile.uniqueCode = uniqueCode() +"." +extension; 
                        imageArray.push(obj.lfFile);
                    });  
                    result(imageArray);               
                }           
            } 
        }
       
	};


    function dialogCtrl($scope,mdPanelRef,type,fileUploader){
    	var vm = this;

        vm.closeDialog = closeDialog;

        vm.uploadItem = uploadItem;

        vm.files = []; 

        function closeDialog(){
            mdPanelRef.close();
        }

        function uploadItem(){
            mdPanelRef.close().then(function(mdPanelRef) {
                fileUploader.onClose(vm.files,type);
            });
        }
    };

})();
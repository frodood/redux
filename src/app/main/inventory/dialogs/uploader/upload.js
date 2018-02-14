(function(){
	angular
		.module('app.inventory')
		.factory('fileUploaderInven',fileUploaderInven)
		.controller('dialogCtrlInven',dialogCtrlInven);

	fileUploaderInven.$inject = ['$mdPanel'];

	function fileUploaderInven($mdPanel){
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
                controller: 'dialogCtrlInven',
                controllerAs: 'vm',
                templateUrl: 'app/main/inventory/dialogs/uploader/upload.html',
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
            setUniqueCode(data);
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
                imageArray = [];
                angular.forEach(data,function(obj){
                    var extension = obj.lfFile.name.split('.').pop(); 
                    obj.lfFile.uniqueCode = uniqueCode() +"." +extension; 
                    imageArray.push(obj.lfFile);
                });  
                result(imageArray);             
            } 
        }
       
	};


    function dialogCtrlInven($scope,mdPanelRef,type,fileUploaderInven){
    	var vm = this;

        vm.closeDialog = closeDialog;

        vm.uploadItem = uploadItem;

        vm.files = []; 

        function closeDialog(){
            mdPanelRef.close();
        }

        function uploadItem(){
            mdPanelRef.close().then(function(mdPanelRef) {
                fileUploaderInven.onClose(vm.files);
            });
        }
    };

})();
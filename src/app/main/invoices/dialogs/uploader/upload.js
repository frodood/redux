(function ()
{
    'use strict';

    angular
        .module('app.invoices')
        .factory('invfileUploader',invfileUploader)
        .controller('invDialogCtrl',invDialogCtrl);

   invfileUploader.$inject = ['$mdPanel'];

	function invfileUploader($mdPanel){
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

		function uploadFile(){
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
                controller: 'invDialogCtrl',
                controllerAs: 'vm',
                templateUrl: 'app/main/invoices/dialogs/uploader/upload.html',
                panelClass: 'dialog-uploader',
                position: position,
                trapFocus: true,
                zIndex: 150,
                clickOutsideToClose: true,
                clickEscapeToClose: true,
                hasBackdrop: true
            }; 
            $mdPanel.open(config);
		};
		function onClose(data){  
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

        function setUniqueCode(data){
            if (data.length > 0) {                  
                var brochureFiles = [];
                angular.forEach(data,function(obj){
                    var extension = obj.lfFile.name.split('.').pop(); 
                    obj.lfFile.uniqueCode = uniqueCode() +"." +extension; 
                    brochureFiles.push(obj.lfFile);
                }); 
                result(brochureFiles);
            } 
        }
       
	};


    function invDialogCtrl($scope,mdPanelRef,invfileUploader){
    	var vm = this;

        vm.closeDialog = closeDialog;

        vm.uploadItem = uploadItem;

        vm.files = []; 

        function closeDialog(){
            mdPanelRef.close();
        }

        function uploadItem(){
            mdPanelRef.close().then(function(mdPanelRef) {
                invfileUploader.onClose(vm.files);
            });
        }
    };

})();
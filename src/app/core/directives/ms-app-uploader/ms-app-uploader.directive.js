/*

/*
  version 6.0.0.3

  @namespace appUploaderDialog
  @desc common directive to upload media files 
  @author RASM  
  
  */

(function(){
	angular
  .module('app.core')
  .controller('appUploaderDialog',appUploaderDialog)
  .directive('appUploader',appUploader);

  appUploader.$inject = ['$mdPanel'];

  function appUploader($mdPanel){
    var directive ={
      restrict : "A",
      scope : {appUploader : '=',result:'&result'},
      link : linkFunc
    }
    return directive;

    function linkFunc(scope, element, attrs){
      element.click(function(){
        openPane()
      }); 
      
      function openPane(){
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
            controller: 'appUploaderDialog',
            controllerAs: 'vm',
            templateUrl: 'app/core/directives/ms-app-uploader/ms-app-uploader.html',
            panelClass: 'dialog-uploader',
            position: position,
            trapFocus: true,
            zIndex: 150,
            clickOutsideToClose: true,
            clickEscapeToClose: true,
            hasBackdrop: true,
            locals : {
                obj : scope.appUploader,
                onClose : setResullt
            }
        }; 
        
        $mdPanel.open(config)


        function setResullt(result){
          var obj = {'res':{}}
          obj.res[scope.appUploader.type] = result
          scope.result(obj)
        }
      }
    }
  }

function appUploaderDialog($scope,mdPanelRef,obj,onClose,$imageUploader){
  var vm = this; 

  vm.config = obj;

  vm.closeDialog = closeDialog;

  vm.uploadItem = uploadItem;

  vm.cropItem = cropItem;

  vm.uploadOriginal = uploadOriginal;

  vm.files = []; 

  vm.showUploader = true;

  vm.showUploaderBtn = true;

  vm.myCroppedImage = '';

  vm.errorMsg = "Not enough disk space in the disk";

  vm.showError = false;

  var originalImage;

  $scope.$watch('vm.files.length',function(){  
    if (vm.files.length > 0) {
      checkSize(vm.files)
    }
  }) 
  
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
      var imageArray = [];
      var extension = data.name.split('.').pop(); 
      data.uniqueCode = uniqueCode() +"." +extension; 
      imageArray.push(data);  
      mdPanelRef.close().then(function(){
        onClose(imageArray);
      });   
  }

  function uploadOriginal(){
    setUniqueCode(vm.files[0].lfFile); 
  }
  function closeDialog(){
    mdPanelRef.close();
  }

  function cropItem(){ 
    var file = dataURLtoFile(vm.myCroppedImage, originalImage.name); 
    setUniqueCode(file); 
  }

  function dataURLtoFile(dataurl, filename) {
      var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
          bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
      while(n--){
          u8arr[n] = bstr.charCodeAt(n);
      }
      return new File([u8arr], filename, {type:mime});
  }

  function uploadItem(){
    originalImage = vm.files[0].lfFile;
    vm.showUploader = false;
    convertImage();
  }

  function convertImage(){
    var file = vm.files[0].lfFile;
    var reader = new FileReader();
    reader.onload = function (evt) {
      $scope.$apply(function($scope){
        vm.myImage=evt.target.result; 
      });
    };
    reader.readAsDataURL(file);
  }

  function checkSize(file){
    var fr = new FileReader;

    fr.onload = function() { // file is loaded
        var img = new Image;

        img.onload = function() { 
            console.log(this.width/this.height)
            var sum = this.width/this.height;

            // debugger
            if (sum === 1) {
              vm.showUploaderBtn = false;
            }else{
              vm.showUploaderBtn = true;
            }

            $scope.$apply()
        };

        img.src = fr.result; // is the data URL because called with readAsDataURL
    }; 
    fr.readAsDataURL(file[0].lfFile);

    checkDiskSize()
  }

  function checkDiskSize(){
    var size = 0;
    for (var i=0; i<= vm.files.length-1; i++){
      size += vm.files[i].lfFile.size;
    }
    var client = $imageUploader.checkSize();
    client.ifSuccess(function(data){   
      if (!data.diskSpace) {
        vm.errorMsg = "Not enough disk space in the disk";
        vm.showError = true;
      }else{
        vm.showError = false;
      }              
    });
    client.ifError(function(data){ 
    });
    client.checkSize(size)     
  }
};

})();
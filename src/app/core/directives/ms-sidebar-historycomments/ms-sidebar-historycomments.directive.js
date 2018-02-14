(function()
{
	'use strict';

	angular
		.module('app.core')
		.controller('MsSidebarHistoryCommentsController',MsSidebarHistoryCommentsController)
		.directive('msSidebarHistoryComments',msSidebarHistoryCommentsDirective)
		.directive('msSidebarHistoryCommentsRemote', msSidebarHistoryCommentsRemoteDirective);

	/** @ngInject */
	function msSidebarHistoryCommentsDirective()
	{
		var historyandcommentsDirective = {
			restrict        : 'E',
            templateUrl     : 'app/core/directives/ms-sidebar-historycomments/ms-sidebar-historycomments.html',
            scope: {
            	application: '='
            },
            controller      : MsSidebarHistoryCommentsController,
            controllerAs	: 'vm',
            bindToController: true 
		};

		return historyandcommentsDirective;
	}

	/** @ngInject */
	function MsSidebarHistoryCommentsController($rootScope, $scope, $http, $state, $stateParams, $mdSidenav, activityContextService, msSpinnerService, $timeout)
	{
		var vm = this;

		vm.documentContext;

		vm.showHistoryComments = false;

		vm.historyItems = [];

		vm.commentsItems = [];

		vm.otherGenericItems;

		vm.liveComment;

		vm.submitComment = submitComment;

		vm.enterSubmitComment = enterSubmitComment;

		vm.handleSBActivitySpinner = handleSBActivitySpinner;

		vm.handleSBOtherSpinner = handleSBOtherSpinner;

		vm.handleSBCommentsSpinner = handleSBCommentsSpinner;

		$scope.$watch('$stateParams', function(current, original){
			
			if($stateParams !== null){
				vm.documentContext = $stateParams[Object.keys($stateParams)[0]];

				getAllContextHistoryComments(vm.application, vm.documentContext, 0, 100);
				
			}
		});

		$rootScope.$on('rfrshAcH', function(ev, args){
			getAllContextHistoryComments(vm.application, vm.documentContext, 0, 100);
		});

		function getAllContextHistoryComments(appName, docId, skiplvl, takelvl){
			activityContextService.getHistoryandComments(appName,docId,skiplvl,takelvl)
				.then(function(response){
					var historyCommentsCollection = response.data.history;

					vm.commentsItems = [];

					vm.historyItems = [];

					for(var i = 0; i < historyCommentsCollection.length; i++){
						if(historyCommentsCollection[i].type === "Comment"){
							vm.commentsItems.push(historyCommentsCollection[i]);
						}else{
							vm.historyItems.push(historyCommentsCollection[i]);
						}
					}

					vm.otherGenericItems = response.data.Other;

					msSpinnerService.hide('sidebar-activity-spinner');

					setCommentsEmptyState();
					
				});
		};

		function setCommentsEmptyState(){
			if(vm.commentsItems.length === 0){
				vm.showHistoryComments = true;
			}else{
				vm.showHistoryComments = false;
			}
		}

		function enterSubmitComment($event){
			if($event.keyCode === 13){
				submitComment();
			}
		}

		function submitComment(){

			if(vm.liveComment === undefined || vm.liveComment === ""){
			}else{
				activityContextService.setComment(vm.application,vm.documentContext,vm.liveComment)
					.then(function(response){
						if(response.data.isSuccess === true){
							vm.liveComment = "";
							getAllContextHistoryComments(vm.application, vm.documentContext, 0, 100);
						}
					});
			}
			
		};

		function handleSBActivitySpinner(sbActivitySpinner){
			sbActivitySpinner.show();
		};

		function handleSBOtherSpinner(sbOtherSpinner){
			sbOtherSpinner.show();
		};

		function handleSBCommentsSpinner(sbCommentsSpinner){
			sbCommentsSpinner.show();
		};
	}

	/** @ngInject */
	function msSidebarHistoryCommentsRemoteDirective()
	{
		var historyandcommentsremoteDirective = {
			restrict        : 'E',
            template        : [
            	'<md-button ng-show="vm.showRemote" class="md-icon-button" aria-label="History Comments" ng-click="vm.toggleSideBarHistoryDirective()">',
                '<md-icon md-font-icon="icon-comment-text"></md-icon>',
                '<md-tooltip><span>History & Comments</span></md-tooltip>',
                '</md-button>'		
        	].join(''),
        	scope: {},
            controller      : MsSidebarHistoryCommentsRemoteController,
            controllerAs	: 'vm',
            bindToController: true 
		};

		return historyandcommentsremoteDirective;
	}

	/** @ngInject */
	function MsSidebarHistoryCommentsRemoteController($scope, $stateParams, $mdSidenav, $window){

		var vm = this;

		vm.showRemote = ($window.innerWidth < 1366) ? true : false;

		angular.element($window).bind('resize', function () {
		    vm.showRemote = ($window.innerWidth < 1366) ? true : false;
		});

		vm.toggleSideBarHistoryDirective = toggleSideBarHistoryDirective;

		function toggleSideBarHistoryDirective(){
			$mdSidenav('historyCommentSidebar').toggle();
		};
	}

})();
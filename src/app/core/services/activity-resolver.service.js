(function(){

	'use strict';

	angular
		.module('activityContext',[])
		.factory('activityContextService',activityContextService);

	/** @ngInject */
	function activityContextService($rootScope, $window, $http, $q, $log){

		var baseHost = $window.location.host;
		var isPrimed = false;

		var activityContextService = {
			getHistoryandComments : getHistoryandComments,
			setComment : setComment,
			setActivity : setActivity,
			deleteComment : deleteComment  
		};

		return activityContextService;

		//Utility Function
		//

		function getHost() {
			var host = window.location.protocol + '//' + window.location.hostname;
			if (host.indexOf("localhost") !== -1 || host.indexOf("127.0.0.1") !== -1) {
				host = window.location.protocol + '//' + "geomsolutions.developer.12thdoor.com"; //test host 
			}
			return host;
		}

		function getHistoryandComments(appName, uniqueID, skipLvl, takeLvl){

			return 	$http({
						url: getHost()+'/services/duosoftware.process.service/process/getHistoryAndComment?skip='+skipLvl+'&take='+takeLvl+'&appName='+appName+'&uniqueID='+uniqueID,
						method: "GET",
						headers: {
							securityToken:$rootScope.cc_sessionInfo.SecurityToken
						}
					}).then(getHistoryCommentsComplete).catch(getHistoryCommentsFailed);


			function getHistoryCommentsComplete(response){
				return response;
			}

			function getHistoryCommentsFailed(error){
				$log.error('XHR failed for getHistoryandComments.'+error);
			}
		}

		function setComment(appName, uniqueID, desc){

			var commentPayload = {
				"appName": appName,
				"data":{
					"uniqueID": uniqueID,
					"logID": "",
					"action": "user",
					"type": "Comment",
					"description": desc,
					"status": "Active"
				}
			};

			console.log(commentPayload);
			
			return $http({
						url: getHost()+'/services/duosoftware.process.service/process/saveHistoryAndComment',
						method: "POST",
						data: commentPayload,
						headers: {
							securityToken:$rootScope.cc_sessionInfo.SecurityToken
						}
					}).then(setCommentComplete).catch(setCommentFailed);

			function setCommentComplete(response){
				return response;
			}

			function setCommentFailed(error){
				$log.error('XHR failed for setComments.'+error);
			}
		}

		function setActivity(appName, uniqueID, payload){

		}

		function deleteComment(appName, uniqueID, payload){

		}

	};

})();


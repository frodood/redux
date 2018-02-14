	/*
	- Stripe Payemnt Tool -
		Version 1.0.1
*/

(function(spt) {

	spt.directive('stripePayment', ['$window', function ($window) {
		return {
			restrict: 'A',
			scope: {
				config: '=stripePayment'
			},
			controller: ['$scope', '$rootScope', function ($scope, $rootScope) {

				// var config = $scope.config;

				$rootScope.paymentConfig = "This is reachable !";

				var handler = (function() {

					var h;

					function open(ev) {

						h = StripeCheckout.configure({
							key: $scope.config.publishKey,
							image: $scope.config.logo,
							panelLabel: $scope.config.label,
							token: function(token) {
								$rootScope.$broadcast('stripe-token-received', token);
							},
							closed : function(){ 
								$rootScope.$broadcast('popUpClose');
							}
						});
						h.open({
							name: $scope.config.title,
							description: $scope.config.description
						});

						ev.preventDefault();
					}

					function close() { 
						if(h){
							handler.close();
							
						}
					}

					return {
						open: open,
						close: close
					}

				})();

				$scope.open = handler.open;
				$scope.close = handler.close;

			}],
			link: function (scope, element, attrs,rootScope) {
				// element.bind('click', function(ev) {
				// 	scope.open(ev);
				// });

				console.log('hit from plan upgrade !');

				angular.element($window).on('popstate', function() {
					scope.close();
				});

				scope.$on('close_stripe',function(){
					debugger
					var stripePanel = document.getElementsByClassName('stripe_checkout_app');
					console.log(stripePanel);
					stripePanel.parentNode.removeChild(stripePanel);
				})


				scope.$on('call_stripe',function(ev,config){
					scope.open(ev);
				})

			}
		};

	}]);

	spt.directive('pkgStripePayment', ['$window', function ($window) {
		return {
			restrict: 'A',
			scope: {
				config: '=pkgStripePayment'
			},
			controller: ['$scope', '$rootScope', function ($scope, $rootScope) {

				var config = $scope.config;
				if(!config.hasOwnProperty('publishKey')){
					console.error("Stripe api key not provided."); return;
				}

				var handler = (function() {

					var handler = StripeCheckout.configure({
						key: config.publishKey,
						image: config.logo,
						panelLabel: config.label,
						token: function(token) {
							$rootScope.$broadcast('pkg-stripe-token-received', token);
						}
					});

					var open = function(ev) {
						handler.open({
							name: config.title,
							description: config.description
						});

						ev.preventDefault();
					}

					var close = function() {
						handler.close();
					}

					return {
						open: open,
						close: close
					}

				})();

				$scope.open = handler.open;
				$scope.close = handler.close;

			}],
			link: function (scope, element, attrs) {

				element.bind('click', function(ev) {
					scope.open(ev);
				});

				angular.element($window).on('popstate', function() {
					scope.close();
				});

			}
		};

	}]);

	spt.directive('addStripeCard', ['$window', function ($window) {
		return {
			restrict: 'A',
			scope: {
				config: '=addStripeCard'
			},
			controller: ['$scope', '$rootScope', function ($scope, $rootScope) {

				var config = $scope.config;
				if(!config.hasOwnProperty('publishKey')){
					console.error("Stripe api key not provided."); return;
				}

				var handler = (function() {

					var handler = StripeCheckout.configure({
						key: config.publishKey,
						image: config.logo,
						panelLabel: config.label,
						token: function(token) {
							$rootScope.$broadcast('add-stripecard-token-received', token);
						}
					});

					var open = function(ev) {
						handler.open({
							name: config.title,
							description: config.description
						});

						ev.preventDefault();
					}

					var close = function() {
						handler.close();
					}

					return {
						open: open,
						close: close
					}

				})();

				$scope.open = handler.open;
				$scope.close = handler.close;

			}],
			link: function (scope, element, attrs) {

				element.bind('click', function(ev) {
					scope.open(ev);
				});

				angular.element($window).on('popstate', function() {
					scope.close();
				});

			}
		};

	}]);

})(angular.module('stripe-payment-tools', []));

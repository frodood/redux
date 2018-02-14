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

				var handler = (function() {

					

					var open = function(ev) {

						var handler = StripeCheckout.configure({
							key: $scope.config.publishKey,
							image: $scope.config.logo,
							panelLabel: $scope.config.label,
							token: function(token) {
								$rootScope.$broadcast('stripe-token-received', token);
							}
						});
						handler.open({
							name: $scope.config.title,
							description: $scope.config.description
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
			link: function (scope, element, attrs,rootScope) {
				// element.bind('click', function(ev) {
				// 	scope.open(ev);
				// });

				angular.element($window).on('popstate', function() {
					scope.close();
				});


				scope.$on('call_stripe',function(ev,config){
					// scope.config = config;
					scope.open(ev);
				})

			}
		};

	}])

})(angular.module('stripe-payment-tools', []));

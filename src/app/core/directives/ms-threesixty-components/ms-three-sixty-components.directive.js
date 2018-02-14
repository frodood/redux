(function(){

	'use strict';

	angular
		.module('app.core')
		.directive('threesixtyContextDefinerComponent', threesixtyContextDefinerComponent)
		.directive('threesixtyBargraphWidgetComponent', threesixtyBargraphWidgetComponent)
		.directive('threesixtyBiteinfoCollection', threesixtyBiteinfoCollection)
		.directive('threesixtyTopsellinglisterWidgetComponent', threesixtyTopsellinglisterWidgetComponent)
		.directive('threesixtyContactinfoWidgetComponent', threesixtyContactinfoWidgetComponent)
		.directive('threesixtyLatestdocumentsWidgetComponent', threesixtyLatestdocumentsWidgetComponent);

	/** @ngInject */
	function threesixtyContextDefinerComponent()
	{
		var threesixtyContextDefinerComponentDirective = {
			restrict        : 'E',
            templateUrl     : 'app/core/directives/ms-threesixty-components/views/ms-threesixty-context-definer-component.html',
            scope: {
            	contextdata: '='
            }
		};

		return threesixtyContextDefinerComponentDirective;
	}

	/** @ngInject */
	function threesixtyBargraphWidgetComponent()
	{
		var threesixtyBargraphWidgetComponentDirective = {
			restrict        : 'E',
            templateUrl     : 'app/core/directives/ms-threesixty-components/views/ms-threesixty-bargraph-widget-component.html',
            scope: {
            	contextdata: '='
            }
		};

		return threesixtyBargraphWidgetComponentDirective;
	}

	/** @ngInject */
	function threesixtyBiteinfoCollection()
	{
		var threesixtyBiteinfoCollectionDirective = {
			restrict        : 'E',
            templateUrl     : 'app/core/directives/ms-threesixty-components/views/ms-threesixty-biteinfo-collection.html',
            scope: {
            	contextdata: '='
            }
		};

		return threesixtyBiteinfoCollectionDirective;
	}

	/** @ngInject */
	function threesixtyTopsellinglisterWidgetComponent()
	{
		var threesixtyTopsellinglisterWidgetComponentDirective = {
			restrict        : 'E',
            templateUrl     : 'app/core/directives/ms-threesixty-components/views/ms-threesixty-topsellinglister-widget-component.html',
            scope: {
            	contextdata: '='
            }
		};

		return threesixtyTopsellinglisterWidgetComponentDirective;
	}

	/** @ngInject */
	function threesixtyContactinfoWidgetComponent()
	{
		var threesixtyContactinfoWidgetComponentDirective = {
			restrict        : 'E',
            templateUrl     : 'app/core/directives/ms-threesixty-components/views/ms-threesixty-contactinfo-widget-component.html',
            scope: {
            	contextdata: '='
            }
		};

		return threesixtyContactinfoWidgetComponentDirective;
	}

	/** @ngInject */
	function threesixtyLatestdocumentsWidgetComponent()
	{
		var threesixtyLatestdocumentsWidgetComponentDirective = {
			restrict        : 'E',
            templateUrl     : 'app/core/directives/ms-threesixty-components/views/ms-threesixty-latestdocuments-widget-component.html',
            scope: {
            	contextdata: '='
            }
		};

		return threesixtyLatestdocumentsWidgetComponentDirective;
	}

})();
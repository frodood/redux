(function ()
{
    'use strict';

    angular
        .module('app.core')
        .provider('msApi', msApiProvider);

    /** @ngInject **/
    function msApiProvider()
    {
        var provider = this;

        var $log = angular.injector(['ng']).get('$log');

        var baseUrl = '';
        var api = [];

        provider.setBaseUrl = setBaseUrl;
        provider.getBaseUrl = getBaseUrl;
        provider.getApiObject = getApiObject;
        provider.register = register;

        function setBaseUrl(url)
        {
            baseUrl = url;
        }

        function getBaseUrl()
        {
            return baseUrl;
        }

        function getApiObject()
        {
            return api;
        }

        function register(key, resource)
        {
            if ( !angular.isString(key) )
            {
                $log.error('"path" must be a string (eg. `dashboard.project`)');
                return;
            }

            if ( !angular.isArray(resource) )
            {
                $log.error('"resource" must be an array and it must follow $resource definition');
                return;
            }

            api[key] = {
                url          : baseUrl + (resource[0] || ''),
                paramDefaults: resource[1] || [],
                actions      : resource[2] || [],
                options      : resource[3] || {}
            };
        }

        this.$get = function ($log, $q, $resource, $rootScope)
        {

            var service = {
                setBaseUrl: setBaseUrl,
                getBaseUrl: getBaseUrl,
                register  : register,
                resolve   : resolve,
                request   : request
            };

            return service;

            function resolve(action, parameters)
            {

                $rootScope.$broadcast('msApi::resolveStart');
                
                var actionParts = action.split('@'),
                    resource = actionParts[0],
                    method = actionParts[1],
                    params = parameters || {};

                if ( !resource || !method )
                {
                    $log.error('msApi.resolve requires correct action parameter (resourceName@methodName)');
                    return false;
                }

                var deferred = $q.defer();

                var apiObject = api[resource];

                if ( !apiObject )
                {
                    $log.error('Resource "' + resource + '" is not defined in the api service!');
                    deferred.reject('Resource "' + resource + '" is not defined in the api service!');
                }
                else
                {

                    var resourceObject = $resource(apiObject.url, apiObject.paramDefaults, apiObject.actions, apiObject.options);

                    resourceObject[method](params,

                        function (response)
                        {
                            deferred.resolve(response);

                            $rootScope.$broadcast('msApi::resolveSuccess');
                        },

                        function (response)
                        {
                            deferred.reject(response);

                            $rootScope.$broadcast('msApi::resolveError');
                        }
                    );
                }

                return deferred.promise;
            }

            function request(action, parameters, success, error)
            {
                $rootScope.$broadcast('msApi::requestStart');
                
                var actionParts = action.split('@'),
                    resource = actionParts[0],
                    method = actionParts[1],
                    params = parameters || {};

                if ( !resource || !method )
                {
                    $log.error('msApi.resolve requires correct action parameter (resourceName@methodName)');
                    return false;
                }

                var deferred = $q.defer();

                var apiObject = api[resource];

                if ( !apiObject )
                {
                    $log.error('Resource "' + resource + '" is not defined in the api service!');
                    deferred.reject('Resource "' + resource + '" is not defined in the api service!');
                }
                else
                {
                    var resourceObject = $resource(apiObject.url, apiObject.paramDefaults, apiObject.actions, apiObject.options);

                    resourceObject[method](params,

                        function (response)
                        {
                            $rootScope.$broadcast('msApi::requestSuccess');
                            
                            deferred.resolve(response);

                            if ( angular.isDefined(success) && angular.isFunction(success) )
                            {
                                success(response);
                            }
                        },

                        function (response)
                        {
                            $rootScope.$broadcast('msApi::requestError');
                            
                            deferred.reject(response);

                            if ( angular.isDefined(error) && angular.isFunction(error) )
                            {
                                error(response);
                            }
                        }
                    );
                }

                return deferred.promise;
            }
        };
    }
})();
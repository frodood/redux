(function ()
{
    'use strict';

    angular
        .module('app.core')
        .factory('apiResolver', apiResolverService);

    /** @ngInject */
    function apiResolverService($q, $log, api)
    {
        var service = {
            resolve: resolve
        };

        return service;

        function resolve(action, parameters)
        {
            var actionParts = action.split('@'),
                resource = actionParts[0],
                method = actionParts[1],
                params = parameters || {};

            if ( !resource || !method )
            {
                $log.error('apiResolver.resolve requires correct action parameter (ResourceName@methodName)');
                return false;
            }

            var deferred = $q.defer();

            var apiObject = getApiObject(resource);

            if ( !apiObject )
            {
                $log.error('Resource "' + resource + '" is not defined in the api service!');
                deferred.reject('Resource "' + resource + '" is not defined in the api service!');
            }
            else
            {
                apiObject[method](params,

                    function (response)
                    {
                        deferred.resolve(response);
                    },

                    function (response)
                    {
                        deferred.reject(response);
                    }
                );
            }

            return deferred.promise;
        }

        function getApiObject(resource)
        {
            var resourceParts = resource.split('.'),
                apiObject = api;

            for ( var l = 0; l < resourceParts.length; l++ )
            {
                if ( angular.isUndefined(apiObject[resourceParts[l]]) )
                {
                    $log.error('Resource part "' + resourceParts[l] + '" is not defined!');
                    apiObject = false;
                    break;
                }

                apiObject = apiObject[resourceParts[l]];
            }

            if ( !apiObject )
            {
                return false;
            }

            return apiObject;
        }
    }

})();
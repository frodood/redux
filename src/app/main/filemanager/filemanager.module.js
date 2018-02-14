////////////////////////////////
// App : File Manager App
// Owner  : Saumi
// Last changed date : 2017/03/13
// Version : 6.1.0.8
// Modified By : Dilshan Kaluarachchi
/////////////////////////////////


(function ()
{
    'use strict';

    angular
        .module('app.filemanager', ['12th-config'])
        .config(config);

    /** @ngInject */
    function config($stateProvider, $translatePartialLoaderProvider, msApiProvider, msNavigationServiceProvider)
    {
        console.log('%c File Manager version 6.1.0.8', 'font-size: 25px;');
        // State
        $stateProvider
            .state('app.filemanager', {
                url    : '/filemanager',
                views  : {
                    'content@app': {
                        templateUrl: 'app/main/filemanager/views/filemanager.html',
                        controller : 'FileManagerController as vm'
                    }
                },
                resolve: {
                    

                    FileManager : function($serviceCall)
                    {
                        var client =  $serviceCall.setClient("getImageDataByQuery","process");                        
                        client.skip(0);
                        client.take(10); 
                        client.orderby('');
                        client.isAscending(false);
                        //client.class('Customer');
                        return client.postResolve({
                        "where": "type  <> 'invalid' order by 'date'"
                        });
                    },
                }
            });
            //  .state('app.filemanager',{
            //     url : '/compose/supplier',
            //     views : {
            //         'content@app' : {
            //             templateUrl : 'app/main/contacts/views/supplier/compose/supplierCompose.html',
            //             controller : 'supplierComposeController as vm'
            //         }
            //     }
            // });

        // Translation
        $translatePartialLoaderProvider.addPart('app/main/sample');

        // Api
        msApiProvider.register('sample', ['app/data/sample/sample.json']);

        // Navigation

        msNavigationServiceProvider.saveItem('FileManager', {
            title    : 'File Manager',
            icon     : 'icon-tile-four',
            state    : 'app.filemanager',
            /*stateParams: {
                'param1': 'page'
             },*/
            weight   : 13
        });
    }
})();
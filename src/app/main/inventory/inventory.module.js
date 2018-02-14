////////////////////////////////
// App : Inventory App
// Owner  : Dilshan Kaluarachchi
// Last changed date : 2018/02/08
// Version : INVENTORY 6.1.0.45
// Modified By : Dilshan Kaluarachchi
/////////////////////////////////



(function ()
{
    'use strict';

    angular
        .module('app.inventory', [])
        .config(config);

    /** @ngInject */
    function config($stateProvider, $translatePartialLoaderProvider, msApiProvider, msNavigationServiceProvider)
    {
        console.log('INVENTORY 6.1.0.45');
        $stateProvider
            //Parent State
            .state('app.inventory',{
                abstract : true,
                url : '/inventory',
                resolve : {
                    Received : function($serviceCall)
                    {
                        var client =  $serviceCall.setClient("getGRNSummaryByQuery","inventory");                        
                        client.skip(0);
                        client.take(10); 
                        client.orderby('');
                        client.isAscending(false);
                        return client.postResolve({
                        "where": "deleteStatus = 'false' order by 'createdDate'"
                        });
                    },
                    Issued : function($serviceCall)
                    {
                        //return msApi.resolve('invoices.recurring@get');

                        var client =  $serviceCall.setClient("getGINSummaryByQuery","inventory");                        
                        client.skip(0);
                        client.take(10); 
                        client.orderby('');
                        client.isAscending(false);
                        return client.postResolve({
                        "where": "deleteStatus = 'false' order by 'createdDate'"
                        });
                    }
                }
            })
            //Secondary State Received note
            .state('app.inventory.grn',{
                url : '/grn',
                views : {
                    'content@app' : {
                        templateUrl : 'app/main/inventory/views/grn/grn.html',
                        controller : 'inventoryCtrlGRN as vm'
                    }
                }
            })
            //Child State Received note Detail
            .state('app.inventory.grn.detail',{
                url : '/:itemID',
                params: { status: status }
            })


            
            //Secondary State issued note
            .state('app.inventory.gin',{
                url : '/gin',
                views : {
                    'content@app' : {
                        templateUrl : 'app/main/inventory/views/gin/gin.html',
                        controller : 'inventoryCtrlGIN as vm'
                    }
                }
            })
            //Child State issued note Detail
            .state('app.inventory.gin.detail',{
                url : '/:itemID',
                params: { status: status }
            })



            //Chiild State Create
            .state('app.inventory.grnCompose',{
                url : '/compose/grn',
                views : {
                    'content@app' : {
                        templateUrl : 'app/main/inventory/views/grn/compose/grnCompose.html',
                        controller : 'grnComposeController as vm'
                    }
                },
                permModel : {                    
                    parentContext : 'inventory',                    
                    stateContext : 'add'                
                },
                params : {
                    'Data' : null,
                    'appName' : null
                },
                resolve : {
                    settingSummary : function($serviceCall){
                        var client =  $serviceCall.setClient("getAllByQuery","setting"); 
                        client.skip(0);
                        client.take(1); 
                        return client.postResolve({
                            "preference" : "inventoryPref"
                        });
                    }
                }
            })

             .state('app.inventory.ginCompose',{
                url : '/compose/gin',
                views : {
                    'content@app' : {
                        templateUrl : 'app/main/inventory/views/gin/compose/ginCompose.html',
                        controller : 'ginComposeController as vm'
                    }
                },
                permModel : {                    
                    parentContext : 'inventory',                    
                    stateContext : 'add'                
                },
                params : {
                    'Data' : null,
                    'appName' : null
                },
                resolve : {
                    settingSummary : function($serviceCall){
                        var client =  $serviceCall.setClient("getAllByQuery","setting"); 
                        client.skip(0);
                        client.take(1); 
                        return client.postResolve({
                            "preference" : "inventoryPref"
                        });
                    }
                }
            });
            //Chiild State Create
            // .state('app.inventory.compose',{
            //     url : '/compose',
            //     views : {
            //         'content@app' : {
            //             templateUrl : 'app/main/inventory/views/compose/invCompose.html',
            //             controller : 'invComposeController as vm'
            //         }
            //     }
            // });

        // Api registration
        // msApiProvider.register('invoices.summary', ['app/data/invoices/summary.json']);
        // msApiProvider.register('invoices.recurring', ['app/data/invoices/recurring.json']);

        // Navigation
        msNavigationServiceProvider.saveItem('Inventory', {
            title      : 'Inventory',
            icon       : 'icon-email',
            state      : 'app.inventory.grn',
            weight     : 9
        });
    }
})();

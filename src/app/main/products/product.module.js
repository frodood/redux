/*

/* 

    @namespace app.products
    @desc product application for 12th door 
    @author RASM    
    
*/


(function ()
{

    'use strict';



    angular
        .module('app.products', [])
        .config(config);
    /** @ngInject */
    function config($stateProvider, $translatePartialLoaderProvider, msNavigationServiceProvider)
    {

        console.log('product app 6.1.0.86');

        $stateProvider
            //Parent State
            .state('app.products',{
                abstract : true,
                url : '/products',
                resolve : {
                    productSummary : function($serviceCall){ 
                       
                    }
                }
            })
            //Secondary State Invoice
            .state('app.products.pro',{
                url : '/pro',
                views : {
                    'content@app' : {
                        templateUrl : 'app/main/products/views/pro/pro.html',
                        controller : 'proController as vm'
                    }
                }
            })  
            //Chiild State Recurring Detail
            .state('app.products.pro.detail',{
                url : '/:itemID'
            })
            //Chiild State Create
            .state('app.products.compose',{
                url : '/compose',
                params : {
                    'appID' : null,
                    'profileID' : null
                },
                views : {
                    'content@app' : {
                        templateUrl : 'app/main/products/views/compose/proCompose.html',
                        controller : 'proComposeController as vm'
                    }
                },
                resolve : {
                    settingSummary : function($serviceCall){
                        var client =  $serviceCall.setClient("getAllByQuery","setting"); 
                        client.skip(0);
                        client.take(1); 
                        return client.postResolve({
                            "preference" : "productPref,inventoryPref",
                            "setting" : "taxes,profile"
                        });
                    }
                },
                permModel : {
                    parentContext : 'Products',
                    stateContext : 'add'
                }

            })
            //Chiild State Create
            .state('app.products.edit',{
                url : '/edit/:itemID',
                views : {
                    'content@app' : {
                        templateUrl : 'app/main/products/views/edit/proEdit.html',
                        controller : 'proEditController as vm'
                    }
                },
                resolve : {
                    settingSummary : function($serviceCall){
                        var client =  $serviceCall.setClient("getAllByQuery","setting"); 
                        client.skip(0);
                        client.take(1); 
                        return client.postResolve({
                            "preference" : "productPref,inventoryPref",
                            "setting" : "taxes,profile"
                        });
                    }
                },
                permModel : {
                    parentContext : 'Products',
                    stateContext : 'edit'
                }
            }) 
            //Chiild State Create
            .state('app.products.copy',{
                url : '/copy/:itemID',
                views : {
                    'content@app' : {
                        templateUrl : 'app/main/products/views/copy/proCopy.html',
                        controller : 'proCopyController as vm'
                    }
                },
                resolve : {
                    settingSummary : function($serviceCall){
                        var client =  $serviceCall.setClient("getAllByQuery","setting"); 
                        client.skip(0);
                        client.take(1); 
                        return client.postResolve({
                            "preference" : "productPref,inventoryPref",
                            "setting" : "taxes,profile"
                        });
                    }
                },
                permModel : {
                    parentContext : 'Products',
                    stateContext : 'add'
                }
            }); 

        // Navigation
        msNavigationServiceProvider.saveItem('products', {
            title      : 'Products',
            icon       : 'icon-email',
            state      : 'app.products.pro',
            weight     : 3
        });
    }
})();

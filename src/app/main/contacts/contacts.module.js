////////////////////////////////
// App : Contact App
// Owner  : Dushmantha
// Last changed date : 2017/07/10
// Version : 6.1.0.97
// Modified By : Eshwaran Veerabahu
/////////////////////////////////

(function ()
{
    'use strict';
    
    angular
        .module('app.contacts', ['12th-config'])
        .config(config);

    /** @ngInject */
    function config($stateProvider, $translatePartialLoaderProvider, msApiProvider, msNavigationServiceProvider)
    {
        console.log('CONTACT 6.1.0.97');

        $stateProvider
            //Parent State
            .state('app.contacts',{
                abstract : true,
                url : '/contacts',
                resolve : {
                    // Customer : function($serviceCall)
                    // {
                    //     var client =  $serviceCall.setClient("getAllByQuery","profile");                        
                    //     client.skip(0);
                    //     client.take(10); 
                    //     client.orderby('');
                    //     client.isAscending(false);
                    //     client.class('Customer');
                    //     return client.postResolve({
                    //     "where": "deleteStatus = 'false' order by 'createDate'"
                    //     });
                    // },
                    // Supplier : function($serviceCall)
                    // {
                    //    // return msApi.resolve('invoices.recurring@get');

                    //     var client =  $serviceCall.setClient("getAllByQuery","profile");                        
                    //     client.skip(0);
                    //     client.take(10); 
                    //     client.orderby('');
                    //     client.isAscending(false);
                    //     client.class('Supplier');
                    //     return client.postResolve({
                    //     "where": "deleteStatus = 'false' order by 'createDate' "
                    //     });
                    // }
                }
            })
            //Secondary State Inventory
            .state('app.contacts.customer',{
                url : '/customer',
                views : {
                    'content@app' : {
                        templateUrl : 'app/main/contacts/views/customer/customer.html',
                        controller : 'customerController as vm'
                    }
                }
                // resolve : {
                //     customerResolve : function(){}
                // }
            })
            //Child State Inventory Detail
            .state('app.contacts.customer.detail',{ 
                url : '/:itemID'


                // resolve : {
                //      legerDetailswithPaging : function($serviceCall,$stateParam){
          
                //     }

                // }
               

            })
            //Secondary State issued note
            .state('app.contacts.supplier',{
                url : '/supplier',
                views : {
                    'content@app' : {
                        templateUrl : 'app/main/contacts/views/supplier/supplier.html',
                        controller : 'supplierController as vm'
                    }
                }
            })
            //Chiild State issued note Detail
            .state('app.contacts.supplier.detail',{
                // url : '/:itemID',
                // params: { status: status }
            })
            //Chiild State Create
            .state('app.contacts.CusCompose',{
                url : '/compose/customer',
                views : {
                    'content@app' : {
                        templateUrl : 'app/main/contacts/views/customer/compose/customerCompose.html',
                        controller : 'customerComposeController as vm'
                    }
                },
                permModel : {                    
                    parentContext : 'contacts',                    
                    stateContext : 'add'                
                } 
            })

             .state('app.contacts.SupCompose',{
                url : '/compose/supplier',
                views : {
                    'content@app' : {
                        templateUrl : 'app/main/contacts/views/supplier/compose/supplierCompose.html',
                        controller : 'supplierComposeController as vm'
                    }
                },
                permModel : {                    
                    parentContext : 'contacts',                    
                    stateContext : 'add'                
                } 
            });

        // Api registration
        // msApiProvider.register('invoices.summary', ['app/data/invoices/summary.json']);
        // msApiProvider.register('invoices.recurring', ['app/data/invoices/recurring.json']);

        // Navigation
        msNavigationServiceProvider.saveItem('Contacts', {
            title      : 'Contacts',
            icon       : 'icon-email',
            state      : 'app.contacts.customer',
            weight     : 2
        });
    }
})();
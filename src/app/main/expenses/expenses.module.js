////////////////////////////////
// App : Expenses App
// Owner  : Divani
// Version : 6.1.0.63
// Modified By : Divani
/////////////////////////////////

(function ()
{
    'use strict';

    angular
    .module('app.expenses', [])
    .config(config);

    /** @ngInject */
    function config($stateProvider, $translatePartialLoaderProvider, msApiProvider, msNavigationServiceProvider)
    {
        console.log('EXPENSES 6.1.0.63');
        // State
        $stateProvider

        .state('app.expenses', {
            abstract : true,
            url    : '/expenses',
            resolve: {
                // expenseGetAll: function ($serviceCall)
                // {
                //     var client =  $serviceCall.setClient("getExpenseSummaryByQuery","expense");                        
                //     client.skip(0);
                //     client.take(7); 
                //     client.orderby('createDate');
                //     client.isAscending(false);
                //     return client.postResolve({
                //         "where": "deleteStatus = 'false'"
                //     });                       
                // },
                settingSummary : function($serviceCall){
                    var client =  $serviceCall.setClient("getAllByQuery","setting");    
                    return client.postResolve({
                        "preference":"expensePref",
                        "setting":"profile,taxes",
                    });
                },
                supplierGetAll: function ($serviceCall)
                {
                    var client =  $serviceCall.setClient("getAllByQuery","profile");                        
                    client.skip(0);
                    client.take(7); 
                    client.orderby('profileID');
                    client.isAscending(false);
                    client.class('Supplier');
                    return client.postResolve({
                        "where":"deleteStatus = 'false' "
                    });                       
                } 
            }
        })

        .state('app.expenses.exp',{
            url    : '/exp',
            views  : {
                'content@app': {
                    templateUrl: 'app/main/expenses/views/exp/exp.html',
                    controller : 'expController as vm'
                }
            }
        })
         //Child State expense Detail
        .state('app.expenses.exp.detail',{
            url : '/:itemId'
        })

        .state('app.expenses.edit',{
            url : '/edit/:itemId',
            views : {
                'content@app' : {
                    templateUrl : 'app/main/expenses/views/edit/expEdit.html',
                    controller : 'expEditController as vm'
                }
            },
            permModel : {                    
                parentContext : 'expenses',                    
                stateContext : 'edit'                
            } 
        })
        //Chiild State Create
        .state('app.expenses.compose',{
            url : '/compose',
            views : {
                'content@app' : {
                    templateUrl : 'app/main/expenses/views/compose/expCompose.html',
                    controller : 'expComposeController as vm'
                }
            },
            permModel : {                    
                parentContext : 'expenses',                
                stateContext : 'add'                
            } 
        }); 
        // Navigation

        msNavigationServiceProvider.saveItem('Expenses', {
            title    : 'Expenses',
            icon     : 'icon-tile-four',
            state    : 'app.expenses.exp', 
            weight   : 8
        });
    }
})();

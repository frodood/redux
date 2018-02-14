////////////////////////////////
// App : Invoice App
// Owner  : Sajith Dushmantha
// Last changed date : 2018/02/12
// Version : 6.1.1.114
// Modified By : Sajith Dushmantha
/////////////////////////////////

(function ()
{
    'use strict';

    angular
        .module('app.invoices', ['12th-config','stripe-payment-tools'])
        .config(config);

    /** @ngInject */
    function config($stateProvider, $translatePartialLoaderProvider, msApiProvider, msNavigationServiceProvider)
    {
		console.log('INVOICE 6.1.1.114');
		
        $stateProvider
            //Parent State
            .state('app.invoices',{
                abstract : true,
                url : '/invoices',
                resolve : {
                    Summary : function($serviceCall)
                    {
                        // return msApi.resolve('invoices.summary@get');
                        /*var client =  $serviceCall.setClient("getInvoiceSummaryByQuery","invoice");
                        client.skip(0);
                        client.take(10);
                        client.orderby('');
                        client.isAscending(true);
                        return client.postResolve({"where": "deleteStatus = 'false' order by createDate DESC"});*/
                    },
                    Recurring : function($serviceCall)
                    {
                        //return msApi.resolve('invoices.recurring@get');
                        /*var rec =  $serviceCall.setClient("getRecInvoiceSummaryByQuery","invoice");
                        rec.skip(0); 
                        rec.take(10);
                        rec.orderby('');
                        rec.isAscending(true);
                        return rec.postResolve({"where": "deleteStatus = 'false' order by createDate DESC"});*/
                    }
                }
            })
            //Secondary State Invoice
            .state('app.invoices.inv',{
                url : '/inv',
                views : {
                    'content@app' : {
                        templateUrl : 'app/main/invoices/views/inv/inv.html',
                        controller : 'invController as vm'
                    }
                }
            })
            //Child State Invoice Detail
            .state('app.invoices.inv.detail',{
                url : '/:itemId',
                params : {
                    'Data' : null,
                    'appName' : null
                }
            })

            //Secondary State Invoice
            .state('app.invoices.inv.detailView',{
                url : '/:itemId',
                views : {
                    'content@app' : {
                        templateUrl : 'app/main/invoices/views/inv/inv.html',
                        controller : 'invController as vm'
                    }
                }
            })

            //Secondary State Recurring
            .state('app.invoices.rec',{
                url : '/rec',
                views : {
                    'content@app' : {
                        templateUrl : 'app/main/invoices/views/rec/rec.html',
                        controller : 'InvorecController as vm'
                    }
                }
            })
            //Chiild State Recurring Detail
            .state('app.invoices.rec.detail',{
                url : '/:itemId'
            })

             //Chiild State Recurring Detail
            .state('app.invoices.rec.detailView',{
                url : '/:itemId',
                views : {
                    'content@app' : {
                        templateUrl : 'app/main/invoices/views/rec/rec.html',
                        controller : 'InvorecController as vm'
                    }
                }
            })

            //Chiild State Create
            .state('app.invoices.compose',{
                url : '/compose',
                params : {
                    'Data' : null,
                    'appName' : null
                },
                views : {
                    'content@app' : {
                        templateUrl : 'app/main/invoices/views/compose/invCompose.html',
                        controller : 'invComposeController as vm'
                    }
                },
                permModel : {                    
                    parentContext : 'invoices',                    
                    stateContext : 'add'                
                }

            })

            .state('app.invoices.copy',{
                url : '/invoice/:itemId',
                views : {
                    'content@app' : {
                        templateUrl : 'app/main/invoices/views/compose/invCompose.html',
                        controller : 'copyInvCtrl as vm'
                    }
                },
                permModel : {                    
                    parentContext : 'invoices',                    
                    stateContext : 'add'                
                }
            })

            .state('app.invoices.edit',{
                url : '/edit/:itemId',
                views : {
                    'content@app' : {
                        templateUrl : 'app/main/invoices/views/compose/invCompose.html',
                        controller : 'editInvCtrl as vm'
                    }
                },
                permModel : {                    
                    parentContext : 'invoices',                    
                    stateContext : 'edit'                
                }
            })

            .state('app.invoices.Recurringcompose',{
                url : '/Reccompose',
                params : {
                    'Data' : null,
                    'appName' : null
                },
                views : {
                    'content@app' : {
                        templateUrl : 'app/main/invoices/views/recCompose/recCompose.html',
                        controller : 'InvoiRecComposeController as vm'
                    }
                },
                permModel : {                    
                    parentContext : 'invoices',                    
                    stateContext : 'add'                
                }
            })

            .state('app.invoices.CopyRecurringcompose',{
                url : '/copyReccompose/:itemId',

                views : {
                    'content@app' : {
                        templateUrl : 'app/main/invoices/views/recCompose/recCompose.html',
                        controller : 'copyRecCtrl as vm'
                    }
                },
                permModel : {                    
                    parentContext : 'invoices',                    
                    stateContext : 'add'                
                }
            })

            .state('app.invoices.editRecurringcompose',{
                url : '/editReccompose/:itemId',
                views : {
                    'content@app' : {
                        templateUrl : 'app/main/invoices/views/recCompose/editParentForm.html',
                        controller : 'editRecinvoCtrl as vm'
                    }
                },
                permModel : {                    
                    parentContext : 'invoices',                    
                    stateContext : 'edit'                
                }
            })

            .state('app.invoices.draftRecurringcompose',{
                url : '/draftReccompose/:itemId',
                views : {
                    'content@app' : {
                        templateUrl : 'app/main/invoices/views/recCompose/recCompose.html',
                        controller : 'draftRecRecCtrl as vm'
                    }
                },
                permModel : {                    
                    parentContext : 'invoices',                    
                    stateContext : 'add'                
                }
            });

        // Api registration
        msApiProvider.register('invoices.summary', ['app/data/invoices/summary.json']);
        msApiProvider.register('invoices.recurring', ['app/data/invoices/recurring.json']);

        // Navigation
        msNavigationServiceProvider.saveItem('Invoices', {
            title      : 'Invoices',
            icon       : 'icon-email',
            state      : 'app.invoices.inv',
            weight     : 5
        });
    }
})();

(function ()
{
    'use strict';

    angular
        .module('app.invoices')
        .factory('$focus',$focus);

    /** @ngInject */
    function $focus($timeout, $window)
    {
         return function(id) {
            $timeout(function() {
                var element = $window.document.getElementById(id);
                if (element)
                    element.focus();
            });
        };
    }
})();


////////////////////////////////
// App : Payments App
// Owner  : Sajith Dushmantha
// Last changed date : 2017/10/19
// Version : 6.1.0.88
// Modified By : Eshwaran Veerabahu
/////////////////////////////////

(function ()
{
    'use strict';

    angular
        .module('app.payments', [])
        .config(config);

    /** @ngInject */
    function config($stateProvider, $translatePartialLoaderProvider, msApiProvider, msNavigationServiceProvider)
    { 

        console.log('Payment app 6.1.0.88');
		
        $stateProvider
            //Parent State
            .state('app.payments',{
                abstract : true,
                url : '/payments',
                resolve : {             
                    settingSummary : function($serviceCall){
                        var client =  $serviceCall.setClient("getAllByQuery","setting");    
                        return client.postResolve({
                            "preference":"paymentPref",
                            "setting":"profile,payments,templates",
                        });
                    }
                }
            })
            //Secondary State payments
            .state('app.payments.pay',{
                url : '/pay',
                views : {
                    'content@app' : {
                        templateUrl : 'app/main/payments/views/pay/pay.html',
                        controller : 'payController as vm'
                    },
                },
                resolve : {
                    paymentSummary : function($serviceCall){
                        var client =  $serviceCall.setClient("getPaymentSummaryByQuery","payment");                        
                        client.skip(0);
                        client.take(10); 
                        client.orderby('');
                        client.isAscending(true);
                        return client.postResolve({
                            "where": "paymentStatus <> 'delete' order by 'paymentID', lastTranDate DESC"
                        });
                    }
                }
            })

            //Child State payment Detail
            .state('app.payments.pay.detail',{
                url : '/:itemID',
                params : {
                    'Data' : null,
                    'appName' : null,
                    'email' : false
                },
            })
            //Child State payment Online(checkout state to get the token)
            .state('app.payments.pay.online',{
                url : '/token/:itemID'
            })

            //Chiild State Create
            .state('app.payments.compose',{
                url : '/paycompose',
                params : {
                    'Data' : null,
                    'appName' : null
                },
                views : {
                    'content@app' : {
                        templateUrl : 'app/main/payments/views/compose/payCompose.html',
                        controller : 'payComposeController as vm'
                    }
                },
                permModel : {
                    parentContext : 'Payments',
                    stateContext : 'add'
                }
            });
 

        // Navigation
        msNavigationServiceProvider.saveItem('Payments', {
            title      : 'Payments',
            icon       : 'icon-email',
            state      : 'app.payments.pay',
            weight     : 6
        });
    }
})();

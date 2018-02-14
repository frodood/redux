////////////////////////////////
// App : Credit note App
// Owner  : Sachila
// Last changed date : 2017/10/07
// Version :creditnote 6.1.0.88
// Modified By : Divani Iranga
/////////////////////////////////

(function ()
{
    'use strict';
    angular
    .module('app.creditnotes', [])
    .config(config);

    /** @ngInject */
    function config($stateProvider, msNavigationServiceProvider)
    {
        // State

        console.log('creditnote app 6.1.0.88');
        
        $stateProvider
        .state('app.creditnotes', {
            abstract : true,
            url    : '/creditnotes',
            resolve : { 
                settingData : function($serviceCall){
                    var settings = $serviceCall.setClient("getAllByQuery","setting");
                    return settings.postResolve({"setting":"profile,taxes,payments","preference":"creditNotePref,paymentPref,productPref,invoicePref"})
                }
            }
        })
        //Secondary State creditnotes
        .state('app.creditnotes.cre',{
            url : '/cre',
            views : {
                'content@app' : {
                    templateUrl : 'app/main/creditnotes/views/cre/creditnotes.html',
                    controller : 'creController as vm'
                }
            },
            resolve: {
                Summary : function($serviceCall)
                { 
                    var client =  $serviceCall.setClient("getCreditNoteSummaryByQuery","creditNote");
                    client.skip(0); 
                    client.take(10);
                    client.orderby('');
                    client.isAscending(true);
                    return client.postResolve({"where": "deleteStatus = 'false' order by date DESC"});
                }
            }
        })
        //Child State creditnotes Detail
        .state('app.creditnotes.cre.detail',{
            url : '/:itemId',
            params : {
                'Data' : null,
                'appName' : null
            }
        })

        //Secondary State creditnotes
        .state('app.creditnotes.cre.detailView',{
            url : '/:itemId',
            views : {
                'content@app' : {
                    templateUrl : 'app/main/creditnotes/views/cre/creditnotes.html',
                    controller : 'creController as vm'
                }
            }
        })

        //Chiild State Create
        .state('app.creditnotes.compose',{
            url : '/compose',
            views : {
                'content@app' : {
                    templateUrl : 'app/main/creditnotes/views/compose/creCompose.html',
                    controller : 'creComposeController as vm'
                }
            },
            params: {
                appName : null,
                Data : null
            },
            permModel : {
                parentContext : 'CreditNotes',
                stateContext : 'add'
            }
        });


        // Navigation

        msNavigationServiceProvider.saveItem('Creditnotes', {
            title    : 'Credit Notes',
            icon     : 'icon-tile-four',
            state    : 'app.creditnotes.cre', 
            weight   : 7
        });
    }
})();

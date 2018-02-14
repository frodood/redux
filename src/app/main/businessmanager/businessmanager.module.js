////////////////////////////////
// App : Business Manager App
// Owner  : Eshwaran Veerabahu
// Last changed date : 2017/01/04
// Version : 6.1.0.1
// Modified By : Eshwaran Veerabahu
/////////////////////////////////

(function ()
{
    'use strict';

    angular
        .module('app.businessmanager', [])
        .config(config);

    /** @ngInject */
    function config($stateProvider)
    {

        console.log("Business Manager App 6.1.0.1");

        // State
        $stateProvider
            .state('app.businessmanager', {
                url    : '/businessmanager',
                views  : {
                    'content@app': {
                        templateUrl: 'app/main/businessmanager/businessmanager.html',
                        controller : 'BusinessManagerController as vm'
                    }
                },
                permModel : {                    
                    parentContext : 'BusinessManager',                    
                    stateContext : 'view'                
                }
            })
            .state('app.businessmanager.main',{
                views  : {
                    'businessmanagerView': {
                        templateUrl: 'app/main/businessmanager/views/main/main.html'
                    }
                }  
            })
            .state('app.businessmanager.addcompany',{
                views  : {
                    'businessmanagerView': {
                        templateUrl: 'app/main/businessmanager/views/addcompany/addcompany.html'
                    }
                }   
            })
            .state('app.businessmanager.joincompany',{
                views  : {
                    'businessmanagerView': {
                        templateUrl: 'app/main/businessmanager/views/joincompany/joincompany.html'
                    }
                }   
            });
            
    }
})();
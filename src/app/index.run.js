(function ()
{
    'use strict';

    angular
        .module('12thDoor')
        .run(runBlock);

    /** @ngInject */
    function runBlock($rootScope, $timeout, $state, $auth, $v6urls, instanceContextService, tenantContextService, profileSettingsContextService, recurlySubService, $interval){

        var frameworkSessionCheck = function () {
            if ($auth.checkSession()) {
                $rootScope.cc_sessionInfo = $auth.getSession();
            } else {
                console.log('framework isnotLoggedIn');
            }
        };

        frameworkSessionCheck();

        var getProfileSettingsInfo = function(){
            console.log('profile settings info !');
            profileSettingsContextService.setProfileSettingsData()
                .then(function(response){
                    if(response ==  true){
                        $rootScope.$emit('instanceCheck');
                    }
                });
        };

        getProfileSettingsInfo();

        recurlySubService.subGetAccountDetail();

        $rootScope.instanceProfileDetails;

        $rootScope.companyColection;

        $rootScope.defaultCompany;

        $rootScope.instanceCurrentPlanDetails;

        $rootScope.permissionMatrix;

        $rootScope.permissionRole;

        $rootScope.state = $state;

        $rootScope.isContextSpA = false;

        $rootScope.isPaidPlan = false;

        // $rootScope.isAccPaid = true;

        // set permission matrix

        var setPermissionMatrix = function(){

            console.log(prmMatrix);

            if(!$rootScope.permissionMatrix){

                $rootScope.permissionMatrix = prmMatrix.appPermission;

                $rootScope.permissionRole = prmMatrix.roleName;

                if(prmMatrix.roleName === "Super admin"){
                    $rootScope.isContextSpA = true; 
                }
            }
        };

        setPermissionMatrix();

        // Activate loading indicator
        var stateChangeStartEvent = $rootScope.$on('$stateChangeStart', function (event, next, current){
            $rootScope.loadingProgress = true;

            var micrPermaMatrix = $rootScope.permissionMatrix;

            if(next.permModel){

                var lclParaContext = captxt(next.permModel.parentContext);
                var lclParaStateContext = next.permModel.stateContext;
                var insPermObj = {};

                for(var i = 0; i < micrPermaMatrix.length; i++){
                    if(micrPermaMatrix[i].appName === lclParaContext){
                        insPermObj = micrPermaMatrix[i];

                        if(insPermObj.hasOwnProperty(lclParaStateContext) && !insPermObj[lclParaStateContext]){
                            event.preventDefault();
                            $rootScope.loadingProgress = false;
                            $state.go("app.unauthorized");
                        };
                    }else{
                        // event.preventDefault();
                        // $rootScope.loadingProgress = false;
                        // $state.go("app.unauthorized");
                    };
                };
            };

            function captxt(s){
                return s && s[0].toUpperCase() + s.slice(1);
            };      

        });

        // De-activate loading indicator
        var stateChangeSuccessEvent = $rootScope.$on('$stateChangeSuccess', function (){
            $timeout(function ()
            {
                $rootScope.loadingProgress = false;
            });
        }); 

        // uiMicrokernal Session check

        var setInstanceProfileDetailsGlobal = function(){
            instanceContextService.getProfileDetails($rootScope.cc_sessionInfo.Email)
                .then(function(response){
                    console.log(response);
                    $rootScope.instanceProfileDetails = response.data;
                    $rootScope.instanceProfileDetails.ProfilePicture = window.location.protocol+"//"+$rootScope.cc_sessionInfo.Domain+"/apis/media/tenant/image/profilePictures/"+$rootScope.cc_sessionInfo.Username+".png";
                    console.log($rootScope.instanceProfileDetails.ProfilePicture);
                });
        }

        setInstanceProfileDetailsGlobal();

        var getAllCurrencyList = function(){
            instanceContextService.getCurrencyList()
                .then(function(result){
                    $rootScope.glblCurrencyList = result.data;
                });
        }

        getAllCurrencyList();

        var getAllCountryList = function(){
            instanceContextService.getCountryList()
                .then(function(result){
                    $rootScope.glblCountryList = result.data;
                });
        }

        getAllCountryList();

        $rootScope.getCompanyCollection = function(){

            /*------------------------ intentional block --------------------------*/
            tenantContextService.getAllTenants($v6urls.auth, $rootScope.cc_sessionInfo.SecurityToken)
                .then(function(response){
                    $rootScope.companyColection = response.data;

                    tenantContextService.getDefaultTenant($v6urls.auth, $rootScope.cc_sessionInfo.UserID)
                        .then(function(response){
                            $rootScope.defaultCompany = response.data.TenantID;
                            console.log($rootScope.defaultCompany);

                            var key;

                            for(key in $rootScope.companyColection){
                                if($rootScope.companyColection.hasOwnProperty(key)){
                                    if($rootScope.defaultCompany === $rootScope.companyColection[key].TenantID){
                                        $rootScope.companyColection[key].default = true;
                                    }else{
                                        $rootScope.companyColection[key].default = false;
                                    }
                                }
                            }
                        });

                    console.log($rootScope.companyColection);
                });
            /*------------------------ intentional block --------------------------*/

        };

        $rootScope.getCompanyCollection();

        // Cleanup
        $rootScope.$on('$destroy', function (){
            stateChangeStartEvent();
            stateChangeSuccessEvent();
        });
    }

})();
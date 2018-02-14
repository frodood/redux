(function ()
{
    'use strict';

    angular
        .module('app.toolbar')
        .controller('ToolbarController', ToolbarController);

    /** @ngInject */
    function ToolbarController($rootScope, $window, $q, $state, $timeout, $mdDialog, $mdSidenav, $translate, $mdToast, msNavigationService)
    {
        var vm = this;

        // Data
        $rootScope.global = {
            search: ''
        };

        vm.bodyEl = angular.element('body');

        // Methods
        vm.toggleSidenav = toggleSidenav;
        vm.toggleHorizontalMobileMenu = toggleHorizontalMobileMenu;
        vm.toggleMsNavigationFolded = toggleMsNavigationFolded;
        vm.search = search;
        vm.searchResultClick = searchResultClick;
        vm.navigateDashboard = navigateDashboard; 
        vm.navigateUpgradePlan = navigateUpgradePlan;
        vm.navigateSettings = navigateSettings;
        vm.redirectHelp = redirectHelp;
        vm.userWidgetContextToggle = true;
        vm.switchUserWidgetContext = switchUserWidgetContext;
        vm.navigateProfile = navigateProfile;
        vm.navigateBusinessManager = navigateBusinessManager;
        vm.appLogout = appLogout;
        vm.recivedTennantCollection = $rootScope.companyColection;

        console.log(vm.recivedTennantCollection);

        //////////

        init();

        /**
         * Initialize
         */
        function init()
        {

            // Set user profile picture
            vm.profilePicture = window.location.protocol+"//" + window.location.hostname + "/apis/media/profilepic/get/" + $rootScope.cc_sessionInfo.Email;
            
        }

        /**
         *Navigate to plan upgrade module
         *
        */
        function navigateUpgradePlan(){
            $state.go('app.planupgrade.main');
        }

        /**
         *Navigate to dashboard module
         *
        */

        function navigateDashboard(){
            $state.go('app.dashboard');
        }


        /**
         * Navigate to Settings
         *
        */
        function navigateSettings()
        {
            $state.go('app.settings.main.profile');
        }

        /**
         * Redirect to Zendesk help page
         *
        */
        function redirectHelp()
        {
            $window.open('https://12thdoor.zendesk.com/hc/en-us', '_blank');
        }

        /**
         * Switch user widget context
         *
        */
        function switchUserWidgetContext()
        {
            vm.userWidgetContextToggle = !vm.userWidgetContextToggle; 
        }

        /**
         * Navigate to profile
         *
        */

        function navigateProfile()
        {
            $state.go('app.profile');
        }

        /**
         * Navigate to business manager
         *
        */

        function navigateBusinessManager()
        {
            $state.go('app.businessmanager.main');
        }

        /**
         * Logout Function
         */

        var stripWildcard = function(rawDomain){
            rawDomain = rawDomain.substring(rawDomain.indexOf('.') + 1);
            console.log(rawDomain);
            return rawDomain;
        };

        // var defaultDomain = "app."+stripWildcard(window.location.host);
        // var defaultDomain = "qa."+stripWildcard(window.location.host);
        // var defaultDomain = stripWildcard(window.location.host);
        var defaultDomain = window.location.protocol+'//'+window.location.host;
        

        function appLogout(ev)
        {
            var confirm = $mdDialog.confirm()
                .title('Quit Application')
                .content('Are you sure you want to quit the application, all unsaved data will be lost.')
                .ok('Yes')
                .cancel('No')
                .targetEvent(ev);

            $mdDialog.show(confirm).then(function () {
                location.replace('/logout.php'); //logout location change
            }, function () {

            });
        }

        /**
         * Toggle sidenav
         *
         * @param sidenavId
         */
        function toggleSidenav(sidenavId)
        {
            $mdSidenav(sidenavId).toggle();
        }


        /**
         * Toggle horizontal mobile menu
         */
        function toggleHorizontalMobileMenu()
        {
            vm.bodyEl.toggleClass('ms-navigation-horizontal-mobile-menu-active');
        }

        /**
         * Toggle msNavigation folded
         */
        function toggleMsNavigationFolded()
        {
            msNavigationService.toggleFolded();
        }

        /**
         * Search action
         *
         * @param query
         * @returns {Promise}
         */
        function search(query)
        {
            var navigation = [],
                flatNavigation = msNavigationService.getFlatNavigation(),
                deferred = $q.defer();

            // Iterate through the navigation array and
            // make sure it doesn't have any groups or
            // none ui-sref items
            for ( var x = 0; x < flatNavigation.length; x++ )
            {
                if ( flatNavigation[x].uisref )
                {
                    navigation.push(flatNavigation[x]);
                }
            }

            // If there is a query, filter the navigation;
            // otherwise we will return the entire navigation
            // list. Not exactly a good thing to do but it's
            // for demo purposes.
            if ( query )
            {
                navigation = navigation.filter(function (item)
                {
                    if ( angular.lowercase(item.title).search(angular.lowercase(query)) > -1 )
                    {
                        return true;
                    }
                });
            }

            // Fake service delay
            $timeout(function ()
            {
                deferred.resolve(navigation);
            }, 1000);

            return deferred.promise;
        }

        /**
         * Search result click action
         *
         * @param item
         */
        function searchResultClick(item)
        {
            // If item has a link
            if ( item.uisref )
            {
                // If there are state params,
                // use them...
                if ( item.stateParams )
                {
                    $state.go(item.state, item.stateParams);
                }
                else
                {
                    $state.go(item.state);
                }
            }
        }
    }

})();

(function ()
{
    'use strict';

    angular
        .module('12thDoor')
        .controller('IndexController', IndexController)
        .controller('strtPanelCtrl', strtPanelCtrl);

    /** @ngInject */
    function IndexController($rootScope, $cookies,mesTheming, $mdPanel, profileSettingsContextService)
    {
        var vm = this;

        // Data
        vm.themes = mesTheming.themes;

        // var isFirstInstanceSet = $cookies.get('isFirstInstance');

        var strtPanelref;

        var checkFirstInstance = $rootScope.$on('instanceCheck', function(){

            var settingsSummary = profileSettingsContextService.getGlblProfileSettingsData();

            var isFirstInstance = settingsSummary.isNewTenant;

            if(isFirstInstance === true && $rootScope.isContextSpA === true){
                runStarterPanel();
            }
        });

        function runStarterPanel(){

            var strtPanelPos = $mdPanel.newPanelPosition()
                .absolute()
                .center();

            var strtPenelConf = {
                attachTo: angular.element(document.body),
                controller: strtPanelCtrl,
                controllerAs: 'vm',
                disableParentScroll: $mdPanel.disableParentScroll,
                templateUrl: 'app/core/layouts/starter-panel-layout.html',
                hasBackdrop: true,
                panelClass: 'strt-panel',
                trapFocus: true,
                zIndex: 150,
                clickOutsideToClose: false,
                escapeToClose: false,
                focusOnOpen: true
            }

            $mdPanel.open(strtPenelConf);
        };
    };

    /** @ngInject */
    function strtPanelCtrl($window, $scope, mdPanelRef, $state, $timeout){
        
        var vm = this;

        vm.currentCompScreen = 'welcomeContainer'; //welcomeContainer, configureContainer, successContainer
        vm.processWelcomeView = "welcome"; //welcome, configure, success
        vm.sliderPosition = "start";

        vm.switchToConfigureWizard = function(){
            vm.sliderPosition = "middle";
        };

        vm.switchToSuccessContainer = function(){
            vm.sliderPosition = "end";
        };

        $scope.$on('onBoardingSuccess', function(ev, args) {
            if(args === true){
                vm.switchToSuccessContainer();
                console.log(args);
            };
        });

        vm.startjourney = startjourney;

        vm.skipjourney = skipjourney;

        vm.switchJourneySelection = switchJourneySelection;
        
        vm.locateToProfileDetails = locateToProfileDetails;

        vm.locateToInvoiceCompose = locateToInvoiceCompose;

        vm.locateToDashboard = locateToDashboard;
        
        vm.playInvoiceCreationVid = playInvoiceCreationVid;
        
        function animateBtnComp(){
            vm.isBtnVis = true;
        };

        function animateComponentsIn(){
            vm.isBnrImgVis = true;
        };

        $timeout(animateComponentsIn, 1000);

        $timeout(animateBtnComp, 1700);

        function startjourney(){
            vm.currentCompScreen = 'journeyScreen';
            vm.isWelcomeScreen = !vm.isWelcomeScreen;
            // mdPanelRef && mdPanelRef.close();
            // $state.go('app.dashboard');
        };

        function skipjourney(){
            mdPanelRef && mdPanelRef.close();
            $state.go('app.dashboard');
        };

        function switchJourneySelection(slctdJourney){
            vm.jurNavSelection = slctdJourney;
        };

        function locateToProfileDetails(){
            mdPanelRef && mdPanelRef.close();
            $state.go('app.settings.main.profile');
        };

        function locateToInvoiceCompose(){
            mdPanelRef && mdPanelRef.close();
            $state.go('app.invoices.compose');
        };

        function locateToDashboard(){
            mdPanelRef && mdPanelRef.close();
            $state.go('app.dashboard');
        };

        function playInvoiceCreationVid(){
            // mdPanelRef && mdPanelRef.close();
            $window.open('https://www.youtube.com/watch?v=IaI4R3TToyY', '_blank');
        };
    }; 
    
})();
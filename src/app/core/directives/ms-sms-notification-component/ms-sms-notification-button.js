(function()
{

'use strict';

angular
    .module('app.core')
    .directive('msSmsNotificationButton', msSmsNotificationButtonDirective);

/** @ngInject */
function msSmsNotificationButtonDirective()
{
    var smsNotifiDirective = {
        restrict        : 'E',
        template        : [
            '<md-button class="md-icon-button" aria-label="Mobile View" ng-click="vm.msSmsNotificatioDirective()">',
            '<md-icon md-font-icon="icon-cellphone-android"></md-icon>',
            '<md-tooltip><span>SMS Notification</span></md-tooltip>',
            '</md-button>'		
        ].join(''),
        scope: {},
        controller      : MsSmsNotifiDirectiveController,
        controllerAs	: 'vm'
    };

    return smsNotifiDirective;
}

/** @ngInject */
function MsSmsNotifiDirectiveController($mdDialog){
    var vm = this;
    vm.msSmsNotificatioDirective = msSmsNotificatioDirective;

    function msSmsNotificatioDirective(){
        $mdDialog.show(
            $mdDialog.alert()
            .parent(angular.element(document.body))
            .title('SMS Notification')
            .content('SMS notification feature will be available soon!')
            .ariaLabel('Alert Dialog Demo')
            .ok('OK')
            .targetEvent()
        );
    };
}

})();
        

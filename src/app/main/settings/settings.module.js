//Setting App version: 6.1.0.135
//Author:Divani

(function() {
    'use strict';

    angular
        .module('app.settings', ['naif.base64'])
        .config(config);

    /** @ngInject */
    function config($stateProvider) {

        console.log('%c Setting App version 6.1.0.135', 'font-size: 25px;');
 
        $stateProvider
            //Parent State
            .state('app.settings', {
                abstract: true,
                url: '/settings',
                resolve: {}
            })
            .state('app.settings.main', {
                url: '/main',
                views: {
                    'content@app': {
                        templateUrl: 'app/main/settings/views/primaryview/primary.html',
                        controller: 'settingsController as vm'
                    }
                }

            })
            .state('app.settings.main.profile', {
                url: '/profile',
                views: {
                    'settingsView': {
                        templateUrl: 'app/main/settings/views/profileview/profile.html',
                        controller: 'profileViewController as vm'
                    }
                }
            })
            .state('app.settings.main.users', {
                url: '/users',
                views: {
                    'settingsView': {
                        templateUrl: 'app/main/settings/views/usersview/users.html',
                        controller: 'usersViewController as vm'
                    }
                }
            })
            .state('app.settings.main.taxes', {
                url: '/taxes',
                views: {
                    'settingsView': {
                        templateUrl: 'app/main/settings/views/taxesview/taxes.html',
                        controller: 'taxesViewController as vm'
                    }
                }
            })

            .state('app.settings.main.payments', {
                url: '/payments',
                views: {
                    'settingsView': {
                        templateUrl: 'app/main/settings/views/paymentview/payment.html',
                        controller: 'paymentsViewController as vm'
                    }
                }
            })

            .state('app.settings.main.accounts', {
                url: '/accounts',
                views: {
                    'settingsView': {
                        templateUrl: 'app/main/settings/views/accountview/account.html',
                        controller: 'accountsViewController as vm'
                    }
                }
            })

            .state('app.settings.main.templates', {
                url: '/templates',
                views: {
                    'settingsView': {
                        templateUrl: 'app/main/settings/views/templateview/template.html',
                        controller: 'templatesViewController as vm'
                    }
                }
            })

            //            .state('app.settings.main.preferences',{
            //              url: '/preferences',
            //              views : {
            //                'settingsView' : {
            //                  templateUrl : 'app/main/settings/views/preferenceview/preference.html',
            //                  controller : 'settingsController as vm'
            //                }
            //              } 
            //            })

            .state('app.settings.main.invoice', {
                url: '/invoice',
                views: {
                    'settingsView': {
                        templateUrl: 'app/main/settings/views/preferenceview/invoices.html',
                        controller: 'invoicePreferenceCtrl as vm'
                    }
                }
            })

            .state('app.settings.main.estimate', {
                url: '/estimate',
                views: {
                    'settingsView': {
                        templateUrl: 'app/main/settings/views/preferenceview/estimate.html',
                        controller: 'estimatePreferenceCtrl as vm'
                    }
                }
            })

            .state('app.settings.main.creditNote', {
                url: '/creditNote',
                views: {
                    'settingsView': {
                        templateUrl: 'app/main/settings/views/preferenceview/creditNote.html',
                        controller: 'creditNotePreferenceCtrl as vm'
                    }
                }
            })

            .state('app.settings.main.expense', {
                url: '/expense',
                views: {
                    'settingsView': {
                        templateUrl: 'app/main/settings/views/preferenceview/expense.html',
                        controller: 'expensePreferenceCtrl as vm'
                    }
                }
            })

            .state('app.settings.main.payment', {
                url: '/payment',
                views: {
                    'settingsView': {
                        templateUrl: 'app/main/settings/views/preferenceview/payment.html',
                        controller: 'paymentPreferenceCtrl as vm'
                    }
                }
            })

            .state('app.settings.main.contact', {
                url: '/contact',
                views: {
                    'settingsView': {
                        templateUrl: 'app/main/settings/views/preferenceview/contact.html',
                        controller: 'contactPreferenceCtrl as vm'
                    }
                }
            })

            .state('app.settings.main.product', {
                url: '/product',
                views: {
                    'settingsView': {
                        templateUrl: 'app/main/settings/views/preferenceview/product.html',
                        controller: 'productPreferenceCtrl as vm'
                    }
                }
            })

            .state('app.settings.main.project', {
                url: '/project',
                views: {
                    'settingsView': {
                        templateUrl: 'app/main/settings/views/preferenceview/project.html',
                        controller: 'projectPreferenceCtrl as vm'
                    }
                }
            })

            .state('app.settings.main.inventory', {
                url: '/inventory',
                views: {
                    'settingsView': {
                        templateUrl: 'app/main/settings/views/preferenceview/inventory.html',
                        controller: 'inventoryPreferenceCtrl as vm'
                    }
                }
            })

            .state('app.settings.main.emailTemplates', {
                url: '/emailTemplates',
                views: {
                    'settingsView': {
                        templateUrl: 'app/main/settings/views/emailTemplatesview/emailTemplate.html',
                        controller: 'emailTemplatesViewController as vm'
                    }
                }
            });

        // Navigation
        // Navigation to acces this module can be found the shell toolbar markup.
    }

})();

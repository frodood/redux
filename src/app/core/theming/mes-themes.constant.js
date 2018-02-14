(function ()
{
    'use strict';

    var mesThemes = {
        default  : {
            primary   : {
                name: '12thDoor-Primary',
                hues: {
                    'default': '500',
                    'hue-1'  : '700',
                    'hue-2'  : '600',
                    'hue-3'  : '800'
                }
            },
            accent    : {
                name: '12thDoor-Accent',
                hues: {
                    'default': '600',
                    'hue-1'  : '400',
                    'hue-2'  : '700',
                    'hue-3'  : 'A100'
                }
            },
            warn      : {
                name: '12thDoor-Warn',
                hues: {
                    'default': '600',
                    'hue-1'  : '400',
                    'hue-2'  : '700',
                    'hue-3'  : 'A100'
                }
            },
            background: {
                name: 'grey',
                hues: {
                    'default': 'A100',
                    'hue-1'  : 'A100',
                    'hue-2'  : '100',
                    'hue-3'  : '300'
                }
            }
        }
    };

    angular
        .module('app.core')
        .constant('mesThemes', mesThemes);
})();
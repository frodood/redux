(function () {
    'use strict';

    var mesPalettes = [
        {
            name: '12thDoor-Primary',
            options: {
                '50': '#d9e6f3',
                '100': '#9ec0e2',
                '200': '#73a4d5',
                '300': '#3c81c4',
                '400': '#3471ae',
                '500': '#2d6296',
                '600': '#26537e',
                '700': '#1f4367',
                '800': '#18344f',
                '900': '#112438',
                'A100': '#d9e6f3',
                'A200': '#9ec0e2',
                'A400': '#3471ae',
                'A700': '#1f4367',
                'contrastDefaultColor': 'light',
                'contrastDarkColors': '50 100 200 A100 A200'
            }
        },
        {
            name: '12thDoor-Secondary',
            options: {
                '50': '#ffffff',
                '100': '#ffffff',
                '200': '#e3f0ff',
                '300': '#9bccff',
                '400': '#7dbcff',
                '500': '#5eacff',
                '600': '#3f9cff',
                '700': '#218cff',
                '800': '#027dff',
                '900': '#006ee3',
                'A100': '#ffffff',
                'A200': '#ffffff',
                'A400': '#7dbcff',
                'A700': '#218cff',
                'contrastDefaultColor': 'light',
                'contrastDarkColors': '50 100 200 300 400 A100 A200 A400' 
            }
        },
        {
            name: '12thDoor-Backface',
            options: {
                '50': '#8bafd5',
                '100': '#5388c1',
                '200': '#3a6da2',
                '300': '#27496d',
                '400': '#1f3a56',
                '500': '#172b40',
                '600': '#0f1c29',
                '700': '#070d13',
                '800': '#000000',
                '900': '#000000',
                'A100': '#8bafd5',
                'A200': '#5388c1',
                'A400': '#1f3a56',
                'A700': '#070d13',
                'contrastDefaultColor': 'light',
                'contrastDarkColors': '50 A100'
            }
        },
        {
            name: '12thDoor-Accent',
            options: {
                '50': '#ffffff',
                '100': '#d1fcf4',
                '200': '#9df8e7',
                '300': '#5af3d7',
                '400': '#3ef1d0',
                '500': '#21efc9',
                '600': '#10e1bb',
                '700': '#0ec5a3',
                '800': '#0ca88b',
                '900': '#0a8c74',
                'A100': '#ffffff',
                'A200': '#d1fcf4',
                'A400': '#3ef1d0',
                'A700': '#0ec5a3',
                'contrastDefaultColor': 'light',
                'contrastDarkColors': '50 100 200 300 400 500 600 700 A100 A200 A400 A700'
            }
        },
        {
            name: '12thDoor-Warn',
            options: {
                '50': '#ffffff',
                '100': '#feeae9',
                '200': '#fbb9b4',
                '300': '#f77970',
                '400': '#f65e53',
                '500': '#f44336',
                '600': '#f22819',
                '700': '#e11b0c',
                '800': '#c3170b',
                '900': '#a61409',
                'A100': '#ffffff',
                'A200': '#feeae9',
                'A400': '#f65e53',
                'A700': '#e11b0c',
                'contrastDefaultColor': 'light',
                'contrastDarkColors': '50 100 200 300 400 A100 A200 A400'
            }
        }
    ];

    angular
        .module('app.core')
        .constant('mesPalettes', mesPalettes);
})();
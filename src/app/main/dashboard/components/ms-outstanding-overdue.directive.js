(function ()
{
    'use strict';

    angular
        .module('app.dashboard')
        .directive('msOutstandingOverdue', msOutstandingOverdue);

    /** @ngInject */
    function msOutstandingOverdue()
    {   
        function outoverdueLink(scope, element, attrs){

            var scaleElem1 = angular.element(element.find('.sectionCoverage')[0]);
            var scaleElem2 = angular.element(element.find('.sectionCoverage')[1]);

            scope.esDefiner = false;

            attrs.$observe('outoverduedata', function(budledData){
                
                var bundObj = JSON.parse(budledData),
                        curVal = parseInt(bundObj.current),
                            ovrVal = parseInt(bundObj.overdue),
                                budleVal = (curVal + ovrVal) / 100;

                scope.current = bundObj.current;
                scope.overdue = bundObj.overdue;

                console.log(scope.current, scope.overdue);

                if(curVal > 0 || ovrVal > 0){
                    scope.esDefiner = true;
                }else{
                    scope.esDefiner = false;
                }

                function calcPercentage(speciVal, totlVal){
                    var sam = Math.round(speciVal / totlVal);
                    console.log(sam);
                    return sam;
                }

                if(curVal || ovrVal !== 0){
                    if(curVal !== 0){
                        var curValPerc = calcPercentage(curVal, budleVal);
                        $(scaleElem1).width(''+curValPerc+'%');
                    }else{
                        $(scaleElem1).width(20);
                    }

                    if(ovrVal !== 0){
                        var ovrValPerc = calcPercentage(ovrVal, budleVal);
                        $(scaleElem2).width(''+ovrValPerc+'%');
                    }else{
                        $(scaleElem2).width(20);
                    }

                }else{
                     $(scaleElem1).width(20);   
                     $(scaleElem2).width(20);
                }

            });

            attrs.$observe('overduebreakdowndata', function(ageAnalysisData){

                var ageAnalysisBundleData = JSON.parse(ageAnalysisData);

                var ageData = ageAnalysisBundleData[0];

                scope.ageLitData = [];

                angular.forEach(ageData, function(value, key){
                    scope.ageLitData.push({
                        periodIndicator:key,
                        periodValue:value,
                        periodColocIndex:parseInt(key)
                    });
                });

                console.log(scope.ageLitData);

                scope.overdueBreakdown = ageData;

            });

            
            $(scaleElem2).mouseover(function(event){
                // console.log(event);
            });
        };

        var outstandingoverdueDirective = {
            restrict   : 'EA',
            scope: {
                outoverduedata : '@',
                overduebreakdowndata : '@'
            },
            transclude : true,
            templateUrl: 'app/main/dashboard/components/ms-outstanding-overdue.html',
            link: outoverdueLink
        };

        return outstandingoverdueDirective;
    }

})();
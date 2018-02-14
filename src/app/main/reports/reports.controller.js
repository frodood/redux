(function() {
    'use strict';

    angular
        .module('app.reports')
        .controller('ReportController', ReportController)
        .controller('ReportControllerChild', ReportControllerChild)
        .filter('slice', sliceArr)
        .factory('$myElementInkRipple', myElementInkRipple)

    function myElementInkRipple($mdInkRipple) {
        return {
            attach: function(scope, element, options) {
                return $mdInkRipple.attach(scope, element, angular.extend({
                    center: false,
                    dimBackground: true
                }, options));
            }
        };
    }

    /** @ngInject */
    function ReportController($rootScope, $scope, $mdDialog, $state, $http, $sce, $serviceCall, $myElementInkRipple) {
        var vm = this;


        var client = $serviceCall.setClient("getAll", "stimulsoftreporting");
        client.ifSuccess(function(response) {
            vm.reportArr = response;
            console.log(vm.reportArr);
        });
        client.ifError(function(data) {
            $mdDialog.show($mdDialog.alert().parent(angular.element(document.body)).content('Error occured while loading the reports. Please try again later').ariaLabel('').ok('OK').targetEvent(data));
        })
        client.skip(0);
        client.take(20);
        client.orderby('');
        client.isAscending(false);
        client.getReq();
        vm.getSize = getSize;
        vm.goToDetail = goToDetail;
        vm.setBottom = setBottom;

        function goToDetail(obj, ev) {
            debugger;
            if (obj.active === true) {

                var dataExists = false;

                var client = $serviceCall.setClient("checkIfDataExistsForAReport", "process");
                client.ifSuccess(function(data) {
                    debugger;
                    console.log(data);

                    dataExists = data;
                    console.log(dataExists);

                    debugger;
                    if (!dataExists) {
                        $mdDialog.show(
                            $mdDialog.alert()
                            .parent(angular.element(document.body))
                            .title('No Data')
                            .content('No data available for this report')
                            .ariaLabel('No Data')
                            .ok('OK')
                            .targetEvent()
                        );
                    } else {
                        $myElementInkRipple.attach($scope, angular.element(ev.target), {
                            center: true
                        });
                        $state.go('app.reports.detail', {
                            'name': obj.name,
                            'title': obj.title
                        });
                    }

                });
                client.ifError(function(data) {

                });
                client.key(obj.name); // send projectID as url parameters
                client.getReq();
            }
        }


        function getSize() {
            var arr = [];
            if (!vm.reportArr || vm.reportArr.length === 0) return false;
            var maxNum = Math.ceil(vm.reportArr.length / 4);
            for (var i = 1; i <= maxNum; i++) {
                arr.push(i)
            }
            return arr;
        }

        function setBottom(index) {
            if ((getSize().length - 1) === index) {
                return {
                    'padding-bottom': '32px'
                }
            }
        }
    }

    function ReportControllerChild($rootScope, $scope, $mdDialog, $state, $http, $sce) {
        var vm = this;
        vm.closeThread = closeThread;
        vm.reportName = $state.params.title;
        vm.saveReportPdf = saveReportPdf;

        // var report = new Stimulsoft.Report.StiReport(); 

        // var yourConnectionString = "Server=104.154.58.24;Database=_awankadeveloper12thdoorcom;UserId=root;Pwd=DuoS123";

        // // report.dictionary.databases.getByName("Connection").connectionString = yourConnectionString;
        // // report.Load("/services/stimulsoft/reports/productsSummary.mrt");
        // report.dictionary.databases.clear();
        // console.log(Stimulsoft.Report.Dictionary)
        // report.dictionary.databases.add(new Stimulsoft.Report.Dictionary.StiSqlDatabase("Connection","Connection",yourConnectionString));

        // report.loadFile("/services/stimulsoft/reports/productsSummary.mrt");
        // report.render();




        vm.reportSrc = '/services/stimulsoft/viewer.php?name=' + $state.params.name; // developer domain

        if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
            vm.reportSrc = 'localhost:8080/services/stimulsoft/viewer.php?name=' + $state.params.name; // local url       
        }


        vm.reportSrc += "&rand=" + Math.round(Math.random() * 10000000);

        vm.ramdomID = Math.round(Math.random() * 10000000);

        vm.reportSrc = $sce.trustAsResourceUrl(vm.reportSrc)


        function closeThread() {
            $state.go('app.reports');
        }

        function saveReportPdf() {
            // Create an PDF settings instance. You can change export settings.
            var settings = new Stimulsoft.Report.Export.StiPdfExportSettings();
            // Create an PDF service instance.
            var service = new Stimulsoft.Report.Export.StiPdfExportService();
            debugger
            // Create a MemoryStream object.
            var stream = new Stimulsoft.System.IO.MemoryStream();
            // Export PDF using MemoryStream.
            service.exportTo(report, stream, settings);

            // Get PDF data from MemoryStream object
            var data = stream.toArray();
            // Get report file name
            var fileName = String.isNullOrEmpty(report.reportAlias) ? report.reportName : report.reportAlias;
            // Save data to file
            Object.saveAs(data, fileName + ".pdf", "application/pdf");
        }


    }

    function sliceArr() {
        return function(arr, start, end) {
            return (arr || []).slice(start, end);
        };
    }
})();

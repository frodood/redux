(function() {
    'use strict';

    angular
        .module('app.filemanager')
        .controller('FileManagerController', FileManagerController);

    /** @ngInject */
    FileManagerController.$ngInject = ['FileManager', '$state', '$scope', '$setUrl', '$apis'];

    function FileManagerController(FileManager, $state, $scope, $setUrl, $apis) {
        var vm = this;

        vm.primaryToolbarContext = true;

        vm.toggleChildStates = toggleChildStates;

        vm.currentThread = null;

        vm.selectedThreads = [];

        vm.closeThread = closeThread;

        vm.isSelected = isSelected;

        vm.toggleSelectThread = toggleSelectThread;

        vm.selectThreads = selectThreads;

        vm.deselectThreads = deselectThreads;

        vm.toggleSelectThreads = toggleSelectThreads;

        vm.setThreadStatus = setThreadStatus;

        vm.toggleThreadStatus = toggleThreadStatus;

        vm.starfunc = starfunc;

        vm.DefaultCancel = DefaultCancel;

        vm.viewImageInTab = viewImageInTab;

        vm.FileManagerData = FileManager.result;

        var FileManagerDataToview = vm.FileManagerData;

        vm.downloadImage = downloadImage;

        vm.imageUrl = $setUrl.imagePath;
        vm.brochur = $setUrl.brochurePath;

        vm.hostUrl = $apis.getHost();

        // vm.filemanagerUniqueCode=FileManagerDataToview.uniqueCode;

        // console.log(vm.filemanagerUniqueCode);

        vm.fmListSpinnerLoaded = fmListSpinnerLoaded;

        function fmListSpinnerLoaded(detailsSpinner) {
            detailsSpinner.show('fm-list-spinner');
        }

        vm.pageObj = {
            service: 'process',
            method: 'getImageDataByQuery',
            orderby: '',
            isAscending: 'false',
            body: {
                "where": "type <> 'invalid' order by date DESC"
            }

        }

        vm.pageGap = 10;
        vm.indexno = 1;

        vm.testarr = [{
                name: "Date",
                id: "date",
                upstatus: false,
                downstatus: false,
                divider: true,
                close: false
            }, {
                //name: vm.sortName,
                name: "File Name",
                id: "uniqueCode",
                upstatus: false,
                downstatus: false,
                divider: false,
                close: false
            }, {
                // name: vm.sortEmail,
                name: "File Size",
                id: "size",
                upstatus: false,
                downstatus: false,
                divider: false,
                close: false
            },
            {
                name: "User",
                id: "createUser",
                upstatus: false,
                downstatus: false,
                divider: false,
                close: false
            }, {
                name: "App",
                id: "appName",
                upstatus: false,
                downstatus: false,
                divider: false,
                close: false
            }
        ];


        function loadAllImageFiles(orderby, Isascending) {
            var whereClause;
            if (orderby == "" || orderby == "date") {
                whereClause = "type <> 'invalid' order by date DESC";
            } else {
                if (Isascending)
                    whereClause = "type <> 'invalid' order by " + orderby + ", date DESC";
                else
                    whereClause = "type <> 'invalid' 'Customer' order by " + orderby + " DESC, date DESC";
            }
            vm.pageObj = {
                service: 'process',
                method: 'getImageDataByQuery',
                body: {
                    "where": whereClause
                },
                orderby: '',
                isAscending: ''
            }

            $scope.$broadcast("getPageObj", vm.pageObj);

        }

        function DefaultCancel(item) {

            vm.testarr[vm.indexno].upstatus = false;
            vm.testarr[vm.indexno].downstatus = false;
            item.close = false;
            vm.orderby = "date",
                vm.isAscending = false;
            loadAllImageFiles(vm.orderby, vm.isAscending);
        }

        function starfunc(item, index) {

            if (item.id === "favouriteStarNo") {
                item.upstatus == false;
                item.downstatus = false;
                vm.testarr[vm.indexno].upstatus = false;
                vm.testarr[vm.indexno].downstatus = false;
                vm.testarr[vm.indexno].close = false;
                item.close = true;
                vm.indexno = index;
                vm.orderby = "favouriteStarNo";
                vm.isAscending = true;
                loadAllImageFiles(vm.orderby, vm.isAscending);

            } else {
                if (item.upstatus == false && item.downstatus == false) {
                    item.upstatus = !item.upstatus;
                    item.close = true;

                    if (vm.indexno != index) {
                        vm.testarr[vm.indexno].upstatus = false; // hide previous up icon
                        vm.testarr[vm.indexno].downstatus = false; // hide previous down icon
                        vm.testarr[vm.indexno].close = false; // hide previous close icon
                        vm.indexno = index;
                    }
                } else {
                    item.upstatus = !item.upstatus;
                    item.downstatus = !item.downstatus;
                    item.close = true;
                }

                if (item.upstatus) {
                    vm.orderby = item.id;
                    vm.isAscending = true;
                    loadAllImageFiles(vm.orderby, vm.isAscending);
                    vm.sortSelected = true
                }
                if (item.downstatus) {
                    vm.orderby = item.id;
                    vm.isAscending = false;
                    loadAllImageFiles(vm.orderby, vm.isAscending);
                    vm.sortSelected = false
                }
            }
        }
        // sort function end 



        function viewImageInTab(FileManagerDataToview) {
            console.log(FileManagerDataToview);
            console.log(FileManagerDataToview.type);
            var FileManagerDataToviewUrl = FileManagerDataToview;
            var appNameForUrl = FileManagerDataToviewUrl.appName.toLowerCase();
            vm.imageCode = "";
            //vm.imageCode = $setUrl.imagePath + 'product/'+ FileManagerDataToviewUrl.uniqueCode;
            if(FileManagerDataToview.type === 'brochure'){
                vm.imageCode = $setUrl.brochurePath + appNameForUrl + '/' + FileManagerDataToviewUrl.uniqueCode;
                vm.type = "Brochure";
            }
            else if(FileManagerDataToview.type === 'image'){
                vm.imageCode = $setUrl.imagePath + appNameForUrl + '/' + FileManagerDataToviewUrl.uniqueCode;
                vm.type = "Image";
            }
            console.log(vm.imageCode);
            window.open(vm.imageCode, vm.type);
        };

        function downloadImage(FileManagerDataToview) {
            debugger;
            console.log(FileManagerDataToview);
            var FileManagerDataToviewUrl = FileManagerDataToview;
            var appNameForUrl = FileManagerDataToviewUrl.appName.toLowerCase();
            console.log(appNameForUrl);
            vm.imageCode = "";
            if(FileManagerDataToview.type === 'brochure'){
                vm.imageCode = $setUrl.brochurePath + appNameForUrl + '/' + FileManagerDataToviewUrl.uniqueCode;
            }
            else if(FileManagerDataToview.type === 'image'){
                vm.imageCode = $setUrl.imagePath + appNameForUrl + '/' + FileManagerDataToviewUrl.uniqueCode;
            }
        };

        function setPrimaryToolBar() {
            vm.primaryToolbarContext = !vm.primaryToolbarContext;
        };

        function toggleChildStates(toggledState) {
            $state.go(toggledState);
        };

        /**
         * Close thread
         */
        function closeThread() {
            vm.currentThread = null;

            setPrimaryToolBar();

            // Update the state without reloading the controller
            $state.go('app.filemanager');
        }

        /**
         * Return selected status of the thread
         *
         * @param thread
         * @returns {boolean}
         */
        function isSelected(thread) {
            return vm.selectedThreads.indexOf(thread) > -1;
        }

        /**
         * Toggle selected status of the thread
         *
         * @param thread
         * @param event
         */
        function toggleSelectThread(thread, event) {
            if (event) {
                event.stopPropagation();
            }

            if (vm.selectedThreads.indexOf(thread) > -1) {
                vm.selectedThreads.splice(vm.selectedThreads.indexOf(thread), 1);
            } else {
                vm.selectedThreads.push(thread);
            }
        }

        /**
         * Select threads. If key/value pair given,
         * threads will be tested against them.
         *
         * @param [key]
         * @param [value]
         */
        function selectThreads(key, value) {
            // Make sure the current selection is cleared
            // before trying to select new threads
            vm.selectedThreads = [];

            for (var i = 0; i < vm.items.length; i++) {
                if (angular.isUndefined(key) && angular.isUndefined(value)) {
                    vm.selectedThreads.push(vm.items[i]);
                    continue;
                }

                if (angular.isDefined(key) && angular.isDefined(value) && vm.items[i][key] === value) {
                    vm.selectedThreads.push(vm.items[i]);
                }
            }
        }

        /**
         * Deselect threads
         */
        function deselectThreads() {
            vm.selectedThreads = [];
        }

        /**
         * Toggle select threads
         */
        function toggleSelectThreads() {
            if (vm.selectedThreads.length > 0) {
                vm.deselectThreads();
            } else {
                vm.selectThreads();
            }
        }

        /**
         * Set the status on given thread, current thread or selected threads
         *
         * @param key
         * @param value
         * @param [thread]
         * @param [event]
         */
        function setThreadStatus(key, value, thread, event) {
            // Stop the propagation if event provided
            // This will stop unwanted actions on button clicks
            if (event) {
                event.stopPropagation();
            }

            // If the thread provided, do the changes on that
            // particular thread
            if (thread) {
                thread[key] = value;
                return;
            }

            // If the current thread is available, do the
            // changes on that one
            if (vm.currentThread) {
                vm.currentThread[key] = value;
                return;
            }

            // Otherwise do the status update on selected threads
            for (var x = 0; x < vm.selectedThreads.length; x++) {
                vm.selectedThreads[x][key] = value;
            }
        }

        /**
         * Toggle the value of the given key on given thread, current
         * thread or selected threads. Given key value must be boolean.
         *
         * @param key
         * @param thread
         * @param event
         */
        function toggleThreadStatus(key, thread, event) {

            favouriteFunction(thread);
            //changeStatus(thread);
            // Stop the propagation if event provided
            // This will stop unwanted actions on button clicks
            if (event) {
                event.stopPropagation();
            }

            // If the thread provided, do the changes on that
            // particular thread
            if (thread) {
                if (typeof(thread[key]) !== 'boolean') {
                    return;
                }

                thread[key] = !thread[key];
                return;
            }

            // If the current thread is available, do the
            // changes on that one
            if (vm.currentThread) {
                if (typeof(vm.currentThread[key]) !== 'boolean') {
                    return;
                }

                vm.currentThread[key] = !vm.currentThread[key];
                return;
            }

            // Otherwise do the status update on selected threads
            for (var x = 0; x < vm.selectedThreads.length; x++) {
                if (typeof(vm.selectedThreads[x][key]) !== 'boolean') {
                    continue;
                }

                vm.selectedThreads[x][key] = !vm.selectedThreads[x][key];
            }
        }

    }
})();
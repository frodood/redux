(function() {
    'use strict';

    angular
        .module('app.contacts')
        .controller('customerController', customerController);

    /** @ngInject */
    //customerController.$inject = ['$scope', '$rootScope', '$document', '$mdDialog', '$mdMedia', '$mdSidenav', '$state', 'msApi', 'Customer','$serviceCall','$mdToast','$stateParams','contactEditService','AddressService'];

    function customerController($scope, $rootScope, $document, $mdDialog, $mdMedia, $mdSidenav, $state, msApi, $serviceCall, $mdToast, $stateParams, contactEditService, AddressService, $getPdf, msSpinnerService) {

        var vm = this;

        vm.contactColors = ['blue-bg', 'blue-grey-bg', 'orange-bg', 'pink-bg', 'purple-bg', 'green-bg', 'red-bg'];

        // vm.customerSummaryData = Customer.result;

        vm.primaryToolbarContext = true;

        vm.toggleChildStates = toggleChildStates;

        vm.loadingItems = false;

        vm.currentThread = null;

        vm.selectedThreads = [];

        vm.openItem = openItem;

        vm.closeThread = closeThread;

        vm.isSelected = isSelected;

        vm.toggleSelectThread = toggleSelectThread;

        vm.selectThreads = selectThreads;

        vm.deselectThreads = deselectThreads;

        vm.toggleSelectThreads = toggleSelectThreads;

        vm.setThreadStatus = setThreadStatus;

        vm.toggleThreadStatus = toggleThreadStatus;

        vm.showAdvancedEditDialog = showAdvancedEditDialog;

        vm.changeStatus = changeStatus;

        vm.starfunc = starfunc;

        vm.ContactDelete = ContactDelete;

        vm.invoice = invoice;

        vm.recurringPRofile = recurringPRofile;

        vm.estimate = estimate;

        vm.creditNote = creditNote;

        vm.payment = payment;

        vm.inventoryIssued = inventoryIssued;

        vm.View360 = View360;

        vm.loadLegerData = loadLegerData;

        //vm.product = product;

        vm.filterFavourite = filterFavourite;

        vm.filterActive = filterActive;

        vm.sortAll = sortAll;

        vm.invoicePaymentLink = invoicePaymentLink;

        vm.defaultCancel = defaultCancel;

        vm.showAdvancedInputDates = showAdvancedInputDates;

        vm.sendMail = sendMail;

        vm.printPDF = printPDF;

        vm.downloadPDF = downloadPDF;

        vm.ObjCusAddress = [];

        vm.ObjCompanyAddress = [];

        vm.spinnerService = msSpinnerService;

        vm.conDetailSpinnerLoaded = conDetailSpinnerLoaded;

        vm.cusListSpinnerLoaded = cusListSpinnerLoaded;
        // vm.loadLegerData = loadLegerData;

        //  //////////
        debugger;
        init();

        /** 
         * Initialize
         */
        function init() { 
            debugger
            if ($state.current.name == "app.contacts.customer.detail") {
                loadLegerData();
       
            } 
          
        }

        function cusListSpinnerLoaded(listCusSpinner){
            listCusSpinner.show('cus-list-spinner');
        }

        function conDetailSpinnerLoaded(detailSpinner){
            detailSpinner.show('con-customerDetails-spinner');
        }

        vm.pageObj = {
            service: 'profile',
            method: 'getAllByQuery',
            orderby: '',
            isAscending: 'false',
            class: 'Customer',
            body: {
                "where": "deleteStatus = 'false' AND profileClass = 'Customer' order by createDate DESC"
            }
        }

        debugger;
        vm.pageGap = 10;
        $scope.$broadcast("getPageObj", vm.pageObj);

        vm.indexno = 1;

        // function product(val){
        //   var passingDataProduct={
        //         itemID : val.profileID,
        //         profileID : "profile"
        //     }
        //     $state.go('app.products.compose',passingDataProduct);
        // }

        function View360(val) {
            debugger;
            var passingData360 = {
                
                //itemID : val.profileID,
                Data: {
                    profileId: val.profileID
                },
                appName: "profile"
            }
            $state.go('app.threesixtyview', passingData360);
        }

        function invoice(val) {
            var passingDataContact = {
                Data: {
                    profileId: val.profileID
                },
                appName: "profile"
            }

            $state.go('app.invoices.compose', passingDataContact);
        }

        function recurringPRofile(val) {
            var passingDatarecurringPRofile = {
                //itemID : val.profileID,
                Data: {
                    profileId: val.profileID
                },
                appName: "profile"
            }
            $state.go('app.invoices.Recurringcompose', passingDatarecurringPRofile);
        }
        

        function estimate(val) {
            console.log(val);
            var passingDataestimate = {
                //itemID : val.profileID,
                Data: {
                    profileId: val.profileID
                },
                appName: "profile"
            }
            $state.go('app.estimates.compose', passingDataestimate);
        }


        function creditNote(val) {
            var passingDatacreditNote = {
                Data: {
                    profileId: val.profileID
                },
                appName: "profile"
            }
            $state.go('app.creditnotes.compose', passingDatacreditNote);
        }

        function payment(val) {
            var passingData = {
                //itemID : val.profileID,
                Data: {
                    profileId: val.profileID
                },
                appName: "profile"
            }
            $state.go('app.payments.compose', passingData);
        }

        function inventoryIssued(val) {
            var passingDataInventory = {
                Data: {
                    profileId: val.profileID
                },
                appName: "profile"
            }
            $state.go('app.inventory.ginCompose', passingDataInventory);
        }

        // go to apps from leger data in detailed view (by clicking on the leger data description)
        function invoicePaymentLink(dt) {
            if (dt.legerType == "Invoice") {
                var invoice = {
                    Data: {
                        invoiceID: dt.refID
                    },
                    appName: "profile"
                }
                $state.go('app.invoices.inv.detail', {itemId: dt.refID});

            } else if (dt.legerType == "Payment") {
                console.log(dt.refID);
                var payment = {
                    Data: {
                        paymentID: dt.refID
                    },
                    appName: "profile"
                }
                $state.go('app.payments.pay.detail', payment);

            } else if (dt.legerType == "CreditNote") {
                var creditnotes = {
                    Data: {
                        creditNoteID: dt.refID
                    },
                    appName: "profile"
                }
                $state.go('app.creditnotes.cre.detail', creditnotes);
            }
        }



        function sendMail() {
            $mdDialog.show({
                controller: 'emailControllerContact',
                controllerAs: 'vm',
                templateUrl: 'app/main/contacts/dilaogs/email/email.html',
                parent: angular.element(document.body),
                clickOutsideToClose: true,
                locals: {
                    profileMail: vm.contact,
                    dateFrom:vm.dateFrom,
                    dateTo:vm.dateTo
                }
            })
        }

        function printPDF() {
            console.log(vm.contact);
            console.log(vm.dateFrom);
            console.log(vm.dateTo);
            var client = $getPdf.setPdfClient('generatePDFByRange', 'process');
            client.setUrl(vm.contact.profileID + '.pdf').uniqueID(vm.contact.profileID).class('accountstatement').skip(0).take("").start(vm.dateFrom).end(vm.dateTo).print();
        }

        function downloadPDF() {
            var client = $getPdf.setPdfClient('generatePDFByRange', 'process');
            client.setUrl(vm.contact.profileID + '.pdf').uniqueID(vm.contact.profileID).class('accountstatement').skip(0).take("").start(vm.dateFrom).end(vm.dateTo).download();
        }

        vm.testarr = [{
                name: "Starred",
                id: "favouriteStarNo",
                src: "img/ic_grade_48px.svg",
                upstatus: false,
                downstatus: false,
                divider: true,
                close: false
            }, {
                //name: vm.sortName,
                name: "Customer",
                id: "profileName",
                upstatus: false,
                downstatus: false,
                divider: false,
                close: false
            }, {
                // name: vm.sortEmail,
                name: "Email",
                id: "email",
                upstatus: false,
                downstatus: false,
                divider: false,
                close: false
            },
            {
                name: "Active",
                id: "status",
                upstatus: false,
                downstatus: false,
                divider: false,
                close: false
            }, {
                name: "Inactive",
                id: "status",
                upstatus: false,
                downstatus: false,
                divider: false,
                close: false
            }
        ];


        function starfunc(item, index) {
            // pass sort object and index number       
            if (item.id === "favouriteStarNo") {
                item.upstatus = false;
                item.downstatus = false;
                vm.testarr[vm.indexno].upstatus = false;
                vm.testarr[vm.indexno].downstatus = false;
                vm.testarr[vm.indexno].close = false;
                item.close = true;
                vm.indexno = index;
                vm.orderby = "favouriteStarNo";
                vm.isAscending = true;

                loadAllCustomers(vm.orderby, vm.isAscending);

            } else if (item.id === "status") {
                item.upstatus == false; // hide current up icon
                item.downstatus = false; // hide current down icon
                vm.testarr[vm.indexno].downstatus = false; // hide previous down icon
                vm.testarr[vm.indexno].upstatus = false; // hide previous up icon
                vm.testarr[vm.indexno].close = false; // hide previous close icon
                item.close = true;
                vm.indexno = index;

                vm.orderby = "status";
                if (item.name == "Active")
                    statusFilter({
                        "where": "deleteStatus = 'false' AND status = 'Active' AND profileClass = 'Customer' order by createDate DESC"
                    });
                    // vm.isAscending = true;
                else if (item.name == "Inactive")
                    // vm.isAscending = false;
                    statusFilter({
                        "where": "deleteStatus = 'false' AND status = 'Inactive' AND profileClass = 'Customer' order by createDate DESC"
                    });


                // loadAllCustomers(vm.orderby, vm.isAscending);


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

                    loadAllCustomers(vm.orderby, vm.isAscending);



                    vm.sortSelected = true;
                }
                if (item.downstatus) {
                    vm.orderby = item.id;
                    vm.isAscending = false;

                    loadAllCustomers(vm.orderby, vm.isAscending);

                    vm.sortSelected = false;
                }
            }

        }
        // sort function end 


        function loadAllCustomers(orderby, Isascending) {
            debugger;
            var whereClause;
            if (orderby == "" || orderby == "createDate") {
                // if (vm.sortSelected)
                //   whereClause = "deleteStatus = 'false' AND profileClass = 'Customer' order by createDate";
                // else
                whereClause = "deleteStatus = 'false' AND profileClass = 'Customer' order by createDate DESC";
            } else {
                if (Isascending)
                    whereClause = "deleteStatus = 'false' AND profileClass = 'Customer'  order by " + orderby + ", createDate DESC";
                else
                    whereClause = "deleteStatus = 'false' AND profileClass = 'Customer' order by " + orderby + " DESC, createDate DESC";
            }
            vm.pageObj = {
                service: 'profile',
                method: 'getAllByQuery',
                body: {
                    "where": whereClause
                },
                orderby: '',
                isAscending: ''
            }

            $scope.$broadcast("getPageObj", vm.pageObj);

        }

        function statusFilter(whereClause){
            console.log(whereClause);
            vm.pageObj = {
                service: 'profile',
                method: 'getAllByQuery',
                body: whereClause,
                orderby: '',
                isAscending: ''
            }

            $scope.$broadcast("getPageObj", vm.pageObj);
        }

        function defaultCancel(item) {

            vm.testarr[vm.indexno].upstatus = false;
            vm.testarr[vm.indexno].downstatus = false;
            item.close = false;
            vm.orderby = "createDate",
                vm.isAscending = false;
            loadAllCustomers(vm.orderby, vm.isAscending);



            // var whereClause = "profileClass = 'Customer' order by lastTranDate DESC"

            //   vm.pageObj = {
            //       service : 'profile',
            //       method : 'getAllByQuery',
            //       body : {"where" : whereClause},
            //       orderby: '',
            //       isAscending : ''
            //   }

            //   $scope.$broadcast("getPageObj", vm.pageObj)      
        }


        function favouriteFunction(favFuncForm) {
            // change the favouriteStar to  opposite boolean value 
            // change the favouriteStarNo 1 or 0 
            if (favFuncForm.favouriteStarNo == 1)
                favFuncForm.favouriteStarNo = 0;

            else if (favFuncForm.favouriteStarNo == 0)
                favFuncForm.favouriteStarNo = 1;

                favFuncForm.favouriteStar = !favFuncForm.favouriteStar;

            favFuncForm.profileLog = {
                profileID: "",
                logID: "-888",
                type: "",
                description: "",
                UIHeight: "",
                status: "",
                userName: "",
                lastTranDate: "",
                createDate: "",
                modifyDate: "",
                createUser: "",
                modifyUser: ""
            }

            var favFuncObj = {
                "appName": "Contacts",
                "permissionType": "edit",
                "profile": favFuncForm,
                "image": favFuncForm.image
            }

            var jsonString = JSON.stringify(favFuncObj);


            var client = $serviceCall.setClient("updateProfile", "process"); // method name and service
            client.ifSuccess(function(data) {
                   
            })
            client.ifError(function(data) {

                if (data.data.isSuccess == false) {
                    $mdDialog.show(
                        $mdDialog.alert()
                        .parent(angular.element(document.body))
                        .title('Error')
                        .content(data.data.customMessage)
                        .ariaLabel('Alert Dialog Demo')
                        .ok('OK')
                        .targetEvent()
                    );

                }

                if (data.data.customMessage == null) {
                    $mdDialog.show(
                        $mdDialog.alert()
                        .parent(angular.element(document.body))
                        .title('Error')
                        .content('Error Occure while Adding to Favourite')
                        .ariaLabel('Alert Dialog Demo')
                        .ok('OK')
                        .targetEvent()
                    );
                }

            })

            client.postReq(jsonString);
        }

        function filterFavourite() {
            debugger;

            var whereClause = "favouriteStar = true AND profileClass = 'Customer' order by createDate DESC"

            vm.pageObj = {
                service: 'profile',
                method: 'getAllByQuery',
                body: {
                    "where": whereClause
                },
                orderby: '',
                isAscending: ''
            }

            $scope.$broadcast("getPageObj", vm.pageObj)

            vm.testarr[vm.indexno].upstatus = false;
            vm.testarr[vm.indexno].downstatus = false;
            vm.testarr[vm.indexno].close = false;

        }

        function filterActive() {

            var whereClause = "deleteStatus = 'false' AND status = 'Active' AND profileClass = 'Customer' order by createDate DESC"

            vm.pageObj = {
                service: 'profile',
                method: 'getAllByQuery',
                body: {
                    "where": whereClause
                },
                orderby: '',
                isAscending: ''
            }

            $scope.$broadcast("getPageObj", vm.pageObj)

            vm.testarr[vm.indexno].upstatus = false;
            vm.testarr[vm.indexno].downstatus = false;
            vm.testarr[vm.indexno].close = false;

        }

        function sortAll() {

            var whereClause = " deleteStatus = 'false' AND profileClass = 'Customer' order by createDate DESC"

            vm.pageObj = {
                service: 'profile',
                method: 'getAllByQuery',
                body: {
                    "where": whereClause
                },
                orderby: '',
                isAscending: ''
            }

            $scope.$broadcast("getPageObj", vm.pageObj)

            vm.testarr[vm.indexno].upstatus = false;
            vm.testarr[vm.indexno].downstatus = false;
            vm.testarr[vm.indexno].close = false;

        }


        //_______________Change status of the contact______________________________________________

        function changeStatus(statusChangeForm) {

            if (statusChangeForm.status == "Active") {
                statusChangeForm.status = "Inactive";
            } else if (statusChangeForm.status == "Inactive") {
                statusChangeForm.status = "Active";
            }


            statusChangeForm.profileLog = {
                profileID: "",
                logID: "-888",
                type: "",
                description: "",
                UIHeight: "",
                status: "",
                userName: "",
                lastTranDate: "",
                createDate: "",
                modifyDate: "",
                createUser: "",
                modifyUser: ""
            }

            var statusObj = {
                "appName": "Contacts",
                "permissionType": "edit",
                "profile": statusChangeForm,
                "image": statusChangeForm.image
            }

            //changeStatus(statusChangeForm);
            var jsonString = JSON.stringify(statusObj);



            var client = $serviceCall.setClient("updateProfile", "process"); // method name and service
            client.ifSuccess(function(data) {})
            client.ifError(function(data) {

                if (data.data.isSuccess == false) {
                    $mdDialog.show(
                        $mdDialog.alert()
                        .parent(angular.element(document.body))
                        .title('Error')
                        .content(data.data.customMessage)
                        .ariaLabel('Alert Dialog Demo')
                        .ok('OK')
                        .targetEvent()
                    );

                }

                if (data.data.customMessage == null) {
                    $mdDialog.show(
                        $mdDialog.alert()
                        .parent(angular.element(document.body))
                        .title('Error')
                        .content('Error Occure while changing the status')
                        .ariaLabel('Alert Dialog Demo')
                        .ok('OK')
                        .targetEvent()
                    );
                }
            })
            client.postReq(jsonString);
        }
        //================================================================================================

        //___________________________DELETE CONTACT________________________________________________________
        function ContactDelete(deleteform, ev) {
            console.log(deleteform);
            var confirm = $mdDialog.confirm()
                .parent(angular.element(document.body))
                .title('Delete customer?')
                .content('This process is not reversible')
                .ok('Delete')
                .cancel('Cancel')
                .targetEvent(ev);
            $mdDialog.show(confirm).then(function() {

                deleteform.profileLog = {
                    profileID: "",
                    logID: "-888",
                    type: "",
                    description: "",
                    UIHeight: "",
                    status: "",
                    userName: "",
                    lastTranDate: "",
                    createDate: "",
                    modifyDate: "",
                    createUser: "",
                    modifyUser: ""
                }
                
                if (deleteform.status == "Inactive") {
                    deleteform.deleteStatus = true;

                    var serviceObj = {
                        "appName": "Contacts",
                        "permissionType": "delete",
                        "profile": deleteform,
                        "image": deleteform.image
                    }
                    var jsonString = JSON.stringify(serviceObj);
                    console.log(serviceObj);

                    var client = $serviceCall.setClient("deleteProfile", "process"); // method name and service
                    client.ifSuccess(function(data) {
                        $mdToast.show(
                            $mdToast.simple() 
                            .textContent('Customer successfully deleted')
                            .position('top right')
                            .hideDelay(3000)
                        );
                        $state.go($state.current, {}, {
                            reload: true
                        });
                    })
                    client.ifError(function(data) {
                   
                        deleteform.deleteStatus = false;

                        if (data.data.isSuccess == false) {
                            $mdDialog.show(
                                $mdDialog.alert()
                                .parent(angular.element(document.body))
                                .title('Alert')
                                .content(data.data.customMessage)
                                .ariaLabel('Alert Dialog Demo')
                                .ok('OK')
                                .targetEvent()
                            );

                        }

                        if (data.data.customMessage == null) {
                            $mdDialog.show(
                                $mdDialog.alert()
                                .parent(angular.element(document.body))
                                .title('Error')
                                .content('Error Deleting Customer')
                                .ariaLabel('Alert Dialog Demo')
                                .ok('OK')
                                .targetEvent()
                            );
                        }
                    })
                    client.postReq(jsonString);

                } else {
                    $mdDialog.show(
                        $mdDialog.alert()
                        .parent(angular.element(document.body))
                        .title('Alert')
                        .content('Unable to delete customer. Please inactivate instead.')
                        .ariaLabel('Alert Dialog Demo')
                        .ok('OK')
                    );
                }
            })
        }




        function loadLegerDataFromDates(skip, take, dateFrom, dateTo) {

            vm.pageObjLedger = {
                  service : 'process',
                   method : 'getLegerAllByProfile',
                   orderby: '',
                   isAscending : 'false',
                   class : 'Customer',
                   uniqueID : $state.params.itemID,
                   FromDate : dateFrom,
                   ToDate :dateTo,
                   body : { }

            } 

            vm.pageGapLeger=100;
            vm.indexno=1;

            vm.legerDetail = [];

            var client = $serviceCall.setClient("getLegerAllByProfile", "process"); // method name and service
            client.ifSuccess(function(data) {

                var data = data;
                vm.invoices = data.invoices;
                vm.payments = data.payments;
                vm.credits = data.credits;
                vm.balanceBF = data.balanceBF;
                vm.balanceDue = data.balanceDue;
                vm.dateFrom = data.dateFrom;
                vm.dateTo = data.dateTo;

                console.log(vm.balanceDue);

                vm.legerDetail = data.result;

                vm.customerSummary = data.summary;
                console.log(vm.customerSummary);

                vm.periodDate = data;

                vm.legerDetailpageShow = true;
                
                vm.spinnerService.hide('con-customerLedgerDetailsForSelectdateRange-spinner');

            })
            client.ifError(function(data) {
                vm.spinnerService.hide('con-customerLedgerDetailsForSelectdateRange-spinner');
                console.log(data)
                $mdDialog.show(
                    $mdDialog.alert()
                    .parent(angular.element(document.body))
                    .title('Error')
                    .content('There was an error retreving the data.')
                    .ariaLabel('Alert Dialog Demo')
                    .ok('OK')
                    .targetEvent()
                );
            })
            client.uniqueID($state.params.itemID);
            client.skip(0);
            client.take('');
            client.FromDate(dateFrom);
            client.ToDate(dateTo);
            client.postReq();
        }

        function showAdvancedInputDates(ev) {
            debugger;
            $mdDialog.show({
                    controller: 'DialogControllerLeger',
                    controllerAs: 'vm',
                    templateUrl: 'app/main/contacts/dilaogs/inputLegerDates.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose: true,
                    locals: {
                        dateFrom: vm.dateFrom,
                        dateTo: vm.dateTo
                    }

                })
                .then(function(serviceObj) {
                    vm.spinnerService.show('con-customerLedgerDetailsForSelectdateRange-spinner');
                    loadLegerDataFromDates(serviceObj.skip, serviceObj.take, serviceObj.dFrom, serviceObj.dTo);
                }, function() {

                });
        }


        function loadSettingDataForLeger() {
            var client = $serviceCall.setClient("getAllByQuery", "setting");
            client.ifSuccess(function(data) {
                console.log(data[0].profile);
                var profileData = data[0].profile;
                vm.companylogo = data[0].profile.companyLogo.imageUrl;
                vm.ObjCompanyAddress = AddressService.setAddress(profileData.companyName, profileData.street, profileData.city, profileData.state, profileData.zip, profileData.country, profileData.phoneNo, "", profileData.fax, profileData.companyEmail, profileData.website);
                loadProfileDataForLerger();
            });
            client.ifError(function(data) {
                vm.spinnerService.hide('con-customerDetails-spinner');
            });
            client.postReq({
                "setting": "profile"
            })

        }

        function loadProfileDataForLerger() {

            var client = $serviceCall.setClient("getProfileByKey", "profile"); // method name and service
            client.ifSuccess(function(data) {
                console.log(data);

                vm.contact = {
                    "profileName": "",
                    "email": "",
                    "firstName": "",
                    "lastName": "",
                    "billingAddress": {},
                    "shippingAddress": {},
                    "phone": "",
                    "mobile": "",
                    "fax": "",
                    "website": "",
                    "profileLog": {},
                    "status": "",
                    "profileID": "",
                    "deleteStatus": "",
                    "favouriteStar": "",
                    "favouriteStarNo": "",
                    "createDate": "",
                    "profileClass": "",
                    "profileType": "",
                    "profileCategory": "",
                    "lastTranDate": "",
                    "modifyDate": "",
                    "createUser": "",
                    "modifyUser": "",
                    "adminMail": "",
                    "image": []
                }

                var editImage = [];
                vm.contact = data;
                vm.contact.profileName = data.profileName;
                vm.contact.email = data.email;
                vm.contact.firstName = data.firstName;
                vm.contact.lastName = data.lastName;
                vm.contact.billingAddress.street = data.billingAddress.street;
                vm.contact.billingAddress.city = data.billingAddress.city;
                vm.contact.billingAddress.state = data.billingAddress.state;
                vm.contact.billingAddress.zip = data.billingAddress.zip;
                vm.contact.billingAddress.country = data.billingAddress.country;
                vm.contact.fax = data.fax;
                vm.contact.mobile = data.mobile;
                vm.contact.phone = data.phone;
                vm.contact.website = data.website;
                vm.contact.status = data.status;
                vm.contact.billingAddress = data.billingAddress;
                vm.contact.shippingAddress = data.shippingAddress;
                vm.ObjCusAddress = AddressService.setAddress(vm.contact.profileName, data.billingAddress.street, data.billingAddress.city, data.billingAddress.state, data.billingAddress.zip, data.billingAddress.country, data.phone, data.mobile, data.fax, data.email, data.website);

                loadLegerDataForLeger();
                

            })
            client.ifError(function(data) {
                vm.spinnerService.hide('con-customerDetails-spinner');
                console.log("error loading profile data")
            })
            client.uniqueID($state.params.itemID);
            client.postReq();
        }
        vm.legerDetail = [];

        function loadLegerDataForLeger() {


            vm.pageObjLedger = {
                  service : 'process',
                   method : 'getLegerAllByProfile',
                   orderby: '',
                   isAscending : 'false',
                   class : 'Customer',
                   uniqueID : $state.params.itemID,
                   // FromDate :vm.dateFrom,
                   // ToDate : vm.dateTo,
                   body : { }            
               } 

            vm.pageGapLeger=100;
            // vm.pageGap=10;
            vm.indexno = 1;


            var client = $serviceCall.setClient("getLegerAllByProfile", "process");
            client.ifSuccess(function(data) {

                var data = data;
                vm.invoices = data.invoices;
                vm.payments = data.payments;
                vm.credits = data.credits;
                vm.balanceBF = data.balanceBF;
                vm.balanceDue = data.balanceDue;
                vm.dateFrom = data.dateFrom;
                vm.dateTo = data.dateTo;
                //vm.legerDetail = data.result;
                vm.legerDetail = data.result;
                console.log(vm.legerDetail);
                vm.customerSummary = data.summary;
                vm.periodDate = data;
                vm.spinnerService.hide('con-customerDetails-spinner');

            })
            client.ifError(function(data) {
                vm.spinnerService.hide('con-customerDetails-spinner');
                console.log(data)
                $mdDialog.show(
                    $mdDialog.alert()
                    .parent(angular.element(document.body))
                    .title('Error')
                    .content('There was an error retreving the data.')
                    .ariaLabel('Alert Dialog Demo')
                    .ok('OK')
                    .targetEvent()
                );
            })
            client.uniqueID($state.params.itemID);
            client.skip(0);
            client.take('');
            client.postReq();
        }

        function loadLegerData() {

            vm.primaryToolbarContext = false;
            vm.currentThread = "ssss";


            loadSettingDataForLeger();
        }



        function showAdvancedEditDialog(ev, uniqueID, favouriteStarNo, favouriteStar) {

            $mdDialog.show({
                    controller: 'DialogControllerEditCustomer',
                    controllerAs: 'vm',
                    templateUrl: 'app/main/contacts/dilaogs/editDialogBoxCustomer.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose: true,
                    locals: {
                        profileID: uniqueID,
                        favouriteStar: favouriteStar,
                        favouriteStarNo: favouriteStarNo
                    }

                })
                .then(function(answer) {
           
                    loadAllCustomers('createDate', false);


                }, function() {

                });
        };

        function setPrimaryToolBar() {
            vm.primaryToolbarContext = !vm.primaryToolbarContext;
        };

        function toggleChildStates(toggledState) {
            $state.go(toggledState);
        };

        function openItem(item) {
            // Set the read status on the item
            // item.read = true;

            setPrimaryToolBar();

            // Assign thread as the current thread
            vm.currentThread = item;

            $state.go('app.contacts.customer.detail', {
                itemID: item.profileID,
                status: item.profileClass
            });
            debugger;

        }

        /**
         * Close thread
         */
        function closeThread() {

            vm.legerDetail = [];
            vm.balanceDue ="";
            vm.baseCurrency="";
            vm.invoices = "";
            vm.credits = "";
            vm.payments = "";
            vm.balanceBF = "";
            vm.dateFrom = "";
            vm.dateTo = "";
            vm.contact = {};
            vm.currentThread = null;

            setPrimaryToolBar();

            // Update the state without reloading the controller
            $state.go('app.contacts.customer');
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


angular
    .module('app.contacts')
    .factory('contactEditService', contactEditService);
contactEditService.$inject = [];

function contactEditService() {

    var contactArray = [];

    return {
        setArray: function(newVal) {
            contactArray.push(newVal);
            return contactArray;
        },
        removeArray: function(newVals) {
            contactArray.splice(newVals, 1);
            return contactArray;
        },
        getArray: function() {
            return contactArray;
        }
    }
}
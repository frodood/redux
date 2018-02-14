(function() {
    'use strict';

    angular
        .module('app.settings')
        .controller('emailTemplatesViewController', emailTemplatesViewController);

    /** @ngInject */
    function emailTemplatesViewController($scope, $rootScope, $window, $http, $log, $document, $mdDialog, $mdMedia, $mdToast, $serviceCall, $mdSidenav, $state, msApi, $auth, $apis, msSpinnerService) {
        // use the below code on all child view controllers
        var vm = this;

        vm.toggleSidenav = toggleSidenav;

        vm.spinnerService = msSpinnerService;

        vm.checkPowerdBy = false;

        function toggleSidenav(sidenavId) {
            $mdSidenav(sidenavId).toggle();
        }
        // dont change above code !

        vm.settingLoadEmailTemplatesSpinnerLoaded = settingLoadEmailTemplatesSpinnerLoaded;

        function settingLoadEmailTemplatesSpinnerLoaded(emailTemplatesSpinner){
            emailTemplatesSpinner.show('setting-loadEmailTemplates-spinner');
        }

        function getHost() {
			var host = window.location.protocol + '//' + window.location.hostname;
			if (host.indexOf("localhost") !== -1 || host.indexOf("127.0.0.1") !== -1) {
				host = window.location.protocol + '//' + "gowinda.developer.12thdoor.com";
			}
			return host;
        }
        function getTenantID() {
		var host = window.location.hostname;
		if (host.indexOf("localhost") !== -1 || host.indexOf("127.0.0.1") !== -1) {
			host = "gowinda.developer.12thdoor.com"; //test host 
		}
		return host;
	    }
        //check plan status
        //apis/plan/current
        vm.planStatus="";
        function getPlanUpgrade(){
			return 	$http({
						url: getHost()+'/services/duosoftware.subscription.service/subscription/getActiveSubscribedPlansForAccount?accountCode='+getTenantID(),
						method: "POST",
						headers: {
							securityToken:$rootScope.cc_sessionInfo.SecurityToken
						}
					}).then(getCurrentPlan).catch(currentPlanError);


			function getCurrentPlan(response){
                console.log(response.data[0]);
                vm.planStatus = response.data[0];
                if(vm.planStatus != '12d-free-plan'){
                    vm.checkPowerdBy = false;
                }
                else{
                    vm.checkPowerdBy = true;
                }
			}

			function currentPlanError(error){
				$log.error();
			}
	
        }

        getPlanUpgrade();

        // Get Plan Label Setting
        //services/duosoftware.setting.service/setting/getPlanLabelSetting
        function getPlanLabelFromSetting(){
            var client = $serviceCall.setClient("getPlanLabelSetting", "setting"); // method name and service
            client.ifSuccess(function(data) {
                console.log(data);
                if(data.addLabel){
                    vm.changePoweredBy12thdoorStatus=true; //if default plan is free plan label will be Power by 12thdoor
                }
                else{
                    vm.changePoweredBy12thdoorStatus=false;
                }
            });    

            client.ifError(function(data) {
                var toast = $mdToast.simple().content('There was an error, when data loading').action('OK').highlightAction(false).position("top right");
                $mdToast.show(toast).then(function() {});
            })
            client.skip(0);
            client.take(0);
            client.orderby();
            client.getReq();
        }
        getPlanLabelFromSetting();

        vm.updateFreePlanLabel= updateFreePlanLabel;
        function updateFreePlanLabel(data){
            console.log(data);
            if(vm.planStatus != '12d-free-plan'){

                if(data == false){
                    var toast = $mdToast.simple().content('12thDoor watermark for all documents successfully disabled.').action('OK').highlightAction(false).position("top right");
                    $mdToast.show(toast).then(function() {});
                }
                else{
                    var toast = $mdToast.simple().content('12thDoor watermark for all documents successfully enabled.').action('OK').highlightAction(false).position("top right");
                    $mdToast.show(toast).then(function() {});
                }

                var client = $serviceCall.setClient("updateAddLabel", "setting"); // method name and service
                client.ifSuccess(function(data) {
                    console.log(data);
                });    
                client.ifError(function(data) {
                    var toast = $mdToast.simple().content('There was an error, when update data loading').action('OK').highlightAction(false).position("top right");
                    $mdToast.show(toast).then(function() {});
                })
                client.value(data);
                client.getReq();
            }
        }



        function getAllTemplates(){
             var client = $serviceCall.setClient("getAllTemplate", "setting"); // method name and service
            client.ifSuccess(function(data) {
         
                  for (var i = data.length - 1; i >= 0; i--) {
                    if(data[i].TemplateID == "T_EMAIL_INV_NEWMAIL"){

                        if (data[i].length !== 0) {
                            vm.invoicebtnName = "Update";
                        } else {
                            vm.invoicebtnName = "Save";
                        }

                        console.log(data[i].Body);
                        console.log(data[i].Title);

                        vm.subject = data[i].Title;

                        if (data[i].length !== 0) {

                            var str = data[i].Body.toString();
                            console.log(str);
                            var arr = {
                                "<html>": "",
                                "</html>": "",
                                "<br>": "\n"
                            }

                            var re = new RegExp(Object.keys(arr).join("|"), "gi");
                            console.log(re);
                            str = str.replace(re, function(matched) {
                                return arr[matched];
                            });
                       

                            console.log(str);
                            vm.invoiceemailContent = str;
                            console.log(vm.invoiceemailContent);
                        } else {
                            vm.invoicebtnName = "Save";
                        }


                    }
                   else if(data[i].TemplateID == "T_EMAIL_CNT_NEWMAIL"){
                        if (data[i].length !== 0) {
                            vm.contactbtnName = "Update";
                        } else {
                            vm.contactbtnName = "Save";
                        }
                       
                        vm.subject1 = data[i].Title;

                        if (data[i].length !== 0) {

                            var str = data[i].Body.toString();
                            console.log(str);
                            var arr = {
                                "<html>": "",
                                "</html>": "",
                                "<br>": "\n"
                            }

                            var re = new RegExp(Object.keys(arr).join("|"), "gi");
                            str = str.replace(re, function(matched) {
                                return arr[matched];
                            });
                            console.log(str);
                            vm.contactemailContent = str;
                            console.log(vm.contactemailContent);
                        } else {
                            vm.contactbtnName = "Save";
                        }
                   }
                   else if(data[i].TemplateID == "T_EMAIL_PAY_NEWMAIL"){
                        if (data[i].length !== 0) {
                            vm.paymentbtnName = "Update";
                        } else {
                            vm.paymentbtnName = "Save";
                        }

                        vm.subject2 = data[i].Title;

                        if (data[i].length !== 0) {

                            var str = data[i].Body.toString();
                            console.log(str);
                            var arr = {
                                "<html>": "",
                                "</html>": "",
                                "<br>": "\n"
                            }

                            var re = new RegExp(Object.keys(arr).join("|"), "gi");
                            str = str.replace(re, function(matched) {
                                return arr[matched];
                            });
                            console.log(str);
                            vm.paymentemailContent = str;
                            console.log(vm.paymentemailContent);
                        } else {
                            vm.paymentbtnName = "Save";
                        }
                   }
                   else if(data[i].TemplateID == "T_EMAIL_PRO_NEWMAIL"){

                    if (data[i].length !== 0) {
                        vm.productbtnName = "Update";
                    } else {
                        vm.productbtnName = "Save";
                    }
                    

                    vm.subject3 = data[i].Title;

                    if (data[i].length !== 0) {

                        var str = data[i].Body.toString();
                        console.log(str);
                        var arr = {
                            "<html>": "",
                            "</html>": "",
                            "<br>": "\n"
                        }

                        var re = new RegExp(Object.keys(arr).join("|"), "gi");
                        str = str.replace(re, function(matched) {
                            return arr[matched];
                        });
                        console.log(str);
                        vm.productemailContent = str;
                        console.log(vm.productemailContent);
                    } else {
                        vm.productbtnName = "Save";
                    }

                   }
                   else if(data[i].TemplateID == "T_EMAIL_EXP_NEWMAIL"){
                    if (data[i].length !== 0) {
                        vm.expensebtnName = "Update";
                    } else {
                        vm.expensebtnName = "Save";
                    }

                    vm.subject4 = data[i].Title;

                    if (data[i].length !== 0) {

                        var str = data[i].Body.toString();
                        console.log(str);
                        var arr = {
                            "<html>": "",
                            "</html>": "",
                            "<br>": "\n"
                        }

                        var re = new RegExp(Object.keys(arr).join("|"), "gi");
                        str = str.replace(re, function(matched) {
                            return arr[matched];
                        });
                        console.log(str);
                        vm.expenseemailContent = str;
                        console.log(vm.expenseemailContent);
                    } else {
                        vm.expensebtnName = "Save";
                    }
                   }
                   else if(data[i].TemplateID == "T_EMAIL_INVENTORY_GIN_NEWMAIL"){

                        if (data[i].length !== 0) {
                            vm.inventoryGINbtnName = "Update";
                        } else {
                            vm.inventoryGINbtnName = "Save";
                        }
                      

                        vm.subjectGIN = data[i].Title;

                        if (data[i].length !== 0) {

                            var str = data[i].Body.toString();
                            console.log(str);
                            var arr = {
                                "<html>": "",
                                "</html>": "",
                                "<br>": "\n"
                            }

                            var re = new RegExp(Object.keys(arr).join("|"), "gi");
                            str = str.replace(re, function(matched) {
                                return arr[matched];
                            });
                            console.log(str);
                            vm.inventoryGINemailContent = str;
                            console.log(vm.inventoryGINemailContent);
                        } else {
                            vm.inventoryGINbtnName = "Save";
                        }
                    
                   }
                   else if(data[i].TemplateID == "T_EMAIL_INVENTORY_GRN_NEWMAIL"){

                    if (data[i].length !== 0) {
                    vm.inventoryGRNbtnName = "Update";
                } else {
                    vm.inventoryGRNbtnName = "Save";
                }
               

                vm.subjectGRN = data[i].Title;

                if (data[i].length !== 0) {

                    var str = data[i].Body.toString();
                    console.log(str);
                    var arr = {
                        "<html>": "",
                        "</html>": "",
                        "<br>": "\n"
                    }

                    var re = new RegExp(Object.keys(arr).join("|"), "gi");
                    str = str.replace(re, function(matched) {
                        return arr[matched];
                    });
                    console.log(str);
                    vm.inventoryGRNemailContent = str;
                    console.log(vm.inventoryGRNemailContent);
                } else {
                    vm.inventoryGRNbtnName = "Save";
                }

                    
                   }
                    else if(data[i].TemplateID == "T_EMAIL_PAYREMINDER_NEWMAIL"){

                    if (data[i].length !== 0) {
                        vm.paymentReminderbtnName = "Update";
                    } else {
                        vm.paymentReminderbtnName = "Save";
                    }
                   

                    vm.subject6 = data[i].Title;

                    if (data[i].length !== 0) {

                        var str = data[i].Body.toString();
                        console.log(str);
                        var arr = {
                            "<html>": "",
                            "</html>": "",
                            "<br>": "\n"
                        }

                        var re = new RegExp(Object.keys(arr).join("|"), "gi");
                        str = str.replace(re, function(matched) {
                            return arr[matched];
                        });
                        console.log(str);
                        vm.paymentReminderemailContent = str;
                        console.log(vm.paymentReminderemailContent);
                    } else {
                        vm.paymentReminderbtnName = "Save";
                    }
                    
                   }
                    else if(data[i].TemplateID == "T_EMAIL_EST_NEWMAIL"){

                        if (data[i].length !== 0) {
                            vm.estimatebtnName = "Update";
                        } else {
                            vm.estimatebtnName = "Save";
                        }

                        vm.subject7 = data[i].Title;

                        if (data[i].length !== 0) {

                            var str = data[i].Body.toString();
                            console.log(str);
                            var arr = {
                                "<html>": "",
                                "</html>": "",
                                "<br>": "\n"
                            }

                            var re = new RegExp(Object.keys(arr).join("|"), "gi");
                            str = str.replace(re, function(matched) {
                                return arr[matched];
                            });
                            console.log(str);
                            vm.estimateemailContent = str;
                            console.log(vm.estimateemailContent);
                        } else {
                            vm.estimatebtnName = "Save";
                        }
                    
                   }
                    else if(data[i].TemplateID == "T_EMAIL_CRN_NEWMAIL"){
                        if (data[i].length !== 0) {
                            vm.creditNotebtnName = "Update";
                        } else {
                            vm.creditNotebtnName = "Save";
                        }
                      

                        vm.subject8 = data[i].Title;

                        if (data[i].length !== 0) {

                            var str = data[i].Body.toString();
                            console.log(str);
                            var arr = {
                                "<html>": "",
                                "</html>": "",
                                "<br>": "\n"
                            }

                            var re = new RegExp(Object.keys(arr).join("|"), "gi");
                            str = str.replace(re, function(matched) {
                                return arr[matched];
                            });
                            console.log(str);
                            vm.creditNoteemailContent = str;
                            console.log(vm.creditNoteemailContent);
                        } else {
                            vm.creditNotebtnName = "Save";
                        }
                    
                    }
                    else if(data[i].TemplateID == "T_EMAIL_REC_NEWMAIL"){

                        if (data[i].length !== 0) {
                            vm.recurringProfilebtnName = "Update";
                        } else {
                            vm.recurringProfilebtnName = "Save";
                        }
                       

                        vm.subject9 = data[i].Title;

                        if (data[i].length !== 0) {

                            var str = data[i].Body.toString();
                            console.log(str);
                            var arr = {
                                "<html>": "",
                                "</html>": "",
                                "<br>": "\n"
                            }

                            var re = new RegExp(Object.keys(arr).join("|"), "gi");
                            str = str.replace(re, function(matched) {
                                return arr[matched];
                            });
                            console.log(str);
                            vm.recurringProfileemailContent = str;
                            console.log(vm.recurringProfileemailContent);
                        } else {
                            vm.recurringProfilebtnName = "Save";
                        }
                    
                   }
                    else if(data[i].TemplateID == "T_EMAIL_PROJECT_NEWMAIL"){

                        if (data[i].length !== 0) {
                            vm.projectbtnName = "Update";
                        } else {
                            vm.projectbtnName = "Save";
                        }
                    
                        vm.subject10 = data[i].Title;

                        if (data[i].length !== 0) {

                            var str = data[i].Body.toString();
                            console.log(str);
                            var arr = {
                                "<html>": "",
                                "</html>": "",
                                "<br>": "\n"
                            }

                            var re = new RegExp(Object.keys(arr).join("|"), "gi");
                            str = str.replace(re, function(matched) {
                                return arr[matched];
                            });
                            console.log(str);
                            vm.projectemailContent = str;
                            console.log(vm.projectemailContent);
                        } else {
                            vm.projectbtnName = "Save";
                        }
                    
                   }

                };
                vm.spinnerService.hide('setting-loadEmailTemplates-spinner');
            });

            client.ifError(function(data) {
                vm.spinnerService.hide('setting-loadEmailTemplates-spinner');
                console.log(data);

                // vm.invoicebtnName = "Save";
                var toast = $mdToast.simple().content('there was a error, when get all emails loading').action('OK').highlightAction(false).position("top right");
                $mdToast.show(toast).then(function() {});
            });
            client.getReq();
        }

        getAllTemplates();
        //getAllTemplate1();


        //START OF INVOICE EMAIL TEMPLATE....................................................................................
        // function emailInvoiceTemplate() {
        //     var apis = $apis.getApis();
        //     apis.ifSuccess(function(data) {

        //         if (data.length !== 0) {
        //             vm.invoicebtnName = "Update";
        //         } else {
        //             vm.invoicebtnName = "Save";
        //         }

        //         console.log(data.Body);
        //         console.log(data.Title);

        //         vm.subject = data.Title;

        //         if (data.length !== 0) {

        //             var str = data.Body.toString();
        //             console.log(str);
        //             var arr = {
        //                 "<html>": "",
        //                 "</html>": "",
        //                 "<br>": "\n"
        //             }

        //             var re = new RegExp(Object.keys(arr).join("|"), "gi");
        //             str = str.replace(re, function(matched) {
        //                 return arr[matched];
        //             });
        //             console.log(str);
        //             vm.invoiceemailContent = str;
        //             console.log(vm.invoiceemailContent);
        //         } else {
        //             vm.invoicebtnName = "Save";
        //         }
        //     });
        //     apis.ifError(function(data) {
        //         console.log(data)
        //         vm.invoicebtnName = "Save";
        //         var toast = $mdToast.simple().content('there was a error, when invoice email loading').action('OK').highlightAction(false).position("top right");
        //         $mdToast.show(toast).then(function() {});
        //     });
        //     apis.getTemplate('getTemplate', 'T_EMAIL_INV_NEWMAIL');
        // }
        // emailInvoiceTemplate();

        vm.invoiceSubmit = invoiceSubmit;

        function invoiceSubmit() {

            var apis = $apis.getApis();
            apis.ifSuccess(function(data) {
                if (data.length !== 0) {
                    vm.uEmailTemplateMeata = {};
                    vm.uEmailTemplateMeata.TemplateID = "T_EMAIL_INV_NEWMAIL";
                    vm.uEmailTemplateMeata.description = "Invoice parameters";
                    vm.uEmailTemplateMeata.param = "[@@invoiceNo@@, @@companyName@@, @@accountUrl@@, @@customerName@@, @@currency@@, @@amount@@]";

                    var apis = $apis.getApis();
                    apis.ifSuccess(function(data) {

                    });
                    apis.ifError(function(data) {
                        var toast = $mdToast.simple().content('there was a error, when invoice saving').action('OK').highlightAction(false).position("top right");
                        $mdToast.show(toast).then(function() {});
                    });
                    apis.sendTemplate('updateTemplateMeta', vm.uEmailTemplateMeata);

                    console.log(vm.invoiceemailContent);

                    vm.emailContent1 = vm.invoiceemailContent.replace(/(\r\n|\n|\r)/gm, "<br>");
                    console.log(vm.emailContent1);

                    var str3 = "<html>" + vm.emailContent1 + "</html>";
                    console.log(str3);

                    //set template data
                    vm.UemailTemplate = {};
                    vm.UemailTemplate.TemplateID = "T_EMAIL_INV_NEWMAIL";
                    vm.UemailTemplate.Title = vm.subject;
                    vm.UemailTemplate.Owner = "12thdoor";
                    vm.UemailTemplate.Body = str3;

                    var apis = $apis.getApis();
                    apis.ifSuccess(function(data) {
                        var toast = $mdToast.simple().content('Invoice email successfully updated').action('OK').highlightAction(false).position("top right");
                        $mdToast.show(toast).then(function() {});
                        vm.invoicebtnName = "Update";
                    });
                    apis.ifError(function(data) {
                        var toast = $mdToast.simple().content('there was a error, when invoice saving').action('OK').highlightAction(false).position("top right");
                        $mdToast.show(toast).then(function() {});
                    });
                    apis.sendTemplate('updateTemplate', vm.UemailTemplate);
                } else {

                    //				vm.emailTemplateMeata={};
                    //				vm.emailTemplateMeata.TemplateID="T_EMAIL_INV_NEWMAIL";
                    //				vm.emailTemplateMeata.description="Invoice param";
                    //				vm.emailTemplateMeata.param="[@@no@@,@@companyName@@,@@accounturl@@,@@customer@@]" ;
                    //
                    //				var apis = $apis.getApis();
                    //				apis.ifSuccess(function(data){
                    //
                    //				});
                    //				apis.ifError(function(data){
                    //					var toast = $mdToast.simple().content('there was a error, when invoice saving').action('OK').highlightAction(false).position("top right");
                    //					$mdToast.show(toast).then(function() {});
                    //				});
                    //				apis.sendTemplate('setTemplateMeta',vm.emailTemplateMeata);

                    console.log(vm.invoiceemailContent);

                    vm.emailContent1 = vm.invoiceemailContent.replace(/(\r\n|\n|\r)/gm, "<br>");
                    console.log(vm.emailContent1);

                    var str3 = "<html>" + vm.emailContent1 + "</html>";
                    console.log(str3);

                    //set template data
                    vm.emailTemplate = {};
                    vm.emailTemplate.TemplateID = "T_EMAIL_INV_NEWMAIL";
                    vm.emailTemplate.Title = vm.subject;
                    vm.emailTemplate.Owner = "12thdoor";
                    vm.emailTemplate.Body = str3;

                    var apis = $apis.getApis();
                    apis.ifSuccess(function(data) {
                        var toast = $mdToast.simple().content('Invoice email successfully saved').action('OK').highlightAction(false).position("top right");
                        $mdToast.show(toast).then(function() {});
                        vm.invoicebtnName = "Update";
                    });
                    apis.ifError(function(data) {
                        var toast = $mdToast.simple().content('there was a error, when invoice email updating').action('OK').highlightAction(false).position("top right");
                        $mdToast.show(toast).then(function() {});
                    });
                    apis.sendTemplate('setTemplate', vm.emailTemplate);
                }


            });
            apis.ifError(function(data) {
                var toast = $mdToast.simple().content('there was a error').action('OK').highlightAction(false).position("top right");
                $mdToast.show(toast).then(function() {});
            });

            apis.getTemplate('getTemplate', 'T_EMAIL_INV_NEWMAIL');
        }
        //END OF INVOICE EMAIL TEMPLATE...............................................................

        //START OF CONTACT EMAIL TEMPLATE.............................................................
        // function emailContactTemplate() {
        //     var apis = $apis.getApis();
        //     apis.ifSuccess(function(data) {

        //         if (data.length !== 0) {
        //             vm.contactbtnName = "Update";
        //         } else {
        //             vm.contactbtnName = "Save";
        //         }
        //         console.log(data.Body);
        //         console.log(data.Title);

        //         vm.subject1 = data.Title;

        //         if (data.length !== 0) {

        //             var str = data.Body.toString();
        //             console.log(str);
        //             var arr = {
        //                 "<html>": "",
        //                 "</html>": "",
        //                 "<br>": "\n"
        //             }

        //             var re = new RegExp(Object.keys(arr).join("|"), "gi");
        //             str = str.replace(re, function(matched) {
        //                 return arr[matched];
        //             });
        //             console.log(str);
        //             vm.contactemailContent = str;
        //             console.log(vm.contactemailContent);
        //         } else {
        //             vm.contactbtnName = "Save";
        //         }
        //     });
        //     apis.ifError(function(data) {
        //         console.log(data)
        //         vm.contactbtnName = "Save";
        //         var toast = $mdToast.simple().content('there was a error, when contact email loading').action('OK').highlightAction(false).position("top right");
        //         $mdToast.show(toast).then(function() {});
        //     });
        //     apis.getTemplate('getTemplate', 'T_EMAIL_CNT_NEWMAIL');
        // }
        // emailContactTemplate();

        vm.contactSubmit = contactSubmit;

        function contactSubmit() {

            var apis = $apis.getApis();
            apis.ifSuccess(function(data) {
                if (data.length !== 0) {
                    vm.uEmailTemplateMeata = {};
                    vm.uEmailTemplateMeata.TemplateID = "T_EMAIL_CNT_NEWMAIL";
                    vm.uEmailTemplateMeata.description = "Contact parameters";
                    vm.uEmailTemplateMeata.param = "[@@customerName@@, @@companyName@@]";

                    var apis = $apis.getApis();
                    apis.ifSuccess(function(data) {

                    });
                    apis.ifError(function(data) {
                        var toast = $mdToast.simple().content('there was a error, when contact saving').action('OK').highlightAction(false).position("top right");
                        $mdToast.show(toast).then(function() {});
                    });
                    apis.sendTemplate('updateTemplateMeta', vm.uEmailTemplateMeata);

                    console.log(vm.contactemailContent);

                    vm.emailContent1 = vm.contactemailContent.replace(/(\r\n|\n|\r)/gm, "<br>");
                    console.log(vm.emailContent1);

                    var str3 = "<html>" + vm.emailContent1 + "</html>";
                    console.log(str3);

                    //set template data
                    vm.UemailTemplate = {};
                    vm.UemailTemplate.TemplateID = "T_EMAIL_CNT_NEWMAIL";
                    vm.UemailTemplate.Title = vm.subject1;
                    vm.UemailTemplate.Owner = "12thdoor";
                    vm.UemailTemplate.Body = str3;

                    var apis = $apis.getApis();
                    apis.ifSuccess(function(data) {
                        var toast = $mdToast.simple().content('Contact email successfully updated').action('OK').highlightAction(false).position("top right");
                        $mdToast.show(toast).then(function() {});
                        vm.contactbtnName = "Update";
                    });
                    apis.ifError(function(data) {
                        var toast = $mdToast.simple().content('there was a error, when contact updating').action('OK').highlightAction(false).position("top right");
                        $mdToast.show(toast).then(function() {});
                    });
                    apis.sendTemplate('updateTemplate', vm.UemailTemplate);
                } else {

                    //				vm.emailTemplateMeata={};
                    //				vm.emailTemplateMeata.TemplateID="T_EMAIL_CNT_NEWMAIL";
                    //				vm.emailTemplateMeata.description="Invoice param";
                    //				vm.emailTemplateMeata.param="[@@no@@,@@companyName@@,@@accounturl@@,@@customer@@]" ;
                    //
                    //				var apis = $apis.getApis();
                    //				apis.ifSuccess(function(data){
                    //
                    //				});
                    //				apis.ifError(function(data){
                    //					var toast = $mdToast.simple().content('there was a error, when contact saving').action('OK').highlightAction(false).position("top right");
                    //					$mdToast.show(toast).then(function() {});
                    //				});
                    //				apis.sendTemplate('setTemplateMeta',vm.emailTemplateMeata);

                    console.log(vm.contactemailContent);

                    vm.emailContent1 = vm.contactemailContent.replace(/(\r\n|\n|\r)/gm, "<br>");
                    console.log(vm.emailContent1);

                    var str3 = "<html>" + vm.emailContent1 + "</html>";
                    console.log(str3);

                    //set template data
                    vm.emailTemplate = {};
                    vm.emailTemplate.TemplateID = "T_EMAIL_CNT_NEWMAIL";
                    vm.emailTemplate.Title = vm.subject1;
                    vm.emailTemplate.Owner = "12thdoor";
                    vm.emailTemplate.Body = str3;

                    var apis = $apis.getApis();
                    apis.ifSuccess(function(data) {
                        var toast = $mdToast.simple().content('Contact email successfully saved').action('OK').highlightAction(false).position("top right");
                        $mdToast.show(toast).then(function() {});
                        vm.contactbtnName = "Update";
                    });
                    apis.ifError(function(data) {
                        var toast = $mdToast.simple().content('there was a error, when contact email saving').action('OK').highlightAction(false).position("top right");
                        $mdToast.show(toast).then(function() {});
                    });
                    apis.sendTemplate('setTemplate', vm.emailTemplate);
                }


            });
            apis.ifError(function(data) {
                var toast = $mdToast.simple().content('there was a error').action('OK').highlightAction(false).position("top right");
                $mdToast.show(toast).then(function() {});
            });

            apis.getTemplate('getTemplate', 'T_EMAIL_CNT_NEWMAIL');
        }
        //END OF CONTACT EMAIL TEMPLATE...............................................................

        //START OF PAYMENT EMAIL TEMPLATE...............................................................
        // function emailPaymentTemplate() {
        //     var apis = $apis.getApis();
        //     apis.ifSuccess(function(data) {

        //         if (data.length !== 0) {
        //             vm.paymentbtnName = "Update";
        //         } else {
        //             vm.paymentbtnName = "Save";
        //         }
        //         console.log(data.Body);
        //         console.log(data.Title);

        //         vm.subject2 = data.Title;

        //         if (data.length !== 0) {

        //             var str = data.Body.toString();
        //             console.log(str);
        //             var arr = {
        //                 "<html>": "",
        //                 "</html>": "",
        //                 "<br>": "\n"
        //             }

        //             var re = new RegExp(Object.keys(arr).join("|"), "gi");
        //             str = str.replace(re, function(matched) {
        //                 return arr[matched];
        //             });
        //             console.log(str);
        //             vm.paymentemailContent = str;
        //             console.log(vm.paymentemailContent);
        //         } else {
        //             vm.paymentbtnName = "Save";
        //         }
        //     });
        //     apis.ifError(function(data) {
        //         console.log(data)
        //         vm.paymentbtnName = "Save";
        //         var toast = $mdToast.simple().content('there was a error, when payment email loading').action('OK').highlightAction(false).position("top right");
        //         $mdToast.show(toast).then(function() {});
        //     });
        //     apis.getTemplate('getTemplate', 'T_EMAIL_PAY_NEWMAIL');
        // }
        // emailPaymentTemplate();

        vm.paymentSubmit = paymentSubmit;

        function paymentSubmit() {

            var apis = $apis.getApis();
            apis.ifSuccess(function(data) {
                if (data.length !== 0) {
                    vm.uEmailTemplateMeata = {};
                    vm.uEmailTemplateMeata.TemplateID = "T_EMAIL_PAY_NEWMAIL";
                    vm.uEmailTemplateMeata.description = "payment parameters";
                    vm.uEmailTemplateMeata.param = "[@@paymentNo@@, @@companyName@@, @@customerName@@, @@accountUrl@@, @@currency@@, @@amount@@]";

                    var apis = $apis.getApis();
                    apis.ifSuccess(function(data) {

                    });
                    apis.ifError(function(data) {
                        var toast = $mdToast.simple().content('there was a error, when payment saving').action('OK').highlightAction(false).position("top right");
                        $mdToast.show(toast).then(function() {});
                    });
                    apis.sendTemplate('updateTemplateMeta', vm.uEmailTemplateMeata);

                    console.log(vm.paymentemailContent);

                    vm.emailContent1 = vm.paymentemailContent.replace(/(\r\n|\n|\r)/gm, "<br>");
                    console.log(vm.emailContent1);

                    var str3 = "<html>" + vm.emailContent1 + "</html>";
                    console.log(str3);

                    //set template data
                    vm.UemailTemplate = {};
                    vm.UemailTemplate.TemplateID = "T_EMAIL_PAY_NEWMAIL";
                    vm.UemailTemplate.Title = vm.subject2;
                    vm.UemailTemplate.Owner = "12thdoor";
                    vm.UemailTemplate.Body = str3;

                    var apis = $apis.getApis();
                    apis.ifSuccess(function(data) {
                        var toast = $mdToast.simple().content('Payment email successfully updated').action('OK').highlightAction(false).position("top right");
                        $mdToast.show(toast).then(function() {});
                        vm.paymentbtnName = "Update";
                    });
                    apis.ifError(function(data) {
                        var toast = $mdToast.simple().content('there was a error, when payment updating').action('OK').highlightAction(false).position("top right");
                        $mdToast.show(toast).then(function() {});
                    });
                    apis.sendTemplate('updateTemplate', vm.UemailTemplate);
                } else {

                    //				vm.emailTemplateMeata={};
                    //				vm.emailTemplateMeata.TemplateID="T_EMAIL_PAY_NEWMAIL";
                    //				vm.emailTemplateMeata.description="Invoice param";
                    //				vm.emailTemplateMeata.param="[@@no@@,@@companyName@@,@@accounturl@@,@@customer@@]" ;
                    //
                    //				var apis = $apis.getApis();
                    //				apis.ifSuccess(function(data){
                    //
                    //				});
                    //				apis.ifError(function(data){
                    //					var toast = $mdToast.simple().content('there was a error, when payment saving').action('OK').highlightAction(false).position("top right");
                    //					$mdToast.show(toast).then(function() {});
                    //				});
                    //				apis.sendTemplate('setTemplateMeta',vm.emailTemplateMeata);

                    console.log(vm.paymentemailContent);

                    vm.emailContent1 = vm.paymentemailContent.replace(/(\r\n|\n|\r)/gm, "<br>");
                    console.log(vm.emailContent1);

                    var str3 = "<html>" + vm.emailContent1 + "</html>";
                    console.log(str3);

                    //set template data
                    vm.emailTemplate = {};
                    vm.emailTemplate.TemplateID = "T_EMAIL_PAY_NEWMAIL";
                    vm.emailTemplate.Title = vm.subject2;
                    vm.emailTemplate.Owner = "12thdoor";
                    vm.emailTemplate.Body = str3;

                    var apis = $apis.getApis();
                    apis.ifSuccess(function(data) {
                        var toast = $mdToast.simple().content('Payment email successfully saved').action('OK').highlightAction(false).position("top right");
                        $mdToast.show(toast).then(function() {});
                        vm.paymentbtnName = "Update";
                    });
                    apis.ifError(function(data) {
                        var toast = $mdToast.simple().content('there was a error, when payment email saving').action('OK').highlightAction(false).position("top right");
                        $mdToast.show(toast).then(function() {});
                    });
                    apis.sendTemplate('setTemplate', vm.emailTemplate);
                }


            });
            apis.ifError(function(data) {
                var toast = $mdToast.simple().content('there was a error').action('OK').highlightAction(false).position("top right");
                $mdToast.show(toast).then(function() {});
            });

            apis.getTemplate('getTemplate', 'T_EMAIL_PAY_NEWMAIL');
        }
        //END OF PAYMENT EMAIL TEMPLATE...............................................................

        //START OF PRODUCT EMAIL TEMPLATE...............................................................
        // function emailProductTemplate() {
        //     var apis = $apis.getApis();
        //     apis.ifSuccess(function(data) {

        //         if (data.length !== 0) {
        //             vm.productbtnName = "Update";
        //         } else {
        //             vm.productbtnName = "Save";
        //         }
        //         console.log(data.Body);
        //         console.log(data.Title);

        //         vm.subject3 = data.Title;

        //         if (data.length !== 0) {

        //             var str = data.Body.toString();
        //             console.log(str);
        //             var arr = {
        //                 "<html>": "",
        //                 "</html>": "",
        //                 "<br>": "\n"
        //             }

        //             var re = new RegExp(Object.keys(arr).join("|"), "gi");
        //             str = str.replace(re, function(matched) {
        //                 return arr[matched];
        //             });
        //             console.log(str);
        //             vm.productemailContent = str;
        //             console.log(vm.productemailContent);
        //         } else {
        //             vm.productbtnName = "Save";
        //         }
        //     });
        //     apis.ifError(function(data) {
        //         console.log(data)
        //         vm.productbtnName = "Save";
        //         var toast = $mdToast.simple().content('there was a error, when product email loading').action('OK').highlightAction(false).position("top right");
        //         $mdToast.show(toast).then(function() {});
        //     });
        //     apis.getTemplate('getTemplate', 'T_EMAIL_PRO_NEWMAIL');
        // }
        // emailProductTemplate();

        vm.productSubmit = productSubmit;

        function productSubmit() {

            var apis = $apis.getApis();
            apis.ifSuccess(function(data) {
                if (data.length !== 0) {
                    vm.uEmailTemplateMeata = {};
                    vm.uEmailTemplateMeata.TemplateID = "T_EMAIL_PRO_NEWMAIL";
                    vm.uEmailTemplateMeata.description = "Product parameters";
                    vm.uEmailTemplateMeata.param = "[@@productIcon@@, @@productName@@, @@productCode@@, @@productPrice@@, @@companyName@@, @@accountUrl@@, @@customerName@@]";

                    var apis = $apis.getApis();
                    apis.ifSuccess(function(data) {

                    });
                    apis.ifError(function(data) {
                        var toast = $mdToast.simple().content('there was a error, when product saving').action('OK').highlightAction(false).position("top right");
                        $mdToast.show(toast).then(function() {});
                    });
                    apis.sendTemplate('updateTemplateMeta', vm.uEmailTemplateMeata);

                    console.log(vm.productemailContent);

                    vm.emailContent1 = vm.productemailContent.replace(/(\r\n|\n|\r)/gm, "<br>");
                    console.log(vm.emailContent1);

                    var str3 = "<html>" + vm.emailContent1 + "</html>";
                    console.log(str3);

                    //set template data
                    vm.UemailTemplate = {};
                    vm.UemailTemplate.TemplateID = "T_EMAIL_PRO_NEWMAIL";
                    vm.UemailTemplate.Title = vm.subject3;
                    vm.UemailTemplate.Owner = "12thdoor";
                    vm.UemailTemplate.Body = str3;

                    var apis = $apis.getApis();
                    apis.ifSuccess(function(data) {
                        var toast = $mdToast.simple().content('Product email successfully updated').action('OK').highlightAction(false).position("top right");
                        $mdToast.show(toast).then(function() {});
                        vm.productbtnName = "Update";
                    });
                    apis.ifError(function(data) {
                        var toast = $mdToast.simple().content('there was a error, when product updating').action('OK').highlightAction(false).position("top right");
                        $mdToast.show(toast).then(function() {});
                    });
                    apis.sendTemplate('updateTemplate', vm.UemailTemplate);
                } else {

                    //				vm.emailTemplateMeata={};
                    //				vm.emailTemplateMeata.TemplateID="T_EMAIL_PRO_NEWMAIL";
                    //				vm.emailTemplateMeata.description="Product param";
                    //				vm.emailTemplateMeata.param="[@@no@@,@@companyName@@,@@accounturl@@,@@customer@@]" ;
                    //
                    //				var apis = $apis.getApis();
                    //				apis.ifSuccess(function(data){
                    //
                    //				});
                    //				apis.ifError(function(data){
                    //					var toast = $mdToast.simple().content('there was a error, when payment saving').action('OK').highlightAction(false).position("top right");
                    //					$mdToast.show(toast).then(function() {});
                    //				});
                    //				apis.sendTemplate('setTemplateMeta',vm.emailTemplateMeata);

                    console.log(vm.productemailContent);

                    vm.emailContent1 = vm.productemailContent.replace(/(\r\n|\n|\r)/gm, "<br>");
                    console.log(vm.emailContent1);

                    var str3 = "<html>" + vm.emailContent1 + "</html>";
                    console.log(str3);

                    //set template data
                    vm.emailTemplate = {};
                    vm.emailTemplate.TemplateID = "T_EMAIL_PRO_NEWMAIL";
                    vm.emailTemplate.Title = vm.subject3;
                    vm.emailTemplate.Owner = "12thdoor";
                    vm.emailTemplate.Body = str3;

                    var apis = $apis.getApis();
                    apis.ifSuccess(function(data) {
                        var toast = $mdToast.simple().content('Product email successfully saved').action('OK').highlightAction(false).position("top right");
                        $mdToast.show(toast).then(function() {});
                        vm.productbtnName = "Update";
                    });
                    apis.ifError(function(data) {
                        var toast = $mdToast.simple().content('there was a error, when product email saving').action('OK').highlightAction(false).position("top right");
                        $mdToast.show(toast).then(function() {});
                    });
                    apis.sendTemplate('setTemplate', vm.emailTemplate);
                }


            });
            apis.ifError(function(data) {
                var toast = $mdToast.simple().content('there was a error').action('OK').highlightAction(false).position("top right");
                $mdToast.show(toast).then(function() {});
            });

            apis.getTemplate('getTemplate', 'T_EMAIL_PRO_NEWMAIL');
        }
        //END OF PRODUCT EMAIL TEMPLATE...............................................................

        //START OF EXPENSE EMAIL TEMPLATE............................................................
        // function emailExpenseTemplate() {
        //     var apis = $apis.getApis();
        //     apis.ifSuccess(function(data) {

        //         if (data.length !== 0) {
        //             vm.expensebtnName = "Update";
        //         } else {
        //             vm.expensebtnName = "Save";
        //         }
        //         console.log(data.Body);
        //         console.log(data.Title);

        //         vm.subject4 = data.Title;

        //         if (data.length !== 0) {

        //             var str = data.Body.toString();
        //             console.log(str);
        //             var arr = {
        //                 "<html>": "",
        //                 "</html>": "",
        //                 "<br>": "\n"
        //             }

        //             var re = new RegExp(Object.keys(arr).join("|"), "gi");
        //             str = str.replace(re, function(matched) {
        //                 return arr[matched];
        //             });
        //             console.log(str);
        //             vm.expenseemailContent = str;
        //             console.log(vm.expenseemailContent);
        //         } else {
        //             vm.expensebtnName = "Save";
        //         }
        //     });
        //     apis.ifError(function(data) {
        //         console.log(data)
        //         vm.expensebtnName = "Save";
        //         var toast = $mdToast.simple().content('there was a error, when expense email loading').action('OK').highlightAction(false).position("top right");
        //         $mdToast.show(toast).then(function() {});
        //     });
        //     apis.getTemplate('getTemplate', 'T_EMAIL_EXP_NEWMAIL');
        // }
        // emailExpenseTemplate();

        vm.expenseSubmit = expenseSubmit;

        function expenseSubmit() {

            var apis = $apis.getApis();
            apis.ifSuccess(function(data) {
                if (data.length !== 0) {
                    vm.uEmailTemplateMeata = {};
                    vm.uEmailTemplateMeata.TemplateID = "T_EMAIL_EXP_NEWMAIL";
                    vm.uEmailTemplateMeata.description = "Expense parameters";
                    vm.uEmailTemplateMeata.param = "[@@customerName@@, @@companyName@@, @@expenseNo@@]";

                    var apis = $apis.getApis();
                    apis.ifSuccess(function(data) {

                    });
                    apis.ifError(function(data) {
                        var toast = $mdToast.simple().content('there was a error, when expense saving').action('OK').highlightAction(false).position("top right");
                        $mdToast.show(toast).then(function() {});
                    });
                    apis.sendTemplate('updateTemplateMeta', vm.uEmailTemplateMeata);

                    console.log(vm.expenseemailContent);

                    vm.emailContent1 = vm.expenseemailContent.replace(/(\r\n|\n|\r)/gm, "<br>");
                    console.log(vm.emailContent1);

                    var str3 = "<html>" + vm.emailContent1 + "</html>";
                    console.log(str3);

                    //set template data
                    vm.UemailTemplate = {};
                    vm.UemailTemplate.TemplateID = "T_EMAIL_EXP_NEWMAIL";
                    vm.UemailTemplate.Title = vm.subject4;
                    vm.UemailTemplate.Owner = "12thdoor";
                    vm.UemailTemplate.Body = str3;

                    var apis = $apis.getApis();
                    apis.ifSuccess(function(data) {
                        var toast = $mdToast.simple().content('Expense email successfully updated').action('OK').highlightAction(false).position("top right");
                        $mdToast.show(toast).then(function() {});
                        vm.expensebtnName = "Update";
                    });
                    apis.ifError(function(data) {
                        var toast = $mdToast.simple().content('there was a error, when expense saving').action('OK').highlightAction(false).position("top right");
                        $mdToast.show(toast).then(function() {});
                    });
                    apis.sendTemplate('updateTemplate', vm.UemailTemplate);
                } else {

                    //				vm.emailTemplateMeata={};
                    //				vm.emailTemplateMeata.TemplateID="T_EMAIL_EXP_NEWMAIL";
                    //				vm.emailTemplateMeata.description="Expense param";
                    //				vm.emailTemplateMeata.param="[@@no@@,@@companyName@@,@@accounturl@@,@@customer@@]" ;
                    //
                    //				var apis = $apis.getApis();
                    //				apis.ifSuccess(function(data){
                    //
                    //				});
                    //				apis.ifError(function(data){
                    //					var toast = $mdToast.simple().content('there was a error, when expense saving').action('OK').highlightAction(false).position("top right");
                    //					$mdToast.show(toast).then(function() {});
                    //				});
                    //				apis.sendTemplate('setTemplateMeta',vm.emailTemplateMeata);

                    console.log(vm.expenseemailContent);

                    vm.emailContent1 = vm.expenseemailContent.replace(/(\r\n|\n|\r)/gm, "<br>");
                    console.log(vm.emailContent1);

                    var str3 = "<html>" + vm.emailContent1 + "</html>";
                    console.log(str3);

                    //set template data
                    vm.emailTemplate = {};
                    vm.emailTemplate.TemplateID = "T_EMAIL_EXP_NEWMAIL";
                    vm.emailTemplate.Title = vm.subject4;
                    vm.emailTemplate.Owner = "12thdoor";
                    vm.emailTemplate.Body = str3;

                    var apis = $apis.getApis();
                    apis.ifSuccess(function(data) {
                        var toast = $mdToast.simple().content('Expense email successfully saved').action('OK').highlightAction(false).position("top right");
                        $mdToast.show(toast).then(function() {});
                        vm.expensebtnName = "Update";
                    });
                    apis.ifError(function(data) {
                        var toast = $mdToast.simple().content('there was a error, when expense email updating').action('OK').highlightAction(false).position("top right");
                        $mdToast.show(toast).then(function() {});
                    });
                    apis.sendTemplate('setTemplate', vm.emailTemplate);
                }


            });
            apis.ifError(function(data) {
                var toast = $mdToast.simple().content('there was a error').action('OK').highlightAction(false).position("top right");
                $mdToast.show(toast).then(function() {});
            });

            apis.getTemplate('getTemplate', 'T_EMAIL_EXP_NEWMAIL');
        }
        //END OF EXPENSE EMAIL TEMPLATE...............................................................

        //START OF INVENTORY GIN EMAIL TEMPLATE....................................................................................
        // function emailInventoryGINTemplate() {
        //     var apis = $apis.getApis();
        //     apis.ifSuccess(function(data) {

        //         if (data.length !== 0) {
        //             vm.inventoryGINbtnName = "Update";
        //         } else {
        //             vm.inventoryGINbtnName = "Save";
        //         }
        //         console.log(data.Body);
        //         console.log(data.Title);

        //         vm.subjectGIN = data.Title;

        //         if (data.length !== 0) {

        //             var str = data.Body.toString();
        //             console.log(str);
        //             var arr = {
        //                 "<html>": "",
        //                 "</html>": "",
        //                 "<br>": "\n"
        //             }

        //             var re = new RegExp(Object.keys(arr).join("|"), "gi");
        //             str = str.replace(re, function(matched) {
        //                 return arr[matched];
        //             });
        //             console.log(str);
        //             vm.inventoryGINemailContent = str;
        //             console.log(vm.inventoryGINemailContent);
        //         } else {
        //             vm.inventoryGINbtnName = "Save";
        //         }
        //     });
        //     apis.ifError(function(data) {
        //         console.log(data)
        //         vm.inventoryGINbtnName = "Save";
        //         var toast = $mdToast.simple().content('there was a error, when GIN email loading').action('OK').highlightAction(false).position("top right");
        //         $mdToast.show(toast).then(function() {});
        //     });
        //     apis.getTemplate('getTemplate', 'T_EMAIL_INVENTORY_GIN_NEWMAIL');
        // }
        // emailInventoryGINTemplate();

        vm.inventoryGINSubmit = inventoryGINSubmit;

        function inventoryGINSubmit() {

            var apis = $apis.getApis();
            apis.ifSuccess(function(data) {
                if (data.length !== 0) {
                    vm.uEmailTemplateMeata = {};
                    vm.uEmailTemplateMeata.TemplateID = "T_EMAIL_INVENTORY_GIN_NEWMAIL";
                    vm.uEmailTemplateMeata.description = "Goods Issue Note (GIN) parameters";
                    vm.uEmailTemplateMeata.param = "[@@GINNo@@, @@companyName@@, @@customerName@@]";

                    var apis = $apis.getApis();
                    apis.ifSuccess(function(data) {

                    });
                    apis.ifError(function(data) {
                        var toast = $mdToast.simple().content('there was a error, when GIN saving').action('OK').highlightAction(false).position("top right");
                        $mdToast.show(toast).then(function() {});
                    });
                    apis.sendTemplate('updateTemplateMeta', vm.uEmailTemplateMeata);

                    console.log(vm.inventoryGINemailContent);

                    vm.emailContent1 = vm.inventoryGINemailContent.replace(/(\r\n|\n|\r)/gm, "<br>");
                    console.log(vm.emailContent1);

                    var str3 = "<html>" + vm.emailContent1 + "</html>";
                    console.log(str3);

                    //set template data
                    vm.UemailTemplate = {};
                    vm.UemailTemplate.TemplateID = "T_EMAIL_INVENTORY_GIN_NEWMAIL";
                    vm.UemailTemplate.Title = vm.subjectGIN;
                    vm.UemailTemplate.Owner = "12thdoor";
                    vm.UemailTemplate.Body = str3;

                    var apis = $apis.getApis();
                    apis.ifSuccess(function(data) {
                        var toast = $mdToast.simple().content('GIN email successfully updated').action('OK').highlightAction(false).position("top right");
                        $mdToast.show(toast).then(function() {});
                        vm.inventoryGINbtnName = "Update";
                    });
                    apis.ifError(function(data) {
                        var toast = $mdToast.simple().content('there was a error, when GIN saving').action('OK').highlightAction(false).position("top right");
                        $mdToast.show(toast).then(function() {});
                    });
                    apis.sendTemplate('updateTemplate', vm.UemailTemplate);
                } else {

                    //				vm.emailTemplateMeata={};
                    //				vm.emailTemplateMeata.TemplateID="T_EMAIL_INVENTORY_NEWMAIL";
                    //				vm.emailTemplateMeata.description="Inventory param";
                    //				vm.emailTemplateMeata.param="[@@no@@,@@companyName@@,@@accounturl@@,@@customer@@]" ;
                    //
                    //				var apis = $apis.getApis();
                    //				apis.ifSuccess(function(data){
                    //
                    //				});
                    //				apis.ifError(function(data){
                    //					var toast = $mdToast.simple().content('there was a error, when inventory saving').action('OK').highlightAction(false).position("top right");
                    //					$mdToast.show(toast).then(function() {});
                    //				});
                    //				apis.sendTemplate('setTemplateMeta',vm.emailTemplateMeata);

                    console.log(vm.inventoryGINemailContent);

                    vm.emailContent1 = vm.inventoryGINemailContent.replace(/(\r\n|\n|\r)/gm, "<br>");
                    console.log(vm.emailContent1);

                    var str3 = "<html>" + vm.emailContent1 + "</html>";
                    console.log(str3);

                    //set template data
                    vm.emailTemplate = {};
                    vm.emailTemplate.TemplateID = "T_EMAIL_INVENTORY_GIN_NEWMAIL";
                    vm.emailTemplate.Title = vm.subjectGIN;
                    vm.emailTemplate.Owner = "12thdoor";
                    vm.emailTemplate.Body = str3;

                    var apis = $apis.getApis();
                    apis.ifSuccess(function(data) {
                        var toast = $mdToast.simple().content('GIN email successfully saved').action('OK').highlightAction(false).position("top right");
                        $mdToast.show(toast).then(function() {});
                        vm.inventoryGINbtnName = "Update";
                    });
                    apis.ifError(function(data) {
                        var toast = $mdToast.simple().content('there was a error, when GIN email updating').action('OK').highlightAction(false).position("top right");
                        $mdToast.show(toast).then(function() {});
                    });
                    apis.sendTemplate('setTemplate', vm.emailTemplate);
                }


            });
            apis.ifError(function(data) {
                var toast = $mdToast.simple().content('there was a error').action('OK').highlightAction(false).position("top right");
                $mdToast.show(toast).then(function() {});
            });

            apis.getTemplate('getTemplate', 'T_EMAIL_INVENTORY_GIN_NEWMAIL');
        }
        //END OF INVENTORY GIN EMAIL TEMPLATE...............................................................  

        //START OF INVENTORY GRN EMAIL TEMPLATE....................................................................................
        // function emailInventoryGRNTemplate() {
        //     var apis = $apis.getApis();
        //     apis.ifSuccess(function(data) {

        //         if (data.length !== 0) {
        //             vm.inventoryGRNbtnName = "Update";
        //         } else {
        //             vm.inventoryGRNbtnName = "Save";
        //         }
        //         console.log(data.Body);
        //         console.log(data.Title);

        //         vm.subjectGIN = data.Title;

        //         if (data.length !== 0) {

        //             var str = data.Body.toString();
        //             console.log(str);
        //             var arr = {
        //                 "<html>": "",
        //                 "</html>": "",
        //                 "<br>": "\n"
        //             }

        //             var re = new RegExp(Object.keys(arr).join("|"), "gi");
        //             str = str.replace(re, function(matched) {
        //                 return arr[matched];
        //             });
        //             console.log(str);
        //             vm.inventoryGRNemailContent = str;
        //             console.log(vm.inventoryGRNemailContent);
        //         } else {
        //             vm.inventoryGRNbtnName = "Save";
        //         }
        //     });
        //     apis.ifError(function(data) {
        //         console.log(data)
        //         vm.inventoryGINbtnName = "Save";
        //         var toast = $mdToast.simple().content('there was a error, when GIN email loading').action('OK').highlightAction(false).position("top right");
        //         $mdToast.show(toast).then(function() {});
        //     });
        //     apis.getTemplate('getTemplate', 'T_EMAIL_INVENTORY_GRN_NEWMAIL');
        // }
        // emailInventoryGRNTemplate();

        vm.inventoryGRNSubmit = inventoryGRNSubmit;

        function inventoryGRNSubmit() {

            var apis = $apis.getApis();
            apis.ifSuccess(function(data) {
                if (data.length !== 0) {
                    vm.uEmailTemplateMeata = {};
                    vm.uEmailTemplateMeata.TemplateID = "T_EMAIL_INVENTORY_GRN_NEWMAIL";
                    vm.uEmailTemplateMeata.description = "Goods Received Note (GRN) parameters";
                    vm.uEmailTemplateMeata.param = "[@@GRNNo@@, @@companyName@@, @@SupplierName@@]";

                    var apis = $apis.getApis();
                    apis.ifSuccess(function(data) {

                    });
                    apis.ifError(function(data) {
                        var toast = $mdToast.simple().content('there was a error, when GRN saving').action('OK').highlightAction(false).position("top right");
                        $mdToast.show(toast).then(function() {});
                    });
                    apis.sendTemplate('updateTemplateMeta', vm.uEmailTemplateMeata);

                    console.log(vm.inventoryGRNemailContent);

                    vm.emailContent1 = vm.inventoryGRNemailContent.replace(/(\r\n|\n|\r)/gm, "<br>");
                    console.log(vm.emailContent1);

                    var str3 = "<html>" + vm.emailContent1 + "</html>";
                    console.log(str3);

                    //set template data
                    vm.UemailTemplate = {};
                    vm.UemailTemplate.TemplateID = "T_EMAIL_INVENTORY_GRN_NEWMAIL";
                    vm.UemailTemplate.Title = vm.subjectGRN;
                    vm.UemailTemplate.Owner = "12thdoor";
                    vm.UemailTemplate.Body = str3;

                    var apis = $apis.getApis();
                    apis.ifSuccess(function(data) {
                        var toast = $mdToast.simple().content('GRN email successfully updated').action('OK').highlightAction(false).position("top right");
                        $mdToast.show(toast).then(function() {});
                        vm.inventoryGRNbtnName = "Update";
                    });
                    apis.ifError(function(data) {
                        var toast = $mdToast.simple().content('there was a error, when GRN saving').action('OK').highlightAction(false).position("top right");
                        $mdToast.show(toast).then(function() {});
                    });
                    apis.sendTemplate('updateTemplate', vm.UemailTemplate);
                } else {

                    //				vm.emailTemplateMeata={};
                    //				vm.emailTemplateMeata.TemplateID="T_EMAIL_INVENTORY_NEWMAIL";
                    //				vm.emailTemplateMeata.description="Inventory param";
                    //				vm.emailTemplateMeata.param="[@@no@@,@@companyName@@,@@accounturl@@,@@customer@@]" ;
                    //
                    //				var apis = $apis.getApis();
                    //				apis.ifSuccess(function(data){
                    //
                    //				});
                    //				apis.ifError(function(data){
                    //					var toast = $mdToast.simple().content('there was a error, when inventory saving').action('OK').highlightAction(false).position("top right");
                    //					$mdToast.show(toast).then(function() {});
                    //				});
                    //				apis.sendTemplate('setTemplateMeta',vm.emailTemplateMeata);

                    console.log(vm.inventoryGRNemailContent);

                    vm.emailContent1 = vm.inventoryGRNemailContent.replace(/(\r\n|\n|\r)/gm, "<br>");
                    console.log(vm.emailContent1);

                    var str3 = "<html>" + vm.emailContent1 + "</html>";
                    console.log(str3);

                    //set template data
                    vm.emailTemplate = {};
                    vm.emailTemplate.TemplateID = "T_EMAIL_INVENTORY_GRN_NEWMAIL";
                    vm.emailTemplate.Title = vm.subjectGRN;
                    vm.emailTemplate.Owner = "12thdoor";
                    vm.emailTemplate.Body = str3;

                    var apis = $apis.getApis();
                    apis.ifSuccess(function(data) {
                        var toast = $mdToast.simple().content('GRN email successfully saved').action('OK').highlightAction(false).position("top right");
                        $mdToast.show(toast).then(function() {});
                        vm.inventoryGRNbtnName = "Update";
                    });
                    apis.ifError(function(data) {
                        var toast = $mdToast.simple().content('there was a error, when GRN email updating').action('OK').highlightAction(false).position("top right");
                        $mdToast.show(toast).then(function() {});
                    });
                    apis.sendTemplate('setTemplate', vm.emailTemplate);
                }


            });
            apis.ifError(function(data) {
                var toast = $mdToast.simple().content('there was a error').action('OK').highlightAction(false).position("top right");
                $mdToast.show(toast).then(function() {});
            });

            apis.getTemplate('getTemplate', 'T_EMAIL_INVENTORY_GRN_NEWMAIL');
        }
        //END OF INVENTORY GRN EMAIL TEMPLATE............................................................... 

        //START OF PAYMENT REMINDER EMAIL TEMPLATE....................................................................................
        // function emailPaymentReminderTemplate() {
        //     var apis = $apis.getApis();
        //     apis.ifSuccess(function(data) {

        //         if (data.length !== 0) {
        //             vm.paymentReminderbtnName = "Update";
        //         } else {
        //             vm.paymentReminderbtnName = "Save";
        //         }
        //         console.log(data.Body);
        //         console.log(data.Title);

        //         vm.subject6 = data.Title;

        //         if (data.length !== 0) {

        //             var str = data.Body.toString();
        //             console.log(str);
        //             var arr = {
        //                 "<html>": "",
        //                 "</html>": "",
        //                 "<br>": "\n"
        //             }

        //             var re = new RegExp(Object.keys(arr).join("|"), "gi");
        //             str = str.replace(re, function(matched) {
        //                 return arr[matched];
        //             });
        //             console.log(str);
        //             vm.paymentReminderemailContent = str;
        //             console.log(vm.paymentReminderemailContent);
        //         } else {
        //             vm.paymentReminderbtnName = "Save";
        //         }
        //     });
        //     apis.ifError(function(data) {
        //         console.log(data)
        //         vm.paymentReminderbtnName = "Save";
        //         var toast = $mdToast.simple().content('there was a error, when payment reminder email loading').action('OK').highlightAction(false).position("top right");
        //         $mdToast.show(toast).then(function() {});
        //     });
        //     apis.getTemplate('getTemplate', 'T_EMAIL_PAYREMINDER_NEWMAIL');
        // }
        // emailPaymentReminderTemplate();

        vm.paymentReminderSubmit = paymentReminderSubmit;

        function paymentReminderSubmit() {

            var apis = $apis.getApis();
            apis.ifSuccess(function(data) {
                if (data.length !== 0) {
                    vm.uEmailTemplateMeata = {};
                    vm.uEmailTemplateMeata.TemplateID = "T_EMAIL_PAYREMINDER_NEWMAIL";
                    vm.uEmailTemplateMeata.description = "Payment reminder param";
                    vm.uEmailTemplateMeata.param = "[@@paymentReminderNo@@, @@companyName@@, @@accountUrl@@, @@invoiceNo@@, @@customerName@@, @@currency@@, @@amount@@]";

                    var apis = $apis.getApis();
                    apis.ifSuccess(function(data) {

                    });
                    apis.ifError(function(data) {
                        var toast = $mdToast.simple().content('there was a error, when payment reminder saving').action('OK').highlightAction(false).position("top right");
                        $mdToast.show(toast).then(function() {});
                    });
                    apis.sendTemplate('updateTemplateMeta', vm.uEmailTemplateMeata);

                    console.log(vm.paymentReminderemailContent);

                    vm.emailContent1 = vm.paymentReminderemailContent.replace(/(\r\n|\n|\r)/gm, "<br>");
                    console.log(vm.emailContent1);

                    var str3 = "<html>" + vm.emailContent1 + "</html>";
                    console.log(str3);

                    //set template data
                    vm.UemailTemplate = {};
                    vm.UemailTemplate.TemplateID = "T_EMAIL_PAYREMINDER_NEWMAIL";
                    vm.UemailTemplate.Title = vm.subject6;
                    vm.UemailTemplate.Owner = "12thdoor";
                    vm.UemailTemplate.Body = str3;

                    var apis = $apis.getApis();
                    apis.ifSuccess(function(data) {
                        var toast = $mdToast.simple().content('Payment reminder email successfully updated').action('OK').highlightAction(false).position("top right");
                        $mdToast.show(toast).then(function() {});
                        vm.paymentReminderbtnName = "Update";
                    });
                    apis.ifError(function(data) {
                        var toast = $mdToast.simple().content('there was a error, when payment reminder saving').action('OK').highlightAction(false).position("top right");
                        $mdToast.show(toast).then(function() {});
                    });
                    apis.sendTemplate('updateTemplate', vm.UemailTemplate);
                } else {

                    //				vm.emailTemplateMeata={};
                    //				vm.emailTemplateMeata.TemplateID="T_EMAIL_INV_NEWMAIL";
                    //				vm.emailTemplateMeata.description="Payment reminder param";
                    //				vm.emailTemplateMeata.param="[@@no@@,@@companyName@@,@@accounturl@@,@@customer@@]" ;
                    //
                    //				var apis = $apis.getApis();
                    //				apis.ifSuccess(function(data){
                    //
                    //				});
                    //				apis.ifError(function(data){
                    //					var toast = $mdToast.simple().content('there was a error, when payment reminder saving').action('OK').highlightAction(false).position("top right");
                    //					$mdToast.show(toast).then(function() {});
                    //				});
                    //				apis.sendTemplate('setTemplateMeta',vm.emailTemplateMeata);

                    console.log(vm.paymentReminderemailContent);

                    vm.emailContent1 = vm.paymentReminderemailContent.replace(/(\r\n|\n|\r)/gm, "<br>");
                    console.log(vm.emailContent1);

                    var str3 = "<html>" + vm.emailContent1 + "</html>";
                    console.log(str3);

                    //set template data
                    vm.emailTemplate = {};
                    vm.emailTemplate.TemplateID = "T_EMAIL_PAYREMINDER_NEWMAIL";
                    vm.emailTemplate.Title = vm.subject6;
                    vm.emailTemplate.Owner = "12thdoor";
                    vm.emailTemplate.Body = str3;

                    var apis = $apis.getApis();
                    apis.ifSuccess(function(data) {
                        var toast = $mdToast.simple().content('Payment reminder email successfully saved').action('OK').highlightAction(false).position("top right");
                        $mdToast.show(toast).then(function() {});
                        vm.paymentReminderbtnName = "Update";
                    });
                    apis.ifError(function(data) {
                        var toast = $mdToast.simple().content('there was a error, when payment reminder email updating').action('OK').highlightAction(false).position("top right");
                        $mdToast.show(toast).then(function() {});
                    });
                    apis.sendTemplate('setTemplate', vm.emailTemplate);
                }
                


            });
            apis.ifError(function(data) {
                
                var toast = $mdToast.simple().content('there was a error').action('OK').highlightAction(false).position("top right");
                $mdToast.show(toast).then(function() {});
            });

            apis.getTemplate('getTemplate', 'T_EMAIL_PAYREMINDER_NEWMAIL');
        }
        //END OF  PAYMENT REMINDER TEMPLATE...............................................................

        //START OF ESTIMATE EMAIL TEMPLATE....................................................................................
        // function emailEstimateTemplate() {
        //     var apis = $apis.getApis();
        //     apis.ifSuccess(function(data) {

        //         if (data.length !== 0) {
        //             vm.estimatebtnName = "Update";
        //         } else {
        //             vm.estimatebtnName = "Save";
        //         }
        //         console.log(data.Body);
        //         console.log(data.Title);

        //         vm.subject7 = data.Title;

        //         if (data.length !== 0) {

        //             var str = data.Body.toString();
        //             console.log(str);
        //             var arr = {
        //                 "<html>": "",
        //                 "</html>": "",
        //                 "<br>": "\n"
        //             }

        //             var re = new RegExp(Object.keys(arr).join("|"), "gi");
        //             str = str.replace(re, function(matched) {
        //                 return arr[matched];
        //             });
        //             console.log(str);
        //             vm.estimateemailContent = str;
        //             console.log(vm.estimateemailContent);
        //         } else {
        //             vm.estimatebtnName = "Save";
        //         }
        //     });
        //     apis.ifError(function(data) {
        //         console.log(data)
        //         vm.estimatebtnName = "Save";
        //         var toast = $mdToast.simple().content('there was a error, when estimate email loading').action('OK').highlightAction(false).position("top right");
        //         $mdToast.show(toast).then(function() {});
        //     });
        //     apis.getTemplate('getTemplate', 'T_EMAIL_EST_NEWMAIL');
        // }
        // emailEstimateTemplate();

        vm.estimateSubmit = estimateSubmit;

        function estimateSubmit() {

            var apis = $apis.getApis();
            apis.ifSuccess(function(data) {
                if (data.length !== 0) {
                    vm.uEmailTemplateMeata = {};
                    vm.uEmailTemplateMeata.TemplateID = "T_EMAIL_EST_NEWMAIL";
                    vm.uEmailTemplateMeata.description = "Estimate param";
                    vm.uEmailTemplateMeata.param = "[@@companyName@@, @@customerName@@, @@accountUrl@@, @@amount@@, @@estimateNo@@]";

                    var apis = $apis.getApis();
                    apis.ifSuccess(function(data) {

                    });
                    apis.ifError(function(data) {
                        var toast = $mdToast.simple().content('there was a error, when estimate saving').action('OK').highlightAction(false).position("top right");
                        $mdToast.show(toast).then(function() {});
                    });
                    apis.sendTemplate('updateTemplateMeta', vm.uEmailTemplateMeata);

                    console.log(vm.estimateemailContent);

                    vm.emailContent1 = vm.estimateemailContent.replace(/(\r\n|\n|\r)/gm, "<br>");
                    console.log(vm.emailContent1);

                    var str3 = "<html>" + vm.emailContent1 + "</html>";
                    console.log(str3);

                    //set template data
                    vm.UemailTemplate = {};
                    vm.UemailTemplate.TemplateID = "T_EMAIL_EST_NEWMAIL";
                    vm.UemailTemplate.Title = vm.subject7;
                    vm.UemailTemplate.Owner = "12thdoor";
                    vm.UemailTemplate.Body = str3;

                    var apis = $apis.getApis();
                    apis.ifSuccess(function(data) {
                        var toast = $mdToast.simple().content('Estimate email successfully updated').action('OK').highlightAction(false).position("top right");
                        $mdToast.show(toast).then(function() {});
                        vm.estimatebtnName = "Update";
                    });
                    apis.ifError(function(data) {
                        var toast = $mdToast.simple().content('there was a error, when estimate saving').action('OK').highlightAction(false).position("top right");
                        $mdToast.show(toast).then(function() {});
                    });
                    apis.sendTemplate('updateTemplate', vm.UemailTemplate);
                } else {

                    //				vm.emailTemplateMeata={};
                    //				vm.emailTemplateMeata.TemplateID="T_EMAIL_EST_NEWMAIL";
                    //				vm.emailTemplateMeata.description="Estimate param";
                    //				vm.emailTemplateMeata.param="[@@no@@,@@companyName@@,@@accounturl@@,@@customer@@]" ;
                    //
                    //				var apis = $apis.getApis();
                    //				apis.ifSuccess(function(data){
                    //
                    //				});
                    //				apis.ifError(function(data){
                    //					var toast = $mdToast.simple().content('there was a error, when estimate saving').action('OK').highlightAction(false).position("top right");
                    //					$mdToast.show(toast).then(function() {});
                    //				});
                    //				apis.sendTemplate('setTemplateMeta',vm.emailTemplateMeata);

                    console.log(vm.estimateemailContent);

                    vm.emailContent1 = vm.estimateemailContent.replace(/(\r\n|\n|\r)/gm, "<br>");
                    console.log(vm.emailContent1);

                    var str3 = "<html>" + vm.emailContent1 + "</html>";
                    console.log(str3);

                    //set template data
                    vm.emailTemplate = {};
                    vm.emailTemplate.TemplateID = "T_EMAIL_EST_NEWMAIL";
                    vm.emailTemplate.Title = vm.subject7;
                    vm.emailTemplate.Owner = "12thdoor";
                    vm.emailTemplate.Body = str3;

                    var apis = $apis.getApis();
                    apis.ifSuccess(function(data) {
                        var toast = $mdToast.simple().content('Estimate email successfully saved').action('OK').highlightAction(false).position("top right");
                        $mdToast.show(toast).then(function() {});
                        vm.estimatebtnName = "Update";
                    });
                    apis.ifError(function(data) {
                        var toast = $mdToast.simple().content('there was a error, when estimate email updating').action('OK').highlightAction(false).position("top right");
                        $mdToast.show(toast).then(function() {});
                    });
                    apis.sendTemplate('setTemplate', vm.emailTemplate);
                }


            });
            apis.ifError(function(data) {
                var toast = $mdToast.simple().content('there was a error').action('OK').highlightAction(false).position("top right");
                $mdToast.show(toast).then(function() {});
            });

            apis.getTemplate('getTemplate', 'T_EMAIL_EST_NEWMAIL');
        }
        //END OF  ESTIMATE EMAIL TEMPLATE...............................................................    

        //START OF CREDIT NOTE EMAIL TEMPLATE..........................................................
        // function emailCreditNoteTemplate() {
        //     var apis = $apis.getApis();
        //     apis.ifSuccess(function(data) {

        //         if (data.length !== 0) {
        //             vm.creditNotebtnName = "Update";
        //         } else {
        //             vm.creditNotebtnName = "Save";
        //         }
        //         console.log(data.Body);
        //         console.log(data.Title);

        //         vm.subject8 = data.Title;

        //         if (data.length !== 0) {

        //             var str = data.Body.toString();
        //             console.log(str);
        //             var arr = {
        //                 "<html>": "",
        //                 "</html>": "",
        //                 "<br>": "\n"
        //             }

        //             var re = new RegExp(Object.keys(arr).join("|"), "gi");
        //             str = str.replace(re, function(matched) {
        //                 return arr[matched];
        //             });
        //             console.log(str);
        //             vm.creditNoteemailContent = str;
        //             console.log(vm.creditNoteemailContent);
        //         } else {
        //             vm.creditNotebtnName = "Save";
        //         }
        //     });
        //     apis.ifError(function(data) {
        //         console.log(data)
        //         vm.creditNotebtnName = "Save";
        //         var toast = $mdToast.simple().content('there was a error, when credit note email loading').action('OK').highlightAction(false).position("top right");
        //         $mdToast.show(toast).then(function() {});
        //     });
        //     apis.getTemplate('getTemplate', 'T_EMAIL_CRN_NEWMAIL');
        // }
        // emailCreditNoteTemplate();

        vm.creditNoteSubmit = creditNoteSubmit;

        function creditNoteSubmit() {

            var apis = $apis.getApis();
            apis.ifSuccess(function(data) {
                if (data.length !== 0) {
        			vm.uEmailTemplateMeata={};
        			vm.uEmailTemplateMeata.TemplateID="T_EMAIL_CRN_NEWMAIL";
        			vm.uEmailTemplateMeata.description="Credit Note param";
        			vm.uEmailTemplateMeata.param="[@@creditNoteNo@@, @@companyName@@, @@accountUrl@@, @@customerName@@, @@currency@@, @@amount@@]" ;
        
        			var apis = $apis.getApis();
        			apis.ifSuccess(function(data){
        
        			});
        			apis.ifError(function(data){
        				var toast = $mdToast.simple().content('there was a error, when credit note saving').action('OK').highlightAction(false).position("top right");
        				$mdToast.show(toast).then(function() {});
        			});
        			apis.sendTemplate('updateTemplateMeta',vm.uEmailTemplateMeata);

                    console.log(vm.creditNoteemailContent);

                    vm.emailContent1 = vm.creditNoteemailContent.replace(/(\r\n|\n|\r)/gm, "<br>");
                    console.log(vm.emailContent1);

                    var str3 = "<html>" + vm.emailContent1 + "</html>";
                    console.log(str3);

                    //set template data
                    vm.UemailTemplate = {};
                    vm.UemailTemplate.TemplateID = "T_EMAIL_CRN_NEWMAIL";
                    vm.UemailTemplate.Title = vm.subject8;
                    vm.UemailTemplate.Owner = "12thdoor";
                    vm.UemailTemplate.Body = str3;

                    var apis = $apis.getApis();
                    apis.ifSuccess(function(data) {
                        var toast = $mdToast.simple().content('Credit note email successfully updated').action('OK').highlightAction(false).position("top right");
                        $mdToast.show(toast).then(function() {});
                        vm.creditNotebtnName = "Update";
                    });
                    apis.ifError(function(data) {
                        var toast = $mdToast.simple().content('there was a error, when credit note saving').action('OK').highlightAction(false).position("top right");
                        $mdToast.show(toast).then(function() {});
                    });
                    apis.sendTemplate('updateTemplate', vm.UemailTemplate);
                } else {

                    //				vm.emailTemplateMeata={};
                    //				vm.emailTemplateMeata.TemplateID="T_EMAIL_CRN_NEWMAIL";
                    //				vm.emailTemplateMeata.description="Credit Note param";
                    //				vm.emailTemplateMeata.param="[@@no@@,@@companyName@@,@@accounturl@@,@@customer@@]" ;
                    //
                    //				var apis = $apis.getApis();
                    //				apis.ifSuccess(function(data){
                    //
                    //				});
                    //				apis.ifError(function(data){
                    //					var toast = $mdToast.simple().content('there was a error, when credit note saving').action('OK').highlightAction(false).position("top right");
                    //					$mdToast.show(toast).then(function() {});
                    //				});
                    //				apis.sendTemplate('setTemplateMeta',vm.emailTemplateMeata);

                    console.log(vm.creditNoteemailContent);

                    vm.emailContent1 = vm.creditNoteemailContent.replace(/(\r\n|\n|\r)/gm, "<br>");
                    console.log(vm.emailContent1);

                    var str3 = "<html>" + vm.emailContent1 + "</html>";
                    console.log(str3);

                    //set template data
                    vm.emailTemplate = {};
                    vm.emailTemplate.TemplateID = "T_EMAIL_CRN_NEWMAIL";
                    vm.emailTemplate.Title = vm.subject8;
                    vm.emailTemplate.Owner = "12thdoor";
                    vm.emailTemplate.Body = str3;

                    var apis = $apis.getApis();
                    apis.ifSuccess(function(data) {
                        var toast = $mdToast.simple().content('Credit note email successfully saved').action('OK').highlightAction(false).position("top right");
                        $mdToast.show(toast).then(function() {});
                        vm.creditNotebtnName = "Update";
                    });
                    apis.ifError(function(data) {
                        var toast = $mdToast.simple().content('there was a error, when credit note email updating').action('OK').highlightAction(false).position("top right");
                        $mdToast.show(toast).then(function() {});
                    });
                    apis.sendTemplate('setTemplate', vm.emailTemplate);
                }


            });
            apis.ifError(function(data) {
                var toast = $mdToast.simple().content('there was a error').action('OK').highlightAction(false).position("top right");
                $mdToast.show(toast).then(function() {});
            });

            apis.getTemplate('getTemplate', 'T_EMAIL_CRN_NEWMAIL');
        }
        //END OF CREDIT NOTE EMAIL TEMPLATE...............................................................

        //START OF RECURRING INVOICE EMAIL TEMPLATE....................................................................................
        // function emailRecurringProfileTemplate() {
        //     var apis = $apis.getApis();
        //     apis.ifSuccess(function(data) {

        //         if (data.length !== 0) {
        //             vm.recurringProfilebtnName = "Update";
        //         } else {
        //             vm.recurringProfilebtnName = "Save";
        //         }
        //         console.log(data.Body);
        //         console.log(data.Title);

        //         vm.subject9 = data.Title;

        //         if (data.length !== 0) {

        //             var str = data.Body.toString();
        //             console.log(str);
        //             var arr = {
        //                 "<html>": "",
        //                 "</html>": "",
        //                 "<br>": "\n"
        //             }

        //             var re = new RegExp(Object.keys(arr).join("|"), "gi");
        //             str = str.replace(re, function(matched) {
        //                 return arr[matched];
        //             });
        //             console.log(str);
        //             vm.recurringProfileemailContent = str;
        //             console.log(vm.recurringProfileemailContent);
        //         } else {
        //             vm.recurringProfilebtnName = "Save";
        //         }
        //     });
        //     apis.ifError(function(data) {
        //         console.log(data)
        //         vm.recurringProfilebtnName = "Save";
        //         var toast = $mdToast.simple().content('there was a error, when recuring profile email loading').action('OK').highlightAction(false).position("top right");
        //         $mdToast.show(toast).then(function() {});
        //     });
        //     apis.getTemplate('getTemplate', 'T_EMAIL_REC_NEWMAIL');
        // }
        // emailRecurringProfileTemplate();

        vm.recurringProfileSubmit = recurringProfileSubmit;

        function recurringProfileSubmit() {

            var apis = $apis.getApis();
            apis.ifSuccess(function(data) {
                if (data.length !== 0) {
        			vm.uEmailTemplateMeata={};
        			vm.uEmailTemplateMeata.TemplateID="T_EMAIL_REC_NEWMAIL";
        			vm.uEmailTemplateMeata.description="Recurring Profile param";
        			vm.uEmailTemplateMeata.param="[@@recurringInvoiceNo@@, @@amount@@, @@companyName@@, @@accountUrl@@, @@customerName@@]" ;
        
        			var apis = $apis.getApis();
        			apis.ifSuccess(function(data){
        
        			});
        			apis.ifError(function(data){
        				var toast = $mdToast.simple().content('there was a error, when recurring profile saving').action('OK').highlightAction(false).position("top right");
        				$mdToast.show(toast).then(function() {});
        			});
        			apis.sendTemplate('updateTemplateMeta',vm.uEmailTemplateMeata);

                    console.log(vm.recurringProfileemailContent);

                    vm.emailContent1 = vm.recurringProfileemailContent.replace(/(\r\n|\n|\r)/gm, "<br>");
                    console.log(vm.emailContent1);

                    var str3 = "<html>" + vm.emailContent1 + "</html>";
                    console.log(str3);

                    //set template data
                    vm.UemailTemplate = {};
                    vm.UemailTemplate.TemplateID = "T_EMAIL_REC_NEWMAIL";
                    vm.UemailTemplate.Title = vm.subject9;
                    vm.UemailTemplate.Owner = "12thdoor";
                    vm.UemailTemplate.Body = str3;

                    var apis = $apis.getApis();
                    apis.ifSuccess(function(data) {
                        var toast = $mdToast.simple().content('Recurring profile email successfully updated').action('OK').highlightAction(false).position("top right");
                        $mdToast.show(toast).then(function() {});
                        vm.recurringProfilebtnName = "Update";
                    });
                    apis.ifError(function(data) {
                        var toast = $mdToast.simple().content('there was a error, when recurring profile saving').action('OK').highlightAction(false).position("top right");
                        $mdToast.show(toast).then(function() {});
                    });
                    apis.sendTemplate('updateTemplate', vm.UemailTemplate);
                } else {

                    //				vm.emailTemplateMeata={};
                    //				vm.emailTemplateMeata.TemplateID="T_EMAIL_REC_NEWMAIL";
                    //				vm.emailTemplateMeata.description="Recurring Profile param";
                    //				vm.emailTemplateMeata.param="[@@no@@,@@companyName@@,@@accounturl@@,@@customer@@]" ;
                    //
                    //				var apis = $apis.getApis();
                    //				apis.ifSuccess(function(data){
                    //
                    //				});
                    //				apis.ifError(function(data){
                    //					var toast = $mdToast.simple().content('there was a error, when recurring profile saving').action('OK').highlightAction(false).position("top right");
                    //					$mdToast.show(toast).then(function() {});
                    //				});
                    //				apis.sendTemplate('setTemplateMeta',vm.emailTemplateMeata);

                    console.log(vm.recurringProfileemailContent);

                    vm.emailContent1 = vm.recurringProfileemailContent.replace(/(\r\n|\n|\r)/gm, "<br>");
                    console.log(vm.emailContent1);

                    var str3 = "<html>" + vm.emailContent1 + "</html>";
                    console.log(str3);

                    //set template data
                    vm.emailTemplate = {};
                    vm.emailTemplate.TemplateID = "T_EMAIL_REC_NEWMAIL";
                    vm.emailTemplate.Title = vm.subject9;
                    vm.emailTemplate.Owner = "12thdoor";
                    vm.emailTemplate.Body = str3;

                    var apis = $apis.getApis();
                    apis.ifSuccess(function(data) {
                        var toast = $mdToast.simple().content('Recurring profile email successfully saved').action('OK').highlightAction(false).position("top right");
                        $mdToast.show(toast).then(function() {});
                        vm.recurringProfilebtnName = "Update";
                    });
                    apis.ifError(function(data) {
                        var toast = $mdToast.simple().content('there was a error, when recurring profile email updating').action('OK').highlightAction(false).position("top right");
                        $mdToast.show(toast).then(function() {});
                    });
                    apis.sendTemplate('setTemplate', vm.emailTemplate);
                }


            });
            apis.ifError(function(data) {
                var toast = $mdToast.simple().content('there was a error').action('OK').highlightAction(false).position("top right");
                $mdToast.show(toast).then(function() {});
            });

            apis.getTemplate('getTemplate', 'T_EMAIL_REC_NEWMAIL');
        }
        //END OF RECURRING INVOICE EMAIL TEMPLATE...............................................................    

        //START OF Project EMAIL TEMPLATE..........................................................
        // function emailProjectTemplate() {
        //     var apis = $apis.getApis();
        //     apis.ifSuccess(function(data) {

        //         if (data.length !== 0) {
        //             vm.projectbtnName = "Update";
        //         } else {
        //             vm.projectbtnName = "Save";
        //         }
        //         console.log(data.Body);
        //         console.log(data.Title);

        //         vm.subject10 = data.Title;

        //         if (data.length !== 0) {

        //             var str = data.Body.toString();
        //             console.log(str);
        //             var arr = {
        //                 "<html>": "",
        //                 "</html>": "",
        //                 "<br>": "\n"
        //             }

        //             var re = new RegExp(Object.keys(arr).join("|"), "gi");
        //             str = str.replace(re, function(matched) {
        //                 return arr[matched];
        //             });
        //             console.log(str);
        //             vm.projectemailContent = str;
        //             console.log(vm.projectemailContent);
        //         } else {
        //             vm.projectbtnName = "Save";
        //         }
        //     });
        //     apis.ifError(function(data) {
        //         console.log(data)
        //         vm.projectbtnName = "Save";
        //         var toast = $mdToast.simple().content('there was a error, when project email loading').action('OK').highlightAction(false).position("top right");
        //         $mdToast.show(toast).then(function() {});
        //     });
        //     apis.getTemplate('getTemplate', 'T_EMAIL_PROJECT_NEWMAIL');
        // }
        // emailProjectTemplate();


        vm.projectSubmit = projectSubmit;

        function projectSubmit() {

            var apis = $apis.getApis();
            apis.ifSuccess(function(data) {
                if (data.length !== 0) {

                    vm.uEmailTemplateMeata={};
                    vm.uEmailTemplateMeata.TemplateID="T_EMAIL_PROJECT_NEWMAIL";
                    vm.uEmailTemplateMeata.description="project param";
                    vm.uEmailTemplateMeata.param="[@@projectName@@,@@companyName@@]" ;
        
                    var apis = $apis.getApis();
                    apis.ifSuccess(function(data){
        
                    });
                    apis.ifError(function(data){
                        var toast = $mdToast.simple().content('there was a error, when project saving').action('OK').highlightAction(false).position("top right");
                        $mdToast.show(toast).then(function() {});
                    });
                    apis.sendTemplate('updateTemplateMeta',vm.uEmailTemplateMeata);

                    vm.emailContent1 = vm.projectemailContent.replace(/(\r\n|\n|\r)/gm, "<br>");
                    console.log(vm.emailContent1);

                    var str3 = "<html>" + vm.emailContent1 + "</html>";
                    console.log(str3);


                    //.....................................................

                    console.log(vm.projectemailContent);

                    vm.emailContent1 = vm.projectemailContent.replace(/(\r\n|\n|\r)/gm, "<br>");
                    console.log(vm.emailContent1);

                    var str3 = "<html>" + vm.emailContent1 + "</html>";
                    console.log(str3);

                    //set template data
                    vm.UemailTemplate = {};
                    vm.UemailTemplate.TemplateID = "T_EMAIL_PROJECT_NEWMAIL";
                    vm.UemailTemplate.Title = vm.subject10;
                    vm.UemailTemplate.Owner = "12thdoor";
                    vm.UemailTemplate.Body = str3;

                    var apis = $apis.getApis();
                    apis.ifSuccess(function(data) {
                        var toast = $mdToast.simple().content('Project email successfully updated').action('OK').highlightAction(false).position("top right");
                        $mdToast.show(toast).then(function() {});
                        vm.projectbtnName = "Update";
                    });
                    apis.ifError(function(data) {
                        var toast = $mdToast.simple().content('there was a error, when project saving').action('OK').highlightAction(false).position("top right");
                        $mdToast.show(toast).then(function() {});
                    });
                    apis.sendTemplate('updateTemplate', vm.UemailTemplate);
                } else {

                     vm.emailTemplateMeata={};
                     vm.emailTemplateMeata.TemplateID="T_EMAIL_PROJECT_NEWMAIL";
                     vm.emailTemplateMeata.description="project param";
                     vm.emailTemplateMeata.param="[@@projectName@@,@@companyName@@]" ;
        
                     var apis = $apis.getApis();
                     apis.ifSuccess(function(data){
        
                     });
                     apis.ifError(function(data){
                         var toast = $mdToast.simple().content('there was a error, when project saving').action('OK').highlightAction(false).position("top right");
                         $mdToast.show(toast).then(function() {});
                     });
                     apis.sendTemplate('setTemplateMeta',vm.emailTemplateMeata);

                    console.log(vm.projectemailContent);

                    vm.emailContent1 = vm.projectemailContent.replace(/(\r\n|\n|\r)/gm, "<br>");
                    console.log(vm.emailContent1);

                    var str3 = "<html>" + vm.emailContent1 + "</html>";
                    console.log(str3);

                    //set template data
                    vm.emailTemplate = {};
                    vm.emailTemplate.TemplateID = "T_EMAIL_PROJECT_NEWMAIL";
                    vm.emailTemplate.Title = vm.subject10;
                    vm.emailTemplate.Owner = "12thdoor";
                    vm.emailTemplate.Body = str3;

                    var apis = $apis.getApis();
                    apis.ifSuccess(function(data) {
                        var toast = $mdToast.simple().content('Project email successfully saved').action('OK').highlightAction(false).position("top right");
                        $mdToast.show(toast).then(function() {});
                        vm.projectbtnName = "Update";
                    });
                    apis.ifError(function(data) {
                        var toast = $mdToast.simple().content('there was a error, when project email updating').action('OK').highlightAction(false).position("top right");
                        $mdToast.show(toast).then(function() {});
                    });
                    apis.sendTemplate('setTemplate', vm.emailTemplate);
                }


            });
            apis.ifError(function(data) {
                var toast = $mdToast.simple().content('there was a error').action('OK').highlightAction(false).position("top right");
                $mdToast.show(toast).then(function() {});
            });

            apis.getTemplate('getTemplate', 'T_EMAIL_PROJECT_NEWMAIL');
            }

            //END OF Project EMAIL TEMPLATE..........................................................



    }
})();
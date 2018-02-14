(function()
{
  'use strict';

  angular
  .module('app.settings')
  .controller('DialogrolesController',DialogrolesController);

  /** @ngInject */
  function DialogrolesController($rootScope,$mdDialog,$mdSidenav)
  {
    	// use the below code on all child view controllers
    	var vm = this;

    	vm.toggleSidenav = toggleSidenav;

      function toggleSidenav(sidenavId)
      {
        $mdSidenav(sidenavId).toggle();
      }
    	// dont change above code !

     vm.submit=submit;
     vm.button="Add";
     vm.roles=$rootScope.roles;
     console.log(vm.roles);
      
     vm.appLabel=["Contacts","Products","Estimates","Invoices","Payments","Credit Notes","Expenses","Inventory","Projects","360 View","Reports","Settings", "File Manager", "Dashboard" , "Business Manager"];
     vm.appCollection=["Contacts","Products","Estimates","Invoices","Payments","CreditNotes","Expenses","Inventory","Projects","360View","Reports","Settings", "FileManager","Dashboard", "BusinessManager"];

     vm.appPermission=[];
     
     vm.contacts={all:false,add:false,view:false,edit:false,cancel:false,delete:false};
     vm.product={all:false,add:false,view:false,edit:false,cancel:false,delete:false};
     vm.estimate={all:false,add:false,view:false,edit:false,cancel:false,delete:false};
     vm.invoice={all:false,add:false,view:false,edit:false,cancel:false,delete:false};
     vm.payments={all:false,add:false,view:false,edit:false,cancel:false,delete:false};
     vm.creditNotes={all:false,add:false,view:false,edit:false,cancel:false,delete:false};
     vm.expenses={all:false,add:false,view:false,edit:false,cancel:false,delete:false};
     vm.inventory={all:false,add:false,view:false,edit:false,cancel:false,delete:false};
     vm.project={all:false,add:false,view:false,edit:false,cancel:false,delete:false};
     vm.view360={all:false,add:false,view:false,edit:false,cancel:false,delete:false};
     vm.reports={all:false,add:false,view:false,edit:false,cancel:false,delete:false};
     vm.fileManager={all:false,add:false,view:false,edit:false,cancel:false,delete:false};
     vm.settings={all:false,add:false,view:false,edit:false,cancel:false,delete:false};
     vm.dashboard={all:false,add:false,view:false,edit:false,cancel:false,delete:false};
     vm.add_join_business={all:false,add:false,view:false,edit:false,cancel:false,delete:false};

    vm.toggleContacts=toggleContacts;
    vm.toggleProduct=toggleProduct;
    vm.toggleEstimate=toggleEstimate;
    vm.toggleInvoice=toggleInvoice;
    vm.togglePayments=togglePayments;

    vm.toggleCreditNotes=toggleCreditNotes;
    vm.toggleExpenses=toggleExpenses;
    vm.toggleInventory=toggleInventory;
    vm.toggleProject=toggleProject;
    vm.toggleReports=toggleReports;
      
    function toggleInvoice(view){
        if(view==true){
          vm.invoice={view:true,add:true,edit:false,cancel:true,delete:false}; 
     
        }
        else{
          vm.invoice={view:false,add:false,edit:false,cancel:false,delete:false}; 
      
        }
       
        
    }
    function toggleEstimate(view){
        if(view==true){
          vm.estimate={view:true,add:true,edit:true,cancel:true,delete:true}; 
   
        }
        else{
          vm.estimate={view:false,add:false,edit:false,cancel:false,delete:false}; 
         
        } 
    }
    function toggleCreditNotes(view){
        if(view==true){
          vm.creditNotes={view:true,add:true,edit:false,cancel:true,delete:true}; 
         
        }
        else{
          vm.creditNotes={view:false,add:false,edit:false,cancel:false,delete:false}; 
      
        } 
    }
    function togglePayments(view){
        if(view==true){
          vm.payments={view:true,add:true,edit:false,cancel:true,delete:false};  
         
        }
        else{
          vm.payments={view:false,add:false,edit:false,cancel:false,delete:false};  
        
        } 
    }
    function toggleExpenses(view){
        if(view==true){
          vm.expenses={view:true,add:true,edit:true,cancel:true,delete:true}; 
         
        }
        else{
          vm.expenses={view:false,add:false,edit:false,cancel:false,delete:false};  
     
        } 
    }
    function toggleProduct(view){
        if(view==true){
          vm.product={view:true,add:true,edit:true,cancel:false,delete:true}; 
      
        }
        else{
          vm.product={view:false,add:false,edit:false,cancel:false,delete:false}; 
        
        } 
    }
     function toggleInventory(view){
        if(view==true){
          vm.inventory={view:true,add:true,edit:false,cancel:true,delete:false};  
      
        }
        else{
          vm.inventory={view:false,add:false,edit:false,cancel:false,delete:false};
        
        } 
    }
     function toggleProject(view){
        if(view==true){
          vm.project={view:true,add:true,edit:true,cancel:false,delete:true}; 

        }
        else{
          vm.project={view:false,add:false,edit:false,cancel:false,delete:false};
      
        } 
    }
    function toggleContacts(view){
        if(view==true){
          vm.contacts={view:true,add:true,edit:true,cancel:false,delete:true}; 
       
        }
        else{
          vm.contacts={view:false,add:false,edit:false,cancel:false,delete:false};
      
        } 
    }
    function toggleReports(view){
        if(view==true){
          vm.reports={view:true,add:true,edit:true,cancel:true,delete:true};  
        
        }
        else{
          vm.reports={view:false,add:false,edit:false,cancel:false,delete:false};
        
        } 
    }
    

    function submit() {

      vm.sameRole=false;
        for (var i = vm.roles.length - 1; i >= 0; i--) {
         var currentRole = vm.roles[i].roleName;
         var newRole = vm.roleName;
         if(currentRole.toLowerCase()==newRole.toLowerCase()){
          vm.sameRole=true;
          vm.erromessage="Role already exist"
          break;
        }else{
          vm.sameRole=false;
          vm.erromessage=""
        }
      }

      if(!vm.sameRole){

      vm.appPermission.push({
      appName:vm.appCollection[0],
      label:vm.appLabel[0],
      all:vm.contacts.all,
      add : vm.contacts.add,
      view: vm.contacts.view,
      edit:vm.contacts.edit,
      cancel:vm.contacts.cancel,
      delete:vm.contacts.delete
      });  
      
      vm.appPermission.push({
      appName:vm.appCollection[1],
      label:vm.appLabel[1],
      all:vm.product.all,
      add : vm.product.add,
      view: vm.product.view,
      edit:vm.product.edit,
      cancel:vm.product.cancel,
      delete:vm.product.delete
      });

       vm.appPermission.push({
      appName:vm.appCollection[2],
      label:vm.appLabel[2],
      all:vm.estimate.all,
      add : vm.estimate.add,
      view: vm.estimate.view,
      edit:vm.estimate.edit,
      cancel:vm.estimate.cancel,
      delete:vm.estimate.delete
      });
        
      vm.appPermission.push({
      appName:vm.appCollection[3],
      label:vm.appLabel[3],
      all:vm.invoice.all,
      add : vm.invoice.add,
      view: vm.invoice.view,
      edit:vm.invoice.edit,
      cancel:vm.invoice.cancel,
      delete:vm.invoice.delete
    });

     vm.appPermission.push({
      appName:vm.appCollection[4],
      label:vm.appLabel[4],
      all:vm.payments.all,
      add : vm.payments.add,
      view: vm.payments.view,
      edit:vm.payments.edit,
      cancel:vm.payments.cancel,
      delete:vm.payments.delete
    });
    
     vm.appPermission.push({
      appName:vm.appCollection[5],
      label:vm.appLabel[5],
      all:vm.creditNotes.all,
      add : vm.creditNotes.add,
      view: vm.creditNotes.view,
      edit:vm.creditNotes.edit,
      cancel:vm.creditNotes.cancel,
      delete:vm.creditNotes.delete
    });
    
     vm.appPermission.push({
      appName:vm.appCollection[6],
      label:vm.appLabel[6],
      all:vm.expenses.all,
      add : vm.expenses.add,
      view: vm.expenses.view,
      edit:vm.expenses.edit,
      cancel:vm.expenses.cancel,
      delete:vm.expenses.delete
    });
    
     vm.appPermission.push({
      appName:vm.appCollection[7],
      label:vm.appLabel[7],
      all:vm.inventory.all,
      add : vm.inventory.add,
      view: vm.inventory.view,
      edit:vm.inventory.edit,
      cancel:vm.inventory.cancel,
      delete:vm.inventory.delete
    });
     vm.appPermission.push({
      appName:vm.appCollection[8],
      label:vm.appLabel[8],
      all:vm.project.all,
      add : vm.project.add,
      view: vm.project.view,
      edit:vm.project.edit,
      cancel:vm.project.cancel,
      delete:vm.project.delete
    });

    vm.appPermission.push({
      appName:vm.appCollection[9],
      label:vm.appLabel[9],
      add : false,
      view: vm.view360.view,
      edit:false,
      cancel:false,
      delete:false
    });

    vm.appPermission.push({
      appName:vm.appCollection[10],
      label:vm.appLabel[10],
      all:vm.reports.all,
      add : vm.reports.add,
      view: vm.reports.view,
      edit:vm.reports.edit,
      cancel:vm.reports.cancel,
      delete:vm.reports.delete
    });

     vm.appPermission.push({
      appName:vm.appCollection[11],
      label:vm.appLabel[11],
      all:false,
      add :false,
      view: vm.settings.view,
      edit:false,
      cancel:false,
      delete:false
    });

    vm.appPermission.push({
      appName:vm.appCollection[12],
      label:vm.appLabel[12],
      all:false,
      add :false,
      view: vm.fileManager.view,
      edit:false,
      cancel:false,
      delete:false

    });
     
    vm.appPermission.push({
      appName:vm.appCollection[13],
      label:vm.appLabel[13],
      all:false,
      add :false,
      view: vm.dashboard.view,
      edit:false,
      cancel:false,
      delete:false
    });

    vm.appPermission.push({
      appName:vm.appCollection[14],
      label:vm.appLabel[14],
      all:false,
      add :false,
      view: vm.add_join_business.view,
      edit:false,
      cancel:false,
      delete:false
    });
    

     var number = Math.random();
     console.log(Math.random());

     var obj={};
     obj.id=number;
     obj.roleName=vm.roleName;
     obj.appPermission=vm.appPermission;
     obj.type="manual";
     obj.editable=false;
     $mdDialog.hide(obj);
      }

   };

   vm.getDataPredefindRole = function(preRole){
    console.log(preRole);

    var rolesPre=JSON.parse(preRole);
    console.log(rolesPre.appPermission); 
    vm.contacts=rolesPre.appPermission[0];
    vm.product=rolesPre.appPermission[1];
    vm.estimate=rolesPre.appPermission[2];
    vm.invoice=rolesPre.appPermission[3];
    vm.payments=rolesPre.appPermission[4];
    vm.creditNotes=rolesPre.appPermission[5];
    vm.expenses=rolesPre.appPermission[6];
    vm.inventory=rolesPre.appPermission[7];
    vm.project=rolesPre.appPermission[8];
    vm.view360=rolesPre.appPermission[9];
    vm.reports=rolesPre.appPermission[10];
    vm.settings=rolesPre.appPermission[11];
    vm.fileManager=rolesPre.appPermission[12];
    vm.dashboard=rolesPre.appPermission[13];
    vm.add_join_business = rolesPre.appPermission[14];
  };

  vm.cancel = function() {
    $mdDialog.cancel();
  };


}
})();
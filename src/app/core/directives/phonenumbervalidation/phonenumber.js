(function()
{
	'use strict';

	angular
.module('app.invoices')

.directive('validatecnumber', validatecnumber);
	function validatecnumber($filter){
		return {
			require: '?ngModel',
			restrict : 'A',
			scope : {
			validatecnumber : '='
			},
			link: function (scope, elem, attrs, ctrl) {
				if (!ctrl) return;
				setVal();
				function setVal(){
				if(scope.validatecnumber == 0){
					scope.validatecnumber = 20;
				}
				elem.attr("maxlength",scope.validatecnumber);
				elem.bind('keydown', function(evt) {

					var charCode = (evt.which) ? evt.which : event.keyCode;
					//Start checking is shift pressed
					var evtt = evt || window.event;
					var shiftKeyDown = false;
				    if (evtt.shiftKey) {
				      shiftKeyDown = true;
				    } else {
				      shiftKeyDown = false;
				    }debugger;
				    //End checking is shift pressed

				    //Start delet if tab ke y pressed
				    if(charCode == 9)
				    {
				    	return;
				    }
				    //End delet if tab ke y pressed

					if( (shiftKeyDown == true && charCode == 187) ||
						(shiftKeyDown == false && charCode == 189) ||
						(shiftKeyDown == false && charCode == 109) ||
						charCode == 8 || charCode == 107 || charCode == 32 ) { return;}
    				if ( (charCode < 48 || charCode > 57) && (charCode < 96 || charCode > 105))
    				{
			            evt.preventDefault();
			        }else if ( shiftKeyDown == true && (charCode > 48 || charCode < 57))
    				{
			            evt.preventDefault();
			        }
					//var plainNumber = elem.val().replace(/[^\d|\-+|\.+]/g, '');
					//elem.val (plainNumber);
					//elem.attr("ng-pattern", "/^(\+\91{1,2}[- ])\d{10}$/");
					
				});
				}
			}
		};
	}

})();
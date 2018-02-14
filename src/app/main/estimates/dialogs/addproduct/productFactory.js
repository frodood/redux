(function() {
    'use strict';

    angular
        .module('app.estimates')
        .factory('EstimateService', EstimateService);

    /** @ngInject */
    function EstimateService($rootScope) {

        var productArray = {
            val: []
        };
        var editProdArray = {
            val: []
        };
        var taxArr = [];
        var compountTrue = [];
        var finalAmount = 0;
        var total = 0;
        var tax = 0;

        return {
            setArray: function(newVal) {
                productArray.val.push(newVal);
                return productArray;
            },
            getArry: function() {
                return productArray;
            },
            removeArray: function(newVals, index) {
           
                productArray.val.splice(productArray.val.indexOf(newVals), 1);
                return productArray;
            },
            removeAll: function(newVals) {
        
                productArray.val.splice(newVals);
                return productArray;
            },
            setTaxArr: function(newVal) {
                taxArr.push(newVal);
                return taxArr;
            },
            getTaxArr: function() {
                return taxArr;
            },
            removeTaxArray: function(val) {
                taxArr.splice(val);
                return taxArr;
            },
            setEditProdArr: function(newVal) {
                editProdArray.val.push(newVal);
                return editProdArray;
            },
            // editArray: function(newVals, index) {
            //     console.log(index);
            //     newVals.estimateNo = "";
            //     productArray.val[index].amount = newVals.amount;
            //     productArray.val[index].discount = newVals.discount;
            //     productArray.val[index].estimateNo = newVals.estimateNo;
            //     productArray.val[index].olp = newVals.olp;
            //     productArray.val[index].price = newVals.price;
            //     productArray.val[index].productID = newVals.productID;
            //     productArray.val[index].productName = newVals.productName;
            //     productArray.val[index].productUnit = newVals.productUnit;
            //     productArray.val[index].quantity = newVals.quantity;
            //     productArray.val[index].status = newVals.status;
            //     productArray.val[index].tax = newVals.tax;
            //     return productArray;
            // },

            // editArray: function(newVals, index,exchangeRate) {
            //      productArray.val[index].amount = parseFloat(newVals.amount).toFixed(2);
            //      productArray.val[index].discount = newVals.discount;
            //      productArray.val[index].estimateNo = newVals.estimateNo;
            //      productArray.val[index].olp = newVals.olp;
            //      productArray.val[index].price = parseFloat(newVals.price).toFixed(2);
            //      productArray.val[index].productID = newVals.productID;
            //      productArray.val[index].productName = newVals.productName;
            //      productArray.val[index].productUnit = newVals.productUnit;
            //      productArray.val[index].quantity = newVals.quantity;
            //      productArray.val[index].status = newVals.status;
            //      productArray.val[index].tax = newVals.tax;
            //      return productArray;
            // },

            editArray: function(newVals, index, exchangeRate) {
                productArray.val[index].amount = parseFloat(newVals.amount);
                productArray.val[index].discount = newVals.discount;
                productArray.val[index].invoiceNo = newVals.invoiceNo;
                productArray.val[index].olp = newVals.olp;
                productArray.val[index].price = parseFloat(newVals.price);
                productArray.val[index].productID = newVals.productID;
                productArray.val[index].productName = newVals.productName;
                productArray.val[index].productUnit = newVals.productUnit;
                productArray.val[index].quantity = newVals.quantity;
                productArray.val[index].status = newVals.status;
                productArray.val[index].tax = newVals.tax;
                //return productArray;

                var total = 0;
                var getFamount = 0;
                var compoundcal = [];
                var calculateCompound = [];
                var falseComp = [];
                var trueComp = [];
                var compoundtrue = [];



                var obj = newVals;

                obj.amount = parseFloat(obj.amount);
                //Starting setting tax array
                if (obj.tax != null) {
                    if (obj.tax.type == "individualtaxes") {
                        if (obj.tax.rate == 0) {

                        } else {
                            taxArr.push({
                                taxName: obj.tax.taxName,
                                rate: obj.tax.rate,
                                salesTax: parseFloat((obj.amount * obj.tax.rate) / 100),
                                compoundCheck: obj.tax.compound,
                                positionID: obj.tax.positionID
                            })
                        }

                    } else if (obj.tax.type == "multipletaxgroup") {
                        for (var i = obj.tax.individualTaxes.length - 1; i >= 0; i--) {
                            if (obj.tax.individualTaxes[i].compound == false) {
                                falseComp.push(obj.tax.individualTaxes[i]);
                            } else if (obj.tax.individualTaxes[i].compound == true) {
                                trueComp.push(obj.tax.individualTaxes[i]);
                                compoundtrue = trueComp.sort(function(a, b) {
                                    return a.positionID > b.positionID ? 1 : a.positionID < b.positionID ? -1 : 0;
                                });
                            }
                        }
                        // if(compoundtrue.length>0){
                        calculateCompound = falseComp.concat(compoundtrue);
                        // }

                        var tcopmAmount = 0;
                        var fcompAmount = 0;
                        var finalCal = 0;
                        var getFinalamount = 0;
                        var ship = 0;
                        getFinalamount = this.calculateNetAMount(ship);
                        for (var y = 0; y <= calculateCompound.length - 1; y++) {
                            if (calculateCompound[y].compound == false) {
                                fcompAmount = parseFloat(obj.amount * calculateCompound[y].rate / 100)
                                total = fcompAmount;
                                getFamount += fcompAmount;
                            } else if (calculateCompound[y].compound == true) {
                                tcopmAmount = parseFloat(getFamount + obj.amount);
                                finalCal = parseFloat(finalCal + tcopmAmount) * calculateCompound[y].rate / 100;
                                total = finalCal;
                            }

                            if (calculateCompound[y].rate == 0) {

                            } else {
                                taxArr.push({
                                    taxName: calculateCompound[y].taxName,
                                    rate: calculateCompound[y].rate,
                                    salesTax: total,
                                    compoundCheck: calculateCompound[y].compound,
                                    positionID: calculateCompound[y].positionID
                                })
                            }
                        }
                    }

                    taxArr = taxArr.sort(function(a, b) {
                        return a.taxName.toLowerCase() > b.taxName.toLowerCase() ? 1 : a.taxName.toLowerCase() < b.taxName.toLowerCase() ? -1 : 0;
                    })

                    if (taxArr.length > 1) {
                        for (var l = taxArr.length - 1; l >= 0; l--) {
                            if (taxArr[l + 1]) {
                                if (taxArr[l].taxName == taxArr[l + 1].taxName) {
                                    var sumSalesTax = 0;
                                    var txtName = taxArr[l].taxName;
                                    var rate = taxArr[l].rate;
                                    var compound = taxArr[l].compoundCheck;
                                    var pId = taxArr[l].positionID;
                                    sumSalesTax = parseFloat(taxArr[l].salesTax + taxArr[l + 1].salesTax);

                                    taxArr.splice(l, 2);
                                    console.log(taxArr);
                                    taxArr.push({
                                        taxName: txtName,
                                        rate: rate,
                                        salesTax: sumSalesTax,
                                        compoundCheck: compound,
                                        positionID: pId
                                    })
                                    taxArr = taxArr.sort(function(a, b) {
                                        return a.positionID > b.positionID ? 1 : a.positionID < b.positionID ? -1 : 0;
                                    });
                                }
                            }
                        }
                        taxArr.sort(function(a, b) {
                            return a.positionID > b.positionID ? 1 : a.positionID < b.positionID ? -1 : 0;
                        });
                    }
                }
                //End Setting Tax array

            },


            removeEditProdArr: function(newVal, index) {
                editProdArray.val.splice(editProdArray.val.indexOf(newVals), 1);
                return editProdArray;
            },
            setFullArr: function(obj) {
                this.setArray(obj);
                var total = 0;
                var getFamount = 0;
                var compoundcal = [];
                var calculateCompound = [];
                var falseComp = [];
                var trueComp = [];
                var compoundtrue = [];
                obj.amount = parseFloat(obj.amount);

                if (obj.tax != null) {
                    if (obj.tax.type == "individualtaxes") {
                        if (obj.tax.rate == 0) {

                        } else {
                            taxArr.push({
                                taxName: obj.tax.taxName,
                                rate: obj.tax.rate,
                                salesTax: parseFloat((obj.amount * obj.tax.rate) / 100),
                                compoundCheck: obj.tax.compound,
                                positionID: obj.tax.positionID
                            })
                        }

                    } else if (obj.tax.type == "multipletaxgroup") {
                        for (var i = obj.tax.individualTaxes.length - 1; i >= 0; i--) {
                            if (obj.tax.individualTaxes[i].compound == false) {
                                falseComp.push(obj.tax.individualTaxes[i]);
                            } else if (obj.tax.individualTaxes[i].compound == true) {
                                trueComp.push(obj.tax.individualTaxes[i]);
                                compoundtrue = trueComp.sort(function(a, b) {
                                    return a.positionID > b.positionID ? 1 : a.positionID < b.positionID ? -1 : 0;
                                });
                            }
                        }
                        // if(compoundtrue.length>0){
                        calculateCompound = falseComp.concat(compoundtrue);
                        // }

                        var tcopmAmount = 0;
                        var fcompAmount = 0;
                        var finalCal = 0;
                        var getFinalamount = 0;
                        var ship = 0;
                        getFinalamount = this.calculateNetAMount(ship);
                        for (var y = 0; y <= calculateCompound.length - 1; y++) {
                            if (calculateCompound[y].compound == false) {
                                fcompAmount = parseFloat(obj.amount * calculateCompound[y].rate / 100)
                                total = fcompAmount;
                                getFamount += fcompAmount;
                            } else if (calculateCompound[y].compound == true) {
                                tcopmAmount = parseFloat(getFamount + obj.amount);
                                finalCal = parseFloat(finalCal + tcopmAmount) * calculateCompound[y].rate / 100;
                                total = finalCal;
                            }

                            if (calculateCompound[y].rate == 0) {

                            } else {
                                taxArr.push({
                                    taxName: calculateCompound[y].taxName,
                                    rate: calculateCompound[y].rate,
                                    salesTax: total,
                                    compoundCheck: calculateCompound[y].compound,
                                    positionID: calculateCompound[y].positionID
                                })
                            }
                        }
                    }

                    taxArr = taxArr.sort(function(a, b) {
                        return a.taxName.toLowerCase() > b.taxName.toLowerCase() ? 1 : a.taxName.toLowerCase() < b.taxName.toLowerCase() ? -1 : 0;
                    })

                    if (taxArr.length > 1) {
                        for (var l = taxArr.length - 1; l >= 0; l--) {
                            if (taxArr[l + 1]) {
                                if (taxArr[l].taxName == taxArr[l + 1].taxName) {
                                    var sumSalesTax = 0;
                                    var txtName = taxArr[l].taxName;
                                    var rate = taxArr[l].rate;
                                    var compound = taxArr[l].compoundCheck;
                                    var pId = taxArr[l].positionID;
                                    sumSalesTax = parseFloat(taxArr[l].salesTax + taxArr[l + 1].salesTax);
                                    console.log(sumSalesTax);

                                    taxArr.splice(l, 2);
                                    taxArr.push({
                                        taxName: txtName,
                                        rate: rate,
                                        salesTax: sumSalesTax,
                                        compoundCheck: compound,
                                        positionID: pId
                                    })
                                    taxArr = taxArr.sort(function(a, b) {
                                        return a.positionID > b.positionID ? 1 : a.positionID < b.positionID ? -1 : 0;
                                    });
                                }
                            }
                        }
                        taxArr.sort(function(a, b) {
                            return a.positionID > b.positionID ? 1 : a.positionID < b.positionID ? -1 : 0;
                        });
                    }
                }
            },

            calculateTotal: function() {
                total = 0;
                angular.forEach(productArray.val, function(tdIinvoice) {
                    total += parseFloat(tdIinvoice.amount);
                })
                return total
            },
            calculateTax: function() {
                tax = 0;
                if (taxArr.length >= 1) {
                    for (var i = taxArr.length - 1; i >= 0; i--) {
                        tax += parseFloat(taxArr[i].salesTax);
                        // $scope.salesTax = tt;
                    }
                }
                return tax;
            },
            calculateNetAMount: function(val) {
                finalAmount = 0;
                finalAmount = parseFloat(total) + parseFloat(tax) + parseFloat(val);
                return finalAmount;
            },

            removeTax : function(obj,index){

                if (obj.tax != null) {
                    if (obj.tax.type == "individualtaxes") { 
                        var x = taxArr.length;
                        while (x--) {
                            if (taxArr[x] && (taxArr[x].taxName == obj.tax.taxName)) {
                                taxArr[x].salesTax = parseFloat(taxArr[x].salesTax) - parseFloat(obj.amount * obj.tax.rate / 100);
                                if (taxArr[x].salesTax <= 0) {
                                    taxArr.splice(x,1)
                                }
                            }
                        }
                    } else if (obj.tax.type == "multipletaxgroup") {

                        var trueComp = [];
                        var falseComp = [];

                        for (var x = obj.tax.individualTaxes.length - 1; x >= 0; x--) {

                            if (obj.tax.individualTaxes[x].compound == false) {
                                falseComp.push(obj.tax.individualTaxes[x]);

                            } else if (obj.tax.individualTaxes[x].compound == true) {
                                trueComp.push(obj.tax.individualTaxes[x])
                               
                            }
                        }
                        trueComp = trueComp.sort(function(a, b) {
                            return a.positionID > b.positionID ? 1 : a.positionID < b.positionID ? -1 : 0;
                        });

                        var sortArr = falseComp.concat(trueComp);
                        var fullAmount = 0; 

                        for(var i=0; i<= sortArr.length-1; i++){
                            if (!sortArr[i].compound) {
                                sortArr[i].amount = parseFloat(obj.amount * sortArr[i].rate / 100);
                                fullAmount += sortArr[i].amount;
                            }else if(sortArr[i].compound){
                                fullAmount +=  parseFloat(obj.amount);
                                sortArr[i].amount = parseFloat(fullAmount * sortArr[i].rate / 100);
                            }
                        }
         
                        var y = taxArr.length;

                        while(y--){
                            for(var i=0; i<= sortArr.length-1; i++){
                                if (taxArr[y] && (sortArr[i].taxName === taxArr[y].taxName)) {
                                    taxArr[y].salesTax = parseFloat(taxArr[y].salesTax - sortArr[i].amount);
                                    if (taxArr[y].salesTax <= 0) {
                                        taxArr.splice(y,1)
                                    }
                                }
                            }
                        }
                  
                    }
                }
            },

            ReverseTax: function(obj, productArray) {
       
                var arr = [];
                var results = [];
                var calculateCompound = [];
                var falseComp = [];
                var trueComp = [];
                var tcopmAmount = 0;
                var fcompAmount = 0;
                var finalCal = 0;
                var tax = 0;

                for (var i = productArray.val.length - 1; i >= 0; i--) {

                    if (productArray.val[i].tax.type == "individualtaxes") {
                        arr.push(productArray.val[i].tax.taxName)

                    } else if (productArray.val[i].tax.type == "multipletaxgroup") {
                        for (var x = productArray.val[i].tax.individualTaxes.length - 1; x >= 0; x--) {
                            arr.push(productArray.val[i].tax.individualTaxes[x].taxName)
                        }
                    }
                }

                var sorted_arr = arr.sort();
                var results = [];
                for (var i = 0; i < arr.length - 1; i++) {
                    if (sorted_arr[i + 1] == sorted_arr[i]) {
                        results.push(sorted_arr[i]);
                    }
                }
                if (obj.tax != null) {
                    if (obj.tax.type == "individualtaxes") {

                        for (var x = taxArr.length - 1; x >= 0; x--) {
                            if (taxArr[x].taxName == obj.tax.taxName) {
                                if ($.inArray(obj.tax.taxName, results) == -1) {
                                    taxArr.splice(x, 1);
                                    console.log(taxArr);
                                } else if ($.inArray(obj.tax.taxName, results) == 0) {
                                    taxArr[x].salesTax = parseFloat(taxArr[x].salesTax) - parseFloat(obj.amount * obj.tax.rate / 100);
                                    console.log(taxArr[x].salesTax);
                                }
                            }
                        }
                    } else if (obj.tax.type == "multipletaxgroup") {
                        for (var x = obj.tax.individualTaxes.length - 1; x >= 0; x--) {

                            if (obj.tax.individualTaxes[x].compound == false) {
                                falseComp.push(obj.tax.individualTaxes[x]);
                                console.log(falseComp);

                            } else if (obj.tax.individualTaxes[x].compound == true) {
                                trueComp.push(obj.tax.individualTaxes[x])
                                console.log(trueComp);
                                compountTrue = trueComp.sort(function(a, b) {
                                    return a.positionID > b.positionID ? 1 : a.positionID < b.positionID ? -1 : 0;
                                });
                                console.log(compoundtrue);
                            }
                        }
                        calculateCompound = falseComp.concat(compountTrue);
                        console.log(calculateCompound);

                        var fcompAmount = 0;
                        var taxAmount = 0;
                        for (var x = 0; x <= obj.tax.individualTaxes.length - 1; x++) {

                            tax = obj.tax.individualTaxes[x].rate / 100;
                            for (var y = taxArr.length - 1; y >= 0; y--) {

                                if (taxArr[y].taxName == obj.tax.individualTaxes[x].taxName) {

                                    for (var ps = 0; ps <= results.length; ps++) {
                                        if (results[ps] == obj.tax.individualTaxes[x].taxName) {
                                            for (var z = calculateCompound.length - 1; z >= 0; z--) {
                                                if (calculateCompound[z].compound == false) {
                                                    fcompAmount = parseFloat(obj.amount * obj.tax.individualTaxes[z].rate / 100)
                                                    console.log(fcompAmount);
                                                }
                                            }

                                            if (obj.tax.individualTaxes[x].compound == false) {
                                                taxArr[y].salesTax = parseFloat(taxArr[y].salesTax - (obj.amount * obj.tax.individualTaxes[x].rate / 100));
                                                results.splice(ps, 1);
                                                console.log(results);
                                            } else if (obj.tax.individualTaxes[x].compound == true) {
                                                tcopmAmount = parseFloat(fcompAmount + obj.amount);
                                                console.log(tcopmAmount);
                                                finalCal = (parseFloat(finalCal + tcopmAmount) * obj.tax.individualTaxes[x].rate / 100);

                                                taxArr[y].salesTax = parseFloat(taxArr[y].salesTax - finalCal);
                                                console.log(finalCal);
                                            }

                                        } else if ($.inArray(obj.tax.individualTaxes[x].taxName, results) == -1) {
                                            taxArr.splice(y, 1);
                                            console.log(taxArr);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },

        }
    }

})();
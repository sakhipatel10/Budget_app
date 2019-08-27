// BUDGET_CONTROLLER
var budget_Controller = (function() {
    
    var _Expense = function(id, descriptn, value) {
        this.id = id;
        this.descriptn = descriptn;
        this.value = value;
        this.percent = -1;
    };
    
    
    _Expense.prototype.calc_Percent = function(total_Income) {
        if (total_Income > 0) {
            this.percent = Math.round((this.value / total_Income) * 100);
        } else {
            this.percent = -1;
        }
    };
    
    
    _Expense.prototype.getPercent = function() {
        return this.percent;
    };
    
    
    var _Income = function(id, descriptn, value) {
        this.id = id;
        this.descriptn = descriptn;
        this.value = value;
    };
    
    
    var calculate_Total = function(type) {
        var sum = 0;
        dataStore.all_Items[type].forEach(function(cur) {
            sum += cur.value;
        });
        dataStore.total[type] = sum;
    };
    
    
    var dataStore = {
        all_Items: {
            exp: [],
            inc: []
        },
        total: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percent: -1
    };
    
    
    return {
        add_Item: function(type, des, val) {
            var newItem, ID;
            
            
            //[1 2 7 8 9], next ID = 10
            // ID = last ID + 1
            
            // Create new ID
            if (dataStore.all_Items[type].length > 0) {
                ID = dataStore.all_Items[type][dataStore.all_Items[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            
            // Create new item using income and expense constructor
            if (type === 'exp') {
                newItem = new _Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new _Income(ID, des, val);
            }
            
            // Push it in data store
            dataStore.all_Items[type].push(newItem);
            
            // Return new item
            return newItem;
        },
        
        
        delete_Item: function(type, id) {
            var ids, index;
            
            // id = 6
            //dataStore.all_Items[type][id];
            // ids = [1 2 5 6 9]
            //index = 3
            
            ids_arr = dataStore.all_Items[type].map(function(curr) {
                return curr.id;
            });

            index = ids_arr.indexOf(id);

            if (index !== -1) {
                dataStore.all_Items[type].splice(index, 1);
            }
            
        },
        
        
        calculate_Budget: function() {
            
            // Calculate total sum of income and expenses
            calculate_Total('exp');
            calculate_Total('inc');
            
            //  budget = income - expense
            dataStore.budget = dataStore.total.inc - dataStore.total.exp;
            
            // calculate the percentage income that we spent
            if (dataStore.total.inc > 0) {
                dataStore.percent = Math.round((dataStore.total.exp / dataStore.total.inc) * 100);
            } else {
                dataStore.percent = -1;
            }            
            
           
        },
        
        calculate_Percentage: function() {
            
           
            dataStore.all_Items.exp.forEach(function(cur) {
               cur.calc_Percent(dataStore.total.inc);
            });
        },
        
        
        get_Percentage: function() {
            var all_Perc = dataStore.all_Items.exp.map(function(curr) {
                return curr.getPercent();
            });
            return all_Perc;
        },
        
        
        get_Budget: function() {
            return {
                budget: dataStore.budget,
                total_Inc: dataStore.total.inc,
                total_Exp: dataStore.total.exp,
                percent: dataStore.percent
            };
        }
    };
    
})();




// UI CONTROLLER
var UIController = (function() {
    
    var DOM_Strings = {
        input_Type: '.add_type',
        input_Description: '.add_description',
        input_Value: '.add_value',
        input_Btn: '.add_btn',
        income_Container: '.income_list',
        expense_Container: '.expenses_list',
        budget_Label: '.budget_value',
        income_Label: '.budget_income-value',
        expenses_Label: '.budget_expenses-value',
        percent_Label: '.budget_expenses-percentage',
        container: '.container',
        expensesPerc_Label: '.item_percentage',
        date_Label: '.budget_title_month'
    };
    
    
    var format_Number = function(number, type) {
        var numberSplit, intt, decimal, type;
       
        number = Math.abs(number);
        number = number.toFixed(2);

        numberSplit = number.split('.');

        intt = numberSplit[0];
        if (intt.length > 3) {
            intt = intt.substr(0, intt.length - 3) + ',' + intt.substr(intt.length - 3, 3); 
        }

        decimal = numberSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + intt + '.' + decimal;

    };
    
    
    var nodeList_ForEach = function(list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };
    
    
    return {
        getInput: function() {
            return {
                type: document.querySelector(DOM_Strings.input_Type).value, // Will be either inc or exp
                descriptn: document.querySelector(DOM_Strings.input_Description).value,
                value: parseFloat(document.querySelector(DOM_Strings.input_Value).value)
            };
        },
        
        
        addToList: function(obj, type) {
            var html, new_Html, element;
            
            // Create HTML string 
            
            if (type === 'inc') {
                element = DOM_Strings.income_Container;
                
                html = '<div class="item clearfix" id="inc-%id%"> <div class="item_description">%description%</div><div class="right clearfix"><div class="item_value">%value%</div><div class="item_delete"><button class="item_delete-btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOM_Strings.expense_Container;
                
                html = '<div class="item clearfix" id="exp-%id%"><div class="item_description">%description%</div><div class="right clearfix"><div class="item_value">%value%</div><div class="item_percentage">21%</div><div class="item_delete"><button class="item_delete-btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            
            
            // Replace with some actual data
            new_Html = html.replace('%id%', obj.id);
            new_Html = new_Html.replace('%description%', obj.descriptn);
            new_Html = new_Html.replace('%value%', format_Number(obj.value, type));
            
           
            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', new_Html);
        },
        
        
        deleteFromList: function(select_ID) {
            
            var elemnt = document.getElementById(select_ID);
            elemnt.parentNode.removeChild(elemnt);
            
        },
        
        
        clear_Fields: function() {
            var all_fields, fields_Arr;
            
            all_fields = document.querySelectorAll(DOM_Strings.input_Description + ', ' + DOM_Strings.input_Value);
            
            fields_Arr = Array.from(all_fields);
            
            fields_Arr.forEach(function(current, index, array) {
                current.value = "";
            });
            
            fields_Arr[0].focus();
        },
        
        
        display_Budget: function(obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            
            document.querySelector(DOM_Strings.budget_Label).textContent = format_Number(obj.budget, type);
            document.querySelector(DOM_Strings.income_Label).textContent = format_Number(obj.total_Inc, 'inc');
            document.querySelector(DOM_Strings.expenses_Label).textContent = format_Number(obj.total_Exp, 'exp');
            
            if (obj.percent > 0) {
                document.querySelector(DOM_Strings.percent_Label).textContent = obj.percent + '%';
            } else {
                document.querySelector(DOM_Strings.percent_Label).textContent = '---';
            }
            
        },
        
        
        display_Percentage: function(percentages) {
            
            var all_fields = document.querySelectorAll(DOM_Strings.expensesPerc_Label);
            
            nodeList_ForEach(all_fields, function(curr, index) {
                
                if (percentages[index] > 0) {
                    curr.textContent = percentages[index] + '%';
                } else {
                    curr.textContent = '---';
                }
            });
            
        },
        
        
        displayMonth: function() {
            var now, allmonths, month, year;
            
            now = new Date();
            //var christmas = new Date(2016, 11, 25);
            
            allmonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();
            
            year = now.getFullYear();
            document.querySelector(DOM_Strings.date_Label).textContent = allmonths[month] + ' ' + year;
        },
        
        
        changed_Type: function() {
            
            var all_fields = document.querySelectorAll(
                DOM_Strings.input_Type + ',' +
                DOM_Strings.input_Description + ',' +
                DOM_Strings.input_Description + ',' +
                DOM_Strings.input_Value);
            
            nodeList_ForEach(all_fields, function(curr) {
               curr.classList.toggle('red-focus'); 
            });
            
            document.querySelector(DOM_Strings.input_Btn).classList.toggle('red');
            
        },
        
        
        getDOM_Strings: function() {
            return DOM_Strings;
        }
    };
    
})();




// GLOBAL APP CONTROLLER
var controller = (function(budget_Ctrl, UI_Ctrl) {
    
    var setup_EventListeners = function() {
        var DOM = UI_Ctrl.getDOM_Strings();
        
        document.querySelector(DOM.input_Btn).addEventListener('click', ctrl_AddItem);

        document.addEventListener('keypress', function(event) {
            if (event.keyCode === 13) {
                ctrl_AddItem();
            }
        });
        
        document.querySelector(DOM.container).addEventListener('click', ctrl_DeleteItem);
        
        document.querySelector(DOM.input_Type).addEventListener('change', UI_Ctrl.changed_Type);        
    };
    
    
    var update_Budget = function() {
        
        // 1. Calculate budget
        budget_Ctrl.calculate_Budget();
        
        // 2. Return budget to variable
        var budget = budget_Ctrl.get_Budget();
        
        // 3. Display budget to UI
        UI_Ctrl.display_Budget(budget);
    };
    
    
    var update_percent = function() {
        
        // 1. Calculate percentages
        budget_Ctrl.calculate_Percentage();
        
        // 2. Get percentages from budget controller
        var percentages = budget_Ctrl.get_Percentage();
        
        // 3. Update UI with the updated percentages
        UI_Ctrl.display_Percentage(percentages);
    };
    
    
    var ctrl_AddItem = function() {
        var input, newItem;
        
        // 1. Get field input data
        input = UI_Ctrl.getInput();        
        
        if (input.descriptn !== "" && !isNaN(input.value) && input.value > 0) {
            // 2. Add item to budget controller
            newItem = budget_Ctrl.add_Item(input.type, input.descriptn, input.value);

            // 3. Add item to UI
            UI_Ctrl.addToList(newItem, input.type);

            // 4. Clear fields
            UI_Ctrl.clear_Fields();

            // 5. Calculate and update budget
            update_Budget();
            
            // 6. Calculate and update percents
            update_percent();
        }
    };
    
    
    var ctrl_DeleteItem = function(event) {
        var item_ID, split_ID, type, ID;
        
        item_ID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if (item_ID) {
            
            //inc-1
            split_ID = item_ID.split('-');
            type = split_ID[0];
            ID = parseInt(split_ID[1]);
            
            // 1. delete item from the data store
            budget_Ctrl.delete_Item(type, ID);
            
            // 2. Delete item from the UI
            UI_Ctrl.deleteFromList(item_ID);
            
            // 3. Update and show the new budget
            update_Budget();
            
            // 4. Calculate and update percentages
            update_percent();
        }
    };
    
    
    return {
        init: function() {
            console.log('Application has started.');
            UI_Ctrl.displayMonth();
            UI_Ctrl.display_Budget({
                budget: 0,
                total_Inc: 0,
                total_Exp: 0,
                percent: -1
            });
            setup_EventListeners();
        }
    };
    
})(budget_Controller, UIController);


controller.init();

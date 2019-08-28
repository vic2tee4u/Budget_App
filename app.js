// Budget Controller
var budgetController = (function() {
	// DOM Objects
	var Expense = function(id, value, description) {
		this.id = id;
		this.value = value;
		this.description = description;
		this.percentage = -1
	};

	Expense.prototype.calcPercentage = function (totalIncome) {
		if (totalIncome > 0) {
			this.percentage = Math.round((this.value / totalIncome) * 100)
		} else {
			this.percentage = -1
		}
	}

	Expense.prototype.getPercentage = function () {
		return this.percentage;
	}

	var Income = function(id, value, description) {
		this.id = id;
		this.value = value;
		this.description = description;
	};

	var calculateTotal = function (type) {
		var sum = 0;
		data.allItems[type].forEach((curr) => {
			sum += curr.value
		})
		data.total[type] = sum
	}

	var data = {
		allItems: {
			exp: [],
			inc: [],
		},
		total: {
			exp: 0,
			inc: 0,
		},
		budget : 0,
		percentage: -1
	};

	return {
		addItem: function(type, des, val) {
			var newItem;
			// Create New Id
			if (data.allItems[type].length > 0) {
				ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
			} else {
				ID = 0;
			}
			//Create new item based on inc or exp type
			if (type === 'exp') {
				newItem = new Expense(ID, val, des);
			} else if (type === 'inc') {
				newItem = new Income(ID, val, des);
			}

			//push into data structure
			data.allItems[type].push(newItem);

			//Return the new element
			return newItem;
		},
		deleteItem: function (type, id) {
			var ids, index
			ids = data.allItems[type].map((el) => {
				return el.id
			})

			index = ids.indexOf(id)
			if (index !== -1) {
				data.allItems[type].splice(index, 1);
			}
		},
		calculateBudget: function() {
			// calculate total income and expense
			calculateTotal('exp')
			calculateTotal('inc')
			// Calculate the budget: income - expenses
			data.budget = data.total.inc - data.total.exp
			// Calculate the percentage of income that we spent
			if (data.total.inc > 0) {
				data.percentage = Math.round((data.total.exp / data.total.inc) * 100)
			} else {
				data.percentage = -1
			}
		},

		calculatePercentages: function () {

			data.allItems.exp.forEach((curr) => {
				curr.calcPercentage(data.total.inc)
			})
		},

		getPercentages: function () {
			var allPerc = data.allItems.exp.map((curr) => {
				return curr.getPercentage()
			})
			return allPerc
		},

		getBudget: function () {
			return {
				budget: data.budget,
				totalInc: data.total.inc,
				totalExp: data.total.exp,
				percentage: data.percentage
			}
		},
		testing: function() {
			console.log(data);
		},
	};
})();

// The UI Controller
var UIController = (function() {
	// DOM_Query Variables
	var DOMstrings = {
		inputType: '.add__type',
		inputDesc: '.add__description',
		inputValue: '.add__value',
		inputBtn: '.add__btn',
		incomeContainer: '.income__list',
		expenseContainer: '.expenses__list',
		budgetLabel: '.budget__value',
		incomeLabel: '.budget__income--value',
		expenseLabel: '.budget__expenses--value',
		percentageLabel: '.budget__expenses--percentage',
		container: '.container',
		expensesPercentageLabel: '.item__percentage',
		dateLabel: '.budget__title--month'
	};
	var formatNumber = function(num, type) {
		var numSplit,int,dec,sign

		num = Math.abs(num);
		num = num.toFixed(2);
		numSplit = num.split('.')
		int = numSplit[0];

		if (int.length > 3) {
			int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3,3);
		}
		dec = numSplit[1];

		return 	(type === 'exp' ?  '-': '+') + ' ' + int + '.' + dec
	}

	var nodeListForEach = function (list, callback) {
		for (var i = 0; i < list.length; i ++) {
			callback(list[i], i)
		}
	}

	return {
		getinput: function() {
			return {
				type: document.querySelector(DOMstrings.inputType).value,
				description: document.querySelector(DOMstrings.inputDesc).value,
				value: parseFloat(document.querySelector(DOMstrings.inputValue).value),
			};
		},

		addListItem: function(obj, type) {
			//Create HTML stirng with placeholder text
			var html, newHtml, element;
			if (type === 'inc') {
				element = DOMstrings.incomeContainer;
				html =
					'<div class="item clearfix" id="inc-%ID%"><div class="item__description">%DESCRIPTION%</div><div class="right clearfix"><div class="item__value">%VALUE%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			} else if (type === 'exp') {
				element = DOMstrings.expenseContainer;
				html =
					'<div class="item clearfix" id="exp-%ID%"><div class="item__description">%DESCRIPTION%</div><div class="right clearfix"><div class="item__value">%VALUE%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			}

			//Replace the placeholder text with actual data
			newHtml = html.replace('%ID%', obj.id);
			newHtml = newHtml.replace('%VALUE%', formatNumber(obj.value, type));
			newHtml = newHtml.replace('%DESCRIPTION%', obj.description);

			//Insert the HTML into the DOM
			document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
		},

		deleteListItem: function (selectorID) {
			var el = document.getElementById(selectorID)
			el.parentNode.removeChild(el)
		},

		clearFields: function() {
			var fields, fieldsArray;

			fields = document.querySelectorAll(
				DOMstrings.inputDesc + ',' + DOMstrings.inputValue,
			);
			fieldsArray = Array.prototype.slice.call(fields);
			fieldsArray.forEach(curr => {
				curr.value = '';
			});
			fieldsArray[0].focus();
		},

		displayBugdet: function (obj) {
			var type
			obj.budget > 0 ? type ='inc' : type= 'exp'
			document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type)
			document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc')
			document.querySelector(DOMstrings.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp')

			if (obj.percentage > 0) {
				document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%'
			} else {
				document.querySelector(DOMstrings.percentageLabel).textContent = '---'
			}
			
		},
		displayPercentages : function (percentages) {
			var fields = document.querySelectorAll(DOMstrings.expensesPercentageLabel);

			nodeListForEach(fields, function (current, index) {
				if (percentages[index] > 0) {
					current.textContent = percentages[index] + '%'
				} else {
					current.textContent = '---'
				}
			})
		},

		displayMonth: function () {
			var now, year, month, months
			months = ['Januar', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November','December']
			now = new Date()
			year = now.getFullYear()
			month = now.getMonth()
			document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year
		},

		changedType: function () {
			var fields = document.querySelectorAll(DOMstrings.inputType + ',' + DOMstrings.inputDesc + ',' + DOMstrings.inputValue)

			nodeListForEach(fields, function(curr) {
				curr.classList.toggle('red-focus')
			})

			document.querySelector(DOMstrings.inputBtn).classList.toggle('red')
		},
 		
		getDOMstrings: function() {
			return DOMstrings;
		},
	};
})();

// Global App Controller
var controller = (function(budgetCtrl, UICntrl) {
	var setupEventListeners = function() {
		var DOM = UICntrl.getDOMstrings();
		document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
		document.addEventListener('keypress', function(event) {
			if (event.keyCode === 13 || event.which === 13) {
				ctrlAddItem();
			}
		});

		document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem)
		document.querySelector(DOM.inputType).addEventListener('change', UICntrl.changedType)
	};

	var updateBudget = function() {
		// 1. Calculate the budget
		budgetCtrl.calculateBudget()
		// 2. Returns the Budget
		var budget = budgetCtrl.getBudget()
		// 3. Display the Budget on the UI
		UICntrl.displayBugdet(budget)		
	};

	var updatePercentages = function () {

		//1. Calculate percentages
		budgetCtrl.calculatePercentages()
		// 2. Read percentages from the budget controller
		var percentages = budgetCtrl.getPercentages()
		// 3. Update the UI with the new percentages
		UICntrl.displayPercentages(percentages)		
	}

	var ctrlAddItem = function() {
		var input, newItem;
		// 1. Get the field input data
		input = UICntrl.getinput();

		if (input.description !== '' && !isNaN(input.value) && input.value > 0) {
			// 2. Add the item to the budget controller
			newItem = budgetCtrl.addItem(input.type, input.description, input.value);
			// 3. Add the item to the UI interface
			UICntrl.addListItem(newItem, input.type);
			// 3.1 Clear the fields
			UICntrl.clearFields();
			// 4. Calculate and update budget
			updateBudget();

			// 5. Update percentages
			updatePercentages();
		}
	};
	
	var ctrlDeleteItem = function (event) {
		var itemID, splitID, type, ID

		itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
		console.log(itemID);

		if (itemID) {
			splitID = itemID.split('-')
			type = splitID[0]
			ID = parseInt(splitID[1])

			// 1. Delet the item from the data structure.
			budgetCtrl.deleteItem(type, ID)

			//2. Delete Item from User interface.
			UICntrl.deleteListItem(itemID)

			//3.Update and show the new budget.
			updateBudget();

			// 4. Update Percentages
			updatePercentages();
		}
		
	}

	return {
		init: function() {
			setupEventListeners();
			UICntrl.displayMonth();
			UICntrl.displayBugdet({
				budget: 0,
				totalInc: 0,
				totalExp: 0,
				percentage: -1
			})		
			console.log('Application has started');
		},
	};
})(budgetController, UIController);

controller.init();

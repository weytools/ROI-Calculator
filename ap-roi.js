MktoForms2.loadForm("https://info.emburse.com", "496-CPG-762", 2008, function(form) {
	form.onSuccess(function() {
		return false;
	})
});
// LISTENERS
window.addEventListener('load', (event) => {
	// Update values from sliders
	jQuery('input.costs-slider').each(function(){
		var slider = jQuery(this)
		var numberLabel = slider.prev().find('.short-tran')
		
		slider.on('input', (function () {
				numberLabel.html(Number(slider.val()).toLocaleString());
			})
		)
	})
	// Animate values
	jQuery('input.costs-slider').each(function(){
		var slider = jQuery(this)
		var numberLabel = slider.prev().find('.short-tran')
		slider.mouseover(function () {
			numberLabel.addClass("text-larger");
		})
		slider.mouseout(function () {
			numberLabel.removeClass("text-larger");
		})
	})
	// Enable button if text entered in all fields
	document.getElementById("firstNameInput").addEventListener("keyup", enableButtonOnInput);
	document.getElementById("lastNameInput").addEventListener("keyup", enableButtonOnInput);
	document.getElementById("emailInput").addEventListener("keyup", enableButtonOnInput);
	document.getElementById("companyInput").addEventListener("keyup", enableButtonOnInput);
	document.getElementById("countryInput").addEventListener("change", enableButtonOnInput);
	
	// Manually send form AJAX
	var sentData = false;
	jQuery(document).ready(function () {
		var calcButton = jQuery('#calculateButton')
		calcButton.click(function (e) {
			e.preventDefault()
			if (!sentData) {
				jQuery('#calculatedROIInput').val(getDelta());
				jQuery.ajax({
					type: 'POST',
					url: 'https://snippet.omm.crownpeak.com/p/cb8d3c03-852d-4791-99a3-33a4aca9935d',
					data: jQuery('#roiForm').serialize()
				})
				sentData = true
				sendMarketoData()
			};
			hideResults();
			showButtonSpinner();
			return false;
		});
	});
	
});

function enableButtonOnInput() {
	var firstNameInput = document.getElementById('firstNameInput').value;
	var lastNameInput = document.getElementById('lastNameInput').value;
	var emailInput = document.getElementById('emailInput').value;
	var companyInput = document.getElementById('companyInput').value;
	var countryInput = document.getElementById('countryInput').value;

	if (firstNameInput != '' && lastNameInput != '' && emailInput != '' && companyInput != '' && countryInput != '') {
		enableBtn();
	} else {
		disableBtn();
	}
};



// Spinner visual
function showButtonSpinner() {
	var spinner = jQuery('#btnSpinner');
	var btnText = jQuery('#btnText');

	disableBtn();
	spinner.removeClass("d-none");
	btnText.html("");
	setTimeout(function () {
		spinner.addClass("d-none");
		btnText.html("Recalculate");
		enableBtn();
		updateResults();
		showResults();
		scrollToResults();
	}, 800);
};

// Calculations
function getDelta() {
	const checkCostCur = 8.0;
	const checkCostEmb = 2.5;
	const custRebate = 0.008;
	const cardConversion = 0.2;

	var monthlyAP = jQuery('#monthlySpendInput').val();
	var checkPercent = jQuery('#checkPercentInput').val() / 100;
	var checkQty = jQuery('#checkQuantityInput').val();

	var currentState = 0 - (checkQty * checkCostCur * 12);
	var checkF = 0 - (checkQty * 0.8 * checkCostEmb * 12);
	var cardF = monthlyAP * checkPercent * cardConversion * custRebate * 12;
	var futureState = checkF + cardF;

	var delta = futureState - currentState;
	return parseInt(delta);
};

function getAPSavings(){
	const invCostCur = 10
	const invCostEmb = 2
	var invoiceQty = jQuery('#invoiceQuantityInput').val()
	let savings = invoiceQty * (invCostCur - invCostEmb)
	return parseInt(savings);
}

// Helper Functions
function disableBtn() {
	document.getElementById('calculateButton').setAttribute('disabled', null);
};
function enableBtn() {
	document.getElementById('calculateButton').removeAttribute('disabled');
};
function showResults() {	
	jQuery('#resultsPlaceholder').addClass('d-none')
	jQuery('#resultsSection .results-section').each(function(i){
		var section = jQuery(this)
		setTimeout(() => {
			section.addClass('reveal')
		}, i*300);
	})
};

const inlineSpinner = '<div class="spinner-border spinner-border-sm inline-spinner" role="status"></div>'
function hideResults() {
	jQuery('#b2bResults').html(inlineSpinner)
	jQuery('#apResults').html(inlineSpinner)
	jQuery('#combinedResults').html(inlineSpinner)
}
function updateResults() {
	var b2bResults = getDelta()
	var apResults = getAPSavings()
	var combinedResults = b2bResults + apResults
	jQuery('#b2bResults').html("$" + Number(b2bResults).toLocaleString())
	jQuery('#apResults').html("$" + Number(apResults).toLocaleString())
	jQuery('#combinedResults').html("$" + Number(combinedResults).toLocaleString())
};
function scrollToResults() {
	jQuery('html, body').animate({ scrollTop: jQuery("#resultsSection").offset().top }, 1000);
}

// Marketo
function sendMarketoData() {

	const mkto = MktoForms2.getForm(2008);
	
	// check for new fields
	if (mkto.vals().Calculator_Type__c == undefined)
		mkto.addHiddenFields({'Calculator_Type__c':'AP ROI'})
	
	var valsToMkto = {
		"Company": jQuery("#companyInput").val(),
		"Country": jQuery("#countryInput").val(),
		"Email": jQuery("#emailInput").val(),
		"Estimated_ROI__c": getDelta(),
		"FirstName": jQuery("#firstNameInput").val(),
		"LastName": jQuery("#lastNameInput").val(),
		"Non_payroll_Monthly_AP_Spend__c": jQuery("#monthlySpendInput").val(),
		"Number_of_Checks__c": jQuery("#checkQuantityInput").val(),
		"Percentage_By_Check__c": jQuery("#checkPercentInput").val(),
		"Number_of_Invoices_per_month__c": jQuery("#invoiceQuantityInput").val(),
		"Calculator_Type__c": "AP ROI"
	};
	mkto.vals(valsToMkto);
	mkto.submit();
}

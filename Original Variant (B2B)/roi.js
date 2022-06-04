// Update referring page value
var referrer = document.referrer;
document.getElementById('referringPage').value = referrer;

// Update values from sliders
jQuery(document).on('input', '#monthlySpendInput', function () {
	jQuery('#monthlyValue').html(Number(jQuery(this).val()).toLocaleString());
});
jQuery(document).on('input', '#checkPercentInput', function () {
	jQuery('#percentValue').html(Number(jQuery(this).val()).toLocaleString());
});
jQuery(document).on('input', '#checkQuantityInput', function () {
	jQuery('#quantityValue').html(Number(jQuery(this).val()).toLocaleString());
});

// Animate values
jQuery('#monthlySpendInput')
	.mouseover(function () {
		jQuery('#monthlyValue').addClass("text-larger");
	})
	.mouseout(function () {
		jQuery('#monthlyValue').removeClass("text-larger");
	});
jQuery('#checkPercentInput')
	.mouseover(function () {
		jQuery('#percentValue').addClass("text-larger");
	})
	.mouseout(function () {
		jQuery('#percentValue').removeClass("text-larger");
	});
jQuery('#checkQuantityInput')
	.mouseover(function () {
		jQuery('#quantityValue').addClass("text-larger");
	})
	.mouseout(function () {
		jQuery('#quantityValue').removeClass("text-larger");
	});

// Enable button if text entered in all fields
document.getElementById("firstNameInput").addEventListener("keyup", enableButtonOnInput);
document.getElementById("lastNameInput").addEventListener("keyup", enableButtonOnInput);
document.getElementById("emailInput").addEventListener("keyup", enableButtonOnInput);


function enableButtonOnInput() {
	var firstNameInput = document.getElementById('firstNameInput').value;
	var lastNameInput = document.getElementById('lastNameInput').value;
	var emailInput = document.getElementById('emailInput').value;

	if (firstNameInput != '' && lastNameInput != '' && emailInput != '') {
		enableBtn();
	} else {
		disableBtn();
	}
};

// Manually send form AJAX
var sentData = false;
jQuery(document).ready(function () {
	var roiForm = jQuery('#roiForm');
	roiForm.submit(function () {
		if (!sentData) {
			jQuery.post(jQuery(this).attr('action'), jQuery(this).serialize()).always(function () {
				sentData = true;
			});
			sendMarketoData();
		};

		hideResults();
		showButtonSpinner();
		return false;
	});
});

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
		updateResults(getDelta());
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

// Helper Functions
function disableBtn() {
	document.getElementById('calculateButton').setAttribute('disabled', null);
};
function enableBtn() {
	document.getElementById('calculateButton').removeAttribute('disabled');
};
function showResults() {
	jQuery('#resultsSection').fadeIn(800);

};
function hideResults() {
	jQuery('#resultsSection').css({ 'display': 'none' });
}
function updateResults(delta) {
	jQuery('#resultsValue').html("$" + Number(delta).toLocaleString());
};
function scrollToResults() {
	jQuery('html, body').animate({ scrollTop: jQuery("#calculateButton").offset().top }, 1000);
}

// Marketo
function sendMarketoData() {

	const mkto = MktoForms2.getForm(2008);
	var valsToMkto = {
		"Company": jQuery("#companyInput").val(),
		"Country": jQuery("#countryInput").val(),
		"Email": jQuery("#emailInput").val(),
		"Estimated_ROI__c": getDelta(),
		"FirstName": jQuery("#firstNameInput").val(),
		"LastName": jQuery("#lastNameInput").val(),
		"Non_payroll_Monthly_AP_Spend__c": jQuery("#monthlySpendInput").val(),
		"Number_of_Checks__c": jQuery("#checkQuantityInput").val(),
		"Percentage_By_Check__c": jQuery("#checkPercentInput").val()
	};
	mkto.vals(valsToMkto);
	mkto.submit();
}


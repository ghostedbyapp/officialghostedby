
// Report Button
var reportButton = $("#report-btn");

// Lookup Button
var lookupButton = $("#lookup-btn");

// Contents of top five end up in here
var div = $("#trending-report");
var company = $("#lookup-company").val()

$(document).ready(function(){
  // Click event to capture the searched company
  lookupButton.click(function() {
    company = $("#lookup-company").val()
  });
  $('.modal').modal({
    // Declaring a function to run before the modal opens
    onOpenStart: function() {
      if (company === "") {
        $("#companyName").append("Please enter a company name.")
        $("#report-searched").hide();
      } else {
        $("#report-searched").show();
      $.ajax({
        method: "POST",
        url: "/api/lookup",
        data: companyResult
      })
      .then(function (data) {
        console.log(data);
      
        $("#companyName").append(company)

        // If the company is found in the database, we perform an ajax call to get the total number of times
        // the company has been reported, and display this in the modal.
        if (data.found == true) {
          $.ajax({
            method: "GET",
            url: "/api/ghostedCount/" + data.info.company_id
          }).then(function(count) {
            console.log(count[0]);
            $("#timesReported").append("This company has been reported " + count[0].ghostedCounts[0].count + " time(s).")
          })

          // If the company is not in the database, we display a generic message.
        } else {
          $("#timesReported").append("This company has not yet been reported.")
        }
        // $("#report-searched").click(function() {
        //   reportCompany(companyResult)
        // })
      });
      }
      
    },
    onCloseEnd: function() {
      $("#companyName").empty();
      $("#timesReported").empty();
      $("#lookup-company").val("");
      companyResult = {};
    }
  });

  getLifetimeReport()
});

lookupButton.click(function() {
  console.log(company)
})
function getLifetimeReport() {
  $.ajax({
    method: "POST",
    url: "/api/lifetime"
  })
  .then(function(data) {
    $("#timeframe").text("Total reports")
    displayReport(data);
  })
}

function get30DayReport() {
  $.ajax({
    method: "POST",
    url: "/api/last30days"
  })
  .then(function(data) {
    $("#timeframe").text("Reports in the last 30 days")
    displayReport(data);
  })
}

function get7DayReport() {
  $.ajax({
    method: "POST",
    url: "/api/last7days"
  })
  .then(function(data) {
    $("#timeframe").text("Reports in the last 7 days")
    displayReport(data);
  })
}

function displayReport(report) {
  $("#report-display").empty();
  for (var i in report) {
    var newCompany = $("<tr>");
    var companyName = $("<td>").text(report[i].company_name);
    var count = $("<td class='countCol'>").text(report[i].ghostedCounts[0].count)
    newCompany.append(companyName);
    newCompany.append(count);
    $("#report-display").append(newCompany);
  }
}

function reportCompany(company) {
  $.ajax({
    method: "POST",
    url: "/api/report",
    data: company
  })
    .then(function (data) {
      // Clear textfield
      $("#report-company").val('');
    });
}

// Event listeners that allow user to swich information being displayed
$("#lifetime").on("click", getLifetimeReport);
$("#30day").on("click", get30DayReport);
$("#7day").on("click", get7DayReport);
   
$("#report-searched").on("click", function() {
  reportCompany(companyResult);
  $("#report-searched").hide();
  $("#timesReported").empty();
  $("#timesReported").append("Company succesfully reported. Click close to continue searching.");
});

var autocompleteReport;
var autocompleteLookup;

var componentForm = {
  street_number: 'short_name',
  route: 'long_name',
  locality: 'long_name',
  administrative_area_level_1: 'short_name',
  country: 'long_name',
  postal_code: 'short_name'
};

var companyResult = {};

function initAutocomplete() {

  console.log("initAutocomplete()")

  // Create the autocomplete object
  // autocompleteReport = new google.maps.places.Autocomplete(
  //   document.getElementById('report-company'), { types: ['establishment'] });

  autocompleteLookup = new google.maps.places.Autocomplete(
    document.getElementById('lookup-company'), { types: ['establishment'] });

  // Avoid paying for data that you don't need by restricting the set of
  // place fields that are returned to just the address components.
  // autocompleteReport.setFields('address_components');
  autocompleteLookup.setFields('address_components');

  // When the user selects an address from the drop-down, populate the
  // address fields in the form.
  // autocompleteReport.addListener('place_changed', getCompanyReportedName);
  autocompleteLookup.addListener('place_changed', getCompanyLookupName);
}

function getCompanyReportedName() {

  var place = autocompleteReport.getPlace();

  document.getElementById("report-company").value = '';
  document.getElementById("report-company").value = place.name;

  fillInAddress(place)
}

function getCompanyLookupName() {

  var place = autocompleteLookup.getPlace();

  document.getElementById("lookup-company").value = '';
  document.getElementById("lookup-company").value = place.name;

  fillInAddress(place)
}

function fillInAddress(place) {
  // Get the place details from the autocomplete object.
  //var place = autocomplete.getPlace();

  //console.log("place:", place);
  companyResult['company_name'] = place.name;

  // Get each component of the address from the place details,
  // and then fill-in the corresponding field on the form.
  for (var i = 0; i < place.address_components.length; i++) {
    var addressType = place.address_components[i].types[0];

    //console.log("addressType:", addressType);

    if (componentForm[addressType]) {
      var val = place.address_components[i][componentForm[addressType]];

      companyResult[addressType] = val;
    }
  }
  //console.log("companyResult", companyResult);
}

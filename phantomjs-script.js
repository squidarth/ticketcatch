var page = new WebPage(), testindex = 0, loadInProgress = false;
var Args = require('system').args;

page.onConsoleMessage = function(msg) {
  console.log(msg);
};

page.onLoadStarted = function() {
  loadInProgress = true;
};

page.onLoadFinished = function() {
  loadInProgress = false;
  
};

var steps = [
  function() {
    //Load Login Page
    page.open("https://paydirect.link2gov.com/NYCParking-Plate/ItemSearch");
  },
  function() {
    //Enter Credentials
    page.evaluate(function(Args) {

      var arr = document.getElementsByTagName("form");
      var i;

      for (i=0; i < arr.length; i++) { 
        if (arr[i].getAttribute('method') == "post") {

          arr[i].elements["ItemSearchQuestionUserInput[0].QuestionAnswer"].value=Args[1];
          arr[i].elements["ItemSearchQuestionUserInput[1].QuestionAnswer"].value=Args[2];
          return;
        }
      }
    }, Args);
  }, 
  function() {
    //Login
    page.evaluate(function() {
      var arr = document.getElementsByTagName("form");
      var i;
      for (i=0; i < arr.length; i++) {
        if (arr[i].getAttribute('method') == "post") {
          arr[i].submit();
          return;
        }
      }
    });
  }, 
  function() {
    // Output content of page to stdout after form has been submitted
      //page.includeJs("http://ajax.googleapis.com/ajax/libs/jquery/1.6.1/jquery.min.js", function() {

        page.evaluate(function() {
          console.log("{\"data\": [");
          $(".lineItemRow").each(function(index, tr) {
            console.log("{\"date\": \"" 
              + $(tr).find(".lineItemColumn4Cell").text().replace("\n", "")
              + "\", \"amount\": \""
              + $(tr).find(".lineItemAmountUserInput").attr('value')
              + "\"}, ");
           });        
          console.log("{}]}");
        }); 

        phantom.exit()
    //});
  }
];


interval = setInterval(function() {
  if (!loadInProgress && typeof steps[testindex] == "function") {
    steps[testindex]();
    testindex++;
  }
  if (typeof steps[testindex] != "function") {
    phantom.exit();
  }
}, 50);

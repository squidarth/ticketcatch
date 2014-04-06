$(document).on("ready", function() {
  $("form").on("submit", function(e) {
    e.preventDefault();

    $.ajax({
      method: "POST",
      url: "/registrations", 
      data: {
        state: $(".state").val(),
        phone_number: $(".phone-number").val(),
        license_plate: $(".license-number").val()
      }
    }).done(function(resp) {
      console.log(resp);
    });

    return false;
  });

});

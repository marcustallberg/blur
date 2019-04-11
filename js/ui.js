$(".sizeSelector").click(
	function(e){	
		e.preventDefault();
		blur.setPixelSize($(e.currentTarget).data("pixel-size"));
});
$(".styleSelector").click(
	function(e){	
		e.preventDefault();
		$(".styleSelector").removeClass("active");
		$(e.currentTarget).addClass("active");
		$("#displayBlurStyle").text("Blur style: "+$(e.currentTarget).attr("title"));
		blur.setBlurStyle($(e.currentTarget).data("blur-style"));
});


$("#settingsVisibility").click(
	function(e){
		e.preventDefault();
		$("#settings").slideToggle(150).toggleClass("closed");
		var btnText = $("#settings").hasClass("closed") ? "Show":"Hide";
		btnText+=" settings";
		$(e.currentTarget).text(btnText);
	}
)

$("#mouseBlur").click(
	function(e) {
		e.preventDefault();
		$(e.currentTarget).toggleClass("active");
		blur.blurWithMouse($(e.currentTarget).hasClass("active"));
		var btnText = "Mouseblur ";
		btnText += $(e.currentTarget).hasClass("active") ? "on":"off";
		$(e.currentTarget).text(btnText);
	}
)


$("#iOsPixelSelector > ul > li").click(
	function(e){
		e.preventDefault();
		var pixelSize= $(e.currentTarget).data("pixelsize");
		blur.setPixelSize(pixelSize);
		$("#displayPixelSize").text("Pixelsize: "+pixelSize);
	}
);
$('#slider').slider({
	max:50,
	min:4,
	value:15,
	step:1,
	slide: function( event, ui ) {
		$("#displayPixelSize").text("Pixelsize: "+ui.value);
	},
	stop: function( event, ui ) {
		blur.setPixelSize(ui.value);
	}
});

$('#uploadForm a').click(
	function(e){
		e.preventDefault();
		var imgURL = $("#uploadURL").val();
		$.getImageData({
				url: imgURL,
				success: function(image){
					blur.imgLoaded(image);
		  		},
		  		error: function(){
					$("#uploadURL").val("Doh, something went wrong, try again later.");
		  		}
		  	});
	}
)

if((navigator.userAgent.match(/iPhone/i)) || (navigator.userAgent.match(/iPod/i)) || (navigator.userAgent.match(/iPad/i))) {
	$("#iOsPixelSelector").show();
	$('#slider,#mouseBlur').hide();
}
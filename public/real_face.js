$(document).ready(function(){
	var slideIndex = 1;
	var score = 0;
	$('.score').text("Score: " + score);
	showSlides(slideIndex);

	// Next/previous controls
	function plusSlide(n) {
	  showSlides(slideIndex += n);
	}

	$(".prev").click(function(event){
		plusSlide(-1);
	});

	$(".next").click(function(event){
			plusSlide(1);
	});

	$("input[type='submit']").click(function(event){
		//Check if answer is correct, update the page accordingly
		if($(`.fade:nth-child(${slideIndex}) input[name='answer']`).val() == $(`.fade:nth-child(${slideIndex}) input[name='guess_first_name']`).val()) {
			$(`.fade:nth-child(${slideIndex}) .result`).text("Correct!");
			$(`.fade:nth-child(${slideIndex}) input[name='guess_first_name']`).val("")
			score += 1;
			$('.score').text("Score: " + score);
			setTimeout(function(){
				plusSlide(1)}, 1000);
		}
		else{
			$(`.fade:nth-child(${slideIndex}) .person_info`).css("display", "block");
			$(`.fade:nth-child(${slideIndex}) .result`).text("Incorrect!");
			$('.prev, .next').removeClass("disabled");
			$('.prev, .next').css("background-color", "rgba(0,0,0,0.8)");
		}
		
		event.preventDefault();
	})

	function showSlides(n) {
	  //Hides all slides except for the current slide
	  $('.prev, .next').addClass("disabled");
	  let slides = $(".fade");
	  if (n > slides.length) {
	  	slideIndex = 1;
	  } 
	  if (n < 1) {
	  	slideIndex = slides.length;
	  }

	  for (let i = 1; i <= slides.length; i++) {
	      $(`.fade:nth-child(${i})`).hide();//addClass("disabled"); 
	  }
	  $(`.fade:nth-child(${slideIndex})`).show();//removeClass("disabled"); 
	}
})
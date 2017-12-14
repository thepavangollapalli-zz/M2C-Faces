$(document).ready(function(){
	$("#image_input").change(() => {
		//Go through each selected image and get a signed request URL for it
		let files = $("#image_input")[0].files;
		console.log(files);
		for(let i = 0; i < files.length; i++){
			let file = files[i]
			console.log(file)
			if(!file){
				return alert("No file selected.");
			}
			getSignedRequest(file);
		}
	});
	$("#submit_faces").click(function(event){
		if (!$('#userid').is(':empty')){
		  $('.new_picture').each(function(key, value){
		  			//Constructs JSON object for each image and associated form data
		  		    console.log($(this).children("input"));
		  		    let formData = {
		  		    	user_set: $.trim($("#userid").text()),
		  				first_name: $(this).find("input[name=first_name]").val(),
		  				last_name: $(this).find("input[name=last_name]").val(),
		  				image_url: $(this).find("input[name=image_url]").val(),
		  				major: $(this).find("input[name=major]").val(),
		  				school_year: $(this).find("input[name=school_year]").val(),
		  			}
		  			//Stores form data in backend
		  			$.ajax( {
		  				url:'/real_face',
		  				method: 'PUT',
		  				data: formData,
		  				success: function(response) {
		  					// $(".form_result").append(JSON.stringify(response));
		  					console.log(JSON.stringify(response));
		  				}
		  			});
		  		});
		}
		event.preventDefault();
	})
})

function getSignedRequest(file){
	$.get(`/sign-s3?fileName=${encodeURIComponent(file.name)}&fileType=${file.type}`, function(data){
		console.log(data);
		uploadFile(file, data.signedRequest, data.url);
	}, "json")
}

function uploadFile(file, request, imageUrl){
	console.log(file);
	$.ajax({
		url: request,
		method: "PUT", 
		data: file,
		processData: false,
		success: function(){
			console.log("success: " + imageUrl);
			//add new form divs for each new image added
			let $form_body = $(`
				<div class="new_picture">
					<img id="preview" src="${imageUrl}" alt="Updated once upload is completed" />
					<div class="inputs">
						<input type="text" name="first_name" placeholder="First name" />
						<input type="text" name="last_name" placeholder="Last name" />
						<input type="hidden" name="image_url" value="${imageUrl}" />
						<input type="text" name="major" placeholder="Major" />
						<input type="text" name="school_year" placeholder="School year (freshman-senior)" />
					</div>
				</div>
				`)
			$("#create_face").append($form_body);
		},
		error: function(xhr, status, errorThrown){
			console.error(JSON.stringify(xhr));
			throw new Error(errorThrown);
		}
	})
}


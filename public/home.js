$(document).ready(function(){
	$("#delete_all").click(function(event){
		$.ajax({
			url:"/real_face",
			type: "DELETE",
			success: function(result){
				$("#error").text(result.obj + "!");
			}
		})
		event.preventDefault();
	})
})
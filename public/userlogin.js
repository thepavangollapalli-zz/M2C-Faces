var googleyolo;
window.onGoogleYoloLoad = (gy) => {
  	// The 'googleyolo' object is ready for use.
  	googleyolo = gy;
  	if (isEmpty($('#userid'))){
	  	const retrievePromise = googleyolo.retrieve({
		  supportedAuthMethods: [
		    "https://accounts.google.com",
		    "googleyolo://id-and-password"
		  ],
		  supportedIdTokenProviders: [
		    {
		      uri: "https://accounts.google.com",
		      clientId: "14723435380-0p79hr7la6gk8njof97g0o72p9dca6jk.apps.googleusercontent.com"
		    }
		  ]
		  });

		retrievePromise.then((credential) => {
		    // A Google Account is retrieved. Since Google supports ID token responses,
		    // you can use the token to sign in instead of initiating the Google sign-in
		    // flow.
		    useGoogleIdTokenForAuth(credential.idToken);
		}, (error) => {
		  // console.log("retrievePromise failed", error.type)
		  // Credentials could not be retrieved. In general, if the user does not
		  // need to be signed in to use the page, you can just fail silently; or,
		  // you can also examine the error object to handle specific error cases.

		  // If retrieval failed because there were no credentials available, and
		  // signing in might be useful or is required to proceed from this page,
		  // you can call `hint()` to prompt the user to select an account to sign
		  // in or sign up with.
		  if (error.type === 'noCredentialsAvailable') {
		  	      const hintPromise = googleyolo.hint({
		  	  	  supportedAuthMethods: [
		  	  	    "https://accounts.google.com"
		  	  	  ],
		  	  	  supportedIdTokenProviders: [
		  	  	    {
		  	  	      uri: "https://accounts.google.com",
		  	  	      clientId: "14723435380-0p79hr7la6gk8njof97g0o72p9dca6jk.apps.googleusercontent.com"
		  	  	    }
		  	  	  ]
		  	  	});

		  	  	hintPromise.then((credential) => {
		  	  	  if (credential.idToken) {
		  	  	    // Send the token to your auth backend.
		  	  	    useGoogleIdTokenForAuth(credential.idToken);
		  	  	  }
		  	  	}, (error) => {
		  	  	  switch (error.type) {
		  	  	    case "userCanceled":
		  	  	      // The user closed the hint selector. Depending on the desired UX,
		  	  	      // request manual sign up or do nothing.
		  	  	      break;
		  	  	    case "noCredentialsAvailable":
		  	  	      // No hint available for the session. Depending on the desired UX,
		  	  	      // request manual sign up or do nothing.
		  	  	      break;
		  	  	    case "requestFailed":
		  	  	      // The request failed, most likely because of a timeout.
		  	  	      // You can retry another time if necessary.
		  	  	      break;
		  	  	    case "operationCanceled":
		  	  	      // The operation was programmatically canceled, do nothing.
		  	  	      break;
		  	  	    case "illegalConcurrentRequest":
		  	  	      // Another operation is pending, this one was aborted.
		  	  	      break;
		  	  	    case "initializationError":
		  	  	      // Failed to initialize. Refer to error.message for debugging.
		  	  	      break;
		  	  	    case "configurationError":
		  	  	      // Configuration error. Refer to error.message for debugging.
		  	  	      break;
		  	  	    default:
		  	  	      // Unknown error, do nothing.
		  	  	    }
		  		});
		    }
		});

		googleyolo.disableAutoSignIn().then(() => {
		  // Auto sign-in disabled.
		  console.log("Auto sign in disabled!");
		});
	}

	$(".g-signin2").click(function(event){
		console.log($.trim($(".g-signin2 a").text()));
		if($.trim($(".g-signin2 a").text()) === "Switch account")
		{
		    const hintPromise = googleyolo.hint({
			  supportedAuthMethods: [
			    "https://accounts.google.com"
			  ],
			  supportedIdTokenProviders: [
			    {
			      uri: "https://accounts.google.com",
			      clientId: "14723435380-0p79hr7la6gk8njof97g0o72p9dca6jk.apps.googleusercontent.com"
			    }
			  ]
			});
			hintPromise.then((credential) => {
			  if (credential.idToken) {
			    // Send the token to your auth backend.
			    useGoogleIdTokenForAuth(credential.idToken);
			  }
			}, (error) => {
			  switch (error.type) {
			    case "userCanceled":
			      // The user closed the hint selector. Depending on the desired UX,
			      // request manual sign up or do nothing.
			      break;
			    case "noCredentialsAvailable":
			      // No hint available for the session. Depending on the desired UX,
			      // request manual sign up or do nothing.
			      // $('.g-signin2').css({"display":"block"});
			      break;
			    case "requestFailed":
			      // The request failed, most likely because of a timeout.
			      // You can retry another time if necessary.
			      break;
			    case "operationCanceled":
			      // The operation was programmatically canceled, do nothing.
			      break;
			    case "illegalConcurrentRequest":
			      // Another operation is pending, this one was aborted.
			      console.log(error);
			      break;
			    case "initializationError":
			      // Failed to initialize. Refer to error.message for debugging.
			      break;
			    case "configurationError":
			      // Configuration error. Refer to error.message for debugging.
			      break;
			    default:
			      // Unknown error, do nothing.
			  }
			});
			event.preventDefault();
		}
	});
};

function useGoogleIdTokenForAuth(token){
	console.log("ABOUT TO SEND TOKEN, ")
	$.ajax({
		url:'/signin',
		method:'POST',
		data: token,
		success: function(result){
			console.log("SUCCEEEDDED");
			$('#userid').text($.trim(result.userid));
			$(".g-signin2 a").val("Switch account")
		},
		error: function(xhr, status, error){
			console.log(xhr);
		}
	})
}

function onSignIn(googleUser) {
  var profile = googleUser.getBasicProfile();
  var id_token = googleUser.getAuthResponse().id_token;
  useGoogleIdTokenForAuth(id_token)
  console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
  console.log('Name: ' + profile.getName());
  console.log('Image URL: ' + profile.getImageUrl());
  console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.
}

function isEmpty( el ){
    return !$.trim(el.html())
}
(function(){
	function init(){
		document.querySelector('#login-form-btn').addEventListener('click', onSessionInvalid);
		document.querySelector('#register-form-btn').addEventListener('click', showRegisterForm);
		document.querySelector('#login-btn').addEventListener('click', login);
		document.querySelector('#nearby-btn').addEventListener('click', loadNearbyItems);
		document.querySelector('#register-btn').addEventListener('click',
				register);
		document.querySelector('#fav-btn').addEventListener('click', loadFavoriteItems);
			    document.querySelector('#recommend-btn').addEventListener('click', loadRecommendedItems);


		validateSession();
	}
	
	
	function validateSession(){
		onSessionInvalid();

		var url = './login';
		var data = JSON.stringify({});

		// display loading message
		showLoadingMessage('Validating session...');

		// make AJAX call
		ajax('GET', url, data,
				// session is still valid
			function(res) {
			var result = JSON.parse(res);

			if (result.status === 'OK') {
				// case2: session valid
				console.log('ok')
				onSessionValid(result);
			}
		}, function(){
			// case1: session invalid
			console.log('session is invalid');
		});

	}
	
	function login(){
		
		var username = document.querySelector('#username').value;
		var password = document.querySelector('#password').value;
		password = md5(username + md5(password));
		//console.log(username, password);
		
	    // The request parameters
	    var url = './login';
	    var data = JSON.stringify({
	      user_id : username, 
	      password : password,
	    });

	    ajax('POST', url, data,
	      // successful callback
	      function(res) {
	        var result = JSON.parse(res);

	        // successfully logged in
	        if (result.status === 'OK') {
	        	   console.log(result);
	        	   onSessionValid(result);
	        }
	      },
	      // error
	      function() {
	        showLoginError();
	      });		
	}
	
	function onSessionValid(result) {
	    user_id = result.user_id;
	    user_fullname = result.name;

	    var loginForm = document.querySelector('#login-form');
	    var registerForm = document.querySelector('#register-form');
	    var itemNav = document.querySelector('#item-nav');
	    var itemList = document.querySelector('#item-list');
	    var avatar = document.querySelector('#avatar');
	    var welcomeMsg = document.querySelector('#welcome-msg');
	    var logoutBtn = document.querySelector('#logout-link');

	    welcomeMsg.innerHTML = 'Welcome, ' + user_fullname;

	    showElement(itemNav);
	    showElement(itemList);
	    showElement(avatar);
	    showElement(welcomeMsg);
	    showElement(logoutBtn, 'inline-block');
	    hideElement(loginForm);
	    hideElement(registerForm);
	    
	    
	    initGeoLocation();
	  }


	
	function onSessionInvalid(){
		//var loginForm = document.getElementById('login-form');
	    var loginForm = document.querySelector('#login-form');
	    var registerForm = document.querySelector('#register-form');
	    var itemNav = document.querySelector('#item-nav');
	    var itemList = document.querySelector('#item-list');
	    var avatar = document.querySelector('#avatar');
	    var welcomeMsg = document.querySelector('#welcome-msg');
	    var logoutBtn = document.querySelector('#logout-link');
	    
	    hideElement(itemNav);
	    hideElement(itemList);
	    hideElement(avatar);
	    hideElement(logoutBtn);
	    hideElement(welcomeMsg);
	    hideElement(registerForm);

	    clearLoginError();
	    showElement(loginForm);
	}
	
	function initGeoLocation() {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
					onPositionUpdated,
					onLoadPositionFailed, {
						maximumAge: 60000
					});
			showLoadingMessage('Retrieving your location...');
		} else {
			onLoadPositionFailed();
		}
	}

	function onPositionUpdated(position) {
		lat = 37.38;//position.coords.latitude;
		lng = -122.02;//position.coords.longitude; 
		console.log(lat, lng);
		loadNearbyItems();
	}

	function onLoadPositionFailed() {
		console.warn('navigator.geolocation is not available');
		getLocationFromIP();
	}

	function getLocationFromIP() {
		// get location from http://ipinfo.io/json
		var url = 'http://ipinfo.io/json'
		var data = null;

		ajax('GET', url, data, function(res) {
			var result = JSON.parse(res);
			if ('loc' in result) {
				var loc = result.loc.split(',');
				lat = loc[0];
				lng = loc[1];
				loadNearbyItems();
			} else {
				console.warn('Getting location by IP failed.');
			}
		}, function(){
			console.log('error in fetching location')
		});
	}


	
	function showRegisterForm() {
        var loginForm = document.querySelector('#login-form');
        var registerForm = document.querySelector('#register-form');
        var itemNav = document.querySelector('#item-nav');
        var itemList = document.querySelector('#item-list');
        var avatar = document.querySelector('#avatar');
        var welcomeMsg = document.querySelector('#welcome-msg');
        var logoutBtn = document.querySelector('#logout-link');

        hideElement(itemNav);
        hideElement(itemList);
        hideElement(avatar);
        hideElement(logoutBtn);
        hideElement(welcomeMsg);
        hideElement(loginForm);
    
        clearRegisterResult();
        showElement(registerForm);
  } 

	function register() {
		var username = document.querySelector('#register-username').value;
		var password = document.querySelector('#register-password').value;
		var firstName = document.querySelector('#register-first-name').value;
		var lastName = document.querySelector('#register-last-name').value;

		if (username === "" || password == "" || firstName === ""
				|| lastName === "") {
			showRegisterResult('Please fill in all fields');
			return
		}

		if (username.match(/^[a-z0-9_]+$/) === null) {
			showRegisterResult('Invalid username');
			return
		}
		
		password = md5(username + md5(password));

		// The request parameters
		var url = './register';
		var req = JSON.stringify({
			user_id : username,
			password : password,
			first_name : firstName,
			last_name : lastName,
		});

		ajax('POST', url, req,
		// successful callback
		function(res) {
			var result = JSON.parse(res);

			// successfully logged in
			if (result.status === 'OK') {
				showRegisterResult('Succesfully registered');
			} else {
				showRegisterResult('User already existed');
			}
		},

		// error
		function() {
			showRegisterResult('Failed to register');
		}, true);
	}

	function showRegisterResult(registerMessage) {
		document.querySelector('#register-result').innerHTML = registerMessage;
	}

	function clearRegisterResult() {
		document.querySelector('#register-result').innerHTML = '';
	}



	init();
	
})();
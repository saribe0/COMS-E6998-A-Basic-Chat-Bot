
$( document ).ready(function() {

	AWS.config.region = 'us-east-2';
	var apigClient = null;					// https://docs.aws.amazon.com/apigateway/latest/developerguide/how-to-generate-sdk-javascript.html

	var $messages = $('.messages-content');
	var d, h, m;
	var messageId = 0;

	$(window).load(function() {

		// Incorporate credentials being valid -> Whenever the page is reloaded or a request is about to be made, 
		// - check credentials
		// - AWS.config.credentials.get(callback) can be used
		// - https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Credentials.html#get-property
		if (window.location.href.includes('?')) {
			var codeRaw = window.location.href.split('?');
			var code = codeRaw[1].split('=')[1];
			console.log(code);

			$.ajax({
				url: "https://big-data-columbia.auth.us-east-2.amazoncognito.com/oauth2/token",
				type: 'post',
				data: {
					grant_type: 'authorization_code',
					client_id: '5gtisfg92lbn999vhp187fs7r0',
				 	code: code,
				 	redirect_uri: 'https://s3.us-east-2.amazonaws.com/big-data-columbia/index.html'
				},
				headers:{
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				dataType: 'json',
				success: function(data){
					console.log(data);

					AWS.config.credentials = new AWS.CognitoIdentityCredentials({
						IdentityPoolId: 'us-east-2:cfa21d84-c9d3-4089-8a0f-c3e0f218f78a',
						Logins: {
							'cognito-idp.us-east-2.amazonaws.com/us-east-2_GxwnSvyrB': data.id_token
						}
					})
					AWS.config.credentials.get(function(err){
						if (err) {
							console.log(err);
							$('.login').show().css('display', 'flex');
						}
						else {
							console.log('Secret: ' + AWS.config.credentials.secretAccessKey);
							console.log('Access: ' + AWS.config.credentials.accessKeyId);
							console.log('Authentication Complete, Displaying Chat.');

							apigClient = apigClientFactory.newClient({
								accessKey: AWS.config.credentials.accessKeyId,
								secretKey: AWS.config.credentials.secretAccessKey,
								sessionToken: AWS.config.credentials.sessionToken,
								region: AWS.config.region 
							});

							$('.chat').show().css('display', 'flex');
							$('.logout').show().css('display', 'flex');
						}
					});
				},
				error: function(data) {
					console.log(data);
					$('.login').show().css('display', 'flex');
				}
			});
		}
		else {
			console.log('No code');
			$('.login').show().css('display', 'flex');
		}

		$messages.mCustomScrollbar();
		setTimeout(function() {
			newMessage("-");
		}, 100);
	});

	$('.login').click(function() {
		location.href='https://big-data-columbia.auth.us-east-2.amazoncognito.com/login?response_type=code&client_id=5gtisfg92lbn999vhp187fs7r0&redirect_uri=https://s3.us-east-2.amazonaws.com/big-data-columbia/index.html'
	});

	$('.logout').click(function() {
		if ( AWS.config.credentials != null) {
			AWS.config.credentials.clearCachedId();
			apigClient = null;
			$('.chat').hide();
			$('.logout').hide();
			$('.login').show().css('display', 'flex');
		}
	});

	function updateScrollbar() {
	  $messages.mCustomScrollbar("update").mCustomScrollbar('scrollTo', 'bottom', {
		scrollInertia: 10,
		timeout: 0
	  });
	}

	function setDate(){
	  d = new Date()
	  if (m != d.getMinutes()) {
		m = d.getMinutes();
		$('<div class="timestamp">' + d.getHours() + ':' + m + '</div>').appendTo($('.message:last'));
	  }
	}

	function insertMessage() {
	  msg = $('.message-input').val();
	  if ($.trim(msg) == '') {
		return false;
	  }
	  $('<div class="message message-personal">' + msg + '</div>').appendTo($('.mCSB_container')).addClass('new');
	  setDate();
	  $('.message-input').val(null);
	  updateScrollbar();
	  setTimeout(function() {
		newMessage(msg);
	  }, 1000 + (Math.random() * 20) * 100);
	}

	$('.message-submit').click(function() {
	  insertMessage();
	});

	$(window).on('keydown', function(e) {
	  if (e.which == 13) {
		insertMessage();
		return false;
	  }
	})

	function newMessage(message) {
	  if ($('.message-input').val() != '') {
		return false;
	  }
	  $('<div class="message loading new"><figure class="avatar"><img src="https://s3.us-east-2.amazonaws.com/big-data-columbia/assets/propic.jpg" /></figure><span></span></div>').appendTo($('.mCSB_container'));
	  updateScrollbar();

	  setTimeout(function() {
	  	var body = {
			messages: [
				{
					type: "request",
					unstructured: {
						id: messageId.toString(),
						text: message,
						timestamp: Date.now().toString()
					}
				}
			]
	  	};
	  	apigClient.chatbotPost(null, body)
	  		.then(function(result) {
	  			$('.message.loading').remove();
	  			var data = JSON.parse(JSON.stringify(result).replace(";", "")).data;
	  			console.log(data);
	  			var allMessages = JSON.parse(data).messages;
				$('<div class="message new"><figure class="avatar"><img src="https://s3.us-east-2.amazonaws.com/big-data-columbia/assets/propic.jpg" /></figure>' + allMessages[0].unstructured.text + '</div>').appendTo($('.mCSB_container')).addClass('new');
				setDate();
				updateScrollbar();
				messageId++;
	  		}).catch(function(result) {
	  			console.log(result)
	  			$('.message.loading').remove();
	  			updateScrollbar();
	  		});

	  }, 1000 + (Math.random() * 20) * 100);

	}
});
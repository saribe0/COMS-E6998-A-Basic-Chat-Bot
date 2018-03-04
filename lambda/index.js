var default_messages = [
    "Hi, my name is Sam. You?",
    "Nice to meet you, what seems to be the problem?",
    "Oh my, that sounds terrible.",
    "Don't worry, we'll get to the bottom of it.",
    "Do you have any more information on the issue?",
    "Ahh yes, this is a pretty common one.",
    "Did you try turning it off and on?",
    "Glad I could help!",
    "Have a great day."
    ];

function messageFactory(messageType, messageId, messageText) {
    var message = {
      messages:
        [
            {
              type: messageType,
              unstructured: {
                id: messageId,
                text: messageText,
                timestamp: Date.now()
              }
            }
        ]
    }
    return JSON.stringify(message);
}

function errorFactory(errorCode, errorMessage) {
    var error = {
        code: errorCode,
        message: errorMessage
    };
    return JSON.stringify(error);
}

exports.handler = (event, context, callback) => {
    // Verify there are messages included in the request
    if (!event.hasOwnProperty("messages")) {
        callback(errorFactory(500, "Malformed Request: No messages included."));
    }
    if (event.messages.length == 0) {
        callback(errorFactory(500, "Malformed Request: No messages included."));
    }
    // Verify each message is formatted properly
    for(var ii = 0; ii < event.messages.length; ii++)
    {
        if(!event.messages[ii].hasOwnProperty("type")) {
            callback(errorFactory(500, "Malformed Request: Message " + ii + " has no type property."));
        }
        if(!event.messages[ii].hasOwnProperty("unstructured")) {
            callback(errorFactory(500, "Malformed Request: Message " + ii + " has no unstructured property."));
        }
        if(!event.messages[ii].unstructured.hasOwnProperty("id")) {
            callback(errorFactory(500, "Malformed Request: Message " + ii + " has no id."));
        }
        if(!event.messages[ii].unstructured.hasOwnProperty("text")) {
            callback(errorFactory(500, "Malformed Request: Message " + ii + " has no text."));
        }
        if(!event.messages[ii].unstructured.hasOwnProperty("timestamp")) {
            callback(errorFactory(500, "Malformed Request: Message " + ii + " has no timestamp."));
        }
    }
    
    var messageIndex = event.messages[0].unstructured.id % default_messages.length

    
    callback(messageFactory("response", messageIndex, default_messages[messageIndex]));
};
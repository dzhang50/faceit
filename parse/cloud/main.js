
// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
Parse.Cloud.define("hello", function(request, response) {
  response.success("Hello world!");
});


function addPost(fbid, isUpvote) {
	var FBPost = Parse.Object.extend("FBPost");
	var post = new FBPost();
	post.set("fbid", fbid);
	if(isUpvote == true) {
		post.set("upvotes", 1);
		post.set("downvotes", 0);
	}
	else {
		post.set("upvotes", 0);
		post.set("downvotes", 1);
	}
	post.save();
}

Parse.Cloud.define("vote", function(request, response) {
	//console.log("Vote: " + request.params.fbid + ", " + request.params.isUpvote);
	
	var FBPost = Parse.Object.extend("FBPost");
	var query =  new Parse.Query(FBPost);
	query.equalTo('fbid', request.params.fbid);
	query.limit = 2;
	query.ascending('createdAt');
	
	
	query.find({
		success: function(results) {
			if((typeof results == "undefined") || (results == null) || (results.length == 0)) {
				addPost(request.params.fbid, request.params.isUpvote);
				response.success(1);
				return;
			}
			/*
			if(results.length > 1) {
				response.error("Too many results!");
				return;
			}
			*/
			var post = results[0];
			
			// PARSE BUG LOL WTF
			//console.log("result, upvotes: " + post.get("upvotes") + ", downvotes" + post.get("downvotes"));
			
			var votes = -1;
			if(request.params.isUpvote == true) {
				post.increment("upvotes");
				//votes = post.get("upvotes");
			}
			else {
				post.increment("downvotes");
				//votes = post.get("downvotes");
			}
			post.save();
			response.success();
			return;
		},
		error: function(error) {
			//response.success(1);
			response.error(error);
			return;
		}
	});
});

Parse.Cloud.define("getVotes", function(request, response) {
	//console.log("getVotes: " + request.params.fbid);
	
	var FBPost = Parse.Object.extend("FBPost");
	
	var query = new Parse.Query(FBPost);
	
	query.get(request.params.fbid, {
		success: function(fbpost) {
			// Object exists, increment and save
			var upvotes = fbpost.get("upvotes");
			var downvotes = fbpost.get("downvotes");
			var votes = {upvotes: upvotes, downvotes: downvotes, exists: true};
			response.success(votes);
		},
		error: function(object, error) {
			// Doesn't exist, return 0. Optimization, don't create entry until increment
			var votes = {upvotes: 0, downvotes: 0, exists: false};
			response.success(votes);
		}
	});
});
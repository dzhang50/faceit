
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

function addUser(userid, fbid) {
	var FBUser = Parse.Object.extend("FBUser");
	var user = new FBUser();
	user.set("userid", userid);
	user.addUnique("votes", fbid);
	user.save();
}

Parse.Cloud.define("vote", function(request, response) {
	//console.log("Vote: " + request.params.fbid + ", " + request.params.isUpvote);
	
	// First, check to see if user exists and has already voted on this
	var FBUser = Parse.Object.extend("FBUser");
	var query = new Parse.Query(FBUser);
	query.equalTo('userid', request.params.user);
	query.limit = 2;
	query.ascending('createdAt');
	
	query.find({
		success: function(results) {
			if((typeof results == "undefined") || (results == null) || (results.length == 0)) {
				addUser(request.params.user, request.params.fbid);
			}
			else {
				var user = results[0];
				var votes = user.get("votes");
				if(votes.indexOf(request.params.fbid) != -1) {
					// Already upvoted, return!
					response.success(0);
					return;
				}
				
				user.addUnique("votes", request.params.fbid);
				user.save();
			}
			
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
			
					var post = results[0];
	
					// PARSE BUG LOL WTF
					//console.log("result, upvotes: " + post.get("upvotes") + ", downvotes" + post.get("downvotes"));
	
					var votes = -1;
					if(request.params.isUpvote == true) {
					post.increment("upvotes");
					}
					else {
						post.increment("downvotes");
					}
					post.save();
					response.success(1);
					return;
				},
				error: function(error) {
					//response.success(1);
					response.error(error);
					return;
				}
			});
		},
		error: function(error) {
			response.error(error);
			return;
		}
	});
	
	

});

Parse.Cloud.define("getVotes", function(request, response) {
	//console.log("getVotes: " + request.params.fbid);
		
	var FBPost = Parse.Object.extend("FBPost");
	var query =  new Parse.Query(FBPost);
	query.equalTo('fbid', request.params.fbid);
	query.limit = 2;
	query.ascending('createdAt');
	query.find({
		success: function(results) {	
			if((typeof results == "undefined") || (results == null) || (results.length == 0)) {
				var votes = {upvotes: 0, downvotes: 0, exists: false};
				response.success(votes);
				return;
			}
			else {
				var post = results[0];
				
				// Object exists, increment and save
				var upvotes = post.get("upvotes");
				var downvotes = post.get("downvotes");
				var votes = {upvotes: upvotes, downvotes: downvotes, exists: true};
				response.success(votes);
			}
			
		},
		error: function(object, error) {
			response.error(error);
			return;
		}
	});
});
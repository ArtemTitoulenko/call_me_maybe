Users = new Meteor.Collection("users");
Deals = new Meteor.Collection("deals");


if (Meteor.is_client) {
  Meteor.startup(function() {
  });
	
	//Login validation area
	Template.user_plate.is_validated = function () {
		return Session.get('uid') !== undefined;
	} 

	Template.user_greeting.username = function () {
		return Session.get('user').username || "";
	} 

	Template.user_greeting.events = {
		'click #logout': function () {
				Session.set('uid', undefined);
				Session.set('user',undefined);
		}

	};

  Template.login_form.events = {
    'click .submit': function() {
      var username = document.getElementsByName('username')[0].value;
      var password = document.getElementsByName('password')[0].value;
      //console.log("trying " + username + ", " + password);
	  var user = Users.findOne( {"username": username, "password": password});
      if(user !== undefined) {
			Session.set('uid',user._id);
			Session.set('user', user);
			//console.log("uid set:" + Session.get('uid'));
	  }
    }
  }

  Template.deals.deals = function() {
    return Deals.find({active: 1});
  }
}

if (Meteor.is_server) {
  Meteor.startup(function () {
    add_test_users();
    getDealsFromYipit();
  });
}

function getDealsFromYipit() {
    var yipitURL = "http://api.yipit.com/v1/deals/?tag=restaurants,bar-club&division=new-york&limit=5&key=WfNYJS42NRP8V6nQ";

    Meteor.http.get(yipitURL, {}, function(error, result){
    var deals = result.data.response.deals;
    console.log("found " + deals.length + " deals!");

    console.log("sample deal: ");
    console.log(deals[0]);

    for(var i = 0; i < deals.length; i++) {
      cd = deals[i];
      deal = Deals.findOne({'business name': cd.business.name, 
                    'end_date': cd.end_date,
                    'active': cd.active});
      console.log(deal);

      if(deal === undefined) {
        console.log("adding deal from " + cd.business.name);
        Deals.insert(cd);
      }
    }
  });

  
}

var add_test_users = function() {
  if(Users.find().count() === 0) {
      for(var i = 0; i < 15; i++) {
        Users.insert({username: "test_user_"+i,
                      password: 'foo',
                      first_name: 'Test',
                      last_name: 'User'+i,
                      age: Math.floor(Math.random()*10)*5});
      }
    }
}

function showLoginForm() {
  $('#login').show();
  $('#deals').hide();
  $('.signup').hide();
  $('#see-other-form').html('<h6><a href="#" onclick="showSignupForm(); return false;">(New user?)</a></h6>');
  $('header').html('<h1>Welcome back!</h1>')
}

// function showSignupForm() {
//   $('#login').hide();
//   $('#deals').hide();
//   $('.signup').show();
//   $('#see-other-form').html('<h6><a href="#" onclick="showLoginForm(); return false;">(Already signed up?)</a></h6>');
//   $('header').html('<h1>Tell us a little about yourself!</h1>');
// }

function showDeals() {
  $('#login').hide();
  $('.signup').show();
  $('#see-other-form').hide();
}

function showSignupForm() {
  $('#sign-up').show();
}

function submitSignup() {
  $('#sign-up').hide();
  signUp();
}

function signUp() {
  var username = document.getElementsByName('name')[0].value;
  var password = document.getElementsByName('password')[0].value;
  var gender = document.getElementsByName('gender')[0].value;
  var userid = Users.insert({'username':username,'password': password,'gender': gender});
  Session.set('uid',userid);
  Session.set('user',Users.findOne({'_uid':userid}));
  console.log("We added: " + userid);
 } 
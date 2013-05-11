/*f3ea3154c22231ec658e390e132bd2dc98a71bef*/__initFb__=function(){Ext.define("KickBak.fb",{mixins:["Ext.mixin.Observable"],singleton:true,appId:null,fbTimeout:10*1000,titleMsg:"Facebook Connect",fbScope:["email","user_birthday","publish_stream","read_friendlists","publish_actions"],fbConnectErrorMsg:"Cannot retrive Facebook account information!",fbConnectRequestMsg:"By connecting to Facebook, you will receive additional Reward Pts everytime we update your KICKBAK activity to your Facebook account!",fbConnectReconnectMsg:"By connecting to Facebook, you will receive additional Reward Pts everytime we update your KICKBAK activity to your Facebook account!",connectingToFBMsg:function(){return("Connecting to Facebook ..."+KickBak.constants.addCRLF()+"(Tap to Close)")},loggingOutOfFBMsg:"Logging out of Facebook ...",fbConnectFailMsg:"Error Connecting to Facebook.",fbPermissionFailMsg:"Failed to get the required access permission.",friendsRetrieveErrorMsg:"You cannot retrieve your Friends List from Facebook. Login and Try Again.",initialize:function(){var a=this;a.appId=(debugMode)?477780595628080:197968780267830;window.fbAsyncInit=Ext.bind(a.onFacebookInit,a);(function(f,b,g){var e,c=f.getElementsByTagName(b)[0];if(f.getElementById(g)){return}e=f.createElement(b);e.id=g;e.src="//connect.facebook.net/en_US/all.js";c.parentNode.insertBefore(e,c)}(document,"script","facebook-jssdk"))},onFacebookInit:function(){var a=this;a.hasCheckedStatus=false;if(debugMode){console.debug("Facebook init Debug");FB.init({cookie:true,frictionlessRequests:true,appId:a.appId+"",status:true,xfbml:true})}else{console.debug("Facebook init Production");FB.init({cookie:true,frictionlessRequests:true,appId:a.appId+"",channelUrl:"//"+serverHost+"/channel.html",status:true,xfbml:true})}FB.Event.subscribe("auth.logout",function(){if(a.hasCheckedStatus){a.fireEvent("logout")}});a.fbLoginTimeout=setTimeout(function(){a.fireEvent("loginStatus");a.fireEvent("exception",{type:"timeout",msg:"The request to Facebook timed out."},null)},a.fbTimeout);FB.getLoginStatus(function(c){a.fireEvent("loginStatus");clearTimeout(a.fbLoginTimeout);delete a.fbLoginTimeout;a.hasCheckedStatus=true;var b=KickBak.db.getLocalDB();if(b.fbLoginInProgress){KickBak.db.removeLocalDBAttrib("fbLoginInProgress");a.facebook_loginCallback(c)}})},currentLocation:function(){if(window.top.location.host){return window.top.location.protocol+"//"+window.top.location.host+window.top.location.pathname}else{return window.location.protocol+"//"+window.location.host+window.location.pathname}},redirectUrl:function(){var a=Ext.Object.toQueryString({redirect_uri:this.currentLocation(),client_id:this.appId,scope:this.fbScope.toString()});if(!Ext.os.is("Android")&&!Ext.os.is("iOS")&&/Windows|Linux|MacOS/.test(Ext.os.name)){return"https://www.facebook.com/dialog/oauth?"+a}else{return"https://m.facebook.com/dialog/oauth?"+a}},createFbResponse:function(a){var b=a.birthday.split("/");b=b[2]+"-"+b[0]+"-"+b[1];var c={name:a.name,email:a.email,facebook_id:a.id,facebook_uid:a.username,gender:(a.gender=="male")?"m":"f",birthday:b,photoURL:"http://graph.facebook.com/"+a.id+"/picture?type=square",accessToken:a.accessToken};console.log("FbResponse - ["+Ext.encode(c)+"]");return c},facebook_onLogin:function(d,c){var b=this,a=true;b.cb={supress:d,messsage:c,iter:0};Ext.Viewport.setMasked(null);Ext.Viewport.setMasked({xtype:"loadmask",message:b.connectingToFBMsg(),listeners:{tap:function(){Ext.Viewport.setMasked(null);b.facebook_loginCallback(null)}}});b.fbLoginTimeout=setTimeout(function(){b.fireEvent("loginStatus");b.fireEvent("exception",{type:"timeout",msg:"The request to Facebook timed out."},null)},b.fbTimeout);FB.getLoginStatus(function(e){b.fireEvent("loginStatus");clearTimeout(b.fbLoginTimeout);delete b.fbLoginTimeout;if(e.status=="connected"){KickBak.db.removeLocalDBAttrib("fbLoginInProgress");b.facebook_loginCallback(e)}else{KickBak.db.setLocalDBAttrib("fbLoginInProgress",true);window.top.location=b.redirectUrl()}})},facebook_loginCallback:function(a){var b=this,c=null;if(!a||a.cancelled||a.error||(a.status!="connected")){console.debug("FacebookConnect.login:failedWithError:"+((a)?a.message:"None"));if(!b.cb||!b.cb.supress){Ext.device.Notification.show({title:b.titleMsg,message:b.fbConnectErrorMsg,buttons:["Try Again","Continue"],callback:function(d){if(d.toLowerCase()=="try again"){Ext.defer(function(){b.facebook_onLogin(false,b.cb.message)},1,b);delete b.cb}else{Ext.Viewport.setMasked(null);delete b.cb;b.fireEvent("unauthorized",null,null)}}})}else{if(!a||a.cancelled||b.cb.iter>=3){Ext.Viewport.setMasked(null);b.facebook_loginCallback(null);delete b.cb}else{if(b.cb.iter<3){b.cb.iter++;Ext.defer(function(){b.facebook_onLogin(false,b.cb.message)},2*b.cb.iter*1000,b)}}}}else{console.debug("Retrieving Facebook profile information ...");Ext.defer(function(){FB.api("/me",function(d){if(!d.error||(d.id&&(d.id>0))){var e=d.id;console.debug("Session ID["+e+"]");var f=b.createFbResponse(d);console.debug("You`ve logged into Facebook! \nEmail("+f.email+")\nID("+e+")\n");b.fireEvent("connected",f,null);delete b.cb}else{Ext.Viewport.setMasked(null);b.fireEvent("unauthorized",null,null);b.facebook_onLogout(null,false);delete b.cb}})},0.5*1000,b)}},facebook_onLogout:function(a,b){var c=this;a=a||Ext.emptyFn;console.debug("facebook_onLogout");try{if(b){Ext.Viewport.setMasked({xtype:"loadmask",message:c.loggingOutOfFBMsg});FB.logout(function(e){Ext.Viewport.setMasked(null);a()})}else{a()}}catch(d){a()}}});KickBak.fb.initialize()};
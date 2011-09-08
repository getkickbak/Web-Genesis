
Genesis =
{
   fbAppId : 197968780267830
};

window.fbAsyncInit = function()
{
   FB.init(
   {
      // Use user's Facebook AppID if we are logging into their site directly
      appId : Genesis.fbAppId,
      status : true,
      cookie : true,
      xfbml : true,
      oauth : false
   });
   FB.Event.subscribe('auth.sessionChange', function(response)
   {
      // do something with response
      //alert("logout success");
      (response.status != 'connected') ? _logout() : _login();
   });
   if(FB.getSession() != null)
   {
      // logged in and connected user, someone you know
      _login();
      _fb_connect();
   }
   else
   {
      // no user session available, someone you dont know
      _logout();
      _fb_disconnect();
   }
};
$(document).ready($(function()
{
}));
// **************************************************************************
// Facebook API
/*
* Clean up any Facebook cookies, otherwise, we have page loading problems
* One set for production domain, another for developement domain
*/
// **************************************************************************
function facebook_onLogin(signup)
{
   FB.api('/me', function(response)
   {
      if(response.id == null)
         return;

      //Ext.util.Cookies.set('fbAppId', (Genesis.fbAppId != 0) ? Genesis.fbAppId : Genesis.toontiFbAppId);

      /*
       var accountCreationInfo = Seam.Remoting.createType("com.toonti.soc.user.UserAccountCreation");
       accountCreationInfo.setFbId(response.id);
       accountCreationInfo.setFirstName(response.first_name);
       accountCreationInfo.setLastName(response.last_name);
       accountCreationInfo.setEmail(response.email);
       accountCreationInfo.setPassword('');
       var genderTypes =
       {
       'male' : 'M',
       'female' : 'F'
       };
       var gender = genderTypes[response.gender];
       if(Ext.isEmpty(gender))
       {
       gender = 'U';
       }
       accountCreationInfo.setGender(gender);
       var tbirthday = response.birthday;
       var birthday;
       if(!Ext.isEmpty(tbirthday))
       {
       tbirthday = tbirthday.split('/');
       var year = Ext.num(tbirthday[2]);
       var month =  Ext.num(tbirthday[0]) - 1;
       var day = Ext.num(tbirthday[1]);
       birthday = new Date(year, month, day);
       }
       else
       {
       birthday = new Date();
       }
       accountCreationInfo.setBirthday(birthday);
       var subdomainName = getHostSubdomain();
       var domainName = null;
       if(subdomainName != null)
       {
       if(subdomainName == 'www')
       {
       subdomainName = null;
       }
       }
       else
       {
       domainName = document.location.host;
       }
       var username = response.username || response.id;
       //var thumbnails = accountCreationInfo.profileThumbnails = [];
       if(username)
       {
       //for (var i=1; i<=6; i++)
       //{
       //thumbnails[i-1] = Genesis.getFbProfilePhotoURL(username,i);
       //}
       Ext.util.Cookies.set('fbUserName', username);
       }
       else
       {
       //for (var i=1; i<=6; i++)
       //{
       //thumbnails[i-1] = "";
       //}
       $.cookie('fbUserName');
       }
       var authenticator = Seam.Component.getInstance("authenticator");
       authenticator.facebookLogin(accountCreationInfo, subdomainName, domainName, Ext.isEmpty(response.verified) ? false : true,
       function(results)
       {
       if(results.success)
       {
       if(signup)
       {
       var subdomainName = getHostSubdomain();
       if((!Ext.isEmpty(subdomainName) && subdomainName != 'www') || Ext.isEmpty(subdomainName))
       {
       location.href = Genesis.communityProfileURL;
       }
       else
       {
       location.href = Genesis.createCommunityURL;
       }
       }
       else
       {
       window.location.reload();
       }
       }
       else
       {
       Ext.MessageBox.show(
       {
       title : 'Error',
       msg : results.items[0],
       buttons : Ext.MessageBox.OK,
       icon : Ext.MessageBox.ERROR
       });
       return false;
       }
       });
       */
   });
};
_fb_connect = _fb_disconnect = function()
{
   /*
    $.cookie(Genesis.fbAppId + "_expires", null);
    $.cookie(Genesis.fbAppId + "_session_key", null);
    $.cookie(Genesis.fbAppId + "_ss", null);
    $.cookie(Genesis.fbAppId + "_user", null);
    $.cookie(Genesis.fbAppId, null);
    $.cookie("base_domain_", null);
    $.cookie("fbsr_" + Genesis.fbAppId, null);
    */
};

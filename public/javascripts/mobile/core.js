Ext.define("Ext.device.communicator.Default",{SERVER_URL:"http://localhost:3000",callbackDataMap:{},callbackIdMap:{},idSeed:0,globalScopeId:"0",generateId:function(){return String(++this.idSeed);},getId:function(a){var b=a.$callbackId;if(!b){a.$callbackId=b=this.generateId();}return b;},getCallbackId:function(h,d){var c=this.callbackIdMap,b=this.callbackDataMap,g,a,f,e;if(!d){a=this.globalScopeId;}else{if(d.isIdentifiable){a=d.getId();}else{a=this.getId(d);}}f=this.getId(h);if(!c[a]){c[a]={};}if(!c[a][f]){g=this.generateId();e={callback:h,scope:d};c[a][f]=g;b[g]=e;}return c[a][f];},getCallbackData:function(a){return this.callbackDataMap[a];},invoke:function(c,a){var b=this.getCallbackData(c);b.callback.apply(b.scope,a);},send:function(b){var d,c,a,e;if(!b){b={};}else{if(b.callbacks){d=b.callbacks;c=b.scope;delete b.callbacks;delete b.scope;for(a in d){if(d.hasOwnProperty(a)){e=d[a];if(typeof e=="function"){b[a]=this.getCallbackId(e,c);}}}}}this.doSend(b);},doSend:function(a){var b=new XMLHttpRequest();b.open("GET",this.SERVER_URL+"?"+Ext.Object.toQueryString(a),false);b.send(null);}});Ext.define("Ext.device.communicator.Android",{extend:"Ext.device.communicator.Default",doSend:function(a){window.Sencha.action(JSON.stringify(a));}});Ext.define("Ext.device.Communicator",{requires:["Ext.device.communicator.Default","Ext.device.communicator.Android"],singleton:true,constructor:function(){if(Ext.os.is.Android){return new Ext.device.communicator.Android();}return new Ext.device.communicator.Default();}});Ext.define("Ext.device.camera.Abstract",{source:{library:0,camera:1,album:2},destination:{data:0,file:1},encoding:{jpeg:0,jpg:0,png:1},capture:Ext.emptyFn});Ext.define("Ext.device.camera.PhoneGap",{extend:"Ext.device.camera.Abstract",capture:function(j){var h=j.success,d=j.failure,l=j.scope,b=this.source,f=this.destination,i=this.encoding,a=j.source,k=j.destination,c=j.encoding,m={};if(l){h=Ext.Function.bind(h,l);d=Ext.Function.bind(d,l);}if(a!==undefined){m.sourceType=b.hasOwnProperty(a)?b[a]:a;}if(k!==undefined){m.destinationType=f.hasOwnProperty(k)?f[k]:k;}if(c!==undefined){m.encodingType=i.hasOwnProperty(c)?i[c]:c;}if("quality" in j){m.quality=j.quality;}if("width" in j){m.targetWidth=j.width;}if("height" in j){m.targetHeight=j.height;}try{navigator.camera.getPicture(h,d,m);}catch(g){alert(g);}}});Ext.define("Ext.device.camera.Sencha",{extend:"Ext.device.camera.Abstract",requires:["Ext.device.Communicator"],capture:function(d){var c=this.source,b=this.destination,f=this.encoding,g=d.source,a=d.destination,e=d.encoding;if(c.hasOwnProperty(g)){g=c[g];}if(b.hasOwnProperty(a)){a=b[a];}if(f.hasOwnProperty(e)){e=f[e];}Ext.device.Communicator.send({command:"Camera#capture",callbacks:{success:d.success,failure:d.failure},scope:d.scope,quality:d.quality,width:d.width,height:d.height,source:g,destination:a,encoding:e});}});Ext.define("Ext.device.camera.Simulator",{extend:"Ext.device.camera.Abstract",config:{samples:[{success:"http://www.sencha.com/img/sencha-large.png"}]},constructor:function(a){this.initConfig(a);},updateSamples:function(a){this.sampleIndex=0;},capture:function(d){var c=this.sampleIndex,b=this.getSamples(),g=b.length,f=b[c],e=d.scope,h=d.success,a=d.failure;if("success" in f){if(h){h.call(e,f.success);}}else{if(a){a.call(e,f.failure);}}if(++c>g-1){c=0;}this.sampleIndex=c;}});Ext.define("Ext.device.connection.Abstract",{extend:"Ext.Evented",config:{online:false,type:null},UNKNOWN:"Unknown connection",ETHERNET:"Ethernet connection",WIFI:"WiFi connection",CELL_2G:"Cell 2G connection",CELL_3G:"Cell 3G connection",CELL_4G:"Cell 4G connection",NONE:"No network connection",isOnline:function(){return this.getOnline();}});Ext.define("Ext.device.connection.PhoneGap",{extend:"Ext.device.connection.Abstract",syncOnline:function(){var a=navigator.network.connection.type;this._type=a;this._online=a!=Connection.NONE;},getOnline:function(){this.syncOnline();return this._online;},getType:function(){this.syncOnline();return this._type;}});Ext.define("Ext.device.connection.Sencha",{extend:"Ext.device.connection.Abstract",initialize:function(){Ext.device.Communicator.send({command:"Connection#watch",callbacks:{callback:this.onConnectionChange},scope:this});},onConnectionChange:function(a){this.setOnline(Boolean(a.online));this.setType(this[a.type]);this.fireEvent("onlinechange",this.getOnline(),this.getType());}});Ext.define("Ext.device.connection.Simulator",{extend:"Ext.device.connection.Abstract",getOnline:function(){this._online=navigator.onLine;this._type=Ext.device.Connection.UNKNOWN;return this._online;}});Ext.define("Ext.device.notification.Abstract",{show:function(a){if(!a.message){throw ("[Ext.device.Notification#show] You passed no message");}if(!a.buttons){a.buttons="OK";}if(!Ext.isArray(a.buttons)){a.buttons=[a.buttons];}if(!a.scope){a.scope=this;}return a;},vibrate:Ext.emptyFn});Ext.define("Ext.device.notification.PhoneGap",{extend:"Ext.device.notification.Abstract",requires:["Ext.device.Communicator"],show:function(){var b=this.callParent(arguments),c=(b.buttons)?b.buttons.join(","):null,a=function(d){if(b.callback){b.callback.apply(b.scope,(b.buttons)?[b.buttons[d-1]]:[]);}};navigator.notification.confirm(b.message,a,b.title,c);},vibrate:function(){navigator.notification.vibrate(2000);}});Ext.define("Ext.device.notification.Sencha",{extend:"Ext.device.notification.Abstract",requires:["Ext.device.Communicator"],show:function(){var a=this.callParent(arguments);Ext.device.Communicator.send({command:"Notification#show",callbacks:{callback:a.callback},scope:a.scope,title:a.title,message:a.message,buttons:a.buttons.join(",")});},vibrate:function(){Ext.device.Communicator.send({command:"Notification#vibrate"});}});Ext.define("Ext.device.notification.Simulator",{extend:"Ext.device.notification.Abstract",requires:["Ext.MessageBox"],msg:null,show:function(){var a=this.callParent(arguments),e=[],d=a.buttons.length,c,b,g,f;for(b=0;b<d;b++){c=a.buttons[b];if(Ext.isString(c)){c={text:a.buttons[b],itemId:a.buttons[b].toLowerCase()};}e.push(c);}this.msg=Ext.create("Ext.MessageBox");f=this.msg;g=function(h){if(a.callback){a.callback.apply(a.scope,[h]);}};this.msg.show({title:a.title,message:a.message,scope:this.msg,buttons:e,fn:g});},vibrate:function(){var c=["@-webkit-keyframes vibrate{","    from {","        -webkit-transform: rotate(-2deg);","    }","    to{","        -webkit-transform: rotate(2deg);","    }","}","body {","    -webkit-animation: vibrate 50ms linear 10 alternate;","}"];var b=document.getElementsByTagName("head")[0];var a=document.createElement("style");a.innerHTML=c.join("\n");b.appendChild(a);setTimeout(function(){b.removeChild(a);},400);}});Ext.define("Ext.device.orientation.Abstract",{extend:"Ext.EventedBase",onDeviceOrientation:function(a){this.doFireEvent("orientationchange",[a]);}});Ext.define("Ext.device.orientation.HTML5",{extend:"Ext.device.orientation.Abstract",initialize:function(){this.onDeviceOrientation=Ext.Function.bind(this.onDeviceOrientation,this);window.addEventListener("deviceorientation",this.onDeviceOrientation,true);}});Ext.define("Ext.device.orientation.Sencha",{extend:"Ext.device.orientation.Abstract",requires:["Ext.device.Communicator"],initialize:function(){Ext.device.Communicator.send({command:"Orientation#watch",callbacks:{callback:this.onDeviceOrientation},scope:this});}});Ext.define("Ext.device.Notification",{singleton:true,requires:["Ext.device.Communicator","Ext.device.notification.PhoneGap","Ext.device.notification.Sencha","Ext.device.notification.Simulator"],constructor:function(){var a=Ext.browser.is;if(a.WebView){if(a.PhoneGap){return Ext.create("Ext.device.notification.PhoneGap");}else{return Ext.create("Ext.device.notification.Sencha");}}else{return Ext.create("Ext.device.notification.Simulator");}}});Ext.define("Ext.device.Connection",{singleton:true,requires:["Ext.device.Communicator","Ext.device.connection.Sencha","Ext.device.connection.PhoneGap","Ext.device.connection.Simulator"],constructor:function(){var a=Ext.browser.is;if(a.WebView){if(a.PhoneGap){return Ext.create("Ext.device.connection.PhoneGap");}else{return Ext.create("Ext.device.connection.Sencha");}}else{return Ext.create("Ext.device.connection.Simulator");}}});Ext.define("Ext.device.Camera",{singleton:true,requires:["Ext.device.Communicator","Ext.device.camera.PhoneGap","Ext.device.camera.Sencha","Ext.device.camera.Simulator"],constructor:function(){var a=Ext.browser.is;if(a.WebView){if(a.PhoneGap){return Ext.create("Ext.device.camera.PhoneGap");}else{return Ext.create("Ext.device.camera.Sencha");}}else{return Ext.create("Ext.device.camera.Simulator");}}});Ext.define("Ext.device.Orientation",{singleton:true,requires:["Ext.device.Communicator","Ext.device.orientation.HTML5","Ext.device.orientation.Sencha"],constructor:function(){var a=Ext.browser.is;if(a.Sencha){return Ext.create("Ext.device.orientation.Sencha");}else{return Ext.create("Ext.device.orientation.HTML5");}}});(function(){var a=window.PhoneGap||window.Cordova||window.cordova;QRCodeReader=function(){};QRCodeReader.ErrorResultType={Cancelled:0,Failed:1,Success:2};QRCodeReader.prototype.scanType="RL";QRCodeReader.prototype.getCode=function(b,c){console.log("ScanType is ["+this.scanType+"]");switch(this.scanType){case"RL":case"Nigma":a.exec(b,c,"QRCodeReader"+this.scanType,"getCode",[]);break;default:a.exec(b,c,"QRCodeReaderRL","getCode",[]);break;}};QRCodeReader.prototype._didNotFinishWithResult=function(b){pluginResult.message=b;console.log("ErrorCode = "+b);return pluginResult;};QRCodeReader.prototype._didFinishWithResult=function(c){var b=new FileUploadResult();b.response=decodeURIComponent(c.message.response);c.message=b;return c;};a.addConstructor(function(){if(!window.plugins){window.plugins={};}window.plugins.qrCodeReader=new QRCodeReader();});})();Ext.ns("Genesis.constants");Genesis.constants={host:"http://www.getkickbak.com",sign_in_path:"/sign_in",sign_out_path:"/sign_out",site:"www.getkickbak.com",weekday:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],fbConnectErrorMsg:"Cannot retrive Facebook account information!",isNative:function(){return phoneGapAvailable;},addCRLF:function(){return((!this.isNative())?"<br/>":"\n");},convertDateCommon:function(d,a,h){var e;var g=a||this.dateFormat;if(!(d instanceof Date)){if(typeof(JSON)!="undefined"){}if(Ext.isEmpty(d)){e=new Date();}else{if(g){e=Date.parse(d,g);if(Ext.isEmpty(e)){e=new Date(d).format(g);}return[e,e];}e=new Date(d);if(e.toString()=="Invalid Date"){e=Date.parse(d,g);}}}else{e=d;}if(!h){var c=new Date().getTime();var f=Genesis.constants.currentDateTime(c);var b=(f-e.getTime())/1000;if(b>-10){if((b)<2){return[b,"a second ago"];}if((b)<60){return[b,parseInt(b)+" secs ago"];}b=b/60;if((b)<2){return[b,"a minute ago"];}if((b)<60){return[b,parseInt(b)+" minutes ago"];}b=b/60;if((b)<2){return[e,"an hour ago"];}if((b)<24){return[e,parseInt(b)+" hours ago"];}b=b/24;if(((b)<2)&&((new Date().getDay()-e.getDay())==1)){return[e,"Yesterday at "+e.format("g:i A")];}if((b)<7){return[e,Genesis.constants.weekday[e.getDay()]+" at "+e.format("g:i A")];}b=b/7;if(((b)<2)&&(b%7==0)){return[e,"a week ago"];}if(((b)<5)&&(b%7==0)){return[e,parseInt(b)+" weeks ago"];}if(b<5){return[e,parseInt(b*7)+" days ago"];}return[e,null];}else{}}return[e,-1];},convertDateFullTime:function(a){return a.format("D, M d, Y \\a\\t g:i A");},convertDateReminder:function(c){var b=new Date();var a=b.getDate();var g=b.getMonth();var e=b.getFullYear();var d=c.getDate();var h=c.getMonth();var f=c.getFullYear();if(a==d&&g==h&&e==f){return"Today "+c.format("g:i A");}return c.format("D g:i A");},convertDate:function(b,a){var c=Genesis.constants.convertDateCommon.call(this,b,a);if(c[1]!=-1){return(c[1]==null)?c[0].format("M d, Y"):c[1];}else{return c[0].format("D, M d, Y \\a\\t g:i A");}},convertDateNoTime:function(a){var b=Genesis.constants.convertDateCommon.call(this,a,null,true);if(b[1]!=-1){return(b[1]==null)?b[0].format("D, M d, Y"):b[1];}else{return b[0].format("D, M d, Y");}},convertDateNoTimeNoWeek:function(a){var b=Genesis.constants.convertDateCommon.call(this,a,null,true);if(b[1]!=-1){b=(b[1]==null)?b[0].format("M d, Y"):b[1];}else{b=b[0].format("M d, Y");}return b;},convertDateInMins:function(a){var b=Genesis.constants.convertDateCommon.call(this,a,null,true);if(b[1]!=-1){return(b[1]==null)?b[0].format("h:ia T"):b[1];}else{return b[0].format("h:ia T");}},currentDateTime:function(a){return systemTime+(a-clientTime);},initFb:function(){var c=window.localStorage;var a=window.localStorage;var b=this;FB.Event.monitor("auth.authResponseChange",function(e){console.log("Got the user's session: ",e);if(e&&e.status!="not_authorized"&&e.status!="notConnected"){var d=e.authResponse.accessToken;if(d){FB.api("/me",function(f){if(!f.error){a.setItem("authToken",d);c.setItem("fbResponse",f);c.setItem("currFbId",f.id);c.setItem("fbAccountId",f.email);console.log("Updating Session to use\nAuthToken["+a.getItem("authToken")+"]\nFbID["+c.getItem("currFbId")+"]\nAccountID["+c.getItem("fbAccountId")+"]");}else{b.facebook_onLogout(null,false);}});}else{b.facebook_onLogout(null,false);}}else{if((e===undefined)||(e&&e.status=="not_authorized")){console.log("User's session terminated");b.facebook_onLogout(null,(e)?true:false);}}});},getFriendsList:function(e){var b="id";var a="name";var d=this;var c=window.localStorage;FB.api("/me/friends&fields="+a+","+b,function(f){var j="";d.friendsList=[];if(f&&f.data&&(f.data.length>0)){var h=f.data;for(var g=0;g<h.length;g++){if(h[g][b]!=c.getItem("currFbId")){d.friendsList.push({label:h[g][a],value:h[g][b]});j+=((j.length>0)?",":"")+h[g][b];}}d.friendsList.sort(function(k,i){return k[b]-i[b];});Ext.device.Notification.show({title:"Facebook Connect",message:"We found "+d.friendsList.length+" Friends from your social network!"});}else{Ext.device.Notification.show({title:"Facebook Connect",message:"You cannot retrieve your Friends List from Facebook. Login and Try Again.",buttons:["Relogin","Cancel"],callback:function(i){d.facebook_onLogout(function(){if(i=="Relogin"){d.fbLogin(cb);}else{}},true);}});}});},fbLogin:function(a){var c=window.localStorage;var b=this;console.debug("Logging into Facebook ...");Ext.Viewport.setMasked({xtype:"loadmask",message:"Logging into Facebook ..."});FB.login(function(d){if((d.status=="connected")&&d.authResponse){console.debug("Logged into Facebook!");c.setItem("access_token",d.authResponse.accessToken);b.facebook_loginCallback(a);}else{Ext.Viewport.setMasked(false);console.debug("Login Failed! ...");Ext.device.Notification.show({title:"Facebook Connect",message:"Failed to login to Facebook!"});}},{scope:"email,user_birthday,publish_stream,read_friendlists,publish_actions"});},facebook_onLogin:function(a,d){var c=window.localStorage;var b=this;a=a||Ext.emptyFn;if(c.getItem("currFbId")>0){if(!d){Ext.device.Notification.show({title:"Facebook Connect",message:"Account ID: "+getItem("fbAccountId")+Genesis.constants.addCRLF()+"is used for your current Facebook session."});}}else{b.fbLogin(a);}},facebook_loginCallback:function(a,d){var c=this;var b=window.localStorage;console.debug("Retrieving Facebook profile information ...");d=d||0;a=a||Ext.emptyFn;FB.api("/me",function(e){if(d>=5){Ext.Viewport.setMasked(false);Ext.device.Notification.show({title:"Facebook Connect",message:c.fbConnectErrorMsg});c.facebook_onLogout(null,true);return;}var f=e.id;if(f==null){console.debug("Missing Facebook Session information, Retrying ...");++d;Ext.defer(function(i){c.facebook_loginCallback(a,i);},d*1000,c,[d]);return;}Ext.Viewport.setMasked(false);if(b.getItem("currFbId")==f){console.debug("Session information same as previous session.");}b.setItem("fbResponse",e);b.setItem("currFbId ",f);b.setItem("fbAccountId",e.email);console.debug("You`ve logged into Facebook! Email("+b.getItem("fbAccountId")+")");c._fb_connect();c.getFriendsList();if(a){var g=e.birthday.split("/");g=g[2]+"-"+g[0]+"-"+g[1];var h={name:e.name,email:e.email,facebook_email:e.email,facebook_id:f,facebook_uid:e.username,gender:(e.gender=="male")?"m":"f",birthday:g,photoURL:"http://graph.facebook.com/"+f+"/picture?type=square"};a(h);}});},_fb_connect:function(){},facebook_onLogout:function(a,b){var d=window.localStorage;var c=this;a=a||Ext.emptyFn;try{c._fb_disconnect();d.setItem("currFbId",0);d.setItem("fbAccountId",null);d.setItem("fbResponse",null);if(b){FB.logout(function(e){a();});}else{a();}}catch(f){}}};Genesis.constants._fb_disconnect=Genesis.constants._fb_connect;Genesis.fn={addUnit:function(a){return a+"px";},_removeUnitRegex:/(\d+)px/,removeUnit:function(a){return a.match(this._removeUnitRegex)[1];}};Ext.define("Genesis.dom.Element",{override:"Ext.dom.Element",setMargin:function(b,a){if(b||b===0){b=this.self.unitizeBox((b===true)?5:b,a);}else{b=null;}this.dom.style.margin=b;},setPadding:function(b,a){if(b||b===0){b=this.self.unitizeBox((b===true)?5:b,a);}else{b=null;}this.dom.style.padding=b;},});Ext.define("Genesis.Component",{override:"Ext.Component",updatePadding:function(a){this.innerElement.setPadding(a,this.getInitialConfig().defaultUnit);},updateMargin:function(a){this.element.setMargin(a,this.getInitialConfig().defaultUnit);}});Ext.define("Genesis.util.Collection",{override:"Ext.util.Collection",clear:function(){this.callParent(arguments);this.indices={};}});Ext.define("Genesis.data.reader.Json",{override:"Ext.data.reader.Json",getResponseData:function(a){var b=this.callParent(arguments);if(!b.metaData){delete this.metaData;}return b;}});Ext.define("Genesis.data.proxy.OfflineServer",{override:"Ext.data.proxy.Server",processResponse:function(m,c,f,d,l,o){var j=this,b=c.getAction(),h=j.getReader(),k;var a=_application;var n=a.getController("Viewport");var g=function(){var q=((k&&Ext.isDefined(k.getMessage))?(Ext.isArray(k.getMessage())?k.getMessage().join(Genesis.constants.addCRLF()):k.getMessage()):"Error Connecting to Server");var e=h.metaData||{};Ext.Viewport.setMasked(false);switch(e.rescode){case"server_error":Ext.device.Notification.show({title:"Server Error(s)",message:q,callback:function(){if(e.session_timeout){var s=window.localStorage;n.setLoggedIn(false);s.setItem("authToken",null);n.onFeatureTap("MainPage","login");}else{}}});break;case"login_invalid_facebook_info":Ext.device.Notification.show({title:"Create Account",message:"Create user account using Facebook Profile information",callback:function(u){var t=window.localStorage;n.setLoggedIn(false);t.setItem("authToken",null);var s=a.getController("MainPage");a.dispatch({action:"onCreateAccountTap",args:[null,null,null,null],controller:s,scope:s});}});break;case"update_account_invalid_info":case"signup_invalid_info":case"update_account_invalid_facebook_info":var r=[];for(var p in q){r.push(q[p]);}Ext.device.Notification.show({title:"Error",message:r});break;default:Ext.device.Notification.show({title:"Error",message:q});break;}};if((m===true)||(Genesis.constants.isNative()===true)){try{k=h.process(d);}catch(i){console.debug("Ajax call is failed message=["+i.message+"] url=["+f.getUrl()+"]");c.setException(c,{status:null,statusText:i.message});j.fireEvent("exception",this,d,c);g();return;}if(c.process(b,k,f,d)===false){this.fireEvent("exception",this,d,c);g();}}else{console.debug("Ajax call is failed status=["+d.status+"] url=["+f.getUrl()+"]");j.setException(c,d);j.fireEvent("exception",this,d,c);g();}if(typeof l=="function"){l.call(o||j,c);}j.afterRequest(f,m);},buildRequest:function(a){var b=window.localStorage;if(b.getItem("authToken")){this.setExtraParam("auth_token",b.getItem("authToken"));}var c=this.callParent(arguments);if(a.initialConfig.jsonData){c.setJsonData(a.initialConfig.jsonData);}return c;}});Ext.define("Genesis.data.Connection",{override:"Ext.data.Connection",parseStatus:function(a){a=a==1223?204:a;var c=(a>=200&&a<300)||a==304,b=false;if(Genesis.constants.isNative()&&(a===0)){c=true;}if(!c){switch(a){case 12002:case 12029:case 12030:case 12031:case 12152:case 13030:b=true;break;}}return({success:c,isException:b});}});Ext.define("Genesis.data.association.BelongsTo",{override:"Ext.data.association.BelongsTo",read:function(b,a,c){b[this.getInstanceName()]=a.read(c).getRecords()[0];}});Ext.define("Genesis.field.Select",{override:"Ext.field.Select",getListPanel:function(){if(!this.listPanel){this.listPanel=Ext.create("Ext.Panel",{top:0,left:0,height:"9em",modal:true,cls:Ext.baseCSSPrefix+"select-overlay",layout:"fit",hideOnMaskTap:true,items:{xtype:"list",store:this.getStore(),itemTpl:'<span class="x-list-label">{'+this.getDisplayField()+"}</span>",listeners:{select:this.onListSelect,itemtap:this.onListTap,scope:this}}});}return this.listPanel;}});Ext.define("Genesis.dataview.element.List",{override:"Ext.dataview.element.List",updateListItem:function(b,j){var g=this,c=g.dataview,i=Ext.fly(j),f=i.down(g.labelClsCache,true),a=b.getData(true),d=a&&a.hasOwnProperty("disclosure"),k=a&&a.hasOwnProperty("iconSrc"),e,h;f.innerHTML=c.getItemTpl().apply(a);if(d&&c.getOnItemDisclosure()){e=i.down(g.disclosureClsCache);if(!e){e=i.down(g.disclosureClsCache+g.hiddenDisplayCache);e[d?"removeCls":"addCls"](g.disclosureClsCache+g.hiddenDisplayCache);e.addCls(g.disclosureClsCache);}else{e[d?"removeCls":"addCls"](g.hiddenDisplayCache);}}if(c.getIcon()){h=i.down(g.iconClsCache,true);h.style.backgroundImage=k?'url("'+k+'")':"";}}});Ext.define("Genesis.tab.Bar",{override:"Ext.tab.Bar",doSetActiveTab:function(b,a){this.callParent(arguments);this.fireAction("tabchange",[this,b,a]);}});Ext.define("Genesis.Button",{override:"Ext.Button",initialize:function(){this.callParent();this.element.on({scope:this,touchstart:"onPress",dragend:"onRelease",drag:"onMove",tap:"onTap"});},onPress:function(c){var a=this.element,b=this.getPressedCls();if(!this.getDisabled()){this.isPressed=true;if(!c.target.children.length){this.pressedTarget=c.target.parentElement.id;}else{this.pressedTarget=c.target.id;}if(this.hasOwnProperty("releasedTimeout")){clearTimeout(this.releasedTimeout);delete this.releasedTimeout;}a.addCls(b);}},onMove:function(c,a){if(!this.isPressed){return;}var d;var b=Ext.get(a);if(Ext.getCmp("debugconsole")){Ext.getCmp("debugconsole").setHtml(Ext.getCmp("debugconsole").getHtml()+"<br/>touchmove target id: "+a.id);Ext.getCmp("debugconsole").getScrollable().getScroller().scrollToEnd();}if(b.parent(".x-button")){d=b.parent(".x-button").id;}else{if(b.hasCls("x-button")){d=b.id;}}if(b.parent(".x-tab")){d=b.parent(".x-tab").id;}else{if(b.hasCls("x-tab")){d=b.id;}}if(d!=this.pressedTarget){this.element.removeCls(this.getPressedCls());}else{this.element.addCls(this.getPressedCls());}},onRelease:function(b,a){this.fireAction("release",[this,b,a],"doRelease");},doRelease:function(c,d,a){var f;var b=Ext.get(a);if(b.parent(".x-button")){f=b.parent(".x-button").id;}else{if(b.hasCls("x-button")){f=b.id;}}if(b.parent(".x-tab")){f=b.parent(".x-tab").id;}else{if(b.hasCls("x-tab")){f=b.id;}}if(!c.isPressed){return;}c.isPressed=false;if(c.hasOwnProperty("pressedTimeout")){clearTimeout(c.pressedTimeout);delete c.pressedTimeout;}c.releasedTimeout=setTimeout(function(){if(c&&c.element){c.element.removeCls(c.getPressedCls());if(f==c.pressedTarget){c.fireAction("tap",[c,d],"doTap");}}c.pressedTarget=null;},10);},onTap:function(a){return false;}});Ext.define("Genesis.plugin.PullRefresh",{override:"Ext.plugin.PullRefresh",resetRefreshState:function(){Ext.device.Notification.beep(1);this.callParent(arguments);}});Ext.merge(Array.prototype,{binarySearch:function(f,b){var a=0,e=this.length-1,c,d;while(a<=e){c=Math.floor((a+e)/2);d=b(this[c],f);if(d<0){a=c+1;continue;}if(d>0){e=c-1;continue;}return c;}return null;}});Ext.merge(String.prototype,{getFuncBody:function(){var a=this.toString();a=a.replace(/[^{]+\{/,"");a=a.substring(0,a.length-1);a=a.replace(/\n/gi,"");if(!a.match(/\(.*\)/gi)){a+=")";}return a;},strip:function(){return this.replace(/^\s+/,"").replace(/\s+$/,"");},stripScripts:function(){return this.replace(new RegExp("<noscript[^>]*?>([\\S\\s]*?)</noscript>","img"),"").replace(new RegExp("<script[^>]*?>([\\S\\s]*?)<\/script>","img"),"").replace(new RegExp("<link[^>]*?>([\\S\\s]*?)</link>","img"),"").replace(new RegExp("<link[^>]*?>","img"),"").replace(new RegExp("<iframe[^>]*?>([\\S\\s]*?)</iframe>","img"),"").replace(new RegExp("<iframe[^>]*?>","img"),"").replace(new RegExp("<embed[^>]*?>([\\S\\s]*?)</embed>","img"),"").replace(new RegExp("<embed[^>]*?>","img"),"").replace(new RegExp("<object[^>]*?>([\\S\\s]*?)</object>","img"),"").replace(new RegExp("<object[^>]*?>","img"),"").replace(new RegExp("<applet[^>]*?>([\\S\\s]*?)</applet>","img"),"").replace(new RegExp("<applet[^>]*?>","img"),"").replace(new RegExp("<button[^>]*?>([\\S\\s]*?)</button>","img"),"").replace(new RegExp("<button[^>]*?>","img"),"").replace(new RegExp("<input[^>]*?>([\\S\\s]*?)</input>","img"),"").replace(new RegExp("<input[^>]*?>","img"),"").replace(new RegExp("<style[^>]*?>([\\S\\s]*?)</style>","img"),"").replace(new RegExp("<style[^>]*?>","img"),"");},stripTags:function(){return this.replace(/<\/?[^>]+>/gi,"");},stripComments:function(){return this.replace(/<!(?:--[\s\S]*?--\s*)?>\s*/g,"");},times:function(c){var b="";for(var a=0;a<c;a++){b+=this;}return b;},zp:function(a){return("0".times(a-this.length)+this);},capitalize:function(){return this.replace(/\w+/g,function(b){return b.charAt(0).toUpperCase()+b.substr(1);});},uncapitalize:function(){return this.replace(/\w+/g,function(b){return b.charAt(0).toLowerCase()+b.substr(1);});},trim:function(a){if(a=="left"){return this.replace(/^\s*/,"");}if(a=="right"){return this.replace(/\s*$/,"");}if(a=="normalize"){return this.replace(/\s{2,}/g," ").trim();}return this.trim("left").trim("right");},htmlEncode:(function(){var d={"&":"&amp;",">":"&gt;","<":"&lt;",'"':"&quot;"},b=[],c,a;for(c in d){b.push(c);}a=new RegExp("("+b.join("|")+")","g");return function(e){return(!e)?e:String(e).replace(a,function(g,f){return d[f];});};})(),htmlDecode:(function(){var d={"&amp;":"&","&gt;":">","&lt;":"<","&quot;":'"'},b=[],c,a;for(c in d){b.push(c);}a=new RegExp("("+b.join("|")+"|&#[0-9]{1,5};)","g");return function(e){return(!e)?e:String(e).replace(a,function(g,f){if(f in d){return d[f];}else{return String.fromCharCode(parseInt(f.substr(2),10));}});};})()});
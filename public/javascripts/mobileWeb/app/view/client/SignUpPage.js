Ext.define('KickBak.view.client.SignUpPage',
{
   extend : 'Ext.form.Panel',
   requires : ['Ext.dataview.List', 'Ext.XTemplate', 'KickBak.view.widgets.ListField', 'KickBak.view.ViewBase', //
   'Ext.field.Text', 'Ext.field.DatePicker', 'Ext.field.Toggle', 'Ext.form.FieldSet', 'KickBak.view.widgets.ListField', //
   'KickBak.model.frontend.Account', 'KickBak.view.widgets.Item', 'KickBak.view.widgets.ItemDetail'],
   alias : 'widget.clientsignuppageview',
   fbConnectRequestMsg : 'By connecting to Facebook, you will receive additional Reward Pts everytime we update your KICKBAK activity to your Facebook account!',
   config :
   {
      preRender : null,
      cls : 'viewport',
      scrollable : 'vertical',
      layout :
      {
         type : 'vbox',
         align : 'stretch',
         pack : 'start'
      }
   },
   constructor : function(config)
   {
      var me = this;
      config = config ||
      {
      };

      Ext.merge(config,
      {
         items : [Ext.apply(KickBak.view.ViewBase.generateTitleBarConfig(),
         {
            title : 'KickBak SignUp'
            /*,
             items : [
             {
             align : 'left',
             tag : 'back',
             //ui : 'back',
             ui : 'normal',
             text : 'Back'
             }]
             */
         }),
         {
            xtype : 'fieldset',
            title : 'Social Media',
            instructions : me.fbConnectRequestMsg,
            defaults :
            {
               labelWidth : '60%'
            },
            items : [
            {
               xtype : 'togglefield',
               name : 'facebook',
               label : '<img src="' + //
               'resources/images/' + KickBak.constants.themeName + 'facebook_icon.png" ' + //
               'style="height:' + (2.5 / 0.8) + 'em' + ';float:left;margin-right:0.8em;"/> Facebook',
               value : 0
            },
            {
               hidden : true,
               xtype : 'togglefield',
               name : 'twitter',
               label : '<img src="' + //
               'resources/images/' + KickBak.constants.themeName + 'twitter_icon.png" ' + //
               'style="height:' + (2.5 / 0.8) + 'em' + ';float:left;margin-right:0.8em;"/> Twitter',
               value : 0
            }]
         },
         {
            xtype : 'fieldset',
            tag : 'profile',
            title : 'Account Profile',
            //instructions : 'Tell us all about yourself',
            defaults :
            {
               labelWidth : '50%'
            },
            items : [
            /*
             {
             xtype : 'textfield',
             name : 'tagid',
             clearIcon : false,
             label : "Mobile Tag ID",
             value : ' ',
             readOnly : true
             },
             */
            {
               xtype : 'textfield',
               labelWidth : '30%',
               name : 'user',
               label : "Name",
               placeHolder : 'John Smith',
               required : true
            },
            {
               xtype : 'textfield',
               labelWidth : '30%',
               name : 'email',
               label : "Email",
               placeHolder : 'john.smith@example.com',
               required : true
            }, Ext.apply(
            {
               labelWidth : '30%',
               label : 'Phone',
               name : 'phone',
               required : true
            }, KickBak.view.ViewBase.phoneField()),
            {
               xtype : 'datepickerfield',
               labelWidth : '30%',
               label : 'Birthday',
               name : 'birthday',
               dateFormat : 'M j, Y',
               required : false,
               picker :
               {
                  yearFrom : 1913,
                  doneButton :
                  {
                     ui : 'normal'
                  }
               },
               value : 0
            }
            /*
             ,{
             xtype : 'listfield',
             name : 'changepassword',
             label : 'Change Password',
             value : ' '
             }*/]
         },
         {
            tag : 'signUp',
            xtype : 'button',
            //ui : 'orange-large',
            ui : 'confirm',
            height : '3em',
            style : 'margin:0 0.5em 1.5em 0.5em',
            text : 'SIGN UP NOW!'
         },
         {
            xtype : 'fieldset',
            title : 'About Kickbak',
            defaults :
            {
               labelWidth : '50%'
            },
            //instructions : 'Tell us all about yourself',
            items : [
            /*
             {
             xtype : 'textfield',
             label : 'Version',
             value : KickBak.constants.clientVersion,
             clearIcon : false,
             readOnly : true
             },
             */
            {
               xtype : 'listfield',
               name : 'terms',
               label : 'Terms of Use',
               value : ' '
            },
            {
               xtype : 'listfield',
               name : 'privacy',
               label : 'Privacy',
               value : ' '
            }/*,
             {
             xtype : 'listfield',
             name : 'aboutus',
             label : 'About Us'
             value : ' '
             }*/]
         }]
      });

      me.callParent(arguments);
   },
   initialize : function()
   {
      this.callParent(arguments);
      this.setPreRender([]);
   },
   cleanView : function()
   {
      return KickBak.view.ViewBase.prototype.cleanView.apply(this, arguments);
   },
   /**
    * Removes all items currently in the Container, optionally destroying them all
    * @param {Boolean} destroy If true, {@link Ext.Component#destroy destroys} each removed Component
    * @param {Boolean} everything If true, completely remove all items including docked / centered and floating items
    * @return {Ext.Component} this
    */
   removeAll : function(destroy, everything)
   {
      return KickBak.view.ViewBase.prototype.removeAll.apply(this, arguments);
   },
   createView : function()
   {
      return KickBak.view.ViewBase.prototype.createView.apply(this, arguments);
   },
   showView : function()
   {
      return KickBak.view.ViewBase.prototype.showView.apply(this, arguments);
   },
   signUpSuccessPopup : function()
   {
      var me = this;

      if (!me._actions)
      {
         me._actions = Ext.create('KickBak.view.widgets.PopupItemDetail',
         {
            title : 'Congratulations!' + KickBak.constants.addCRLF() + 'You have registered with KICKBAK',
            /*
             preItemsConfig : [
             {
             cls : 'title',
             defaultUnit : 'em',
             xtype : 'component',
             html : 'You have successfully Signed Up to KICKBAK',
             margin : '0 0 1.0 0'
             }],
             */
            buttons : [
            {
               margin : '0 0 0.5 0',
               text : 'Download Mobile App Now!',
               ui : 'action',
               height : '3em',
               handler : function()
               {
                  //me._actions.hide();
                  if (Ext.os.is('iOS'))
                  {
                     location.href = 'http://itunes.apple.com/us/app/kickbak-inc/id537476722?ls=1&mt=8'
                  }
                  else if (Ext.os.is('Android'))
                  {
                     location.href = 'https://play.google.com/store/apps/details?id=com.getkickbak.kickbak';
                  }
                  else
                  {
                     location.href = 'http://itunes.apple.com/us/app/kickbak-inc/id537476722?ls=1&mt=8'
                  }
               }
            }]
         });
         Ext.Viewport.add(me._actions);
      }
      me._actions.show();
   }
});

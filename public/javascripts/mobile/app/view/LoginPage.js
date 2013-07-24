Ext.define('Genesis.view.LoginPage',
{
   extend : 'Genesis.view.ViewBase',
   requires : ['Ext.ActionSheet'],
   alias : 'widget.loginpageview',
   config :
   {
      cls : 'bgImage',
      scrollable : undefined
   },
   initialize : function()
   {
      var actions = Ext.create('Ext.ActionSheet',
      {
         modal : false,
         style :
         {
            background : 'transparent',
            border : 'none'
         },
         layout : 'hbox',
         showAnimation : null,
         hideAnimation : null,
         defaultUnit : 'em',
         //padding : '1em',
         hideOnMaskTap : false,
         defaults :
         {
            height : '4em',
            flex : 1,
            defaultUnit : 'em',
            xtype : 'button'
         },
         items : [
         {
            margin : '0 0.7 0 0',
            tag : 'signIn',
            text : 'Sign-In'
         },
         {
            labelCls : 'x-button-label wrap',
            margin : '0 0.7 0 0',
            tag : 'facebook',
            ui : 'fbBlue',
            text : 'Facebook Sign-In'
         },
         {
            labelCls : 'x-button-label wrap',
            tag : 'createAccount',
            ui : 'action',
            text : 'Create Account'
         }]
      });
      this.add(actions);
      this.callParent(arguments);
   }
});

Ext.define('Genesis.view.SignInPage',
{
   extend : 'Ext.form.Panel',
   alias : 'widget.signinpageview',
   requires : ['Ext.field.Email', 'Ext.field.Password', 'Genesis.view.ViewBase'],
   config :
   {
      preRender : null,
      fullscreen : true,
      cls : 'viewport',
      layout :
      {
         type : 'vbox',
         align : 'stretch',
         pack : 'start'
      },
      changeTitle : false,
      //scrollable : 'vertical',
      items : [Ext.apply(Genesis.view.ViewBase.generateTitleBarConfig(),
      {
         title : 'Sign In',
         items : [
         {
            align : 'left',
            //ui : 'back',
            ui : 'normal',
            tag : 'back',
            text : 'Back'
         }]
      }),
      {
         xtype : 'fieldset',
         title : 'Login Credentials:',
         defaults :
         {
            required : true,
            labelAlign : 'top',
            clearIcon : true
         },
         items : [
         {
            xtype : 'emailfield',
            name : 'username',
            label : 'Email Address',
            placeHolder : 'johndoe@example.com'
         },
         {
            xtype : 'passwordfield',
            name : 'password',
            label : 'Password'
         }]
      },
      {
         xtype : 'button',
         ui : 'action',
         tag : 'login',
         text : 'Sign In',
         defaultUnit : 'em',
         height : '3em',
         xtype : 'button',
         margin : '0.5 0 0 0'
      },
      {
         xtype : 'button',
         tag : 'reset',
         text : 'Password Reset',
         height : '3em',
         defaultUnit : 'em',
         xtype : 'button',
         margin : '0.5 0 0 0'
      }]
   },
   initialize : function()
   {
      this.callParent(arguments);
      this.setPreRender([]);
   },
   /**
    * Removes all items currently in the Container, optionally destroying them all
    * @param {Boolean} destroy If true, {@link Ext.Component#destroy destroys} each removed Component
    * @param {Boolean} everything If true, completely remove all items including docked / centered and floating items
    * @return {Ext.Component} this
    */
   removeAll : function(destroy, everything)
   {
      return Genesis.view.ViewBase.prototype.removeAll.apply(this, arguments);
   },
   cleanView : function()
   {
      return Genesis.view.ViewBase.prototype.cleanView.apply(this, arguments);
   },
   createView : function()
   {
      return Genesis.view.ViewBase.prototype.createView.apply(this, arguments);
   },
   showView : function()
   {
      return Genesis.view.ViewBase.prototype.showView.apply(this, arguments);
   }
});

Ext.define('Genesis.view.PasswdResetPage',
{
   extend : 'Ext.form.Panel',
   alias : 'widget.passwdresetpageview',
   requires : ['Ext.field.Email', 'Genesis.view.ViewBase'],
   config :
   {
      preRender : null,
      fullscreen : true,
      cls : 'viewport',
      layout :
      {
         type : 'vbox',
         align : 'stretch',
         pack : 'start'
      },
      changeTitle : false,
      scrollable : 'vertical',
      items : [Ext.apply(Genesis.view.ViewBase.generateTitleBarConfig(),
      {
         title : 'Password Reset',
         items : [
         {
            align : 'left',
            //ui : 'back',
            ui : 'normal',
            tag : 'back',
            text : 'Back'
         }]
      }),
      {
         xtype : 'fieldset',
         title : 'Login Credentials:',
         defaults :
         {
            required : true,
            labelAlign : 'top'
         },
         items : [
         {
            xtype : 'emailfield',
            name : 'username',
            label : 'Email Address',
            clearIcon : true,
            placeHolder : 'johndoe@example.com'
         }]
      },
      {
         xtype : 'button',
         tag : 'submit',
         text : 'Reset',
         defaultUnit : 'em',
         xtype : 'button',
         margin : '0.5 0 0 0'
      }]
   },
   initialize : function()
   {
      this.callParent(arguments);
      this.setPreRender([]);
   },
   /**
    * Removes all items currently in the Container, optionally destroying them all
    * @param {Boolean} destroy If true, {@link Ext.Component#destroy destroys} each removed Component
    * @param {Boolean} everything If true, completely remove all items including docked / centered and floating items
    * @return {Ext.Component} this
    */
   removeAll : function(destroy, everything)
   {
      return Genesis.view.ViewBase.prototype.removeAll.apply(this, arguments);
   },
   cleanView : function()
   {
      return Genesis.view.ViewBase.prototype.cleanView.apply(this, arguments);
   },
   createView : function()
   {
      return Genesis.view.ViewBase.prototype.createView.apply(this, arguments);
   },
   showView : function()
   {
      return Genesis.view.ViewBase.prototype.showView.apply(this, arguments);
   }
});

Ext.define('Genesis.view.PasswdChangePage',
{
   extend : 'Ext.form.Panel',
   alias : 'widget.passwdchangepageview',
   requires : ['Ext.field.Password', 'Ext.field.Text'],
   config :
   {
      preRender : null,
      fullscreen : true,
      cls : 'viewport',
      layout :
      {
         type : 'vbox',
         align : 'stretch',
         pack : 'start'
      },
      changeTitle : false,
      scrollable : 'vertical',
      items : [Ext.apply(Genesis.view.ViewBase.generateTitleBarConfig(),
      {
         title : 'Password Change',
         items : [
         {
            align : 'left',
            //ui : 'back',
            ui : 'normal',
            tag : 'back',
            text : 'Back'
         }]
      }),
      {
         xtype : 'fieldset',
         title : 'Login Credentials:',
         defaults :
         {
            required : true,
            labelAlign : 'top'
         },
         items : [
         {
            xtype : 'passwordfield',
            name : 'oldpassword',
            label : 'Old Password',
            clearIcon : true
         },
         {
            xtype : 'passwordfield',
            name : 'newpassword',
            label : 'New Password',
            clearIcon : true
         }]
      },
      {
         xtype : 'button',
         tag : 'submit',
         text : 'Change Password',
         defaultUnit : 'em',
         xtype : 'button',
         margin : '0.5 0 0 0'
      }]
   },
   initialize : function()
   {
      this.callParent(arguments);
      this.setPreRender([]);
   },
   /**
    * Removes all items currently in the Container, optionally destroying them all
    * @param {Boolean} destroy If true, {@link Ext.Component#destroy destroys} each removed Component
    * @param {Boolean} everything If true, completely remove all items including docked / centered and floating items
    * @return {Ext.Component} this
    */
   removeAll : function(destroy, everything)
   {
      return Genesis.view.ViewBase.prototype.removeAll.apply(this, arguments);
   },
   cleanView : function()
   {
      return Genesis.view.ViewBase.prototype.cleanView.apply(this, arguments);
   },
   createView : function()
   {
      return Genesis.view.ViewBase.prototype.createView.apply(this, arguments);
   },
   showView : function()
   {
      return Genesis.view.ViewBase.prototype.showView.apply(this, arguments);
   }
});

Ext.define('Genesis.view.CreateAccountPage',
{
   extend : 'Ext.form.Panel',
   alias : 'widget.createaccountpageview',
   requires : ['Ext.field.Text', 'Ext.field.Email', 'Ext.field.Password'],
   config :
   {
      preRender : null,
      fullscreen : true,
      cls : 'viewport',
      layout :
      {
         type : 'vbox',
         align : 'stretch',
         pack : 'start'
      },
      changeTitle : false,
      scrollable : 'vertical',
      items : [Ext.apply(Genesis.view.ViewBase.generateTitleBarConfig(),
      {
         title : 'Create Account',
         items : [
         {
            align : 'left',
            //ui : 'back',
            ui : 'normal',
            tag : 'back',
            text : 'Back'
         }]
      }),
      {
         xtype : 'fieldset',
         tag : 'social',
         title : 'Social Media',
         //instructions : Genesis.fb.fbConnectRequestMsg,
         defaults :
         {
            labelWidth : '60%'
         },
         items : [
         {
            xtype : 'togglefield',
            name : 'facebook',
            label : '<img src="' + //
            Genesis.constants.resourceSite + 'images/' + Genesis.constants.themeName + '/' + 'facebook_icon.png" ' + //
            'style="height:' + (2.5 / 0.8) + 'em' + ';float:left;margin-right:0.8em;"/> Facebook',
            value : 0
         },
         {
            hidden : true,
            xtype : 'togglefield',
            name : 'twitter',
            label : '<img src="' + //
            Genesis.constants.resourceSite + 'images/' + Genesis.constants.themeName + '/' + 'twitter_icon.png" ' + //
            'style="height:' + (2.5 / 0.8) + 'em' + ';float:left;margin-right:0.8em;"/> Twitter',
            value : 0
         }]
      },
      {
         xtype : 'fieldset',
         title : 'Account Credentials:',
         //instructions : 'Enter Username (email address) and Password',
         defaults :
         {
            clearIcon : true,
            required : true,
            labelAlign : 'top'
         },
         items : [
         {
            xtype : 'textfield',
            name : 'name',
            label : 'Full Name',
            placeHolder : 'John Smith'
         },
         {
            xtype : 'emailfield',
            name : 'username',
            label : 'Email Address',
            placeHolder : 'johndoe@example.com'
         }, Ext.apply(
         {
            label : 'Phone Number',
            name : 'phone'
         }, Genesis.view.ViewBase.phoneField()),
         {
            xtype : 'passwordfield',
            name : 'password',
            label : 'Password'
         }]
      },
      {
         height : '3em',
         xtype : 'button',
         ui : 'action',
         tag : 'createAccount',
         text : 'Create Account'
      }]
   },
   initialize : function()
   {
      this.callParent(arguments);
      this.setPreRender([]);
   },
   /**
    * Removes all items currently in the Container, optionally destroying them all
    * @param {Boolean} destroy If true, {@link Ext.Component#destroy destroys} each removed Component
    * @param {Boolean} everything If true, completely remove all items including docked / centered and floating items
    * @return {Ext.Component} this
    */
   removeAll : function(destroy, everything)
   {
      return Genesis.view.ViewBase.prototype.removeAll.apply(this, arguments);
   },
   cleanView : function()
   {
      return Genesis.view.ViewBase.prototype.cleanView.apply(this, arguments);
   },
   createView : function()
   {
      var rc = Genesis.view.ViewBase.prototype.createView.apply(this, arguments);
      this.query('fieldset[tag=social]')[0].setInstructions(Genesis.fb.fbConnectRequestMsg);
      return rc;
   },
   showView : function()
   {
      return Genesis.view.ViewBase.prototype.showView.apply(this, arguments);
   }
});

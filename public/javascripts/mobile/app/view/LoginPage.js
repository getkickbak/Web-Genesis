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
         showAnimation : null,
         hideAnimation : null,
         defaultUnit : 'em',
         padding : '1em',
         hideOnMaskTap : false,
         defaults :
         {
            defaultUnit : 'em',
            xtype : 'button',
            margin : '0.5 0 0 0'
         },
         items : [
         {
            tag : 'facebook',
            ui : 'fbBlue',
            text : 'Facebook'
         },
         {
            tag : 'createAccount',
            ui : 'action',
            text : 'Create Account'
         },
         {
            tag : 'signIn',
            text : 'Sign In'
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
   requires : ['Ext.field.Email', 'Ext.field.Password'],
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
            labelAlign : 'top'
         },
         items : [
         {
            xtype : 'emailfield',
            name : 'username',
            label : 'Email Address',
            clearIcon : true,
            placeHolder : 'johndoe@example.com'
         },
         {
            xtype : 'passwordfield',
            name : 'password',
            label : 'Password',
            clearIcon : true
         }]
      },
      {
         xtype : 'button',
         ui : 'action',
         tag : 'login',
         text : 'Sign In',
         defaultUnit : 'em',
         xtype : 'button',
         margin : '0.5 0 0 0'
      },
      {
         xtype : 'button',
         tag : 'reset',
         text : 'Password Reset',
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
   requires : ['Ext.field.Email'],
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
         title : 'Account Credentials:',
         //instructions : 'Enter Username (email address) and Password',
         defaults :
         {
            required : true,
            labelAlign : 'top'
         },
         items : [
         {
            xtype : 'textfield',
            name : 'name',
            label : 'Full Name',
            clearIcon : true,
            placeHolder : 'John Smith'
         },
         {
            xtype : 'emailfield',
            name : 'username',
            label : 'Email Address',
            clearIcon : true,
            placeHolder : 'johndoe@example.com'
         },
         {
            xtype : 'passwordfield',
            name : 'password',
            label : 'Password',
            clearIcon : true
         }]
      },
      {
         xtype : 'button',
         ui : 'createAccount',
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
      return Genesis.view.ViewBase.prototype.createView.apply(this, arguments);
   },
   showView : function()
   {
      return Genesis.view.ViewBase.prototype.showView.apply(this, arguments);
   }
});

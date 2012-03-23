Ext.define('Genesis.view.LoginPage',
{
   extend : 'Ext.Container',
   requires : ['Ext.ActionSheet'],
   alias : 'widget.loginpageview',
   config :
   {
      title : '',
      changeTitle : false,
      scrollable : false,
      style : 'background:transparent'
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
            text : 'Facebook'
         },
         {
            tag : 'createAccount',
            text : 'Create Account'
         },
         {
            tag : 'signIn',
            text : 'Sign In'
         }]
      });
      this.add(actions);
      this.callParent(arguments);
   },
   beforeActivate : function(activeItem, oldActiveItem)
   {
      var view = Ext.ComponentQuery.query('viewportview')[0];
      view.getNavigationBar().setHideNavBar(true);
   },
   beforeDeactivate : function()
   {
      var view = Ext.ComponentQuery.query('viewportview')[0];
      view.getNavigationBar().setHideNavBar(false);
   },
   afterActivate : function()
   {
   },
   afterDeactivate : function()
   {
   }
});

Ext.define('Genesis.view.SignInPage',
{
   extend : 'Ext.form.Panel',
   alias : 'widget.signinpageview',
   requires : ['Ext.field.Email', 'Ext.field.Password'],
   config :
   {
      title : 'Sign In',
      changeTitle : false,
      scrollable : 'vertical',
      style : 'background:transparent',
      items : [
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
            label : 'User Name',
            useClearIcon : true,
            placeHolder : 'Email Address'
         },
         {
            xtype : 'passwordfield',
            name : 'password',
            label : 'Password',
            useClearIcon : false
         }]
      },
      {
         xtype : 'button',
         ui : 'login',
         tag : 'login',
         text : 'Sign In'
      }]
   },
   beforeActivate : function(activeItem, oldActiveItem)
   {
      activeItem.reset();
   },
   beforeDeactivate : function(activeItem, oldActiveItem)
   {
   },
   afterActivate : function(activeItem, oldActiveItem)
   {
   },
   afterDeactivate : function(activeItem, oldActiveItem)
   {
   }
});

Ext.define('Genesis.view.CreateAccountPage',
{
   extend : 'Ext.form.Panel',
   alias : 'widget.createaccountpageview',
   requires : ['Ext.field.Text', 'Ext.field.Email', 'Ext.field.Password'],
   config :
   {
      title : 'Create Account',
      changeTitle : false,
      scrollable : 'vertical',
      style : 'background:transparent',
      items : [
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
            useClearIcon : true,
            placeHolder : 'John Smith'
         },
         {
            xtype : 'emailfield',
            name : 'username',
            label : 'User Name',
            useClearIcon : true,
            placeHolder : 'Email Address'
         },
         {
            xtype : 'passwordfield',
            name : 'password',
            label : 'Password',
            useClearIcon : false
         }]
      },
      {
         xtype : 'button',
         ui : 'createAccount',
         tag : 'createAccount',
         text : 'Create Account'
      }]
   },
   beforeActivate : function(activeItem, oldActiveItem)
   {
      activeItem.reset();
   },
   beforeDeactivate : function()
   {
   },
   afterActivate : function()
   {
   },
   afterDeactivate : function()
   {
   }
});

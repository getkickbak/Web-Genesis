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
   },
   showView : Ext.emptyFn
});

Ext.define('Genesis.view.SignInPage',
{
   extend : 'Ext.form.Panel',
   alias : 'widget.signinpageview',
   requires : ['Ext.field.Email', 'Ext.field.Password'],
   config :
   {
      changeTitle : false,
      scrollable : 'vertical',
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
            label : 'User Name',
            clearIcon : true,
            placeHolder : 'Email Address'
         },
         {
            xtype : 'passwordfield',
            name : 'password',
            label : 'Password',
            clearIcon : false
         }]
      },
      {
         xtype : 'button',
         ui : 'login',
         tag : 'login',
         text : 'Sign In'
      }]
   },
   createView : Ext.emptyFn,
   showView : function()
   {
      var titlebar = this.query('titlebar')[0];
      Ext.defer(titlebar.setMasked, 0.3 * 1000, titlebar, [false]);
   }
});

Ext.define('Genesis.view.CreateAccountPage',
{
   extend : 'Ext.form.Panel',
   alias : 'widget.createaccountpageview',
   requires : ['Ext.field.Text', 'Ext.field.Email', 'Ext.field.Password'],
   config :
   {
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
            label : 'User Name',
            clearIcon : true,
            placeHolder : 'Email Address'
         },
         {
            xtype : 'passwordfield',
            name : 'password',
            label : 'Password',
            clearIcon : false
         }]
      },
      {
         xtype : 'button',
         ui : 'createAccount',
         tag : 'createAccount',
         text : 'Create Account'
      }]
   },
   createView : Ext.emptyFn,
   showView : function()
   {
      var titlebar = this.query('titlebar')[0];
      Ext.defer(titlebar.setMasked, 0.3 * 1000, titlebar, [false]);
   }
});

Ext.define('Genesis.view.client.SettingsPage',
{
   extend : 'Ext.form.Panel',
   requires : ['Ext.dataview.List', 'Ext.XTemplate', 'Genesis.view.widgets.ListField'],
   alias : 'widget.clientsettingspageview',
   config :
   {
      scrollable : 'vertical',
      layout :
      {
         type : 'vbox',
         align : 'stretch',
         pack : 'start'
      },
      items : [Ext.apply(Genesis.view.ViewBase.generateTitleBarConfig(),
      {
         title : 'Settings',
         items : [
         {
            align : 'left',
            tag : 'back',
            //ui : 'back',
            ui : 'normal',
            text : 'Back'
         }]
      }),
      {
         xtype : 'fieldset',
         title : 'Login Profile',
         //instructions : 'Tell us all about yourself',
         items : [
         {
            xtype : 'listfield',
            iconCls : 'facebook',
            name : 'facebook',
            value : 'Facebook'
         }]
      },
      {
         xtype : 'fieldset',
         title : 'About Kickbak',
         //instructions : 'Tell us all about yourself',
         items : [
         {
            xtype : 'textfield',
            value : 'Version 1.0',
            readOnly : true
         },
         {
            xtype : 'listfield',
            name : 'terms',
            value : 'Terms & Conditions'
         },
         {
            xtype : 'listfield',
            name : 'privacy',
            value : 'Privacy'
         },
         {
            xtype : 'listfield',
            name : 'aboutus',
            value : 'About Us'
         }]
      }]
   },
   showView : Ext.emptyFn
});

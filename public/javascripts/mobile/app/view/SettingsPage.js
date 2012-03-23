Ext.define('Genesis.view.SettingsPage',
{
   extend : 'Ext.form.Panel',
   requires : ['Ext.dataview.List', 'Ext.XTemplate', 'Genesis.view.widgets.ListField'],
   alias : 'widget.settingspageview',
   config :
   {
      title : 'Settings',
      changeTitle : false,
      scrollable : 'vertical',
      layout :
      {
         type : 'vbox',
         align : 'stretch',
         pack : 'start'
      },
      items : [
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
   beforeActivate : function()
   {
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

Ext.define('Genesis.view.server.SettingsPage',
{
   extend : 'Ext.form.Panel',
   requires : ['Ext.dataview.List', 'Ext.XTemplate', 'Genesis.view.widgets.ListField'],
   alias : 'widget.serversettingspageview',
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
         title : 'About Kickbak',
         defaults :
         {
            labelWidth : '50%'
         },
         //instructions : 'Tell us all about yourself',
         items : [
         {
            xtype : 'textfield',
            clearIcon : false,
            label : 'Version ' + Genesis.constants.serverVersion,
            value : ' ',
            readOnly : true
         },
         {
            xtype : 'listfield',
            name : 'license',
            label : 'Refresh License',
            value : ' '
         }
         /*,
          {
          xtype : 'listfield',
          name : 'terms',
          label : 'Terms & Conditions',
          value : ' '
          },
          {
          xtype : 'listfield',
          name : 'privacy',
          label : 'Privacy'
          value : ' '
          },
          {
          xtype : 'listfield',
          name : 'aboutus',
          label : 'About Us',
          value : ' '
          }
          */]
      },
      {
         xtype : 'fieldset',
         title : 'Merchant Device',
         items : [
         {
            xtype : 'textfield',
            labelWidth : '90%',
            tag : 'merchantDevice',
            clearIcon : false,
            readOnly : true
         }]
      }]
   },
   initialize : function()
   {
      this.callParent(arguments);
      this.setPreRender([]);
   },
   cleanView : function()
   {
      return Genesis.view.ViewBase.prototype.cleanView.apply(this, arguments);
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
   createView : function()
   {
      return Genesis.view.ViewBase.prototype.createView.apply(this, arguments);
   },
   showView : function()
   {
      return Genesis.view.ViewBase.prototype.showView.apply(this, arguments);
   }
});

Ext.define('Genesis.view.server.TagCreatePage',
{
   extend : 'Genesis.view.ViewBase',
   requires : ['Ext.Toolbar', 'Ext.field.Text'],
   alias : 'widget.servertagcreatepageview',
   config :
   {
      layout : 'fit',
      cls : 'viewport',
      items : [Ext.apply(Genesis.view.ViewBase.generateTitleBarConfig(),
      {
         tag : 'navigationBarTop',
         cls : 'navigationBarTop kbTitle',
         title : ' ',
         items : [
         {
            align : 'left',
            tag : 'back',
            //ui : 'back',
            ui : 'normal',
            text : 'Back'
         }]
      }),
      // -------------------------------------------------------------------
      // Reward TAG ID Entry
      // -------------------------------------------------------------------
      {
         xtype : 'calculator',
         tag : 'createTagId',
         title : 'Enter TAG ID',
         placeHolder : '123456789',
         bottomButtons : [
         {
            tag : 'createTagId',
            text : 'Create!',
            ui : 'orange-large'
         }]
      }]
   },
   createView : function()
   {
      var me = this;
      if (!me.callParent(arguments))
      {
         return;
      }

      //me.getPreRender().push();
   },
   inheritableStatics :
   {
   }
});

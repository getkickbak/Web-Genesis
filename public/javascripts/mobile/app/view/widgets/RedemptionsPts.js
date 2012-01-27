Ext.define('Genesis.view.widgets.RedemptionsPts',
{
   extend : 'Ext.dataview.DataView',
   alias : 'widget.redemptionsspts',
   xtype : 'redemptionspts',
   requires : ['Genesis.view.widgets.RedemptionsPtsItem'],
   config :
   {
      useComponents: true,
      defaultType : 'redemptionsptsitem',
      scrollable : false
   }
});

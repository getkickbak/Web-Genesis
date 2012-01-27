Ext.define('Genesis.view.widgets.MerchantAccountPts',
{
   extend : 'Ext.dataview.DataView',
   alias : 'widget.merchantaccountpts',
   xtype : 'merchanaccountpts',
   requires : ['Ext.Button', 'Genesis.view.widgets.MerchantAccountPtsItem'],
   config :
   {
      useComponents: true,
      defaultType : 'merchantaccountptsitem',
      scrollable : false
   }
});

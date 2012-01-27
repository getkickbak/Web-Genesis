Ext.define('Genesis.view.widgets.RewardsCart',
{
   extend : 'Ext.dataview.DataView',
   alias : 'widget.rewardscart',
   xtype : 'rewardscart',
   requires : ['Ext.Button', 'Ext.field.Select', 'Genesis.view.widgets.RewardsCartItem'],
   config :
   {
      useComponents: true,
      defaultType : 'rewardscartitem',
      scrollable : 'vertical'
   }
});

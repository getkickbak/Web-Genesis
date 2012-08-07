Ext.define('Genesis.view.client.BadgeDetail',
{
   extend : 'Genesis.view.ShowRedeemItemDetail',
   alias : 'widget.clientbadgedetailview',
   config :
   {
      scrollable : undefined,
      cls : 'redeemItemMain viewport',
      layout : 'fit',
      items : [
      {
         xtype : 'titlebar',
         docked : 'top',
         cls : 'navigationBarTop',
         title : 'Badge Promotion',
         defaults :
         {
            iconMask : true
         },
         items : [
         {
            align : 'right',
            tag : 'done',
            text : 'Done'
         }]
      }]
   }
});

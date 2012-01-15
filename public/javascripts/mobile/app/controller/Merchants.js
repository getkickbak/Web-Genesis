Ext.define('Genesis.controller.Merchants', {
   extend : 'Genesis.controller.ControllerBase',
   requires : [
   'Genesis.view.MerchantAccountBrowse', 'Genesis.view.MerchanAcountPage', 'Genesis.view.MerchantAccount',
   // Base Class
   'Genesis.controller.ControllerBase'],
   statics : {
      merchantMain_path : '/merchantMain',
      merchant_path : '/merchant'
   },
   xtype : 'merchantsCntlr',
   refs : [],
   config : {
   },
   views : ['MerchantAccountBrowse', 'MerchanAcountPage', 'MerchantAccount'],
   init : function()
   {
      this.callParent(arguments);
      this.control({
         '#button[iconCls=checkin]' : {
            tap : this.onCheckinTap
         }
      });
   }
});

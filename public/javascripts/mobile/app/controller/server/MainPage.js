Ext.define('Genesis.controller.server.MainPage',
{
   extend : 'Genesis.controller.MainPageBase',
   xtype : 'mainPageCntlr',
   config :
   {
      models : ['frontend.MainPage', 'CustomerReward']
   },
   initCallback : function()
   {
      var me = this;

      me.goToMain();
      var venueId = Genesis.fn.getPrivKey('venueId');
      if (venueId == 0)
      {
         Ext.device.Notification.show(
         {
            title : 'Missing License Key!',
            message : me.missingLicenseKeyMsg,
            buttons : ['Cancel', 'Proceed'],
            callback : function(btn)
            {
               if (btn.toLowerCase() == 'proceed')
               {
                  me.getApplication().getController('Settings').fireEvent('upgradeDevice');
               }
            }
         });
      }
   },
   init : function(app)
   {
      var me = this;
      me.callParent(arguments);

      console.log("Server MainPage Init");
   },
   // --------------------------------------------------------------------------
   // Event Handlers
   // --------------------------------------------------------------------------
   onNfc : function(nfcResult)
   {
      var me = this;
      me.getApplication().getController('server.Merchants').onNfc(nfcResult);
   },
   // --------------------------------------------------------------------------
   // MainPage
   // --------------------------------------------------------------------------
   onActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this;
      me.getInfoBtn()['hide']();
      me.getViewPortCntlr().setActiveController(me);
      Ext.Viewport.setMasked(null);
   },
   onDeactivate : function(oldActiveItem, c, newActiveItem, eOpts)
   {
      var me = this;
      me.getViewPortCntlr().setActiveController(null);
   }
   // --------------------------------------------------------------------------
   // Page Navigation
   // --------------------------------------------------------------------------
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
});
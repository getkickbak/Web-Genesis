Ext.define('Genesis.controller.client.JackpotWinners',
{
   extend : 'Genesis.controller.ControllerBase',
   requires : ['Ext.data.Store'],
   statics :
   {
   },
   xtype : 'clientJackpotWinnersCntlr',
   config :
   {
      routes :
      {
         'jackpotWinners/:id' : 'mainPage',
      },
      models : ['frontend.JackpotWinner'],
      refs :
      {
         // Main Page
         main :
         {
            selector : 'clientjackpotwinnersview',
            autoCreate : true,
            xtype : 'clientjackpotwinnersview'
         }
      },
      control :
      {
         main :
         {
            activate : 'onActivate',
            deactivate : 'onDeactivate'
         }
      },
      listeners :
      {
         'reload' : 'onReload'
      }
   },
   init : function(app)
   {
      var me = this;
      me.callParent(arguments);

      //
      // Loads Front Page Metadata
      //
      Ext.regStore('JackpotWinnerStore',
      {
         model : 'Genesis.model.frontend.JackpotWinner',
         autoLoad : false,
         pageSize : 5,
         sorters : [
         {
            property : 'date',
            direction : 'DESC'
         }],
         listeners :
         {
            scope : me,
            "load" : function(store, records, successful, operation, eOpts)
            {
            }
         }
      });

      console.log("JackpotWinners Init");
      //
      // Preloading Pages to memory
      //
      me.getMain();
   },
   // --------------------------------------------------------------------------
   // EVent Handlers
   // --------------------------------------------------------------------------
   onReload : function()
   {
      var me = this;
      JackpotWinner['setGetJackpotWinnersUrl']();
      Ext.StoreMgr.get('JackpotWinnerStore').load(
      {
         jsonData :
         {
         },
         params :
         {
            'merchant_id' : me.merchantId
         },
         callback : function(records, operation)
         {
         }
      })
   },
   // --------------------------------------------------------------------------
   // MainPage
   // --------------------------------------------------------------------------
   onActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      //activeItem.createView();
   },
   onDeactivate : function(oldActiveItem, c, newActiveItem, eOpts)
   {
   },
   // --------------------------------------------------------------------------
   // Page Navigation
   // --------------------------------------------------------------------------
   mainPage : function(merchantId)
   {
      this.openPage('main', merchantId);
   },
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
   openPage : function(subFeature, merchantId)
   {
      var me = this;

      switch (subFeature)
      {
         case 'main' :
         {
            me.merchantId = merchantId;
            me.setAnimationMode(me.self.superclass.self.animationMode['coverUp']);
            me.pushView(me.getMainPage());
            me.onReload();
            break;
         }
      }
   },
   getMainPage : function()
   {
      var page = this.getMain();
      return page;
   },
   openMainPage : function()
   {
      var me = this;
      me.setAnimationMode(me.self.superclass.self.animationMode['coverUp']);
      me.pushView(me.getMainPage());
      console.log("Jackpot Winners Page Opened");
   },
   isOpenAllowed : function()
   {
      return true;
   }
});

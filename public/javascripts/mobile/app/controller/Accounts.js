Ext.define('Genesis.controller.Accounts',
{
   extend : 'Genesis.controller.ControllerBase',
   requires : ['Ext.data.Store'],
   statics :
   {
      accounts_path : '/accounts'
   },
   xtype : 'accountsCntlr',
   config :
   {
      refs :
      {
         accounts :
         {
            selector : 'accountsview',
            autoCreate : true,
            xtype : 'accountsview'
         },
         accountsList : 'accountsview list[tag=accountsList]'
      },
      control :
      {
         accounts :
         {
            activate : 'onActivate',
            deactivate : 'onDeactivate'
         },
         accountsList :
         {
            select : 'onSelect',
            disclose : 'onDisclose'
         }
      }
   },
   models : ['Venue', 'Merchant'],
   init : function()
   {
      this.callParent(arguments);
      //
      // Venues for all the Associated with the Merchant Account
      //
      Ext.regStore('VenueAccountStore',
      {
         model : 'Genesis.model.Venue',
         autoLoad : false
      });
      //Ext.StoreMgr.get('AccountsStore').sort('sort_id', 'DESC');
      console.log("Accounts Init");
   },
   // --------------------------------------------------------------------------
   // Accounts Page
   // --------------------------------------------------------------------------
   onActivate : function()
   {
      //
      // Scroll to the Top of the Screen
      //
      this.getAccountsList().getScrollable().getScroller().scrollTo(0, 0);
   },
   onDeactivate : function()
   {
   },
   onSelect : function(list, model, eOpts)
   {
      list.deselect([model]);
      this.onDisclose(list, model);
      return false;
   },
   onDisclose : function(list, record, target, index, e, eOpts)
   {
      var me = this;
      //
      // Load Venue Info
      //
      Ext.StoreMgr.get('VenueAccountStore').load(
      {
         scope : this,
         params :
         {
            'user_id' : record.getId(),
            'merchant_id' : record.getMerchant()['merchant_id']
         },
         callback : function(records, operation, success)
         {
            if(success)
            {
               var controller = this.getApplication().getController('Checkins');
               controller.mode = 'explore';
               controller.onExploreDisclose(list, records[0], target, index, e, eOpts);
               return true;
            }
            else
            {
               Ext.device.Notification.show(
               {
                  title : 'Error',
                  message : 'Error Loading Merchant Venues',
                  callback : function(button)
                  {
                  }
               });
            }
         },
      });
   },
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
   getMainPage : function()
   {
      return this.getAccounts();
   },
   openMainPage : function()
   {
      this.pushView(this.getMainPage());
      console.log("Accounts Page Opened");
   },
   isOpenAllowed : function()
   {
      // If not logged in, forward to login page
      return true;
   }
});

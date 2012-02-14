Ext.define('Genesis.controller.Accounts',
{
   extend : 'Genesis.controller.ControllerBase',
   requires : ['Ext.data.Store'],
   statics :
   {
      checkin_path : '/checkin'
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
         }
      },
      control :
      {
         'accountsview' :
         {
            activate : 'onActivate',
            deactivate : 'onDeactivate'
         },
         'accountsview list' :
         {
            select : 'onSelect',
            disclose : 'onDisclose'
         },
         'accountsview tabbar segmentedbutton[tag=accounts]' :
         {
            toggle : 'onViewToggle'
         }
      }
   },
   models : ['Venue', 'Merchant'],
   init : function()
   {
      this.callParent(arguments);
      Ext.StoreMgr.get('AccountsStore').sort('sort_id', 'DESC');
      console.log("Accounts Init");
   },
   // --------------------------------------------------------------------------
   // Accounts Page
   // --------------------------------------------------------------------------
   onActivate : function()
   {
      if(!this.loaded)
      {
         this.loadAccounts();
      }
      var sortbtns = this.getViewport().query('segmentedbutton[tag=accounts]')[0];
      sortbtns.show();
   },
   onDeactivate : function()
   {
      var sortbtns = this.getViewport().query('segmentedbutton[tag=accounts]')[0];
      sortbtns.hide();
   },
   onSelect : function(list, model, eOpts)
   {
      list.deselect([model]);
      this.onDisclose(list, model);
      return false;
   },
   onDisclose : function(list, record, target, index, e, eOpts)
   {
      var controller = this.getApplication().getController('Checkins');
      controller.mode = 'explore';
      controller.onExploreDisclose(list, record, target, index, e, eOpts);
      return true;
   },
   onViewToggle : function(container, button, pressed)
   {
      if(pressed)
      {
         var view = this.getAccounts().query('container[tag=accountsSelection]')[0];
         var store = Ext.StoreMgr.get('AccountsStore');
         switch(button.config.tag)
         {
            case 'usage' :
            {
               store.sort('sort_id', 'ASC');
               view.setActiveItem(0);
               break;
            }
            case 'alphabetical' :
            {
               store.sort('name', 'ASC');
               view.setActiveItem(1);
               break;
            }
         }
      }
      return true;
   },
   loadAccounts : function()
   {
      //
      // Normally, Retrieved UserId from login
      //
      //var userId = Ext.StoreMgr.get('UserStore).getAt(0).getId();
      var userId = 1;
      Ext.StoreMgr.get('AccountsStore').load(
      {
         parms :
         {
            user_id : userId,
         },
         scope : this,
         callback : function(records, operation, success)
         {
            if(success)
            {
               for(var i = 0; i < records.length; i++)
               {
                  records[i].data['sort_id'] = i;
               }
               this.loaded = true;
            }
            else
            {
            }
         }
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

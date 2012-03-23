Ext.define('Genesis.controller.Prizes',
{
   extend : 'Genesis.controller.ControllerBase',
   requires : ['Ext.data.Store', 'Ext.util.Sorter'],
   statics :
   {
      prizes_path : '/prizes'
   },
   xtype : 'prizesCntlr',
   config :
   {
      timeoutPeriod : 10,
      mode : 'prizes',
      models : ['Venue', 'Merchant', 'EarnPrize'],
      refs :
      {
         closeBackButton : 'viewportview button[text=Close]',
         backButton : 'viewportview button[ui=back]',
         doneBtn : 'viewportview button[tag=done]',
         redeemBtn : 'viewportview button[tag=redeem]',
         prizes :
         {
            selector : 'prizesview',
            autoCreate : true,
            xtype : 'prizesview'
         },
         prizesCarousel : 'prizesview carousel'
      },
      control :
      {
         doneBtn :
         {
            tap : 'onDoneTap'
         },
         redeemBtn :
         {
            tap : 'onRedeemPrizeTap'
         },
         prizes :
         {
            activate : 'onActivate',
            deactivate : 'onDeactivate'
         },
         prizesCarousel :
         {
            activeitemchange : 'onPrizeCarouselItemChange'
         }
      }
   },
   init : function()
   {
      this.callParent(arguments);
      console.log("Prizes Init");
   },
   // --------------------------------------------------------------------------
   // Prizes Page
   // --------------------------------------------------------------------------
   onActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this;
      var view = me.getPrizes();
      var viewport = me.getViewPortCntlr();
      var items, container;

      view.removeAll();
      switch (me.getMode())
      {
         case 'prizes' :
         {
            var store = Ext.StoreMgr.get('MerchantPrizeStore')
            items = store.getRange();
            view.add(
            {
               xtype : 'carousel',
               scrollable : false
            });
            container = view.getItems().items[0];
            break;
         }
         case 'reward' :
         {
            items = [me.earnPrize];
            delete me.earnPrize;
            container = view;
            break;
         }
      }
      me.getRedeemBtn().show();
      for(var i = 0; i < items.length; i++)
      {
         if(oldActiveItem)
         {
            var xtypes = oldActiveItem.getXTypes();
            if(xtypes.match('merchantaccountview') || xtypes.match('rewardsview'))
            {
               if(items[i].getMerchant().getId() != viewport.getVenue().getMerchant().getId())
               {
                  continue;
               }
            }
         }
         container.add(
         {
            tag : 'rewardPanel',
            xtype : 'dataview',
            store :
            {
               model : 'Genesis.model.EarnPrize',
               autoLoad : false,
               data : items[i].raw
            },
            useComponents : true,
            scrollable : false,
            defaultType : 'rewarditem',
            defaultUnit : 'em',
            margin : '0 0 0.8 0'
         });
      }
      if(items.length == 0)
      {
         container.add(
         {
            tag : 'rewardPanel',
            xtype : 'dataview',
            emptyText : ' ',
            scrollable : false,
            defaultUnit : 'em',
            margin : '0 0 0.8 0'
         });
      }
   },
   onDeactivate : function(oldActiveItem, c, activeItem, eOpts)
   {
      var me = this;
      me.getDoneBtn().hide();
      me.getRedeemBtn().hide();
   },
   onDoneTap : function(b, e, eOpts)
   {
      var prizes = this.getPrizes();
      if(prizes.isPainted() && !prizes.isHidden())
      {
         var me = this;
         clearTimeout(me.cancelId);
         delete me.cancelId;

         me.getDoneBtn().hide();
         me.getRedeemBtn().hide();
         Ext.device.Notification.vibrate();
         me.popView();
      }
   },
   onPrizeCarouselItemChange : function(c, value, oldValue, eOpts)
   {
      var data = value.getStore().getData().get(0);
      var cvenue = this.getViewPortCntlr().getCheckinInfo().venue;
      var cmerchantId = (cvenue) ? cvenue.getMerchant().getId() : 0;
      var merchantId = (data) ? data.getMerchant().getId() : 0;

      this.getRedeemBtn()[((merchantId == cmerchantId) && (merchantId > 0)) ? 'enable' : 'disable']();
   },
   onRedeemPrizeTap : function(b, e, eOpts)
   {
      var me = this;
      var btn = me.getCloseBackButton() || me.getBackButton();
      btn.hide();
      //
      // To-do : Talk to server to claim this prize, on success, start the timer!
      // Update Prizes DB on Prizes
      //
      switch (me.getMode())
      {
         case 'prizes' :
            break;
         case 'reward' :
            break;
      }
      me.notificationPopup(me.getTimeoutPeriod());
      me.getRedeemBtn().hide();
      me.getDoneBtn().show();
   },
   notificationPopup : function(timeout)
   {
      var me = this;
      var title;
      switch (me.getMode())
      {
         case 'prizes' :
            title = 'Prize Redemption Alert!';
            break;
         case 'reward' :
            title = 'Reward Redemption Alert!';
            break;
      }
      if(timeout > 0)
      {
         Ext.device.Notification.show(
         {
            title : title,
            message : 'You have ' + timeout + ' minute(s) to show this screen to a employee before it disappears!'
         });
         me.cancelId = Ext.defer(function(timeout)
         {
            me.notificationPopup(timeout);
         }, 1 * 60 * 1000, me, [--timeout]);
      }
      else
      {
         Ext.device.Notification.show(
         {
            title : 'Prize Redemption Alert!',
            message : me.getTimeoutPeriod() + ' minutes are up! Press OK to confirm.',
            buttons : ['OK'],
            callback : function()
            {
               me.onDoneTap();
            }
         });
      }
   },
   onRedeemRewards : function(earnPrize)
   {
      this.earnPrize = earnPrize;
      this.setMode('reward');
      this.pushView(this.getMainPage());
   },
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
   getMainPage : function()
   {
      return this.getPrizes();
   },
   openMainPage : function()
   {
      this.setMode('prizes');
      this.pushView(this.getMainPage());
      console.log("Prizes Page Opened");
   },
   isOpenAllowed : function()
   {
      // If not logged in, forward to login page
      return true;
   }
});

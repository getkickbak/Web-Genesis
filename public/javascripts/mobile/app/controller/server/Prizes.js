Ext.define('Genesis.controller.server.Prizes',
{
   extend : 'Genesis.controller.ControllerBase',
   requires : ['Ext.data.Store', 'Ext.util.Sorter'],
   statics :
   {
      prizes_path : '/prizes'
   },
   xtype : 'serverprizesCntlr',
   config :
   {
      timeoutPeriod : 10,
      mode : 'authReward',
      routes :
      {
         'authReward' : 'authRewardPage'
      },
      listeners :
      {
         'authreward' : 'onAuthReward',
         'refreshQRCode' : 'onRefreshQRCode'
      },
      refs :
      {
         // ShowPrizes
         sCloseBB : 'showredeemitemdetailview[tag=redeemItem] button[tag=close]',
         //sBB : 'showredeemitemdetailview[tag=redeemItem] button[tag=back]',
         sDoneBtn : 'showredeemitemdetailview[tag=redeemItem] button[tag=done]',
         sRedeemBtn : 'showredeemitemdetailview[tag=redeemItem] button[tag=redeem]',
         refreshBtn : 'showredeemitemdetailview[tag=redeemItem] button[tag=refresh]',
         verifyBtn : 'showredeemitemdetailview[tag=redeemItem] button[tag=verify]',

         redeemItem :
         {
            selector : 'showredeemitemdetailview[tag=redeemItem]',
            autoCreate : true,
            tag : 'redeemItem',
            xtype : 'showredeemitemdetailview'
         }
      },
      control :
      {
         sDoneBtn :
         {
            tap : 'onDoneTap'
         },
         sRedeemBtn :
         {
            tap : 'onRedeemPrizeTap'
         },
         redeemItem :
         {
            createView : 'onCreateView',
            activate : 'onActivate',
            deactivate : 'onDeactivate'
         }
      }
   },
   authRewardVerifiedMsg : 'Verified',
   retrievingQRCodeMsg : 'Retrieving QRCode ...',
   init : function()
   {
      var me = this;
      this.callParent(arguments);

      console.log("Prizes Init");
      //
      // Preloading Pages to memory
      //
      Ext.defer(function()
      {
         me.getRedeemItem();
      }, 1, me);
   },
   // --------------------------------------------------------------------------
   // Utility Functions
   // --------------------------------------------------------------------------
   // --------------------------------------------------------------------------
   // Event Handler
   // --------------------------------------------------------------------------
   onRefreshQRCode : function(qrcodeMeta)
   {
      var me = this;

      var view = me.getMainPage();
      var item = view.getInnerItems()[0];

      var info = item.query('component[tag=info]')[0];
      info.hide();

      var photo = item.query('component[tag=itemPhoto]')[0];
      var img = Ext.get(Ext.DomQuery.select('img',photo.element.dom)[0]);
      img.set(
      {
         'src' : qrcodeMeta[0]
      });
      img.setStyle(
      {
         'width' : Genesis.fn.addUnit(qrcodeMeta[1] * 1.25),
         'height' : Genesis.fn.addUnit(qrcodeMeta[2] * 1.25)
      });
   },
   // --------------------------------------------------------------------------
   // Prizes Page
   // --------------------------------------------------------------------------
   onCreateView : function(activeItem)
   {
      var me = this;
      var view = me.getMainPage();

      view.redeemItem = me.redeemItem;
   },
   onActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this;
      var viewport = me.getViewPortCntlr();

      var tbbar = activeItem.query('titlebar')[0];
      var photo = me.redeemItem.get('photo');
      me.getSCloseBB().show();
      //me.getSBB().hide();
      switch (me.getMode())
      {
         case 'authReward' :
         {
            tbbar.addCls('kbTitle');
            tbbar.setTitle(' ');
            me.getRefreshBtn()[photo ?  'show' :'hide']();
            me.getVerifyBtn()[photo ?  'hide' :'show']();
            me.getSRedeemBtn().hide();
            break;
         }
      }
      console.log("ShowPrize View - Updated ShowPrize View.");

      //delete me.redeemItem;
   },
   onDeactivate : function(oldActiveItem, c, newActiveItem, eOpts)
   {
   },
   onAuthReward : function(redeemItem)
   {
      this.redeemItem = redeemItem;
      this.redirectTo('authReward');
   },
   // --------------------------------------------------------------------------
   // Page Navigation
   // --------------------------------------------------------------------------
   authRewardPage : function()
   {
      this.openPage('authReward');
   },
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
   openPage : function(subFeature)
   {
      this.setMode(subFeature);
      this.pushView(this.getMainPage());
      console.log("Prizes Page Opened");
   },
   getMainCarousel : function()
   {
      var carousel = null;
      switch (this.getMode())
      {
         case 'authReward' :
         {
            break;
         }
      }
      return carousel;
   },
   getMainPage : function()
   {
      var me = this;
      var page;
      switch (me.getMode())
      {
         case 'authReward' :
         {
            me.setAnimationMode(me.self.superclass.self.animationMode['coverUp']);
            page = me.getRedeemItem();
            break;
         }
      }

      return page;
   },
   openMainPage : function()
   {
      this.setMode('authReward');
      this.pushView(this.getMainPage());
      console.log("Prizes Page Opened");
   },
   isOpenAllowed : function()
   {
      // If not logged in, forward to login page
      return true;
   }
});

Ext.define('Genesis.controller.server.Prizes',
{
   extend : 'Genesis.controller.PrizeRedemptionsBase',
   requires : ['Ext.data.Store', 'Genesis.view.server.Prizes'],
   inheritableStatics :
   {
   },
   xtype : 'serverPrizesCntlr',
   controllerType : 'redemption',
   config :
   {
      closeBtn : null,
      redeemPointsFn : 'setMerchantRedeemPointsURL',
      routes :
      {
         'authReward' : 'authRewardPage'
      },
      refs :
      {
         backBtn : 'serverprizesview button[tag=back]',
         //
         // Redemptions
         //
         redemptions :
         {
            selector : 'serverprizesview',
            autoCreate : true,
            xtype : 'serverprizesview'
         },
         redemptionsList : 'serverprizesview list[tag=prizesList]'
      },
      control :
      {
         mRedeemBtn :
         {
            tap : 'onRedeemItemTap'
         },
         sRedeemBtn :
         {
            tap : 'onRedeemItemTap'
         }
      },
      listeners :
      {
         //
         // Redeem Prize
         //
         'authreward' : 'onAuthReward',
         'refreshQRCode' : 'onRefreshQRCode',
         'redeemitem' : 'onServerRedeemItem'
      }
   },
   scanPlayTitle : 'Swipe and Play',
   init : function()
   {
      var me = this;
      me.callParent(arguments);

      console.log("Prizes Server Init");
   },
   // --------------------------------------------------------------------------
   // Utility Functions
   // --------------------------------------------------------------------------
   // --------------------------------------------------------------------------
   // Event Handler
   // --------------------------------------------------------------------------
   onNfc : function(nfcResult)
   {
      var me = this;

      me.redeemItemFn(
      {
         data : me.self.encryptFromParams(
         {
            'tag_id' : (nfcResult) ? nfcResult['tagID'] : null,
            'expiry_ts' : new Date().addHours(3).getTime()
         }, 'reward')
      });
   },
   onRefreshQRCode : function(qrcodeMeta)
   {
      var me = this;

      var view = me.getRedeemItem();
      var item = view.getInnerItems()[0];

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
   onAuthReward : function(redeemItem)
   {
      this.redeemItem = redeemItem;
      this.redirectTo('authReward');
   },
   // --------------------------------------------------------------------------
   // Prizes Page
   // --------------------------------------------------------------------------
   onRedeemItemShowView : function(activeItem)
   {
      //
      // Hide the Merchant Info
      //
      var me = this;
      var info = activeItem.query('component[tag=info]')[0];
      info.hide();
      //
      // In Redeem Mode
      //
      me.getMRedeemBtn()[(me.getRedeemMode() != 'authReward') ? 'show' : 'hide']();
      //
      // In Challendge
      //
      me.getRefreshBtn()[(me.getRedeemMode() == 'authReward') ? 'show' : 'hide']();
   },
   // --------------------------------------------------------------------------
   // Page Navigation
   // --------------------------------------------------------------------------
   authRewardPage : function()
   {
      this.setTitle('Challenges');
      this.openPage('authReward');
   }
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
});

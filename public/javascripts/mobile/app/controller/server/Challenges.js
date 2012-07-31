Ext.define('Genesis.controller.server.Challenges',
{
   extend : 'Genesis.controller.ControllerBase',
   requires : ['Ext.data.Store'],
   statics :
   {
      serverRedemption_path : '/serverChallenges'
   },
   xtype : 'serverChallengesCntlr',
   models : ['PurchaseReward', 'CustomerReward'],
   config :
   {
      refs :
      {
         //
         // Challenges
         //
         challenges :
         {
            selector : 'serverchallengesview',
            autoCreate : true,
            xtype : 'serverchallengesview'
         },
         refreshBtn : 'showprizeview[tag=redeemItem] button[tag=refresh]',
      },
      control :
      {
         challenges :
         {
            activate : 'onActivate',
            deactivate : 'onDeactivate'
         },
         refreshBtn :
         {
            tap : 'onRefreshTap'
         }
      }
   },
   invalidAuthCodeMsg : 'Authorization Code is Invalid',
   genAuthCodeMsg : 'Proceed to generate Authorization Code',
   generatingAuthCodeMsg : 'Generating Authorization Code ...',
   refreshAuthCodeMsg : 'Refresing Authorization Code ...',
   init : function()
   {
      this.callParent(arguments);
      console.log("Server Challenges Init");
   },
   generateQRCode : function()
   {
      return Genesis.controller.ControllerBase.genQRCodeFromParams(
      {
         "type" : 'earn_points'
      }, 'challenge', false);
   },
   // --------------------------------------------------------------------------
   // Server Challenges Page
   // --------------------------------------------------------------------------
   onActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      //Ext.defer(activeItem.createView, 1, activeItem);
      //activeItem.createView();
   },
   onDeactivate : function(oldActiveItem, c, newActiveItem, eOpts)
   {
      var me = this;
      oldActiveItem.removeAll(true);
   },
   onRefreshTap : function(b, e, eOpts)
   {
      var me = this;
      Ext.Viewport.setMasked(
      {
         xtype : 'loadmask',
         message : me.refreshAuthCodeMsg
      });
      var app = me.getApplication();
      var controller = app.getController('server.Prizes');
      Ext.defer(function()
      {
         var qrcode = me.generateQRCode();
         if (qrcode[0])
         {
            controller.fireEvent('refreshQRCode', qrcode);
         }
         Ext.Viewport.setMasked(false);
      }, 1, me);
   },
   onGenerateQRCode : function()
   {
      var me = this;

      Ext.Viewport.setMasked(
      {
         xtype : 'loadmask',
         message : me.generatingAuthCodeMsg
      });
      Ext.defer(function()
      {
         var qrcode = me.generateQRCode();
         if (qrcode[0])
         {
            var controller = me.getApplication().getController('server.Prizes');
            var reward = Ext.create('Genesis.model.CustomerReward',
            {
               id : 0,
               title : 'Authorization Code',
               type :
               {
                  value : 'earn_points'
               },
               photo :
               {
                  'thumbnail_ios_medium' :
                  {
                     url : qrcode[0],
                     height : qrcode[1],
                     width : qrcode[2],
                  }
               }
            });
            controller.fireEvent('authreward', reward);
            /*
             Ext.create('Genesis.model.EarnPrize',
             {
             //'id' : 1,
             'expiry_date' : null,
             'reward' : reward,
             'merchant' : null
             }));
             */
         }
         Ext.Viewport.setMasked(false);
      }, 1, me);
   },
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
   openMainPage : function()
   {
      var me = this;
      Ext.device.Notification.show(
      {
         title : 'Authorize Challenges',
         message : me.genAuthCodeMsg,
         buttons : ['OK', 'Cancel'],
         callback : function(btn)
         {
            if (btn.toLowerCase() == 'ok')
            {
               console.log(me.genAuthCodeMsg);
               me.onGenerateQRCode();
            }
         }
      });
   },
   isOpenAllowed : function()
   {
      return true;
   }
});

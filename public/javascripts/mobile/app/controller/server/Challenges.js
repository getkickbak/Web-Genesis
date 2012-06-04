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
         refreshBtn : 'showprizeview[tag=showPrize] button[tag=refresh]',
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
      });
   },
   // --------------------------------------------------------------------------
   // Server Challenges Page
   // --------------------------------------------------------------------------
   onActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
   },
   onDeactivate : function(oldActiveItem, c, newActiveItem, eOpts)
   {
      var me = this;
   },
   onRefreshTap : function(b, e, eOpts)
   {
      var me = this;
      Ext.Viewport.setMasked(
      {
         xtype : 'loadmask',
         message : me.refreshAuthCodeMsg
      });
      var qrcode = me.generateQRCode();
      var app = me.getApplication();
      var controller = app.getController('Prizes');
      if(qrcode[0])
      {
         Ext.defer(function()
         {
            app.dispatch(
            {
               action : 'onRefreshQRCode',
               args : [qrcode],
               controller : controller,
               scope : controller
            });
            Ext.Viewport.setMasked(false);
         }, 1 * 1000, me);
      }
      else
      {
         Ext.Viewport.setMasked(false);
      }
   },
   onGenerateQRCode : function()
   {
      var me = this;
      var qrcode = me.generateQRCode();

      if(qrcode[0])
      {
         var app = me.getApplication();
         var controller = app.getController('Prizes');
         app.dispatch(
         {
            action : 'onAuthReward',
            args : [Ext.create('Genesis.model.EarnPrize',
            {
               'id' : 1,
               'expiry_date' : null,
               'reward' : Ext.create('Genesis.model.CustomerReward',
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
               }),
               'merchant' : null
            })],
            controller : controller,
            scope : controller
         });
      }
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
            if(btn.toLowerCase() == 'ok')
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

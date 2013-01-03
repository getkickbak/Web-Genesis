Ext.define('Genesis.controller.client.Badges',
{
   extend : 'Genesis.controller.ControllerBase',
   requires : ['Ext.data.Store'],
   inheritableStatics :
   {
   },
   xtype : 'clientbadgesCntlr',
   config :
   {
      routes :
      {
         'badges' : 'mainPage',
         'badgeDesc' : 'badgeDescPage'
      },
      models : ['Badge', 'Customer', 'Merchant'],
      refs :
      {
         // Main Page
         main :
         {
            selector : 'clientbadgesview',
            autoCreate : true,
            xtype : 'clientbadgesview'
         },
         mainCarousel : 'clientbadgesview',
         //
         // BadgeDesc
         //
         badgeDesc :
         {
            selector : 'promotionalitemview[tag=badgeDesc]',
            autoCreate : true,
            tag : 'badgeDesc',
            xtype : 'promotionalitemview'
         }
      },
      control :
      {
         main :
         {
            showView : 'onShowView',
            activate : 'onActivate',
            deactivate : 'onDeactivate',
            itemTap : 'onItemTap'
         },
         badgeDesc :
         {
            createView : 'onBadgeDescCreateView',
            activate : 'onBadgeDescActivate',
            deactivate : 'onBadgeDescDeactivate',
            promoteItemTap : 'onPromoteItemTap'
         }
      }
   },
   badgeLevelNotAchievedMsg : 'You have achieved this badge level yet!',
   init : function(app)
   {
      var me = this;
      me.callParent(arguments);

      //
      // Loads Front Page Metadata
      //
      Ext.regStore('BadgeStore',
      {
         model : 'Genesis.model.Badge',
         autoLoad : false,
         sorters : [
         {
            property : 'rank',
            direction : 'ASC'
         }],
         listeners :
         {
            scope : me,
            "load" : function(store, records, successful, operation, eOpts)
            {
            }
         }
      });

      console.log("Badges Init");
      //
      // Preloading Pages to memory
      //
      me.getMain();
   },
   // --------------------------------------------------------------------------
   // EVent Handlers
   // --------------------------------------------------------------------------
   onPromoteItemTap : function(b, e, eOpts, eInfo)
   {
   },
   // --------------------------------------------------------------------------
   // MainPage
   // --------------------------------------------------------------------------
   onShowView : function(activeItem)
   {
      if (Ext.os.is('Android'))
      {
         //var carousel = activeItem.query('carousel')[0];
         //var items = carousel.getInnerItems();

         console.debug("Refreshing BadgesPage ...");
         /*
          for (var i = 0; i < items.length; i++)
          {
          items[i].refresh();
          }
          */
      }
   },
   onActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      //activeItem.createView();
   },
   onDeactivate : function(oldActiveItem, c, newActiveItem, eOpts)
   {
      //this.getInfoBtn().hide();
   },
   onBadgeDescCreateView : function(activeItem)
   {
      var me = this;
      activeItem.redeemItem = me.redeemItem;
   },
   onBadgeDescActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this;
      var tbbar = activeItem.query('titlebar')[0];

      activeItem.query('button[tag=back]')[0].show();
      activeItem.query('button[tag=done]')[0].hide();
      tbbar.setTitle('Badge Promotion');
   },
   onBadgeDescDeactivate : function(activeItem, c, oldActiveItem, eOpts)
   {
   },
   onItemTap : function(model)
   {
      var me = this;
      var viewport = me.getViewPortCntlr();

      me.self.playSoundFile(viewport.sound_files['clickSound']);

      var customer = viewport.getCustomer();
      var badge = model;
      var rank = badge.get('rank');
      var cbadge = Ext.StoreMgr.get('BadgeStore').getById(customer.get('badge_id'));
      var crank = cbadge.get('rank');

      if (rank <= crank)
      {
         var prefix = Genesis.constants._thumbnailAttribPrefix + 'large';
         var photoUrl =
         {
         };
         photoUrl[prefix] = Genesis.view.client.Badges.getPhoto(badge.get('type'), 'thumbnail_large_url');

         me.redeemItem = Ext.create('Genesis.model.CustomerReward',
         {
            'title' : badge.get('type').display_value,
            'type' :
            {
               value : 'promotion'
            },
            'photo' : photoUrl,
            //'points' : info['badge_prize_points'],
            'time_limited' : false,
            'quantity_limited' : false,
            'merchant' : null
         });
         me.redirectTo('badgeDesc');
      }
      else
      {
         Ext.device.Notification.show(
         {
            title : 'Badges',
            message : me.badgeLevelNotAchievedMsg
         });
      }
      return false;
   },
   // --------------------------------------------------------------------------
   // Page Navigation
   // --------------------------------------------------------------------------
   badgeDescPage : function()
   {
      this.openPage('badgeDesc')
   },
   mainPage : function()
   {
      this.openPage('main');
   },
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
   openPage : function(subFeature)
   {
      var me = this;

      switch (subFeature)
      {
         case 'badgeDesc' :
         {
            me.setAnimationMode(me.self.animationMode['cover']);
            me.pushView(me.getBadgeDesc());
            break;
         }
         case 'main' :
         {
            me.setAnimationMode(me.self.animationMode['coverUp']);
            me.pushView(me.getMainPage());
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
      var cntlr = this.getViewPortCntlr();
      this.setAnimationMode(this.self.animationMode['cover']);
      this.pushView(this.getMainPage());
      console.log("Badges Page Opened");
   },
   isOpenAllowed : function()
   {
      return true;
   }
});

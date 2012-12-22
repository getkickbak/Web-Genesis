Ext.define('Genesis.view.widgets.MerchantAccountPtsItem',
{
   extend : 'Ext.dataview.component.DataItem',
   requires : ['Ext.Button', 'Ext.XTemplate'],
   xtype : 'merchantaccountptsitem',
   alias : 'widget.merchantaccountptsitem',
   config :
   {
      layout : 'vbox',
      background :
      {
         // Backgrond Image
         cls : 'tbPanel',
         tag : 'background',
         height : window.innerWidth,
         items : [
         // Display Points
         {
            xtype : 'container',
            bottom : 0,
            width : '100%',
            cls : 'container',
            layout : 'hbox',
            defaults :
            {
               flex : 1,
               xtype : 'component'
            },
            items : [
            {
               tag : 'prizepoints',
               tpl : Ext.create('Ext.XTemplate', '<span class="x-badge round {[this.isVisible()]}">✔</span>{prize_points}',
               {
                  isVisible : function()
                  {
                     var viewport = _application.getController(((merchantMode) ? 'server' : 'client') + '.Viewport');
                     var customer = viewport.getCustomer();
                     return (customer.get('eligible_for_prize') ? '' : 'x-item-hidden');
                  }
               }),
               cls : 'prizephotodesc x-hasbadge'
            },
            {
               tag : 'points',
               tpl : Ext.create('Ext.XTemplate', '<span class="x-badge round {[this.isVisible()]}">✔</span>{points}',
               {
                  isVisible : function()
                  {
                     var viewport = _application.getController(((merchantMode) ? 'server' : 'client') + '.Viewport');
                     var customer = viewport.getCustomer();
                     return (customer.get('eligible_for_reward') ? '' : 'x-item-hidden');
                  }
               }),
               cls : 'pointsphotodesc x-hasbadge'
            }],
         }]
      },
      winnersCount :
      {
         // -----------------------------------------------------------------------
         // Prizes won by customers!
         // -----------------------------------------------------------------------
         tag : 'prizesWonPanel',
         xtype : 'component',
         cls : 'prizesWonPanel x-list',
         tpl : Ext.create('Ext.XTemplate',
         // @formatter:off
         '<div class="prizeswonphoto">',
            '<div class="itemTitle">{[this.getTitle(values)]}</div>',
            '<div class="itemDesc">{[this.getDesc(values)]}</div>',
         '</div>',
         '<div class="x-list-disclosure"></div>',
         // @formatter:on
         {
            getTitle : function(values)
            {
               var jackpot = ' Jackpot' + ((values['prize_jackpots'] > 1) ? 's' : '');
               var msg = ((values['prize_jackpots'] > 0) ? values['prize_jackpots'] + jackpot + ' won this month' : 'Be our first winner this month!');
               /*
                msg += '<img style="width:1em;float:right;"' + //
                ' src="' + Genesis.constants.getIconPath('miscicons', 'disclose') + '" />';
                */

               return msg;
            },
            getDesc : function(values)
            {
               return 'Check out our winners!';
            }
         })
      },
      badgeProgress :
      {
         // -----------------------------------------------------------------------
         // Prizes won by customers!
         // -----------------------------------------------------------------------
         tag : 'badgeProgressPanel',
         xtype : 'component',
         cls : 'badgeProgressPanel',
         tpl : Ext.create('Ext.XTemplate',
         // @formatter:off
         '<tpl if="this.isVisible(values)">',
            '<div class="badgephoto">',
               '<img class="itemPhoto" src="{[this.getPhoto(values)]}"/>',
               '<div class="itemTitle">{[this.getTitle(values)]}</div>',
               '<div class="itemDesc">',
                  '<div class="progressBarContainer">',
                     '<div class="progressBar" style="{[this.getProgress(values)]}"></div>',
                     '<div class="progressBarValue">{[this.getDesc(values)]}</div>',
                  '</div>',
                  '{[this.cleanup(values)]}',
               '</div>',
            '</div>',
         '</tpl>',
         // @formatter:on
         {
            //
            // Hide Points if we are not a customer of the Merchant
            //
            isVisible : function(values)
            {
               var viewport = _application.getController(((merchantMode) ? 'server' : 'client') + '.Viewport');
               var customer = viewport.getCustomer();
               var valid = false;

               if (customer)
               {
                  valid = Customer.isValid(customer.getId());
                  values['_customer'] = (valid) ? Ext.StoreMgr.get('CustomerStore').getById(customer.getId()) : null;
               }

               return valid;
            },
            getPhoto : function(values)
            {
               values['_badgeType'] = Ext.StoreMgr.get('BadgeStore').getById(values['_customer'].get('badge_id')).get('type');

               return Genesis.view.client.Badges.getPhoto(values['_badgeType'], 'thumbnail_medium_url');
            },
            getTitle : function(values)
            {
               var msg = ('You are our <span class ="badgehighlight">' + //
               values['_badgeType'].display_value.toUpperCase() + '</span>');
               /*
                return msg += '<img style="width:1em;float:right;"' + //
                ' src="' + Genesis.constants.getIconPath('miscicons', 'disclose') + '" />';
                */
               return msg;

            },
            getProgress : function(values)
            {
               var customer = values['_customer'];
               var nextBadge = values['_nextBadge'] = Ext.StoreMgr.get('BadgeStore').getById(customer.get('next_badge_id'));
               var nvisit = values['_nvisit'] = nextBadge.get('visits');
               var tvisit = customer.get('next_badge_visits');

               return ('width:' + (tvisit / nvisit * 100) + '%;');
            },
            // Updated Automatically when the Customer\'s metadata is updated
            getDesc : function(values)
            {
               var customer = values['_customer'];
               var nvisit = values['_nvisit'];
               var tvisit = customer.get('next_badge_visits');
               var nextBadge = values['_nextBadge'];

               return ((nvisit - tvisit) + ' more visit' + (((nvisit - tvisit) > 1) ? 's' : '') + ' to be our ' + //
               ((nextBadge) ? nextBadge.get('type').display_value.toUpperCase() : 'None') + '!');
            },
            cleanup : function(values)
            {
               delete values['_customer'];
               delete values['_nextBadge'];
               delete values['_badgeType'];
               delete values['_nvisit'];
            }
         })
      },
      dataMap :
      {
         getBackground :
         {
            setData : 'background'
         },
         getWinnersCount :
         {
            setData : 'winnersCount'
         },
         getBadgeProgress :
         {
            setData : 'badgeProgress'
         }
      },
      listeners : [
      {
         element : 'element',
         delegate : 'div.prizephotodesc',
         event : 'tap',
         fn : "onPrizesButtonTap"
      },
      {
         element : 'element',
         delegate : 'div.pointsphotodesc',
         event : 'tap',
         fn : "onRedemptionsButtonTap"
      },
      {
         'painted' : function(c, eOpts)
         {
            //console.debug("MerchantAccountPtsItem - painted[" + c.id + "]");
         }
      }]
   },
   initialize : function()
   {
      //var bg = this.query('container[tag=background]')[0];
      //bg.setHeight(Ext.Viewport.getSize().width);
   },
   applyBackground : function(config)
   {
      return Ext.factory(Ext.apply(config,
      {
      }), Ext.Container, this.getBackground());
   },
   updateBackground : function(newBackground, oldBackground)
   {
      if (newBackground)
      {
         this.add(newBackground);
      }

      if (oldBackground)
      {
         this.remove(oldBackground);
      }
   },
   setDataBackground : function(data)
   {
      var viewport = _application.getController(((merchantMode) ? 'server' : 'client') + '.Viewport');
      var customer = viewport.getCustomer();
      var venue = viewport.getVenue();
      var venueId = venue.getId();
      var cvenue = viewport.getCheckinInfo().venue;
      var customerId = customer.getId();

      //var crecord = cstore.getById(data.Merchant['merchant_id']);
      var bg = this.query('container[tag=background]')[0];

      // Update Background Photo
      bg.setStyle(
      {
         'background-image' : 'url(' + data.Merchant['alt_photo']['thumbnail_large_url'] + ')'
      });

      //
      // Hide Points if we are not a customer of the Merchant
      //
      if (Customer.isValid(customerId) && Ext.StoreMgr.get('CustomerStore').getById(customerId))
      {
         bg.getItems().items[0].show();
         //Update Points
         var points = this.query('component[tag=points]')[0];
         points.setData(customer.getData());
         var prizepoints = this.query('component[tag=prizepoints]')[0];
         prizepoints.setData(customer.getData());
      }
      else
      {
         bg.getItems().items[0].hide();
      }
   },
   applyWinnersCount : function(config)
   {
      return Ext.factory(Ext.apply(config,
      {
      }), Ext.Container, this.getWinnersCount());
   },
   updateWinnersCount : function(newWinnersCount, oldWinnersCount)
   {
      if (newWinnersCount)
      {
         this.add(newWinnersCount);
      }

      if (oldWinnersCount)
      {
         this.remove(oldWinnersCount);
      }
   },
   setDataWinnersCount : function(data)
   {
      var prizePanel = this.query('component[tag=prizesWonPanel]')[0];
      prizePanel.setData(data);
   },
   applyBadgeProgress : function(config)
   {
      return Ext.factory(Ext.apply(config,
      {
      }), Ext.Container, this.getBadgeProgress());
   },
   updateBadgeProgress : function(newBadgeProgress, oldBadgeProgress)
   {
      if (newBadgeProgress)
      {
         this.add(newBadgeProgress);
      }

      if (oldBadgeProgress)
      {
         this.remove(oldBadgeProgress);
      }
   },
   setDataBadgeProgress : function(data)
   {
      var viewport = _application.getController(((merchantMode) ? 'server' : 'client') + '.Viewport');
      var badgeProgress = this.query('component[tag=badgeProgressPanel]')[0];
      var valid = Customer.isValid(viewport.getCustomer().getId());

      if (valid)
      {
         badgeProgress.setData(data);
      }
      badgeProgress[ (valid) ? 'show' : 'hide']();
   },
   /**
    * Updates this container's child items, passing through the dataMap.
    * @param newRecord
    * @private
    */
   updateRecord : function(newRecord)
   {
      if (!newRecord)
      {
         return;
      }

      var me = this, dataview = me.config.dataview, data = dataview.prepareData(newRecord.getData(true), dataview.getStore().indexOf(newRecord), newRecord), items = me.getItems(), item = items.first(), dataMap = me.getDataMap(), componentName, component, setterMap, setterName;

      if (!item)
      {
         return;
      }
      for (componentName in dataMap)
      {
         setterMap = dataMap[componentName];
         component = me[componentName]();
         if (component)
         {
            for (setterName in setterMap)
            {
               if (component[setterName])
               {
                  switch (setterMap[setterName])
                  {
                     //component[setterName](data);
                     case 'background':
                        me.setDataBackground(data);
                        break;
                     case 'badgeProgress' :
                        me.setDataBadgeProgress(data);
                        break;
                     case 'winnersCount':
                        me.setDataWinnersCount(data);
                        break;
                     default :
                        component[setterName](data[setterMap[setterName]]);
                        break;
                  }
               }
            }
         }
      }
      // Bypassing setter because sometimes we pass the same object (different properties)
      item.updateData(data);
   },
   onPrizesButtonTap : function()
   {
      var me = this;
      var viewport = _application.getController(((merchantMode) ? 'server' : 'client') + '.Viewport');
      Genesis.controller.ControllerBase.playSoundFile(viewport.sound_files['clickSound']);
      viewport.onPrizesButtonTap();
   },
   onRedemptionsButtonTap : function()
   {
      var me = this;
      var viewport = _application.getController(((merchantMode) ? 'server' : 'client') + '.Viewport');
      Genesis.controller.ControllerBase.playSoundFile(viewport.sound_files['clickSound']);
      viewport.onRedemptionsButtonTap();
   }
});

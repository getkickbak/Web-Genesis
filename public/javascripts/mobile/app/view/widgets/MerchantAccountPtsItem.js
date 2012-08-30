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
               tpl : '{prize_points}',
               cls : 'prizephotodesc'
            },
            {
               tag : 'points',
               tpl : '{points}',
               cls : 'pointsphotodesc'
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
         cls : 'prizesWonPanel',
         tpl : Ext.create('Ext.XTemplate',
         // @formatter:off
         '<div class="prizeswonphoto x-list">',
            '<div class="itemTitle">{[this.getTitle(values)]}</div>',
            '<div class="itemDesc">{[this.getDesc(values)]}</div>',
            '<div class="x-list-disclosure"></div>',
         '</div>',
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
               var viewport = _application.getController('Viewport');
               var customer = viewport.getCustomer();
               var valid = Customer.isValid(customer.getId());

               values['_customer'] = (valid) ? Ext.StoreMgr.get('CustomerStore').getById(customer.getId()) : null;

               return valid;
            },
            getPhoto : function(values)
            {
               values['_badgeType'] = Ext.StoreMgr.get('BadgeStore').getById(values['_customer'].get('badge_id')).get('type');

               return Genesis.view.client.Badges.getPhoto(values['_badgeType'], 'thumbnail_medium_url');
            },
            getTitle : function(values)
            {
               var msg = ('You are currently our <span class ="badgehighlight">' + //
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
               delete values['_customer'];
               delete values['_nextBadge'];
               delete values['_badgeType'];
               delete values['_nvisit'];

               return ((nvisit - tvisit) + ' more visit' + (((nvisit - tvisit) > 1) ? 's' : '') + ' to be our ' + //
               nextBadge.get('type').display_value.toUpperCase() + '!');
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
      }
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
      var viewport = _application.getController('Viewport');
      var customer = viewport.getCustomer();
      var venue = viewport.getVenue();
      var venueId = venue.getId();
      var cvenue = viewport.getCheckinInfo().venue;
      var customerId = customer.getId();

      //var crecord = cstore.getById(data.Merchant['merchant_id']);
      var bg = this.query('container[tag=background]')[0];

      // Update Background Photo
      bg.setHeight(Ext.Viewport.getSize().width);
      bg.setStyle(
      {
         'background-image' : 'url(' + data.Merchant['alt_photo']['url'] + ')'
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
      var viewport = _application.getController('Viewport');
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
   }
});

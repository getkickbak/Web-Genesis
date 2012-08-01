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
               tag : 'prize_points',
               tpl : '{prize_points}',
               cls : 'prizepointsphoto'
            },
            {
               tag : 'points',
               tpl : '{points}',
               cls : 'pointsphoto'
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
         '<div class="prizeswonphoto">',
            '<div class="itemTitle">{[this.getTitle(values)]}</div>',
            '<div class="itemDesc">{[this.getDesc(values)]}</div>',
         '</div>',
         // @formatter:on
         {
            // Updated Automatically when the Customer\'s metadata is updated
            getTitle : function(values)
            {
               return 'Prizes redeemed this month';
            },
            // Updated Automatically when the Customer\'s metadata is updated
            getDesc : function(values)
            {
               return (values['prizes_count'] > 0) ? values['prizes_count'] + ' Prizes Redeemed!' : 'Be our first winner!';
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
            '<div class="badgephoto badgephoto-{}">',
               '<div class="itemTitle">{[this.getTitle(values)]}</div>',
               '<div class="itemDesc badgeProgress">',
                  '<div class="progressBarValue" style="{[this.getProgress(values)]}">{[this.getDesc(values)]}</div>',
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
               values['_customer'] = Ext.StoreMgr.get('CustomerStore').getById(customer.getId());

               return ( customer ? true : false);
            },
            getTitle : function(values)
            {
               return 'Current Badge (<b>' + values['_customer'].getBadge().get('type').display_value + '</b>)';
            },
            getProgress : function(values)
            {
               var customer = values['_customer'];
               var nvisit = customer.getNextBadge().get('visits');
               var tvisit = customer.get('next_badge_visits');

               return ('width:' + (tvisit / nvisit * 100) + '%;');
            },
            // Updated Automatically when the Customer\'s metadata is updated
            getDesc : function(values)
            {
               var customer = values['_customer'];
               var nvisit = customer.getNextBadge().get('visits');
               var tvisit = customer.get('next_badge_visits');
               delete values['_customer'];
               return (nvisit - tvisit) + ' visit(s) before your next promotion!';
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
      if (Ext.StoreMgr.get('CustomerStore').getById(customer.getId()))
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
   applyBadgeProcess : function(config)
   {
      return Ext.factory(Ext.apply(config,
      {
      }), Ext.Container, this.getBadgeProcess());
   },
   updateBadgeProcess : function(newBadgeProcess, oldBadgeProcess)
   {
      if (newBadgeProcess)
      {
         this.add(newBadgeProcess);
      }

      if (oldBadgeProcess)
      {
         this.remove(oldBadgeProcess);
      }
   },
   setBadgeProcess : function(data)
   {
      var badgeProcess = this.query('component[tag=badgeProgressPanel]')[0];
      badgeProcess.setData(data);
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
                        me.setBadgeProgress(data);
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

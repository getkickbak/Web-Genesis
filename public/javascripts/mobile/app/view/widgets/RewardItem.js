Ext.define('Genesis.view.widgets.RewardItem',
{
   extend : 'Ext.dataview.component.DataItem',
   requires : ['Ext.Button', 'Ext.XTemplate'],
   xtype : 'rewarditem',
   alias : 'widget.rewarditem',
   config :
   {
      background :
      {
         // Backgrond Image
         cls : 'rewardItem',
         tag : 'rewardItem',
         layout :
         {
            type : 'vbox'
         },
         items : [
         {
            docked : 'top',
            xtype : 'component',
            tag : 'title',
            cls : 'title',
            padding : '0.7 0.8',
            defaultUnit : 'em',
            tpl : Ext.create('Ext.XTemplate', '{[this.getDescription(values)]}',
            {
               getDescription : function(values)
               {
                  return values['title'];
               }
            })
         },
         {
            xtype : 'component',
            width : 57 * 3,
            tag : 'itemPhoto',
            cls : 'reward',
            tpl : Ext.create('Ext.XTemplate', '<img src="{[this.getPhoto(values)]}" />',
            {
               getPhoto : function(values)
               {
                  return Genesis.view.Redemptions.getPhoto(values['type']);
               }
            })
         },
         {
            docked : 'bottom',
            xtype : 'component',
            //padding : '0.7 0.8 1.4 0.8',
            //defaultUnit : 'em',
            tag : 'info',
            cls : 'info',
            tpl : Ext.create('Ext.XTemplate',
            // @formatter:off
            '<div class="photo">'+
               '<img src="{[this.getPhoto(values)]}"/>'+
            '</div>',
            '<div class="infoWrapper">' +
               '<div class="name">{[this.getName(values)]}</div>' +
               '<div class="disclaimer">{[this.getDisclaimer(values)]}</div>' +
               '<div class="date">{[this.getExpiryDate(values)]}</div>' +
            '</div>',
            // @formatter:on
            {
               getExpiryDate : function(values)
               {
                  var date = values['expiry_date'];
                  return ((!date) ? '' : 'Offer Expires ' + date);
               },
               getDisclaimer : function(values)
               {
                  return values.Merchant['prize_terms'] || 'Not valid with any other offer. No cash value. One coupon per customer per visit. Void where prohibited. Good at participating stores only.';
               },
               getPhoto : function(values)
               {
                  return values.Merchant['photo']['thumbnail_ios_small'].url;
               },
               getName : function(values)
               {
                  return values.Merchant['name'];
               }
            })
         }]
      },
      dataMap :
      {
         getBackground :
         {
            setData : 'background'
         }
      },
      listeners :
      {
         'painted' : function(c, eOpts)
         {
            var height = Ext.ComponentQuery.query('viewportview')[0].getActiveItem().renderElement.getHeight();
            c.config.dataview.setHeight(height);
            c.query('container[tag=rewardItem]')[0].setHeight(height);
            c.setHeight(height);
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
      if(newBackground)
      {
         this.add(newBackground);
      }

      if(oldBackground)
      {
         this.remove(oldBackground);
      }
   },
   setDataBackground : function(data)
   {
      this.query("component[tag=title]")[0].setData(data.CustomerReward);
      this.query("component[tag=itemPhoto]")[0].setData(data.CustomerReward);
      this.query("component[tag=info]")[0].setData(data);
   },
   /**
    * Updates this container's child items, passing through the dataMap.
    * @param newRecord
    * @private
    */
   updateRecord : function(newRecord)
   {
      if(!newRecord)
      {
         return;
      }

      var me = this, dataview = me.config.dataview, data = dataview.prepareData(newRecord.getData(true), dataview.getStore().indexOf(newRecord), newRecord), items = me.getItems(), item = items.first(), dataMap = me.getDataMap(), componentName, component, setterMap, setterName;

      if(!item)
      {
         return;
      }
      for(componentName in dataMap)
      {
         setterMap = dataMap[componentName];
         component = me[componentName]();
         if(component)
         {
            for(setterName in setterMap)
            {
               if(component[setterName])
               {
                  switch (setterMap[setterName])
                  {
                     case 'background':
                        //component[setterName](data);
                        me.setDataBackground(data);
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

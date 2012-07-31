Ext.define('Genesis.view.widgets.RedeemItem',
{
   extend : 'Ext.dataview.component.DataItem',
   requires : ['Ext.Button', 'Ext.XTemplate'],
   xtype : 'redeemitem',
   alias : 'widget.redeemitem',
   config :
   {
      background :
      {
         // Backgrond Image
         cls : 'redeemItem',
         tag : 'redeemItem',
         layout :
         {
            type : 'vbox',
            pack : 'center',
            align : 'stretch'
         },
         items : [
         {
            docked : 'top',
            xtype : 'component',
            tag : 'title',
            cls : 'title',
            //padding : '0.7 0.8',
            margin : '0 0 0.8 0',
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
            height : 210,
            flex : 1,
            tag : 'itemPhoto',
            cls : 'itemPhoto',
            tpl : Ext.create('Ext.XTemplate', '<div class="itemPoints">{[this.getPoints(values)]}</div>',
            {
               getPoints : function(values)
               {
                  return ((values['points'] > 0) ? values['points'] + '  Pts' : '');
               }
            })
         },
         {
            docked : 'bottom',
            xtype : 'component',
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
                  return values['merchant']['prize_terms'] || 'Not valid with any other offer. No cash value. One coupon per customer per visit. Void where prohibited. Good at participating stores only.';
               },
               getPhoto : function(values)
               {
                  return values['merchant']['photo']['thumbnail_ios_small'].url;
               },
               getName : function(values)
               {
                  return values['merchant']['name'];
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
            //c.config.dataview.setHeight(height);
            //c.query('container[tag=redeemItem]')[0].setHeight(height);
            //c.setHeight(height);
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
      //var reward = data['reward'];
      var reward = data;
      var photo = Genesis.view.Prizes.getPhoto(reward['type']) || reward['photo']['thumbnail_ios_medium'];
      var info = this.query("component[tag=info]")[0];

      //var refresh = this.query("button[tag=refresh]")[0];
      //var verify = this.query("button[tag=verify]")[0];
      var itemPhoto = this.query("component[tag=itemPhoto]")[0];

      //
      // Hide Merchant Information if it's missing
      //
      if(data['merchant'])
      {
         //refresh.hide();
         //verify.hide();
         info.setData(data);
         info.show();
      }
      else
      {
         info.hide();
         //
         // Verification of Prizes/Rewards Mode
         //
         //refresh[reward['photo'] ? 'show' : 'hide']();
         //verify[reward['photo'] ? 'hide' : 'show']();
      }

      this.query("component[tag=title]")[0].setData(reward);
      itemPhoto.element.setStyle((Ext.isString(photo)) ?
      {
         'background-image' : 'url(' + photo + ')',
         'background-size' : ''
      } :
      {
         'background-image' : 'url(' + photo.url + ')',
         'background-size' : (photo.width) ? Genesis.fn.addUnit(photo.width) + ' ' + Genesis.fn.addUnit(photo.height) : ''
      });
      itemPhoto.setData((!data['expiry_date'] || (data['expiry_date'] == 'N/A')) ? reward :
      {
         points : null
      });
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

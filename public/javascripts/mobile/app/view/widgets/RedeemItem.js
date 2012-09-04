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
            pack : 'top',
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
            flex : 1,
            tag : 'itemPhoto',
            cls : 'itemPhoto',
            tpl : Ext.create('Ext.XTemplate',
            // @formatter:off
            '<div class="itemPoints {[this.isVisible(values)]}">{[this.getPoints(values)]}</div>',
            // @formatter:on
            {
               isVisible : function(values)
               {
                  return ((data['Merchant']) ? '' : 'x-item-hidden');
               },
               getPoints : function(values)
               {
                  return ((values['points'] > 0) ? values['points'] + '  Pts' : '');
               }
            })
         },
         {
            docked : 'bottom',
            xtype : 'component',
            hidden : true,
            tag : 'itemPoints',
            cls : 'itemPoints',
            tpl : Ext.create('Ext.XTemplate',
            // @formatter:off
            '{[this.getPoints(values)]}',
            // @formatter:on
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
                  var limited = values['time_limited'];
                  return ((limited) ? 'Offer Expires: ' + values['expiry_date'] : '');
               },
               getDisclaimer : function(values)
               {
                  var quantity = (values['quantity_limited']) ? //
                  '<b>Quantity : ' + values['quantity'] + '</b><br/>' : //
                  'Limited Quantities. ';
                  var terms = values['Merchant']['reward_terms'] || '';

                  return (quantity + terms);
               },
               getPhoto : function(values)
               {
                  return values['Merchant']['photo']['thumbnail_ios_small'].url;
               },
               getName : function(values)
               {
                  return values['Merchant']['name'];
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
      //var reward = data['reward'];
      var reward = data;
      var photo = this.self.getPhoto(reward['type']) || reward['photo']['thumbnail_ios_medium'];
      var info = this.query("component[tag=info]")[0];

      //var refresh = this.query("button[tag=refresh]")[0];
      //var verify = this.query("button[tag=verify]")[0];
      var itemPhoto = this.query("component[tag=itemPhoto]")[0];
      var title = this.query("component[tag=title]")[0];
      var points = this.query("component[tag=itemPoints]")[0];

      //
      // Hide Merchant Information if it's missing
      //
      if (data['Merchant'])
      {
         info.setData(data);
         info.element.setVisibility(true);
         //refresh.hide();
         //verify.hide();         
         points.hide();
      }
      else
      {
         info.element.setVisibility(false);
         info.element.setHeight('4.5em');
         //
         // Verification of Prizes/Rewards Mode
         //
         //refresh[reward['photo'] ? 'show' : 'hide']();
         //verify[reward['photo'] ? 'hide' : 'show']();
         points.setData(data);
         points.show();
      }
      if (reward['title'])
      {
         title.setData(reward);
         title.element.setVisibility(true);
      }
      else
      {
         title.element.setVisibility(false);
      }
      itemPhoto.element.setStyle((Ext.isString(photo)) ?
      {
         'background-image' : 'url(' + photo + ')',
         'background-size' : ''
      } :
      {
         'background-image' : 'url(' + photo.url + ')',
         'background-size' : (photo.width) ? Genesis.fn.addUnit(photo.width) + ' ' + Genesis.fn.addUnit(photo.height) : ''
      });
      itemPhoto.element.setHeight('12.7em');
      /*
       itemPhoto.setData((!data['time_limited'] || (data['expiry_date'] == 'N/A')) ? reward :
       {
       points : null
       });
       */
      itemPhoto.setData(reward);
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
   },
   statics :
   {
      getPhoto : function(type)
      {
         var photo_url = null;
         switch (type.value)
         {
            case 'earn_points' :
            case 'promotion' :
            {
               break;
            }
            default :
               photo_url = Genesis.constants.getIconPath('prizewon', type.value);
               //console.debug("Icon Path [" + photo_url + "]");
               break;
         }
         return photo_url;
      }
   }
});

Ext.define('Genesis.view.widgets.MerchantAccountPtsItem',
{
   extend : 'Ext.dataview.component.DataItem',
   requires : ['Ext.Button', 'Ext.XTemplate'],
   xtype : 'merchantaccountptsitem',
   alias : 'widget.merchantaccountptsitem',
   config :
   {
      layout : 'fit',
      background :
      {
         // Backgrond Image
         cls : 'merchantPagePanel',
         tag : 'background',
         items : [
         {
            xtype : 'container',
            // Display Points
            docked : 'bottom',
            cls : 'container',
            layout :
            {
               type : 'hbox',
               align : 'stretch'
            },
            //height : '3.2em',
            defaults :
            {
               xtype : 'component'
            },
            items : [
            {
               docked : 'right',
               tag : 'points',
               tpl : '+{points} Pts',
               cls : 'points'
            },
            {
               docked : 'right',
               tag : 'coinphoto',
               cls : 'coinphoto',
               data :
               {
                  photo_url : 'resources/img/sprites/coin.jpg'
               },
               tpl : '<img src="{photo_url}" />'
            }],
         }]
      },
      dataMap :
      {
         getBackground :
         {
            setData : 'background'
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
      var viewport = _application.getController('Viewport');
      var customer = viewport.getCustomer();
      var venue = viewport.getVenue();
      var venueId = venue.getId();
      var cvenue = viewport.getCheckinInfo().venue;

      //var crecord = cstore.getById(data.Merchant['merchant_id']);
      var bg = this.query('container[tag=background]')[0];

      // Update Background Photo
      this.setHeight(Ext.Viewport.getSize().width);
      bg.setStyle(
      {
         'background-image' : 'url(' + data.Merchant['alt_photo']['url'] + ')'
      });

      //
      // Hide Points if we are Exploring
      //
      if(cvenue && (cvenue.getId() == venueId))
      {
         bg.getItems().items[0].show();
         //Update Points
         var points = this.query('component[tag=points]')[0];
         points.setData(customer.getData());
      }
      else
      {
         bg.getItems().items[0].hide();
      }
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

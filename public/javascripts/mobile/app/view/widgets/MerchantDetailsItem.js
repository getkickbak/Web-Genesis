Ext.define('Genesis.view.widgets.MerchantDetailsItem',
{
   extend : 'Ext.dataview.component.DataItem',
   requires : ['Ext.XTemplate'],
   xtype : 'merchantdetailsitem',
   alias : 'widget.merchantdetailsitem',
   config :
   {
      layout :
      {
         type : 'hbox',
         align : 'stretch'
      },
      image :
      {
         docked : 'left',
         cls : 'photo',
         tpl : Ext.create('Ext.XTemplate', '<div class="photo"><img src="{[this.getPhoto(values)]}"/></div>',
         {
            getPhoto : function(values)
            {
               return values.Merchant['photo'][Genesis.constants._thumbnailAttribPrefix + 'medium'].url;
            }
         })
      },
      address :
      {
         flex : 1,
         // @formatter:off
         tpl : Ext.create('Ext.XTemplate',
         '<div class="merchantDetailsWrapper">' +
            '<div class="itemTitle">{name}</div>' +
            '<div class="itemDesc">{[this.getAddress(values)]}</div>' +
         '</div>',
         // @formatter:on
         {
            getAddress : function(values)
            {
               return (values.address + ",<br/>" + values.city + ", " + values.state + ", " + values.country + ",</br>" + values.zipcode);
            }
         }),
         cls : 'address'
      },
      dataMap :
      {
         getImage :
         {
            setData : 'image'
         },
         getAddress :
         {
            setData : 'address'
         }
      }
   },
   applyImage : function(config)
   {
      return Ext.factory(Ext.apply(config,
      {
      }), Ext.Component, this.getImage());
   },
   updateImage : function(newImage, oldImage)
   {
      if(newImage)
      {
         this.add(newImage);
      }

      if(oldImage)
      {
         this.remove(oldImage);
      }
   },
   applyAddress : function(config)
   {
      return Ext.factory(Ext.apply(config,
      {
      }), Ext.Component, this.getAddress());
   },
   updateAddress : function(newAddress, oldAddress)
   {
      if(newAddress)
      {
         this.add(newAddress);
      }

      if(oldAddress)
      {
         this.remove(oldAddress);
      }
   },
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
                     case 'image':
                     case 'address':
                        component[setterName](data);
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

Ext.define('Genesis.view.widgets.RedemptionsPtsItem',
{
   extend : 'Ext.dataview.component.DataItem',
   requires : ['Ext.XTemplate'],
   xtype : 'redemptionsptsitem',
   alias : 'widget.redemptionsptsitem',
   config :
   {
      layout :
      {
         type : 'hbox',
         align : 'stretch'
      },
      //height : '5em',
      image :
      {
         docked : 'left',
         cls : 'photo',
         data :
         {
            photo_url : 'resources/img/sprites/coin.jpg'
         },
         tpl : '<img src="{photo_url}"/>'
      },
      points :
      {
         flex : 1,
         tpl : '{points} Points',
         cls : 'points'
      },
      dataMap :
      {
         getPoints :
         {
            setData : 'points'
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
   applyPoints : function(config)
   {
      return Ext.factory(Ext.apply(config,
      {
      }), Ext.Component, this.getPoints());
   },
   updatePoints : function(newPoints, oldPoints)
   {
      if(newPoints)
      {
         this.add(newPoints);
      }

      if(oldPoints)
      {
         this.remove(oldPoints);
      }
   },
   updateRecord : function(newRecord)
   {
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
                     case 'points':
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

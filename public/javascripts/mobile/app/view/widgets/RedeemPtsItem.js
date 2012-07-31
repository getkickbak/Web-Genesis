Ext.define('Genesis.view.widgets.RedeemPtsItem',
{
   extend : 'Ext.dataview.component.DataItem',
   requires : ['Ext.XTemplate'],
   xtype : 'redeemptsitem',
   alias : 'widget.redeemptsitem',
   config :
   {
      layout :
      {
         type : 'hbox',
         align : 'stretch'
      },
      points :
      {
         flex : 1,
         tpl : '{points} Pts',
         cls : 'pointsphotobase'
      },
      dataMap :
      {
         getPoints :
         {
            setData : 'points'
         }
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

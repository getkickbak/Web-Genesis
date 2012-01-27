Ext.define('Genesis.view.widgets.RewardsCartItem',
{
   extend : 'Ext.dataview.component.DataItem',
   requires : ['Ext.field.Select', 'Ext.XTemplate'],
   xtype : 'rewardscartitem',
   alias : 'widget.rewardscartitem',
   config :
   {
      layout :
      {
         type : 'hbox',
         align : 'center'
      },
      remove :
      {
         hidden : true,
         iconCls : 'delete_black2',
         iconMask : true,
         cls : 'plain'
      },
      select :
      {
         options : [
         {
            text : '1',
            value : 1
         },
         {
            text : '2',
            value : 2
         },
         {
            text : '3',
            value : 3
         },
         {
            text : '4',
            value : 4
         }],
         value : 1,
         width : '5em'
      },
      image :
      {
         cls : 'photo',
         tpl : Ext.create('Ext.XTemplate', '<img src="{[this.getPhoto(values)]}"/>',
         {
            getPhoto : function(values)
            {
               if(!values.photo_url)
               {
                  return Genesis.view.Rewards.getPhoto(values.type);
               }
               return values.photo_url;
            }
         })

      },
      title :
      {
         flex : 1,
         cls : 'title',
      },
      points :
      {
         cls : 'points',
         tpl : '{points} Pts',
         style : 'min-width:4em;'
      },
      dataMap :
      {
         getImage :
         {
            setData : 'photo_url'
         },
         getTitle :
         {
            setHtml : 'title'
         },
         getPoints :
         {
            setData : 'points'
         }
      }
   },
   applyRemove : function(config)
   {
      return Ext.factory(Ext.apply(config,
      {
      }), Ext.Button, this.getRemove());
   },
   updateRemove : function(newRemove, oldRemove)
   {
      if(newRemove)
      {
         this.add(newRemove);
      }

      if(oldRemove)
      {
         this.remove(oldRemove);
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
   applyTitle : function(config)
   {
      return Ext.factory(Ext.apply(config,
      {
      }), Ext.Component, this.getTitle());
   },
   updateTitle : function(newTitle, oldTitle)
   {
      if(newTitle)
      {
         this.add(newTitle);
      }

      if(oldTitle)
      {
         this.remove(oldTitle);
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
   applySelect : function(config)
   {
      return Ext.factory(Ext.apply(config,
      {
      }), Ext.field.Select, this.getSelect());
   },
   updateSelect : function(newSelect, oldSelect)
   {
      if(newSelect)
      {
         this.add(newSelect);
      }

      if(oldSelect)
      {
         this.remove(oldSelect);
      }
   },
   updateRecord : function(newRecord)
   {
      var me = this, dataview = me.dataview, data = dataview.prepareData(newRecord.getData(true), dataview.getStore().indexOf(newRecord), newRecord), items = me.getItems(), item = items.first(), dataMap = me.getDataMap(), componentName, component, setterMap, setterName;

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
                     case 'photo_url':
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

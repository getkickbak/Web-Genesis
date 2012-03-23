Ext.define('Genesis.view.widgets.RewardsCartItem',
{
   extend : 'Ext.dataview.component.DataItem',
   requires : ['Ext.field.Select', 'Ext.XTemplate'],
   //mixins : ['Genesis.view.widgets.Animation'],
   xtype : 'rewardscartitem',
   alias : 'widget.rewardscartitem',
   config :
   {
      hideAnimation : !Ext.os.is.Android2 ?
      {
         type : 'scroll',
         direction : 'up',
         duration : 250,
         easing : 'ease-out'
      } : null,
      layout :
      {
         type : 'hbox',
         align : 'center'
      },
      qty :
      {
         value : 0,
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
         },
         {
            text : '5',
            value : 5
         },
         {
            text : '6',
            value : 6
         },
         {
            text : '7',
            value : 7
         },
         {
            text : '8',
            value : 8
         },
         {
            text : '9',
            value : 9
         }]
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
         tpl : Ext.create('Ext.XTemplate', '{[this.getPoints(values)]} Pts',
         {
            getPoints : function(values)
            {
               return values.qty * values.points;
            }
         })
      },
      remove :
      {
         hidden : true,
         iconCls : 'delete_black2',
         tag : 'deleteItem',
         iconMask : true,
         cls : 'plain'
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
         },
         getQty :
         {
            setValue : 'qty'
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
   applyQty : function(config)
   {
      return Ext.factory(Ext.apply(config,
      {
      }), Ext.field.Select, this.getQty());
   },
   updateQty : function(newQty, oldQty)
   {
      if(newQty)
      {
         this.add(newQty);
      }

      if(oldQty)
      {
         this.remove(oldQty);
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
                     case 'photo_url':
                        component[setterName](data);
                        break;
                     /*
                      case 'qty' :
                      var value = data[setterMap[setterName]];
                      var store = component.getStore();
                      var index = store.find(component.getValueField(), value, null, null, null, true);
                      var record = store.getAt(index);

                      component[setterName](record);
                      break;
                      */
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

Ext.define('Genesis.view.widgets.RewardsCartItem',
{
   extend : 'Ext.dataview.component.DataItem',
   requires : ['Ext.Button', 'Ext.XTemplate'],
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
      image :
      {
         cls : 'photo',
         tpl : Ext.create('Ext.XTemplate', '<img src="{[this.getPhoto(values)]}"/>',
         {
            getPhoto : function(values)
            {
               if(!values.photo)
               {
                  return Genesis.view.Rewards.getPhoto(values['type']);
               }
               return values.photo.url;
            }
         })
      },
      title :
      {
         flex : 1,
         cls : 'title'
      },
      addQty :
      {
         iconCls : 'arrow_up',
         tag : 'addQty',
         iconMask : true
      },
      qty :
      {
         cls : 'qty',
         tpl : Ext.create('Ext.XTemplate', '{[this.getQty(values)]}',
         {
            getQty : function(values)
            {
               return Ext.isEmpty(values['qty']) ? 0 : values['qty'];
            }
         })
      },
      subQty :
      {
         iconCls : 'arrow_down',
         tag : 'subQty',
         iconMask : true
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
         getQty :
         {
            setData : 'qty'
         }
      }
   },
   applyAddQty : function(config)
   {
      return Ext.factory(Ext.apply(config,
      {
      }), Ext.Button, this.getAddQty());
   },
   updateAddQty : function(newAddQty, oldAddQty)
   {
      if(newAddQty)
      {
         this.add(newAddQty);
      }

      if(oldAddQty)
      {
         this.remove(oldAddQty);
      }
   },
   applyQty : function(config)
   {
      return Ext.factory(Ext.apply(config,
      {
      }), Ext.Component, this.getQty());
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
   applySubQty : function(config)
   {
      return Ext.factory(Ext.apply(config,
      {
      }), Ext.Button, this.getSubQty());
   },
   updateSubQty : function(newSubQty, oldSubQty)
   {
      if(newSubQty)
      {
         this.add(newSubQty);
      }

      if(oldSubQty)
      {
         this.remove(oldSubQty);
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
                     case 'qty':
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

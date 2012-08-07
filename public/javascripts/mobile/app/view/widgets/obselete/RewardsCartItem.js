Ext.define('Genesis.view.widgets.RewardsCartItem',
{
   extend : 'Ext.dataview.component.DataItem',
   requires : ['Ext.Button', 'Ext.field.Spinner', 'Ext.XTemplate'],
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
         align : 'center',
         pack : 'start'
      },
      image :
      {
         cls : 'photo x-hasbadge',
         // @formatter:off
        tpl : Ext.create('Ext.XTemplate',
         '<span class="x-badge round">{[this.getPoints(values)]} Pts</span>',
         '<img src="{[this.getPhoto(values)]}"/>',
         // @formatter:on
         {
            getPoints : function(values)
            {
               return values['points'];
            },
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
         cls : 'itemDetails',
         tpl : Ext.create('Ext.XTemplate', '<div class="itemTitle">{[this.getTitle(values)]}</div>',
         //'<div class="itemDesc">{[this.getDesc(values)]}</div>',
         {
            getTitle : function(values)
            {
               return values['title'];
            },
            getDesc : function(values)
            {
               return values['title'];
            }
         })
      },
      qty :
      {
         minValue : 0,
         maxValue : 99,
         increment : 1,
         groupButtons : false,
         cycle : false,
         listeners :
         {
            initialize : function(f, eOpts)
            {
               var field = Ext.fly(Ext.DomQuery.select('div.x-field-input',f.element.dom)[0]);
               field[(f.getValue() > 0)?'removeCls':'addCls']('x-item-hidden');
            }
         }
      },
      dataMap :
      {
         getImage :
         {
            setData : 'photo_url'
         },
         getTitle :
         {
            setData : 'title'
         },
         getQty :
         {
            setValue : 'qty'
         }
      }
   },
   applyQty : function(config)
   {
      return Ext.factory(Ext.apply(config,
      {
         value : this.config.record.get('qty') || 0
      }), Ext.field.Spinner, this.getQty());
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
                     case 'photo_url':
                     case 'title':
                        component[setterName](data);
                        break;
                     case 'qty' :
                     {
                        var qty = data[setterMap[setterName]];
                        component[setterName](qty);
                        var field = Ext.get(Ext.DomQuery.select('div.x-field-input',component.element.dom)[0]);
                        field[(qty > 0)?'removeCls':'addCls']('x-item-hidden');
                        break;
                     }
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
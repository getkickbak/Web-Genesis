Ext.define('Genesis.view.widgets.ChallengeMenuItem',
{
   extend : 'Ext.dataview.component.DataItem',
   requires : ['Ext.XTemplate'],
   xtype : 'challengemenuitem',
   alias : 'widget.challengemenuitem',
   config :
   {
      layout :
      {
         type : 'hbox',
         pack : 'center',
         align : 'stretch'
      },
      image :
      {
         cls : 'photo',
         tpl : Ext.create('Ext.XTemplate',
         // @formatter:off
         '<div class="mainPageItemWrapper">', '<div class="photo"><img src="{[this.getPhoto(values)]}" /></div>', '<div class="photoName">{name}</div>', '</div>',
         // @formatter:on
         {
            getPhoto : function(values)
            {
               return Ext.isEmpty(values.photo_url) ? Ext.BLANK_IMAGE_URL : values.photo_url;
            }
         })
      },
      dataMap :
      {
         getImage :
         {
            setData : 'photo_url'
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

Ext.define('KickBak.view.widgets.Item',
{
   extend : 'Ext.Container',
   requires : ['Ext.XTemplate'],
   xtype : 'item',
   alias : 'widget.item',
   config :
   {
      cls : 'item',
      tag : 'item',
      layout : 'fit'
   },
   constructor : function(config)
   {
      var me = this;

      config = config ||
      {
      };
      me.config['preItemsConfig'] = me.config['preItemsConfig'] || [];
      me.config['postItemsConfig'] = me.config['postItemsConfig'] || [];
      me.config['photoTemplate'] = me.config['photoTemplate'] || null;

      var preItemsConfig = config['preItemsConfig'] || [];
      var postItemsConfig = config['postItemsConfig'] || [];
      var photoTemplate = config['photoTemplate'] || me.config['photoTemplate'];

      Ext.merge(preItemsConfig, me.config['preItemsConfig']);
      Ext.merge(postItemsConfig, me.config['postItemsConfig']);
      //
      delete config['preItemsConfig'];
      delete config['postItemsConfig'];
      delete config['photoTemplate'];

      Ext.merge(config,
      {
         // Backgrond Image
         items : [
         {
            docked : 'top',
            xtype : 'component',
            tag : 'title',
            cls : 'title',
            defaultUnit : 'em',
            tpl : Ext.create('Ext.XTemplate', '{[this.getDescription(values)]}',
            {
               getDescription : function(values)
               {
                  return values['title'];
               }
            })
         }].concat(preItemsConfig, [
         {
            xtype : 'component',
            tag : 'itemPhoto',
            cls : 'itemPhoto',
            tpl : (photoTemplate) ? photoTemplate : Ext.create('Ext.XTemplate',
            // @formatter:off
            '<div class="photoVCenterHelper"></div>',
            '<div class="photoVCenterContent"><img {[this.getPhoto(values)]} /></div>',
            // @formatter:on
            {
               getPhoto : function(values)
               {
                  var photo = values['photo'];
                  if (Ext.isString(photo))
                  {
                     return 'src="' + photo + '"';
                  }
                  else
                  {
                     return 'src="' + photo.url + '" ' + //
                     ((photo.width) ? 'style="width:' + KickBak.fn.addUnit(photo.width) + ';height:' + KickBak.fn.addUnit(photo.height) + ';"' : '');
                  }
               }
            })
         }], postItemsConfig)
      });

      this.callParent(arguments);
   },
   initialize : function()
   {
      this.callParent(arguments);
      this.updateItem(this.getData());
   },
   updateItem : function(data)
   {
      var me = this;
      var content = data.raw;

      var itemPhoto = me.query("component[tag=itemPhoto]")[0];
      var title = me.query("component[tag=title]")[0];

      //
      if (content['title'])
      {
         title.setData(content);
         title.show();
      }
      else
      {
         title.hide();
      }
      itemPhoto.setData(content);
      me.setData(data);

      return content;
   },
   inheritableStatics :
   {
   }
});

Ext.define('KickBak.view.widgets.PopupItem',
{
   extend : 'KickBak.view.widgets.Item',
   xtype : 'popupitem',
   alias : 'widget.popupitem',
   config :
   {
      iconType : null
   },
   constructor : function(config)
   {
      var me = this;
      Ext.merge(config,
      {
         // Backgrond Image
         tag : 'popupItem',
         photoTemplate : Ext.create('Ext.XTemplate',
         // @formatter:off
         '<div class="photoVCenterHelper"></div>',
         '<div class="photoVCenterContent"><img {[this.getPhoto(values)]} /></div>',
         // @formatter:on
         {
            getPhoto : function(values)
            {
               var photo = me.self.getPhoto(values['type'], me.getIconType());
               return 'src="' + photo + '"';
            }
         })
      });

      me.callParent(arguments);
   },
   inheritableStatics :
   {
      getPhoto : function(type, iconType)
      {
         var photo_url = KickBak.constants.getIconPath(iconType, type.value, true);
         return photo_url;
      }
   }
});

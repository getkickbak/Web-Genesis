Ext.define('Genesis.view.widgets.Item',
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
                     ((photo.width) ? 'style="width:' + Genesis.fn.addUnit(photo.width) + ';height:' + Genesis.fn.addUnit(photo.height) + ';"' : '');
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

Ext.define('Genesis.view.widgets.RedeemItem',
{
   extend : 'Genesis.view.widgets.Item',
   xtype : 'redeemitem',
   alias : 'widget.redeemitem',
   config :
   {
      iconType : 'prizewon',
      hideMerchant : false,
      cls : 'item redeemItem',
      // Backgrond Image
      tag : 'redeemItem',
      layout : 'fit',
      postItemsConfig : [
      {
         docked : 'bottom',
         xtype : 'component',
         hidden : true,
         tag : 'itemPoints',
         cls : 'itemPoints',
         tpl : Ext.create('Ext.XTemplate',
         // @formatter:off
            '{[this.getPoints(values)]}',
            // @formatter:on
         {
            getPoints : function(values)
            {
               return ((values['points'] > 0) ? values['points'] + '  Pts' : ' ');
            }
         })
      },
      {
         docked : 'bottom',
         xtype : 'component',
         tag : 'info',
         cls : 'info',
         tpl : Ext.create('Ext.XTemplate',
         // @formatter:off
            '<div class="photo">'+
               '<img src="{[this.getPhoto(values)]}"/>'+
            '</div>',
            '<div class="infoWrapper">' +
               '<div class="name">{[this.getName(values)]}</div>' +
               '<div class="disclaimer">{[this.getDisclaimer(values)]}</div>' +
               '<div class="date">{[this.getExpiryDate(values)]}</div>' +
            '</div>',
            // @formatter:on
         {
            getExpiryDate : function(values)
            {
               var limited = values.get('time_limited');
               return ((limited) ? 'Offer Expires: ' + values.get('expiry_date') : '');
            },
            getDisclaimer : function(values)
            {
               var quantity = (values.get('quantity_limited')) ? //
               '<b>Quantity : ' + values.get('quantity') + '</b><br/>' : //
               'Limited Quantities. ';
               var terms = values.getMerchant().get('reward_terms') || '';

               return (quantity + terms);
            },
            getPhoto : function(values)
            {
               return values.getMerchant().get('photo')['thumbnail_medium_url'];
            },
            getName : function(values)
            {
               return values.getMerchant().get('name');
            }
         })
      }]
   },
   constructor : function(config)
   {
      var me = this;
      config = Ext.merge(
      {
         photoTemplate : Ext.create('Ext.XTemplate',
         // @formatter:off
         '<div class="photoVCenterHelper"></div>',
         '<div class="photoVCenterContent"><img {[this.getPhoto(values)]} /></div>',
         '<div class="itemPoints {[this.isVisible(values)]}">{[this.getPoints(values)]}</div>',
         // @formatter:on
         {
            getPhoto : function(values)
            {
               var prefix = Genesis.constants._thumbnailAttribPrefix + 'large';
               var photo = (values['photo'] && values['photo']['url']) ? values['photo'][prefix] : me.self.getPhoto(values['type'], me.getIconType());
               if (Ext.isString(photo))
               {
                  return 'src="' + photo + '"';
               }
               else
               {
                  return 'src="' + photo.url + '" ' + //
                  ((photo.width) ? 'style="width:' + Genesis.fn.addUnit(photo.width) + ';height:' + Genesis.fn.addUnit(photo.height) + ';"' : '');
               }
            },
            isVisible : function(values)
            {
               return ((values['merchant']) ? '' : 'x-item-hidden');
            },
            getPoints : function(values)
            {
               return ((values['points'] > 0) ? values['points'] + '  Pts' : ' ');
            }
         }),
      }, config);

      this.callParent(arguments);
   },
   updateItem : function(data)
   {
      var me = this;
      var content = data.raw;
      var info = me.query("component[tag=info]")[0];
      var points = me.query("component[tag=itemPoints]")[0];

      //
      // Hide Merchant Information if it's missing
      //
      if (content['merchant'] && !me.getHideMerchant())
      {
         info.setData(data);
         info.show();
         points.setData(
         {
            points : 0
         });
      }
      else
      {
         info.hide();
         points.setData(content);
         points.show();
      }

      me.callParent(arguments);
   },
   inheritableStatics :
   {
      getPhoto : function(type, iconType)
      {
         var photo_url = null;
         switch (type.value)
         {
            case 'earn_points' :
            case 'promotion' :
            {
               break;
            }
            default :
               photo_url = Genesis.constants.getIconPath(iconType, type.value);
               //console.debug("Icon Path [" + photo_url + "]");
               break;
         }
         return photo_url;
      }
   }

});

Ext.define('Genesis.view.widgets.PopupItem',
{
   extend : 'Genesis.view.widgets.Item',
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
         var photo_url = Genesis.constants.getIconPath(iconType, type.value);
         return photo_url;
      }
   }
});

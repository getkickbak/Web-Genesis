Ext.define('Genesis.view.widgets.RedeemItem',
{
   extend : 'Ext.Container',
   requires : ['Ext.Button', 'Ext.XTemplate'],
   xtype : 'redeemitem',
   alias : 'widget.redeemitem',
   config :
   {
      // Backgrond Image
      cls : 'redeemItem',
      tag : 'redeemItem',
      layout : 'fit',
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
      },
      {
         xtype : 'component',
         tag : 'itemPhoto',
         cls : 'itemPhoto',
         tpl : Ext.create('Ext.XTemplate',
         // @formatter:off
            '<div class="photoVCenterHelper"></div>',
            '<div class="photoVCenterContent"><img {[this.getPhoto(values)]} /></div>',
            '<div class="itemPoints {[this.isVisible(values)]}">{[this.getPoints(values)]}</div>',
            // @formatter:on
         {
            getPhoto : function(values)
            {
               var prefix = Genesis.constants._thumbnailAttribPrefix + 'large';
               var photo = Genesis.view.widgets.RedeemItem.getPhoto(values['type']) || values['photo'][prefix];
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
         })
      },
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
               return values.getMerchant().get('photo')[Genesis.constants._thumbnailAttribPrefix + 'small'].url;
            },
            getName : function(values)
            {
               return values.getMerchant().get('name');
            }
         })
      }]
   },
   initialize : function()
   {
      this.callParent(arguments);
      this.updateItem(this.getData());
   },
   updateItem : function(data)
   {
      var reward = data.raw;
      var info = this.query("component[tag=info]")[0];

      var itemPhoto = this.query("component[tag=itemPhoto]")[0];
      var title = this.query("component[tag=title]")[0];
      var points = this.query("component[tag=itemPoints]")[0];

      //
      // Hide Merchant Information if it's missing
      //
      if (reward['merchant'])
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
         points.setData(reward);
         points.show();
      }
      if (reward['title'])
      {
         title.setData(reward);
         title.show();
      }
      else
      {
         title.hide();
      }
      itemPhoto.setData(reward);
   },
   statics :
   {
      getPhoto : function(type)
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
               photo_url = Genesis.constants.getIconPath('prizewon', type.value);
               //console.debug("Icon Path [" + photo_url + "]");
               break;
         }
         return photo_url;
      }
   }

});

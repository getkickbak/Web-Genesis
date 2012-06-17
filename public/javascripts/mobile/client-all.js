Ext.define('Genesis.profile.Iphone',
{
   extend : 'Ext.app.Profile',
   config :
   {
   },
   isActive : function()
   {
      return Ext.os.is.iPhone;
   }
});

//---------------------------------------------------------------------------------------------------------------------------------
// Ext.device.notification.PhoneGap
//---------------------------------------------------------------------------------------------------------------------------------
Ext.define('Genesis.device.notification.PhoneGap',
{
   override : 'Ext.device.notification.PhoneGap',
   beep : function(times)
   {
      var viewport = _application.getController('Viewport');
      Genesis.controller.ControllerBase.playSoundFile(viewport.sound_files['beepSound']);
      console.log("Beep " + times + " times.")
   },
   vibrate : function(duration)
   {
      navigator.notification.vibrate(duration || 2000);
   }
});Ext.define('Genesis.profile.Android',
{
   extend : 'Ext.app.Profile',
   config :
   {
   },
   isActive : function()
   {
      return Ext.os.is.Android;
   }
});

//---------------------------------------------------------------------------------------------------------------------------------
// Ext.device.notification.PhoneGap
//---------------------------------------------------------------------------------------------------------------------------------
Ext.define('Genesis.device.notification.PhoneGap',
{
   override : 'Ext.device.notification.PhoneGap',
   beep : function(times)
   {
      var viewport = _application.getController('Viewport');
      Genesis.controller.ControllerBase.playSoundFile(viewport.sound_files['beepSound']);
      //navigator.notification.beep(times);
   },
   vibrate : function(duration)
   {
      navigator.notification.vibrate(duration || 2000);
   }
});
Ext.define('Genesis.profile.Desktop',
{
   extend : 'Ext.app.Profile',
   config :
   {
   },
   isActive : function()
   {
      return Ext.os.deviceType == 'Desktop';
   }
});

//---------------------------------------------------------------------------------------------------------------------------------
// Ext.device.notification.Simulator
//---------------------------------------------------------------------------------------------------------------------------------
Ext.define('Genesis.device.notification.Simulator',
{
   override : 'Ext.device.notification.Simulator',
   beep : function(times)
   {
      var viewport = _application.getController('Viewport');
      Genesis.controller.ControllerBase.playSoundFile(viewport.sound_files['beepSound']);
      console.log("Beep " + times + " times.")
   }
});

//---------------------------------------------------------------------------------------------------------------------------------
// Ext.device.notification.Desktop
//---------------------------------------------------------------------------------------------------------------------------------
Ext.define('Genesis.device.notification.Desktop',
{
   override : 'Ext.device.notification.Desktop',
   beep : function(times)
   {
      var viewport = _application.getController('Viewport');
      Genesis.controller.ControllerBase.playSoundFile(viewport.sound_files['beepSound']);
      console.log("Beep " + times + " times.")
   }
});
/**
 * @private
 */
Ext.define('Genesis.fx.animation.Scroll',
{

   extend : 'Ext.fx.animation.Abstract',

   alternateClassName : 'Ext.fx.animation.ScrollIn',

   alias : ['animation.scroll', 'animation.scrollIn'],

   config :
   {
      /**
       * @cfg {String} direction The direction of which the slide animates
       * @accessor
       */
      direction : 'left',

      /**
       * @cfg {Boolean} out True if you want to make this animation slide out, instead of slide in.
       * @accessor
       */
      out : false,

      /**
       * @cfg {Number} offset The offset that the animation should go offscreen before entering (or when exiting)
       * @accessor
       */
      offset : 0,

      /**
       * @cfg
       * @inheritdoc
       */
      easing : 'auto',

      containerBox : 'auto',

      elementBox : 'auto',

      isElementBoxFit : true
   },

   reverseDirectionMap :
   {
      up : 'down',
      down : 'up',
      left : 'right',
      right : 'left'
   },

   applyEasing : function(easing)
   {
      if(easing === 'auto')
      {
         return 'ease-' + ((this.getOut()) ? 'in' : 'out');
      }

      return easing;
   },
   getData : function()
   {
      var element = this.getElement();
      var from = this.getFrom(), to = this.getTo(), out = this.getOut(), offset = this.getOffset(), direction = this.getDirection(), reverse = this.getReverse(), translateX = 0, translateY = 0, fromX, fromY, toX, toY;

      if(reverse)
      {
         direction = this.reverseDirectionMap[direction];
      }

      switch (direction)
      {
         case this.DIRECTION_UP:
         case this.DIRECTION_DOWN:
            translateY = element.getHeight();
            break;

         case this.DIRECTION_RIGHT:
         case this.DIRECTION_LEFT:
            translateX = element.getWidth();
            break;
      }
      //
      //
      //
      fromX = (out) ? 0 : translateX;
      fromY = (out) ? 0 : translateY;
      from.set('overflow', 'hidden');
      switch (direction)
      {
         case this.DIRECTION_UP:
         case this.DIRECTION_DOWN:
            from.set('height', fromY + 'px');
            break;

         case this.DIRECTION_RIGHT:
         case this.DIRECTION_LEFT:
            from.set('width', fromX + 'px');
            break;
      }
      toX = (out) ? translateX : 0;
      toY = (out) ? translateY : 0;
      to.set('overflow', 'hidden');
      switch (direction)
      {
         case this.DIRECTION_UP:
         case this.DIRECTION_DOWN:
            to.set('height', toY + 'px');
            break;

         case this.DIRECTION_RIGHT:
         case this.DIRECTION_LEFT:
            to.set('width', toX + 'px');
            break;
      }

      return this.callParent(arguments);
   }
});
Ext.define('Genesis.view.widgets.ListField',
{
   extend : 'Ext.field.Text',
   alternateClassName : 'Genesis.field.List',
   xtype : 'listfield',
   /**
    * @cfg {Object} component
    * @accessor
    * @hide
    */
   config :
   {
      ui : 'list',
      component :
      {
         useMask : false
      },
      /**
       * @cfg {Boolean} clearIcon
       * @hide
       * @accessor
       */
      clearIcon : true,
      iconCls : '',
      readOnly : false
   },
   // @private
   initialize : function()
   {
      var me = this, component = me.getComponent();

      me.callParent();

      if(me.getIconCls())
      {
         Ext.fly(me.element.query('.'+Ext.baseCSSPrefix.trim()+'component-outer')[0]).addCls(me.getIconCls());
      }
      component.setReadOnly(true);
   },
   // @private
   doClearIconTap : Ext.emptyFn
});
/**
 * @private
 */
Ext.define('Genesis.view.widgets.ComponentListItem',
{
   extend : 'Ext.dataview.element.List',
   config :
   {
      maxItemCache : 20
   },
   //@private
   initialize : function()
   {
      this.callParent();
      this.doInitialize();
      this.itemCache = [];
   },
   getItemElementConfig : function(index, data)
   {
      var me = this, dataview = me.dataview, itemCls = dataview.getItemCls(), cls = me.itemClsShortCache, config, iconSrc;

      if(itemCls)
      {
         cls += ' ' + itemCls;
      }
      config =
      {
         cls : cls,
         children : [
         {
            cls : me.labelClsShortCache,
            //html : dataview.getItemTpl().apply(data)
         }]
      };

      if(dataview.getIcon())
      {
         iconSrc = data.iconSrc;
         config.children.push(
         {
            cls : me.iconClsShortCache,
            style : 'background-image: ' + iconSrc ? 'url("' + newSrc + '")' : ''
         });
      }
      return config;
   },
   moveItemsToCache : function(from, to)
   {
      var me = this, dataview = me.dataview, maxItemCache = dataview.getMaxItemCache(), items = me.getViewItems(), itemCache = me.itemCache, cacheLn = itemCache.length, pressedCls = dataview.getPressedCls(), selectedCls = dataview.getSelectedCls(), i = to - from, item;

      for(; i >= 0; i--)
      {
         item = Ext.get(items[from + i]);
         var extItem = item.down(me.labelClsCache, true);
         var extCmp = Ext.getCmp(extItem.childNodes[0].id);
         if(cacheLn !== maxItemCache)
         {
            //me.remove(item, false);
            item.removeCls([pressedCls, selectedCls]);
            itemCache.push(extCmp);
            cacheLn++;
         }
         else
         {
            Ext.Array.remove(me.itemCache, extCmp);
            extCmp.destroy();
            //item.destroy();
         }
         item.dom.parentNode.removeChild(item.dom);
      }

      if(me.getViewItems().length == 0)
      {
         this.dataview.showEmptyText();
      }
   },
   moveItemsFromCache : function(records)
   {
      var me = this, dataview = me.dataview, store = dataview.getStore(), ln = records.length;
      var xtype = dataview.getDefaultType(), itemConfig = dataview.getItemConfig();
      var itemCache = me.itemCache, cacheLn = itemCache.length, items = [], i, item, record;

      if(ln)
      {
         dataview.hideEmptyText();
      }

      for( i = 0; i < ln; i++)
      {
         records[i]._tmpIndex = store.indexOf(records[i]);
      }

      Ext.Array.sort(records, function(record1, record2)
      {
         return record1._tmpIndex > record2._tmpIndex ? 1 : -1;
      });

      for( i = 0; i < ln; i++)
      {
         record = records[i];
         if(cacheLn)
         {
            cacheLn--;
            item = itemCache.pop();
            me.updateListItem(record, item);
         }
         me.addListItem(record._tmpIndex, record, item);
         delete record._tmpIndex;
      }
      return items;
   },
   addListItem : function(index, record, item)
   {
      var me = this, dataview = me.dataview, data = dataview.prepareData(record.getData(true), dataview.getStore().indexOf(record), record);
      var element = me.element, childNodes = element.dom.childNodes, ln = childNodes.length, wrapElement;
      wrapElement = Ext.Element.create(this.getItemElementConfig(index, data));

      var xtype = dataview.getDefaultType(), itemConfig = dataview.getItemConfig();

      if(!ln || index == ln)
      {
         wrapElement.appendTo(element);
      }
      else
      {
         wrapElement.insertBefore(childNodes[index]);
      }

      var extItem = wrapElement.down(me.labelClsCache, true);
      if(!item)
      {
         item = new Ext.widget(xtype,
         {
            xtype : xtype,
            record : record,
            dataview : dataview,
            itemCls : dataview.getItemCls(),
            defaults : itemConfig,
            renderTo : extItem
         });
      }
      else
      {
         item.element.appendTo(extItem);
      }
      //me.itemCache.push(item);
   },
   updateListItem : function(record, item)
   {
      if(item.isComponent && item.updateRecord)
      {
         item.updateRecord(record);
      }
      else
      {
         var extItem = Ext.fly(item).down(this.labelClsCache, true);
         var extCmp = Ext.getCmp(extItem.childNodes[0].id);
         extCmp.updateRecord(record);
      }
   },
   destroy : function()
   {
      var elements = this.getViewItems(), ln = elements.length, i = 0, len = this.itemCache.length;

      for(; i < len; i++)
      {
         this.itemCache[i].destroy();
         this.itemCache[i] = null;
      }
      delete this.itemCache;
      for( i = 0; i < ln; i++)
      {
         Ext.removeNode(elements[i]);
      }
      this.callParent();
   }
});
Ext.define('Genesis.view.widgets.ComponentList',
{
   alternateClassName : 'Genesis.ComponentList',
   extend : 'Ext.dataview.List',
   xtype : 'componentlist',
   requires : ['Genesis.view.widgets.ComponentListItem'],
   initialize : function()
   {
      var me = this, container;

      me.on(me.getTriggerCtEvent(), me.onContainerTrigger, me);
      container = me.container = this.add(new Genesis.view.widgets.ComponentListItem(
      {
         baseCls : this.getBaseCls()
      }));
      container.dataview = me;

      me.on(me.getTriggerEvent(), me.onItemTrigger, me);

      container.element.on(
      {
         delegate : '.' + this.getBaseCls() + '-disclosure',
         tap : 'handleItemDisclosure',
         scope : me
      });

      container.on(
      {
         itemtouchstart : 'onItemTouchStart',
         itemtouchend : 'onItemTouchEnd',
         itemtap : 'onItemTap',
         itemtaphold : 'onItemTapHold',
         itemtouchmove : 'onItemTouchMove',
         itemsingletap : 'onItemSingleTap',
         itemdoubletap : 'onItemDoubleTap',
         itemswipe : 'onItemSwipe',
         scope : me
      });

      if(this.getStore())
      {
         this.refresh();
      }
   }
});
Ext.define('Genesis.view.widgets.MerchantDetailsItem',
{
   extend : 'Ext.dataview.component.DataItem',
   requires : ['Ext.XTemplate'],
   xtype : 'merchantdetailsitem',
   alias : 'widget.merchantdetailsitem',
   config :
   {
      layout :
      {
         type : 'hbox',
         align : 'stretch'
      },
      image :
      {
         docked : 'left',
         cls : 'photo',
         tpl : Ext.create('Ext.XTemplate', '<div class="photo"><img src="{[this.getPhoto(values)]}"/></div>',
         {
            getPhoto : function(values)
            {
               return values.Merchant['photo']['thumbnail_ios_medium'].url;
            }
         })
      },
      address :
      {
         flex : 1,
         // @formatter:off
         tpl : Ext.create('Ext.XTemplate',
         '<div class="merchantDetailsWrapper">' +
            '<div class="itemTitle">{name}</div>' +
            '<div class="itemDesc">{[this.getAddress(values)]}</div>' +
         '</div>',
         // @formatter:on
         {
            getAddress : function(values)
            {
               return (values.address + ",<br/>" + values.city + ", " + values.state + ", " + values.country + ",</br>" + values.zipcode);
            }
         }),
         cls : 'address'
      },
      dataMap :
      {
         getImage :
         {
            setData : 'image'
         },
         getAddress :
         {
            setData : 'address'
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
   applyAddress : function(config)
   {
      return Ext.factory(Ext.apply(config,
      {
      }), Ext.Component, this.getAddress());
   },
   updateAddress : function(newAddress, oldAddress)
   {
      if(newAddress)
      {
         this.add(newAddress);
      }

      if(oldAddress)
      {
         this.remove(oldAddress);
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
                     case 'image':
                     case 'address':
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
         '<div class="mainPageItemWrapper x-hasbadge">',
            '<span class="x-badge round">{[this.getPoints(values)]}</span>',
            '<div class="photo">'+
               '<img src="{[this.getPhoto(values)]}" />'+
            '</div>',
            '<div class="photoName">{name}</div>',
         '</div>',
         // @formatter:on
         {
            getPoints : function(values)
            {
               return values['points'] + ' Points';
            },
            getPhoto : function(values)
            {
               return Ext.isEmpty(values.photo) ? Genesis.view.widgets.ChallengeMenuItem.getPhoto(values['type']) : values.photo.url;
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
   },
   statics :
   {
      getPhoto : function(type)
      {
         var photo_url = null;
         var value = type.value;
         switch (value)
         {
            case 'custom' :
               value = 'mystery';
            default :
               photo_url = Genesis.constants.getIconPath('mainicons', value);
               //console.debug("Icon Path [" + photo_url + "]");
               break;
         }
         return photo_url;
      }
   }
});
Ext.define('Genesis.view.widgets.RewardItem',
{
   extend : 'Ext.dataview.component.DataItem',
   requires : ['Ext.Button', 'Ext.XTemplate'],
   xtype : 'rewarditem',
   alias : 'widget.rewarditem',
   config :
   {
      background :
      {
         // Backgrond Image
         cls : 'rewardItem',
         tag : 'rewardItem',
         layout :
         {
            type : 'vbox',
            pack : 'center',
            align : 'stretch'
         },
         items : [
         {
            docked : 'top',
            xtype : 'component',
            tag : 'title',
            cls : 'title',
            //padding : '0.7 0.8',
            margin : '0 0 0.8 0',
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
            height : 210,
            flex : 1,
            tag : 'itemPhoto',
            cls : 'itemPhoto',
            tpl : Ext.create('Ext.XTemplate', '<div class="itemPoints">{[this.getPoints(values)]}</div>',
            {
               getPoints : function(values)
               {
                  return ((values['points'] > 0) ? values['points'] + '  Pts' : '');
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
                  var date = values['expiry_date'];
                  return ((!date) ? '' : 'Offer Expires ' + date);
               },
               getDisclaimer : function(values)
               {
                  return values['merchant']['prize_terms'] || 'Not valid with any other offer. No cash value. One coupon per customer per visit. Void where prohibited. Good at participating stores only.';
               },
               getPhoto : function(values)
               {
                  return values['merchant']['photo']['thumbnail_ios_small'].url;
               },
               getName : function(values)
               {
                  return values['merchant']['name'];
               }
            })
         }]
      },
      dataMap :
      {
         getBackground :
         {
            setData : 'background'
         }
      },
      listeners :
      {
         'painted' : function(c, eOpts)
         {
            var height = Ext.ComponentQuery.query('viewportview')[0].getActiveItem().renderElement.getHeight();
            //c.config.dataview.setHeight(height);
            //c.query('container[tag=rewardItem]')[0].setHeight(height);
            //c.setHeight(height);
         }
      }
   },
   applyBackground : function(config)
   {
      return Ext.factory(Ext.apply(config,
      {
      }), Ext.Container, this.getBackground());
   },
   updateBackground : function(newBackground, oldBackground)
   {
      if(newBackground)
      {
         this.add(newBackground);
      }

      if(oldBackground)
      {
         this.remove(oldBackground);
      }
   },
   setDataBackground : function(data)
   {
      var reward = data['reward'];
      var photo = Genesis.view.Prizes.getPhoto(reward['type']) || reward['photo']['thumbnail_ios_medium'];
      var info = this.query("component[tag=info]")[0];

      //var refresh = this.query("button[tag=refresh]")[0];
      //var verify = this.query("button[tag=verify]")[0];
      var itemPhoto = this.query("component[tag=itemPhoto]")[0];

      //
      // Hide Merchant Information if it's missing
      //
      if(data['merchant'])
      {
         //refresh.hide();
         //verify.hide();
         info.setData(data);
         info.show();
      }
      else
      {
         info.hide();
         //
         // Verification of Prizes/Rewards Mode
         //
         //refresh[reward['photo'] ? 'show' : 'hide']();
         //verify[reward['photo'] ? 'hide' : 'show']();
      }

      this.query("component[tag=title]")[0].setData(reward);
      itemPhoto.element.setStyle((Ext.isString(photo)) ?
      {
         'background-image' : 'url(' + photo + ')',
         'background-size' : ''
      } :
      {
         'background-image' : 'url(' + photo.url + ')',
         'background-size' : (photo.width) ? Genesis.fn.addUnit(photo.width) + ' ' + Genesis.fn.addUnit(photo.height) : ''
      });
      itemPhoto.setData((!data['expiry_date'] || (data['expiry_date'] == 'N/A')) ? reward :
      {
         points : null
      });
   },
   /**
    * Updates this container's child items, passing through the dataMap.
    * @param newRecord
    * @private
    */
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
                     case 'background':
                        //component[setterName](data);
                        me.setDataBackground(data);
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
Ext.define('Genesis.view.widgets.MerchantAccountPtsItem',
{
   extend : 'Ext.dataview.component.DataItem',
   requires : ['Ext.Button', 'Ext.XTemplate'],
   xtype : 'merchantaccountptsitem',
   alias : 'widget.merchantaccountptsitem',
   config :
   {
      layout : 'vbox',
      background :
      {
         // Backgrond Image
         cls : 'tbPanel',
         tag : 'background',
         flex : 1,
         items : [
         // Display Points
         {
            xtype : 'container',
            docked : 'bottom',
            cls : 'container',
            layout :
            {
               type : 'hbox',
               align : 'stretch'
            },
            defaults :
            {
               xtype : 'component'
            },
            items : [
            {
               docked : 'left',
               tag : 'visits',
               tpl : '{visits}',
               cls : 'visitsphoto'
            },
            {
               docked : 'right',
               tag : 'points',
               tpl : '{points}',
               cls : 'pointsphoto'
            }],
         }]
      },
      winnersCount :
      {
         // -----------------------------------------------------------------------
         // Prizes won by customers!
         // -----------------------------------------------------------------------
         tag : 'prizesWonPanel',
         xtype : 'component',
         cls : 'prizesWonPanel',
         tpl : Ext.create('Ext.XTemplate',
         // @formatter:off
         '<div class="prizeswonphoto">',
            '<div class="itemTitle">{[this.getTitle(values)]}</div>',
            '<div class="itemDesc">{[this.getDesc(values)]}</div>',
         '</div>',
         // @formatter:on
         {
            // Updated Automatically when the Customer\'s metadata is updated
            getTitle : function(values)
            {
               return 'Prizes won this month';
            },
            // Updated Automatically when the Customer\'s metadata is updated
            getDesc : function(values)
            {
               return (values['winners_count'] > 0) ? values['winners_count'] + ' Winners!' : 'Be our first winner!';
            }
         })
      },
      dataMap :
      {
         getBackground :
         {
            setData : 'background'
         },
         getWinnersCount :
         {
            setData : 'winnersCount'
         }
      }
   },
   applyBackground : function(config)
   {
      return Ext.factory(Ext.apply(config,
      {
      }), Ext.Container, this.getBackground());
   },
   updateBackground : function(newBackground, oldBackground)
   {
      if(newBackground)
      {
         this.add(newBackground);
      }

      if(oldBackground)
      {
         this.remove(oldBackground);
      }
   },
   setDataBackground : function(data)
   {
      var viewport = _application.getController('Viewport');
      var customer = viewport.getCustomer();
      var venue = viewport.getVenue();
      var venueId = venue.getId();
      var cvenue = viewport.getCheckinInfo().venue;

      //var crecord = cstore.getById(data.Merchant['merchant_id']);
      var bg = this.query('container[tag=background]')[0];

      // Update Background Photo
      bg.setHeight(Ext.Viewport.getSize().width);
      bg.setStyle(
      {
         'background-image' : 'url(' + data.Merchant['alt_photo']['url'] + ')'
      });

      //
      // Hide Points if we are not a customer of the Merchant
      //
      if(Ext.StoreMgr.get('CustomerStore').getById(customer.getId()))
      {
         bg.getItems().items[0].show();
         //Update Points
         var points = this.query('component[tag=points]')[0];
         points.setData(customer.getData());
         var visits = this.query('component[tag=visits]')[0];
         visits.setData(customer.getData());
      }
      else
      {
         bg.getItems().items[0].hide();
      }
   },
   applyWinnersCount : function(config)
   {
      return Ext.factory(Ext.apply(config,
      {
      }), Ext.Container, this.getWinnersCount());
   },
   updateWinnersCount : function(newWinnersCount, oldWinnersCount)
   {
      if(newWinnersCount)
      {
         this.add(newWinnersCount);
      }

      if(oldWinnersCount)
      {
         this.remove(oldWinnersCount);
      }
   },
   setDataWinnersCount : function(data)
   {
      var prizePanel = this.query('component[tag=prizesWonPanel]')[0];
      prizePanel.setData(data);
   },
   /**
    * Updates this container's child items, passing through the dataMap.
    * @param newRecord
    * @private
    */
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
                     //component[setterName](data);
                     case 'background':
                        me.setDataBackground(data);
                        break;
                     case 'winnersCount':
                        me.setDataWinnersCount(data);
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
Ext.define('Genesis.view.widgets.RewardsCheckoutItem',
{
   extend : 'Ext.dataview.component.DataItem',
   requires : ['Ext.Button', 'Ext.XTemplate'],
   //mixins : ['Genesis.view.widgets.Animation'],
   xtype : 'rewardscheckoutitem',
   alias : 'widget.rewardscheckoutitem',
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
         cls : 'qty',
         tpl : Ext.create('Ext.XTemplate', '{[this.getQty(values)]}',
         {
            getQty : function(values)
            {
               return values['qty'];
            }
         })
      },
      multiplier :
      {
         iconCls : 'delete_black2',
         disabled : true,
         iconMask : true,
         cls : 'plain'
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
         cls : 'itemDetails',
         tpl : Ext.create('Ext.XTemplate', '<div class="itemTitle">{[this.getTitle(values)]}</div>',
         //'<div class="itemDesc">{[this.getDesc(values)]}</div>',
         {
            getTitle : function(values)
            {
               return values['title'];
               //return values['type'].value.capitalize();
            },
            getDesc : function(values)
            {
               return values['title'];
            }
         })
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
         getPoints :
         {
            setData : 'points'
         },
         getQty :
         {
            setData : 'qty'
         }
      }
   },
   applyMultiplier : function(config)
   {
      return Ext.factory(Ext.apply(config,
      {
      }), Ext.Button, this.getMultiplier());
   },
   updateMultiplier : function(newMultiplier, oldMultiplier)
   {
      if(newMultiplier)
      {
         this.add(newMultiplier);
      }

      if(oldMultiplier)
      {
         this.remove(oldMultiplier);
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
                     case 'points':
                     case 'photo_url':
                     case 'title':
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
Ext.define('Genesis.model.frontend.MainPage',
{
   extend : 'Ext.data.Model',
   id : 'MainPage',
   config :
   {
      fields : ['name', 'photo_url', 'desc', 'pageCntlr', 'subFeature', 'route', 'hide'],
      proxy :
      {
         reader :
         {
            type : 'json',
            messageProperty : 'message',
            rootProperty : 'data'
         },
         type : 'ajax',
         disableCaching : false,
         url : Ext.Loader.getPath("Genesis") + "/store/" + ((!merchantMode) ? 'mainClientPage.json' : 'mainServerPage.json')
      }
   }
});
Ext.define('Genesis.model.UserProfile',
{
   extend : 'Ext.data.Model',
   alternateClassName : 'UserProfile',
   id : 'UserProfile',
   config :
   {
      belongsTo : [
      {
         model : 'Genesis.model.User',
         getterName : 'getUser',
         setterName : 'setUser'
      }],
      fields : ['gender', 'birthday', 'zipcode', 'created_ts', 'update_ts', 'user_id']
   },
   getUser : function()
   {

   }
});
Ext.define('Genesis.model.User',
{
   extend : 'Ext.data.Model',
   requires : ['Genesis.model.UserProfile'],
   alternateClassName : 'User',
   id : 'User',
   config :
   {
      hasOne : [
      {
         model : 'Genesis.model.UserProfile',
         associationKey : 'profile'
      }],
      proxy :
      {
         type : 'ajax',
         disableCaching : false,
         url : Ext.Loader.getPath("Genesis") + "/store/" + 'users.json',
         reader :
         {
            type : 'json'
         }
      },
      fields : ['user_id', 'name', 'email', 'facebook_id', 'photo_url', 'created_ts', 'update_ts', 'profile_id'],
      idProperty : 'user_id'
   }
});
Ext.define('Genesis.model.Merchant',
{
   extend : 'Ext.data.Model',
   alternateClassName : 'Merchant',
   id : 'Merchant',
   config :
   {
      fields : ['id', 'name', 'email', 'photo', 'alt_photo', 'account_first_name', 'account_last_name', 'phone', 'auth_code', 'qr_code', 'payment_account_id', 'created_ts', 'update_ts', 'type'],
      idProperty : 'id'
   }
});
Ext.define('Genesis.model.Challenge',
{
   extend : 'Ext.data.Model',
   id : 'Challenge',
   alternateClassName : 'Challenge',
   config :
   {
      belongsTo : [
      {
         model : 'Genesis.model.Merchant',
         getterName : 'getMerchant',
         setterName : 'setMerchant'
      }],
      fields : ['id', 'type', 'name', 'description',
      // Image associated with the Challenge
      'require_verif', 'data', 'points', 'created_ts', 'update_ts', 'photo', 'merchant_id', 'venue_id'],
      proxy :
      {
         type : 'ajax',
         disableCaching : false,
         reader :
         {
            type : 'json',
            messageProperty : 'message',
            rootProperty : 'data'
         }
      }
   },
   getMerchant : function()
   {

   },
   statics :
   {
      setGetChallengesURL : function()
      {
         this.getProxy().setActionMethods(
         {
            read : 'GET'
         });
         this.getProxy().setUrl((!debugMode) ? Genesis.constants.host + '/api/v1/challenges' : Ext.Loader.getPath("Genesis") + "/store/" + 'challenges.json');
      },
      setCompleteChallengeURL : function(id)
      {
         this.getProxy().setActionMethods(
         {
            read : 'POST'
         });
         this.getProxy().setUrl(Genesis.constants.host + '/api/v1/challenges/' + id + '/complete');
      },
      setCompleteReferralChallengeURL : function()
      {
         this.getProxy().setActionMethods(
         {
            read : 'POST'
         });
         this.getProxy().setUrl(Genesis.constants.host + '/api/v1/challenges/complete_referral');
      },
      setSendReferralsUrl : function(id)
      {
         this.getProxy().setActionMethods(
         {
            read : 'POST'
         });
         this.getProxy().setUrl(Genesis.constants.host + '/api/v1/challenges/' + id + '/start');
      }
   }
});
Ext.define('Genesis.model.Checkin',
{
   extend : 'Ext.data.Model',
   alternateClassName : 'Checkin',
   id : 'Checkin',
   config :
   {
      identifier : 'uuid',
      belongsTo : [
      {
         model : 'Genesis.model.User',
         getterName : 'getUser',
         setterName : 'setUser'
      },
      {
         model : 'Genesis.model.Venue',
         getterName : 'getVenue',
         setterName : 'setVenue'
      }],
      fields : ['id', 'time']
   }
});
Ext.define('Genesis.model.PurchaseReward',
{
   extend : 'Ext.data.Model',
   id : 'PurchaseReward',
   alternateClassName : 'PurchaseReward',
   config :
   {
      belongsTo : [
      {
         model : 'Genesis.model.Merchant',
         getterName : 'getMerchant',
         setterName : 'setMerchant'
      }],
      proxy :
      {
         type : 'ajax',
         disableCaching : false,
         writer :
         {
            type : 'json'
         },
         reader :
         {
            type : 'json',
            messageProperty : 'message',
            rootProperty : 'data'
         }
      },
      fields : ['id', 'title', 'points', 'type', 'photo', 'created_ts', 'update_ts',
      // Added in frontend of shopping cart tracking
      'qty']
   },
   getMerchant : function()
   {
   },
   statics :
   {
      setGetRewardsURL : function()
      {
         this.getProxy().setActionMethods(
         {
            read : 'GET'
         });
         this.getProxy().setUrl((!debugMode) ? Genesis.constants.host + '/api/v1/purchase_rewards' : Ext.Loader.getPath("Genesis") + "/store/" + 'rewards.json');
      }
   }
});
Ext.define('Genesis.model.CustomerReward',
{
   extend : 'Ext.data.Model',
   id : 'CustomerReward',
   alternateClassName : 'CustomerReward',
   config :
   {
      fields : ['id', 'title', 'points', 'type', 'photo'],
      idProperty : 'id',
      belongsTo : [
      {
         model : 'Genesis.model.Merchant',
         getterName : 'getMerchant',
         setterName : 'setMerchant'
      }],
      proxy :
      {
         type : 'ajax',
         disableCaching : false,
         writer :
         {
            type : 'json'
         },
         reader :
         {
            type : 'json',
            messageProperty : 'message',
            rootProperty : 'data'
         }
      }
   },
   getMerchant : function()
   {
   },
   statics :
   {
      setGetRedemptionsURL : function()
      {
         this.getProxy().setActionMethods(
         {
            read : 'GET'
         });
         this.getProxy().setUrl((!debugMode) ? Genesis.constants.host + '/api/v1/customer_rewards' : Ext.Loader.getPath("Genesis") + "/store/" + 'redemptions.json');
      },
      setRedeemPointsURL : function(id)
      {
         this.getProxy().setActionMethods(
         {
            read : 'POST'
         });
         this.getProxy().setUrl(Genesis.constants.host + '/api/v1/customer_rewards/' + id + '/redeem');
      }
   }
});
Ext.define('Genesis.model.EarnPrizeJSON',
{
   extend : 'Ext.data.Model',
   alternateClassName : 'EarnPrizeJSON',
   id : 'EarnPrizeJSON',
   config :
   {
      proxy :
      {
         type : 'localstorage',
         id : 'EarnPrizeJSON',
         writer :
         {
            type : 'json'
         },
         reader :
         {
            type : 'json'
         }
      },
      identifier : 'uuid',
      fields : ['json', 'id'],
      idProperty : 'id'
   }
});

Ext.define('Genesis.model.EarnPrize',
{
   extend : 'Ext.data.Model',
   id : 'EarnPrize',
   alternateClassName : 'EarnPrize',
   config :
   {
      fields : ['id',
      {
         name : 'expiry_date',
         type : 'date',
         convert : function(value, format)
         {
            var value = Date.parse(value, "yyyy-MM-dd");
            return (!value) ? "N/A" : Genesis.fn.convertDateNoTimeNoWeek.apply(this, arguments);
         }
      }],
      idProperty : 'id',
      belongsTo : [
      {
         model : 'Genesis.model.CustomerReward',
         associationKey : 'reward',
         name : 'reward',
         getterName : 'getCustomerReward',
         setterName : 'setCustomerReward'
      },
      {
         model : 'Genesis.model.Merchant',
         associationKey : 'merchant',
         name : 'merchant',
         getterName : 'getMerchant',
         setterName : 'setMerchant'
      },
      {
         model : 'Genesis.model.User',
         associationKey : 'user',
         name : 'user',
         getterName : 'getUser',
         setterName : 'setUser'
      }],
      proxy :
      {
         type : 'ajax',
         disableCaching : false,
         actionMethods :
         {
            create : 'POST',
            read : 'POST',
            update : 'POST',
            destroy : 'POST'
         },
         writer :
         {
            type : 'json'
         },
         reader :
         {
            type : 'json',
            messageProperty : 'message',
            rootProperty : 'data'
         }
      }
   },
   getUser : function()
   {
   },
   statics :
   {
      setEarnPrizeURL : function()
      {
         this.getProxy().setActionMethods(
         {
            read : 'POST'
         });
         this.getProxy().setUrl(Genesis.constants.host + '/api/v1/purchase_rewards/earn');
      },
      setRedeemPrizeURL : function(id)
      {
         this.getProxy().setActionMethods(
         {
            read : 'POST'
         });
         this.getProxy().setUrl(Genesis.constants.host + '/api/v1/earn_prizes/' + id + '/redeem');
      }
   }
});
Ext.define('Genesis.model.Venue',
{
   extend : 'Ext.data.Model',
   requires : ['Genesis.model.Challenge', 'Genesis.model.PurchaseReward', 'Genesis.model.CustomerReward'],
   alternateClassName : 'Venue',
   id : 'Venue',
   config :
   {
      fields : ['id', 'name', 'address', 'description', 'distance', 'city', 'state', 'country', 'zipcode', 'phone', 'website', 'latitude', 'longitude', 'created_ts', 'update_ts', 'type', 'merchant_id',
      // Used for Frontend sorting purposes
      'sort_id',
      // Winners Count for front end purposes
      'winners_count'],
      belongsTo : [
      {
         model : 'Genesis.model.Merchant',
         associationKey : 'merchant',
         getterName : 'getMerchant',
         setterName : 'setMerchant'
      }],
      hasMany : [
      {
         model : 'Genesis.model.Challenge',
         name : 'challenges'
      },
      {
         model : 'Genesis.model.PurchaseReward',
         name : 'purchaseReward'
      },
      {
         model : 'Genesis.model.CustomerReward',
         name : 'customerReward'
      }],
      proxy :
      {
         type : 'ajax',
         disableCaching : false,
         reader :
         {
            type : 'json',
            messageProperty : 'message',
            rootProperty : 'data'
         }
      },
      idProperty : 'id',
   },
   statics :
   {
      setFindNearestURL : function()
      {
         this.getProxy().setUrl((!debugMode) ? Genesis.constants.host + '/api/v1/venues/find_nearest' : Ext.Loader.getPath("Genesis") + "/store/" + 'checkinRecords.json');
      },
      setGetClosestVenueURL : function()
      {
         this.getProxy().setActionMethods(
         {
            read : 'GET'
         });
         this.getProxy().setUrl((!debugMode) ? Genesis.constants.host + '/api/v1/venues/find_closest' : Ext.Loader.getPath("Genesis") + "/store/" + 'customerCheckin.json');
      },
      setSharePhotoURL : function()
      {
         //
         // Not used because we need to use Multipart/form upload
         //
         this.getProxy().setActionMethods(
         {
            read : 'POST'
         });
         this.getProxy().setUrl((!debugMode) ? Genesis.constants.host + '/api/v1/venues/share_photo' : Ext.Loader.getPath("Genesis") + "/store/" + 'sharePhoto.json');
      }
   }

});
Ext.define('Genesis.model.EligibleReward',
{
   extend : 'Ext.data.Model',
   id : 'EligibleReward',
   alternateClassName : 'EligibleReward',
   config :
   {
      idProperty : 'id',
      fields : ['id', 'reward_id', 'reward_title', 'reward_text', 'reward_type', 'photo']
   }
});
Ext.define('Genesis.model.CustomerJSON',
{
   extend : 'Ext.data.Model',
   alternateClassName : 'CustomerJSON',
   id : 'CustomerJSON',
   config :
   {
      proxy :
      {
         type : 'localstorage',
         id : 'CustomerJSON',
         writer :
         {
            type : 'json'
         },
         reader :
         {
            type : 'json'
         }
      },
      identifier : 'uuid',
      fields : ['json', 'id'],
      idProperty : 'id'
   }
});

Ext.define('Genesis.model.Customer',
{
   extend : 'Ext.data.Model',
   requires : ['Genesis.model.Checkin'],
   alternateClassName : 'Customer',
   id : 'Customer',
   config :
   {
      belongsTo : [
      {
         model : 'Genesis.model.Merchant',
         associationKey : 'merchant',
         name : 'merchant',
         setterName : 'setMerchant',
         getterName : 'getMerchant',
      },
      {
         model : 'Genesis.model.User',
         associationKey : 'user',
         name : 'user',
         getterName : 'getUser',
         setterName : 'setUser'
      }],
      hasOne :
      {
         model : 'Genesis.model.Checkin',
         associationKey : 'last_check_in',
         name : 'last_check_in',
         // User to make sure no underscore
         getterName : 'getLastCheckin',
         setterName : 'setLastCheckin'
      },
      proxy :
      {
         type : 'ajax',
         disableCaching : false,
         writer :
         {
            type : 'json'
         },
         reader :
         {
            type : 'json',
            messageProperty : 'message',
            rootProperty : 'data'
         }
      },
      fields : ['points', 'visits', 'id'],
      idProperty : 'id'
   },
   getUser : function()
   {

   },
   statics :
   {
      isValidCustomer : function(customerId)
      {
         return customerId != 0;
      },
      updateCustomer : function(cOld, cNew)
      {
         var attrib;
         for (var i = 0; i < cOld.fields.length; i++)
         {
            attrib = cOld.fields.items[i].getName();
            cOld.set(attrib, cNew.get(attrib));
         }
         try
         {
            cOld.setLastCheckin(cNew.getLastCheckin());
         }
         catch (e)
         {
            cOld.setLastCheckin(Ext.create('Genesis.model.Checkin'));
         }
      },
      setFbLoginUrl : function()
      {
         this.getProxy().setActionMethods(
         {
            read : (!debugMode) ? 'POST' : 'GET'
         });
         this.getProxy().setUrl((!debugMode) ? Genesis.constants.host + '/api/v1/tokens/create_from_facebook' : Ext.Loader.getPath("Genesis") + "/store/" + 'customers.json');
      },
      setUpdateFbLoginUrl : function()
      {
         this.getProxy().setActionMethods(
         {
            read : 'POST'
         });
         this.getProxy().setUrl(Genesis.constants.host + '/api/v1/account/update_facebook_info');
      },
      setLoginUrl : function()
      {
         this.getProxy().setActionMethods(
         {
            read : (!debugMode) ? 'POST' : 'GET'
         });
         this.getProxy().setUrl((!debugMode) ? Genesis.constants.host + '/api/v1/tokens' : Ext.Loader.getPath("Genesis") + "/store/" + 'customers.json');
      },
      setLogoutUrl : function(auth_code)
      {
         this.getProxy().setActionMethods(
         {
            read : 'DELETE'
         });
         this.getProxy().setUrl(Genesis.constants.host + '/api/v1/tokens/' + auth_code);
      },
      setCreateAccountUrl : function()
      {
         this.getProxy().setActionMethods(
         {
            read : (!debugMode) ? 'POST' : 'GET'
         });
         this.getProxy().setUrl((!debugMode) ? Genesis.constants.host + '/api/v1/sign_up' : Ext.Loader.getPath("Genesis") + "/store/" + 'customers.json');
      },
      setVenueScanCheckinUrl : function()
      {
         this.setVenueCheckinUrl();
      },
      setVenueCheckinUrl : function()
      {
         this.getProxy().setActionMethods(
         {
            read : (!debugMode) ? 'POST' : 'GET'
         });
         this.getProxy().setUrl((!debugMode) ? Genesis.constants.host + '/api/v1/check_ins' : Ext.Loader.getPath("Genesis") + "/store/" + 'customerCheckin.json');
      },
      setVenueExploreUrl : function(venueId)
      {
         this.getProxy().setActionMethods(
         {
            read : 'GET'
         });
         this.getProxy().setUrl((!debugMode) ? Genesis.constants.host + '/api/v1/venues/' + venueId + '/explore' : Ext.Loader.getPath("Genesis") + "/store/" + 'customerCheckin.json');
      },
      setSendPtsXferUrl : function()
      {
         this.getProxy().setActionMethods(
         {
            read : 'POST'
         });
         this.getProxy().setUrl(Genesis.constants.host + '/api/v1/customers/transfer_points');
      },
      setRecvPtsXferUrl : function()
      {
         this.getProxy().setActionMethods(
         {
            read : 'POST'
         });
         this.getProxy().setUrl(Genesis.constants.host + '/api/v1/customers/receive_points');
      }
   }
});
Ext.define('Genesis.model.frontend.Account',
{
   extend : 'Ext.data.Model',
   alternateClassName : 'Account',
   id : 'Account',
   config :
   {
      fields : ['name', 'username', 'password'],
      validations : [
      {
         type : 'format',
         field : 'name',
         matcher : /^([a-zA-Z'-]+\s+){1,4}[a-zA-z'-]+$/
      },
      {
         type : 'email',
         field : 'username'
      },
      {
         type : 'length',
         field : 'password',
         min : 6
      }]
   }
});
Ext.define('Genesis.model.frontend.Signin',
{
   extend : 'Ext.data.Model',
   alternateClassName : 'Signin',
   id : 'Sigin',
   config :
   {
      fields : ['username', 'password'],
      validations : [
      {
         type : 'email',
         field : 'username'
      },
      {
         type : 'length',
         field : 'password',
         min : 6
      }]
   }
});
Ext.define('Genesis.view.ViewBase',
{
   extend : 'Ext.Container',
   xtype : 'viewbase',
   statics :
   {
      generateTitleBarConfig : function()
      {
         return (
            {
               xtype : 'titlebar',
               docked : 'top',
               cls : 'navigationBarTop',
               masked :
               {
                  xtype : 'mask',
                  transparent : true
               },
               defaults :
               {
                  iconMask : true
               }
            });
      }
   },
   config :
   {
      preRender : null
   },
   initialize : function()
   {
      this.callParent(arguments);
      this.setPreRender([]);
   },
   createView : function()
   {
      return (this.getPreRender().length == 0);
   },
   showView : function()
   {
      var titlebar = this.query('titlebar')[0];
      this.add(this.getPreRender());
      Ext.defer(titlebar.setMasked, 0.3 * 1000, titlebar, [false]);
   }
});
Ext.define('Genesis.view.CheckinExplore',
{
   extend : 'Genesis.view.ViewBase',
   requires : ['Ext.dataview.List', 'Ext.XTemplate', 'Ext.plugin.PullRefresh'],
   alias : 'widget.checkinexploreview',
   config :
   {
      layout : 'fit',
      merchant : null,
      items : [Ext.apply(Genesis.view.ViewBase.generateTitleBarConfig(),
      {
         title : 'Nearby Places',
         items : [
         {
            align : 'left',
            //ui : 'back',
            ui : 'normal',
            tag : 'back',
            text : 'Back'
         },
         {
            align : 'left',
            ui : 'normal',
            tag : 'close',
            text : 'Close'
         }]
      }),
      {
         docked : 'bottom',
         cls : 'checkInNow',
         tag : 'checkInNow',
         xtype : 'container',
         layout :
         {
            type : 'vbox',
            pack : 'center'
         },
         items : [
         {
            xtype : 'button',
            tag : 'checkInNow',
            text : 'CheckIn Now!'
         }]
      }]
   },
   createView : function()
   {
      if (!this.callParent(arguments))
      {
         return;
      }
      this.getPreRender().push(Ext.create('Ext.List',
      {
         xtype : 'list',
         store : 'CheckinExploreStore',
         scrollable : 'vertical',
         emptyText : ' ',
         cls : 'checkInExploreList',
         // @formatter:off
         itemTpl : Ext.create('Ext.XTemplate',
         '<div class="photo">'+
            '<img src="{[this.getPhoto(values)]}"/>'+
         '</div>' +
         '<div class="listItemDetailsWrapper">' +
            '<div class="itemDistance">{[this.getDistance(values)]}</div>' +
            '<div class="itemTitle">{name}</div>' +
            '<div class="itemDesc">{[this.getAddress(values)]}</div>' +
         '</div>',
         // @formatter:on
         {
            getPhoto : function(values)
            {
               return values.Merchant['photo']['thumbnail_ios_small'].url;
            },
            getAddress : function(values)
            {
               return (values['address'] + ",<br/>" + values['city'] + ", " + values['state'] + ", " + values['country'] + ",<br/>" + values.zipcode);
            },
            getDistance : function(values)
            {
               return values['distance'].toFixed(1) + 'km';
            }
         }),
         onItemDisclosure : Ext.emptyFn,
         plugins : [
         {
            xclass : 'Ext.plugin.PullRefresh',
            //pullRefreshText: 'Pull down for more new Tweets!',
            refreshFn : function(plugin)
            {
               var controller = _application.getController('Checkins');
               controller.fireEvent('exploreLoad',true);
            }
         }]
      }));
   },
   showView : function()
   {
      this.callParent(arguments);
      this.query('titlebar')[0].setMasked(false);

      // Hack to fix bug in Sencha Touch API
      var plugin = this.query('list')[0].getPlugins()[0];
      plugin.refreshFn = plugin.getRefreshFn();
   }
});
Ext.define('Genesis.view.Viewport',
{
   extend : 'Ext.Container',
   requires : ['Ext.fx.layout.Card'],
   xtype : 'viewportview',
   config :
   {
      autoDestroy : false,
      cls : 'viewport',
      layout :
      {
         type : 'card',
         animation :
         {
            type : 'slide',
            reverse : false,
            direction : 'left'
         }
      },
      fullscreen : true
   },
   // @private
   initialize : function()
   {
      this.callParent(arguments);
      /*
       this.on(
       {
       delegate : 'button',
       scope : this,
       tap : function(b, e, eOpts)
       {
       //
       // While Animating, disable ALL button responds in the NavigatorView
       //
       if(Ext.Animator.hasRunningAnimations(this.getNavigationBar().renderElement) ||
       Ext.Animator.hasRunningAnimations(this.getActiveItem().renderElement))
       {
       return false;
       }
       return true;
       }
       });
       */
   },
   /**
    * Animates to the supplied activeItem with a specified animation. Currently this only works
    * with a Card layout.  This passed animation will override any default animations on the
    * container, for a single card switch. The animation will be destroyed when complete.
    * @param {Object/Number} activeItem The item or item index to make active
    * @param {Object/Ext.fx.layout.Card} animation Card animation configuration or instance
    */
   animateActiveItem : function(activeItem, animation)
   {
      var layout = this.getLayout(), defaultAnimation;
      var oldActiveItem = this.getActiveItem();

      if (this.activeItemAnimation)
      {
         this.activeItemAnimation.destroy();
         console.debug("Destroying AnimateActiveItem ...");
      }
      this.activeItemAnimation = animation = new Ext.fx.layout.Card(animation);
      if (animation && layout.isCard)
      {
         animation.setLayout(layout);
         defaultAnimation = layout.getAnimation();
         if (defaultAnimation)
         {
            defaultAnimation.disable();
            animation.on('animationend', function()
            {
               defaultAnimation.enable();
               animation.destroy();
               delete this.activeItemAnimation;
               //
               // Delete oldActiveItem to save DOM memory
               //
               if (oldActiveItem)
               {
                  Ext.defer(function()
                  {
                     oldActiveItem.destroy();
                     //console.debug('Destroyed View [' + oldActiveItem._itemId + ']');
                  }, 0.1 * 1000, this);
               }
               //console.debug("Animation Complete");
               activeItem.showView();
            }, this);
         }
      }
      var rc = this.setActiveItem(activeItem);
      if (!layout.isCard)
      {
         //
         // Defer timeout is required to ensure that
         // if createView called is delayed, we will be scheduled behind it
         //
         Ext.defer(activeItem.showView, 1, activeItem);
      }
      return rc;
   },
});
Ext.define('Genesis.view.client.ChallengePage',
{
   extend : 'Genesis.view.ViewBase',
   requires : ['Ext.data.Store', 'Ext.dataview.DataView', 'Ext.XTemplate', 'Ext.Toolbar', 'Genesis.model.Challenge', 'Genesis.view.widgets.ChallengeMenuItem'],
   alias : 'widget.clientchallengepageview',
   config :
   {
      layout : 'fit',
      scrollable : undefined,
      items : [Ext.apply(Genesis.view.ViewBase.generateTitleBarConfig(),
      {
         title : 'Challenges',
         items : [
         {
            align : 'left',
            ui : 'normal',
            tag : 'close',
            text : 'Close'
         }]
      }),
      {
         docked : 'bottom',
         cls : 'checkInNow',
         tag : 'challengeContainer',
         hidden : true,
         xtype : 'container',
         layout :
         {
            type : 'vbox',
            pack : 'center'
         },
         items : [
         {
            xtype : 'button',
            iconCls : 'dochallenges',
            iconMask : true,
            tag : 'doit',
            text : 'Lets do it!'
         }]
      },
      {
         docked : 'bottom',
         xtype : 'container',
         tag : 'challengePageItemDescWrapper',
         cls : 'challengePageItemDescWrapper',
         layout :
         {
            type : 'vbox',
            align : 'stretch',
            pack : 'start'
         },
         defaults :
         {
            xtype : 'component'
         },
         items : [
         {
            flex : 1,
            cls : 'itemDesc',
            data :
            {
               description : 'Please Select a challenge to perform'
            },
            tpl : Ext.create('Ext.XTemplate', '{[this.getDesc(values)]}',
            {
               getDesc : function(values)
               {
                  return values['description']
               }
            })
         }
         /*,
          {
          cls : 'itemDescName',
          tpl : '{name}'
          }
          */]
      }]
   },
   takePhoto : function()
   {
      if (!this.photoAction)
      {
         this.photoAction = Ext.create('Ext.ActionSheet',
         {
            hideOnMaskTap : false,
            defaults :
            {
               defaultUnit : 'em',
               margin : '0 0 0.5 0',
               xtype : 'button',
               handler : Ext.emptyFn
            },
            items : [
            {
               text : 'Use Photo from Library',
               tag : 'library'
            },
            {
               text : 'Use Photo from Photo Album',
               tag : 'album'
            },
            {
               text : 'Take a Picture',
               tag : 'camera'
            },
            {
               margin : '0.5 0 0 0',
               text : 'Cancel',
               ui : 'cancel',
               scope : this,
               handler : function()
               {
                  this.photoAction.hide();
               }
            }]
         });
         Ext.Viewport.add(this.photoAction);
      }
      this.photoAction.show();
   },
   createView : function()
   {
      if (!this.callParent(arguments))
      {
         return;
      }

      var carousel;
      this.getPreRender().push( carousel = Ext.create('Ext.Carousel',
      {
         xtype : 'carousel',
         cls : 'challengePageItem shadows',
         direction : 'horizontal'
      }));

      var record = _application.getController('Viewport').getVenue();
      var venueId = record.getId();
      var items = record.challenges().getRange();

      if ((carousel.getInnerItems().length > 0) && //
      (carousel.getInnerItems()[0].getStore().getRange()[0].getId() == items[0].getId()))
      {
         // No need to update the Challenge Menu. Nothing changed.
         for (var i = 0; i < carousel.getInnerItems().length; i++)
         {
            carousel.getInnerItems()[i].deselectAll();
         }
      }
      else
      {
         carousel.removeAll(true);
         for (var i = 0; i < Math.ceil(items.length / 6); i++)
         {
            carousel.add(Ext.create('Ext.dataview.DataView',
            {
               xtype : 'dataview',
               cls : 'challengeMenuSelections',
               useComponents : true,
               defaultType : 'challengemenuitem',
               scrollable : undefined,
               store :
               {
                  model : 'Genesis.model.Challenge',
                  data : Ext.Array.pluck(items.slice(i * 6, ((i + 1) * 6)), 'data')
               }
            }));
         }
         if (carousel.getInnerItems().length > 0)
         {
            carousel.setActiveItem(0);
         }
         console.log("ChallengePage Icons Refreshed.");
      }
   }
});
Ext.define('Genesis.view.MainPage',
{
   extend : 'Ext.Carousel',
   requires : ['Ext.dataview.DataView', 'Ext.XTemplate'],
   alias : 'widget.mainpageview',
   config :
   {
      preRender : null,
      direction : 'horizontal',
      items : ( function()
         {
            var items = [
            {
               xtype : 'titlebar',
               docked : 'top',
               cls : 'navigationBarTop kbTitle',
               title : ' ',
               defaults :
               {
                  iconMask : true
               },
               items : [
               {
                  align : 'right',
                  tag : 'info',
                  iconCls : 'info',
                  destroy : function()
                  {
                     this.actions.destroy();
                     this.callParent(arguments);
                  },
                  handler : function()
                  {
                     if (!this.actions)
                     {
                        this.actions = Ext.create('Ext.ActionSheet',
                        {
                           defaultUnit : 'em',
                           padding : '1em',
                           hideOnMaskTap : false,
                           defaults :
                           {
                              xtype : 'button',
                              defaultUnit : 'em'
                           },
                           items : [
                           {
                              margin : '0 0 0.5 0',
                              text : 'Logout',
                              tag : 'logout'
                           },
                           {
                              margin : '0.5 0 0 0',
                              text : 'Cancel',
                              ui : 'cancel',
                              scope : this,
                              handler : function()
                              {
                                 this.actions.hide();
                              }
                           }]
                        });
                        Ext.Viewport.add(this.actions);
                     }
                     this.actions.show();
                  }
               }]
            }];
            if (!merchantMode)
            {
               items.push(
               {
                  docked : 'bottom',
                  cls : 'checkInNow',
                  tag : 'checkInNow',
                  xtype : 'container',
                  layout :
                  {
                     type : 'vbox',
                     pack : 'center'
                  },
                  items : [
                  {
                     xtype : 'button',
                     tag : 'checkInNow',
                     text : 'CheckIn Now!'
                  }]
               });
            }
            return items;
         }())
   },
   initialize : function()
   {
      this.setPreRender([]);
      this.callParent(arguments);
   },
   createView : function()
   {
      if (!Genesis.view.ViewBase.prototype.createView.apply(this, arguments))
      {
         return;
      }

      var carousel = this;
      var app = _application;
      var viewport = app.getController('Viewport');
      var vport = viewport.getViewport();
      var show = viewport.getCheckinInfo().venue != null;
      var items = Ext.StoreMgr.get('MainPageStore').getRange();
      var list = Ext.Array.clone(items);

      if (!carousel._listitems)
      {
         carousel._listitems = [];
      }

      if (!show)
      {
         Ext.Array.forEach(list, function(item, index, all)
         {
            switch (item.get('hide'))
            {
               case 'true' :
               {
                  Ext.Array.remove(items, item);
                  break;
               }
            }
         });
      }
      //
      // Only update if changes were made
      //
      if ((Ext.Array.difference(items, carousel._listitems).length > 0) || //
      (items.length != carousel._listitems.length))
      {
         carousel._listitems = items;
         carousel.removeAll(true);
         for (var i = 0; i < Math.ceil(items.length / 6); i++)
         {
            this.getPreRender().push(Ext.create('Ext.dataview.DataView',
            {
               xtype : 'dataview',
               cls : 'mainMenuSelections',
               scrollable : false,
               deferInitialRefresh : false,
               store :
               {
                  model : 'Genesis.model.frontend.MainPage',
                  data : Ext.Array.pluck(items.slice(i * 6, ((i + 1) * 6)), 'data')
               },
               itemTpl : Ext.create('Ext.XTemplate',
               // @formatter:off
               '<div class="mainPageItemWrapper x-hasbadge">',
                  '{[this.getPrizeCount(values)]}',
                  '<div class="photo"><img src="{[this.getPhoto(values.photo_url)]}" /></div>',
                  '<div class="photoName">{name}</div>',
               '</div>',
               // @formatter:on
               {
                  getType : function()
                  {
                     return values['pageCntlr'];
                  },
                  getPrizeCount : function(values)
                  {
                     var count = 0;
                     var type = values['pageCntlr'];
                     var pstore = Ext.StoreMgr.get('MerchantPrizeStore');
                     if (pstore)
                     {
                        count = pstore.getCount();
                     }
                     return ((type == 'Prizes') ? //
                     '<span data="' + type + '" ' + //
                     'class="x-badge round ' + ((count > 0) ? '' : 'x-item-hidden') + '">' + //
                     count + '</span>' : '');
                  },
                  getPhoto : function(photoURL)
                  {
                     return Ext.isEmpty(photoURL) ? Ext.BLANK_IMAGE_URL : photoURL;
                  }
               }),
               autoScroll : true
            }));
         }
         console.log("MainPage Icons Refreshed.");
      }
      else
      {
         //
         // Refresh All Badge Counts
         //
         var pstore = Ext.StoreMgr.get('MerchantPrizeStore');
         if (pstore)
         {
            var count = pstore.getCount();
            var dom = Ext.DomQuery.select('span[data=Prizes]',carousel.query('dataview')[0].element.dom)[0];
            if (count > 0)
            {
               dom.innerHTML = count;
               Ext.fly(dom).removeCls("x-item-hidden");
            }
            else
            {
               if (!dom.className.match(/x-item-hidden/))
               {
                  Ext.fly(dom).addCls("x-item-hidden");
               }
            }
         }
         if (carousel.getInnerItems().length > 0)
         {
            carousel.setActiveItem(0);
         }
         console.log("MainPage Icons Not changed.");
      }
      delete carousel._listitems;
   },
   showView : function()
   {
      this.add(this.getPreRender());
      this.query('titlebar')[0].setMasked(false);
   }
});
Ext.define('Genesis.view.LoginPage',
{
   extend : 'Genesis.view.ViewBase',
   requires : ['Ext.ActionSheet'],
   alias : 'widget.loginpageview',
   config :
   {
      cls : 'bgImage',
      scrollable : undefined
   },
   initialize : function()
   {
      var actions = Ext.create('Ext.ActionSheet',
      {
         modal : false,
         style :
         {
            background : 'transparent',
            border : 'none'
         },
         showAnimation : null,
         hideAnimation : null,
         defaultUnit : 'em',
         padding : '1em',
         hideOnMaskTap : false,
         defaults :
         {
            defaultUnit : 'em',
            xtype : 'button',
            margin : '0.5 0 0 0'
         },
         items : [
         {
            tag : 'facebook',
            ui : 'fbBlue',
            text : 'Facebook'
         },
         {
            tag : 'createAccount',
            ui : 'action',
            text : 'Create Account'
         },
         {
            tag : 'signIn',
            text : 'Sign In'
         }]
      });
      this.add(actions);
      this.callParent(arguments);
   },
   showView : Ext.emptyFn
});

Ext.define('Genesis.view.SignInPage',
{
   extend : 'Ext.form.Panel',
   alias : 'widget.signinpageview',
   requires : ['Ext.field.Email', 'Ext.field.Password'],
   config :
   {
      changeTitle : false,
      scrollable : 'vertical',
      items : [Ext.apply(Genesis.view.ViewBase.generateTitleBarConfig(),
      {
         title : 'Sign In',
         items : [
         {
            align : 'left',
            //ui : 'back',
            ui : 'normal',
            tag : 'back',
            text : 'Back'
         }]
      }),
      {
         xtype : 'fieldset',
         title : 'Login Credentials:',
         defaults :
         {
            required : true,
            labelAlign : 'top'
         },
         items : [
         {
            xtype : 'emailfield',
            name : 'username',
            label : 'User Name',
            clearIcon : true,
            placeHolder : 'Email Address'
         },
         {
            xtype : 'passwordfield',
            name : 'password',
            label : 'Password',
            clearIcon : false
         }]
      },
      {
         xtype : 'button',
         ui : 'login',
         tag : 'login',
         text : 'Sign In'
      }]
   },
   createView : Ext.emptyFn,
   showView : function()
   {
      var titlebar = this.query('titlebar')[0];
      Ext.defer(titlebar.setMasked, 0.3 * 1000, titlebar, [false]);
   }
});

Ext.define('Genesis.view.CreateAccountPage',
{
   extend : 'Ext.form.Panel',
   alias : 'widget.createaccountpageview',
   requires : ['Ext.field.Text', 'Ext.field.Email', 'Ext.field.Password'],
   config :
   {
      changeTitle : false,
      scrollable : 'vertical',
      items : [Ext.apply(Genesis.view.ViewBase.generateTitleBarConfig(),
      {
         title : 'Create Account',
         items : [
         {
            align : 'left',
            //ui : 'back',
            ui : 'normal',
            tag : 'back',
            text : 'Back'
         }]
      }),
      {
         xtype : 'fieldset',
         title : 'Account Credentials:',
         //instructions : 'Enter Username (email address) and Password',
         defaults :
         {
            required : true,
            labelAlign : 'top'
         },
         items : [
         {
            xtype : 'textfield',
            name : 'name',
            label : 'Full Name',
            clearIcon : true,
            placeHolder : 'John Smith'
         },
         {
            xtype : 'emailfield',
            name : 'username',
            label : 'User Name',
            clearIcon : true,
            placeHolder : 'Email Address'
         },
         {
            xtype : 'passwordfield',
            name : 'password',
            label : 'Password',
            clearIcon : false
         }]
      },
      {
         xtype : 'button',
         ui : 'createAccount',
         tag : 'createAccount',
         text : 'Create Account'
      }]
   },
   createView : Ext.emptyFn,
   showView : function()
   {
      var titlebar = this.query('titlebar')[0];
      Ext.defer(titlebar.setMasked, 0.3 * 1000, titlebar, [false]);
   }
});
Ext.define('Genesis.view.Accounts',
{
   extend : 'Genesis.view.ViewBase',
   requires : ['Ext.dataview.List', 'Ext.XTemplate', 'Ext.Toolbar'],
   alias : 'widget.accountsview',
   config :
   {
      cls : 'accountsMain',
      layout : 'fit',
      items : [Ext.apply(Genesis.view.ViewBase.generateTitleBarConfig(),
      {
         title : ' ',
         items : [
         {
            align : 'left',
            tag : 'back',
            //ui : 'back',
            ui : 'normal',
            text : 'Back'
         }]
      })]
   },
   createView : function()
   {
      if (!this.callParent(arguments))
      {
         return;
      }

      this.getPreRender().push(Ext.create('Ext.List',
      {
         xtype : 'list',
         store : 'CustomerStore',
         tag : 'accountsList',
         scrollable : 'vertical',
         cls : 'accountsList',
         deferEmptyText : false,
         emptyText : ' ',
         /*
          indexBar :
          {
          docked : 'right',
          overlay : true,
          alphabet : true,
          centered : false
          //letters : ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13']
          },
          */
         pinHeaders : false,
         grouped : true,
         itemTpl : Ext.create('Ext.XTemplate',
         // @formatter:off
         '<tpl if="this.isValidCustomer(values)">',
            '<div class="photo x-hasbadge">',
               '{[this.getPrizeCount(values)]}',
               '<img src="{[this.getPhoto(values)]}"/>',
            '</div>',
            '<div class="listItemDetailsWrapper">',
               '<div class="points">{[this.getPoints(values)]}</div>',
            '</div>',
         '</tpl>',
         // @formatter:on
         {
            isValidCustomer : function(values)
            {
               //return Customer.isValidCustomer(values['id']);
               return true;
            },
            getPrizeCount : function(values)
            {
               var count = 0;
               var type = values['pageCntlr'];
               var pstore = Ext.StoreMgr.get('MerchantPrizeStore');
               if (pstore)
               {
                  var collection = pstore.queryBy(function(record, id)
                  {
                     return (record.getMerchant().getId() == values.merchant['id'])
                  });
                  count = collection.getCount();
               }
               return ('<span class="x-badge round ' + //
               ((count > 0) ? '' : 'x-item-hidden') + '">' + count + '</span>');
            },
            getPhoto : function(values)
            {
               return values.merchant['photo']['thumbnail_ios_small'].url;
            },
            getPoints : function(values)
            {
               return values.points + ' Pts';
            }
         }),
         onItemDisclosure : Ext.emptyFn
      }));
   }
});
Ext.define('Genesis.view.MerchantAccount',
{
   extend : 'Genesis.view.ViewBase',
   requires : ['Ext.dataview.List', 'Ext.XTemplate', 'Ext.Toolbar', 'Ext.tab.Bar', 'Genesis.view.widgets.MerchantAccountPtsItem'],
   alias : 'widget.merchantaccountview',
   config :
   {
      tag : 'merchantMain',
      cls : 'merchantMain',
      scrollable : 'vertical',
      layout :
      {
         type : 'vbox',
         align : 'stretch',
         pack : 'start'
      },
      items : [Ext.apply(Genesis.view.ViewBase.generateTitleBarConfig(),
      {
         title : 'Venue Name',
         items : [
         {
            align : 'left',
            iconCls : 'maps',
            tag : 'mapBtn'
         },
         {
            align : 'right',
            hidden : true,
            tag : 'checkin',
            iconCls : 'checkin'
         }]
      })]
   },
   createView : function()
   {
      if (!this.callParent(arguments))
      {
         return;
      }
      // -----------------------------------------------------------------------
      // Merchant Photos and Customer Points
      // -----------------------------------------------------------------------
      this.getPreRender().push(Ext.create('Ext.dataview.DataView',
      {
         tag : 'tbPanel',
         xtype : 'dataview',
         store : 'MerchantRenderStore',
         useComponents : true,
         scrollable : false,
         defaultType : 'merchantaccountptsitem',
         defaultUnit : 'em',
         margin : '0 0 0.8 0'
      }));

      // -----------------------------------------------------------------------
      // What can I get ?
      // -----------------------------------------------------------------------
      if (this.renderFeed)
      {
         this.getPreRender().push(Ext.create('Ext.Container',
         {
            xtype : 'container',
            tag : 'feedContainer',
            layout :
            {
               type : 'vbox',
               align : 'stretch',
               pack : 'start'
            },
            items : [
            {
               xtype : 'toolbar',
               ui : 'dark',
               cls : 'feedPanelHdr',
               centered : false,
               items : [
               {
                  xtype : 'title',
                  title : 'What can I get?'
               },
               {
                  xtype : 'spacer'
               }]
            },
            {
               xtype : 'list',
               scrollable : false,
               ui : 'bottom-round',
               store : 'EligibleRewardsStore',
               emptyText : ' ',
               cls : 'feedPanel separator',
               itemTpl : Ext.create('Ext.XTemplate',
               // @formatter:off
               '<div class="photo">'+
                  '<img src="{[this.getPhoto(values)]}"/>'+
               '</div>',
               '<div class="listItemDetailsWrapper" style="{[this.getDisclose(values)]}">',
                  '<div class="itemTitle">{[this.getTitle(values)]}</div>',
                  '<div class="itemDesc">{[this.getDesc(values)]}</div>',
               '</div>',
                // @formatter:on
               {
                  getDisclose : function(values)
                  {
                     switch (values['reward_type'])
                     {
                        case 'vip' :
                        {
                           values['disclosure'] = false;
                           break;
                        }
                     }
                     return ((values['disclosure'] === false) ? 'padding-right:0;' : '');
                  },
                  getPhoto : function(values)
                  {
                     if (!values.photo)
                     {
                        return Genesis.view.client.Rewards.getPhoto(
                        {
                           value : values['reward_type']
                        });
                     }
                     return values.photo.url;
                  },
                  getTitle : function(values)
                  {
                     return values['reward_title'];
                  },
                  getDesc : function(values)
                  {
                     return values['reward_text'];
                  }
               }),
               onItemDisclosure : Ext.emptyFn
            }]
         }));
      };

      this.setPreRender(this.getPreRender().concat([
      // -----------------------------------------------------------------------
      // Merchant Description Panel
      // -----------------------------------------------------------------------
      Ext.create('Ext.Container',
      {
         xtype : 'container',
         tag : 'descContainer',
         layout :
         {
            type : 'vbox',
            align : 'stretch',
            pack : 'start'
         },
         items : [
         {
            xtype : 'toolbar',
            cls : 'descPanelHdr',
            ui : 'light',
            centered : false,
            items : [
            {
               xtype : 'title',
               title : 'About Us'
            },
            {
               xtype : 'spacer'
            }]
         },
         {
            xtype : 'dataview',
            store : 'MerchantRenderStore',
            scrollable : undefined,
            cls : 'descPanel separator',
            tag : 'descPanel',
            itemTpl : Ext.create('Ext.XTemplate', '{[this.getDesc(values)]}',
            {
               getDesc : function(values)
               {
                  return values['description'];
               }
            })
         }]
      }),
      // -----------------------------------------------------------------------
      // Toolbar
      // -----------------------------------------------------------------------
      Ext.create('Ext.TabBar',
      {
         docked : 'bottom',
         cls : 'navigationBarBottom',
         xtype : 'tabbar',
         ui : 'light',
         layout :
         {
            pack : 'justify',
            align : 'center'
         },
         scrollable :
         {
            direction : 'horizontal',
            indicators : false
         },
         defaults :
         {
            iconMask : true,
            iconAlign : 'top'
         },
         items : [
         //
         // Left side Buttons
         //
         {
            iconCls : 'home',
            tag : 'home',
            title : 'Home'
         },
         {
            iconCls : 'prizes',
            tag : 'prizes',
            badgeCls : 'x-badge round',
            badgeText : this.prizesCount,
            title : 'Prizes'
         },
         {
            iconCls : 'rewards',
            tag : 'rewards',
            title : 'Earn Pts'
         },
         //
         // Middle Button
         //
         {
            xtype : 'spacer'
         },
         {
            iconCls : 'challenges',
            tag : 'challenges',
            title : 'Challenges'
         },
         //
         // Right side Buttons
         //
         {
            xtype : 'spacer'
         },
         {
            iconCls : 'redeem',
            tag : 'redemption',
            title : 'Redeem'
         },
         {
            iconCls : 'tocheckedinmerch',
            tag : 'main',
            hidden : !this.showCheckinBtn,
            title : 'Main Menu'
         },
         {
            iconCls : 'explore',
            tag : 'browse',
            title : 'Explore'
         }]
      })]));
   },
   statics :
   {
   }
});
Ext.define('Genesis.view.MerchantDetails',
{
   extend : 'Genesis.view.ViewBase',
   requires : ['Ext.dataview.DataView', 'Ext.XTemplate', 'Ext.Map', 'Genesis.view.widgets.MerchantDetailsItem'],
   alias : 'widget.merchantdetailsview',
   config :
   {
      cls : 'merchantDetails',
      layout :
      {
         type : 'vbox',
         align : 'stretch',
         pack : 'start'
      },
      defaults :
      {
         cls : 'separator'
      },
      items : [Ext.apply(Genesis.view.ViewBase.generateTitleBarConfig(),
      {
         title : 'Venue Name',
         items : [
         {
            align : 'left',
            tag : 'back',
            //ui : 'back',
            ui : 'normal',
            text : 'Back'
         },
         {
            align : 'right',
            iconCls : 'share',
            tag : 'shareBtn',
            handler : function()
            {
               if (!this.actions)
               {
                  this.actions = Ext.create('Ext.ActionSheet',
                  {
                     hideOnMaskTap : false,
                     defaults :
                     {
                        defaultUnit : 'em',
                        margin : '0 0 0.5 0',
                        xtype : 'button'
                     },
                     items : [
                     {
                        text : 'Refer-A-Friend',
                        ui : 'action',
                        //iconCls : 'mail',
                        tag : 'emailShareBtn',
                        scope : this,
                        handler : function()
                        {
                           this.actions.hide();
                        }
                     },
                     {
                        text : 'Post on Facebook',
                        tag : 'fbShareBtn',
                        ui : 'fbBlue',
                        //iconCls : 'facebook',
                        scope : this,
                        handler : function()
                        {
                           this.actions.hide();
                        }
                     },
                     {
                        margin : '0.5 0 0 0',
                        text : 'Cancel',
                        iconMaskCls : 'dummymask',
                        ui : 'cancel',
                        scope : this,
                        handler : function()
                        {
                           this.actions.hide();
                        }
                     }]
                  });
                  Ext.Viewport.add(this.actions);
               }
               this.actions.show();
            }
         }]
      })]
   },
   createView : function()
   {
      if (!this.callParent(arguments))
      {
         return;
      }

      this.setPreRender(this.getPreRender().concat([Ext.create('Ext.dataview.DataView',
      {
         xtype : 'dataview',
         cls : 'separator',
         useComponents : true,
         defaultType : 'merchantdetailsitem',
         scrollable : undefined,
         store : 'MerchantRenderStore'
      }),
      /*
       Ext.create('Ext.Map,',
       {
       xtype : 'map',
       tag : 'map',
       mapOptions :
       {
       zoom : 15//,
       //mapTypeId : window.google.maps.MapTypeId.ROADMAP
       },
       useCurrentLocation : false,
       //store : 'VenueStore',
       flex : 1
       }),
       */
      Ext.create('Ext.Component',
      {
         xtype : 'component',
         tag : 'map',
         flex : 1,
         cls : 'separator_pad gmap',
         defaultUnit : 'em',
         listeners :
         {
            painted : function(map, eOpts)
            {
               cntlr = _application.getController('Merchants');
               var size = map.innerElement.getSize();
               map.setSize(size.width - (1 * 15), size.height - (1 * 12));
               var queryString = Ext.Object.toQueryString(Ext.apply(
               {
                  zoom : 15,
                  scale : window.devicePixelRatio,
                  maptype : 'roadmap',
                  sensor : false,
                  size : (size.width - (1 * 15)) + 'x' + (size.height - (1 * 12))
               }, cntlr.markerOptions));
               var string = Ext.String.urlAppend(cntlr.self.googleMapStaticUrl, queryString);
               map.setData(
               {
                  width : size.width - (1 * 15),
                  height : size.height - (1 * 12),
                  photo : string
               });
            }
         },
         tpl : Ext.create('Ext.XTemplate', '<img height="{height}" width="{width}" src="{photo}"/>')
      })]));
   }
});
Ext.define('Genesis.view.client.SettingsPage',
{
   extend : 'Ext.form.Panel',
   requires : ['Ext.dataview.List', 'Ext.XTemplate', 'Genesis.view.widgets.ListField'],
   alias : 'widget.clientsettingspageview',
   config :
   {
      scrollable : 'vertical',
      layout :
      {
         type : 'vbox',
         align : 'stretch',
         pack : 'start'
      },
      items : [Ext.apply(Genesis.view.ViewBase.generateTitleBarConfig(),
      {
         title : 'Settings',
         items : [
         {
            align : 'left',
            tag : 'back',
            //ui : 'back',
            ui : 'normal',
            text : 'Back'
         }]
      }),
      {
         xtype : 'fieldset',
         title : 'Login Profile',
         //instructions : 'Tell us all about yourself',
         items : [
         {
            xtype : 'listfield',
            iconCls : 'facebook',
            name : 'facebook',
            value : 'Facebook'
         }]
      },
      {
         xtype : 'fieldset',
         title : 'About Kickbak',
         //instructions : 'Tell us all about yourself',
         items : [
         {
            xtype : 'textfield',
            value : 'Version 1.0',
            readOnly : true
         },
         {
            xtype : 'listfield',
            name : 'terms',
            value : 'Terms & Conditions'
         },
         {
            xtype : 'listfield',
            name : 'privacy',
            value : 'Privacy'
         },
         {
            xtype : 'listfield',
            name : 'aboutus',
            value : 'About Us'
         }]
      }]
   },
   createView : Ext.emptyFn,
   showView : function()
   {
      var titlebar = this.query('titlebar')[0];
      Ext.defer(titlebar.setMasked, 0.3 * 1000, titlebar, [false]);
   }
});
Ext.define('Genesis.view.client.AccountsTransfer',
{
   extend : 'Genesis.view.ViewBase',
   requires : ['Ext.Toolbar', 'Ext.field.Text'],
   alias : 'widget.clientaccountstransferview',
   config :
   {
      layout : 'vbox',
      items : [Ext.apply(Genesis.view.ViewBase.generateTitleBarConfig(),
      {
         cls : 'navigationBarTop kbTitle',
         title : ' ',
         items : [
         {
            align : 'left',
            tag : 'back',
            //ui : 'back',
            ui : 'normal',
            text : 'Back'
         },
         {
            align : 'left',
            tag : 'close',
            ui : 'normal',
            text : 'Close'
         },
         {
            align : 'left',
            tag : 'calcClose',
            hidden : true,
            ui : 'normal',
            text : 'Close'
         }]
      })]
   },
   createView : function(num)
   {
      if (!this.callParent(arguments))
      {
         return;
      }

      this.setPreRender(this.getPreRender().concat([Ext.create('Ext.Container',
      {
         xtype : 'container',
         tag : 'accountsTransferMain',
         cls : 'accountsTransferMain',
         flex : 1,
         layout :
         {
            type : 'card',
            animation :
            {
               duration : 600,
               easing : 'ease-in-out',
               type : 'slide',
               direction : 'up'
            }
         },
         activeItem : num,
         defaults :
         {
            layout : 'fit'
         },
         items : [
         // -------------------------------------------------------------------
         // Accounts Transfer Mode (0)
         // -------------------------------------------------------------------
         {
            xtype : 'container',
            tag : 'accountsTransferMode',
            cls : 'accountsTransferMode',
            layout : 'vbox',
            items : [
            {
               docked : 'top',
               xtype : 'toolbar',
               centered : false,
               defaults :
               {
                  iconMask : true
               },
               items : [
               {
                  xtype : 'title',
                  title : 'Select Options :'
               },
               {
                  xtype : 'spacer',
                  align : 'right'
               }]
            },
            {
               xtype : 'list',
               scrollable : false,
               //ui : 'bottom-round',
               cls : 'transferPanel',
               data : [
               {
                  text : 'Transfer Out',
                  desc : '(Send it directly over to your friend\'s mobile phone)',
                  cls : 'sender',
                  tag : 'sender'
               },
               {
                  text : 'Email Transfer',
                  desc : '(Send it over to your friend\'s email account)',
                  cls : 'emailsender',
                  tag : 'emailsender'
               },
               {
                  text : 'Receive',
                  desc : '(Scan your friend\'s Transfer Code)',
                  cls : 'recipient',
                  tag : 'recipient'
               }],
               itemTpl : Ext.create('Ext.XTemplate',
               // @formatter:off
               '<div class="listItemDetailsWrapper" style="padding-right:0;">',
                  '<div class="itemTitle {[this.getCls(values)]}">{[this.getTitle(values)]}</div>',
                  '<div class="itemDesc {[this.getCls(values)]}">{[this.getDesc(values)]}</div>',
               '</div>',
               // @formatter:on
               {
                  getCls : function(values)
                  {
                     return values['cls'];
                  },
                  getDesc : function(values)
                  {
                     return values['desc'];
                  },
                  getTitle : function(values)
                  {
                     return values['text'];
                  }
               })
               //,onItemDisclosure : Ext.emptyFn
            }]
         },
         // -------------------------------------------------------------------
         // Accounts Calculator (1)
         // -------------------------------------------------------------------
         {
            xtype : 'container',
            tag : 'accountsMainCalculator',
            cls : 'accountsMainCalculator',
            items : [
            {
               docked : 'top',
               xtype : 'toolbar',
               centered : false,
               defaults :
               {
                  iconMask : true
               },
               items : [
               {
                  xtype : 'title',
                  title : 'Points to Send'
               },
               {
                  xtype : 'spacer',
                  align : 'right'
               }]
            },
            {
               docked : 'top',
               xtype : 'textfield',
               name : 'price',
               clearIcon : false,
               placeHolder : '0',
               readOnly : true,
               required : true,
               cls : 'accountsCalculator'
            },
            {
               xtype : 'container',
               layout : 'vbox',
               tag : 'dialpad',
               cls : 'dialpad',
               defaults :
               {
                  xtype : 'container',
                  layout : 'hbox',
                  flex : 1,
                  defaults :
                  {
                     xtype : 'button',
                     flex : 1
                  }
               },
               items : [
               {
                  items : [
                  {
                     text : '1'
                  },
                  {
                     text : '2'
                  },
                  {
                     text : '3'
                  }]
               },
               {
                  items : [
                  {
                     text : '4'
                  },
                  {
                     text : '5'
                  },
                  {
                     text : '6'
                  }]
               },
               {
                  items : [
                  {
                     text : '7'
                  },
                  {
                     text : '8'
                  },
                  {
                     text : '9'
                  }]
               },
               {
                  items : [
                  {
                     text : 'AC'
                  },
                  {
                     flex : 2,
                     text : '0'
                  }]
               }]
            },
            {
               docked : 'bottom',
               xtype : 'button',
               cls : 'separator',
               tag : 'showQrCode',
               text : 'Transfer Points!',
               ui : 'orange-large'
            }]
         },
         // -------------------------------------------------------------------
         // Show for QRCode Screen (2)
         // -------------------------------------------------------------------
         {
            xtype : 'container',
            tag : 'qrcodeContainer',
            cls : 'qrcodeContainer',
            items : [
            {
               docked : 'top',
               xtype : 'component',
               tag : 'title',
               width : '100%',
               cls : 'title',
               tpl : Ext.create('Ext.XTemplate', '{[this.getPoints(values)]}',
               {
                  getPoints : function(values)
                  {
                     return values['points'];
                  }
               })
            },
            {
               xtype : 'component',
               tag : 'qrcode',
               cls : 'qrcode'
            },
            {
               docked : 'bottom',
               xtype : 'button',
               cls : 'separator done',
               tag : 'done',
               text : 'Done!',
               ui : 'orange-large'
            }]
         }]
      })]));
      this.query('titlebar')[0].setMasked(false);
   },
   statics :
   {
   }
});
Ext.define('Genesis.view.client.Referrals',
{
   extend : 'Genesis.view.ViewBase',
   requires : ['Ext.Toolbar', 'Ext.field.Text'],
   alias : 'widget.clientreferralsview',
   config :
   {
      layout : 'vbox',
      items : [Ext.apply(Genesis.view.ViewBase.generateTitleBarConfig(),
      {
         title : 'Refer A Friend',
         items : [
         {
            align : 'left',
            tag : 'back',
            ui : 'normal',
            //ui : 'back',
            text : 'Back'
         }]
      })]
   },
   createView : function()
   {
      if (!this.callParent(arguments))
      {
         return;
      }

      this.getPreRender().push(Ext.create('Ext.Container',
      {
         xtype : 'container',
         tag : 'referralsMain',
         cls : 'referralsMain',
         flex : 1,
         layout :
         {
            type : 'card',
            animation :
            {
               duration : 600,
               easing : 'ease-in-out',
               type : 'slide',
               direction : 'down'
            }
         },
         activeItem : 0,
         defaults :
         {
            layout : 'fit'
         },
         items : [
         // -------------------------------------------------------------------
         // Referrals Mode (0)
         // -------------------------------------------------------------------
         {
            xtype : 'container',
            tag : 'referralsMode',
            cls : 'referralsMode',
            layout : 'vbox',
            items : [
            {
               docked : 'top',
               xtype : 'toolbar',
               centered : false,
               defaults :
               {
                  iconMask : true
               },
               items : [
               {
                  xtype : 'title',
                  title : 'Select Options :'
               },
               {
                  xtype : 'spacer',
                  align : 'right'
               }]
            },
            {
               xtype : 'list',
               scrollable : false,
               //ui : 'bottom-round',
               cls : 'referralsPanel',
               data : [
               {
                  text : 'Refer Now!',
                  desc : '(Refer your friends by sending directly over to their phone)',
                  cls : 'sender',
                  tag : 'sender'
               },
               {
                  text : 'Refer by E-Mail',
                  desc : '(Refer your friends by sending them an E-Mail)',
                  cls : 'emailsender',
                  tag : 'emailsender'
               }],
               itemTpl : Ext.create('Ext.XTemplate',
               // @formatter:off
               '<div class="listItemDetailsWrapper" style="padding-right:0;">',
                  '<div class="itemTitle {[this.getCls(values)]}">{[this.getTitle(values)]}</div>',
                  '<div class="itemDesc {[this.getCls(values)]}">{[this.getDesc(values)]}</div>',
               '</div>',
               // @formatter:on
               {
                  getCls : function(values)
                  {
                     return values['cls'];
                  },
                  getDesc : function(values)
                  {
                     return values['desc'];
                  },
                  getTitle : function(values)
                  {
                     return values['text'];
                  }
               })
               //,onItemDisclosure : Ext.emptyFn
            }]
         },
         // -------------------------------------------------------------------
         // Show for QRCode Screen (1)
         // -------------------------------------------------------------------
         {
            xtype : 'container',
            tag : 'qrcodeContainer',
            cls : 'qrcodeContainer',
            items : [
            {
               docked : 'top',
               xtype : 'component',
               tag : 'title',
               width : '100%',
               cls : 'subtitle',
               data :
               {
                  title : 'Referral Code'
               },
               tpl : '{title}'
            },
            {
               xtype : 'component',
               tag : 'qrcode',
               cls : 'qrcode'
            },
            {
               docked : 'bottom',
               xtype : 'button',
               cls : 'separator done',
               tag : 'done',
               text : 'Done!',
               ui : 'orange-large'
            }]
         }]
      }));
   },
   statics :
   {
   }
});
Ext.define('Genesis.view.client.UploadPhotosPage',
{
   extend : 'Genesis.view.ViewBase',
   requires : ['Ext.dataview.DataView', 'Ext.XTemplate', 'Ext.form.Panel', 'Ext.field.TextArea'],
   alias : 'widget.clientuploadphotospageview',
   scrollable : 'vertical',
   config :
   {
      cls : 'photoUploadPage',
      layout : 'vbox',
      items : [Ext.apply(Genesis.view.ViewBase.generateTitleBarConfig(),
      {
         title : 'Photo Upload',
         items : [
         {
            align : 'right',
            tag : 'post',
            text : 'Post'
         }]
      })]
   },
   showView : function()
   {
      this.callParent(arguments);

      console.debug("Rendering [" + this.metaData['photo_url'] + "]");
      this.query('container[tag=background]')[0].element.dom.style.cssText += 'background-image:url(' + this.metaData['photo_url'] + ');'
      delete this.metaData;
   },
   createView : function()
   {
      this.setPreRender(this.getPreRender().concat([
      // Uploaded Image
      photo = Ext.create('Ext.Container',
      {
         flex : 1,
         width:'100%',
         xtype : 'container',
         tag : 'background',
         cls : 'background'
      }),
      // Display Comment
      Ext.create('Ext.field.TextArea',
      {
         xtype : 'textareafield',
         bottom : 0,
         left : 0,
         right : 0,
         name : 'desc',
         tag : 'desc',
         cls : 'desc',
         autoComplete : true,
         defaultUnit : 'em',
         minHeight : '2',
         autoCorrect : true,
         autoCapitalize : true,
         maxLength : 256,
         maxRows : 4,
         placeHolder : 'Please enter your photo description',
         clearIcon : false
      })]));
   }
});
Ext.define('Genesis.view.client.Rewards',
{
   extend : 'Genesis.view.ViewBase',
   requires : ['Ext.Toolbar'],
   alias : 'widget.clientrewardsview',
   config :
   {
      layout : 'fit',
      items : [Ext.apply(Genesis.view.ViewBase.generateTitleBarConfig(),
      {
         title : 'Earn Rewards'
      }),
      {
         xtype : 'component',
         tag : 'prizeCheck',
         cls : 'prizeCheck',
         // -------------------------------------------------------------------
         // Checking for Prizes Screen
         // -------------------------------------------------------------------
         data :
         {
         },
         tpl :
         // @formatter:off
      '<div class="rouletteBg"></div>'+
      '<div class="rouletteTable"></div>'+
      '<div class="rouletteBall"></div>',
      // @formatter:on
      }]
   },
   statics :
   {
      getPhoto : function(type)
      {
         var photo_url = null;
         switch (type.value)
         {
            case 'vip' :
               photo_url = Genesis.constants.getIconPath('miscicons', type.value);
               break;
            default :
               photo_url = Genesis.constants.getIconPath('fooditems', type.value);
               //console.debug("Icon Path [" + photo_url + "]");
               break;
         }
         return photo_url;
      }
   }
});
Ext.define('Genesis.view.client.Redemptions',
{
   extend : 'Genesis.view.ViewBase',
   requires : ['Ext.dataview.List', 'Ext.XTemplate', 'Ext.Toolbar', 'Genesis.view.widgets.RedemptionsPtsItem'],
   alias : 'widget.clientredemptionsview',
   config :
   {
      scrollable : 'vertical',
      cls : 'redemptionsMain',
      layout : 'vbox',
      items : [Ext.apply(Genesis.view.ViewBase.generateTitleBarConfig(),
      {
         title : 'Redemptions',
         items : [
         {
            align : 'left',
            tag : 'close',
            ui : 'normal',
            text : 'Close'
         }]
      })]
   },
   createView : function()
   {
      if (!this.callParent(arguments))
      {
         return;
      }
      // ------------------------------------------------------------------------
      // Redemptions Points Earned Panel
      // ------------------------------------------------------------------------
      this.setPreRender(this.getPreRender().concat([Ext.create('Ext.Toolbar',
      {
         xtype : 'toolbar',
         ui : 'light',
         cls : 'ptsEarnPanelHdr',
         centered : false,
         items : [
         {
            xtype : 'title',
            title : 'Points Earned'
         },
         {
            xtype : 'spacer'
         }]
      }), Ext.create('Ext.dataview.DataView',
      {
         cls : 'ptsEarnPanel separator',
         tag : 'ptsEarnPanel',
         xtype : 'dataview',
         useComponents : true,
         scrollable : undefined,
         defaultType : 'redemptionsptsitem',
         store : 'RedemptionRenderCStore'
      }),
      // ------------------------------------------------------------------------
      // Redemptions Available Panel
      // ------------------------------------------------------------------------
      Ext.create('Ext.Toolbar',
      {
         xtype : 'toolbar',
         cls : 'ptsEarnPanelHdr',
         ui : 'light',
         centered : false,
         items : [
         {
            xtype : 'title',
            title : 'Redemptions Available (Select an item below)'
         },
         {
            xtype : 'spacer'
         }]
      }),
      // ------------------------------------------------------------------------
      // Redemptions
      // ------------------------------------------------------------------------
      Ext.create('Ext.List',
      {
         xtype : 'list',
         scrollable : undefined,
         ui : 'bottom-round',
         store : 'RedemptionsStore',
         cls : 'redemptionsList separator_pad',
         tag : 'redemptionsList',
         /*
         indexBar :
         {
         docked : 'right',
         overlay : true,
         alphabet : false,
         centered : false,
         letters : ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13']
         },
         */
         //pinHeaders : true,
         grouped : true,
         // @formatter:off
         itemTpl : Ext.create('Ext.XTemplate',
         '<div class="photo">'+
            '<img src="{[this.getPhoto(values)]}"/>'+
         '</div>',
         '<div class="listItemDetailsWrapper">',
            '<div class="itemTitle">{[this.getTitle(values)]}</div>',
         '</div>',
         // @formatter:on
         {
            getPhoto : function(values)
            {
               if (!values.photo)
               {
                  return Genesis.view.client.Redemptions.getPhoto(values['type']);
               }
               return values.photo.url;
            },
            getTitle : function(values)
            {
               return values['title'];
            }
         }),
         onItemDisclosure : Ext.emptyFn
      })]));
   },
   statics :
   {
      getPhoto : function(type)
      {
         var photo_url = null;
         switch (type.value)
         {
            default :
               photo_url = Genesis.constants.getIconPath('fooditems', type.value);
               //console.debug("Icon Path [" + photo_url + "]");
               break;
         }
         return photo_url;
      }
   }
});
Ext.define('Genesis.view.Prizes',
{
   extend : 'Genesis.view.ViewBase',
   requires : ['Ext.XTemplate', 'Ext.Carousel', 'Genesis.view.widgets.RewardItem'],
   alias : 'widget.prizesview',
   config :
   {
      scrollable : undefined,
      fullscreen : true,
      cls : 'prizesMain',
      layout : 'card',
      items : [Ext.apply(Genesis.view.ViewBase.generateTitleBarConfig(),
      {
         title : 'Prizes',
         items : [
         {
            align : 'left',
            tag : 'close',
            ui : 'normal',
            text : 'Close'
         },
         {
            align : 'left',
            tag : 'back',
            //ui : 'back',
            ui : 'normal',
            text : 'Back'
         },
         {
            align : 'right',
            tag : 'redeem',
            text : 'Redeem'
         },
         {
            align : 'right',
            hidden : true,
            tag : 'done',
            text : 'Done'
         }]
      })]
   },
   createView : function()
   {
      switch (this.config.tag)
      {
         case 'userPrizes' :
         {
            this.onUserCreateView();
            break;
         }
         case 'merchantPrizes' :
         {
            this.onMerchantCreateView();
            break;
         }
      }
   },
   onUserCreateView : function()
   {
      var view = this;
      var prizes = Ext.StoreMgr.get('MerchantPrizeStore').getRange();

      if (prizes.length == 0)
      {
         //view.removeAll();
         this.getPreRender().push(Ext.create('Ext.Component',
         {
            tag : 'rewardPanel',
            cls : 'noprizes',
            xtype : 'component',
            scrollable : false,
            defaultUnit : 'em',
            margin : '0 0 0.8 0'
         }));
         console.log("UserPrize View - No Prizes found.");
      }
      else
      {
         // Either a carousel or a empty view
         var container = view.getInnerItems()[0];
         if (container && container.isXType('carousel', true))
         {
            //
            // User Prizes have been loaded previously, no need to refresh!
            //
            console.log("UserPrize View - do not need to be updated.");
         }
         else
         {
            var items = [];
            container = view.getInnerItems()[0];
            if (!container)
            {
               this.getPreRender().push( container = Ext.create('Ext.Carousel',
               {
                  xtype : 'carousel',
                  scrollable : undefined
               }));
            }
            for (var i = 0; i < prizes.length; i++)
            {
               items.push(Ext.create('Ext.dataview.DataView',
               {
                  tag : 'rewardPanel',
                  xtype : 'dataview',
                  store :
                  {
                     model : 'Genesis.model.EarnPrize',
                     autoLoad : false,
                     data : prizes[i]
                  },
                  useComponents : true,
                  scrollable : false,
                  defaultType : 'rewarditem',
                  defaultUnit : 'em',
                  margin : '0 0 0.8 0'
               }));
            }
            container.add(items);

            console.log("UserPrize View - Found " + prizes.length + " Prizes needed to update.");
         }
      }
   },
   onMerchantCreateView : function()
   {
      var view = this;
      var viewport = _application.getController('Viewport');
      var merchantId = (viewport.getVenue()) ? viewport.getVenue().getMerchant().getId() : 0;
      var container;
      var prizesList = [];

      //
      // List all the prizes won by the Customer
      //
      var prizes = Ext.StoreMgr.get('MerchantPrizeStore').getRange();
      if (prizes.length > 0)
      {
         for (var i = 0; i < prizes.length; i++)
         {
            //
            // Only show prizes that matches the currently loaded Merchant Data
            //
            if (prizes[i].getMerchant().getId() != merchantId)
            {
               continue;
            }

            prizesList.push(prizes[i]);
         }
      }

      if (prizesList.length == 0)
      {
         //view.removeAll();
         this.getPreRender().push(Ext.create('Ext.Component',
         {
            tag : 'rewardPanel',
            cls : 'noprizes',
            xtype : 'component',
            scrollable : false,
            defaultUnit : 'em',
            margin : '0 0 0.8 0'
         }));
         console.log("MerchantPrize View - No Prizes found.");
      }
      else
      {
         // Either a carousel or a empty view
         var container = view.getInnerItems()[0];
         if (!container)
         {
            this.getPreRender().push( container = Ext.create('Ext.Carousel',
            {
               xtype : 'carousel',
               scrollable : undefined
            }));
         }
         if ((container && container.isXType('carousel', true) && container.query('dataview')[0] &&
         // First item in the carousel
         container.query('dataview')[0].getStore().first().getMerchant().getId() == merchantId))
         {
            //
            // Do Not need to change anything if there are already loaded from before
            //
            console.log("MerchantPrize View - do not need to be updated.");
         }
         else
         {
            //
            // Create Prizes Screen from scratch
            //
            //container = view.getInnerItems()[0];
            var items = [];
            for (var i = 0; i < prizesList.length; i++)
            {
               items.push(Ext.create('Ext.dataview.DataView',
               {
                  tag : 'rewardPanel',
                  xtype : 'dataview',
                  store :
                  {
                     model : 'Genesis.model.EarnPrize',
                     autoLoad : false,
                     data : prizesList[i]
                  },
                  useComponents : true,
                  scrollable : false,
                  defaultType : 'rewarditem',
                  defaultUnit : 'em',
                  margin : '0 0 0.8 0'
               }));
            }
            container.add(items);

            console.log("MerchantPrize View - Found " + prizesList.length + " Prizes needed to update.");
         }
      }
   },
   statics :
   {
      getPhoto : function(type)
      {
         var photo_url = null;
         switch (type.value)
         {
            case 'earn_points':
               break;
            default :
               photo_url = Genesis.constants.getIconPath('prizewon', type.value);
               break;
         }
         return photo_url;
      }
   }
});

Ext.define('Genesis.view.ShowPrize',
{
   extend : 'Genesis.view.ViewBase',
   requires : ['Ext.XTemplate', 'Ext.Carousel', 'Genesis.view.widgets.RewardItem'],
   alias : 'widget.showprizeview',
   config :
   {
      scrollable : false,
      fullscreen : true,
      cls : 'prizesMain',
      layout : 'fit',
      items : [
      {
         xtype : 'titlebar',
         docked : 'top',
         cls : 'navigationBarTop',
         title : 'Prizes',
         defaults :
         {
            iconMask : true
         },
         items : [
         {
            align : 'left',
            tag : 'close',
            ui : 'normal',
            text : 'Close'
         },
         {
            align : 'left',
            tag : 'back',
            //ui : 'back',
            ui : 'normal',
            text : 'Back'
         },
         {
            align : 'right',
            tag : 'redeem',
            text : 'Redeem'
         },
         {
            align : 'right',
            hidden : true,
            tag : 'done',
            text : 'Done'
         }]
      },
      {
         docked : 'bottom',
         xtype : 'button',
         margin : '0.8 0.7',
         defaultUnit : 'em',
         tag : 'refresh',
         text : 'Refresh',
         ui : 'orange-large'
      },
      {
         docked : 'bottom',
         margin : '0.8 0.7',
         defaultUnit : 'em',
         xtype : 'button',
         cls : 'separator',
         tag : 'verify',
         text : 'Verified!',
         ui : 'orange-large'
      }]
   },
   createView : function()
   {
      this.getPreRender().push(Ext.create('Ext.dataview.DataView',
      {
         tag : 'rewardPanel',
         xtype : 'dataview',
         store :
         {
            model : 'Genesis.model.EarnPrize',
            autoLoad : false,
            data : this.showPrize
         },
         useComponents : true,
         scrollable : false,
         defaultType : 'rewarditem',
         defaultUnit : 'em',
         margin : '0 0 0.8 0'
      }));
      delete this.showPrize;
   }
});
Ext.define('Genesis.controller.ControllerBase',
{
   extend : 'Ext.app.Controller',
   requires : ['Ext.data.Store', 'Ext.util.Geolocation'],
   config :
   {
      animationMode : null
   },
   checkinMsg : 'Checking in ...',
   loadingScannerMsg : 'Loading Scanner ...',
   loadingMsg : 'Loading ...',
   genQRCodeMsg : 'Generating QRCode ...',
   retrieveAuthModeMsg : 'Retrieving Authorization Code from Server ...',
   noCodeScannedMsg : 'No Authorization Code was Scanned!',
   geoLocationErrorMsg : 'Cannot locate your current location. Try again or enable permission to do so!',
   geoLocationTimeoutErrorMsg : 'Cannot locate your current location. Try again or enable permission to do so!',
   geoLocationPermissionErrorMsg : 'No permission to location current location. Please enable permission to do so!',
   missingVenueInfoMsg : 'Error loading Venue information.',
   showToServerMsg : 'Show this to your server before proceeding.',
   errProcQRCodeMsg : 'Error Processing Authentication Code',
   cameraAccessMsg : 'Accessing your Camera Phone ...',
   updatingServerMsg : 'Updating Server ...',
   referredByFriendsMsg : function(merchatName)
   {
      return 'Have you been referred ' + Genesis.constants.addCRLF() + //
      'by a friend to visit' + Genesis.constants.addCRLF() + //
      merchatName + '?';
   },
   recvReferralb4VisitMsg : function(name)
   {
      return 'Claim your reward points by becoming a customer at ' + Genesis.constants.addCRLF() + name + '!';
   },
   showScreenTimeoutExpireMsg : function(duration)
   {
      return duration + ' are up! Press OK to confirm.';
   },
   showScreenTimeoutMsg : function(duration)
   {
      return 'You have ' + duration + ' to show this screen to a employee before it disappears!';
   },
   uploadFbMsg : 'Uploading to Facebook ...',
   uploadServerMsg : 'Uploading to server ...',
   statics :
   {
      animationMode :
      {
         'slide' :
         {
            type : 'slide',
            direction : 'left'
         },
         'slideUp' :
         {
            type : 'slide',
            direction : 'up'
         },
         'flip' :
         {
            type : 'flip'
         },
         'fade' :
         {
            type : 'fade'
         }
      },
      playSoundFile : function(sound_file, successCallback, failCallback)
      {
         if (Genesis.constants.isNative())
         {
            switch (sound_file['type'])
            {
               case 'FX' :
               case 'Audio' :
                  LowLatencyAudio.play(sound_file['name'], successCallback || Ext.emptyFn, failCallback || Ext.emptyFn);
                  break;
               case 'Media' :
                  sound_file['successCallback'] = successCallback || Ext.emptyFn;
                  sound_file['name'].play();
                  break;
            }
         }
         else
         {
            sound_file['successCallback'] = successCallback || Ext.emptyFn;
            Ext.get(sound_file['name']).dom.play();
         }
      },
      stopSoundFile : function(sound_file)
      {
         if (Genesis.constants.isNative())
         {
            LowLatencyAudio.stop(sound_file['name']);
         }
         else
         {
            var sound = Ext.get(sound_file['name']).dom;
            sound.pause();
            sound.currentTime = 0;
         }
      },
      genQRCodeFromParams : function(params, encryptOnly)
      {
         var me = this;
         var encrypted;
         var seed = function()
         {
            return Math.random().toFixed(16);
         }
         //
         // Show QRCode
         //
         // GibberishAES.enc(string, password)
         // Defaults to 256 bit encryption
         GibberishAES.size(256);
         var keys = Genesis.constants.getPrivKey();
         var date;
         for (key in keys)
         {
            try
            {
               date = new Date().addHours(3);
               encrypted = GibberishAES.enc(Ext.encode(Ext.applyIf(
               {
                  "expiry_ts" : date.getTime()
               }, params)), keys[key]);
            }
            catch (e)
            {
            }
            break;
         }
         console.log('\n' + //
         "Encrypted Code Length: " + encrypted.length + '\n' + //
         'Encrypted Code [' + encrypted + ']' + '\n' + //
         'Expiry Date: [' + date + ']');

         return (encryptOnly) ? [encrypted, 0, 0] : me.genQRCode(encrypted);
      },
      genQRCode : function(text, dotsize, QRCodeVersion)
      {
         dotsize = dotsize || 4;
         QRCodeVersion = QRCodeVersion || 8;

         // size of box drawn on canvas
         var padding = 0;
         // 1-40 see http://www.denso-wave.com/qrcode/qrgene2-e.html

         // QR Code Error Correction Capability
         // Higher levels improves error correction capability while decreasing the amount of data QR Code size.
         // QRErrorCorrectLevel.L (5%) QRErrorCorrectLevel.M (15%) QRErrorCorrectLevel.Q (25%) QRErrorCorrectLevel.H (30%)
         // eg. L can survive approx 5% damage...etc.
         var qr = QRCode(QRCodeVersion, 'L');
         qr.addData(text);
         qr.make();
         var base64 = qr.createBase64(dotsize, padding);
         console.log("QR Code Minimum Size = [" + base64[1] + "x" + base64[1] + "]");

         return [base64[0], base64[1], base64[1]];
      },
      genQRCodeInlineImg : function(text, dotsize, QRCodeVersion)
      {
         dotsize = dotsize || 4;
         QRCodeVersion = QRCodeVersion || 8;
         var padding = 0;
         var qr = QRCode(QRCodeVersion, 'L');

         qr.addData(text);
         qr.make();

         var html = qr.createTableTag(dotsize, padding);

         return html;
      }
   },
   init : function()
   {
      this.callParent(arguments);

      this.on(
      {
         scope : this,
         'scannedqrcode' : this.onScannedQRcode,
         'locationupdate' : this.onLocationUpdate,
         'openpage' : this.onOpenPage
      });

      //
      // Forward all locally generated page navigation events to viewport
      //
      this.setAnimationMode(this.self.superclass.self.animationMode['slide']);

      //
      // Prevent Recursion
      //
      var viewport = this.getViewPortCntlr();
      if (viewport != this)
      {
         viewport.relayEvents(this, ['pushview', 'popview', 'silentpopview']);
         viewport.on('animationCompleted', this.onAnimationCompleted, this);
      }
   },
   getViewPortCntlr : function()
   {
      return this.getApplication().getController('Viewport');
   },
   getViewport : function()
   {
      return this.getViewPortCntlr().getView();
   },
   getMainPage : Ext.emptyFn,
   openMainPage : Ext.emptyFn,
   openPage : Ext.emptyFn,
   goToMain : function()
   {
      var me = this;
      var viewport = me.getViewPortCntlr();
      viewport.setLoggedIn(true);
      me.resetView();
      me.redirectTo('main');
      //me.fireEvent('openpage', 'MainPage', 'main', null);
      console.log("LoggedIn, Going back to Main Page ...");
   },
   isOpenAllowed : function()
   {
      return "Cannot Open Folder";
   },
   // --------------------------------------------------------------------------
   // Event Handlers
   // --------------------------------------------------------------------------
   onScannedQRcode : Ext.emptyFn,
   onLocationUpdate : Ext.emptyFn,
   onOpenPage : function(feature, subFeature, cb, eOpts, eInfo)
   {
      if ((appName == 'GetKickBak') && !Ext.device.Connection.isOnline() && (subFeature != 'login'))
      {
         Ext.device.Notification.show(
         {
            title : 'Network Error',
            message : 'You have lost internet connectivity'
         });
         return;
      }

      var app = this.getApplication();
      var controller = app.getController(feature);
      if (!subFeature)
      {
         controller.openMainPage();
      }
      else
      {
         controller.openPage(subFeature, cb);
      }
   },
   // --------------------------------------------------------------------------
   // Utility Functions
   // --------------------------------------------------------------------------
   updateRewards : function(metaData)
   {
      var me = this;
      try
      {
         //
         // Update Customer Rewards (Redemptions)
         //
         var rewards = metaData['rewards'];
         if (rewards)
         {
            var viewport = me.getViewPortCntlr();
            var venueId = metaData['venue_id'] || viewport.getVenue().getId();
            console.debug("Total Redemption Rewards - " + rewards.length);
            var rstore = Ext.StoreMgr.get('RedemptionsStore');
            rstore.setData(rewards);
         }
         //
         // Update Eligible Rewards
         // (Make sure we are after Redemption because we may depend on it for rendering purposes)
         //
         var erewards = metaData['eligible_rewards'];
         if (erewards)
         {
            console.debug("Total Eligible Rewards - " + erewards.length);
            var estore = Ext.StoreMgr.get('EligibleRewardsStore');
            estore.setData(erewards);
         }
         //
         // Winners' Circle'
         //
         var prizesCount = metaData['winners_count'];
         if (prizesCount >= 0)
         {
            console.debug("Prizes won by customers at this merchant this month - [" + prizesCount + "]");
            viewport.getVenue().set('winners_count', prizesCount);
         }

         //
         // QR Code from Transfer Points
         var qrcode = metaData['data'];
         if (qrcode)
         {
            /*
             console.debug("QRCode received for Points Transfer" + '\n' + //
             qrcode);
             */
            me.fireEvent('authCodeRecv', metaData);
         }
      }
      catch(e)
      {
         console.debug("updateRewards Exception - " + e);
      }
   },
   checkReferralPrompt : function(cbOnSuccess, cbOnFail)
   {
      var me = this;
      var viewport = me.getViewPortCntlr();

      cbOnSuccess = cbOnSuccess || Ext.emptyFn;
      cbOnFail = cbOnFail || Ext.emptyFn;
      var merchantId = viewport.getVenue().getMerchant().getId();
      if ((viewport.getCheckinInfo().customer.get('visits') == 0) && (!Genesis.db.getReferralDBAttrib("m" + merchantId)))
      {
         Ext.device.Notification.show(
         {
            title : 'Referral Challenge',
            message : me.referredByFriendsMsg(viewport.getVenue().getMerchant().get('name')),
            buttons : ['Yes', 'No'],
            callback : function(btn)
            {
               if (btn.toLowerCase() == 'yes')
               {
                  me.fireEvent('openpage', 'client.Challenges', 'referrals', cbOnSuccess);
               }
               else
               {
                  cbOnFail();
               }
            }
         });
      }
      else
      {
         cbOnFail();
      }
   },
   // --------------------------------------------------------------------------
   // Persistent Stores
   // --------------------------------------------------------------------------
   persistStore : function(storeName)
   {
      var stores =
      {
         'CustomerStore' : [Ext.StoreMgr.get('Persistent' + 'CustomerStore'), 'CustomerStore', 'CustomerJSON'],
         'MerchantPrizeStore' : [Ext.StoreMgr.get('Persistent' + 'MerchantPrizeStore'), 'MerchantPrizeStore', 'EarnPrizeJSON']
      };
      for (var i in stores)
      {
         if (!stores[i][0])
         {
            Ext.regStore('Persistent' + stores[i][1],
            {
               model : 'Genesis.model.' + stores[i][2],
               autoLoad : false
            });
         }

         stores[i][0] = Ext.StoreMgr.get('Persistent' + stores[i][1]);
      }

      return stores[storeName][0];
   },
   persistLoadStores : function(callback)
   {
      var stores = [[this.persistStore('CustomerStore'), 'CustomerStore', 0x01], [this.persistStore('MerchantPrizeStore'), 'MerchantPrizeStore', 0x10]];
      var flag = 0x0;

      callback = callback || Ext.emptyFn;
      for (var i = 0; i < stores.length; i++)
      {
         stores[i][0].load(
         {
            callback : function(results, operation)
            {
               var items = [];
               if (operation.wasSuccessful())
               {
                  var cstore = Ext.StoreMgr.get(stores[i][1]);
                  cstore.removeAll();
                  for (var x = 0; x < results.length; x++)
                  {
                     items.push(results[x].get('json'));
                  }
                  cstore.setData(items);
                  console.debug("Restored " + results.length + " records to " + stores[i][1] + " ...");
               }
               else
               {
                  console.debug("Error Restoring " + stores[i][1] + " ...");
               }

               if ((flag |= stores[i][2]) == 0x11)
               {
                  callback();
               }
            }
         });
      }
   },
   persistSyncStores : function(storeName, cleanOnly)
   {
      var stores = [[this.persistStore('CustomerStore'), 'CustomerStore', 0x01], [this.persistStore('MerchantPrizeStore'), 'MerchantPrizeStore', 0x10]];
      for (var i = 0; i < stores.length; i++)
      {
         if (!storeName || (stores[i][1] == storeName))
         {
            stores[i][0].removeAll();
            if (!cleanOnly)
            {
               var items = Ext.StoreMgr.get(stores[i][1]).getRange();
               for (var x = 0; x < items.length; x++)
               {
                  var json = items[x].getData(true);
                  stores[i][0].add(
                  {
                     json : json
                  });
               }
            }
            stores[i][0].sync();
            console.debug("Synced " + stores[i][1] + " ... ");
         }
      }
   },
   // --------------------------------------------------------------------------
   // Page Navigation Handlers
   // --------------------------------------------------------------------------
   resetView : function(view)
   {
      this.fireEvent('resetview');
   },
   pushView : function(view)
   {
      this.fireEvent('pushview', view, this.getAnimationMode());
   },
   silentPopView : function(num)
   {
      this.fireEvent('silentpopview', num);
   },
   popView : function()
   {
      this.fireEvent('popview');
   },
   // --------------------------------------------------------------------------
   // Event Handlers
   // --------------------------------------------------------------------------
   getGeoLocation : function(i)
   {
      var me = this;
      i = i || 0;
      console.debug('Getting GeoLocation ...');
      if (!Genesis.constants.isNative())
      {
         me.fireEvent('locationupdate',
         {
            coords :
            {
               getLatitude : function()
               {
                  return "-50.000000";
               },
               getLongitude : function()
               {
                  return '50.000000';
               }
            }
         });
      }
      else
      {
         console.debug('Connection type: [' + Ext.device.Connection.getType() + ']');
         //console.debug('Checking for Network Conncetivity for [' + location.origin + ']');
         if (!me.geoLocation)
         {
            me.geoLocation = Ext.create('Ext.util.Geolocation',
            {
               autoUpdate : false,
               frequency : 1,
               maximumAge : 30000,
               timeout : 50000,
               allowHighAccuracy : true,
               listeners :
               {
                  locationupdate : function(geo, eOpts)
                  {
                     if (!geo)
                     {
                        console.log("No GeoLocation found!");
                        return;
                     }
                     var position =
                     {
                        coords : geo
                     }
                     console.debug('\n' + 'Latitude: ' + geo.getLatitude() + '\n' + 'Longitude: ' + geo.getLongitude() + '\n' +
                     //
                     'Altitude: ' + geo.getAltitude() + '\n' + 'Accuracy: ' + geo.getAccuracy() + '\n' +
                     //
                     'Altitude Accuracy: ' + geo.getAltitudeAccuracy() + '\n' + 'Heading: ' + geo.getHeading() + '\n' +
                     //
                     'Speed: ' + geo.getSpeed() + '\n' + 'Timestamp: ' + new Date(geo.getTimestamp()) + '\n');

                     me.fireEvent('locationupdate', position);
                  },
                  locationerror : function(geo, bTimeout, bPermissionDenied, bLocationUnavailable, message)
                  {
                     console.debug('GeoLocation Error[' + message + ']');
                     Ext.Viewport.setMasked(false);

                     if (bPermissionDenied)
                     {
                        console.debug("PERMISSION_DENIED");
                        Ext.device.Notification.show(
                        {
                           title : 'Permission Error',
                           message : me.geoLocationPermissionErrorMsg
                        });
                     }
                     else
                     if (bLocationUnavailable)
                     {
                        console.debug("POSITION_UNAVAILABLE");
                        if (++i <= 5)
                        {
                           Ext.Function.defer(me.getGeoLocation, 1 * 1000, me, [callback, i]);
                           console.debug("Retry getting current location(" + i + ") ...");
                        }
                        else
                        {
                           Ext.device.Notification.show(
                           {
                              title : 'Error',
                              message : me.geoLocationErrorMsg
                           });
                        }
                     }
                     else
                     if (bTimeout)
                     {
                        console.debug("TIMEOUT");
                        Ext.device.Notification.show(
                        {
                           title : 'Timeout Error',
                           message : me.geoLocationTimeoutErrorMsg
                        });
                     }
                  }
               }
            });
         }
         me.geoLocation.updateLocation();
      }
   },
   scanQRCode : function()
   {
      var me = this;
      var fail = function(message)
      {
         Ext.Viewport.setMasked(false);
         config.callback();
         console.debug('Failed because: ' + message);
      };
      var callback = function(r)
      {
         var qrcode;
         Ext.Viewport.setMasked(false);
         if (Genesis.constants.isNative())
         {
            switch(window.plugins.qrCodeReader.scanType)
            {
               case 'RL' :
               {
                  qrcode = (r.response == 'undefined') ? "" : (r.response || "");
                  console.debug("QR Code RL  = " + qrcode);
                  break;
               }
               case 'Nigma' :
               {
                  qrcode = (r.response == 'undefined') ? "" : (r.response || "");
                  if (!qrcode)
                  {
                     console.debug("QR Code Nigma = Empty");
                  }
                  else
                  {
                     console.debug("QR Code Nigma = " + ((qrcode.responseCode) ? qrcode.responseCode : "NONE") + " Sent = " + qrcode.bytesSent + " bytes");
                  }
                  if (qrcode && qrcode.responseCode)
                  {
                     qrcode = qrcode.responseCode;
                  }
                  break;
               }
               case 'Default' :
               {
                  qrcode = r;
                  if (!qrcode || qrcode.format != 'QR_CODE')
                  {
                     qrcode = null;
                     console.debug("QR Code Default = Unsupported Code");
                     //
                     // Simulator, we must pump in random values
                     //
                     if (device.platform.match(/simulator/i))
                     {
                        qrcode = Math.random().toFixed(16);
                     }
                  }
                  else
                  if (qrcode.cancelled)
                  {
                     qrcode = Math.random().toFixed(16);
                  }
                  else
                  {
                     qrcode = qrcode.text;
                  }
                  console.debug("QR Code Default = " + ((qrcode) ? qrcode : "NONE"));
                  break;
               }
            }
         }
         else
         {
            qrcode = r.response;
            console.debug("QR Code = " + qrcode);
         }

         me.fireEvent('scannedqrcode', qrcode);
      };

      console.debug("Scanning QR Code ...")
      if (!Genesis.constants.isNative())
      {
         //
         // pick the first one on the Neaby Venue in the store
         //
         var venueId = 0;
         if (!merchantMode)
         {
            var venue = Ext.StoreMgr.get('CheckinExploreStore').first() || me.getViewPortCntlr().getVenue() || null;
            venueId = venue ? venue.getId() : 0;
         }
         callback(
         {
            response : venueId
         });
      }
      else
      {
         Ext.Viewport.setMasked(
         {
            xtype : 'loadmask',
            message : me.loadingScannerMsg
         });

         window.plugins.qrCodeReader.getCode(callback, fail);
      }
   }
});
var _application;

Ext.define('Genesis.controller.Viewport',
{
   extend : 'Genesis.controller.ControllerBase',
   requires : ['Ext.util.DelayedTask'],
   statics :
   {
   },
   config :
   {
      sound_files : null,
      loggedIn : false,
      customer : null,
      venue : null,
      metaData : null,
      checkinInfo :
      {
         venue : null,
         customer : null,
         metaData : null
      },
      refs :
      {
         view : 'viewportview',
         backButton : 'button[tag=back]',
         closeButton : 'button[tag=close]',
         shareBtn : 'button[tag=shareBtn]',
         emailShareBtn : 'actionsheet button[tag=emailShareBtn]',
         fbShareBtn : 'actionsheet button[tag=fbShareBtn]',
         checkInNowBtn : 'button[tag=checkInNow]' //All CheckInNow Buttons
      },
      control :
      {
         fbShareBtn :
         {
            tap : 'onShareMerchantTap'
         },
         emailShareBtn :
         {
            tap : 'onShareEmailTap'
         },
         backButton :
         {
            tap : 'onBackButtonTap'
         },
         closeButton :
         {
            tap : 'onBackButtonTap'
         },
         checkInNowBtn :
         {
            tap : 'onCheckinScanTap'
         },
         'tabbar[cls=navigationBarBottom] button[tag=info]' :
         {
            tap : 'onInfoTap'
         },
         'tabbar[cls=navigationBarBottom] button[tag=home]' :
         {
            tap : 'onHomeButtonTap'
         },
         'tabbar[cls=navigationBarBottom] button[tag=prizes]' :
         {
            tap : 'onPrizesButtonTap'
         },
         'tabbar[cls=navigationBarBottom] button[tag=accounts]' :
         {
            tap : 'onAccountsButtonTap'
         },
         'tabbar[cls=navigationBarBottom] button[tag=challenges]' :
         {
            tap : 'onChallengesButtonTap'
         },
         'tabbar[cls=navigationBarBottom] button[tag=rewards]' :
         {
            tap : 'onRewardsButtonTap'
         },
         'tabbar[cls=navigationBarBottom] button[tag=redemption]' :
         {
            tap : 'onRedemptionsButtonTap'
         },
         'tabbar[cls=navigationBarBottom] button[tag=main]' :
         {
            tap : 'onCheckedInAccountTap'
         },
         'tabbar[cls=navigationBarBottom] button[tag=browse]' :
         {
            tap : 'onBrowseTap'
         },
         //
         'viewportview button' :
         {
            tap : 'onButtonTap'
         },
         'actionsheet button' :
         {
            tap : 'onButtonTap'
         }
      },
      listeners :
      {
         'viewanimend' : 'onViewAnimEnd',
         'baranimend' :
         {
            buffer : 0.5 * 1000,
            fn : 'onBarAnimEnd'
         },
         'pushview' : 'pushView',
         'silentpopview' : 'silentPopView',
         'popview' : 'popView',
         'resetview' : 'resetView'
      }
   },
   viewStack : [],
   animationFlag : 0,
   gatherCheckinInfoMsg : 'Gathering Checkin information ...',
   retrieveChallengesMsg : 'Retrieving Challenges ...',
   fbShareSuccessMsg : 'Posted on your Timeline!',
   shareReqMsg : function()
   {
      return 'Would you like to do our' + Genesis.constants.addCRLF() + //
      'Referral Challenge?';
   },
   // --------------------------------------------------------------------------
   // Event Handlers
   // --------------------------------------------------------------------------
   onLocationUpdate : function(position)
   {
      var me = this;
      var app = me.getApplication();
      var controller = app.getController('Checkins');
      var cestore = Ext.StoreMgr.get('CheckinExploreStore');

      Venue['setFindNearestURL']();
      cestore.load(
      {
         params :
         {
            latitude : position.coords.getLatitude(),
            longitude : position.coords.getLongitude()
         },
         callback : function(records, operation)
         {
            if (operation.wasSuccessful())
            {
               controller.setPosition(position);
               controller.fireEvent('checkinScan');
            }
            else
            {
               Ext.Viewport.setMasked(false);
               Ext.device.Notification.show(
               {
                  title : 'Error',
                  message : me.missingVenueInfoMsg
               });
            }
         },
         scope : me
      });
   },
   // --------------------------------------------------------------------------
   // Button Handlers
   // --------------------------------------------------------------------------
   onButtonTap : function(b, e, eOpts)
   {
      Genesis.controller.ControllerBase.playSoundFile(this.sound_files['clickSound']);
   },
   onBackButtonTap : function(b, e, eOpts)
   {
      this.popView();
   },
   onShareEmailTap : function(b, e, eOpts, eInfo)
   {
      var me = this;
      Ext.device.Notification.show(
      {
         title : 'Referral Challenge',
         message : me.shareReqMsg(),
         buttons : ['Yes', 'No'],
         callback : function(btn)
         {
            if (btn.toLowerCase() == 'yes')
            {
               var app = me.getApplication();
               me.onChallengesButtonTap(null, null, null, null, function()
               {
                  var venue = me.getViewPortCntlr().getVenue();
                  var venueId = venue.getId();
                  var items = venue.challenges().getRange();
                  var controller = app.getController('client.Challenges');
                  //var list = controller.getReferralsPage().query('list')[0];

                  for (var i = 0; i < items.length; i++)
                  {
                     if (items[i].get('type').value == 'referral')
                     {
                        controller.selectedItem = items[i];
                        break;
                     }
                  }
                  controller.fireEvent('dochallenge');
               });
            }
         }
      });
   },
   onShareMerchantTap : function(b, e, eOpts, eInfo)
   {
      var me = this;
      var site = Genesis.constants.site;
      //var db = Genesis.db.getLocaDB();
      Genesis.fb.facebook_onLogin(function(params)
      {
         var venue = me.getVenue();
         var merchant = venue.getMerchant();
         console.log('Posting to Facebook ...');
         FB.api('/me/feed', 'post',
         {
            name : venue.get('name'),
            //link : href,
            link : venue.get('website') || site,
            caption : venue.get('website') || site,
            description : venue.get('description'),
            picture : merchant.get('photo')['thumbnail_ios_medium'].url,
            message : 'Check out this place!'
         }, function(response)
         {
            Ext.Viewport.setMasked(false);
            if (!response || response.error)
            {
               console.log('Post was not published to Facebook.');
            }
            else
            {
               console.log(me.fbShareSuccessMsg);
               Ext.device.Notification.show(
               {
                  title : 'Facebook Connect',
                  message : me.fbShareSuccessMsg
               });
            }
         });
      }, true);
   },
   onInfoTap : function(b, e, eOpts, eInfo)
   {
      // Open Info ActiveSheet
      //this.getApplication().getController('Viewport').pushView(vp.getInfo());
   },
   onCheckinScanTap : function(b, e, eOpts, einfo)
   {
      var me = this;

      Ext.Viewport.setMasked(
      {
         xtype : 'loadmask',
         message : me.gatherCheckinInfoMsg
      });
      me.getGeoLocation();
   },
   onAccountsButtonTap : function(b, e, eOpts, eInfo)
   {
      //this.fireEvent('openpage', 'Accounts', null, null);
      this.redirect('accounts');
      console.log("Going to Accounts Page ...");
   },
   onChallengesButtonTap : function(b, e, eOpts, eInfo, callback)
   {
      var me = this;
      var venue = me.getVenue();

      var _onDone = function()
      {
         if (callback)
         {
            callback();
         }
         else
         {
            me.fireEvent('openpage', 'client.Challenges', null, null);
            console.log("Going to Challenges Page ...");
         }
      }
      //
      // Retrieve Challenges from server
      //
      if (venue.challenges().getData().length == 0)
      {
         Ext.Viewport.setMasked(
         {
            xtype : 'loadmask',
            message : me.retrieveChallengesMsg
         });
         Challenge['setGetChallengesURL']();
         Challenge.load(venue.getId(),
         {
            params :
            {
               merchant_id : venue.getMerchant().getId(),
               venue_id : venue.getId()
            },
            callback : function(record, operation)
            {
               Ext.Viewport.setMasked(false);
               if (operation.wasSuccessful())
               {
                  //
                  // Load record into Venue Object
                  //
                  venue.challenges().add(operation.getRecords());

                  _onDone();
               }
            }
         });
      }
      else
      {
         _onDone();
      }
   },
   onRewardsButtonTap : function(b, e, eOpts, eInfo)
   {
      this.fireEvent('openpage', 'client.Rewards', 'rewards', null);
      console.log("Going to Client Rewards Page ...");
   },
   onRedemptionsButtonTap : function(b, e, eOpts, eInfo)
   {
      //this.fireEvent('openpage', 'client.Redemptions', 'redemptions', null);
      this.redirectTo('redemptions');
      console.log("Going to Client Redemptions Page ...");
   },
   onPrizesButtonTap : function(b, e, eOpts, eInfo)
   {
      this.redirectTo('merchantPrizes');
      //this.fireEvent('openpage', 'Prizes', 'merchantPrizes', null);
      console.log("Going to Merchant Prizes Page ...");
   },
   onHomeButtonTap : function(b, e, eOpts, eInfo)
   {
      var vport = this.getViewport();
      this.resetView();
      this.redirectTo('main');
      //this.fireEvent('openpage', 'MainPage', null, null);
      console.log("Going back to HomePage ...");
   },
   onCheckedInAccountTap : function(b, e, eOpts, eInfo)
   {
      var info = this.getViewPortCntlr().getCheckinInfo();
      this.redirectTo('venue' + '/' + info.venue.getId() + '/' + info.customer.getId() + '/1');
   },
   onBrowseTap : function(b, e, eOpts, eInfo)
   {
      this.redirectTo('exploreS');
      //this.fireEvent('openpage', 'Checkins', 'explore', 'slideUp');
   },
   // --------------------------------------------------------------------------
   // Page Navigation Handlers
   // --------------------------------------------------------------------------
   resetView : function()
   {
      var me = this;
      //
      // Remove All Views
      //
      me.viewStack = [];
      me.getApplication().getHistory().setActions([]);

   },
   pushView : function(view, animation)
   {
      var me = this;
      animation = Ext.apply(animation,
      {
         reverse : false
      });
      var lastView = (me.viewStack.length > 1) ? me.viewStack[me.viewStack.length - 2] : null;

      //
      // Refresh view
      //
      if ((me.viewStack.length > 0) && (view == me.viewStack[me.viewStack.length - 1]['view']))
      {
      }
      //
      // Pop view
      //
      else
      if (lastView && (lastView['view'] == view))
      {
         me.popView();
      }
      //
      // Push view
      //
      else
      {
         //
         // Remember what animation we used to render this view
         //
         var actions = me.getApplication().getHistory().getActions();
         me.viewStack.push(
         {
            view : view,
            animation : animation,
            url : actions[actions.length - 1].getUrl()
         });
         me.getViewport().animateActiveItem(view, animation);
      }
   },
   silentPopView : function(num)
   {
      var me = this;
      num = Math.min(me.viewStack.length, num);
      var actions = me.getApplication().getHistory().getActions();

      if ((me.viewStack.length > 0) && (num > 0))
      {
         while (num-- > 0)
         {
            var lastView = me.viewStack.pop();
            //
            // Viewport will automatically detect not to delete current view
            // until is no longer the activeItem
            //
            //me.getViewport().remove(lastView['view']);
         }
      }
   },
   popView : function()
   {
      var me = this;

      if (me.viewStack.length > 0)
      {
         var lastView = me.viewStack.pop();
         var currView = me.viewStack[me.viewStack.length - 1];

         //
         // Recreate View if the view was destroyed for DOM memory optimization
         //
         if (currView['view'].isDestroyed)
         {
            currView['view'] = Ext.create(currView['view'].alias[0]);
            console.debug("Recreated View [" + currView['view']._itemId + "]")
         }

         //
         // Update URL
         //
         me.getApplication().getHistory().setToken(currView['url']);
         window.location.hash = currView['url'];

         me.getViewport().animateActiveItem(currView['view'], Ext.apply(lastView['animation'],
         {
            reverse : true
         }));
      }
   },
   // --------------------------------------------------------------------------
   // Functions
   // --------------------------------------------------------------------------
   init : function(app)
   {
      var me = this;
      console.log("Viewport Init");
      _application = app;

      me.callParent(arguments);

      if (merchantMode)
      {
         console.log("Loading License Keys ...");
         Genesis.constants.getPrivKey();
      }

      QRCodeReader.prototype.scanType = "Default";
      console.debug("QRCode Scanner Mode[" + QRCodeReader.prototype.scanType + "]")

      //
      // Initialize Facebook
      //
      if (!merchantMode)
      {
         Genesis.fb.initFb();
         me.updateRewardsTask = Ext.create('Ext.util.DelayedTask');
      }

      if (Ext.isDefined(window.device))
      {
         console.debug("device.platform - " + device.platform);
      }

      //
      // Initialize Sound Files, make it non-blocking
      //
      Ext.defer(function()
      {
         this.sound_files =
         {
         };
         var soundList = [//
         ['rouletteSpinSound', 'roulette_spin_sound', 'Media'], //
         ['winPrizeSound', 'win_prize_sound', 'Media'], //
         ['clickSound', 'click_sound', 'FX'], //
         //['refreshListSound', 'refresh_list_sound', 'FX'], //
         ['beepSound', 'beep.wav', 'FX']];

         for (var i = 0; i < soundList.length; i++)
         {
            this.loadSoundFile.apply(this, soundList[i]);
         }
      }, 1, me);
   },
   loadSoundFile : function(tag, sound_file, type)
   {
      var me = this;
      var ext = '.' + (sound_file.split('.')[1] || 'mp3');
      sound_file = sound_file.split('.')[0];
      if (Genesis.constants.isNative())
      {
         switch (type)
         {
            case 'FX' :
               LowLatencyAudio['preload'+type](sound_file, 'resources/audio/' + sound_file + ext, function()
               {
                  console.debug("loaded " + sound_file);
               }, function(err)
               {
                  console.debug("Audio Error: " + err);
               });
               break;
            case 'Audio' :
               LowLatencyAudio['preload'+type](sound_file, 'resources/audio/' + sound_file + ext, 3, function()
               {
                  console.debug("loaded " + sound_file);
               }, function(err)
               {
                  console.debug("Audio Error: " + err);
               });
               break;
            case 'Media' :
               sound_file = new Media('resources/audio/' + sound_file + ext, function()
               {
                  //console.log("loaded " + me.sound_files[tag].name);
                  me.sound_files[tag].successCallback();
               }, function(err)
               {
                  me.sound_files[tag].successCallback();
                  console.log("Audio Error: " + err);
               });
               break;
         }
      }
      else
      {
         var elem = Ext.get(sound_file);
         if (elem)
         {
            elem.dom.addEventListener('ended', function()
            {
               me.sound_files[tag].successCallback();
            }, false);
         }
      }

      //console.debug("Preloading " + sound_file + " ...");

      me.sound_files[tag] =
      {
         name : sound_file,
         type : type
      };
   },
   openMainPage : function()
   {
      var db = Genesis.db.getLocalDB();
      var loggedIn = (db['auth_code']) ? true : false;
      if (!merchantMode)
      {
         if (loggedIn)
         {
            //var app = this.getApplication();
            //var controller = app.getController('MainPage');

            this.setLoggedIn(loggedIn);
            console.debug("Going to SignIn Page ...");
            this.redirectTo('signIn');
         }
         else
         {
            console.debug("Going to Login Page ...");
            this.redirectTo('login');
         }
      }
   }
});
Ext.define('Genesis.controller.Settings',
{
   extend : 'Genesis.controller.ControllerBase',
   statics :
   {
   },
   xtype : 'settingsCntlr',
   config :
   {
      routes :
      {
         'clientSettings' : 'clientSettingsPage',
         'serverSettings' : 'serverSettingsPage'
      },
      refs :
      {
         clientSettingsPage :
         {
            selector : 'clientsettingspageview',
            autoCreate : true,
            xtype : 'clientsettingspageview'
         },
         serverSettingsPage :
         {
            selector : 'serversettingspageview',
            autoCreate : true,
            xtype : 'serversettingspageview'
         }
      },
      control :
      {
      }
   },
   fbLoggedInIdentityMsg : function(email)
   {
      return 'You\'re logged into Facebook as ' + Genesis.constants.addCRLF() + email;
   },
   init : function()
   {
      this.callParent(arguments);
      this.initClientControl();
      this.initServerControl();
      console.log("Settings Init");
   },
   initClientControl : function()
   {
      this.control(
      {
         'clientsettingspageview listfield[name=terms]' :
         {
            clearicontap : 'onTermsTap'
         },
         'clientsettingspageview listfield[name=privacy]' :
         {
            clearicontap : 'onPrivacyTap'
         },
         'clientsettingspageview listfield[name=aboutus]' :
         {
            clearicontap : 'onAboutUsTap'
         },
         'clientsettingspageview listfield[name=facebook]' :
         {
            clearicontap : 'onFacebookTap'
         }
      });
   },
   initServerControl : function()
   {
      this.control(
      {
         'serversettingspageview listfield[name=terms]' :
         {
            clearicontap : 'onTermsTap'
         },
         'serversettingspageview listfield[name=privacy]' :
         {
            clearicontap : 'onPrivacyTap'
         },
         'serversettingspageview listfield[name=aboutus]' :
         {
            clearicontap : 'onAboutUsTap'
         }
      });
   },
   /*
    getMainPage : function()
    {
    return this.getSettingsPage();
    },
    openMainPage : function()
    {
    var page = this.getMainPage();
    this.pushView(page);
    console.log("SettingsPage Opened");
    },
    */
   onTermsTap : function(b, e)
   {
      Ext.device.Notification.show(
      {
         title : 'Button Tapped',
         message : 'Disclose List Item'
      });
   },
   onFacebookTap : function(b, e)
   {
      var me = this;
      Genesis.fb.facebook_onLogin(function(params)
      {
         Ext.Viewport.setMasked(false);
         Customer['setUpdateFbLoginUrl']();
         Customer.load(1,
         {
            jsonData :
            {
            },
            params :
            {
               user : Ext.encode(params)
            },
            callback : function(record, operation)
            {
               if (operation.wasSuccessful())
               {
                  Ext.device.Notification.show(
                  {
                     title : 'Facebook Connect',
                     message : me.fbLoggedInIdentityMsg(params['email'])
                  });
               }
            }
         });
      }, true);
   },
   onTermsTap : function(b, e)
   {
      Ext.device.Notification.show(
      {
         title : 'Terms Tapped',
         message : 'Disclose List Item'
      });
   },
   onPrivacyTap : function(b, e)
   {
      Ext.device.Notification.show(
      {
         title : 'Privacy Tapped',
         message : 'Disclose List Item'
      });
   },
   onAboutUsTap : function(b, e)
   {
      Ext.device.Notification.show(
      {
         title : 'About Us Tapped',
         message : 'Disclose List Item'
      });
   },
   // --------------------------------------------------------------------------
   // Page Navigation
   // --------------------------------------------------------------------------
   clientSettingsPage : function()
   {
      this.openPage('client');
   },
   serverSettingsPage : function()
   {
      this.openPage('server');
   },
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
   openPage : function(subFeature)
   {
      var me = this, page;
      switch(subFeature)
      {
         case 'client' :
         {
            page = this.getClientSettingsPage();
            break;
         }
         case 'server' :
         {
            page = this.getServerSettingsPage();
            break;
         }
      }
      me.setAnimationMode(me.self.superclass.self.animationMode['slide']);
      me.pushView(page);
   },
   isOpenAllowed : function()
   {
      return true;
   }
});
Ext.define('Genesis.controller.MainPage',
{
   extend : 'Genesis.controller.ControllerBase',
   requires : ['Ext.data.Store', 'Genesis.model.EarnPrize'],
   statics :
   {
   },
   xtype : 'mainPageCntlr',
   config :
   {
      routes :
      {
         '' : 'openPage', //Default do nothing
         'main' : 'mainPage',
         'login' : 'loginPage',
         'merchant' : 'merchantPage',
         'signin' : 'signInPage',
         'createAccount' : 'createAccountPage',
      },
      models : ['frontend.MainPage', 'frontend.Signin', 'frontend.Account', 'EligibleReward', 'Customer', 'User', 'Merchant', 'EarnPrize', 'CustomerReward'],
      listeners :
      {
         'authcoderecv' : 'onAuthCodeRecv'
      },
      refs :
      {
         // Login Page
         login :
         {
            selector : 'loginpageview',
            autoCreate : true,
            xtype : 'loginpageview'
         },
         signin :
         {
            selector : 'signinpageview',
            autoCreate : true,
            xtype : 'signinpageview'
         },
         createAccount :
         {
            selector : 'createaccountpageview',
            autoCreate : true,
            xtype : 'createaccountpageview'
         },
         // Main Page
         main :
         {
            selector : 'mainpageview',
            autoCreate : true,
            xtype : 'mainpageview'
         },
         mainCarousel : 'mainpageview',
         infoBtn : 'button[tag=info]'
      },
      control :
      {
         login :
         {
            activate : 'onLoginActivate',
            deactivate : 'onLoginDeactivate'
         },
         'actionsheet button[tag=facebook]' :
         {
            tap : 'onFacebookTap'
         },
         'actionsheet button[tag=createAccount]' :
         {
            tap : 'onCreateAccountTap'
         },
         'actionsheet button[tag=signIn]' :
         {
            tap : 'onSignInTap'
         },
         'signinpageview button[tag=login]' :
         {
            tap : 'onSignInSubmit'
         },
         'actionsheet button[tag=logout]' :
         {
            tap : 'onLogoutTap'
         },
         main :
         {
            activate : 'onActivate',
            deactivate : 'onDeactivate'
         },
         'mainpageview dataview' :
         {
            //itemtap : 'onItemTap',
            select : 'onItemSelect',
            itemtouchstart : 'onItemTouchStart',
            itemtouchend : 'onItemTouchEnd'
         },
         createAccount :
         {
            activate : 'onCreateActivate',
            deactivate : 'onCreateDeactivate'
         },
         'createaccountpageview button[tag=createAccount]' :
         {
            tap : 'onCreateAccountSubmit'
         }
      }
   },
   signInFailMsg : function(msg)
   {
      return msg + Genesis.constants.addCRLF() + 'Please Try Again';
   },
   loginWithFbMsg : function(msg)
   {
      return 'Logging in ...';
   },
   init : function(app)
   {
      var me = this;
      me.callParent(arguments);

      //
      // Loads Front Page Metadata
      //
      Ext.regStore('MainPageStore',
      {
         model : 'Genesis.model.frontend.MainPage',
         autoLoad : true,
         listeners :
         {
            scope : me,
            "load" : function(store, records, successful, operation, eOpts)
            {
               if (merchantMode)
               {
                  me.goToMain();
               }
               else
               {
                  var db = Genesis.db.getLocalDB();
                  if (db['auth_code'])
                  {
                     me.persistLoadStores(function()
                     {
                        me.redirectTo('main');
                     });
                  }
                  else
                  {
                     me.redirectTo('login');
                  }
               }
            }
         }
      });

      if (!merchantMode)
      {
         //
         // Load all the info into Stores
         // Normally we do this in the Login screen
         //
         Ext.regStore('UserStore',
         {
            model : 'Genesis.model.User',
            autoLoad : false
         });

         //
         // Prizes that a User Earned
         //
         me.initMerchantPrizeStore();

         //
         // Store storing the Customer's Eligible Rewards at a Venue
         // Used during Checkin
         //
         Ext.regStore('EligibleRewardsStore',
         {
            model : 'Genesis.model.EligibleReward',
            autoLoad : false
         });

         //
         // Customer Accounts for an user
         //
         me.initCustomerStore();
      }

      console.log("MainPage Init");
   },
   initCustomerStore : function()
   {
      var me = this, db;
      Ext.regStore('CustomerStore',
      {
         model : 'Genesis.model.Customer',
         autoLoad : false,
         pageSize : 1000,
         listeners :
         {
            scope : me,
            "load" : function(store, records, successful, operation, eOpts)
            {
               // Load Prizes into DataStore
               var metaData = store.getProxy().getReader().metaData;

               if (successful && metaData && metaData['auth_token'])
               {
                  db = Genesis.db.getLocalDB();
                  console.debug(//
                  "auth_code [" + db['auth_code'] + "]" + "\n" + //
                  "currFbId [" + db['currFbId'] + "]");
                  me.goToMain();
               }
            },
            'metachange' : function(store, proxy, eOpts)
            {
               // Load Prizes into DataStore
               var metaData = proxy.getReader().metaData;

               //
               // Update MerchantPrizeStore
               //
               var prizes = metaData['prizes'];
               if (prizes)
               {
                  console.debug("Total Prizes - " + prizes.length);
                  Ext.StoreMgr.get('MerchantPrizeStore').setData(prizes);
                  me.persistSyncStores('MerchantPrizeStore');
               }

               //
               // Update Authentication Token
               //
               var authCode = metaData['auth_token'];
               if (authCode)
               {
                  console.debug("Login Auth Code - " + authCode)
                  db = Genesis.db.getLocalDB();
                  if (authCode != db['auth_code'])
                  {
                     Genesis.db.setLocalDBAttrib('auth_code', authCode);
                  }
               }

               me.getViewPortCntlr().updateRewardsTask.delay(1 * 1000, me.updateRewards, me, [metaData]);
            }
         },
         grouper :
         {
            groupFn : function(record)
            {
               return record.getMerchant().get('name');
            }
         },
         sorters : [
         {
            sorterFn : function(o1, o2)
            {
               var name1 = o1.getMerchant().get('name'), name2 = o2.getMerchant().get('name');
               if (name1 < name2)//sort string ascending
                  return -1
               if (name1 > name2)
                  return 1
               return 0 //default return value (no sorting)
            }
         }]
      });
   },
   initMerchantPrizeStore : function()
   {
      var me = this;
      var app = me.getApplication();
      Ext.regStore('MerchantPrizeStore',
      {
         model : 'Genesis.model.EarnPrize',
         autoLoad : false,
         clearOnPageLoad : false,
         sorters : [
         {
            // Clump by merchant (ascending order)
            sorterFn : function(o1, o2)
            {
               return o1.getMerchant().getId() - o2.getMerchant().getId();
            }
         },
         {
            // Return based on expiry date (descending order)
            sorterFn : function(o1, o2)
            {
               return Date.parse(o2.get('expiry_date')) - Date.parse(o1.get('expiry_date'));
            }
         },
         {
            // Return based on issue date (Bigger Id == issued later)
            sorterFn : function(o1, o2)
            {
               return o2.getId() - o1.getId();
            }
         }],
         listeners :
         {
            scope : this,
            'metachange' : function(store, proxy, eOpts)
            {
               var controller = app.getController('client.Rewards');
               controller.fireEvent('metadataChange', store, proxy.getReader().metaData);
            }
         }
      });
   },
   // --------------------------------------------------------------------------
   // EVent Handlers
   // --------------------------------------------------------------------------
   onAuthCodeRecv : function(metaData)
   {
      var me = this;
      var app = me.getApplication();
      var controller = app.getController('Accounts');
      controller.fireEvent('authCodeRecv', metaData);
   },
   // --------------------------------------------------------------------------
   // MainPage
   // --------------------------------------------------------------------------
   onItemSelect : function(d, model, eOpts)
   {
      Genesis.controller.ControllerBase.playSoundFile(this.getViewPortCntlr().sound_files['clickSound']);

      d.deselect([model], false);
      console.log("Controller=[" + model.data.pageCntlr + "]");

      var cntlr = this.getApplication().getController(model.get('pageCntlr'));
      var msg = cntlr.isOpenAllowed();
      if (msg === true)
      {
         if (model.get('route'))
         {
            this.redirectTo(model.get('route'));
         }
         else
         if (model.get('subFeature'))
         {
            cntlr.openPage(model.get('subFeature'));
         }
         else
         {
            cntlr.openMainPage();
         }
      }
      else
      {
         Ext.device.Notification.show(
         {
            title : 'Error',
            message : msg
         });
      }
      return false;
   },
   onItemTouchStart : function(d, index, target, e, eOpts)
   {
      //Ext.fly(Ext.query('#'+target.id+' div.photo')[0]).mask();

   },
   onItemTouchEnd : function(d, index, target, e, eOpts)
   {
      //Ext.fly(Ext.query('#'+target.id+' div.photo')[0]).unmask();
   },
   onActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      //Ext.defer(activeItem.createView, 1, activeItem);
      activeItem.createView();
      this.getInfoBtn()[(merchantMode) ? 'hide' : 'show']();
   },
   onDeactivate : function(oldActiveItem, c, newActiveItem, eOpts)
   {
      var me = this;
      //this.getInfoBtn().hide();
   },
   // --------------------------------------------------------------------------
   // Login Page
   // --------------------------------------------------------------------------
   facebookLogin : function(params)
   {
      var me = this;
      Customer['setFbLoginUrl']();
      console.log("setFbLoginUrl - Logging in ...");
      Ext.StoreMgr.get('CustomerStore').load(
      {
         jsonData :
         {
         },
         params : params,
         callback : function(records, operation)
         {
            //
            // Login Error, redo login
            //
            Ext.Viewport.setMasked(false);
            if (!operation.wasSuccessful())
            {
               me.redirectTo('login');
            }
            else
            {
               me.persistSyncStores();
            }
         }
      });
   },
   onLoginActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var viewport = this.getViewPortCntlr();
      
      Genesis.db.resetStorage();
      viewport.setLoggedIn(false);
      Genesis.db.removeLocalDBAttrib('auth_code');
      
      //this.getInfoBtn().hide();
      activeItem.createView();
   },
   onLoginDeactivate : function(oldActiveItem, c, newActiveItem, eOpts)
   {
      var me = this;
   },
   onLogoutTap : function(b, e, eOpts, eInfo)
   {
      var me = this;
      var vport = me.getViewport();
      var viewport = me.getViewPortCntlr();
      var flag = 0;
      //
      // Logout of Facebook
      //
      var _onLogout = function()
      {
         console.log("Resetting Session information ...")
         if (Genesis.db.getLocalDB()['currFbId'] > 0)
         {
            Genesis.fb.facebook_onLogout(null, true);
         }
         me.redirectTo('login');
      }
      var _logout = function()
      {
         var authCode = Genesis.db.getLocalDB()['auth_code'];
         if (authCode)
         {
            console.log("Logging out ...")
            Customer['setLogoutUrl'](authCode);
            Ext.StoreMgr.get('CustomerStore').load(
            {
               jsonData :
               {
               },
               callback : function(records, operation)
               {
                  Ext.Viewport.setMasked(false);
                  if (operation.wasSuccessful())
                  {
                     me.persistSyncStores(null, true);
                     console.log("Logout Successful!")
                  }
                  else
                  {
                     console.log("Logout Failed!")
                  }
               }
            });
         }
         _onLogout();
      }

      b.parent.onAfter(
      {
         hiddenchange : function()
         {
            if ((flag |= 0x01) == 0x11)
            {
               _logout();
            }
         },
         single : true
      });
      b.parent.hide();
      if (Genesis.db.getLocalDB()['currFbId'] > 0)
      {
         console.log("Logging out of Facebook ...")
         Genesis.fb.facebook_onLogout(function()
         {
            //
            // Login as someone else?
            //
            if ((flag |= 0x10) == 0x11)
            {
               _logout();
            }
         });
      }
      else
      {
         console.log("No Login info found from Facebook ...")
         if ((flag |= 0x10) == 0x11)
         {
            _logout();
         }
      }
   },
   onFacebookTap : function(b, e, eOpts, eInfo)
   {
      var me = this;
      //
      // Forced to Login to Facebook
      //
      Ext.Viewport.setMasked(
      {
         xtype : 'loadmask',
         message : me.loginWithFbMsg()
      });
      Genesis.db.removeLocalDBAttrib('currFbId');
      Genesis.fb.facebook_onLogin(function(params)
      {
         console.log(me.loginWithFbMsg());
         me.facebookLogin(params);
      }, true);
   },
   onCreateAccountTap : function(b, e, eOpts, eInfo)
   {
      this.setAnimationMode(this.self.superclass.self.animationMode['slide']);
      this.pushView(this.getCreateAccount());
   },
   onSignInTap : function(b, e, eOpts, eInfo)
   {
      this.setAnimationMode(this.self.superclass.self.animationMode['slide']);
      this.pushView(this.getSignin());
   },
   // --------------------------------------------------------------------------
   // SignIn and CreateAccount Page
   // --------------------------------------------------------------------------
   onCreateAccountSubmit : function(b, e, eOpts, eInfo)
   {
      var me = this;
      var account = me.getCreateAccount();
      var values = account.getValues();
      var user = Ext.create('Genesis.model.frontend.Account', values);
      var validateErrors = user.validate();
      var response = Genesis.db.getLocalDB()['fbResponse'] || null;

      if (!validateErrors.isValid())
      {
         var field = validateErrors.first();
         var label = Ext.ComponentQuery.query('field[name='+field.getField()+']')[0].getLabel();
         var message = label + ' ' + field.getMessage() + Genesis.constants.addCRLF() + 'Please Try Again';
         console.log(message);
         Ext.device.Notification.show(
         {
            title : 'Oops',
            message : message
         });
      }
      else
      {
         console.debug("Creating Account ...");
         var params =
         {
            name : values.name,
            email : values.username,
            password : values.password
         };

         if (response)
         {
            params = Ext.apply(params, response);
         }

         Customer['setCreateAccountUrl']();
         Ext.StoreMgr.get('CustomerStore').load(
         {
            jsonData :
            {
            },
            params :
            {
               user : Ext.encode(params)
            },
            callback : function(records, operation)
            {
               //
               // Login Error, redo login
               //
               Ext.Viewport.setMasked(false);
               if (!operation.wasSuccessful())
               {
               }
               else
               {
                  me.persistSyncStores();
               }
            }
         });
      }
   },
   onSignIn : function(username, password)
   {
      //Cleanup any outstanding registrations
      Genesis.fb.facebook_onLogout(null, Genesis.db.getLocalDB()['currFbId'] > 0);

      var me = this;
      var params =
      {
      };

      if (username)
      {
         params =
         {
            email : username,
            password : password
         };
      }
      Customer['setLoginUrl']();
      console.log("setLoginUrl - Logging in ...");
      Ext.StoreMgr.get('CustomerStore').load(
      {
         params : params,
         jsonData :
         {
         },
         callback : function(records, operation)
         {
            //
            // Login Error, redo login
            //
            Ext.Viewport.setMasked(false);
            if (!operation.wasSuccessful())
            {
               me.redirectTo('login');
            }
            else
            {
               me.persistSyncStores('CustomerStore');
            }
         }
      });
   },
   onSignInSubmit : function(b, e, eOpts, eInfo)
   {
      var signin = this.getSignin();
      var values = signin.getValues();
      var user = Ext.create('Genesis.model.frontend.Signin', values);
      var validateErrors = user.validate();

      if (!validateErrors.isValid())
      {
         var field = validateErrors.first();
         var label = Ext.ComponentQuery.query('field[name='+field.getField()+']')[0].getLabel();
         Ext.device.Notification.show(
         {
            title : 'Oops',
            message : signInFailMsg(label + ' ' + field.getMessage())
         });
      }
      else
      {
         this.onSignIn(values.username, values.password);
      }
   },
   onCreateActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var response = Genesis.db.getLocalDB()['fbResponse'] || null;
      if (response)
      {
         var form = this.getCreateAccount();
         form.setValues(
         {
            name : response.name,
            username : response.email
         });
      }
      activeItem.createView();
   },
   onCreateDeactivate : function(oldActiveItem, c, newActiveItem, eOpts)
   {
      var me = this;
   },
   // --------------------------------------------------------------------------
   // Page Navigation
   // --------------------------------------------------------------------------
   mainPage : function()
   {
      this.openPage('main');
   },
   loginPage : function()
   {
      this.openPage('login');
   },
   merchantPage : function()
   {
      this.openPage('merchant');
   },
   signInPage : function()
   {
      var db = Genesis.db.getLocalDB();
      if (db['currFbId'] > 0)
      {
         this.facebookLogin(db['fbResponse']);
      }
      else
      {
         this.onSignInTap();
      }
   },
   createAccountPage : function()
   {
      this.onCreateAccountTap();
   },
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
   openPage : function(subFeature)
   {
      this.resetView();
      switch (subFeature)
      {
         case 'main' :
         {
            this.setAnimationMode(this.self.superclass.self.animationMode['flip']);
            this.pushView(this.getMainPage());
            break;
         }
         case 'merchant' :
         {
            var info = this.getViewPortCntlr().getCheckinInfo();
            this.redirectTo('venue/' + info.venue.getId() + '/' + info.customer.getId() + '/1');
            break;
         }
         case 'login' :
         {
            this.setAnimationMode(this.self.superclass.self.animationMode['fade']);
            Ext.Viewport.setMasked(false);
            this.pushView(this.getLogin());
            break;
         }
      }
   },
   getMainPage : function()
   {
      var page = this.getMain();
      return page;
   },
   openMainPage : function()
   {
      var cntlr = this.getViewPortCntlr();
      this.setAnimationMode(this.self.superclass.self.animationMode['flip']);
      this.pushView(this.getMainPage());
      console.log("MainPage Opened");
   },
   isOpenAllowed : function()
   {
      return true;
   }
});
Ext.define('Genesis.controller.Checkins',
{
   extend : 'Genesis.controller.ControllerBase',
   statics :
   {
      checkin_path : '/checkin'
   },
   xtype : 'checkinsCntlr',
   config :
   {
      routes :
      {
         'exploreS' : 'explorePageUp',
         'explore' : 'explorePage',
         'checkin' : 'checkinPage'
      },
      refs :
      {
         backBtn : 'checkinexploreview button[tag=back]',
         closeBtn : 'checkinexploreview button[tag=close]',
         explore :
         {
            selector : 'checkinexploreview',
            autoCreate : true,
            xtype : 'checkinexploreview'
         },
         checkInNowBar : 'checkinexploreview container[tag=checkInNow]',
         shareBtn : 'viewportview button[tag=shareBtn]'
      },
      control :
      {
         //
         // Checkin Explore
         //
         explore :
         {
            activate : 'onExploreActivate',
            deactivate : 'onExploreDeactivate'
         },
         'checkinexploreview list' :
         {
            select : 'onExploreSelect',
            disclose : 'onExploreDisclose'
         }
      },
      listeners :
      {
         'exploreLoad' : 'onExploreLoad',
         'checkin' : 'onCheckinTap',
         'checkinScan' : 'onCheckinScanTap',
         'checkinMerchant' : 'onCheckinHandler'
      },
      position : null,
   },
   metaDataMissingMsg : 'Missing Checkin MetaData information.',
   noCheckinCodeMsg : 'No Checkin Code found!',
   getMerchantInfoMsg : 'Retrieving Merchant Info ...',
   loadingPlaces : 'Loading ...',
   init : function()
   {
      var me = this;
      //
      // Store storing the Venue object for Checked-In / Explore views
      //
      Ext.regStore('CheckinExploreStore',
      {
         model : 'Genesis.model.Venue',
         autoLoad : false,
         sorters : [
         {
            property : 'distance',
            direction : 'ASC'
         }],
         listeners :
         {
            'metachange' : function(store, proxy, eOpts)
            {
               // Let Other event handlers udpate the metaData first ...
               me.getViewPortCntlr().updateRewardsTask.delay(1 * 1000, me.updateRewards, me, [proxy.getReader().metaData]);
            }
         }

      });
      this.callParent(arguments);
      console.log("Checkins Init");
   },
   // --------------------------------------------------------------------------
   // Common Functions
   // --------------------------------------------------------------------------
   onCheckinCommonTap : function(qrcode)
   {
      var me = this;
      var mode = me.callback['mode'];
      var url = me.callback['url'];
      var position = me.callback['position'];
      var callback = me.callback['callback'];
      var viewport = me.getViewPortCntlr();
      var venueId = (viewport.getVenue() ? viewport.getVenue().getId() : null);

      // Load Info into database
      Customer[url](venueId);
      var params =
      {
         latitude : (position) ? position.coords.getLatitude() : 0,
         longitude : (position) ? position.coords.getLongitude() : 0,
         auth_code : qrcode || 0
      }
      if (venueId)
      {
         params = Ext.apply(params,
         {
            venue_id : venueId
         });
      }

      console.debug("CheckIn - auth_code:'" + qrcode + "' venue_id:'" + venueId + "'");

      Customer.load(venueId,
      {
         jsonData :
         {
         },
         params : params,
         scope : me,
         callback : function(record, operation)
         {
            var metaData = Customer.getProxy().getReader().metaData;
            if (operation.wasSuccessful() && metaData)
            {
               me.fireEvent('checkinMerchant', mode, metaData, venueId, record, operation, callback);
            }
            else
            if (!operation.wasSuccessful() && !metaData)
            {
               console.log(me.metaDataMissingMsg);
            }
         }
      });
   },
   onScannedQRcode : function(qrcode)
   {
      var me = this;
      if (qrcode)
      {
         console.log(me.checkinMsg);
         Ext.Viewport.setMasked(
         {
            xtype : 'loadmask',
            message : me.checkinMsg
         });

         // Retrieve GPS Coordinates
         me.onCheckinCommonTap(qrcode);
      }
      else
      {
         console.debug(me.noCheckinCodeMsg);
         Ext.Viewport.setMasked(false);
         Ext.device.Notification.show(
         {
            title : 'Error',
            message : me.noCheckinCodeMsg
         });
      }
   },
   onCheckInScanNow : function(b, e, eOpts, eInfo, mode, url, type, callback)
   {
      var me = this;

      switch(type)
      {
         case 'scan' :
            me.callback =
            {
               mode : mode,
               url : url,
               type : type,
               callback : callback
            };
            me.scanQRCode();
            break;
         default:
            me.callback =
            {
               mode : mode,
               url : url,
               type : '',
               callback : callback
            };
            Ext.Viewport.setMasked(
            {
               xtype : 'loadmask',
               message : me.getMerchantInfoMsg
            });
            me.onCheckinCommonTap(null);
            break;
      }
   },
   setupCheckinInfo : function(mode, venue, customer, metaData)
   {
      var viewport = this.getViewPortCntlr();
      viewport.setVenue(venue)
      viewport.setCustomer(customer);
      viewport.setMetaData(metaData);

      switch (mode)
      {
         case 'checkin' :
         {
            viewport.setCheckinInfo(
            {
               venue : viewport.getVenue(),
               customer : viewport.getCustomer(),
               metaData : viewport.getMetaData()
            });
            break;
         }
         default :
            break;
      }
   },
   onCheckinScanTap : function(b, e, eOpts, einfo)
   {
      //
      // Clear Venue info, let server determine from QR Code
      //
      this.getViewPortCntlr().setVenue(null);

      // Scan QR Code to confirm Checkin
      this.onCheckInScanNow(b, e, eOpts, einfo, 'checkin', 'setVenueScanCheckinUrl', 'scan', function()
      {
         Ext.device.Notification.vibrate();
      });
   },
   onCheckinTap : function(b, e, eOpts, einfo)
   {
      // Scan QR Code to confirm Checkin
      this.onCheckInScanNow(b, e, eOpts, einfo, 'checkin', 'setVenueCheckinUrl', 'scan', function()
      {
         Ext.device.Notification.vibrate();
      });
   },
   onNonCheckinTap : function(b, e, eOpts, einfo, callback)
   {
      // No scanning required
      this.onCheckInScanNow(b, e, eOpts, einfo, 'explore', 'setVenueExploreUrl', 'noscan', callback);
   },
   onCheckinHandler : function(mode, metaData, venueId, record, operation, callback)
   {
      var me = this;
      var app = me.getApplication();
      var custore = Ext.StoreMgr.get('CustomerStore');
      var cestore = Ext.StoreMgr.get('CheckinExploreStore');
      var mcntlr = app.getController('Merchants');
      var viewport = me.getViewPortCntlr();
      var vport = me.getViewport();
      var checkinMode = false;

      var customerId, customer, venue, points;
      customerId = record.getId();
      points = record.get('points');

      // Find venueId from metaData or from DataStore
      var new_venueId = metaData['venue_id'] || cestore.first().getId();
      // Find venue from DataStore or current venue info
      venue = cestore.getById(new_venueId) || viewport.getVenue();

      // Find Matching Venue or pick the first one returned if no venueId is set
      console.debug("CheckIn - new_venueId:'" + new_venueId + "' venue_id:'" + venueId + "'");
      if ((new_venueId == venueId) || (venueId == null))
      {
         checkinMode = (mode == 'checkin');
         //
         // Update our Database with the latest value from Server
         //
         if (Customer.isValidCustomer(customerId))
         {
            customer = custore.getById(customerId);
            if (customer != null)
            {
               Customer.updateCustomer(customer, record);
               //customer = custore.add(record)[0];
               console.debug("Customer ID=[" + customer.getId() + "] is in CustAcct Database");
            }
            //
            // First time Customer ... add it to CustomerStore
            //
            else
            {
               customer = custore.add(record)[0];
               console.debug("Customer ID=[" + customer.getId() + "] is ADDED to CustAcct Database");
               me.persistSyncStores('CustomerStore');
            }
         }
         else
         {
            console.debug("Exploring Venue ...");
         }
         console.debug("CheckIn - points:'" + points + "'");

         me.setupCheckinInfo(mode, venue, customer || record, metaData);
      }

      console.debug("CheckIn - Opening Merchant Account Page ...");

      //
      // Cleans up Back Buttons on Check-in
      //
      me.resetView();
      Ext.Viewport.setMasked(false);
      me.redirectTo('venue/' + venue.getId() + '/' + customerId);

      if (callback)
      {
         callback();
      }

      if (checkinMode)
      {
         // Let the screen complete the rendering process
         Ext.defer(me.checkReferralPrompt, 0.1 * 1000, me, [
         function()
         {
            //
            // We are in Merchant Account screen,
            // there's nothing to do after Successful Referral Challenge
            //
            //me.popView();
            Ext.device.Notification.show(
            {
               title : 'Successful Referral!',
               message : me.recvReferralb4VisitMsg(customer.getMerchant().get('name'))
            });
         }, null]);
      }
      console.debug("CheckIn - Done");
   },
   // --------------------------------------------------------------------------
   // CheckinExplore Page
   // --------------------------------------------------------------------------
   onLocationUpdate : function(position)
   {
      var me = this;
      var cestore = Ext.StoreMgr.get('CheckinExploreStore');
      var checkinContainer = me.getCheckInNowBar();

      Venue['setFindNearestURL']();
      cestore.load(
      {
         params :
         {
            latitude : position.coords.getLatitude(),
            longitude : position.coords.getLongitude()
         },
         callback : function(records, operation)
         {
            //Ext.Viewport.setMasked(false);
            if (operation.wasSuccessful())
            {
               me.setPosition(position);
               checkinContainer.setDisabled(false);
            }
            else
            {
               Ext.device.Notification.show(
               {
                  title : 'Warning',
                  message : me.missingVenueInfoMsg
               });
            }
         },
         scope : me
      });
   },
   onExploreLoad : function(forceReload)
   {
      var me = this;
      var cestore = Ext.StoreMgr.get('CheckinExploreStore');
      //
      // Do not reload page unless this is the first time!
      // Saves bandwidth
      //
      if ((cestore.getCount() == 0) || forceReload)
      {
         /*
          Ext.Viewport.setMasked(
          {
          xtype : 'loadmask',
          message : me.loadingPlaces
          });
          */
         me.getGeoLocation();
      }
   },
   onExploreActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this;

      activeItem.createView();

      var viewport = me.getViewPortCntlr();
      var checkinContainer = me.getCheckInNowBar();
      var tbbar = activeItem.query('titlebar')[0];

      switch (me.animMode)
      {
         case 'slide' :
            me.getBackBtn().show();
            me.getCloseBtn().hide();
            break;
         case 'slideUp' :
            me.getBackBtn().hide();
            me.getCloseBtn().show();
            break;
      }
      switch (me.mode)
      {
         case 'checkin':
            tbbar.setTitle('Nearby Places');
            checkinContainer.setDisabled(true);
            checkinContainer.show();
            break;
         case 'explore' :
            tbbar.setTitle('Explore Places');
            checkinContainer.hide();
            break;
      }
      me.onExploreLoad();
   },
   onExploreDeactivate : function(oldActiveItem, c, newActiveItem, eOpts)
   {
      var me = this;
   },
   onExploreSelect : function(d, model, eOpts)
   {
      d.deselect([model]);
      this.onExploreDisclose(d, model);
      return false;
   },
   onExploreDisclose : function(list, record, target, index, e, eOpts, eInfo)
   {
      var me = this;
      var viewport = me.getViewPortCntlr();

      Genesis.controller.ControllerBase.playSoundFile(viewport.sound_files['clickSound']);
      viewport.setVenue(record);
      switch (this.mode)
      {
         case 'checkin':
         {
            this.onCheckinTap(null, e, eOpts, eInfo);
            break;
         }
         case 'explore' :
         {
            this.onNonCheckinTap(null, e, eOpts, eInfo);
            break;
         }
      }
   },
   // --------------------------------------------------------------------------
   // Page Navigation
   // --------------------------------------------------------------------------
   explorePageUp : function()
   {
      this.openPage('explore', 'slideUp');
   },
   explorePage : function()
   {
      this.openPage('explore');
   },
   checkinPage : function()
   {
      this.openPage('checkin');
   },
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
   openPage : function(subFeature, animMode)
   {
      var me = this;
      var page = me.getMainPage();
      me.mode = page.mode = subFeature;
      me.animMode = animMode || 'slide';
      me.setAnimationMode(me.self.superclass.self.animationMode[me.animMode]);
      me.pushView(page);
   },
   getMainPage : function()
   {
      var page = this.getExplore();
      return page;
   },
   openMainPage : function()

   {
      var page = this.getMainPage();
      // Hack to fix bug in Sencha Touch API
      var plugin = page.query('list')[0].getPlugins()[0];
      plugin.refreshFn = plugin.getRefreshFn();

      this.pushView(page);
      console.log("Checkin Explore Opened");
   },
   isOpenAllowed : function()
   {
      return true;
   }
});
Ext.define('Genesis.controller.client.Challenges',
{
   extend : 'Genesis.controller.ControllerBase',
   requires : ['Ext.Anim'],
   statics :
   {
      challenges_path : '/clientChallenges'
   },
   xtype : 'clientChallengesCntlr',
   config :
   {
      routes :
      {
         'referrals' : 'referralsPage',
         'challenges' : 'challengesPage',
         'photoUpload' : 'photoUploadPage'
      },
      refs :
      {
         //
         // Challenges
         //
         challengeBtn : 'clientchallengepageview button[tag=doit]',
         challengePage :
         {
            selector : 'clientchallengepageview',
            autoCreate : true,
            xtype : 'clientchallengepageview'
         },
         challengeContainer : 'clientchallengepageview container[tag=challengeContainer]',
         challengeDescContainer : 'clientchallengepageview container[tag=challengePageItemDescWrapper]',
         //
         // Photo Challenge
         //
         uploadPhotosPage :
         {
            selector : 'clientuploadphotospageview',
            autoCreate : true,
            xtype : 'clientuploadphotospageview'
         },
         uploadPhotosBackground : 'clientuploadphotospageview container[tag=background]',
         postBtn : 'viewportview button[tag=post]',
         //
         // Referral Challenge
         //
         referralsPage :
         {
            selector : 'clientreferralsview',
            autoCreate : true,
            xtype : 'clientreferralsview'
         },
         qrcode : 'clientreferralsview component[tag=qrcode]',
         title : 'clientreferralsview component[tag=title]',
         referralsContainer : 'clientreferralsview container[tag=referralsMain]'
      },
      control :
      {
         challengePage :
         {
            activate : 'onActivate',
            deactivate : 'onDeactivate'
         },
         'clientchallengepageview > carousel dataview' :
         {
            select : 'onItemSelect'
         },
         challengeBtn :
         {
            tap : 'onChallengeBtnTap'
         },
         'actionsheet button[tag=library]' :
         {
            tap : 'onLibraryBtnTap'
         },
         'actionsheet button[tag=album]' :
         {
            tap : 'onAlbumBtnTap'
         },
         'actionsheet button[tag=camera]' :
         {
            tap : 'onCameraBtnTap'
         },
         uploadPhotosPage :
         {
            activate : 'onUploadPhotosActivate',
            deactivate : 'onUploadPhotosDeactivate'
         },
         postBtn :
         {
            tap : 'onUploadPhotosTap'
         },
         //
         // Referrals
         //
         referralsPage :
         {
            activate : 'onReferralsActivate',
            deactivate : 'onReferralsDeactivate'
         },
         'clientreferralsview container[tag=referralsMain] list' :
         {
            select : 'onReferralsSelect'
         },
         'clientreferralsview container button[tag=done]' :
         {
            tap : 'onCompleteReferralsChallenge'
         }
      },
      listeners :
      {
         'fbphotouploadcomplete' : 'onFbPhotoUploadComplete',
         'challengecomplete' : 'onChallengeComplete',
         'doChallenge' : 'onChallengeBtnTap'
      }
   },
   metaData : null,
   reservedReferralId : 0,
   referralCbFn : null,
   samplePhotoURL : 'http://photos.getkickbak.com/paella9finish1.jpg',
   noPhotoUploadedMsg : 'Failed to upload photo to server.',
   fbUploadFailedMsg : 'Failed to upload the photo onto your Facebook account',
   checkinFirstMsg : 'Please Check-In before performing challenges',
   photoUploadFbReqMsg : 'Connectivity to Facebook is required to upload photos to your account',
   completingChallengeMsg : 'Completing Challenge ...',
   referralInstructionMsg : 'Get your friend to scan this code using their KickBak App on their mobile phone!',
   photoUploadSuccessMsg : function(points)
   {
      return 'We\'ve added earned ' + points + ' points' + Genesis.constants.addCRLF() + //
      'towards your account for uploading photos to Facebook!';
   },
   photoTakenFailMsg : function(msg)
   {
      return msg + Genesis.constants.addCRLF() + 'No Photos were taken.'
   },
   photoUploadIncompletesMsg : 'Trouble updating to server.',
   photoUploadFailValidationMsg : 'Please enter a comment with at least 16 characters in length',
   getPointsMsg : function(points)
   {
      return 'You have earned ' + points + ' Pts from this challenge!';
   },
   getConsolationMsg : function(message)
   {
      return message + Genesis.constants.addCRLF() + 'Try our other challenges as well!';
      //return message;
   },
   confirmRecvReferralsMsg : 'Please have your Referral Code ready to be scanned',
   referralFailedMsg : 'Email failed to send',
   referralSavedMsg : 'Email saved.',
   sendReferralSuccessMsg : function()
   {
      return 'Email was sent successfully!' + Genesis.constants.addCRLF() + 'Every successful referral will get you extra points!';
   },
   visitFirstMsg : 'You must visit this establishment first before you are eligible to do this Challenge',
   init : function(app)
   {
      this.callParent(arguments);
      console.log("Challenge Init");
   },
   // --------------------------------------------------------------------------
   // Event Handlers
   // --------------------------------------------------------------------------
   photoEventHandler : function(position)
   {
      var me = this;
      if (me.imageURI)
      {
         if (Genesis.constants.isNative())
         {
            var options = new FileUploadOptions();
            options.fileKey = "image";
            // Token filename NOT be used
            options.fileName = "DummyPhoto.jpg";
            options.mimeType = "image/jpg";
            options.params =
            {
               "auth_token" : Genesis.db.getLocalDB()['auth_code']
            };
            options.chunkedMode = true;

            Ext.Viewport.setMasked(
            {
               xtype : 'loadmask',
               message : me.uploadServerMsg
            });

            var ft = new FileTransfer();
            var res, metaData;
            ft.upload(me.imageURI, Genesis.constants.host + '/api/v1/venues/share_photo', function(r)
            {
               try
               {
                  res = decodeURIComponent(r.response) || '';
                  console.debug('\n' + //
                  "Response = [" + res + ']\n' + //
                  "Code = " + r.responseCode + '\n' + "Sent = " + r.bytesSent);
                  res = Ext.decode(res);
                  if (res)
                  {
                     //
                     // Set MetaData from PhotoUpload here
                     //
                     metaData = me.metaData = res.metaData || null;
                     metaData['position'] = position;
                  }
                  else
                  {
                     console.log('No Data returned by the server.');
                  }
               }
               catch (ex)
               {
                  console.log('Unable to parse the JSON returned by the server: ' + ex.toString());
               }

               Ext.Viewport.setMasked(false);
               if (metaData && metaData['photo_url'] && metaData['upload_token'])
               {
                  console.log("Uploading to Facebook using upload_token[" + metaData['upload_token'] + "]...");

                  me.redirectTo('photoUpload');
               }
               delete me.imageURI;
            }, function(error)
            {
               Ext.Viewport.setMasked(false);
               console.log(me.noPhotoUploadedMsg(error.message + Genesis.constants.addCRLF()));
               //console.log("An error has occurred: Code = " + error.code);
               Ext.device.Notification.show(
               {
                  title : 'Error',
                  message : me.noPhotoUploadedMsg(error.message + Genesis.constants.addCRLF())
               });
               delete me.imageURI;
            }, options);
         }
         else
         {
            me.metaData =
            {
               'photo_url' : me.imageURI
            };
            me.redirectTo('photoUpload');
            /*
             Ext.device.Notification.show(
             {
             title : 'Error',
             message : "Cannot upload photo in Non-Native Mode"
             });
             */
         }
      }
   },
   referralEventHandler : function(referralsSelected)
   {
      var me = this, type;
      var venue = me.getViewPortCntlr().getVenue();
      var container = me.getReferralsContainer();
      var tag = referralsSelected.get('tag');

      //
      // Retrieve QRCode from Server
      //
      switch (tag)
      {
         case 'sender' :
         {
            type = 'direct';
            Ext.Viewport.setMasked(
            {
               xtype : 'loadmask',
               message : me.genQRCodeMsg
            });
            break;
         }
         case 'emailsender' :
         {
            type = 'email';
            Ext.Viewport.setMasked(
            {
               xtype : 'loadmask',
               message : me.retrieveAuthModeMsg
            });
            break;
         }
      }

      // Request QRCode from server for processing
      //
      Challenge['setSendReferralsUrl'](me.selectedItem.getId());
      Challenge.load(me.selectedItem.getId(),
      {
         jsonData :
         {
         },
         params :
         {
            'venue_id' : venue.getId(),
            'type' : type
         },
         callback : function(records, operation)
         {
            var metaData = Challenge.getProxy().getReader().metaData;
            /*
             if(operation.wasSuccessful() && (!metaData['data']))
             {
             Ext.Viewport.setMasked(false);
             Ext.device.Notification.show(
             {
             title : 'Error',
             message : me.noPtsXferMsg()
             });
             }
             */
            if (operation.wasSuccessful())
            {
               var qrcode;
               switch (tag)
               {
                  case 'sender' :
                  {
                     qrcode = Genesis.controller.ControllerBase.genQRCode(metaData['data']);

                     console.debug('\n' + //
                     'QRCode - ' + qrcode[0] + '\n' //
                     //+ 'Body - ' + emailTpl + '\n' + //
                     );
                     //
                     // Query server to get generate qrcode
                     //
                     if (qrcode[0])
                     {
                        me.getQrcode().setStyle(
                        {
                           'background-image' : 'url(' + qrcode[0] + ')',
                           'background-size' : Genesis.fn.addUnit(qrcode[1]) + ' ' + Genesis.fn.addUnit(qrcode[2])
                        });
                        container.setActiveItem(1);
                     }
                     Ext.Viewport.setMasked(false);
                     Ext.device.Notification.show(
                     {
                        title : 'Refer A Friend',
                        message : me.referralInstructionMsg
                     });
                     break;
                  }
                  case 'emailsender' :
                  {
                     qrcode = metaData['data']['qrcode'];
                     var emailTpl = metaData['data']['body'];
                     var subject = metaData['data']['subject'];

                     console.debug('\n' + //
                     'QRCode - ' + qrcode + '\n' + //
                     //'Body - ' + emailTpl + '\n' + //
                     'Subject - ' + subject + '\n' //
                     );

                     //emailTpl = emailTpl.replace(me.qrcodeRegExp, Genesis.controller.ControllerBase.genQRCodeInlineImg(qrcode));
                     //console.debug('\n' + //
                     //'Encoded Body - ' + emailTpl);
                     qrcode = Genesis.controller.ControllerBase.genQRCode(qrcode)[0].replace('data:image/gif;base64,', "");

                     window.plugins.emailComposer.showEmailComposerWithCB(function(res)
                     {
                        // Delay is needed to not block email sending ...
                        Ext.defer(function()
                        {
                           Ext.Viewport.setMasked(false);
                           switch (res)
                           {
                              case EmailComposer.ComposeResultType.Failed:
                              case EmailComposer.ComposeResultType.NotSent:
                              case EmailComposer.ComposeResultType.Cancelled:
                              {
                                 Ext.device.Notification.show(
                                 {
                                    title : 'Email Error',
                                    message : me.referralFailedMsg,
                                    callback : function()
                                    {
                                       me.onCompleteReferralsChallenge();
                                    }
                                 });
                                 break;
                              }
                              case EmailComposer.ComposeResultType.Saved:
                              {
                                 Ext.device.Notification.show(
                                 {
                                    title : 'Email Saved',
                                    message : me.referralSavedMsg,
                                    callback : function()
                                    {
                                       me.onCompleteReferralsChallenge();
                                    }
                                 });
                                 break;
                              }
                              case EmailComposer.ComposeResultType.Sent:
                              {
                                 Ext.device.Notification.show(
                                 {
                                    title : 'Email Sent!',
                                    message : me.sendReferralSuccessMsg(),
                                    callback : function()
                                    {
                                       me.onCompleteReferralsChallenge();
                                    }
                                 });
                                 break;
                              }
                           }
                        }, 1, me);
                     }, subject, emailTpl, null, null, null, true, [qrcode]);
                     break;
                  }
               }
            }
            else
            {
               Ext.Viewport.setMasked(false);
            }
         }
      });
   },
   vipEventHandler : function(position)
   {
      this.completeChallenge(null, position);
   },
   onLocationUpdate : function(position)
   {
      var me = this;
      //
      // Either we are in PhotoUpload mode, or we are in Challenge Authorization Mode
      //
      switch (me.selectedItem.get('type').value)
      {
         case 'photo' :
         {
            me.photoEventHandler(position);
            break;
         }
         case 'vip' :
         {
            me.vipEventHandler(position);
            break;
         }
         case 'referral' :
         {
            // Don't need GeoLocation information
            break;
         }
         case 'menu' :
         case 'birthday' :
         case 'custom' :
         default:
            me.metaData =
            {
               'position' : position
            };
            me.scanQRCode();
            break;
      }
   },
   onScannedQRcode : function(qrcode)
   {
      var me = this;

      if (qrcode != null)
      {
         me.completeChallenge(qrcode, (me.metaData) ? me.metaData['position'] : null);
      }
      else
      {
         console.debug(me.noCodeScannedMsg);
         Ext.device.Notification.show(
         {
            title : 'Error',
            message : me.noCodeScannedMsg
         });
      }
      me.metaData = null;
   },
   onChallengeComplete : function(type, qrcode, venueId, customerId, position, eOpts, eInfo)
   {
      var me = this;
      var metaData = Challenge.getProxy().getReader().metaData;
      var cstore = Ext.StoreMgr.get('CustomerStore');
      switch (type)
      {
         case 'referral' :
         {
            var id = metaData['id'];
            var customer = cstore.getById(id);
            if (!customer)
            {
               customer = cstore.add(metaData)[0];
            }
            //
            // Add to Referral DB
            //
            console.debug("Adding Referral Code to Referral DB ...");
            Genesis.db.addReferralDBAttrib("m" + customer.getMerchant().getId(), qrcode);

            if (me.referralCbFn)
            {
               console.debug("Calling Referral CallbackFn ...");
               me.referralCbFn();
               me.referralCbFn = null;
            }
            else
            {
               Ext.device.Notification.show(
               {
                  title : 'Successful Referral!',
                  message : me.recvReferralb4VisitMsg(customer.getMerchant().get('name')),
                  callback : function()
                  {
                     console.debug("Opening Merchant Account ...");
                     var app = me.getApplication();
                     var controller = app.getController('Accounts');
                     controller.setMode('profile');
                     controller.fireEvent('selectMerchant', cstore, customer);
                  }
               });
            }
            break;
         }
         case 'vip' :
         {
            Ext.device.Notification.show(
            {
               title : 'VIP Challenge',
               message : me.getConsolationMsg(metaData['message'])
            });
            me.getViewPortCntlr().updateRewardsTask.delay(1 * 1000, me.updateRewards, me, [metaData]);
            break;
         }
         default:
            console.log('Total Points - ' + metaData['account_points']);
            if (metaData['account_points'])
            {
               cstore.getById(customerId).set('points', metaData['account_points']);
            }
            //
            // Update points from the purchase or redemption
            // Bugfix - Copy string from server to prevent PhoneGap crash

            console.log('Points Earned - ' + metaData['points']);

            Ext.device.Notification.show(
            {
               title : 'Earn Points',
               message : ((metaData['points'] > 0) ? me.getPointsMsg(metaData['points']) : me.getConsolationMsg(metaData['message']))
            });
            me.getViewPortCntlr().updateRewardsTask.delay(1 * 1000, me.updateRewards, me, [metaData]);
            break;
      }
   },
   onFbPhotoUploadComplete : function()
   {
      var me = this;
      var cstore = Ext.StoreMgr.get('CustomerStore');
      var viewport = me.getViewPortCntlr();
      var venue = viewport.getVenue();
      var venueId = venue.getId();
      var metaData = me.metaData;
      var customerId = viewport.getCustomer().getId();
      var points = me.selectedItem.get('points');
      var id = me.selectedItem.getId();

      Challenge['setCompleteChallengeURL'](id);
      Challenge.load(id,
      {
         jsonData :
         {
         },
         params :
         {
            venue_id : venueId,
            latitude : metaData['position'].coords.getLatitude(),
            longitude : metaData['position'].coords.getLongitude(),
            'upload_token' : metaData['upload_token']
         },
         callback : function(records, operation)
         {
            Ext.Viewport.setMasked(false);

            var metaData2 = Challenge.getProxy().getReader().metaData;
            if (operation.wasSuccessful() && metaData2)
            {
               //
               // Update points from the purchase or redemption
               //
               cstore.getById(customerId).set('points', metaData2['account_points']);
               console.debug("Points Earned = " + metaData2['points'] + ' Pts');
               Ext.device.Notification.show(
               {
                  title : 'Upload Complete',
                  message : ((metaData2['points'] > 0) ? me.photoUploadSuccessMsg(metaData2['points']) : me.getConsolationMsg(metaData2['message'])),
                  callback : function()
                  {
                     me.metaData = null;
                     me.popView();
                  }
               });
               viewport.updateRewardsTask.delay(1 * 1000, me.updateRewards, me, [metaData2]);
            }
            else
            {
               Ext.device.Notification.show(
               {
                  title : 'Upload Failed!',
                  message : me.photoUploadIncompletesMsg,
                  buttons : ['Try Again', 'Cancel'],
                  callback : function(btn)
                  {
                     if (btn.toLowerCase() == 'try again')
                     {
                        Ext.defer(me.completeUploadPhotosChallenge, 1 * 1000, me);
                     }
                     else
                     {
                        //
                        // Go back to Checked-in Merchant Account
                        //
                        me.metaData = null;
                        me.redirectTo('main');
                        //me.fireEvent('openpage', 'MainPage', 'main', null);
                     }
                  }
               });
            }
         }
      });
   },
   // --------------------------------------------------------------------------
   // Challenge Page
   // --------------------------------------------------------------------------
   onItemSelect : function(d, model, eOpts)
   {
      Genesis.controller.ControllerBase.playSoundFile(this.getViewPortCntlr().sound_files['clickSound']);

      var carousel = this.getChallengePage().query('carousel')[0];
      // No need to update the Challenge Menu. Nothing changed.
      for (var i = 0; i < carousel.getInnerItems().length; i++)
      {
         var list = carousel.getInnerItems()[i];
         if (list != d)
         {
            list.deselectAll();
         }
      }

      //d.deselect([model], false);
      var desc = this.getChallengeDescContainer();
      Ext.Anim.run(desc.element, 'fade',
      {
         direction : 'right',
         duration : 600,
         out : false,
         autoClear : true,
         scope : this,
         before : function()
         {
            for (var i = 0; i < desc.getItems().length; i++)
            {
               desc.getItems().getAt(i).updateData(model.getData());
            }
            this.selectedItem = model;
         }
      });
      this.getChallengeContainer().show();
      return true;
   },
   onChallengeBtnTap : function(b, e, eOpts, eInfo)
   {
      var me = this;
      var viewport = me.getViewPortCntlr();
      var cvenue = viewport.getCheckinInfo().venue;
      var venue = viewport.getVenue();
      var selectedItem = me.selectedItem;

      // VenueId can be found after the User checks into a venue
      if (!(cvenue && venue && (cvenue.getId() == venue.getId())))
      {
         Ext.device.Notification.show(
         {
            title : 'Error',
            message : me.checkinFirstMsg
         });
         return;
      }

      if (selectedItem)
      {
         switch (selectedItem.get('type').value)
         {
            case 'photo' :
            {
               me.getChallengePage().takePhoto();
               break;
            }
            case 'referral' :
            {
               me.redirectTo('referrals');
               break;
            }
            case 'menu' :
            case 'birthday' :
            case 'vip' :
            case 'custom' :
            {
               if (selectedItem.get('require_verif'))
               {
                  Ext.device.Notification.show(
                  {
                     title : me.selectedItem.get('name') + ' Challenge',
                     message : me.showToServerMsg,
                     callback : function()
                     {
                        me.getGeoLocation();
                     }
                  });
               }
               else
               {
                  me.getGeoLocation();
               }
               break;
            }
         }
      }
   },
   onActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this;
      //Ext.defer(activeItem.createView, 1, activeItem);
      activeItem.createView();
      delete me.selectedItem;
   },
   onDeactivate : function(oldActiveItem, c, newActiveItem, eOpts)
   {
      var me = this;
   },
   completeChallenge : function(qrcode, position, eOpts, eInfo)
   {
      var me = this;
      var id, type, params;
      if (!position)
      {
         type = 'referral';
         id = me.reservedReferralId;
         // Used for Receiving Referrals
         params =
         {
         }
         Challenge['setCompleteReferralChallengeURL']();
      }
      else
      {
         var viewport = me.getViewPortCntlr();
         var venueId = viewport.getVenue().getId();
         var customerId = viewport.getCustomer().getId();
         id = me.selectedItem.getId();
         type = me.selectedItem.get('type').value;
         params =
         {
            venue_id : venueId,
            latitude : position.coords.getLatitude(),
            longitude : position.coords.getLongitude(),
         }
         Challenge['setCompleteChallengeURL'](id);
      }

      console.log("Completing Challenge ID(" + id + ")");
      Challenge.load(id,
      {
         jsonData :
         {
         },
         params : Ext.apply(params,
         {
            'data' : qrcode
         }),
         callback : function(record, operation)
         {
            var metaData = Challenge.getProxy().getReader().metaData;
            console.log('Challenge Completed(' + operation.wasSuccessful() + ')');
            Ext.Viewport.setMasked(false);
            if (operation.wasSuccessful() && metaData)
            {
               me.fireEvent('challengecomplete', type, qrcode, venueId, customerId, position);
            }
         }
      });
   },
   // --------------------------------------------------------------------------
   // Referrals Challenge Page
   // --------------------------------------------------------------------------
   onReferralsActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this;
      //var container = me.getReferralsContainer();
      //container.setActiveItem(0);
      activeItem.createView();
      //Ext.defer(activeItem.createView, 1, activeItem);
   },
   onReferralsDeactivate : function(oldActiveItem, c, activeItem, eOpts)
   {
      var me = this;
   },
   onCompleteReferralsChallenge : function(b, e, eOpts)
   {
      // Nothing to do but go back to Main Challenge Page
      this.popView();
   },
   onReferralsSelect : function(list, model, eOpts)
   {
      var me = this;

      if (me.getViewPortCntlr().getCustomer().get('visits') > 0)
      {
         if (list)
         {
            list.deselect([model]);
         }
         switch (model.get('tag'))
         {
            case 'emailsender' :
            case 'sender' :
            {
               me.referralEventHandler(model);
               break;
            }
         }
      }
      else
      {
         Ext.device.Notification.show(
         {
            title : 'Referral Challenge',
            message : me.visitFirstMsg
         });
      }
      return false;
   },
   // --------------------------------------------------------------------------
   // Photos Upload Page
   // --------------------------------------------------------------------------
   onCameraSuccessFn : function(imageURI)
   {
      var me = this;

      console.debug("image URI =[" + imageURI + "]");

      Ext.Viewport.setMasked(false);
      me.imageURI = imageURI;
      me.getGeoLocation();
   },
   onCameraErrorFn : function(message)
   {
      var me = this;
      console.debug("onCameraErrorFn - message[" + message + "]");

      Ext.Viewport.setMasked(false);
      Ext.device.Notification.show(
      {
         title : 'Error',
         message : me.photoTakenFailMsg(message)
      });
   },
   onPhotoBtnCommon : function(sourceType)
   {

      var me = this;
      var photoAction = me.getChallengePage().photoAction;
      photoAction.hide();

      console.log("Checking for Facebook Plugin ...");
      if (Genesis.constants.isNative())
      {
         Genesis.fb.facebook_onLogin(function(params)
         {
            console.log("Accessing Camera Plugin ...");
            Ext.Viewport.setMasked(
            {
               xtype : 'loadmask',
               message : me.cameraAccessMsg
            });

            var cameraOptions =
            {
               quality : 49,
               destinationType : Camera.DestinationType.FILE_URI,
               sourceType : sourceType,
               allowEdit : true,
               encodingType : Camera.EncodingType.JPEG,
               targetWidth : 960
               //targetHeight : 480
            };
            navigator.camera.getPicture(Ext.bind(me.onCameraSuccessFn, me), Ext.bind(me.onCameraErrorFn, me), cameraOptions);
         }, true, me.photoUploadFbReqMsg);
      }
      else
      {
         me.onCameraSuccessFn(me.samplePhotoURL);
      }

   },
   onLibraryBtnTap : function(b, e, eOpts, eInfo)
   {
      this.onPhotoBtnCommon(Genesis.constants.isNative() ? Camera.PictureSourceType.PHOTOLIBRARY : null);
   },
   onAlbumBtnTap : function(b, e, eOpts, eInfo)
   {
      this.onPhotoBtnCommon(Genesis.constants.isNative() ? Camera.PictureSourceType.SAVEDPHOTOALBUM : null);
   },
   onCameraBtnTap : function(b, e, eOpts, eInfo)
   {
      this.onPhotoBtnCommon(Genesis.constants.isNative() ? Camera.PictureSourceType.CAMERA : null);
   },
   onUploadPhotosActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this;

      //me.getPostBtn().show();
      activeItem.metaData = me.metaData;
      //Ext.defer(activeItem.createView, 1, activeItem);
      activeItem.createView();
   },
   onUploadPhotosDeactivate : function(oldActiveItem, c, newActiveItem, eOpts)
   {
      var me = this;
      //this.getPostBtn().hide();
   },
   onUploadPhotosTap : function(b, e, eOpts, eInfo)
   {
      var me = this;
      var page = me.getUploadPhotosPage();
      var textareafield = page.query('textareafield')[0];
      var desc = textareafield.getValue();

      if ((desc.length > textareafield.getMaxLength()) || (desc.length < 16))
      {
         Ext.device.Notification.show(
         {
            title : 'Error',
            message : me.photoUploadFailValidationMsg,
            callback : function()
            {
               textareafield.focus();
            }
         });
         return;
      }

      Ext.Viewport.setMasked(
      {
         xtype : 'loadmask',
         message : me.completingChallengeMsg
      });
      var viewport = me.getViewPortCntlr();
      var venue = viewport.getVenue();

      FB.api('/me/photos', 'post',
      {
         'message' : desc,
         'url' : me.metaData['photo_url'],
         'access_token' : FB.getAccessToken()
         /*
          ,"place" :
          {
          "name" : venue.get('name'),
          "location" :
          {
          "street" : venue.get('address'),
          "city" : venue.get('city'),
          "state" : venue.get('state'),
          "country" : venue.get('country'),
          "latitude" : venue.get('latitude'),
          "longitude" : venue.get('longitude')
          }
          }
          */
      }, function(response)
      {
         if (!response || response.error)
         {
            var message = (response && response.error) ? response.error.message : me.fbUploadFailedMsg;
            Ext.Viewport.setMasked(false);
            Ext.device.Notification.show(
            {
               title : 'Upload Failed!',
               message : message,
               buttons : ['Try Again', 'Cancel'],
               callback : function(btn)
               {
                  if (btn.toLowerCase() == 'try again')
                  {
                     Ext.defer(me.onUploadPhotosTap, 100, me);
                  }
                  else
                  {
                     //
                     // Go back to Checked-in Merchant Account
                     //
                     me.metaData = null;
                     me.popView();
                  }
               }
            });
         }
         else
         {
            console.debug('Facebook Post ID - ' + response.id);
            me.fireEvent('fbphotouploadcomplete');
         }
      });
   },
   // --------------------------------------------------------------------------
   // Page Navigation
   // --------------------------------------------------------------------------
   referralsPage : function()
   {
      var me = this;
      //
      // Show Referrals Page
      //
      me.setAnimationMode(me.self.superclass.self.animationMode['slide']);
      me.pushView(me.getReferralsPage());
   },
   challengesPage : function()
   {
      this.setAnimationMode(this.self.superclass.self.animationMode['slideUp']);
      this.pushView(this.getMainPage());
   },
   photoUploadPage : function()
   {
      var me = this;
      //
      // Goto PhotoUpload Page
      //
      me.setAnimationMode(me.self.superclass.self.animationMode['slideUp']);
      me.pushView(me.getUploadPhotosPage());
   },
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
   openPage : function(subFeature, cb)
   {
      var me = this;
      if (cb)
      {
         me.referralCbFn = cb;
      }
      switch (subFeature)
      {
         case 'referrals' :
         {
            Ext.device.Notification.show(
            {
               title : 'Referral Challenge',
               message : me.confirmRecvReferralsMsg,
               buttons : ['Proceed', 'Cancel'],
               callback : function(btn)
               {
                  if (btn.toLowerCase() == 'proceed')
                  {
                     delete me.selectedItem;
                     me.metaData = null;
                     me.scanQRCode();
                  }
               }
            });
            break;
         }
         default:
            break;
      }
   },
   getMainPage : function()
   {
      var page = this.getChallengePage();
      return page;
   },
   openMainPage : function()
   {
      this.redirectTo('challenges');
      console.log("Client ChallengePage Opened");
   },
   isOpenAllowed : function()
   {
      return true;
   }
});
Ext.define('Genesis.controller.Merchants',
{
   extend : 'Genesis.controller.ControllerBase',
   requires : ['Ext.data.Store'],
   statics :
   {
      googleMapStaticUrl : 'http://maps.googleapis.com/maps/api/staticmap'
   },
   xtype : 'merchantsCntlr',
   config :
   {
      routes :
      {
         'venue/:id/:id' : 'mainPage',
         'venue/:id/:id/:id' : 'backToMainPage'
      },
      refs :
      {
         main :
         {
            selector : 'merchantaccountview',
            autoCreate : true,
            xtype : 'merchantaccountview'
         },
         merchantMain : 'merchantaccountview container[tag=merchantMain]',
         tbPanel : 'merchantaccountview dataview[tag=tbPanel]',
         prizesWonPanel : 'merchantaccountview component[tag=prizesWonPanel]',
         feedContainer : 'merchantaccountview container[tag=feedContainer]',
         descContainer : 'merchantaccountview container[tag=descContainer]',
         descPanel : 'merchantaccountview container[tag=descPanel]',
         //address : 'merchantaccountview component[tag=address]',
         //stats : 'merchantaccountview formpanel[tag=stats]',
         merchantDetails :
         {
            selector : 'merchantdetailsview',
            autoCreate : true,
            xtype : 'merchantdetailsview'
         },
         mapBtn : 'viewportview button[tag=mapBtn]',
         shareBtn : 'viewportview button[tag=shareBtn]',
         checkinBtn : 'viewportview button[tag=checkin]',
         mainBtn : 'merchantaccountview tabbar[cls=navigationBarBottom] button[tag=main]',
         prizesBtn : 'merchantaccountview tabbar[cls=navigationBarBottom] button[tag=prizes]',
         merchantTabBar : 'merchantaccountview tabbar'
      },
      control :
      {
         main :
         {
            activate : 'onMainActivate',
            deactivate : 'onMainDeactivate'
         },
         mapBtn :
         {
            tap : 'onMapBtnTap'
         },
         'merchantaccountview button[ui=orange]' :
         {
            tap : 'onMerchantAccountRewardsTap'
         },
         'merchantaccountview list' :
         {
            select : 'onMainSelect',
            disclose : 'onMainDisclose'
         },
         checkinBtn :
         {
            tap : 'onCheckinTap'
         },
         merchantTabBar :
         {
            tabchange : 'onTabBarTabChange'
         },
         //
         //  Merchant Details Page
         //
         merchantDetails :
         {
            activate : 'onDetailsActivate',
            deactivate : 'onDetailsDeactivate'
         },
         'merchantdetailsview map' :
         {
            maprender : 'onMapRender'
         },
         'merchantdetailsview component[tag=map]' :
         {
            // Goto CheckinMerchant.js for "painted" support
            //painted : 'onMapPainted'
         }
      }
   },
   checkinFirstMsg : 'Please Check-in before redeeming rewards',
   init : function()
   {
      var me = this;
      //
      // Clears all Markers on Google Map
      //
      me.markersArray = [];
      if (window.google && window.google.maps && window.google.maps.Map)
      {
         google.maps.Map.prototype.clearOverlays = function()
         {
            if (me.markersArray)
            {
               for (var i = 0; i < me.markersArray.length; i++)
               {
                  me.markersArray[i].setMap(null);
               }
            }
         }
      }
      else
      {
         console.debug("Google Maps API cannot be instantiated");
      }

      //
      // Store used for rendering purposes
      //
      Ext.regStore('MerchantRenderStore',
      {
         model : 'Genesis.model.Venue',
         autoLoad : false
      });

      me.callParent(arguments);

      console.log("Merchants Init");
   },
   // --------------------------------------------------------------------------
   // Merchant Details Page
   // --------------------------------------------------------------------------
   onActivateCommon : function(map, gmap)
   {
      var gm = (window.google && window.google.maps && window.google.maps.Marker) ? window.google.maps : null;
      if (gmap && gm)
      {
         map.getMap().clearOverlays();
         this.marker = new gm.Marker(Ext.apply(this.markerOptions,
         {
            map : gmap
         }));
         map.setMapCenter(this.latLng);
      }
      else
      //if(!gm)
      {
         //this.onMapWidthChange(map);
         //console.debug("Cannot load Google Maps");
      }
   },
   onDetailsActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var page = this.getMerchantDetails();
      var venue = this.getViewPortCntlr().getVenue();

      // Refresh Merchant Details Info
      //Ext.StoreMgr.get('MerchantRenderStore').setData(vrecord);

      // Update TitleBar
      activeItem.query('titlebar')[0].setTitle(venue.get('name'));

      //var map = page.query('component[tag=map]')[0];
      //var map = page.query('map')[0];

      // Show Share Icon
      this.getShareBtn().show();
      //this.getMainBtn().hide();

      //this.onActivateCommon(map, map.getMap());
      //this.onActivateCommon(map, null);

      activeItem.createView();
   },
   onDetailsDeactivate : function(oldActiveItem, c, activeItem, eOpts)
   {
      //var me = this;
      //this.getShareBtn().hide();
   },
   onMapRender : function(map, gmap, eOpts)
   {
      //this.onActivateCommon(map, gmap);
   },
   // --------------------------------------------------------------------------
   // Event Handlers
   // --------------------------------------------------------------------------
   onLocationUpdate : function(position)
   {
      var me = this;
      var app = me.getApplication();
      var controller = app.getController('Checkins');
      controller.setPosition(position);
      controller.fireEvent('checkin');
   },
   // --------------------------------------------------------------------------
   // Merchant Account Page
   // --------------------------------------------------------------------------
   /*
    onUpdateWinnersCount : function(metaData)
    {
    var panel = this.getPrizesWonPanel();
    // Initial Main Page Object
    if(!panel)
    {
    this.getMain();
    panel = this.getPrizesWonPanel();
    }
    panel.setData(metaData);
    this.winnersCount = metaData;
    },
    */
   onMainActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this;
      var viewport = me.getViewPortCntlr();
      var page = me.getMain();
      var vrecord = viewport.getVenue();
      var crecord = viewport.getCustomer();
      var customerId = viewport.getCustomer().getId();
      var venueId = vrecord.getId();
      var merchantId = vrecord.getMerchant().getId();

      var cvenue = viewport.getCheckinInfo().venue;
      var checkedIn = (cvenue != null);
      var checkedInMatch = (checkedIn && (cvenue.getId() == venueId));

      // Update TitleBar
      activeItem.query('titlebar')[0].setTitle(vrecord.get('name'));

      //
      // Either we are checked-in or
      // customer exploring a venue they checked-in in the past ...
      //
      if (checkedInMatch)
      {
         page.renderFeed = true;
         //me.getAddress().hide();
         //me.getStats().show();
         console.debug("Merchant Checkin Mode");
      }
      //
      // Explore Mode
      //
      else
      {
         page.renderFeed = me.showFeed;
         //me.getAddress().setData(vrecord.getData(true));
         //me.getAddress().show();
         //me.getStats().hide();
         console.debug("Merchant Explore Mode");
      }
      //me.getDescPanel().setData(vrecord);
      //me.getDescContainer().show();

      //
      // Update Winners Count
      //
      if (me.winnersCount)
      {
         vrecord.set('winners_count', me.winnersCount['winners_count']);
         //me.onUpdateWinnerssCount(me.winnersCount);
      }

      // Refresh Merchant Panel Info
      Ext.StoreMgr.get('MerchantRenderStore').setData(vrecord);

      //
      // Show Map Buttons
      //
      me.getMapBtn().show();

      //
      // CheckIn button
      //
      me.getCheckinBtn()[(!checkedIn || !checkedInMatch) ? 'show' : 'hide']();

      //
      // Main Menu button
      //
      page.showCheckinBtn = (checkedIn && !checkedInMatch);

      //
      // Update Badges
      //
      var prizesCount = 0, prizes = Ext.StoreMgr.get('MerchantPrizeStore').getRange();
      for (var i = 0; i < prizes.length; i++)
      {
         if (prizes[i].getMerchant().getId() == merchantId)
         {
            prizesCount++;
         }
      }
      page.prizesCount = (prizesCount > 0) ? prizesCount : null;

      // Precreate the DOMs
      //Ext.defer(page.createView, 1, page);
      page.createView();

      if (this.getMainBtn())
      {
         this.getMainBtn().hide();
      }
   },
   onMainDeactivate : function(oldActiveItem, c, activeItem, eOpts)
   {
      //var me = this;
      //this.getMapBtn().hide();
      //this.getCheckinBtn().hide();
   },
   onMainDisclose : function(list, record, target, index, e, eOpts)
   {
      var me = this;
      var viewport = me.getViewPortCntlr();
      var cvenue = viewport.getCheckinInfo().venue;
      var venue = viewport.getVenue();

      Genesis.controller.ControllerBase.playSoundFile(viewport.sound_files['clickSound']);
      if (!cvenue || !venue || (venue.getId() != cvenue.getId()))
      {
         Ext.device.Notification.show(
         {
            title : 'Rewards',
            message : me.checkinFirstMsg
         });
         return;
      }
      switch (record.get('reward_type'))
      {
         case 'vip' :
         {
            break;
         }
         default:
            var app = me.getApplication();
            var controller = app.getController('Prizes');
            var rstore = Ext.StoreMgr.get('RedemptionsStore');
            record = rstore.getById(record.get('reward_id'));
            me.fireEvent('redeemRewards', Ext.create('Genesis.model.EarnPrize',
            {
               //'id' : 1,
               'expiry_date' : null,
               'reward' : record,
               'merchant' : viewport.getCheckinInfo().venue.getMerchant()
            }));
            break;
      }
   },
   onMainSelect : function(d, model, eOpts)
   {
      d.deselect([model]);
      this.onMainDisclose(d, model);
      return false;
   },
   onCheckinTap : function(b, e, eOpts, eInfo)
   {
      var me = this;
      me.getGeoLocation();
   },
   onCheckedInAccountTap : function(b, e, eOpts, eInfo)
   {
      var me = this;
      var viewport = me.getViewPortCntlr();
      var vport = me.getViewport();
      var app = me.getApplication();
      var ccntlr = app.getController('Checkins');
      var estore = Ext.StoreMgr.get('EligibleRewardsStore');
      var cinfo = viewport.getCheckinInfo();

      var ccustomer = cinfo.customer;
      var cvenue = cinfo.venue;
      var cmetaData = cinfo.metaData;
      var venue = viewport.getVenue();

      if (venue.getId() != cvenue.getId())
      {
         console.log("Reloading to Checked-In Merchant Home Account Page ...");

         // Restore Merchant Info
         ccntlr.setupCheckinInfo('checkin', cvenue, ccustomer, cmetaData);
         viewport.updateRewardsTask.delay(1 * 1000, me.updateRewards, me, [cmetaData]);
      }
      //
      // Force Page to refresh
      //
      if (me.getMainPage() == vport.getActiveItem())
      {
         var anim = new Ext.fx.layout.Card(me.self.superclass.self.animationMode['fade']);
         var controller = vport.getEventDispatcher().controller;

         // Delete current page and refresh
         me.getMainPage().destroy();

         me.getViewport().animateActiveItem(me.getMainPage(), anim);
         anim.onActiveItemChange(vport.getLayout(), me.getMainPage(), me.getMainPage(), null, controller);
         anim.on('animationend', function()
         {
            anim.destroy();
         }, this);
         vport.doSetActiveItem(me.getMainPage(), null);
      }
      else
      {
         me.resetView();
         me.setAnimationMode(me.self.superclass.self.animationMode['flip']);
         me.pushView(me.getMainPage());
      }
   },
   onMapBtnTap : function(b, e, eOpts, eInfo)
   {
      var me = this;
      /*
       var gm = (window.google && window.google.maps && window.google.maps.LatLng) ? window.google.maps : null;
       //
       // Loads currently checked-in / explore Venue into the store
       //
       if(gm)
       {
       this.latLng = new gm.LatLng(record.get('latitude'), record.get('longitude'));
       this.markerOptions =
       {
       position : this.latLng,
       title : record.get('name')
       }
       }
       else
       */
      {
         var record = me.getViewPortCntlr().getVenue();
         me.latLng = record.get('latitude') + ',' + record.get('longitude');
         var color = 'red', label = '';
         var address = record.get('address') + ', ' + record.get('city') + ', ' +
         //
         record.get('state') + ', ' + record.get('country') + ', ' + record.get('zipcode');

         me.markerOptions =
         {
            markers : 'color:' + color + '|' + 'label:' + label + '|' + this.latLng,
            //center : address,
            center : me.latLng,
            title : record.get('name')
         }
         //console.debug("Cannot Retrieve Google Map Information.");
      }

      me.setAnimationMode(me.self.superclass.self.animationMode['slide']);
      me.pushView(me.getMerchantDetails());
   },
   onTabBarTabChange : function(bar, newTab, oldTab, eOpts)
   {
      switch(newTab.config.tag)
      {
         case 'rewards' :
         case 'main' :
         {
            Ext.defer(function()
            {
               if (newTab)
               {
                  newTab.setActive(false);
               }

               if (oldTab)
               {
                  oldTab.setActive(false);
               }
            }, 200);
            break;
         }
      }

      return true;
   },
   // --------------------------------------------------------------------------
   // Page Navigation
   // --------------------------------------------------------------------------
   mainPage : function(venueId, customerId)
   {
      this.backToMainPage(venueId, customerId, 0);
   },
   backToMainPage : function(venueId, customerId, backToMain)
   {
      var viewport = this.getViewPortCntlr();
      var cvenue = viewport.getCheckinInfo().venue;
      var showFeed = (customerId > 0) || (cvenue && (cvenue.getId() == venueId));
      this.openMainPage(showFeed, backToMain > 0);
   },
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
   getMainPage : function()
   {
      // Check if this is the first time logging into the venue
      //var view = (this.getViewport().getCustomerId() > 0);
      //return this[view ? 'getMain' : 'getPage']();
      return this.getMain();
   },
   openMainPage : function(showFeed, backToMain)
   {
      var me = this;

      // Check if this is the first time logging into the venue
      me.showFeed = showFeed;
      if (!backToMain)
      {
         me.setAnimationMode(me.self.superclass.self.animationMode['flip']);
         me.pushView(me.getMainPage());
      }
      else
      {
         me.onCheckedInAccountTap();
      }
      console.log("Merchant Account Opened");
   }
});
Ext.define('Genesis.controller.client.Rewards',
{
   extend : 'Genesis.controller.ControllerBase',
   requires : ['Ext.data.Store'],
   statics :
   {
      clientRewards_path : '/clientRewards'
   },
   xtype : 'clientRewardsCntlr',
   models : ['PurchaseReward', 'CustomerReward'],
   config :
   {
      routes :
      {
         'scanAndWin' : 'scanAndWinPage'
      },
      refs :
      {
         backButton : 'clientrewardsview button[tag=close]',
         //
         // Rewards
         //
         rewards :
         {
            selector : 'clientrewardsview',
            autoCreate : true,
            xtype : 'clientrewardsview'
         },
         price : 'clientrewardsview textfield'
      },
      control :
      {
         rewards :
         {
            activate : 'onActivate',
            deactivate : 'onDeactivate'
         }
      },
      listeners :
      {
         'metadataChange' : 'onPrizeStoreMetaChange'
      }
   },
   loadCallback : null,
   missingEarnPtsCodeMsg : 'No Authorization Code was found.',
   checkinFirstMsg : 'Please Check-In before earning rewards',
   authCodeReqMsg : 'Proceed to scan an Authorization Code from your server to earn Reward Points!',
   prizeCheckMsg : 'Find out if you won a PRIZE!',
   getPointsMsg : function(points)
   {
      return 'You\'ve earned ' + points + ' Points from this purchase!';
   },
   getReferralMsg : function(points)
   {
      return this.getVipMsg(points);
   },
   getVipMsg : function(points)
   {
      return 'You\'ve earned an ' + Genesis.constants.addCRLF() + //
      'additional ' + points + ' Points!' + Genesis.constants.addCRLF() + //
      this.prizeCheckMsg;
   },
   vipPopUp : function(points, callback)
   {
      callback = callback || Ext.emptyFn;
      Ext.device.Notification.show(
      {
         title : 'VIP Challenge',
         message : this.getVipMsg(points),
         callback : callback
      });
   },
   referralPopUp : function(points, callback)
   {
      callback = callback || Ext.emptyFn;
      Ext.device.Notification.show(
      {
         title : 'Referral Challenge',
         message : this.getReferralMsg(points),
         callback : callback
      });
   },
   init : function()
   {
      this.callParent(arguments);
      console.log("Client Rewards Init");
   },
   // --------------------------------------------------------------------------
   // Event Handlers
   // --------------------------------------------------------------------------
   onScannedQRcode : function(qrcode)
   {
      var me = this;
      if (qrcode)
      {
         //anim.disable();
         //container.setActiveItem(0);
         //anim.enable();
         me.qrcode = qrcode;
         me.getGeoLocation();
      }
      else
      {
         console.debug(me.missingEarnPtsCodeMsg);
         Ext.device.Notification.show(
         {
            title : 'Error',
            message : me.missingEarnPtsCodeMsg,
            callback : function()
            {
               //me.popView();
            }
         });
      }
   },
   onLocationUpdate : function(position)
   {
      var me = this;
      var viewport = me.getViewPortCntlr();
      var venue = viewport.getVenue();
      var venueId = venue.getId();
      var reader = CustomerReward.getProxy().getReader();
      var pstore = Ext.StoreMgr.get('MerchantPrizeStore');

      //
      // Triggers PrizeCheck and MetaDataChange
      // - subject CustomerReward also needs to be reset to ensure property processing of objects
      //
      //console.debug("qrcode =[" + me.qrcode + ']');
      EarnPrize['setEarnPrizeURL']();
      reader.setRootProperty('');
      reader.buildExtractors();
      pstore.loadPage(1,
      {
         jsonData :
         {
         },
         params :
         {
            venue_id : venueId,
            'data' : me.qrcode,
            latitude : position.coords.getLatitude(),
            longitude : position.coords.getLongitude()
         },
         callback : function(records, operation)
         {
            reader.setRootProperty('data');
            reader.buildExtractors();
            if (operation.wasSuccessful())
            {
               me.loadCallback = arguments;
            }
            else
            {
               //me.popView();
            }
         }
      });
      delete me.qrcode;
   },
   // --------------------------------------------------------------------------
   // Rewards Page
   // --------------------------------------------------------------------------
   startRouletteScreen : function()
   {
      var scn = this.getRewards();
      var rouletteTable = Ext.get(Ext.DomQuery.select('div.rouletteTable',scn.element.dom)[0]);
      rouletteTable.addCls('spinFwd');
      var rouletteBall = Ext.get(Ext.DomQuery.select('div.rouletteBall',scn.element.dom)[0]);
      rouletteBall.addCls('spinBack');
   },
   onEarnPtsTap : function(b, e, eOpts, eInfo)
   {
      var me = this;
      var allowedMsg = me.isOpenAllowed();
      if (allowedMsg !== true)
      {
         Ext.device.Notification.show(
         {
            title : 'Error',
            message : allowedMsg
         });
         return;
      }
      else
      {
         var _onSuccess = function()
         {
            //me.popView();
            Ext.device.Notification.show(
            {
               title : 'Earning Reward Points',
               message : me.authCodeReqMsg,
               buttons : ['OK', 'Cancel'],
               callback : function(btn)
               {
                  if (btn.toLowerCase() == 'ok')
                  {
                     me.scanQRCode();
                  }
               }
            });
         };
         me.checkReferralPrompt(_onSuccess, _onSuccess);
      }
   },
   metaDataHandler : function(metaData)
   {
      var me = this;
      var viewport = me.getViewPortCntlr();
      var exit = function()
      {
         //
         // Clear Referral DB
         //
         Genesis.db.removeReferralDBAttrib("m" + viewport.getVenue().getMerchant().getId());
         me.redirectTo('scanAndWin');
      };

      //
      // Update points from the purchase or redemption
      //
      var cstore = Ext.StoreMgr.get('CustomerStore');
      var customerId = viewport.getCustomer().getId();
      if (metaData['account_points'])
      {
         cstore.getById(customerId).set('points', metaData['account_points']);
      }
      if (metaData['account_visits'])
      {
         cstore.getById(customerId).set('visits', metaData['account_visits']);
      }

      if (Ext.isDefined(metaData['points']))
      {
         me.getRewards();
         // Preload page
         message = me.getPointsMsg(metaData['points']);
         if (!metaData['vip_challenge'] && !metaData['referral_challenge'])
         {
            message += Genesis.constants.addCRLF() + me.prizeCheckMsg;
         }
         Ext.device.Notification.show(
         {
            title : 'Reward Points Update',
            message : message,
            callback : function()
            {
               if ((metaData['vip_challenge']))
               {
                  me.vipPopUp(metaData['vip_challenge'].points, exit);
               }
               else
               if ((metaData['referral_challenge']))
               {
                  me.referralPopUp(metaData['referral_challenge'].points, exit);
               }
               else
               {
                  exit();
               }
            }
         });
      }
      else
      if (metaData['vip_challenge'])
      {
         // Preload page
         me.getRewards();
         me.vipPopUp(metaData['vip_challenge'].points, exit);
      }
      else
      if (metaData['referral_challenge'])
      {
         // Preload page
         me.getRewards();
         me.referralPopUp(metaData['referral_challenge'].points, exit);
      }
   },
   onPrizeStoreMetaChange : function(pstore, metaData)
   {
      var me = this;
      var viewport = me.getViewPortCntlr();

      //
      // Added to Earn Rewards Handling
      //
      me.metaDataHandler(metaData);

      if (metaData['data'])
      {
         var controller = me.getApplication().getController('Prizes');
         controller.fireEvent('showQRCode', 0, metaData['data']);
      }
   },
   onActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this;
      var container = me.getRewards();
      var viewport = me.getViewPortCntlr();

      activeItem.createView();

      me.startRouletteScreen();
      Genesis.controller.ControllerBase.playSoundFile(viewport.sound_files['rouletteSpinSound'], function()
      {
         console.debug("RouletteSound Done, checking for prizes ...");
         var app = me.getApplication();
         app.getController('Prizes').fireEvent('prizecheck', me.loadCallback[0], me.loadCallback[1]);
         delete me.loadCallback;
      });
   },
   onDeactivate : function(oldActiveItem, c, newActiveItem, eOpts)
   {
      var me = this;
      //this.getBackButton().enable();
   },
   onContainerActivate : function(c, value, oldValue, eOpts)
   {
   },
   // --------------------------------------------------------------------------
   // Page Navigation
   // --------------------------------------------------------------------------
   scanAndWinPage : function()
   {
      var me = this;
      this.openPage('scanAndWin');
   },
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
   getMainPage : function()
   {
      var page = this.getRewards();
      return page;
   },
   openPage : function(subFeature)
   {
      var me = this;
      switch (subFeature)
      {
         case 'scanAndWin' :
         {
            //
            // Go back to Main Reward Screen
            //
            me.setAnimationMode(me.self.superclass.self.animationMode['slideUp']);
            me.pushView(me.getRewards());
            break;
         }
         case 'rewards':
         {
            me.onEarnPtsTap();
            break;
         }
      }
   },
   isOpenAllowed : function()
   {
      var viewport = this.getViewPortCntlr();
      var cvenue = viewport.getCheckinInfo().venue;
      var venue = viewport.getVenue();

      // VenueId can be found after the User checks into a venue
      //return ((this.getViewPortCntlr().getVenue()) ? true : this.checkinFirstMsg);
      return ((cvenue && venue && (cvenue.getId() == venue.getId())) ? true : this.checkinFirstMsg);
   }
});
Ext.define('Genesis.controller.client.Redemptions',
{
   extend : 'Genesis.controller.ControllerBase',
   requires : ['Ext.data.Store'],
   statics :
   {
      clientRedemption_path : '/clientRedemptions'
   },
   xtype : 'clientRedemptionsCntlr',
   models : ['PurchaseReward', 'CustomerReward'],
   config :
   {
      routes :
      {
         'redemptions' : 'redemptionsPage'
      },
      refs :
      {
         //
         // Redemptions
         //
         redemptions :
         {
            selector : 'clientredemptionsview',
            autoCreate : true,
            xtype : 'clientredemptionsview'
         },
         redemptionsList : 'clientredemptionsview list[tag=redemptionsList]',
         redemptionsPts : 'clientredemptionsview component[tag=points]',
         redemptionsPtsEarnPanel : 'clientredemptionsview dataview[tag=ptsEarnPanel]'
      },
      control :
      {
         redemptions :
         {
            activate : 'onActivate',
            deactivate : 'onDeactivate'
         },
         redemptionsList :
         {
            select : 'onItemListSelect',
            disclose : 'onItemListDisclose'

         }
      }
   },
   checkinFirstMsg : 'Please Check-In before redeeming rewards',
   needPointsMsg : function(pointsDiff)
   {
      return 'You need ' + pointsDiff + ' more points ' + Genesis.constants.addCRLF() + 'to be eligible for this item.';
   },
   //orderTitle : 'Rewards List',
   //checkoutTitle : 'Check Out',
   init : function()
   {
      var me = this;
      Ext.regStore('RedemptionRenderCStore',
      {
         model : 'Genesis.model.Customer',
         autoLoad : false
      });
      Ext.regStore('RedemptionsStore',
      {
         model : 'Genesis.model.CustomerReward',
         autoLoad : false,
         grouper :
         {
            groupFn : function(record)
            {
               return record.get('points') + ' Points';
            }
         },
         sorters : [
         {
            property : 'points',
            direction : 'ASC'
         }],
         listeners :
         {
            scope : me,
            'metachange' : function(store, proxy, eOpts)
            {
               this.onRedeemMetaChange(store, proxy.getReader().metaData);
            }
         }
      });

      this.callParent(arguments);
      console.log("Client Redemptions Init");
   },
   // --------------------------------------------------------------------------
   // Redemptions Page
   // --------------------------------------------------------------------------
   onActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this;
      var page = me.getRedemptions();

      var viewport = me.getViewPortCntlr();
      var cvenue = viewport.getCheckinInfo().venue;
      var venue = viewport.getVenue();
      var venueId = venue.getId();
      var merchantId = venue.getMerchant().getId();

      me.exploreMode = !cvenue || (cvenue && (cvenue.getId() != venue.getId()));

      //
      // Update Customer info
      Ext.StoreMgr.get('RedemptionRenderCStore').setData(viewport.getCustomer());
      //Ext.defer(activeItem.createView, 1, activeItem);
      activeItem.createView();
   },
   onDeactivate : function(oldActiveItem, c, newActiveItem, eOpts)
   {
      var me = this;
   },
   onItemListSelect : function(d, model, eOpts)
   {
      d.deselect([model]);
      this.onItemListDisclose(d, model);
      return false;
   },
   onItemListDisclose : function(list, record, target, index, e, eOpts)
   {
      var me = this;
      var viewport = me.getViewPortCntlr();

      Genesis.controller.ControllerBase.playSoundFile(viewport.sound_files['clickSound']);
      if (!me.exploreMode)
      {
         var totalPts = viewport.getCustomer().get('points');
         var points = record.get('points');
         if (points > totalPts)
         {
            Ext.device.Notification.show(
            {
               title : 'Oops!',
               message : me.needPointsMsg(points - totalPts)
            });
         }
         else
         {
            var controller = me.getApplication().getController('Prizes');
            controller.fireEvent('redeemrewards', Ext.create('Genesis.model.EarnPrize',
            {
               //'id' : 1,
               'expiry_date' : null,
               'reward' : record,
               'merchant' : viewport.getCheckinInfo().venue.getMerchant()
            }));
         }
      }
      else
      {
         Ext.device.Notification.show(
         {
            title : 'Warning',
            message : me.checkinFirstMsg
         });
      }

      return true;
   },
   onRedeemCheckMetaData : function(metaData)
   {
      var me = this;
      var viewport = me.getViewPortCntlr();
      //
      // Update points from the purchase or redemption
      //
      var cstore = Ext.StoreMgr.get('CustomerStore');
      var customerId = viewport.getCustomer().getId();
      if (metaData['account_points'])
      {
         cstore.getById(customerId).set('points', metaData['account_points']);
      }
      if (metaData['account_visits'])
      {
         cstore.getById(customerId).set('visits', metaData['account_visits']);
      }
   },
   onRedeemMetaChange : function(store, metaData)
   {
      var me = this;
      var viewport = me.getViewPortCntlr();

      me.onRedeemCheckMetaData(metaData);

      if (metaData['data'])
      {
         var app = me.getApplication();
         var controller = app.getController('Prizes');
         controller.fireEvent('showQRCode', 0, metaData['data']);
      }
   },
   // --------------------------------------------------------------------------
   // Page Navigation
   // --------------------------------------------------------------------------
   redemptionsPage : function()
   {
      this.openPage('redemptions');
   },
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
   getMainPage : function()
   {
      var page = this.getRedemptions();
      return page;
   },
   openPage : function(subFeature)
   {
      var me = this;

      switch (subFeature)
      {
         case 'redemptions':
         {
            var page = me.getRedemptions();
            me.setAnimationMode(me.self.superclass.self.animationMode['slideUp']);
            me.pushView(page);
            break;
         }
      }
   },
   isOpenAllowed : function()
   {
      // VenueId can be found after the User checks into a venue
      return ((this.getViewPortCntlr().getVenue()) ? true : "You need to Explore or Check-in to a Venue first");
   }
});
Ext.define('Genesis.controller.Accounts',
{
   extend : 'Genesis.controller.ControllerBase',
   requires : ['Ext.data.Store'],
   statics :
   {
      accounts_path : '/accounts'
   },
   xtype : 'accountsCntlr',
   config :
   {
      mode : 'profile',
      routes :
      {
         'accounts' : 'mainPage',
         'etransfer' : 'emailTransferPage',
         'transfer' : 'transferPage'
      },
      refs :
      {
         //
         // Account Profiles
         //
         aBB : 'accountsview button[tag=back]',
         accounts :
         {
            selector : 'accountsview',
            autoCreate : true,
            xtype : 'accountsview'
         },
         accountsList : 'accountsview list[tag=accountsList]',
         //
         // Account Transfers
         //
         atrCloseBB : 'clientaccountstransferview button[tag=close]',
         atrCalcCloseBB : 'clientaccountstransferview button[tag=calcClose]',
         atrBB : 'clientaccountstransferview button[tag=back]',
         transferPage :
         {
            selector : 'clientaccountstransferview',
            autoCreate : true,
            xtype : 'clientaccountstransferview'
         },
         points : 'clientaccountstransferview textfield',
         qrcode : 'clientaccountstransferview component[tag=qrcode]',
         title : 'clientaccountstransferview component[tag=title]',
         transferContainer : 'clientaccountstransferview container[tag=accountsTransferMain]'
      },
      control :
      {
         //
         // Account Profiles
         //
         accounts :
         {
            activate : 'onActivate',
            deactivate : 'onDeactivate'
         },
         accountsList :
         {
            select : 'onSelect',
            disclose : 'onDisclose'
         },
         'clientaccountstransferview button[tag=transfer]' :
         {
            select : 'onTransferTap'
         },
         //
         // Account Transfers
         //
         transferPage :
         {
            activate : 'onTransferActivate',
            deactivate : 'onTransferDeactivate'
         },
         'clientaccountstransferview container[tag=accountsTransferMain] list' :
         {
            select : 'onTransferSelect'
         },
         'clientaccountstransferview container[tag=dialpad] button' :
         {
            tap : 'onCalcBtnTap'
         },
         'clientaccountstransferview button[tag=showQrCode]' :
         {
            tap : 'onShowQrCodeTap'
         },
         'clientaccountstransferview container button[tag=done]' :
         {
            tap : 'onTransferCompleteTap'
         },
         atrCalcCloseBB :
         {
            tap : 'onTransferCompleteTap'
         }
      },
      listeners :
      {
         'selectMerchant' : 'onDisclose',
         'authCodeRecv' : 'onAuthCodeRecv'
      }
   },
   qrcodeRegExp : /%qrcode_image%/,
   noTransferCodeMsg : 'No Transfer Code was scanned',
   pointsReqMsg : 'Points are required for transfer',
   startTransferMsg : 'Prepare to scan the Sender\'s Transfer Code',
   transferFailedMsg : 'Transfer operation did not complete',
   transferSavedMsg : 'Transfer messasge was saved, but not sent.',
   transferSuccessMsg : function()
   {
      return 'Transfer operation was successfully completed.' + Genesis.constants.addCRLF() + //
      'Your account information won\'t be updated until your next check-in.';
   },
   xferWithinRangeMsg : function(min, max)
   {
      return 'Please enter a value between ' + min + ' and ' + max;
   },
   noPtsXferMsg : function()
   {
      return 'No Points were transferred.' + Genesis.constants.addCRLF() + //
      'Please Try Again.';
   },
   recvTransferMsg : function(points, merchantName)
   {
      return 'We have added ' + points + ' points ' + Genesis.constants.addCRLF() + //
      'towards your account at ' + //
      Genesis.constants.addCRLF() + merchantName + '!';
   },
   init : function()
   {
      this.callParent(arguments);
      console.log("Accounts Init");
   },
   // --------------------------------------------------------------------------
   // Event Handlers
   // --------------------------------------------------------------------------
   onScannedQRcode : function(qrcode)
   {
      var me = this;
      var vport = me.getViewport();
      var cstore = Ext.StoreMgr.get('CustomerStore');

      if (qrcode)
      {
         //
         // Send QRCode to server for processing
         //
         Ext.Viewport.setMasked(
         {
            xtype : 'loadmask',
            message : me.updatingServerMsg
         });
         Customer['setRecvPtsXferUrl']();
         cstore.load(
         {
            addRecords : true, //Append data
            jsonData :
            {
            },
            params :
            {
               'data' : qrcode
            },
            callback : function(records, operation)
            {
               Ext.Viewport.setMasked(false);
               if (operation.wasSuccessful())
               {
                  var metaData = Customer.getProxy().getReader().metaData;
                  /*
                   var customer = cstore.getById(record.getId());
                   if(cutomer)
                   {
                   customer.set('points', record.get('points'));
                   }
                   else
                   {
                   cstore.add(record);
                   }
                   */
                  Ext.device.Notification.show(
                  {
                     title : 'Transfer Received',
                     message : me.recvTransferMsg(metaData['points'], records[0].getMerchant().get('name')),
                     callback : function(btn)
                     {
                        me.silentPopView(1);
                        Ext.defer(function()
                        {
                           me.fireEvent('selectMerchant', cstore, records[0]);
                           //me.pushView(me.getAccounts());
                        }, 1, me);
                     }
                  });
               }
            }
         });
      }
      else
      {
         console.debug(me.noCodeScannedMsg);
         Ext.Viewport.setMasked(false);
         Ext.device.Notification.show(
         {
            title : 'Error',
            message : me.noCodeScannedMsg
         });
      }
   },
   onLocationUpdate : function(position)
   {
      var me = this;
      var merchantId = me.merchantId;
      var rec = me.rec;
      var mId = rec.getMerchant().getId();
      var customerId = rec.getId();
      var merchantName = rec.getMerchant().get('name');

      Venue['setGetClosestVenueURL']();
      Venue.load(merchantId,
      {
         scope : me,
         params :
         {
            'merchant_id' : merchantId,
            latitude : position.coords.getLatitude(),
            longitude : position.coords.getLongitude()
         },
         callback : function(record, operation)
         {
            if (operation.wasSuccessful())
            {
               var metaData = Venue.getProxy().getReader().metaData;
               if (metaData)
               {
                  var app = me.getApplication();
                  var controller = app.getController('Checkins');
                  var cstore = Ext.StoreMgr.get('CustomerStore');
                  var viewport = me.getViewPortCntlr();

                  //
                  // Setup minimum customer information require for explore
                  //
                  metaData['venue_id'] = record.getId();
                  viewport.setVenue(record);
                  controller.fireEvent('checkinMerchant', 'explore', metaData, record.getId(), rec, operation, Ext.emptyFn);
               }
               else
               {
                  console.log("No MetaData found on Venue!");
               }
            }
            else
            {
               Ext.device.Notification.show(
               {
                  title : 'Error',
                  message : me.missingVenueInfoMsg
               });
            }
         },
      });
   },
   // --------------------------------------------------------------------------
   // Accounts Page
   // --------------------------------------------------------------------------
   onActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var mode = this.getMode();
      var tbbar = activeItem.query('titlebar')[0];
      switch(mode)
      {
         case 'profile' :
         {
            tbbar.setTitle('Accounts');
            tbbar.removeCls('kbTitle')
            break;
         }
         case 'emailtransfer' :
         case 'transfer' :
         {
            tbbar.setTitle(' ');
            tbbar.addCls('kbTitle')
            break;
         }
      }
      // Precreate the DOMs
      //Ext.defer(activeItem.createView, 1, activeItem);
      activeItem.createView();
   },
   onDeactivate : function(oldActiveItem, c, newActiveItem, eOpts)
   {
      var me = this;
   },
   onSelect : function(list, model, eOpts)
   {
      list.deselect([model]);
      this.onDisclose(list, model);
      return false;
   },
   onDisclose : function(list, record, target, index, e, eOpts)
   {
      var me = this;
      var customerId = record.getId();
      //var merchantName = record.getMerchant().get('name');
      var vport = me.getViewport();

      Genesis.controller.ControllerBase.playSoundFile(me.getViewPortCntlr().sound_files['clickSound']);
      me.merchantId = record.getMerchant().getId();
      me.rec = record;

      switch(me.getMode())
      {
         case 'profile' :
            me.getGeoLocation();
            break;
         case 'emailtransfer' :
         case 'transfer' :
         {
            if (record.get('points') < 1)
            {
               Ext.device.Notification.show(
               {
                  title : 'Points Required',
                  message : me.pointsReqMsg,
               });
               return;
            }

            // Drop the previous page history
            me.silentPopView(2);
            //
            // Select the Amounts of points to Transfer!
            //
            me.setAnimationMode(me.self.superclass.self.animationMode['slideUp']);
            me.pushView(me.getTransferPage());
            break;
         }
      }
   },
   // --------------------------------------------------------------------------
   // Accounts Transfer Page
   // --------------------------------------------------------------------------
   onTransferActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this;
      var screenShow = 0;
      var container = me.getTransferContainer();
      switch(me.getMode())
      {
         case 'profile' :
         {
            me.getAtrCloseBB().hide();
            me.getAtrCalcCloseBB().hide();
            me.getAtrBB().show();
            //container.setActiveItem(0);
            break;
         }
         case 'emailtransfer' :
         case 'transfer' :
         {
            me.getAtrCloseBB().hide();
            me.getAtrCalcCloseBB().show();
            me.getAtrBB().hide();
            if (oldActiveItem && (oldActiveItem == me.getAccounts() && !me.rec))
            {
               me.setMode('profile');
               //container.setActiveItem(0);
            }
            else
            {
               //me.getPoints().setValue(null);
               //container.setActiveItem(1);
               screenShow = 1;
            }
            break;
         }
      }
      activeItem.createView(screenShow);
   },
   onTransferDeactivate : function(oldActiveItem, c, activeItem, eOpts)
   {
      var me = this;
   },
   onTransferTap : function(b, e, eOpts)
   {
   },
   onTransferSelect : function(list, model, eOpts)
   {
      var me = this;

      list.deselect([model]);
      delete me.merchantId;
      delete me.rec;

      switch (model.get('tag'))
      {
         //
         // Select the Merchant to generate the QRCode
         //
         case 'sender' :
         {
            me.setMode('transfer');
            me.openMainPage();
            break;
         }
         case 'emailsender' :
         {
            me.setMode('emailtransfer');
            me.openMainPage();
            break;
         }
         //
         // Scan Sender's QRCode
         //
         case 'recipient' :
         {
            me.setMode('profile');
            Ext.device.Notification.show(
            {
               title : 'Start Transfer',
               message : me.startTransferMsg,
               buttons : ['Proceed', 'Cancel'],
               callback : function(btn)
               {
                  if (btn.toLowerCase() == 'proceed')
                  {
                     me.scanQRCode();
                  }
               }
            });
            break;
         }
      }
      return false;
   },
   onCalcBtnTap : function(b, e, eOpts, eInfo)
   {
      var me = this;
      var viewport = me.getViewPortCntlr();

      Genesis.controller.ControllerBase.playSoundFile(viewport.sound_files['clickSound']);

      var value = b.getText();
      var pointsField = me.getPoints();
      var points = pointsField.getValue() || "0";
      if (points.length < 8)
      {
         switch (value)
         {
            case 'AC' :
            {
               points = null;
               break;
            }
            default :
               points = (points != "0") ? points.concat(value) : value;
               break;
         }
         pointsField.setValue(points);
      }
   },
   onAuthCodeRecv : function(metaData)
   {
      var me = this;
      switch (me.getMode())
      {
         case 'transfer' :
         {
            var container = me.getTransferContainer();
            var qrcode = Genesis.controller.ControllerBase.genQRCode(metaData['data']);
            var points = metaData['points'] || me.getPoints().getValue();

            console.debug('\n' + //
            'QRCode - ' + qrcode[0] + '\n' + //
            //'Body - ' + emailTpl + '\n' + //
            'Points - ' + points);
            //
            // Query server to get generate qrcode
            //
            if (qrcode[0])
            {
               me.getQrcode().setStyle(
               {
                  'background-image' : 'url(' + qrcode[0] + ')',
                  'background-size' : Genesis.fn.addUnit(qrcode[1]) + ' ' + Genesis.fn.addUnit(qrcode[2])
               });
               me.getTitle().setData(
               {
                  points : points + ' Pts'
               });
               container.setActiveItem(2);
            }
            Ext.Viewport.setMasked(false);
            break;
         }
         case 'emailtransfer' :
         {
            var qrcode = metaData['data']['qrcode'];
            var emailTpl = metaData['data']['body'];
            var subject = metaData['data']['subject'];

            console.debug('\n' + //
            'QRCode - ' + qrcode + '\n' + //
            //'Body - ' + emailTpl + '\n' + //
            'Subject - ' + subject + '\n' //
            );

            //emailTpl = emailTpl.replace(me.qrcodeRegExp, Genesis.controller.ControllerBase.genQRCodeInlineImg(qrcode));
            //console.debug('\n' + //
            //'Encoded Body - ' + emailTpl);
            qrcode = Genesis.controller.ControllerBase.genQRCode(qrcode)[0].replace('data:image/gif;base64,', "");

            window.plugins.emailComposer.showEmailComposerWithCB(function(res)
            {
               // Delay is needed to not block email sending ...
               Ext.defer(function()
               {
                  Ext.Viewport.setMasked(false);
                  switch (res)
                  {
                     case EmailComposer.ComposeResultType.Failed:
                     case EmailComposer.ComposeResultType.NotSent:
                     case EmailComposer.ComposeResultType.Cancelled:
                     {
                        Ext.device.Notification.show(
                        {
                           title : 'Transfer Failed',
                           message : me.transferFailedMsg,
                           callback : function()
                           {
                              //me.onTransferCompleteTap();
                           }
                        });
                        break;
                     }
                     case EmailComposer.ComposeResultType.Saved:
                     {
                        me.onTransferCompleteTap();
                        Ext.device.Notification.show(
                        {
                           title : 'Trasfer Deferred',
                           message : me.transferSavedMsg
                        });
                        break;
                     }
                     case EmailComposer.ComposeResultType.Sent:
                     {
                        me.onTransferCompleteTap();
                        Ext.device.Notification.show(
                        {
                           title : 'Transfer Success!',
                           message : me.transferSuccessMsg()
                        });
                        break;
                     }
                  }
               }, 1, me);
            }, subject, emailTpl, null, null, null, true, [qrcode]);
            break;
         }
      }
   },
   onShowQrCodeTap : function(b, e, eOpts, eInfo)
   {
      var me = this;
      var cstore = Ext.StoreMgr.get('CustomerStore');
      var points = me.getPoints().getValue();
      var type;
      if ((Number(points) > 0) && (Number(points) <= me.rec.get('points') ))
      {
         switch (me.getMode())
         {
            case 'transfer' :
            {
               type = 'direct';
               Ext.Viewport.setMasked(
               {
                  xtype : 'loadmask',
                  message : me.genQRCodeMsg
               });
               break;
            }
            case 'emailtransfer' :
            {
               type = 'email';
               Ext.Viewport.setMasked(
               {
                  xtype : 'loadmask',
                  message : me.retrieveAuthModeMsg
               });
               break;
            }
         }

         // Send QRCode to server for processing
         //
         Customer['setSendPtsXferUrl']();
         cstore.load(
         {
            addRecords : true,
            jsonData :
            {
            },
            params :
            {
               'merchant_id' : me.merchantId,
               'points' : points,
               'type' : type
            },
            callback : function(records, operation)
            {
               var metaData = cstore.getProxy().getReader().metaData;
               if (operation.wasSuccessful() && (!metaData['data']))
               {
                  Ext.Viewport.setMasked(false);
                  Ext.device.Notification.show(
                  {
                     title : 'Error',
                     message : me.noPtsXferMsg()
                  });
               }
            }
         });
      }
      else
      {
         Ext.device.Notification.show(
         {
            title : 'Error',
            message : me.xferWithinRangeMsg(1, me.rec.get('points'))
         });
      }
   },
   onTransferCompleteTap : function(b, e, eOpts, eInfo)
   {
      var me = this;
      me.setMode('profile');
      //
      // Go back to Accounts Page
      //
      me.popView();
   },
   // --------------------------------------------------------------------------
   // Page Navigation
   // --------------------------------------------------------------------------
   mainPage : function()
   {
      this.openPage('profile');
   },
   emailTransferPage : function()
   {
      this.openPage('emailtransfer');
   },
   transferPage : function()
   {
      this.openPage('transfer');
   },
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
   openPage : function(subFeature)
   {
      var me = this, page;

      me.setMode('profile');
      me.setAnimationMode(me.self.superclass.self.animationMode['slide']);
      switch (subFeature)
      {
         case 'profile' :
         {
            page = me.getMainPage();
            break;
         }
         case 'emailtransfer' :
         case 'transfer' :
         {
            page = me.getTransferPage();
            break;
         }
      }

      me.pushView(page);
   },
   getMainPage : function()
   {
      var page = this.getAccounts();
      return page;
   },
   openMainPage : function()
   {
      this.pushView(this.getMainPage());
      console.log("Accounts Page Opened");
   },
   isOpenAllowed : function()
   {
      // If not logged in, forward to login page
      return true;
   }
});
Ext.define('Genesis.controller.Prizes',
{
   extend : 'Genesis.controller.ControllerBase',
   requires : ['Ext.data.Store', 'Ext.util.Sorter'],
   statics :
   {
      prizes_path : '/prizes'
   },
   xtype : 'prizesCntlr',
   config :
   {
      timeoutPeriod : 10,
      mode : 'userPrizes',
      routes :
      {
         'userPrizes' : 'userPrizesPage',
         'merchantPrizes' : 'merchantPrizesPage',
         'prize' : 'prizePage',
         'authReward' : 'authRewardPage',
         'redeemRewards' : 'redeemRewardsPage'
      },
      listeners :
      {
         'redeemprize' : 'onRedeemPrize',
         'prizecheck' : 'onPrizeCheck',
         'showprize' : 'onShowPrize',
         'authreward' : 'onAuthReward',
         'redeemrewards' : 'onRedeemRewards',
         'showQRCode' : 'onShowPrizeQRCode',
         'refreshQRCode' : 'onRefreshQRCode'
      },
      refs :
      {
         // UserPrizes
         uCloseBB : 'prizesview[tag=userPrizes] button[tag=close]',
         uBB : 'prizesview[tag=userPrizes] button[tag=back]',
         uDoneBtn : 'prizesview[tag=userPrizes] button[tag=done]',
         uRedeemBtn : 'prizesview[tag=userPrizes] button[tag=redeem]',
         //uMerchantBtn : 'prizesview[tag=userPrizes] rewarditem component[tag=info]',
         // MerchantPrizes
         mCloseBB : 'prizesview[tag=merchantPrizes] button[tag=close]',
         mBB : 'prizesview[tag=merchantPrizes] button[tag=back]',
         mDoneBtn : 'prizesview[tag=merchantPrizes] button[tag=done]',
         mRedeemBtn : 'prizesview[tag=merchantPrizes] button[tag=redeem]',
         // ShowPrizes
         sCloseBB : 'showprizeview[tag=showPrize] button[tag=close]',
         sBB : 'showprizeview[tag=showPrize] button[tag=back]',
         sDoneBtn : 'showprizeview[tag=showPrize] button[tag=done]',
         sRedeemBtn : 'showprizeview[tag=showPrize] button[tag=redeem]',
         refreshBtn : 'showprizeview[tag=showPrize] button[tag=refresh]',
         verifyBtn : 'showprizeview[tag=showPrize] button[tag=verify]',

         prizeCheckScreen : 'clientrewardsview',
         merchantPrizes :
         {
            selector : 'prizesview[tag=merchantPrizes]',
            autoCreate : true,
            tag : 'merchantPrizes',
            xtype : 'prizesview'
         },
         userPrizes :
         {
            selector : 'prizesview[tag=userPrizes]',
            autoCreate : true,
            tag : 'userPrizes',
            xtype : 'prizesview'
         },
         showPrize :
         {
            selector : 'showprizeview[tag=showPrize]',
            autoCreate : true,
            tag : 'showPrize',
            xtype : 'showprizeview'
         },
         merchantPrizesCarousel : 'prizesview[tag=merchantPrizes] carousel',
         userPrizesCarousel : 'prizesview[tag=userPrizes] carousel',
      },
      control :
      {
         uDoneBtn :
         {
            tap : 'onDoneTap'
         },
         mDoneBtn :
         {
            tap : 'onDoneTap'
         },
         sDoneBtn :
         {
            tap : 'onDoneTap'
         },
         uRedeemBtn :
         {
            tap : 'onRedeemPrizeTap'
         },
         mRedeemBtn :
         {
            tap : 'onRedeemPrizeTap'
         },
         sRedeemBtn :
         {
            tap : 'onRedeemPrizeTap'
         },
         merchantPrizes :
         {
            activate : 'onMerchantPrizesActivate',
            deactivate : 'onDeactivate'
         },
         userPrizes :
         {
            activate : 'onUserPrizesActivate',
            deactivate : 'onDeactivate'
         },
         showPrize :
         {
            activate : 'onShowPrizeActivate',
            deactivate : 'onDeactivate'
         }
         /*
          ,refreshBtn :
          {
          tap : 'onRefreshQRCode'
          },
          verifyBtn :
          {
          tap : 'popView'
          }
          */
      }
   },
   evtFlag : 0,
   loadCallback : null,
   initSound : false,
   authRewardVerifiedMsg : 'Verified',
   updatePrizeOnFbMsg : 'Tell your friends on Facebook about the prize you just won!',
   retrievingQRCodeMsg : 'Retrieving QRCode ...',
   wonPrizeMsg : function(numPrizes)
   {
      return 'You haved won ' + ((numPrizes > 1) ? 'some PRIZES' : 'a PRIZE') + '!'
   },
   lostPrizeMsg : 'Oops, Play Again!',
   showQrCodeMsg : 'Show this Authorization Code to your server to redeem!',
   checkinFirstMsg : 'Please Check-in before claiming any prize(s)',
   redeemPrizeConfirmMsg : 'Please confim to redeem this item',
   init : function()
   {
      var me = this;
      this.callParent(arguments);

      console.log("Prizes Init");
   },
   // --------------------------------------------------------------------------
   // Utility Functions
   // --------------------------------------------------------------------------
   stopRouletteTable : function()
   {
      var scn = this.getPrizeCheckScreen();
      var rouletteTable = Ext.get(Ext.DomQuery.select('div.rouletteTable',scn.element.dom)[0]);
      rouletteTable.removeCls('spinFwd');
      rouletteTable.removeCls('spinBack');
   },
   stopRouletteBall : function()
   {
      var scn = this.getPrizeCheckScreen();
      var rouletteBall = Ext.get(Ext.DomQuery.select('div.rouletteBall',scn.element.dom)[0]);
      rouletteBall.removeCls('spinBack');
      rouletteBall.addCls('spinFwd');
      // Match the speed of Roulette Table to make it look like it stopped
   },
   stopRouletteScreen : function()
   {
      this.stopRouletteTable();
      var scn = this.getPrizeCheckScreen();
      var rouletteBall = Ext.get(Ext.DomQuery.select('div.rouletteBall',scn.element.dom)[0]);
      rouletteBall.removeCls('spinBack');
      rouletteBall.removeCls('spinFwd');
   },
   updatingPrizeOnFacebook : function(earnprize)
   {
      var me = this;
      try
      {
         var viewport = me.getViewPortCntlr();
         var venue = viewport.getVenue();
         var site = Genesis.constants.site;
         var wsite = venue.get('website') ? venue.get('website').split(/http[s]*:\/\//) : [null];
         var name = venue.get('name');
         var link = wsite[wsite.length - 1] || site;
         var desc = venue.get('description').trunc(256);
         var message = 'I just won ' + earnprize.getCustomerReward().get('title') + ' for purchasing at ' + venue.get('name') + '!';

         console.log('Posting to Facebook ...' + '\n' + //
         'Name: ' + name + '\n' + //
         'Caption: ' + link + '\n' + //
         'Description: ' + desc + '\n' + //
         'Message : ' + message + '\n' //
         );
         FB.api('/me/feed', 'post',
         {
            name : name,
            //link : href,
            link : venue.get('website') || site,
            caption : link,
            description : desc,
            picture : venue.getMerchant().get('photo')['thumbnail_ios_medium'].url,
            message : message
         }, function(response)
         {
            Ext.Viewport.setMasked(false);
            if (!response || response.error)
            {
               console.log('Post was not published to Facebook.');
            }
            else
            {
               console.log('Posted to your Facebook Newsfeed.');
            }
         });
      }
      catch (e)
      {
         Ext.Viewport.setMasked(false);
         console.log('Exception [' + e + ']' + '\n' + //
         'Post was not published to Facebook.');
      }
   },
   // --------------------------------------------------------------------------
   // Event Handler
   // --------------------------------------------------------------------------
   onRedeemPrize : function(btn, venue, view)
   {
      var me = this;
      var venueId = venue.getId();
      var merchantId = venue.getMerchant().getId();

      var store;
      switch (me.getMode())
      {
         case 'merchantPrizes' :
         //me.getMCloseBB().hide();
         //me.getMBB().hide();
         case 'userPrizes' :
         {
            var carousel = me.getMainCarousel();
            var item = carousel.getActiveItem();
            store = Ext.StoreMgr.get('MerchantPrizeStore');
            EarnPrize['setRedeemPrizeURL'](item.getStore().first().getId());
            //me.getUCloseBB().hide();
            //me.getUBB().hide();
            break;
         }
         case 'showPrize' :
         {
            var item = view.getInnerItems()[0];
            store = Ext.StoreMgr.get('MerchantPrizeStore');
            EarnPrize['setRedeemPrizeURL'](item.getStore().first().getId());
            //me.getSCloseBB().hide();
            //me.getSBB().hide();
            break;
         }
         case 'reward' :
         {
            var item = view.getInnerItems()[0];
            store = Ext.StoreMgr.get('RedemptionsStore');
            CustomerReward['setRedeemPointsURL'](item.getStore().first().getCustomerReward().getId());
            //me.getSCloseBB().hide();
            //me.getSBB().hide();
            break;
         }
      }

      btn.hide();
      Ext.Viewport.setMasked(
      {
         xtype : 'loadmask',
         message : me.retrievingQRCodeMsg
      });
      store.load(
      {
         addRecords : true, //Append data
         scope : me,
         jsonData :
         {
         },
         params :
         {
            venue_id : venueId
         },
         callback : function(records, operation)
         {
            if (!operation.wasSuccessful())
            {
               Ext.Viewport.setMasked(false);
               btn.show();
            }
         }
      });
   },
   onPrizeCheck : function(records, operation)
   {
      var me = this;
      var viewport = me.getViewPortCntlr();

      me.stopRouletteBall();
      //console.debug("onPrizeCheck Completed!");

      if (records.length == 0)
      {
         console.log("Prize LOST!");

         Ext.device.Notification.show(
         {
            title : 'Scan And Win!',
            message : me.lostPrizeMsg,
            callback : function()
            {
               Ext.defer(me.popView, 3 * 1000, me);
            }
         });
      }
      else
      {
         console.log("Prize WON!");

         var flag = 0;
         var custore = Ext.StoreMgr.get('CustomerStore');
         var app = me.getApplication();
         var vport = me.getViewport();

         /*
         vport.setEnableAnim(false);
         vport.getNavigationBar().setCallbackFn(function()
         {
         vport.setEnableAnim(true);
         vport.getNavigationBar().setCallbackFn(Ext.emptyFn);
         });
         */
         //
         // Play the prize winning music!
         //
         Genesis.controller.ControllerBase.playSoundFile(viewport.sound_files['winPrizeSound'], function()
         {
            if ((flag |= 0x01) == 0x11)
            {
               me.fireEvent('showprize', records[0]);
            }
         });
         //
         // Update Facebook
         //
         Ext.device.Notification.vibrate();
         Ext.device.Notification.show(
         {
            title : 'Scan And Win!',
            message : me.wonPrizeMsg(records.length),
            callback : function()
            {
               if ((flag |= 0x10) == 0x11)
               {
                  me.fireEvent('showprize', records[0]);
               }
            }
         });
      }
   },
   onShowPrize : function(showPrize)
   {
      var me = this;
      var store = Ext.StoreMgr.get('MerchantPrizeStore');

      //
      // Show prize on ShowPrize Container
      //
      me.showPrize = showPrize;
      store.add(showPrize);
      me.persistSyncStores('MerchantPrizeStore');

      me.redirectTo('prize');
   },
   // --------------------------------------------------------------------------
   // Prizes Page
   // --------------------------------------------------------------------------
   onMerchantPrizesActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this;
      var viewport = me.getViewPortCntlr();
      var merchantId = (viewport.getVenue()) ? viewport.getVenue().getMerchant().getId() : 0;
      var prizesList = [];

      me.getMCloseBB().show();
      me.getMBB().hide();

      //
      // List all the prizes won by the Customer
      //
      var prizes = Ext.StoreMgr.get('MerchantPrizeStore').getRange();
      if (prizes.length > 0)
      {
         for (var i = 0; i < prizes.length; i++)
         {
            //
            // Only show prizes that matches the currently loaded Merchant Data
            //
            if (prizes[i].getMerchant().getId() != merchantId)
            {
               continue;
            }

            prizesList.push(prizes[i]);
         }
      }

      if (prizesList.length == 0)
      {
         me.getMRedeemBtn().hide();
      }
      else
      {
         me.getMRedeemBtn().show();
      }
      activeItem.createView();
   },
   onUserPrizesActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this;
      var items = [], prizesList = [];
      var views;

      me.getUCloseBB().hide();
      me.getUBB().show();
      me.getURedeemBtn().hide();

      var prizes = Ext.StoreMgr.get('MerchantPrizeStore').getRange();
      for (var i = 0; i < prizes.length; i++)
      {

         prizesList.push(prizes[i]);
      }
      /*
       if (prizesList.length == 0)
       {
       me.getURedeemBtn().hide();
       }
       else
       {
       me.getURedeemBtn().show();
       }
       */
      activeItem.createView();
   },
   onShowPrizeActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this;
      var view = me.getMainPage();
      var viewport = me.getViewPortCntlr();

      var tbbar = activeItem.query('titlebar')[0];
      var photo = me.showPrize.getCustomerReward().get('photo');
      me.getSCloseBB().show();
      me.getSBB().hide();
      switch (me.getMode())
      {
         case 'authReward' :
         {
            me.getSRedeemBtn().hide();
            tbbar.addCls('kbTitle');
            tbbar.setTitle(' ');
            me.getRefreshBtn()[photo ?  'show' :'hide']();
            me.getVerifyBtn()[photo ?  'hide' :'show']();
            break;
         }
         case 'reward' :
         {
            tbbar.removeCls('kbTitle');
            tbbar.setTitle('Rewards');
            me.getRefreshBtn()['hide']();
            me.getVerifyBtn()['hide']();
            break;
         }
         case 'showPrize' :
         default:
            tbbar.removeCls('kbTitle');
            me.getSRedeemBtn().show();
            tbbar.setTitle('Prizes');
            me.getRefreshBtn()['hide']();
            me.getVerifyBtn()['hide']();
            break;
      }
      view.showPrize = me.showPrize;
      console.log("ShowPrize View - Updated ShowPrize View.");
      view.createView();
      delete me.showPrize;
   },
   onDeactivate : function(oldActiveItem, c, newActiveItem, eOpts)
   {
   },
   onDoneTap : function(b, e, eOpts, eInfo, overrideMode)
   {
      var me = this;
      var prizes = me.getMainPage();
      var mode = overrideMode || me.getMode();

      if (prizes.isPainted() && !prizes.isHidden())
      {
         //
         // Remove Prize
         //
         if (mode != 'reward')
         {
            var store = Ext.StoreMgr.get('MerchantPrizeStore');
            var carousel = prizes.query('carousel')[0];
            var container = carousel || prizes;
            var item = carousel ? carousel.getActiveItem() : container.getInnerItems()[0];

            store.remove(item.getStore().getData().items[0]);
            me.persistSyncStores('MerchantPrizeStore');
         }

         switch (mode)
         {
            case 'merchantPrizes' :
            {
               me.getMDoneBtn().hide();
               me.getMRedeemBtn().hide();
               break;
            }
            case 'userPrizes' :
            {
               me.getUDoneBtn().hide();
               me.getURedeemBtn().hide();
               break;
            }
            case 'reward' :
            case 'showPrize' :
            {
               me.getSDoneBtn().hide();
               me.getSRedeemBtn().hide();
               break;
            }
         }
         me.popView();
      }
   },
   onRedeemPrizeTap : function(b, e, eOpts, eInfo)
   {
      var me = this;
      var view = me.getMainPage();
      var viewport = me.getViewPortCntlr();
      var venue = viewport.getVenue();
      var cvenue = viewport.getCheckinInfo().venue;

      if (!cvenue || !venue || (venue.getId() != cvenue.getId()))
      {
         Ext.device.Notification.show(
         {
            title : view.query('titlebar')[0].getTitle(),
            message : me.checkinFirstMsg
         });
         return;
      }

      Ext.device.Notification.show(
      {
         title : view.query('titlebar')[0].getTitle(),
         message : me.redeemPrizeConfirmMsg,
         buttons : ['Confirm', 'Cancel'],
         callback : function(btn)
         {
            if (btn.toLowerCase() == 'confirm')
            {
               me.fireEvent('redeemprize', b, venue, view);
            }
         }
      });
   },
   onRefreshQRCode : function(qrcodeMeta)
   {
      var me = this;

      var view = me.getMainPage();
      var carousel = view.query('carousel')[0];
      var item = carousel ? carousel.getActiveItem() : view.getInnerItems()[0];
      var photo = item.query('component[tag=itemPhoto]')[0];
      photo.element.setStyle(
      {
         'background-image' : 'url(' + qrcodeMeta[0] + ')',
         'background-size' : Genesis.fn.addUnit(qrcodeMeta[1]) + ' ' + Genesis.fn.addUnit(qrcodeMeta[2])
      });
   },
   onShowPrizeQRCode : function(timeout, qrcode)
   {
      var me = this;

      //
      // For Debugging purposes
      //
      /*
       if(!qrcode)
       {
       console.log("Generaintg QR Code ... we lack one");
       qrcode = Genesis.controller.ControllerBase.genQRCodeFromParams(
       {
       type : 'redeem_prize',
       reward :
       {
       type :
       {
       value : 'prize'
       },
       title : 'Test QR Code'
       }
       });
       }
       else
       */
      {
         console.log("\n" + //
         "Encrypted Code :\n" + qrcode + "\n" + //
         "Encrypted Code Length: " + qrcode.length);

         qrcode = Genesis.controller.ControllerBase.genQRCode(qrcode);
      }
      if (qrcode[0])
      {
         var dom;
         switch (me.getMode())
         {
            case 'userPrizes' :
            {
               dom = Ext.DomQuery.select('div.itemPoints',me.getUserPrizesCarousel().getActiveItem().element.dom)[0];
               me.getURedeemBtn().hide();
               me.getUDoneBtn().show();
               break;
            }
            case 'merchantPrizes' :
            {
               dom = Ext.DomQuery.select('div.itemPoints',me.getMerchantPrizesCarousel().getActiveItem().element.dom)[0];
               me.getMRedeemBtn().hide();
               me.getMDoneBtn().show();
               me.getMCloseBB().hide();
               break;
            }
            case 'reward' :
            case 'showPrize' :
            {
               dom = Ext.DomQuery.select('div.itemPoints',me.getShowPrize().element.dom)[0];
               me.getSRedeemBtn().hide();
               me.getSDoneBtn().show();
               me.getSCloseBB().hide();
               break;
            }
         }
         if (dom)
         {
            Ext.fly(dom).addCls('x-item-hidden');
         }

         me.fireEvent('refreshQRCode', qrcode);

         Ext.Viewport.setMasked(false);
         Ext.device.Notification.show(
         {
            title : 'Redemption Alert',
            message : me.showQrCodeMsg
         });
         Ext.device.Notification.vibrate();
      }
   },
   onRedeemRewards : function(showPrize)
   {
      this.showPrize = showPrize;
      this.redirectTo('redeemRewards');
   },
   onAuthReward : function(showPrize)
   {
      this.showPrize = showPrize;
      this.redirectTo('authReward');
   },
   // --------------------------------------------------------------------------
   // Page Navigation
   // --------------------------------------------------------------------------
   userPrizesPage : function()
   {
      this.openPage('userPrizes');
   },
   merchantPrizesPage : function()
   {
      this.openPage('merchantPrizes');
   },
   prizePage : function()
   {
      var me = this;
      var showPrize = me.showPrize;

      me.silentPopView(1);
      me.setMode('showPrize');
      //Ext.defer(function()
      {
         me.stopRouletteScreen();

         me.pushView(me.getMainPage());
         //me.showPrize get deleted

         //Update on Facebook
         Genesis.fb.facebook_onLogin(function(params)
         {
            me.updatingPrizeOnFacebook(showPrize);
         }, false, me.updatePrizeOnFbMsg);
      } //
      //,3 * 1000, me);
   },
   redeemRewardsPage : function()
   {
      this.openPage('reward');
   },
   authRewardPage : function()
   {
      this.openPage('authReward');
   },
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
   openPage : function(subFeature)
   {
      this.setMode(subFeature);
      this.pushView(this.getMainPage());
   },
   getMainCarousel : function()
   {
      var carousel = null;
      switch (this.getMode())
      {
         case 'userPrizes' :
         {
            carousel = this.getUserPrizesCarousel();
            if (!carousel)
            {
               var container = this.getMainPage();
               container.removeAll();
               container.add(
               {
                  xtype : 'carousel',
                  scrollable : undefined
               });
               carousel = this.getUserPrizesCarousel();
            }
            break;
         }
         case 'merchantPrizes' :
         {
            carousel = this.getMerchantPrizesCarousel();
            if (!carousel)
            {
               var container = this.getMainPage();
               container.removeAll();
               container.add(
               {
                  xtype : 'carousel',
                  scrollable : undefined
               });
               carousel = this.getMerchantPrizesCarousel();
            }
            break;
         }
         case 'showPrize' :
         case 'reward' :
         case 'authReward' :
         {
            break;
         }
      }
      return carousel;
   },
   getMainPage : function()
   {
      var me = this;
      var page;
      switch (me.getMode())
      {
         case 'userPrizes' :
         {
            me.setAnimationMode(me.self.superclass.self.animationMode['slide']);
            page = me.getUserPrizes();
            break;
         }
         case 'merchantPrizes' :
         {
            me.setAnimationMode(me.self.superclass.self.animationMode['slideUp']);
            page = me.getMerchantPrizes();
            break;
         }
         case 'showPrize' :
         case 'reward' :
         case 'authReward' :
         {
            me.setAnimationMode(me.self.superclass.self.animationMode['slideUp']);
            page = me.getShowPrize();
            break;
         }
      }

      return page;
   },
   openMainPage : function()
   {
      this.setMode('userPrizes');
      this.pushView(this.getMainPage());
      console.log("Prizes Page Opened");
   },
   isOpenAllowed : function()
   {
      // If not logged in, forward to login page
      return true;
   }
});

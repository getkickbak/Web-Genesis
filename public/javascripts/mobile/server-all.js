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
   /**
    * Removes all items currently in the Container, optionally destroying them all
    * @param {Boolean} destroy If true, {@link Ext.Component#destroy destroys} each removed Component
    * @param {Boolean} everything If true, completely remove all items including docked / centered and floating items
    * @return {Ext.Component} this
    */
   removeAll : function(destroy, everything)
   {
      var rc = this.callParent(arguments);
      this.setPreRender([]);

      return rc;
   },
   createView : function()
   {
      return (this.getPreRender().length == 0);
   },
   showView : function()
   {
      // Do not add to view, if there's existing items, only re-render on empty views
      if (this.getInnerItems().length == 0)
      {
         this.add(this.getPreRender());
      }
      var titlebar = this.query('titlebar')[0];
      Ext.defer(titlebar.setMasked, 0.3 * 1000, titlebar, [false]);
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
   loadingMsg : 'Loading ...',
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
      /*
       Ext.Viewport.setMasked(
       {
       xtype : 'loadmask',
       message : this.loadingMsg
       });
       */

      var layout = this.getLayout(), defaultAnimation;
      var oldActiveItem = this.getActiveItem();

      if (this.activeItemAnimation)
      {
         this.activeItemAnimation.destroy();
         //console.debug("Destroying AnimateActiveItem ...");
      }
      this.activeItemAnimation = animation = new Ext.fx.layout.Card(animation);
      if (animation && layout.isCard)
      {
         animation.setLayout(layout);
         defaultAnimation = layout.getAnimation();
         if (defaultAnimation)
         {
            var controller = _application.getController('Viewport').getEventDispatcher().controller;

            defaultAnimation.disable();
            controller.pause();
            animation.on('animationend', function()
            {
               defaultAnimation.enable();
               animation.destroy();
               delete this.activeItemAnimation;

               //console.debug("Animation Complete");
               activeItem.createView();
               activeItem.showView();

               //Ext.Viewport.setMasked(false);
               //
               // Delete oldActiveItem to save DOM memory
               //
               if (oldActiveItem)
               {
                  Ext.defer(function()
                  {
                     //oldActiveItem.destroy();
                     controller.resume();
                     //console.debug('Destroyed View [' + oldActiveItem._itemId + ']');
                  }, 0.1 * 1000, this);
               }
            }, this);
         }
         else
         {
            //Ext.Viewport.setMasked(false);
         }
      }
      
      //console.debug("animateActiveItem");
      
      var rc = this.setActiveItem(activeItem);
      if (!layout.isCard)
      {
         //
         // Defer timeout is required to ensure that
         // if createView called is delayed, we will be scheduled behind it
         //
         activeItem.createView();
         Ext.defer(activeItem.showView, 1, activeItem);
         //Ext.Viewport.setMasked(false);
      }
      return rc;
   },
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
   /**
    * Removes all items currently in the Container, optionally destroying them all
    * @param {Boolean} destroy If true, {@link Ext.Component#destroy destroys} each removed Component
    * @param {Boolean} everything If true, completely remove all items including docked / centered and floating items
    * @return {Ext.Component} this
    */
   removeAll : function(destroy, everything)
   {
      var rc = this.callParent(arguments);
      this.setPreRender([]);

      return rc;
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
         console.log("MainPage Icons Not changed.");
      }
      delete carousel._listitems;
   },
   showView : function()
   {
      // Do not add to view, if there's existing items, only re-render on empty views
      if (this.getInnerItems().length == 0)
      {
         this.add(this.getPreRender());
      }

      var carousel = this;
      if (carousel.getInnerItems().length > 0)
      {
         carousel.setActiveItem(0);
      }
      this.query('titlebar')[0].setMasked(false);
   }
});
Ext.define('Genesis.view.server.SettingsPage',
{
   extend : 'Ext.form.Panel',
   requires : ['Ext.dataview.List', 'Ext.XTemplate', 'Genesis.view.widgets.ListField'],
   alias : 'widget.serversettingspageview',
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
   /**
    * Removes all items currently in the Container, optionally destroying them all
    * @param {Boolean} destroy If true, {@link Ext.Component#destroy destroys} each removed Component
    * @param {Boolean} everything If true, completely remove all items including docked / centered and floating items
    * @return {Ext.Component} this
    */
   removeAll : function(destroy, everything)
   {
      var rc = this.callParent(arguments);
      this.setPreRender([]);

      return rc;
   },
   createView : Ext.emptyFn,
   showView : function()
   {
      var titlebar = this.query('titlebar')[0];
      Ext.defer(titlebar.setMasked, 0.3 * 1000, titlebar, [false]);
   }
});
Ext.define('Genesis.view.server.Rewards',
{
   extend : 'Genesis.view.ViewBase',
   requires : ['Ext.Toolbar', 'Ext.field.Text'],
   alias : 'widget.serverrewardsview',
   config :
   {
      layout : 'fit',
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
         tag : 'rewards',
         cls : 'rewardsServerMain',
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
         items : [
         // -------------------------------------------------------------------
         // Reward Calculator
         // -------------------------------------------------------------------
         {
            xtype : 'container',
            tag : 'rewardsMainCalculator',
            cls : 'rewardsMainCalculator',
            layout : 'fit',
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
                  title : 'Amount Spent'
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
               cls : 'rewardsCalculator'
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
                     text : '0'
                  },
                  {
                     text : '.'
                  }]
               }]
            },
            {
               docked : 'bottom',
               xtype : 'button',
               cls : 'separator',
               tag : 'showQrCode',
               text : 'Show QRCode',
               ui : 'orange-large'
            }]
         },
         // -------------------------------------------------------------------
         // Show for QRCode Screen
         // -------------------------------------------------------------------
         {
            xtype : 'container',
            tag : 'qrcodeContainer',
            cls : 'qrcodeContainer',
            layout : 'fit',
            items : [
            {
               docked : 'top',
               xtype : 'component',
               tag : 'title',
               width : '100%',
               cls : 'title',
               defaultUnit : 'em',
               tpl : Ext.create('Ext.XTemplate', '{[this.getPrice(values)]}',
               {
                  getPrice : function(values)
                  {
                     return values['price'];
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
               text : 'Done',
               ui : 'orange-large'
            }]
         }]
      }));
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
               break;
         }
         return photo_url;
      }
   }
});
Ext.define('Genesis.view.server.Redemptions',
{
   extend : 'Genesis.view.ViewBase',
   requires : ['Ext.dataview.List', 'Ext.XTemplate', 'Ext.Toolbar'],
   alias : 'widget.serverredemptionsview',
   config :
   {
      scrollable : 'vertical',
      cls : 'redemptionsMain',
      layout : 'vbox'
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
            container.setActiveItem(0);
            container.show();

            console.log("MerchantPrize View - Found " + prizesList.length + " Prizes needed to update.");
         }
      }
   },
   showView : function()
   {
      this.callParent(arguments);

      var carousel = this.query('carousel')[0];
      carousel.setActiveItem(0);
      carousel.show();
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
      Ext.defer(this.redirectTo, 1, this, ['accounts']);
      //this.redirect('accounts');
      //this.fireEvent('openpage', 'Accounts', null, null);
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
            Ext.defer(function()
            {
               me.fireEvent('openpage', 'client.Challenges', null, null);
            }, 0.2 * 1000, me);
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
      Ext.defer(this.redirectTo, 0.5 * 1000, this, ['redemptions']);
      //this.redirectTo('redemptions');
      //this.fireEvent('openpage', 'client.Redemptions', 'redemptions', null);
      console.log("Going to Client Redemptions Page ...");
   },
   onPrizesButtonTap : function(b, e, eOpts, eInfo)
   {
      Ext.defer(this.redirectTo, 1, this, ['merchantPrizes']);
      //this.redirectTo('merchantPrizes');
      //this.fireEvent('openpage', 'Prizes', 'merchantPrizes', null);
      console.log("Going to Merchant Prizes Page ...");
   },
   onHomeButtonTap : function(b, e, eOpts, eInfo)
   {
      var vport = this.getViewport();
      Ext.defer(this.redirectTo, 0.5 * 1000, this, ['main']);
      //this.redirectTo('main');
      //this.fireEvent('openpage', 'MainPage', null, null);
      console.log("Going back to HomePage ...");
   },
   onCheckedInAccountTap : function(b, e, eOpts, eInfo)
   {
      var info = this.getViewPortCntlr().getCheckinInfo();
      Ext.defer(this.redirectTo, 0.5 * 1000, this, ['venue' + '/' + info.venue.getId() + '/' + info.customer.getId() + '/1']);
      //this.redirectTo('venue' + '/' + info.venue.getId() + '/' + info.customer.getId() + '/1');
   },
   onBrowseTap : function(b, e, eOpts, eInfo)
   {
      Ext.defer(this.redirectTo, 0.5 * 1000, this, ['exploreS']);
      //this.redirectTo('exploreS');
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

         Ext.defer(function()
         {
            //
            // Recreate View if the view was destroyed for DOM memory optimization
            //
            if (currView['view'].isDestroyed)
            {
               currView['view'] = Ext.create(currView['view'].alias[0]);
               //console.debug("Recreated View [" + currView['view']._itemId + "]")
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
         }, 1, me);
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
      //activeItem.createView();
      this.getInfoBtn()[(merchantMode) ? 'hide' : 'show']();
   },
   onDeactivate : function(oldActiveItem, c, newActiveItem, eOpts)
   {
      var me = this;
      oldActiveItem.removeAll(true);
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
      //Ext.defer(activeItem.createView, 1, activeItem);
      //activeItem.createView();
   },
   onLoginDeactivate : function(oldActiveItem, c, newActiveItem, eOpts)
   {
      var me = this;
      //oldActiveItem.removeAll(true);
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
      //Ext.defer(activeItem.createView, 1, activeItem);
      //activeItem.createView();
   },
   onCreateDeactivate : function(oldActiveItem, c, newActiveItem, eOpts)
   {
      var me = this;
      //oldActiveItem.removeAll(true);
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
Ext.define('Genesis.controller.server.Challenges',
{
   extend : 'Genesis.controller.ControllerBase',
   requires : ['Ext.data.Store'],
   statics :
   {
      serverRedemption_path : '/serverChallenges'
   },
   xtype : 'serverChallengesCntlr',
   models : ['PurchaseReward', 'CustomerReward'],
   config :
   {
      refs :
      {
         //
         // Challenges
         //
         challenges :
         {
            selector : 'serverchallengesview',
            autoCreate : true,
            xtype : 'serverchallengesview'
         },
         refreshBtn : 'showprizeview[tag=showPrize] button[tag=refresh]',
      },
      control :
      {
         challenges :
         {
            activate : 'onActivate',
            deactivate : 'onDeactivate'
         },
         refreshBtn :
         {
            tap : 'onRefreshTap'
         }
      }
   },
   invalidAuthCodeMsg : 'Authorization Code is Invalid',
   genAuthCodeMsg : 'Proceed to generate Authorization Code',
   refreshAuthCodeMsg : 'Refresing Authorization Code ...',
   init : function()
   {
      this.callParent(arguments);
      console.log("Server Challenges Init");
   },
   generateQRCode : function()
   {
      return Genesis.controller.ControllerBase.genQRCodeFromParams(
      {
         "type" : 'earn_points'
      });
   },
   // --------------------------------------------------------------------------
   // Server Challenges Page
   // --------------------------------------------------------------------------
   onActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      //Ext.defer(activeItem.createView, 1, activeItem);
      //activeItem.createView();
   },
   onDeactivate : function(oldActiveItem, c, newActiveItem, eOpts)
   {
      var me = this;
      oldActiveItem.removeAll(true);
   },
   onRefreshTap : function(b, e, eOpts)
   {
      var me = this;
      Ext.Viewport.setMasked(
      {
         xtype : 'loadmask',
         message : me.refreshAuthCodeMsg
      });
      var app = me.getApplication();
      var controller = app.getController('Prizes');
      Ext.defer(function()
      {
         var qrcode = me.generateQRCode();
         if (qrcode[0])
         {
            controller.fireEvent('refreshQRCode',qrcode);
         }
         Ext.Viewport.setMasked(false);
      }, 1, me);
   },
   onGenerateQRCode : function()
   {
      var me = this;
      var qrcode = me.generateQRCode();

      if (qrcode[0])
      {
         var controller = me.getApplication().getController('Prizes');
         controller.fireEvent('authreward', Ext.create('Genesis.model.EarnPrize',
         {
            //'id' : 1,
            'expiry_date' : null,
            'reward' : Ext.create('Genesis.model.CustomerReward',
            {
               id : 0,
               title : 'Authorization Code',
               type :
               {
                  value : 'earn_points'
               },
               photo :
               {
                  'thumbnail_ios_medium' :
                  {
                     url : qrcode[0],
                     height : qrcode[1],
                     width : qrcode[2],
                  }
               }
            }),
            'merchant' : null
         }));
      }
   },
   // --------------------------------------------------------------------------
   // Base Class Overrides
   // --------------------------------------------------------------------------
   openMainPage : function()
   {
      var me = this;
      Ext.device.Notification.show(
      {
         title : 'Authorize Challenges',
         message : me.genAuthCodeMsg,
         buttons : ['OK', 'Cancel'],
         callback : function(btn)
         {
            if (btn.toLowerCase() == 'ok')
            {
               console.log(me.genAuthCodeMsg);
               me.onGenerateQRCode();
            }
         }
      });
   },
   isOpenAllowed : function()
   {
      return true;
   }
});
Ext.define('Genesis.controller.server.Rewards',
{
   extend : 'Genesis.controller.ControllerBase',
   requires : ['Ext.data.Store'],
   statics :
   {
      serverRewards_path : '/serverRewards'
   },
   xtype : 'serverRewardsCntlr',
   models : ['PurchaseReward', 'CustomerReward'],
   config :
   {
      routes :
      {
         'earnPts' : 'earnPtsPage'
      },
      refs :
      {
         //
         // Rewards
         //
         rewards :
         {
            selector : 'serverrewardsview',
            autoCreate : true,
            xtype : 'serverrewardsview'
         },
         rewardsContainer : 'serverrewardsview container[tag=rewards]',
         price : 'serverrewardsview textfield',
         qrcode : 'serverrewardsview component[tag=qrcode]',
         title : 'serverrewardsview component[tag=title]',
         infoBtn : 'viewportview button[tag=info]'
      },
      control :
      {
         rewards :
         {
            activate : 'onActivate',
            deactivate : 'onDeactivate'
         },
         rewardsContainer :
         {
            activeitemchange : 'onContainerActivate'
         },
         'serverrewardsview container[tag=dialpad] button' :
         {
            tap : 'onCalcBtnTap'
         },
         'serverrewardsview container[tag=rewardsMainCalculator] button[tag=showQrCode]' :
         {
            tap : 'onShowQrCodeTap'
         },
         'serverrewardsview container[tag=qrcodeContainer] button[tag=done]' :
         {
            tap : 'onDoneTap'
         }
      }
   },
   maxValue : 1000.00,
   invalidPriceMsg : 'Please enter a valid price (eg. 5.00), upto $1000',
   init : function()
   {
      this.callParent(arguments);
      console.log("Server Rewards Init");
   },
   getPricePrecision : function(num)
   {
      var precision = num.split('.');
      return ((precision.length > 1) ? precision[1].length : 0);
   },
   // --------------------------------------------------------------------------
   // Rewards Page
   // --------------------------------------------------------------------------
   onActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      /*
      var container = this.getRewardsContainer();s
      if(container)
      {
      var activeItem = container.getActiveItem();
      var animation = container.getLayout().getAnimation();
      animation.disable();
      switch (activeItem.config.tag)
      {
      case 'qrcodeContainer' :
      {
      this.onToggleBtnTap(null, null, null, null);
      break;
      }
      default :
      break;
      }
      animation.enable();
      }
      */
      //Ext.defer(activeItem.createView, 1, activeItem);
      //activeItem.createView();
   },
   onDeactivate : function(oldActiveItem, c, newActiveItem, eOpts)
   {
      var me = this;
      //oldActiveItem.removeAll(true);
      var priceField = me.getPrice();
      priceField.setValue(null);
      me.enablePrecision = false;
      me.onDoneTap();
   },
   /*
    onToggleBtnTap : function(b, e, eOpts, eInfo)
    {
    var container = this.getRewardsContainer();
    var activeItem = container.getActiveItem();

    switch (activeItem.config.tag)
    {
    case 'rewardsMainCalculator' :
    {
    //container.setActiveItem(1);
    break;
    }
    case 'qrcodeContainer' :
    {
    //container.setActiveItem(0);
    break;
    }
    }
    return num;
    },
    */
   onContainerActivate : function(c, value, oldValue, eOpts)
   {
      var me = this;
      var container = me.getRewardsContainer();
      var animation = container.getLayout().getAnimation();

      switch (value.config.tag)
      {
         case 'rewardsMainCalculator' :
         {
            var priceField = me.getPrice();
            priceField.setValue(null);
            me.enablePrecision = false;
            animation.setReverse(true);
            break;
         }
         case 'qrcodeContainer' :
         {
            animation.setReverse(false);
            break;
         }
      }
      console.debug("Rewards ContainerActivate Called.");
      Ext.Viewport.setMasked(false);
   },
   onShowQrCodeTap : function(b, e, eOpts, eInfo)
   {
      var me = this;
      var container = me.getRewardsContainer();

      var price = me.getPrice().getValue();
      var precision = this.getPricePrecision(price);
      if (precision < 2)
      {
         Ext.device.Notification.show(
         {
            title : 'Validation Error',
            message : me.invalidPriceMsg
         });
         return;
      }
      Ext.Viewport.setMasked(
      {
         xtype : 'loadmask',
         message : me.genQRCodeMsg
      });
      // Needed delay to show the LoadingMask
      Ext.defer(function()
      {
         //var anim = container.getLayout().getAnimation();
         console.debug("Encrypting QRCode with Price:$" + price);
         var qrcodeMetaData = Genesis.controller.ControllerBase.genQRCodeFromParams(
         {
            "amount" : price,
            "type" : 'earn_points'
         });
         me.getQrcode().setStyle(
         {
            'background-image' : 'url(' + qrcodeMetaData[0] + ')',
            'background-size' : Genesis.fn.addUnit(qrcodeMetaData[1]) + ' ' + Genesis.fn.addUnit(qrcodeMetaData[2])
         });
         me.getTitle().setData(
         {
            price : '$' + price
         });
         //anim.disable();
         container.setActiveItem(1);
         //anim.enable();
      }, 1, me);
   },
   onCalcBtnTap : function(b, e, eOpts, eInfo)
   {
      var me = this;
      var viewport = me.getViewPortCntlr();

      Genesis.controller.ControllerBase.playSoundFile(viewport.sound_files['clickSound']);
      var value = b.getText();
      var priceField = me.getPrice();
      var price = Number(priceField.getValue() || 0);
      var precision = me.getPricePrecision(priceField.getValue());
      switch (value)
      {
         case '.' :
         {
            me.enablePrecision = true;
            if (precision == 0)
            {
               var num = price.toString().split('.');
               price = num[0] + '.';
            }
            break;
         }
         case 'AC' :
         {
            me.enablePrecision = false;
            price = null;
            break;
         }
         default :
            if (me.enablePrecision)
            {
               if (precision < 2)
               {
                  price += (Number(value) / Math.pow(10, precision + 1));
                  price = price.toFixed(precision + 1);
               }
            }
            else
            {
               price = (10 * price) + Number(value);
            }
            break;
      }
      // Max value
      if (price <= me.maxValue)
      {
         priceField.setValue(price);
      }
   },
   onDoneTap : function(b, e, eOpts, eInfo)
   {
      var me = this;
      var container = me.getRewardsContainer();
      container.setActiveItem(0);
   },
   // --------------------------------------------------------------------------
   // Page Navigation
   // --------------------------------------------------------------------------
   earnPtsPage : function()
   {
      var me = this;
      var page = me.getRewards();
      me.setAnimationMode(me.self.superclass.self.animationMode['slide']);
      me.pushView(page);
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
         case 'rewards':
         {
            me.redirectTo('earnPts');
            break;
         }
      }
   },
   isOpenAllowed : function()
   {
      return true;
   }
});
Ext.define('Genesis.controller.server.Redemptions',
{
   extend : 'Genesis.controller.ControllerBase',
   requires : ['Ext.data.Store'],
   statics :
   {
      serverRedemption_path : '/serverRedemptions'
   },
   xtype : 'serverRedemptionsCntlr',
   models : ['PurchaseReward', 'CustomerReward'],
   config :
   {
      refs :
      {
         //
         // Redemptions
         //
         redemptions :
         {
            selector : 'serverredemptionsview',
            autoCreate : true,
            xtype : 'serverredemptionsview'
         },
         verifyBtn : 'showprizeview[tag=showPrize] button[tag=verify]',
      },
      control :
      {
         redemptions :
         {
            activate : 'onActivate',
            deactivate : 'onDeactivate'
         },
         verifyBtn :
         {
            tap : 'onVerifyTap'
         }
      }
   },
   invalidAuthCodeMsg : 'Authorization Code is Invalid',
   authCodeNoLongValidMsg : function()
   {
      return 'Authorization Code' + Genesis.constants.addCRLF() + 'is no longer valid'
   },
   init : function()
   {
      this.callParent(arguments);
      console.log("Server Redemptions Init");
   },
   verifyQRCode : function(encrypted)
   {
      console.debug("Encrypted Code Length: " + encrypted.length);
      console.debug("Decrypted content [" + encrypted + "]");

      var me = this;
      var keys = Genesis.constants.getPrivKey();
      GibberishAES.size(256);
      var dbI = Genesis.db.getRedeemIndexDB();
      for (var key in keys)
      {
         try
         {
            console.debug("Decrypting message using key[" + keys[key] + "]");
            data = GibberishAES.dec(encrypted, keys[key]);
            console.debug("Decrypted Data[" + data + "]");
            var decrypted = Ext.decode(data);
            console.debug("Decoded Data!");
            var date = new Date(decrypted["expiry_ts"]);

            if (dbI[encrypted])
            {
               console.log(me.authCodeNoLongValidMsg());
               Ext.device.Notification.show(
               {
                  title : 'Error!',
                  message : me.authCodeNoLongValidMsg()
               });
               return;
            }
            else
            if ((date >= Date.now()) && (date <= new Date().addHours(3 * 2)))
            {
               console.log("Found QRCode type[" + decrypted['type'] + "]");
               switch (decrypted['type'])
               {
                  case 'redeem_prize' :
                     break;
                  case 'redeem_reward' :
                     break;
               }

               //
               // Add to Persistent Store to make sure it cannot be rescanned again
               //
               Genesis.db.addRedeemSortedDB([encrypted, dbI[encrypted]]);
               Genesis.db.addRedeemIndexDB(encrypted, decrypted["expiry_ts"]);

               var controller = me.getApplication().getController('Prizes');
               controller.fireEvent('authreward', Ext.create('Genesis.model.EarnPrize',
               {
                  //'id' : 1,
                  'expiry_date' : null,
                  'reward' : Ext.create('Genesis.model.CustomerReward',
                  {
                     type : decrypted['reward'].type,
                     title : decrypted['reward'].title
                  }),
                  'merchant' : null
               }));
               return;
            }
            else
            {
               console.log("Decrypted data used an expired key from Vendor[" + key + "]");
            }
         }
         catch(e)
         {
            console.log("Error decrypted data [" + e + "]");
         }
      }
      Ext.device.Notification.show(
      {
         title : 'Error!',
         message : me.invalidAuthCodeMsg
      });
   },
   // --------------------------------------------------------------------------
   // Redemptions Page
   // --------------------------------------------------------------------------
   onActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      //Ext.defer(activeItem.createView, 1, activeItem);
      //activeItem.createView();
   },
   onDeactivate : function(oldActiveItem, c, newActiveItem, eOpts)
   {
      var me = this;
      oldActiveItem.removeAll(true);
   },
   onScannedQRcode : function(encrypted)
   {
      var me = this;
      if (!encrypted)
      {
         /*
          if(Ext.isDefined(encrypted))
          {
          encrypted = Genesis.controller.ControllerBase.genQRCodeFromParams(
          {
          "type" : 'redeem_reward',
          "reward" :
          {
          type :
          {
          value : 'reward'
          },
          title : 'Test QR Code'
          }
          });
          }
          else
          */
         {
            Ext.device.Notification.show(
            {
               title : 'Error!',
               message : me.invalidAuthCodeMsg
            });
         }
      }
      me.verifyQRCode(encrypted);
   },
   onRedeemVerification : function()
   {
      var me = this;
      Ext.device.Notification.show(
      {
         title : 'Redemption Verification',
         message : 'Proceed to scan your customer\'s Authorization Code',
         buttons : ['OK', 'Cancel'],
         callback : function(btn)
         {
            if (btn.toLowerCase() == 'ok')
            {
               console.log("Verifying Authorization Code ...");
               me.scanQRCode();
            }
         }
      });
   },
   onVerifyTap : function(b, e, eOpts)
   {
      this.popView();
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
      switch(subFeature)
      {
         case 'redemptions' :
         {
            this.onRedeemVerification();
            break;
         }
      }
   },
   isOpenAllowed : function()
   {
      return true;
   }
});

//
// Cleanup Redeem Database every 6 hours
//
var _dbCleanup = function()
{
   Ext.defer(function()
   {
      Genesis.db.redeemDBCleanup();
      _dbCleanup();
   }, 1000 * 60 * 60 * 3);
};

_dbCleanup();
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
   wonPrizeEmailMsg : function(prizeName, venueName)
   {
      return ('I just won ' + prizeName + ' for eating out at ' + venueName + '!');
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
         var message = me.wonPrizeEmailMsg(earnprize.getCustomerReward().get('title'), venue.get('name'));

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

      me.getMCloseBB().show();
      me.getMBB().hide();

      //
      // List all the prizes won by the Customer
      //
      var viewport = me.getViewPortCntlr();
      var merchantId = (viewport.getVenue()) ? viewport.getVenue().getMerchant().getId() : 0;
      var prizesList = [];
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
      //Ext.defer(activeItem.createView, 0.1 * 1000, activeItem);
      //activeItem.createView();
   },
   onUserPrizesActivate : function(activeItem, c, oldActiveItem, eOpts)
   {
      var me = this;
      var prizesList = [];

      me.getUCloseBB().hide();
      me.getUBB().show();
      me.getURedeemBtn().hide();

      /*
      var prizes = Ext.StoreMgr.get('MerchantPrizeStore').getRange();
      for (var i = 0; i < prizes.length; i++)
      {

      prizesList.push(prizes[i]);
      }
      if (prizesList.length == 0)
      {
      me.getURedeemBtn().hide();
      }
      else
      {
      me.getURedeemBtn().show();
      }
      */
      //Ext.defer(activeItem.createView, 1, activeItem);
      //activeItem.createView();
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
            tbbar.addCls('kbTitle');
            tbbar.setTitle(' ');
            me.getRefreshBtn()[photo ?  'show' :'hide']();
            me.getVerifyBtn()[photo ?  'hide' :'show']();
            me.getSRedeemBtn().hide();
            break;
         }
         case 'reward' :
         {
            tbbar.removeCls('kbTitle');
            tbbar.setTitle('Rewards');
            me.getRefreshBtn()['hide']();
            me.getVerifyBtn()['hide']();
            me.getSRedeemBtn().show();
            break;
         }
         case 'showPrize' :
         default:
            tbbar.removeCls('kbTitle');
            tbbar.setTitle('Prizes');
            me.getRefreshBtn()['hide']();
            me.getVerifyBtn()['hide']();
            me.getSRedeemBtn().show();
            break;
      }
      view.showPrize = me.showPrize;
      console.log("ShowPrize View - Updated ShowPrize View.");
      Ext.defer(function()
      {
         //activeItem.createView();
         delete me.showPrize;
      }, 1, activeItem);
      //view.createView();
      //delete me.showPrize;
   },
   onDeactivate : function(oldActiveItem, c, newActiveItem, eOpts)
   {
      var me = this;
      oldActiveItem.removeAll(true);
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
      Ext.defer(function()
      {
         this.pushView(this.getMainPage())
      }, 1, this);
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

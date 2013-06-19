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

      if (itemCls)
      {
         cls += ' ' + itemCls;
      }
      config =
      {
         cls : cls,
         children : [
         {
            cls : me.labelClsShortCache
            //html : dataview.getItemTpl().apply(data)
         }]
      };

      if (dataview.getIcon())
      {
         iconSrc = data.iconSrc;
         config.children.push(
         {
            cls : me.iconClsShortCache,
            style : (('background-image: ' + iconSrc) ? 'url("' + newSrc + '")' : '')
         });
      }
      return config;
   },
   moveItemsToCache : function(from, to)
   {
      var me = this, dataview = me.dataview, maxItemCache = dataview.getMaxItemCache(), items = me.getViewItems(), itemCache = me.itemCache, cacheLn = itemCache.length, pressedCls = dataview.getPressedCls(), selectedCls = dataview.getSelectedCls(), i = to - from, item;

      for (; i >= 0; i--)
      {
         item = Ext.get(items[from + i]);
         var extItem = item.down(me.labelClsCache, true);
         var extCmp = Ext.getCmp(extItem.childNodes[0].id);
         if (cacheLn !== maxItemCache)
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

      if (me.getViewItems().length == 0)
      {
         this.dataview.showEmptyText();
      }
   },
   moveItemsFromCache : function(records)
   {
      var me = this, dataview = me.dataview, store = dataview.getStore(), ln = records.length;
      var xtype = dataview.getDefaultType(), itemConfig = dataview.getItemConfig();
      var itemCache = me.itemCache, cacheLn = itemCache.length, items = [], i, item, record;

      if (ln)
      {
         dataview.hideEmptyText();
      }

      for ( i = 0; i < ln; i++)
      {
         records[i]._tmpIndex = store.indexOf(records[i]);
      }

      Ext.Array.sort(records, function(record1, record2)
      {
         return record1._tmpIndex > record2._tmpIndex ? 1 : -1;
      });

      for ( i = 0; i < ln; i++)
      {
         record = records[i];
         if (cacheLn)
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

      if (!ln || index == ln)
      {
         wrapElement.appendTo(element);
      }
      else
      {
         wrapElement.insertBefore(childNodes[index]);
      }

      var extItem = wrapElement.down(me.labelClsCache, true);
      if (!item)
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
      if (item.isComponent && item.updateRecord)
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

      for (; i < len; i++)
      {
         this.itemCache[i].destroy();
         this.itemCache[i] = null;
      }
      delete this.itemCache;
      for ( i = 0; i < ln; i++)
      {
         Ext.removeNode(elements[i]);
      }
      this.callParent();
   }
});

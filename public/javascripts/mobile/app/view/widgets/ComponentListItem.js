/**
 * @private
 */
Ext.define('Genesis.view.widgets.ComponentListItem',
{
   extend : 'Ext.dataview.element.List',
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

      if(dataview.getOnItemDisclosure())
      {
         config.children.push(
         {
            cls : me.disclosureClsShortCache + ((data[dataview.getDisclosureProperty()] === false) ? me.hiddenDisplayCache : '')
         });
      }
      return config;
   },
   // Remove
   moveItemsToCache : function(from, to)
   {
      var me = this, items = me.getViewItems(), i = to - from, item;

      for(; i >= 0; i--)
      {
         item = items[from + i];
         var extItem = Ext.fly(item).down(me.labelClsCache, true);
         Ext.Array.remove(me.itemCache, Ext.getCmp(extItem.data));
         Ext.getCmp(extItem.data).destroy();
         item.parentNode.removeChild(item);
      }
      if(me.getViewItems().length == 0)
      {
         this.dataview.showEmptyText();
      }
   },
   addListItem : function(index, record)
   {
      var me = this, dataview = me.dataview, data = dataview.prepareData(record.getData(true), dataview.getStore().indexOf(record), record), element = me.element, childNodes = element.dom.childNodes, ln = childNodes.length, wrapElement;
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
      var item = new Ext.widget(xtype,
      {
         xtype : xtype,
         record : record,
         dataview : dataview,
         itemCls : dataview.getItemCls(),
         defaults : itemConfig
      });
      me.itemCache.push(item);

      var extItem = wrapElement.down(me.labelClsCache, true);
      extItem.data = item.getId()
      item.renderTo(extItem);
   },
   updateListItem : function(record, item)
   {
      var me = this, dataview = me.dataview, extItem = Ext.fly(item), innerItem = extItem.down(me.labelClsCache, true), data = record.data, disclosureProperty = dataview.getDisclosureProperty(), disclosure = data && data.hasOwnProperty(disclosureProperty), iconSrc = data && data.hasOwnProperty('iconSrc'), disclosureEl, iconEl;

      Ext.getCmp(innerItem.data).updateRecord(record);
      //innerItem.innerHTML = dataview.getItemTpl().apply(data);

      if(disclosure && data[disclosureProperty] === false)
      {
         disclosureEl = extItem.down(me.disclosureClsCache);
         disclosureEl[disclosure ? 'removeCls' : 'addCls'](me.hiddenDisplayCache);
      }

      if(dataview.getIcon())
      {
         iconEl = extItem.down(me.iconClsCache, true);
         iconEl.style.backgroundImage = iconSrc ? 'url("' + iconSrc + '")' : '';
      }
   },
   destroy : function()
   {
      var elements = this.getViewItems(), ln = elements.length, i = 0, len = this.itemCache.length;

      for(; i < len; i++)
      {
         this.itemCache[i].destroy();
      }
      for( i = 0; i < ln; i++)
      {
         Ext.removeNode(elements[i]);
      }
      this.callParent();
   }
});

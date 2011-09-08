
app.views.ItemDetail = Ext.extend(Ext.TabPanel,
{
   //styleHtmlContent : true,
   activeItem : 0,
   tabBar :
   {
      dock : 'bottom',
      height : '4.5em',
      ui : 'large',
      defaults :
      {
         //xtype : 'button',
         //ui : 'large',
         flex : 1,
         height : '4em',
         iconMask : true,
         iconAlign : 'top'
      }
   },
   cardSwitchAnimation :
   {
      type : 'slide',
      cover : true
   },
   defaults :
   {
      scroll : 'vertical'
   },
   dockedItems : [
   {
      docked : 'top',
      xtype : 'toolbar',
      title : 'Runners Shop',
      ui : 'light',
      defaults :
      {
         iconMask : true
      },
      items : []
   },
   {
      docked : 'top',
      xtype : 'toolbar',
      titleCls : Ext.Toolbar.prototype.titleCls + ' paddingHalfEM',
      title : '<div style="float:left;font-size:0.6em;line-height:1.5em;">Time Left to Buy</div><div class="highlight" style="float:left;clear:both;line-height:1.5em;">02d 04h 19m</div>',
      ui : 'secondary',
      defaults :
      {
         iconMask : true
      },
      items : [
      {
         width : '12em',
         xtype : 'spacer'
      },
      {
         xtype : 'button',
         flex : 1,
         ui : 'green',
         cls : 'largeButtonFont hightlight',
         text : 'Buy Now!',
         listeners :
         {
            'tap' : function(b, e)
            {
            }
         }
      }]
   }],
   listeners :
   {
      'afterlayout' : function(t, layout)
      {
         var activeItem = layout.activeItem;

         if(activeItem.offset)
         {
            var items = layout.getLayoutItems(), ln = items.length, targetBox = layout.getTargetBox();
            targetBox.height += activeItem.offset;
            targetBox.y -= activeItem.offset;
            layout.setItemBox(activeItem, targetBox);
         }
      }
   },
   items : [
   {
      offset : 40,
      title : 'My Rewards',
      iconCls : 'star',
      listeners :
      {
         'tap' : function(b, e)
         {
         }
      },
      items : [
      {
         xtype : 'dataview',
         autoWidth : true,
         scroll : false,
         autoHeight : true,
         store : app.stores.items2,
         cls : 'largeButtonFont roundCls',
         style : 'background:#FFE4C4;margin:1em;',
         itemSelector : 'div.thumb',
         tpl : new Ext.XTemplate('<tpl for=".">', '<div class="highlight" style="padding-top:3.5em;">{desc}</div>', '<div class="thumb">', '<img src="{url}" />', '</div>', '</tpl>'),
         listeners :
         {
            'refresh' : function(d)
            {
               //d.setWidth(d.store.data.length / (605));
            }
         }
      },
      {
         xtype : 'button',
         flex : 1,
         ui : 'orange',
         cls : 'largeButtonFont',
         text : 'Share this Deal',
         listeners :
         {
            'tap' : function(b, e)
            {
            }
         }
      },
      {
         xtype : 'dataview',
         scroll : false,
         cls : 'x-dataview x-list x-list-flat x-list-round',
         store : app.stores.items2,
         style : 'background:transparent;',
         itemSelector : 'div.x-list-item',
         tpl : new Ext.XTemplate('<div class="x-list-parent">', '<tpl for=".">', '<div class="x-list-item"><div class="x-list-item-body">', '<tpl if="xindex == 1">', '<img class="imgRoundCls" style="float:left;" src="{author.photo}" />', '<div>', '<div class="majorText">{author.name}</div>', '<div class="minorText">Spotted this on {timeStamp}</div>', '</div>', '</tpl>', '<tpl if="xindex == 2">', '<img class="imgRoundCls" style="float:left;" src="{author.photo}" />', '<div>', '<div class="majorText">{address}</div>', '<div class="minorText">{address}</div>', '</div>', '</tpl>', '<tpl if="xindex == 3">', '<img class="imgRoundCls" style="float:left;" src="{author.photo}" />', '<div>', '<div class="majorText">{name}</div>', '<div class="minorText">Find more about this food!</div>', '</div>', '</tpl>', '</div>', '<div class="x-list-disclosure"></div>', '</div>', '</tpl>', '</div>')
      }],
   },
   {
      title : 'My Coupons',
      badgeText : '0',
      iconCls : 'star',
      listeners :
      {
         'tap' : function(b, e)
         {
         }
      },
      items : [
      {
         xtype : 'dataview',
         autoWidth : true,
         scroll : false,
         autoHeight : true,
         store : app.stores.items2,
         style : 'background:transparent;',
         itemSelector : 'div.thumb',
         tpl : new Ext.XTemplate('<tpl for=".">', '<div class="thumb">', '<img src="{url}" />', '</div>', '</tpl>'),
         listeners :
         {
            'refresh' : function(d)
            {
               d.setWidth(d.store.data.length / 3 * (605));
            }
         }
      }]
   },
   {
      title : 'Settings',
      iconCls : 'star',
      listeners :
      {
         'tap' : function(b, e)
         {
         }
      }
   }],
   updateWithRecord : function(record)
   {
      //app.stores.items2.loadRecords([record, Ext.ModelMgr.create(record.data,
      // 'app.models.Item1'), Ext.ModelMgr.create(record.data,
      // 'app.models.Item1')]);
      app.stores.items2.loadRecords([record]);
      /*
       Ext.each(this.items.items, function(item1)
       {
       Ext.each(item1.items.items, function(item2)
       {
       Ext.each(item2.items.items, function(item3)
       {
       item3.update(record.data);
       });
       });
       });
       var toolbar = this.getDockedItems()[0];
       toolbar.setTitle(record.get('givenName') + ' ' +
       record.get('familyName'));
       toolbar.getComponent('edit').record = record;
       toolbar.getComponent('browseItemsBack').record = record;
       toolbar.getComponent('browseItemsFwd').record = record;
       */
   },
   initComponent : function()
   {
      this.updateWithRecord(app.stores.items1.getById(0));
      app.views.ItemDetail.superclass.initComponent.apply(this, arguments);
   }
});

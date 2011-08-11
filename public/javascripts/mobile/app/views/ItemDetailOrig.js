app.views.ItemDetail = Ext.extend(Ext.Panel,
{
   styleHtmlContent:true,
   scroll: 'vertical',
   /*
    layout:'anchor',
    defaults:
    {
    anchor:'-0'
    },
    */
   dockedItems: [
   {
      docked : 'top',
      xtype: 'toolbar',
      title: 'Item Detail',
      ui: 'light',
      defaults:
      {
         iconMask: true
      },
      items: [
      {
         text: 'Back',
         ui: 'back',
         listeners:
         {
            'tap': function ()
            {
               Ext.dispatch(
               {
                  controller: app.controllers.items,
                  action: 'index',
                  animation:
                  {
                     type:'slide',
                     direction:'right'
                  }
               });
            }
         }
      },
      {
         xtype:'spacer'
      },
      /*
       {
       id: 'edit',
       text: 'Edit',
       ui: 'action',
       listeners:
       {
       'tap': function ()
       {
       Ext.dispatch(
       {
       controller: app.controllers.items,
       action: 'edit',
       id: this.record.getId()
       });
       }
       }
       },
       */
      {
         id: 'browseItemsBack',
         iconCls : 'arrow_left',
         ui : 'leftBack-round',
         // text: 'Edit',
         listeners:
         {
            'tap': function ()
            {
            }
         }
      },
      {
         id: 'browseItemsFwd',
         iconCls : 'arrow_right',
         ui : 'rightFwd-round',
         // text: 'Edit',
         listeners:
         {
            'tap': function ()
            {
            }
         }
      }]
   },
   {
      dock : 'bottom',
      xtype: 'toolbar',
      ui: 'light',
      defaults:
      {
         iconMask: true
      },
      items: [
      {
         xtype:'splitbutton',
         text: 'Like it!',
         ui: 'light',
         badgeText :'0',
         iconCls : 'star',
         listeners:
         {
            'tap': function (b,e)
            {
               b.setBadge(parseInt(b.getBadgeText())+1);
            }
         }
      },
      {
         xtype:'spacer'
      }]
   }],
   items:[
   {
      xtype:'panel',
      cls : 'bannerCls',
      html : 'Groupon',
      autoWidth:true,
      height:130
   },
   {
      xtype:'dataview',
      autoWidth:true,
      scroll:false,
      autoHeight:true,
      store: app.stores.items2,
      style:'background:transparent;',
      itemSelector: 'div.thumb',
      tpl: new Ext.XTemplate(
      '<tpl for=".">',
      '<tpl if="xindex == 1">',
      '<div class="thumb">',
      '<img src="{url}" />',
      '</div>',
      '</tpl>',
      '</tpl>'
      ),
      listeners:
      {
         'refresh' : function(d)
         {
            d.setWidth(d.store.data.length/3 * (605));
         }
      }
   },
   {
      xtype: 'dataview',
      scroll:false,
      cls : 'x-dataview x-list x-list-flat x-list-round',
      store: app.stores.items2,
      style:'background:transparent;',
      itemSelector : 'div.x-list-item',
      tpl: new Ext.XTemplate(
      '<div class="x-list-parent">',
      '<tpl for=".">',
      '<div class="x-list-item"><div class="x-list-item-body">',
      '<tpl if="xindex == 1">',
      '<img class="imgRoundCls" style="float:left;" src="{author.photo}" />',
      '<div>',
      '<div class="majorText">{author.name}</div>',
      '<div class="minorText">Spotted this on {timeStamp}</div>',
      '</div>',
      '</tpl>',
      '<tpl if="xindex == 2">',
      '<img class="imgRoundCls" style="float:left;" src="{author.photo}" />',
      '<div>',
      '<div class="majorText">{address}</div>',
      '<div class="minorText">{address}</div>',
      '</div>',
      '</tpl>',
      '<tpl if="xindex == 3">',
      '<img class="imgRoundCls" style="float:left;" src="{author.photo}" />',
      '<div>',
      '<div class="majorText">{name}</div>',
      '<div class="minorText">Find more about this food!</div>',
      '</div>',
      '</tpl>',
      '</div>',
      '<div class="x-list-disclosure"></div>',
      '</div>',
      '</tpl>',
      '</div>')
   }],
   updateWithRecord: function(record)
   {
      app.stores.items2.loadRecords([
      record,
      Ext.ModelMgr.create(record.data, 'app.models.Item1'),
      Ext.ModelMgr.create(record.data, 'app.models.Item1')]);
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
   initComponent: function()
   {
      this.updateWithRecord(app.stores.items1.getById(0));
      app.views.ItemDetail.superclass.initComponent.apply(this, arguments);
   }
});
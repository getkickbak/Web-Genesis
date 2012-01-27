Ext.define('Genesis.view.RewardsRedemptionsPage',
{
   extend : 'Ext.Container',
   requires : ['Ext.dataview.List', 'Ext.XTemplate', 'Ext.Toolbar', 'Ext.Title', 'Ext.data.Store', 'Ext.data.Model'],
   alias : 'widget.rewardsredemptionspageview',
   config :
   {
      title : 'Rewards & Redemptions',
      scrollable : 'vertical',
      layout :
      {
         type : 'vbox',
         align : 'stretch',
         pack : 'start'
      },
      items : [
      {
         xtype : 'toolbar',
         cls : 'rewardsRedemptionsPanelHdr',
         centered : false,
         defaults :
         {
            iconMask : true
         },
         items : [
         {
            xtype : 'title',
            title : 'Selected Merchant',
         },
         {
            xtype : 'spacer',
            align : 'right'
         }]
      },
      {
         xtype : 'list',
         height : '9em',
         scrollable : false,
         store : 'RewardsRedemptionsStore',
         cls : 'listNoScrollWrapper noBorder',
         // @formatter:off
         itemTpl : Ext.create('Ext.XTemplate', '<tpl if="this.getArgs()">', '<div class="photo"><img src="{[this.getPhoto.apply(this,this._args)]}"/></div>', '<div class="listItemDetailsWrapper" style="{[this.getWidth()]}">', '<div class="itemTitle">{[this.getName.apply(this,this._args)]}</div>', '<div class="itemDesc">{[this.getAddress.apply(this,this._args)]}</div>', '</div>', '</tpl>',
         // @formatter:on
         {
            getWidth : function()
            {
               return 'width:25em;';
            },
            getArgs : function()
            {
               var store = Ext.StoreMgr.get('RewardsRedemptionsStore');
               var record = store.getRange()[0];
               this._args = [store, record];
               return true;

            },
            getPhoto : function(store, record)
            {
               var values = record.getVenue().getMerchant().data;

               return values.photo_url;
            },
            getName : function(store, record)
            {
               var values = record.getVenue().getMerchant().data;

               return values.name;
            },
            getAddress : function(store, record)
            {
               var values = record.getVenue().data;

               var address = (values.address2) ? values.address1 + ", " + values.address2 : values.address1;
               return (address + ", " + values.city + ", " + values.state + ", " + values.country + ", " + values.zipcode);
            }
         })
      },
      {
         xtype : 'toolbar',
         cls : 'rewardsRedemptionsPanelHdr',
         centered : false,
         defaults :
         {
            iconMask : true
         },
         items : [
         {
            xtype : 'title',
            title : 'Rewards & Redemptions'
         },
         {
            xtype : 'spacer'
         }]
      },
      {
         flex : 1,
         xtype : 'list',
         scrollable : false,
         cls : 'listNoScrollWrapper',
         store : 'RewardsRedemptionsTemplateStore',
         // @formatter:off
         itemTpl : Ext.create('Ext.XTemplate', '<div class="photo"><img src="{photo_url}"/></div>', '<div class="listItemDetailsWrapper">', '<div class="itemDesc">{text}</div>', '</div>'),
         // @formatter:off
         onItemDisclosure : Ext.emptyFn
      }]
   }
});

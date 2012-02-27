Ext.define('Genesis.view.Accounts',
{
   extend : 'Ext.Container',
   requires : ['Ext.dataview.List', 'Ext.XTemplate', 'Ext.Toolbar'],
   alias : 'widget.accountsview',
   config :
   {
      title : 'Loyalty Accounts',
      scrollable : 'vertical',
      changeTitle : false,
      cls : 'accountsMain',
      layout : 'fit',
      items : [
      {
         xtype : 'container',
         layout :
         {
            type : 'card',
            animation :
            {
               type : 'flip'
            }
         },
         tag : 'accountsSelection',
         items : [
         {
            xtype : 'container',
            layout :
            {
               type : 'vbox',
               pack : 'top',
               align : 'stretch'
            },
            items : [
            {
               xtype : 'toolbar',
               cls : 'accountsPanelHdr',
               centered : false,
               items : [
               {
                  xtype : 'title',
                  title : 'Visited Merchants'
               },
               {
                  xtype : 'spacer'
               }]
            },
            {
               flex : 1,
               xtype : 'list',
               store : 'AccountsStore',
               scrollable : false,
               ui : 'bottom-round',
               cls : 'accountsPanel separator_pad',
               // @formatter:off
               itemTpl : Ext.create('Ext.XTemplate', '<div class="photo"><img src="{[this.getPhoto(values)]}"/></div>' + '<div class="listItemDetailsWrapper">' + '<div class="itemTitle">{name}</div>' + '<div class="itemDesc noWrap">{[this.getAddress(values)]}</div>' + '</div>',
               // @formatter:on
               {
                  getPhoto : function(values)
                  {
                     return values.Merchant['icon_url'];
                  },
                  getAddress : function(values)
                  {
                     var address = (values.address2) ? values.address1 + ", " + values.address2 : values.address1;
                     return (address + ",<br/>" + values.city + ", " + values.state + ", " + values.country + ",<br/>" + values.zipcode);
                  }
               }),
               onItemDisclosure : Ext.emptyFn
            }]
         },
         {
            xtype : 'list',
            store : 'AccountsStore',
            scrollable : false,
            cls : 'accountsList',
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
            // @formatter:off
            itemTpl : Ext.create('Ext.XTemplate', '<div class="photo"><img src="{[this.getPhoto(values)]}"/></div>', '<div class="listItemDetailsWrapper">', '<div class="itemTitle">{name}</div>' + '<div class="itemDesc noWrap">{[this.getAddress(values)]}</div>', '</div>',
            // @formatter:on
            {
               getPhoto : function(values)
               {
                  return values.Merchant['icon_url'];
               },
               getAddress : function(values)
               {
                  var address = (values.address2) ? values.address1 + ", " + values.address2 : values.address1;
                  return (address + ",<br/>" + values.city + ", " + values.state + ", " + values.country + ",<br/>" + values.zipcode);
               }
            }),
            onItemDisclosure : Ext.emptyFn
         }]
      },
      {
         docked : 'bottom',
         cls : 'navigationBarBottom',
         xtype : 'tabbar',
         layout :
         {
            pack : 'justify',
            align : 'center'
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
            xtype : 'spacer'
         },
         //
         // Middle Button
         //
         {
            xtype : 'segmentedbutton',
            allowMultiple : false,
            hidden : true,
            tag : 'accounts',
            items : [
            {
               text : 'Usage',
               tag : 'usage',
               pressed : true
            },
            {
               text : 'A to Z',
               tag : 'alphabetical',
            }]
         },
         //
         // Right side Buttons
         //
         {
            xtype : 'spacer'
         }]
      }]
   },
   beforeActivate : function()
   {
   },
   beforeDeactivate : function()
   {
   },
   afterActivate : function(activeItem, oldActiveItem)
   {
   },
   afterDeactivate : function()
   {
   }
});

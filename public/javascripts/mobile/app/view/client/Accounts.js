Ext.define('Genesis.view.client.Accounts',
{
   extend : 'Genesis.view.ViewBase',
   requires : ['Ext.dataview.List', 'Ext.XTemplate', 'Ext.Toolbar'],
   alias : 'widget.clientaccountsview',
   config :
   {
      cls : 'accountsMain viewport',
      layout :
      {
         type : 'card',
         animation :
         {
            duration : 400,
            easing : 'ease-in-out',
            type : 'slide',
            direction : 'left'
         }
      },
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
         },
         {
            align : 'left',
            tag : 'vback',
            hidden : true,
            //ui : 'back',
            ui : 'normal',
            text : 'Back'
         }]
      })]
   },
   showTransferHdr : false,
   /**
    * Removes all items currently in the Container, optionally destroying them all
    * @param {Boolean} destroy If true, {@link Ext.Component#destroy destroys} each removed Component
    * @param {Boolean} everything If true, completely remove all items including docked / centered and floating items
    * @return {Ext.Component} this
    */
   cleanView : function()
   {
      //this.removeAll(true);
   },
   showView : function()
   {
      this.callParent(arguments);
      var list = this.query('list')[0];
      if (list)
      {
         list.setVisibility(true);
      }
      this.setActiveItem(0);
   },
   createView : function()
   {
      if (!this.callParent(arguments))
      {
         return;
      }

      this.setPreRender(this.getPreRender().concat([
      //
      // Accounts List
      //
      Ext.create('Ext.Container',
      {
         tag : 'accountsList',
         layout : 'vbox',
         scrollable : 'vertical',
         items : [
         //
         // Transfer Account Hdr
         //
         {
            xtype : 'toolbar',
            centered : false,
            tag : 'transferHdr',
            hidden : !this.showTransferHdr,
            defaults :
            {
               iconMask : true
            },
            items : [
            {
               xtype : 'title',
               title : 'Select Account :'
            },
            {
               xtype : 'spacer',
               align : 'right'
            }]
         },
         {
            xtype : 'list',
            store : 'CustomerStore',
            tag : 'accountsList',
            cls : 'accountsList',
            scrollable : undefined,
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
         }]
      }),
      //
      // Venues List
      //
      Ext.create('Ext.List',
      {
         xtype : 'list',
         store : 'VenueStore',
         tag : 'venuesList',
         scrollable : 'vertical',
         cls : 'venuesList',
         deferEmptyText : false,
         emptyText : ' ',
         itemTpl : Ext.create('Ext.XTemplate',
         // @formatter:off
         '<div class="merchantDetailsWrapper">',
            '<div class="itemDistance">{[this.getDistance(values)]}</div>' +
            '<div class="itemTitle">{name}</div>',
            '<div class="itemDesc">{[this.getAddress(values)]}</div>',
         '</div>',
         // @formatter:on
         {
            getAddress : function(values)
            {
               return (values.address + ",<br/>" + values.city + ", " + values.state + ", " + values.country + ",</br>" + values.zipcode);
            },
            getDistance : function(values)
            {
               return values['distance'].toFixed(1) + 'km';
            }
         }),
         onItemDisclosure : Ext.emptyFn
      })]));
   }
});

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
      var me = this;
      if (!me.callParent(arguments))
      {
         return;
      }

      me.setPreRender(me.getPreRender().concat([
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
            hidden : !me.showTransferHdr,
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
                  '{[this.isEligible(values)]}',
                  '<img src="{[this.getPhoto(values)]}"/>',
               '</div>',
               '<div class="listItemDetailsWrapper">',
                  '<div class="title">{[this.getTitle()]}</div>',
                  '<div class="points">{[this.getRewardPoints(values)]}',
                  '<br/>',
                  '{[this.getPrizePoints(values)]}</div>',
               '</div>',
            '</tpl>',
            // @formatter:on
            {
               getTitle : function()
               {
                  return ('Reward Points: <br/>Prize Points:');
               },
               isValidCustomer : function(values)
               {
                  //return Customer.isValidCustomer(values['id']);
                  return true;
               },
               isEligible : function(customer)
               {
                  var isEligible = false;
                  switch (me.mode)
                  {
                     case 'redeemRewardsProfile' :
                     {
                        isEligible = customer['eligible_for_reward'];
                        break;
                     }
                     case 'redeemPrizesProfile' :
                     {
                        isEligible = customer['eligible_for_prize'];
                        break;
                     }
                     case 'profile' :
                     {
                        isEligible = customer['eligible_for_reward'] || customer['eligible_for_prize'];
                        break;
                     }
                     case 'emailtransfer' :
                     case 'transfer' :
                     default :
                        break;
                  }

                  return ('<span class="x-badge round ' + //
                  ((isEligible) ? '' : 'x-item-hidden') + '">✔</span>');
               },
               getPhoto : function(values)
               {
                  return values.merchant['photo']['thumbnail_ios_small'].url;
               },
               getRewardPoints : function(values)
               {
                  return values['points'];
               },
               getPrizePoints : function(values)
               {
                  return values['prize_points'];
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

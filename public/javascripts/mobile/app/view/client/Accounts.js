Ext.define('Genesis.view.client.Accounts',
{
   extend : 'Genesis.view.ViewBase',
   requires : ['Ext.dataview.List', 'Ext.XTemplate', 'Ext.Toolbar', 'Ext.plugin.ListPaging'],
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
      this.removeAll(true);
      this.callParent(arguments);
   },
   createView : function()
   {
      var me = this;
      if (!me.callParent(arguments))
      {
         /*
          var isEligible;
          //
          // Badge Update for Eligible for Rewards/Prizes
          //
          var merchants = Ext.DomQuery.select('.x-badge', me.query('container[tag=accountsList]
          list[tag=accountsList]')[0].element.dom);
          var customers = Ext.StoreMgr.get('CustomerStore').getRange();

          for (var i = 0; i < merchants.length; i++)
          {
          var merchant = Ext.get(merchants[i]);
          var customer = customers[i];

          switch (me.mode)
          {
          case 'redeemRewardsProfile' :
          {
          isEligible = customer.get('eligible_for_reward');
          break;
          }
          case 'redeemPrizesProfile' :
          {
          isEligible = customer.get('eligible_for_prize');
          break;
          }
          case 'profile' :
          {
          isEligible = customer.get('eligible_for_reward') || customer.get('eligible_for_prize');
          break;
          }
          case 'emailtransfer' :
          case 'transfer' :
          default :
          break;
          }

          merchant[(isEligible) ? 'removeCls' : 'addCls']('x-item-hidden');
          }
          */

         return;
      }

      me.setPreRender(me.getPreRender().concat([
      //
      // Accounts List
      //
      Ext.create('Ext.List',
      {
         xtype : 'list',
         store : 'CustomerStore',
         tag : 'accountsList',
         cls : 'accountsList',
         plugins : [
         {
            type : 'listpaging',
            autoPaging : true,
            noMoreRecordsText : '',
            loadMoreText : ''
         }],
         refreshHeightOnUpdate : false,
         variableHeights : false,
         deferEmptyText : false,
         itemHeight : Genesis.fn.calcPx(Genesis.fn.calcPxEm(Genesis.constants.defaultIconSize(), 2 * 0.65, 1), 1),
         loadingText : null,
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
         items : [
         //
         // Transfer Account Hdr
         //
         {
            docked : 'top',
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
         }],
         itemTpl : Ext.create('Ext.XTemplate',
         // @formatter:off
            '<tpl if="this.isValidCustomer(values)">',
               '<div class="photo x-hasbadge">',
                  '{[this.isEligible(values)]}',
                  '<img src="{[this.getPhoto(values)]}"/>',
               '</div>',
               '<div class="listItemDetailsWrapper {[this.isSingle(values)]}">',
                  //'<div class="title">{[this.getTitle()]}</div>',
                  '<tpl if="this.showRewardPoints()">',
                     '<div class="points">',
                        '{[this.getRewardPoints(values)]}',
                     '</div>',
                  '</tpl>',
                  '<tpl if="this.showPrizePoints()">',
                     '<div class="points">',
                        '{[this.getPrizePoints(values)]}'+
                     '</div>',
                  '</tpl>',
               '</div>',
            '</tpl>',
            // @formatter:on
         {
            isSingle : function(values)
            {
               rc = '';
               switch (me.mode)
               {
                  case 'redeemPrizesProfile' :
                  case 'redeemRewardsProfile' :
                  case 'emailtransfer' :
                  case 'transfer' :
                  {
                     rc = 'single';
                     break;
                  }
                  case 'profile' :
                  default :
                     break;
               }
               return rc;
            },
            getTitle : function()
            {
               return ('Reward Points: <br/>Prize Points:');
            },
            isValidCustomer : function(values)
            {
               return Customer.isValid(values['id']);
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
               return values.Merchant['photo']['thumbnail_medium_url'];
            },
            showRewardPoints : function()
            {
               var rc = true;
               switch (me.mode)
               {
                  case 'redeemPrizesProfile' :
                  {
                     rc = false;
                     break;
                  }
                  case 'redeemRewardsProfile' :
                  case 'emailtransfer' :
                  case 'transfer' :
                  default :
                     break;
               }

               return rc;
            },
            getRewardPoints : function(values)
            {
               return values['points'] + '<img src="' + Genesis.constants.getIconPath('miscicons', 'points') + '">';
            },
            showPrizePoints : function()
            {
               var rc = true;
               switch (me.mode)
               {
                  case 'redeemRewardsProfile' :
                  case 'emailtransfer' :
                  case 'transfer' :
                  {
                     rc = false;
                     break;
                  }
                  case 'redeemPrizesProfile' :
                  default :
                     break;
               }

               return rc;
            },
            getPrizePoints : function(values)
            {
               return values['prize_points'] + '<img src="' + Genesis.constants.getIconPath('miscicons', 'prize_points') + '">';
            }
         }),
         onItemDisclosure : Ext.emptyFn
      }),
      //
      // Venues List
      //
      Ext.create('Ext.List',
      {
         xtype : 'list',
         store : 'VenueStore',
         tag : 'venuesList',
         loadingText : null,
         refreshHeightOnUpdate : false,
         variableHeights : false,
         deferEmptyText : false,
         itemHeight : Genesis.fn.calcPx(Genesis.fn.calcPxEm(Genesis.constants.defaultIconSize(), 2 * 0.65, 1), 1),
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

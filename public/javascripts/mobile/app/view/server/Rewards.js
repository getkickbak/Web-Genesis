Ext.define('Genesis.view.server.Rewards',
{
   extend : 'Genesis.view.ViewBase',
   requires : ['Ext.Toolbar', 'Ext.field.Select', 'Ext.field.Text', 'Genesis.view.widgets.Calculator', 'Ext.dataview.List', 'Ext.XTemplate', 'Ext.plugin.ListPaging', 'Ext.plugin.PullRefresh'],
   alias : 'widget.serverrewardsview',
   config :
   {
      layout : 'fit',
      cls : 'viewport',
      items : [Ext.apply(Genesis.view.ViewBase.generateTitleBarConfig(),
      {
         tag : 'navigationBarTop',
         cls : 'navigationBarTop kbTitle',
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
            tag : 'rptClose',
            hidden : true,
            ui : 'normal',
            text : 'Close'
         },
         {
            hidden : true,
            align : 'right',
            ui : 'normal',
            iconCls : 'order',
            tag : 'calculator'
         },
         {
            hidden : true,
            align : 'right',
            ui : 'normal',
            iconCls : 'refresh',
            tag : 'refresh',
            handler : function()
            {
               retrieveReceipts();
            }
         }]
      })]
   },
   createView : function()
   {
      var me = this;
      if (!me.callParent(arguments))
      {
         return;
      }

      var itemHeight = 1 + Genesis.constants.defaultIconSize() + 2 * Genesis.fn.calcPx(0.65, 1);
      var store = Ext.StoreMgr.get('ReceiptStore'), db = Genesis.db.getLocalDB(), posEnabled = pos.isEnabled(), manualMode = ((db['rewardModel'] == 'items_purchased') ? 4 : 0);
      console.debug("createView - rewardModel[" + db['rewardModel'] + "]")
      var toolbarBottom = function(tag, hideTb)
      {
         return (
            {
               docked : 'bottom',
               cls : 'toolbarBottom',
               tag : tag,
               hidden : hideTb,
               xtype : 'container',
               layout :
               {
                  type : 'vbox',
                  pack : 'center'
               },
               showAnimation :
               {
                  type : 'slideIn',
                  duration : 500,
                  direction : 'up'
               },
               hideAnimation :
               {
                  type : 'slideOut',
                  duration : 500,
                  direction : 'down'
               },
               items : [
               {
                  xtype : 'segmentedbutton',
                  allowMultiple : false,
                  defaults :
                  {
                     iconMask : true,
                     ui : 'blue',
                     flex : 1
                  },
                  items : [
                  {
                     iconCls : 'rewards',
                     tag : 'rewardsSC',
                     text : 'Earn Points'
                  }],
                  listeners :
                  {
                     toggle : function(container, button, pressed)
                     {
                        container.setPressedButtons([]);
                     }
                  }
               }]
            });
      };

      me.getPreRender().push(Ext.create('Ext.Container',
      {
         xtype : 'container',
         tag : 'rewards',
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
         defaults :
         {
            hidden : true
         },
         activeItem : (posEnabled) ? 2 : manualMode,
         items : [
         // -------------------------------------------------------------------
         // Reward Calculator
         // -------------------------------------------------------------------
         {
            xtype : 'calculator',
            tag : 'amount',
            title : 'Amount Spent',
            placeHolder : '0.00',
            bottomButtons : [
            {
               tag : 'earnPts',
               text : 'GO!',
               ui : 'orange-large'
            }]
         },
         // -------------------------------------------------------------------
         // Reward TAG ID Entry
         // -------------------------------------------------------------------
         {
            xtype : 'calculator',
            tag : 'phoneId',
            title : 'Enter Mobile Number',
            placeHolder : '8005551234',
            bottomButtons : [
            {
               tag : 'earnTagId',
               text : 'Submit',
               ui : 'orange-large'
            }]
         },
         // -------------------------------------------------------------------
         // POS Receipts
         // -------------------------------------------------------------------
         {
            xtype : 'container',
            tag : 'posSelect',
            layout : 'hbox',
            items : [
            {
               docked : 'top',
               hidden : (store.getCount() <= 0),
               xtype : 'selectfield',
               labelWidth : '50%',
               label : 'Sort Receipts By :',
               tag : 'tableFilter',
               name : 'tableFilter',
               margin : '0 0 0.8em 0',
               usePicker : true,
               store : 'TableStore',
               displayField : 'id',
               valueField : 'id',
               showAnimation :
               {
                  type : 'slideIn',
                  duration : 500,
                  direction : 'down'

               },
               hideAnimation :
               {
                  type : 'slideOut',
                  duration : 500,
                  direction : 'up'
               },
               defaultPhonePickerConfig :
               {
                  height : (12.5 * 1.5) + 'em',
                  doneButton :
                  {
                     ui : 'normal'
                  }
               }
            },
            {
               xtype : 'list',
               flex : 1,
               store : 'ReceiptStore',
               loadingText : null,
               //scrollable : 'vertical',
               plugins : [
               {
                  type : 'pullrefresh',
                  //pullRefreshText: 'Pull down for more new Tweets!',
                  refreshFn : function(plugin)
                  {
                     retrieveReceipts();
                  }
               },
               {
                  type : 'listpaging',
                  autoPaging : true,
                  loadMoreText : '',
                  noMoreRecordsText : ''
               }],
               mode : 'MULTI',
               preventSelectionOnDisclose : true,
               scrollToTopOnRefresh : true,
               refreshHeightOnUpdate : false,
               variableHeights : false,
               itemHeight : itemHeight,
               deferEmptyText : false,
               emptyText : ' ',
               tag : 'receiptList',
               cls : 'receiptList',
               // @formatter:off
               itemTpl : Ext.create('Ext.XTemplate',
               '<div class="photo">{[this.getPrice(values)]}</div>' +
               '<div class="listItemDetailsWrapper">' +
                  '<div class="itemDistance">{[this.getDate(values)]}</div>' +
                  '<div class="itemTitle">{title}</div>' +
                  //'<div class="itemDesc">{[this.getDesc(values)]}</div>',
               '</div>',
               // @formatter:on
               {
                  getPrice : function(values)
                  {
                     return '$' + Number(values['price']).toFixed(2);
                  },
                  getDate : function(values)
                  {
                     return Genesis.fn.convertDate(new Date(values['id'] * 1000));
                  }
               }),
               onItemDisclosure : Ext.emptyFn
            }, toolbarBottom('tbBottomSelection', (store.getCount() <= 0))]
         },
         // -------------------------------------------------------------------
         // POS Receipt Detail
         // -------------------------------------------------------------------
         {
            xtype : 'container',
            tag : 'posDetail',
            layout : 'hbox',
            items : [
            {
               flex : 1,
               xtype : 'dataview',
               tag : 'receiptDetail',
               cls : 'receiptDetail',
               store :
               {
                  fields : ['receipt']
               },
               // @formatter:off
               itemTpl : Ext.create('Ext.XTemplate',
               '<div class="listItemDetailsWrapper">' +
                  '<div class="itemReceipt">{[this.getReceipt(values)]}</div>' +
               '</div>',
               // @formatter:on
               {
                  getReceipt : function(values)
                  {
                     var receipt = '';
                     for (var i = 0; i < values['receipt'].length; i++)
                     {
                        receipt += '<pre>' + values['receipt'][i].replace('\n', '').replace('/r', '') + '</pre>';
                     }

                     return receipt;
                  }
               })
            }, toolbarBottom('tbBottomDetail', false)]
         },
         // -------------------------------------------------------------------
         // ItemsPurchased
         // -------------------------------------------------------------------
         {
            xtype : 'calculator',
            tag : 'itemsPurchased',
            title : 'Stamp Points',
            placeHolder : '0',
            hideZero : true,
            bottomButtons : [
            {
               tag : 'earnPts',
               text : 'Stamp Me!',
               ui : 'orange-large'
            }]
         }]
      }));
   },
   inheritableStatics :
   {
   }
});

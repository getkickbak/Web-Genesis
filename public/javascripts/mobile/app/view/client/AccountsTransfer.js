Ext.define('Genesis.view.client.AccountsTransfer',
{
   extend : 'Genesis.view.ViewBase',
   requires : ['Ext.Toolbar', 'Ext.field.Text', 'Genesis.view.widgets.Calculator'],
   alias : 'widget.clientaccountstransferview',
   config :
   {
      tag : 'accountsTransferMain',
      cls : 'viewport accountsTransferMain',
      layout : 'card',
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
            tag : 'close',
            ui : 'normal',
            text : 'Close'
         },
         {
            align : 'left',
            tag : 'calcClose',
            hidden : true,
            ui : 'normal',
            text : 'Close'
         }]
      })],
      listeners : [
      {
         element : 'element',
         delegate : 'div.listItemDetailsWrapper',
         event : 'tap',
         fn : "onItemTap"
      }]
   },
   disableAnimation : true,
   onItemTap : function(e, target, delegate, eOpts)
   {
      _application.getController('client.Accounts').fireEvent('xferItemTap', e.delegatedTarget.getAttribute('data'));
   },
   createView : function(store, activeItemIndex)
   {
      if (!this.callParent(arguments))
      {
         return;
      }
      this.num = activeItemIndex;

      this.setPreRender(this.getPreRender().concat([
      // -------------------------------------------------------------------
      // Accounts Transfer Mode (0)
      // -------------------------------------------------------------------
      Ext.create('Ext.Container',
      {
         xtype : 'container',
         tag : 'accountsTransferMode',
         cls : 'accountsTransferMode',
         layout : 'vbox',
         items : [
         {
            docked : 'top',
            xtype : 'toolbar',
            centered : false,
            defaults :
            {
               iconMask : true
            },
            items : [
            {
               xtype : 'title',
               title : 'Select Options :'
            },
            {
               xtype : 'spacer',
               align : 'right'
            }]
         },
         {
            xtype : 'component',
            flex : 1,
            scrollable : undefined,
            cls : 'transferPanel',
            tag : 'transferPanel',
            data : [
            {
               text : 'Transfer Out',
               desc : '(Send it directly over to your friend\'s mobile phone)',
               cls : 'sender',
               tag : 'sender'
            },
            {
               text : 'Email Transfer',
               desc : '(Send it over to your friend\'s email account)',
               cls : 'emailsender',
               tag : 'emailsender'
            },
            {
               text : 'Receive',
               desc : '(Scan your friend\'s Transfer Code)',
               cls : 'recipient',
               tag : 'recipient'
            }],
            tpl : Ext.create('Ext.XTemplate',
            // @formatter:off
            '<tpl for=".">',
               '<div class="listItemDetailsWrapper" data="{[this.encodeData(values)]}">',
                  '<div class="itemTitle {[this.getCls(values)]}">{[this.getTitle(values)]}</div>',
                  '<div class="itemDesc {[this.getCls(values)]}">{[this.getDesc(values)]}</div>',
               '</div>',
            '</tpl>',
            // @formatter:on
            {
               encodeData : function(values)
               {
                  return values['tag'];
               },
               getCls : function(values)
               {
                  return values['cls'];
               },
               getDesc : function(values)
               {
                  return values['desc'];
               },
               getTitle : function(values)
               {
                  return values['text'];
               }
            })
         }]
      }),
      // -------------------------------------------------------------------
      // Accounts Calculator (1)
      // -------------------------------------------------------------------
      {
         xtype : 'calculator',
         tag : 'accountsMainCalculator',
         cls : 'accountsMainCalculator',
         title : 'Points to Send',
         placeHolder : '0',
         bottomButtons : [
         {
            tag : 'showQrCode',
            text : 'Transfer Points!',
            ui : 'orange-large'
         }]
      },
      // -------------------------------------------------------------------
      // Show for QRCode Screen (2)
      // -------------------------------------------------------------------
      Ext.create('Ext.Container',
      {
         xtype : 'container',
         tag : 'qrcodeContainer',
         cls : 'qrcodeContainer',
         layout : 'fit',
         items : [
         {
            docked : 'top',
            xtype : 'component',
            tag : 'title',
            width : '100%',
            cls : 'title',
            tpl : Ext.create('Ext.XTemplate', '{[this.getPoints(values)]}',
            {
               getPoints : function(values)
               {
                  return values['points'];
               }
            })
         },
         {
            xtype : 'component',
            tag : 'qrcode',
            cls : 'qrcode'
         },
         {
            docked : 'bottom',
            xtype : 'button',
            cls : 'separator done',
            tag : 'done',
            text : 'Done!',
            ui : 'orange-large'
         }]
      })]));
   },
   showView : function()
   {
      if (this.num)
      {
         this.setActiveItem(this.num);
      }
      this.callParent(arguments);
   },
   inheritableStatics :
   {
   }
});

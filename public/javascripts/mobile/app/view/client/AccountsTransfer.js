Ext.define('Genesis.view.client.AccountsTransfer',
{
   extend : 'Genesis.view.ViewBase',
   requires : ['Ext.Toolbar', 'Ext.field.Text'],
   alias : 'widget.clientaccountstransferview',
   config :
   {
      title : ' ',
      changeTitle : false,
      layout : 'vbox',
      items : [
      {
         xtype : 'container',
         tag : 'accountsTransferMain',
         cls : 'accountsTransferMain',
         flex : 1,
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
         activeItem : 0,
         defaults :
         {
            layout : 'fit'
         },
         items : [
         // -------------------------------------------------------------------
         // Accounts Transfer Mode (0)
         // -------------------------------------------------------------------
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
               xtype : 'list',
               scrollable : false,
               //ui : 'bottom-round',
               cls : 'transferPanel',
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
               itemTpl : Ext.create('Ext.XTemplate',
               // @formatter:off
               '<div class="listItemDetailsWrapper" style="padding-right:0;">',
                  '<div class="itemTitle {[this.getCls(values)]}">{[this.getTitle(values)]}</div>',
                  '<div class="itemDesc {[this.getCls(values)]}">{[this.getDesc(values)]}</div>',
               '</div>',
               // @formatter:on
               {
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
               //,onItemDisclosure : Ext.emptyFn
            }]
         },
         // -------------------------------------------------------------------
         // Accounts Calculator (1)
         // -------------------------------------------------------------------
         {
            xtype : 'container',
            tag : 'accountsMainCalculator',
            cls : 'accountsMainCalculator',
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
                  title : 'Points to Send'
               },
               {
                  xtype : 'spacer',
                  align : 'right'
               }]
            },
            {
               docked : 'top',
               xtype : 'textfield',
               name : 'price',
               clearIcon : false,
               placeHolder : '0',
               readOnly : true,
               required : true,
               cls : 'accountsCalculator'
            },
            {
               xtype : 'container',
               layout : 'vbox',
               tag : 'dialpad',
               cls : 'dialpad',
               defaults :
               {
                  xtype : 'container',
                  layout : 'hbox',
                  flex : 1,
                  defaults :
                  {
                     xtype : 'button',
                     flex : 1
                  }
               },
               items : [
               {
                  items : [
                  {
                     text : '1'
                  },
                  {
                     text : '2'
                  },
                  {
                     text : '3'
                  }]
               },
               {
                  items : [
                  {
                     text : '4'
                  },
                  {
                     text : '5'
                  },
                  {
                     text : '6'
                  }]
               },
               {
                  items : [
                  {
                     text : '7'
                  },
                  {
                     text : '8'
                  },
                  {
                     text : '9'
                  }]
               },
               {
                  items : [
                  {
                     text : 'AC'
                  },
                  {
                     flex : 2,
                     text : '0'
                  }]
               }]
            },
            {
               docked : 'bottom',
               xtype : 'button',
               cls : 'separator',
               tag : 'showQrCode',
               text : 'Transfer Points!',
               ui : 'orange-large'
            }]
         },
         // -------------------------------------------------------------------
         // Show for QRCode Screen (2)
         // -------------------------------------------------------------------
         {
            xtype : 'container',
            tag : 'qrcodeContainer',
            cls : 'qrcodeContainer',
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
         }]
      }]
   },
   beforeDeactivate : function(activeItem, oldActiveItem)
   {
      this.callParent(arguments);
      var viewport = Ext.ComponentQuery.query('viewportview')[0];
      viewport.getNavigationBar().removeCls('kbTitle');
   },
   afterActivate : function(activeItem, oldActiveItem)
   {
      this.callParent(arguments);
      var viewport = Ext.ComponentQuery.query('viewportview')[0];
      viewport.getNavigationBar().addCls('kbTitle');
   },
   statics :
   {
   }
});

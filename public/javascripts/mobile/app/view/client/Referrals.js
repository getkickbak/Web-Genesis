Ext.define('Genesis.view.client.Referrals',
{
   extend : 'Genesis.view.ViewBase',
   requires : ['Ext.Toolbar', 'Ext.field.Text'],
   alias : 'widget.clientreferralsview',
   config :
   {
      title : 'Referrals',
      changeTitle : false,
      layout : 'vbox',
      items : [
      {
         xtype : 'container',
         tag : 'referralsMain',
         cls : 'referralsMain',
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
         // Referrals Mode (0)
         // -------------------------------------------------------------------
         {
            xtype : 'container',
            tag : 'referralsMode',
            cls : 'referralsMode',
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
               cls : 'referralsPanel',
               data : [
               {
                  text : 'Refer Now!',
                  cls : 'sender',
                  tag : 'sender'
               },
               {
                  text : 'Refer over Email',
                  cls : 'emailsender',
                  tag : 'emailsender'
               }],
               itemTpl : Ext.create('Ext.XTemplate',
               // @formatter:off
               '<div class="listItemDetailsWrapper" style="padding-right:0;">',
                  '<div class="itemTitle {[this.getCls(values)]}">{[this.getTitle(values)]}</div>',
               '</div>',
               // @formatter:on
               {
                  getCls : function(values)
                  {
                     return values['cls'];
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
         // Show for QRCode Screen (1)
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
               text : 'Transfer Complete!',
               ui : 'orange-large'
            }]
         }]
      }]
   },
   beforeDeactivate : function(activeItem, oldActiveItem)
   {
      this.callParent(arguments);
      //var viewport = Ext.ComponentQuery.query('viewportview')[0];
      //viewport.getNavigationBar().removeCls('kbTitle');
   },
   afterActivate : function(activeItem, oldActiveItem)
   {
      this.callParent(arguments);
      //var viewport = Ext.ComponentQuery.query('viewportview')[0];
      //viewport.getNavigationBar().addCls('kbTitle');
   },
   statics :
   {
   }
});
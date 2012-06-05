Ext.define('Genesis.view.client.Referrals',
{
   extend : 'Genesis.view.ViewBase',
   requires : ['Ext.Toolbar', 'Ext.field.Text'],
   alias : 'widget.clientreferralsview',
   config :
   {
      layout : 'vbox',
      items : [
      {
         xtype : 'titlebar',
         docked : 'top',
         cls : 'navigationBarTop',
         title : 'Refer A Friend',
         defaults :
         {
            iconMask : true
         },
         items : [
         {
            align : 'left',
            ui : 'back',
            text : 'Back'
         }]
      }]
   },
   createView : function()
   {
      if(!this.callParent(arguments))
      {
         return;
      }
      
      this.getPreRender().push(Ext.create('Ext.Container',
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
                  desc : '(Refer your friends by sending directly over to their phone)',
                  cls : 'sender',
                  tag : 'sender'
               },
               {
                  text : 'Refer by E-Mail',
                  desc : '(Refer your friends by sending them an E-Mail)',
                  cls : 'emailsender',
                  tag : 'emailsender'
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
               cls : 'subtitle',
               data :
               {
                  title : 'Referral Code'
               },
               tpl : '{title}'
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
      }));
   },
   statics :
   {
   }
});

Ext.define('Genesis.view.server.Rewards',
{
   extend : 'Genesis.view.ViewBase',
   requires : ['Ext.Toolbar', 'Ext.field.Text', 'Genesis.view.widgets.Calculator'],
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
         }]
      })]
   },
   createView : function()
   {
      if (!this.callParent(arguments))
      {
         return;
      }

      this.getPreRender().push(Ext.create('Ext.Container',
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
         activeItem : 0,
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
            /*{
             tag : 'earnPtsTag',
             text : 'TAG it',
             ui : 'orange-large'
             },
             */
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
            tag : 'tagId',
            title : 'Enter TAG ID or Phone#',
            placeHolder : '12345678',
            bottomButtons : [
            {
               tag : 'earnTagId',
               text : 'Submit',
               ui : 'orange-large'
            }]
         },
         // -------------------------------------------------------------------
         // Show for QRCode Screen
         // -------------------------------------------------------------------
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
               defaultUnit : 'em',
               tpl : Ext.create('Ext.XTemplate', '{[this.getPrice(values)]}',
               {
                  getPrice : function(values)
                  {
                     return values['price'];
                  }
               })
            }/*,
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
             text : 'Done',
             ui : 'orange-large'
             }*/]
         }]
      }));
   },
   inheritableStatics :
   {
   }
});

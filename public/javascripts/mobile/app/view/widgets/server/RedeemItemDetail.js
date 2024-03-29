Ext.define('Genesis.view.widgets.server.RedeemItemDetail',
{
   extend : 'Genesis.view.widgets.ItemDetail',
   requires : ['Ext.XTemplate', 'Genesis.view.widgets.RedeemItem'],
   alias : 'widget.serverredeemitemdetailview',
   config :
   {
      itemXType : 'redeemitem',
      items : [Ext.apply(Genesis.view.ViewBase.generateTitleBarConfig(),
      {
         title : 'Prizes',
         items : [
         {
            hidden : true,
            align : 'left',
            tag : 'back',
            ui : 'normal',
            text : 'Back'
         },
         {
            hidden : true,
            align : 'left',
            tag : 'close',
            ui : 'normal',
            text : 'Close'
         }]
      }),
      {
         xtype : 'container',
         flex : 1,
         tag : 'redeemItemCardContainer',
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
         {
            xtype : 'container',
            layout :
            {
               type : 'vbox',
               pack : 'center',
               align : 'stretch'
            },
            tag : 'redeemItemContainer',
            items : [
            {
               hidden : true,
               docked : 'bottom',
               xtype : 'component',
               tag : 'authText',
               margin : '0 0.7 0.8 0.7',
               style : 'text-align:center;',
               defaultUnit : 'em',
               html :  'Tap your Mobile Device onto the Terminal'
               //,ui : 'orange-large'
            },
            {
               hidden : true,
               docked : 'bottom',
               cls : 'bottomButtons',
               xtype : 'container',
               tag : 'bottomButtons',
               layout : 'hbox',
               marginTop : 0,
               defaults :
               {
                  xtype : 'button',
                  flex : 1
               },
               items : [
               {
                  tag : 'merchantRedeem',
                  text : 'GO!',
                  ui : 'orange-large'
               }]
            }]
         },
         // -------------------------------------------------------------------
         // Reward Calculator
         // -------------------------------------------------------------------
         {
            xtype : 'calculator',
            tag : 'phoneId',
            title : 'Enter Mobile Number',
            placeHolder : '8005551234',
            bottomButtons : [
            {
               tag : 'redeemTagId',
               text : 'Submit',
               ui : 'orange-large'

            }]
         }]
      }],
      listeners : [
      {
         element : 'element',
         delegate : "div.itemPhoto",
         event : "tap",
         fn : "onRedeemItemTap"
      }]
   },
   onRedeemItemTap : function(b, e, eOpts)
   {
      var me = this, viewport = _application.getController('server' + '.Viewport');
      viewport.self.playSoundFile(viewport.sound_files['clickSound']);
      me.fireEvent('redeemItemTap', b);
   },
   showView : function()
   {
      // Do not add to view, if there's existing items, only re-render on empty views
      var me = this, redeemItemContainer = me.query("container[tag=redeemItemContainer]")[0];
      if (redeemItemContainer)
      {
         if (redeemItemContainer.getInnerItems().length == 0)
         {
            redeemItemContainer.add(me.getPreRender());
         }
      }
      Ext.defer(me.fireEvent, 0.01 * 1000, me, ['showView', me]);
   },
   createView : function()
   {
      var me = this, redeemItemContainer = me.query("container[tag=redeemItemContainer]")[0];
      if (!Genesis.view.ViewBase.prototype.createView.call(me, arguments) && redeemItemContainer && (redeemItemContainer.getInnerItems().length > 0))
      {
         var item = redeemItemContainer.getInnerItems()[0];
         //
         // Refresh RedeemItem
         //
         item.setData(me.item)
         item.updateItem(me.item);
      }
      else
      {

         me.setPreRender([
         {
            flex : 1,
            xtype : me.getItemXType(),
            hideMerchant : true,
            data : me.item
         }]);
      }
      delete me.item;
   }
});

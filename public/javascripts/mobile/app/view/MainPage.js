Ext.define('Genesis.view.MainPage',
{
   extend : 'Ext.Carousel',
   requires : ['Ext.dataview.DataView', 'Ext.XTemplate'],
   alias : 'widget.mainpageview',
   config :
   {
      direction : 'horizontal',
      items : ( function()
         {
            var items = [
            {
               xtype : 'titlebar',
               docked : 'top',
               cls : 'navigationBarTop kbTitle',
               title : ' ',
               defaults :
               {
                  iconMask : true
               },
               items : [
               {
                  align : 'right',
                  tag : 'info',
                  iconCls : 'info',
                  destroy : function()
                  {
                     this.actions.destroy();
                     this.callParent(arguments);
                  },
                  handler : function()
                  {
                     if(!this.actions)
                     {
                        this.actions = Ext.create('Ext.ActionSheet',
                        {
                           defaultUnit : 'em',
                           padding : '1em',
                           hideOnMaskTap : false,
                           defaults :
                           {
                              xtype : 'button',
                              defaultUnit : 'em'
                           },
                           items : [
                           {
                              margin : '0 0 0.5 0',
                              text : 'Logout',
                              tag : 'logout'
                           },
                           {
                              margin : '0.5 0 0 0',
                              text : 'Cancel',
                              ui : 'cancel',
                              scope : this,
                              handler : function()
                              {
                                 this.actions.hide();
                              }
                           }]
                        });
                        Ext.Viewport.add(this.actions);
                     }
                     this.actions.show();
                  }
               }]
            }];
            if(!merchantMode)
            {
               items.push(
               {
                  docked : 'bottom',
                  cls : 'checkInNow',
                  tag : 'checkInNow',
                  xtype : 'container',
                  layout :
                  {
                     type : 'vbox',
                     pack : 'center'
                  },
                  items : [
                  {
                     xtype : 'button',
                     tag : 'checkInNow',
                     text : 'CheckIn Now!'
                  }]
               });
            }
            return items;
         }())
   }
});

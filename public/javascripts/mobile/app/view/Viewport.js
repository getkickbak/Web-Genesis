Ext.define('Genesis.view.Viewport',
{
   extend : 'Ext.navigation.View',
   requires : ['Ext.MessageBox', 'Ext.ActionSheet', 'Ext.navigation.View'],
   xtype : 'viewportView',
   config :
   {
      fullscreen : true,
      useTitleForBackButtonText : true,
      defaultBackButtonText : 'Back',
      //profile : Ext.os.deviceType.toLowerCase(),
      navigationBar :
      {
         //hidden : true,
         defaults :
         {
            iconMask : true
            //hidden : true
         },
         docked : 'top',
         cls : 'navigationBarTop',
         layout :
         {
            pack : 'justify',
            align : 'center' // align center is the default
         },
         //title : 'JustForMyFriends',
         items : [
         {
            align : 'left',
            ui : 'back'
         },
         {
            align : 'right',
            iconCls : 'x-loading-spinner',
            hidden : true
         },
         {
            align : 'right',
            text : 'Share',
            hidden : true
         },
         {
            align : 'right',
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
                     items : [
                     {
                        text : 'Logout',
                        handler : Ext.emptyFn
                     },
                     {
                        xtype : 'button',
                        text : 'Cancel',
                        scope : this,
                        handler : function()
                        {
                           Ext.Anim.run(this.actions.element, 'slide',
                           {
                              scope : this.actions,
                              easing : 'ease-in-out',
                              out : true,
                              direction : 'down',
                              autoClear : true,
                              duration : 250,
                              after : Ext.Function.createDelayed(this.actions.hide, 250)
                           });
                        }
                     }]
                  });
                  Ext.Viewport.add(this.actions);
               }
               this.actions.show();
               Ext.Anim.run(this.actions.element, 'slide',
               {
                  easing : 'ease-in-out',
                  out : false,
                  direction : 'up',
                  autoClear : true
               });
            }
         }]
      }
   }
});

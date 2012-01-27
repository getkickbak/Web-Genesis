Ext.define('Genesis.view.Viewport',
{
   extend : 'Ext.navigation.View',
   requires : ['Ext.MessageBox', 'Ext.ActionSheet'],
   xtype : 'viewportview',
   config :
   {
      autoMaximize : false,
      fullscreen : true,
      useTitleForBackButtonText : false,
      defaultBackButtonText : 'Back',
      //profile : Ext.os.deviceType.toLowerCase(),
      venueId : 0,
      customerId : 0,
      //--------------------------------------------------------------------
      // Navigation Toolbar
      //--------------------------------------------------------------------
      navigationBar :
      {
         defaults :
         {
            iconMask : true
         },
         docked : 'top',
         cls : 'navigationBarTop',
         layout :
         {
            pack : 'justify',
            align : 'center'
         },
         items : [
         {
            align : 'left',
            ui : 'back'
         },
         {
            align : 'right',
            text : 'Share',
            id : 'shareBtn',
            hidden : true,
            handler : function()
            {
               if(!this.actions)
               {
                  this.actions = Ext.create('Ext.ActionSheet',
                  {
                     defaults :
                     {
                        xtype : 'button',
                        iconCls : 'dummy',
                        iconAlign : 'right',
                        iconMask : true
                     },
                     items : [
                     {
                        text : 'Email',
                        iconCls : 'compose',
                        handler : Ext.emptyFn
                     },
                     {
                        text : 'SMS Message',
                        iconMaskCls : 'dummymask',
                        handler : Ext.emptyFn
                     },
                     {
                        text : 'Facebook',
                        ui : 'blue',
                        iconCls : 'facebook',
                        handler : Ext.emptyFn
                     },
                     {
                        text : 'Cancel',
                        iconMaskCls : 'dummymask',
                        ui : 'confirm',
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
      },
      //--------------------------------------------------------------------
      // Bottom Toolbar
      //--------------------------------------------------------------------
      items : [
      {
         docked : 'bottom',
         cls : 'navigationBarBottom',
         xtype : 'tabbar',
         layout :
         {
            pack : 'justify',
            align : 'center'
         },
         defaults :
         {
            iconMask : true,
            iconAlign : 'top'
         },
         items : [
         {
            iconClsMask : 'dummymask',
            title : ' '
         },
         {
            xtype : 'spacer'
         },
         {
            hidden : true,
            iconCls : 'challenge',
            title : 'Begin!'
         },
         {
            hidden : true,
            iconCls : 'earnPts',
            title : 'Earn Points'
         },
         {
            xtype : 'spacer'
         },
         {
            iconCls : 'home',
            title : 'Home'
         }]
      }
      /*,{
       title : 'First',
       items : [
       {
       xtype : 'button',
       text : 'Push a new view!',
       handler : function()
       {
       //use the push() method to push another view. It works much like
       //add() or setActiveItem(). it accepts a view instance, or you can give it
       //a view config.
       view.push(
       {
       title : 'Second',
       html : 'Second view!'
       });
       }
       }]
       }*/]
   }
});

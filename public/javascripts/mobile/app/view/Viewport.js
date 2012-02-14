Ext.define('Genesis.view.Viewport',
{
   extend : 'Ext.navigation.View',
   requires : ['Ext.MessageBox', 'Ext.ActionSheet', 'Ext.SegmentedButton', 'Genesis.navigation.Bar'],
   xtype : 'viewportview',
   config :
   {
      autoDestroy : false,
      cls : 'viewport',
      fullscreen : true,
      useTitleForBackButtonText : false,
      defaultBackButtonText : 'Back',
      venueId : 0,
      customerId : 0,
      checkinInfo :
      {
         venueId : 0,
         customerId : 0
      },
      //--------------------------------------------------------------------
      // Navigation Toolbar
      //--------------------------------------------------------------------
      navigationBar :
      {
         defaults :
         {
            iconMask : true
         },
         rightButton :
         {
            align : 'right',
            iconMask : true,
            iconCls : 'check_black1'
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
            tag : 'browse',
            iconCls : 'search1',
            hidden : true
         },
         {
            align : 'left',
            tag : 'close',
            hidden : true,
            text : 'Close'
         },
         {
            align : 'right',
            iconCls : 'share',
            tag : 'shareBtn',
            hidden : true,
            handler : function()
            {
               if(!this.actions)
               {
                  this.actions = Ext.create('Ext.ActionSheet',
                  {
                     hideOnMaskTap : false,
                     defaults :
                     {
                        defaultUnit : 'em',
                        margin : '0 0 0.5 0',
                        xtype : 'button',
                        iconCls : 'dummy',
                        iconAlign : 'left',
                        iconMask : true
                     },
                     items : [
                     {
                        text : 'Email',
                        iconCls : 'mail',
                        tag : 'mail',
                        handler : Ext.emptyFn
                     },
                     {
                        text : 'SMS Message',
                        tag : 'sms',
                        iconCls : 'compose',
                        handler : Ext.emptyFn
                     },
                     {
                        text : 'Facebook',
                        tag : 'facebook',
                        ui : 'blue',
                        iconCls : 'facebook',
                        handler : Ext.emptyFn
                     },
                     {
                        margin : '0.5 0 0 0',
                        text : 'Cancel',
                        iconMaskCls : 'dummymask',
                        ui : 'confirm',
                        scope : this,
                        handler : function()
                        {
                           this.actions.hide();
                        }
                     }]
                  });
                  Ext.Viewport.add(this.actions);
                  this.actions.show();
               }
               this.actions.show();
            }
         },
         {
            align : 'right',
            tag : 'info',
            iconCls : 'info_plain',
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
                        defaultUnit : 'em'
                     },
                     items : [
                     {
                        margin : '0 0 0.5 0',
                        text : 'Logout',
                        handler : Ext.emptyFn
                     },
                     {
                        margin : '0.5 0 0 0',
                        xtype : 'button',
                        text : 'Cancel',
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
         },
         {
            align : 'right',
            tag : 'main',
            iconCls : 'check_black1',
            hidden : true
         }]
      },
      //--------------------------------------------------------------------
      // Bottom Toolbar
      //--------------------------------------------------------------------
      items : [
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
   },
   // @private
   applyNavigationBar : function(config)
   {
      if(!config)
      {
         config =
         {
            hidden : true,
            docked : 'top'
         };
      }

      if(config.title)
      {
         delete config.title;
         //<debug>
         Ext.Logger.warn("Ext.navigation.View: The 'navigationBar' configuration does not accept a 'title' property. You " + "set the title of the navigationBar by giving this navigation view's children a 'title' property.");
         //</debug>
      }

      config.view = this;

      return Ext.factory(config, Genesis.navigation.Bar, this.getNavigationBar());
   },
   // @private
   doSetActiveItem : function(activeItem, oldActiveItem)
   {
      if(!activeItem)
      {
         return;
      }
      var me = this;
      if(activeItem.getInitialConfig().changeTitle === true)
      {
         //
         // Get current Page Title name
         // Either it's the current venue we are browsing, or the one we checked-in
         //
         var venueId = activeItem.venueId || this.getVenueId();
         var vrecord = Ext.StoreMgr.get('VenueStore').getById(venueId);

         activeItem.getInitialConfig().title = vrecord.get('name');
      }
      activeItem.beforeActivate();
      if(oldActiveItem)
      {
         oldActiveItem.beforeDeactivate();
      }
      me.callParent(arguments);
      activeItem.afterActivate();
      if(oldActiveItem)
      {
         oldActiveItem.afterDeactivate();
      }
   },
   /**
    * @private
    * Calculates whether it needs to remove any items from the stack when you are popping more than 1
    * item. If it does, it removes those views from the stack and returns `true`.
    * @return {Boolean} True if it has removed views
    */
   onBeforePop : function(count)
   {
      var me = this, innerItems = this.getInnerItems(), ln = innerItems.length, toRemove, last, i;

      //default to 1 pop
      if(!Ext.isNumber(count) || count < 1)
      {
         count = 1;
      }

      //check if we are trying to remove more items than we have
      //count = Math.min(count, ln - 1);
      count = Math.min(count, ln);

      if(count)
      {
         //get the items we need to remove from the view and remove theme
         if(count == ln)
         {
            var bar = me.getNavigationBar();
            //we need to reset the backButtonStack in the navigation bar
            bar.reset();
            toRemove = innerItems.splice(-count, count);
            for( i = 0; i < toRemove.length; i++)
            {
               // Don't delete right away, otherwise we cannot animate between views!
               if(toRemove[i] === me.getActiveItem())
               {
                  me.on(
                  {
                     activeitemchange : 'doRemove',
                     scope : me,
                     single : true,
                     order : 'after',
                     args : [toRemove[i], me.indexOf(toRemove[i]), me.getAutoDestroy()]
                  });
               }
               else
               {
                  me.doRemove(toRemove[i], me.indexOf(toRemove[i]), me.getAutoDestroy());
               }
            }
            bar.getBackButton().setText(null);
            bar.getBackButton().hide();
         }
         else
         {
            //we need to reset the backButtonStack in the navigation bar
            me.getNavigationBar().onBeforePop(count);
            toRemove = innerItems.splice(-count, count - 1);
            for( i = 0; i < toRemove.length; i++)
            {
               me.remove(toRemove[i]);
            }
            return true;
         }
      }

      return false;
   },
   /**
    * Resets the view by removing all items
    */
   reset : function()
   {
      var me = this;
      var count = me.getInnerItems().length;

      this.pop(count);
   }
});

Ext.define('Genesis.view.ViewBase',
{
   extend : 'Ext.Container',
   xtype : 'viewbase',
   inheritableStatics :
   {
      generateTitleBarConfig : function()
      {
         var height = ((!(Genesis.fn.isNative() && Ext.os.is('iOS') && Ext.os.version.isGreaterThanOrEqual('7.0')) ? '2.6em' : '3.7') + 'em');
         var style = (!(Genesis.fn.isNative() && Ext.os.is('iOS') && Ext.os.version.isGreaterThanOrEqual('7.0')) ? '' :
         {
            'padding-top' : '20px'
         });
         return (
            {
               xtype : 'titlebar',
               docked : 'top',
               tag : 'navigationBarTop',
               cls : 'navigationBarTop',
               height : height,
               style : style,
               masked :
               {
                  xtype : 'mask',
                  transparent : true
               },
               defaults :
               {
                  iconMask : true
               }
            });
      },
      invisibleMask :
      {
         xtype : 'mask',
         transparent : true
      },
      phoneField : function()
      {
         return (
            {
               xtype : 'textfield',
               minLength : 12,
               maxLength : 12,
               placeHolder : '800-555-1234',
               listeners :
               {
                  keyup : function(f, e, eOpts)
                  {
                     var keyCode = e.browserEvent.keyCode, key = String.fromCharCode(keyCode), value = f.getValue();

                     if ((keyCode >= 48 && keyCode <= 90) || //
                     (keyCode >= 106 && keyCode <= 111) || //
                     (keyCode >= 186 && keyCode <= 192) || //
                     (keyCode >= 219 && keyCode <= 222))
                     {
                        if (key.match(/[0-9]/) && (!e.browserEvent.shiftKey && !e.browserEvent.ctrlKey && !e.browserEvent.metaKey))
                        {
                           if ((value.length == 3) || (value.length == 7))
                           {
                              f.setValue(value + "-");
                           }
                           else if ((value.length == 4) || (value.length == 8))
                           {
                              var match = value.match(/-/);
                              if (!match)
                              {
                                 f.setValue(value.slice(0, value.length - 1) + "-" + value[value.length - 1]);
                              }
                              else
                              {
                                 switch (match.length)
                                 {
                                    case 1:
                                    {
                                       if (value.length > 4)
                                       {
                                          f.setValue(value.slice(0, value.length - 1) + "-" + value[value.length - 1]);
                                       }
                                       break;
                                    }
                                    default:
                                       break;
                                 }
                              }
                           }
                        }
                        else
                        {
                           f.setValue(value.slice(0, value.length - 1));
                        }
                     }
                     //console.debug("Phone#[" + f.getValue() + "]");
                  }
               }
            });
      }
   },
   config :
   {
      preRender : null
   },
   initialize : function()
   {
      this.callParent(arguments);
      this.setPreRender([]);
   },
   calcCarouselSize : function(factor)
   {
      var me = this, spacingFactor = 50, mobile = Ext.os.is('Phone') || Ext.os.is('Tablet'), area = window.innerHeight * window.innerWidth;

      factor = factor || 1;
      console.debug("Screen Height[" + window.innerHeight + "], Width[" + window.innerWidth + "]");
      var width;

      if (Ext.os.is('Phone') || !merchantMode)
      {
         width = (Ext.os.is('iOS')) ? 320 : 384;
      }
      else if (Ext.os.is('Tablet'))
      {
         width = (Ext.os.is('iOS')) ? 768 : 480;
      }

      if (mobile)
      {
         if (area < (480 - spacingFactor) * width)
         {
            me.setItemPerPage(Math.floor(4 * factor));
         }
         else if (area < (568 - spacingFactor) * width)
         {
            me.setItemPerPage(Math.floor(6 * factor));
         }
         else if (area < (1024 - spacingFactor) * width)
         {
            me.setItemPerPage(Math.floor(8 * factor));
         }
         else
         {
            me.setItemPerPage(Math.floor(10 * factor));
         }
      }
   },
   cleanView : function()
   {
      this.fireEvent('cleanView', this);
   },
   /**
    * Removes all items currently in the Container, optionally destroying them all
    * @param {Boolean} destroy If true, {@link Ext.Component#destroy destroys} each removed Component
    * @param {Boolean} everything If true, completely remove all items including docked / centered and floating items
    * @return {Ext.Component} this
    */
   removeAll : function(destroy, everything)
   {
      var rc = this.callParent(arguments);
      this.setPreRender([]);

      return rc;
   },
   createView : function()
   {
      this.fireEvent('createView', this);
      return (this.getPreRender().length == 0);
   },
   showView : function()
   {
      // Do not add to view, if there's existing items, only re-render on empty views
      if (this.getInnerItems().length == 0)
      {
         this.add(this.getPreRender());
      }
      Ext.defer(this.fireEvent, 0.01 * 1000, this, ['showView', this]);
      //this.fireEvent('showView', this);
   }
});

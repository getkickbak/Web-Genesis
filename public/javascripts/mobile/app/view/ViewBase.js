Ext.define('Genesis.view.ViewBase',
{
   extend : 'Ext.Container',
   xtype : 'viewbase',
   statics :
   {
      generateTitleBarConfig : function()
      {
         return (
            {
               xtype : 'titlebar',
               docked : 'top',
               cls : 'navigationBarTop',
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
   createView : function()
   {
      return (this.getPreRender().length == 0);
   },
   showView : function()
   {
      var titlebar = this.query('titlebar')[0];
      this.add(this.getPreRender());
      Ext.defer(titlebar.setMasked, 0.3 * 1000, titlebar, [false]);
   }
});

Ext.define('Genesis.view.ViewBase',
{
   extend : 'Ext.Container',
   xtype : 'viewbase',
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
      this.add(this.getPreRender());
   }
});

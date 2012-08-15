Ext.define('Genesis.view.Document',
{
   extend : 'Genesis.view.ViewBase',
   xtype : 'documentview',
   config :
   {
      layout : 'fit',
      cls : 'viewport',
      items : [Ext.apply(Genesis.view.ViewBase.generateTitleBarConfig(),
      {
         title : ' ',
         items : [
         {
            align : 'left',
            //ui : 'back',
            ui : 'normal',
            tag : 'back',
            text : 'Back'
         }]
      }),
      {
         xtype : 'panel',
         scrollable : 'vertical',
         padding : '0.7 0.8',
         defaultUnit : 'em',
         html : ' '
      }]
   },
   setHtml : function(html)
   {
      this.query('panel')[0].setHtml(html);
   },
   createView : function()
   {
      if (!this.callParent(arguments))
      {
         return;
      }
   }
});

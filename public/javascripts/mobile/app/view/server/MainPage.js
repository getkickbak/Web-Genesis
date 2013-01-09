Ext.define('Genesis.view.server.MainPage',
{
   extend : 'Genesis.view.MainPageBase',
   alias : 'widget.servermainpageview',
   config :
   {
      items : ( function()
         {
            var items = [Ext.apply(Genesis.view.ViewBase.generateTitleBarConfig(),
            {
               xtype : 'titlebar',
               cls : 'navigationBarTop kbTitle'
            }),
            {
               xtype : 'carousel',
               direction : 'horizontal'
            }];
            return items;
         }())
   },
   disableAnimation : true,
   isEligible : function(values, xindex)
   {
      return '';
   }
});

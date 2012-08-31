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
         xtype : 'container',
         tag : 'content',
         scrollable : 'vertical',
         padding : '0.7 0.8',
         defaultUnit : 'em',
         html : ' '
      }]
   },
   disableAnimation : true,
   setHtml : function(html)
   {
      var page = this.query('container[tag=content]')[0];
      var scroll = page.getScrollable();

      page.setHtml(html);
      if (scroll)
      {
         scroll.getScroller().scrollTo(0, 0);
      }
   },
   createView : function()
   {
      if (!this.callParent(arguments))
      {
         return;
      }
   }
});

Ext.define('Genesis.view.MultipartDocument',
{
   extend : 'Genesis.view.ViewBase',
   xtype : 'multipartdocumentview',
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
         xtype : 'tabpanel',
         defaults :
         {
            xtype : 'container',
            scrollable : 'vertical',
            padding : '0.7 0.8',
            defaultUnit : 'em',
            html : ' '
         },
         layout : 'card',
         tabBarPosition : 'top',
         tabBar :
         {
            layout :
            {
               pack : 'justify'
            }
         }
      }]
   },
   disableAnimation : true,
   setHtml : function(index, tabConfig)
   {
      var tabPanel = this.query('tabpanel')[0];
      var page = tabPanel.getInnerItems()[index];
      if (!page)
      {
         page = tabPanel.insert(index, Ext.apply(
         {
            xtype : 'container'
         }, tabConfig));
      }
      else
      {
         var scroll = page.getScrollable();
         scroll.getScroller().scrollTo(0, 0);
         page.setHtml(html);
      }
   },
   createView : function()
   {
      if (!this.callParent(arguments))
      {
         return;
      }
   }
});

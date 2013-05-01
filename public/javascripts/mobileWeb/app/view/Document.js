Ext.define('KickBak.view.Document',
{
   extend : 'KickBak.view.ViewBase',
   xtype : 'documentview',
   config :
   {
      layout : 'fit',
      cls : 'viewport'
   },
   disableAnimation : true,
   constructor : function(config)
   {
      Ext.merge(config,
      {
         items : [Ext.apply(this.self.generateTitleBarConfig(),
         {
            title : ' ',
            items : [
            {
               align : 'left',
               ui : 'back',
               //ui : 'normal',
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
      });

      this.callParent(arguments);
   },
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

Ext.define('KickBak.view.MultipartDocument',
{
   requires : ['Ext.tab.Panel'],
   extend : 'KickBak.view.ViewBase',
   xtype : 'multipartdocumentview',
   config :
   {
      layout : 'fit',
      cls : 'viewport'
   },
   disableAnimation : true,
   constructor : function(config)
   {
      Ext.merge(config,
      {
         items : [Ext.apply(this.self.generateTitleBarConfig(),
         {
            title : ' ',
            items : [
            {
               align : 'left',
               ui : 'back',
               //ui : 'normal',
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
      });

      this.callParent(arguments);
   },
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

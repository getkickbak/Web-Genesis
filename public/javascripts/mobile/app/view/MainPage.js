Ext.define('Genesis.view.MainPage',
{
   extend : 'Ext.Container',
   requires : ['Ext.dataview.DataView', 'Ext.XTemplate'],
   alias : 'widget.mainpageview',
   config :
   {
      title : 'JustForMyFriends',
      changeTitle : false,
      layout : 'fit',
      scrollable : 'vertical',
      items : [
      {
         xtype : 'dataview',
         cls : 'mainMenuSelections',
         scrollable : false,
         deferInitialRefresh : false,
         store : 'MainPageStore',
         itemTpl : Ext.create('Ext.XTemplate',
         // @formatter:off
         '<div class="mainPageItemWrapper">', '<div class="photo"><img src="{[this.getPhoto(values.photo_url)]}" /></div>', '<div class="photoName">{name}</div>', '</div>',
         // @formatter:on
         {
            getPhoto : function(photoURL)
            {
               return Ext.isEmpty(photoURL) ? Ext.BLANK_IMAGE_URL : photoURL;
            }
         }),
         autoScroll : true
      },
      {
         docked : 'bottom',
         cls : 'navigationBarBottom',
         hidden : true,
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
         //
         // Left side Buttons
         //
         {
            xtype : 'spacer'
         },
         //
         // Middle Button
         //
         {
            iconCls : 'check_black1',
            tag : 'main',
            title : 'Main'
         },
         //
         // Right side Buttons
         //
         {
            xtype : 'spacer'
         }]
      }]
   },
   beforeActivate : function()
   {
   },
   beforeDeactivate : function()
   {
      var viewport = Ext.ComponentQuery.query('viewportview')[0];
      viewport.query('button[tag=info]')[0].hide();
   },
   afterActivate : function()
   {
      var viewport = Ext.ComponentQuery.query('viewportview')[0];
      viewport.query('button[tag=info]')[0].show();
      viewport.query('button[tag=main]')[0].hide();
   },
   afterDeactivate : function()
   {
   }
});

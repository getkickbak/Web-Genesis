Ext.define('Genesis.view.MainPage',
{
   extend : 'Ext.dataview.DataView',
   requires : ['Ext.dataview.DataView', 'Ext.XTemplate'],
   alias : 'widget.mainpageview',
   config :
   {
      title : 'JustForMyFriends',
      layout :
      {
         type : 'hbox',
         pack : 'center',
         align : 'middle'
      },
      scrollable : 'vertical',
      cls : 'menuSelections',
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
      /*
       plugins : [Ext.create('Ext.ux.DataView.Animated', {
       duration : 550,
       idProperty : 'id'
       })],
       */
      multiSelect : false,
      autoScroll : true
   }
});

Ext.define('Genesis.view.MainPage',
{
   extend : 'Ext.dataview.DataView',
   requires : ['Ext.dataview.DataView', 'Genesis.store.MainPageStore', 'Ext.Template'],
   alias : 'widget.mainpageview',
   title : 'JustForMyFriends',
   config :
   {
      layout :
      {
         type : 'hbox',
         pack : 'center',
         align : 'middle'
      },
      cls : 'menuSelections',
      deferInitialRefresh : false,
      store : 'MainPageStore',
      itemTpl : Ext.create('Ext.XTemplate',
      // @formatter:off
      '<div class="mainPageItemWrapper">',
         '<div class="photo"><img src="{[this.getPhoto(values.photo_url)]}" /></div>',
         '<div class="photoName">{name}</div>',
      '</div>',
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
      itemSelector : 'div.mainPageItemWrapper',
      //overItemCls : 'phone-hover',
      multiSelect : false,
      autoScroll : true
   }
});

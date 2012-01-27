Ext.define('Genesis.view.ChallengePage',
{
   extend : 'Ext.Container',
   requires : ['Ext.data.Store', 'Ext.dataview.DataView', 'Ext.XTemplate', 'Ext.Toolbar', 'Genesis.model.Challenge'],
   alias : 'widget.challengepageview',
   config :
   {
      title : 'Challenges',
      layout : 'fit',
      scrollable : 'vertical',
      items : [
      {
         xtype : 'dataview',
         layout :
         {
            type : 'hbox',
            pack : 'center',
            align : 'middle'
         },
         cls : 'menuSelections',
         deferInitialRefresh : true,
         store : 'ChallengePageStore',
         itemTpl : Ext.create('Ext.XTemplate',
         // @formatter:off
         '<div class="challengePageItemWrapper">' + '<div class="photo"><img src="{[this.getPhoto(values.photo_url)]}" /></div>' + '<div class="photoName">{name}</div>' + '</div>',
         // @formatter:on
         {
            getPhoto : function(photoURL)
            {
               return Ext.isEmpty(photoURL) ? Ext.BLANK_IMAGE_URL : photoURL;
            }
         }),
         multiSelect : false,
         autoScroll : true
      },
      {
         docked : 'bottom',
         xtype : 'container',
         // @formatter:off
         tpl : '<div class="challengePageItemDescWrapper">' + '<div class="itemDesc">{description}</div>' + '<div class="itemDescName">{name}</div>' + '</div>'
         // @formatter:on
      }]
   }
});

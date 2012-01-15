Ext.define('Genesis.view.ChallengePage',
{
   extend : 'Ext.Container',
   requires : ['Ext.dataview.DataView', 'Genesis.store.ChallengePageStore', 'Ext.Template'],
   alias : 'widget.challengepageview',
   title : 'Challenges',
   config :
   {
      layout : 'fit',
      items : [
      {
         docked : 'bottom',
         cls : 'navigationBarBottom',
         xtype : 'toolbar',
         layout :
         {
            pack : 'justify',
            align : 'center'
         },
         defaults :
         {
            iconMask : true
         },
         items : [
         {
            xtype : 'spacer'
         },
         {
            iconCls : 'challenge',
            iconAlign : 'top',
            //hidden : true,
            text : 'Begin!'
         },
         {
            xtype : 'spacer'
         },
         {
            iconCls : 'home',
            iconAlign : 'top',
            id : 'homeButton',
            text : 'Home'
         }]
      },
      {
         xtype : 'dataview',
         cls : 'menuSelections',
         layout :
         {
            type : 'hbox',
            pack : 'center',
            align : 'middle'
         },
         deferInitialRefresh : true,
         store : 'ChallengePageStore',
         itemTpl : Ext.create('Ext.XTemplate',
         // @formatter:off
         '<div class="challengePageItemWrapper">', '<div class="photo"><img src="{[this.getPhoto(values.photo_url)]}" /></div>', '<div class="photoName">{name}</div>', '</div>',
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
         itemSelector : 'div.challengePageItemWrapper',
         //overItemCls : 'phone-hover',
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

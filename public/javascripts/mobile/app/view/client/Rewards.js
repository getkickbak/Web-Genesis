Ext.define('Genesis.view.client.Rewards',
{
   extend : 'Genesis.view.ViewBase',
   requires : ['Ext.Toolbar'],
   alias : 'widget.clientrewardsview',
   config :
   {
      layout : 'fit',
      cls : 'rouletteBg',
      items : [Ext.apply(Genesis.view.ViewBase.generateTitleBarConfig(),
      {
         title : 'Swipe and Play'
      }),
      {
         xtype : 'component',
         tag : 'prizeCheck',
         cls : 'prizeCheck',
         // -------------------------------------------------------------------
         // Checking for Prizes Screen
         // -------------------------------------------------------------------
         data :
         {
         },
         tpl :
         // @formatter:off
         '<div class="rouletteTable"></div>'+
         '<div class="rouletteBall"></div>'
          // @formatter:on
      }],
      listeners : [
      {
         element : 'element',
         delegate : "div.prizeCheck",
         event : "tap",
         fn : "onRouletteTap"
      }]
   },
   onRouletteTap : function(b, e, eOpts)
   {
      var viewport = _application.getController('client' + '.Viewport');
      viewport.self.playSoundFile(viewport.sound_files['clickSound']);
      this.fireEvent('rouletteTap', this.metaData);
   },
   inheritableStatics :
   {
      getPhoto : function(type)
      {
         var photo_url = null;
         switch (type.value)
         {
            case 'vip' :
               photo_url = Genesis.constants.getIconPath('miscicons', type.value);
               break;
            default :
               photo_url = Genesis.constants.getIconPath('fooditems', type.value);
               //console.debug("Icon Path [" + photo_url + "]");
               break;
         }
         return photo_url;
      }
   }
});

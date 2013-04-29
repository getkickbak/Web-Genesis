Ext.define('KickBak.view.widgets.ItemDetail',
{
});

Ext.define('KickBak.view.widgets.PopupItemDetail',
{
   requires : ['KickBak.model.CustomerReward', 'KickBak.view.widgets.PopupItem'],
   extend : 'Ext.Sheet',
   alias : 'widget.popupitemdetailview',
   config :
   {
      bottom : 0,
      left : 0,
      top : 0,
      right : 0,
      //padding : '1.0',
      hideOnMaskTap : false,
      defaultUnit : 'em',
      layout :
      {
         type : 'vbox',
         pack : 'middle'
      },
      defaults :
      {
         xtype : 'container',
         defaultUnit : 'em'
      }
   },
   constructor : function(config)
   {
      var me = this;
      config = config ||
      {
      };

      var buttons = config['buttons'] || [];
      delete config['buttons'];

      var preItemsConfig = config['preItemsConfig'] || [];
      var postItemsConfig = config['postItemsConfig'] || [];
      delete config['preItemsConfig'];
      delete config['postItemsConfig'];

      Ext.merge(config,
      {
         items : [
         {
            preItemsConfig : preItemsConfig,
            postItemsConfig : postItemsConfig,
            iconType : config['iconType'],
            flex : 1,
            xtype : 'popupitem',
            data : Ext.create('KickBak.model.CustomerReward',
            {
               'title' : config['title'],
               'type' :
               {
                  value : config['icon']
               }
               //'photo' : photoUrl
            })
         },
         {
            docked : 'bottom',
            defaults :
            {
               xtype : 'button',
               defaultUnit : 'em'
            },
            padding : '0 1.0 1.0 1.0',
            items : buttons
         }]
      });
      delete config['iconType'];
      delete config['icon'];

      me.callParent(arguments);
   }
});

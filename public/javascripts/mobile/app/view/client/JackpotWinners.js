Ext.define('Genesis.view.client.JackpotWinners',
{
   extend : 'Genesis.view.ViewBase',
   requires : ['Ext.dataview.List', 'Ext.XTemplate', 'Ext.plugin.PullRefresh'],
   alias : 'widget.clientjackpotwinnersview',
   config :
   {
      cls : 'jackpotWinnersMain viewport',
      layout : 'fit',
      items : [Ext.apply(Genesis.view.ViewBase.generateTitleBarConfig(),
      {
         title : 'Jackpot Winners',
         items : [
         {
            align : 'left',
            tag : 'close',
            //ui : 'back',
            ui : 'normal',
            text : 'Close'
         }]
      })]
   },
   /**
    * Removes all items currently in the Container, optionally destroying them all
    * @param {Boolean} destroy If true, {@link Ext.Component#destroy destroys} each removed Component
    * @param {Boolean} everything If true, completely remove all items including docked / centered and floating items
    * @return {Ext.Component} this
    */
   cleanView : function()
   {
      this.removeAll(true);
   },
   createView : function()
   {
      var me = this;

      /*
       if (Ext.StoreMgr.get('JackpotWinnerStore').getCount() == 0)
       {
       me.getPreRender().push(Ext.create('Ext.Component',
       {
       cls : 'noprizes',
       xtype : 'component',
       scrollable : false,
       defaultUnit : 'em',
       margin : '0 0 0.8 0'
       }));
       console.log("Jackpot Winners No Winners found.");
       }
       else
       */
      {
         me.setPreRender(me.getPreRender().concat([
         //
         // JackpotWinners List
         //
         Ext.create('Ext.dataview.List',
         {
            tag : 'jackpotWinnersList',
            store : 'JackpotWinnerStore',
            cls : 'jackpotWinnersList',
            scrollable : 'vertical',
            deferEmptyText : false,
            disableSelection : true,
            emptyText : ' ',
            itemTpl : Ext.create('Ext.XTemplate',
            // @formatter:off
            '<div class="photo">',
               '<img src="{[this.getPhoto(values)]}"/>',
            '</div>',
           '<div class="listItemDetailsWrapper">',
               '<div class="itemTitle">{[this.getTitle(values)]}</div>',
               '<div class="itemDesc">{[this.getDesc(values)]}</div>',
            '</div>',
            // @formatter:on
            {
               getPhoto : function(values)
               {
                  return ((values['facebook_id'] > 0) ? Genesis.fb.getFbProfilePhoto(values['facebook_id']) : Genesis.constants.getIconPath('miscicons', 'profile'));
               },
               getTitle : function(values)
               {
                  console.debug(values['name'] + ' won ' + values['points'] + ' Points!');
                  return (values['name'] + ' won ' + values['points'] + ' Points!');
               },
               getDesc : function(values)
               {
                  return values['time'];
               }
            }),
            //onItemDisclosure : Ext.emptyFn,
            plugins : [
            {
               type : 'listpaging',
               autoPaging : true
            },
            {
               type : 'pullrefresh',
               refreshFn : function(plugin)
               {
                  _application.getController('client.JackpotWinners').fireEvent('reload');
               }
            }]
         })]));
      }
   }
});

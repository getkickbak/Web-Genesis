Ext.define('Kitchensink.view.Ajax', {
   extend : 'Ext.Container',
   config : {
      scrollable : true,
      items : [{
         xtype : 'panel',
         id : 'Ajax',
         styleHtmlContent : true
      }, {
         docked : 'top',
         xtype : 'toolbar',
         items : [{
            text : 'Load using Ajax',
            handler : function()
            {
               var panel = Ext.getCmp('Ajax');

               panel.getParent().setMask({
                  message : 'Loading...'
               });

               Ext.Ajax.request({
                  url : Ext.Loader.getPath("Kitchensink") + "/../" + 'test.json',
                  success : function(response)
                  {
                     panel.update(response.responseText);
                     panel.getParent().unmask();
                  },
                  failure : function(response, opts)
                  {
                     if(phoneGapAvailable && response.status == 0 && response.responseText != '') {
                        panel.update(response.responseText);
                     }
                     else {
                        console.error('failed to complete request');
                        console.error('phoneGapAvailable:'+phoneGapAvailable);
                        console.error('response.status:'+response.status);
                        console.error('response.responseText:'+response.responseText);
                     }
                     panel.getParent().unmask();
                  }
               });
            }
         }]
      }]
   }
});

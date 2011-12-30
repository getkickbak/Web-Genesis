Ext.define('Genesis.view.Viewport', {
   extend : 'Ext.navigation.View',
   config : {
      useTitleForBackButtonText : true,
      defaultBackButtonText : 'Back',
      profile : Ext.os.deviceType.toLowerCase(),
      navigationBar : {
         hidden : true,
         docked : 'top',
         id : 'navigationBarTop',
         layout : {
            pack : 'justify',
            align : 'center' // align center is the default
         },
         defaults : {
            hidden : true
         },
         items : [
         //Back Button is created by Default in the framework
         {
            align : 'right',
            iconCls : 'x-loading-spinner'
         }, {
            align : 'right',
            text : 'Share'
         }, {
            align : 'right',
            iconCls : 'info',
            hidden : false
         }]
      }
   },
   fullscreen : true
});

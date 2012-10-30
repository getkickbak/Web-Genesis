Ext.define('Genesis.model.frontend.MainPage',
{
   extend : 'Ext.data.Model',
   id : 'MainPage',
   config :
   {
      fields : ['name', 'photo_url', 'desc', 'pageCntlr', 'subFeature', 'route', 'hide'],
      proxy :
      {
         noCache : false,
         enablePagingParams : false,
         reader :
         {
            type : 'json',
            messageProperty : 'message',
            rootProperty : 'data'
         },
         type : 'ajax',
         disableCaching : false,
         url : (function()
         {
            var file;
            if (Ext.os.is('iOS'))
            {
               file = 'ios';
            }
            else
            if (Ext.os.is('Android'))
            {
               if ((window.devicePixelRatio) == 1 || (window.devicePixelRatio >= 2))
               {
                  file = 'android-mxhdpi';
               }
               else
               {
                  file = 'android-lhdpi';
               }
            }
            return Ext.Loader.getPath("Genesis") + "/store/" + ((!merchantMode) ? 'mainClientPage-' : 'mainServerPage-') + file + '.json';
         })()
      }
   }
});

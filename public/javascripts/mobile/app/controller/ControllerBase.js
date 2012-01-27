Ext.define('Genesis.controller.ControllerBase',
{
   extend : 'Ext.app.Controller',
   statics :
   {
      sign_in_path : '/sign_in',
      sign_out_path : '/sign_out',

   },
   login : function()
   {
      var profile = this.self.profile;

      // initialize opening screen ...
      // If Logged in, goto MainPage, otherwise, goto LoginPage
      var successFn = function(response)
      {
         this.getViewPort().getMainPage();
      };

      Ext.Ajax.request(
      {
         url : Genesis.site + this.self.sign_in_path,
         params :
         {
         },
         success : successFn.createDelegate(this),
         failure : function(response, opts)
         {
            if(phoneGapAvailable && response.status == 0 && response.responseText != '')
            {
               successFn.call(this, response);
            }
            else
            {
               console.error('failed to complete request');
               console.error('phoneGapAvailable:' + phoneGapAvailable);
               console.error('response.status:' + response.status);
               console.error('response.responseText:' + response.responseText);
            }
         }.createDelegate(this)
      });
      /*
       var navigation = this.getApplication().getView('Viewport'), toolbar;
       switch (profile)
       {
       case 'desktop':
       case 'tablet':
       navigation.setDetailContainer(this.getMain());
       break;

       case 'phone':
       toolbar = navigation.navigationBar()[0];
       toolbar.add({
       xtype : 'button',
       id : 'viewSourceButton',
       hidden : true,
       align : 'right',
       ui : 'action',
       action : 'viewSource',
       text : 'Source'
       });
       break;
       }
       */
   },
   getViewport : function()
   {
      return this.getApplication().getController('Viewport').getView();
   },
   setCustomerStoreFilter : function(customerId, merchantId)
   {
      var cstore = Ext.StoreMgr.get('CustomerStore');
      cstore.clearFilter();
      cstore.filter([
      {
         filterFn : Ext.bind(function(item)
         {
            return ((item.get("user_id") == customerId) && (item.get("merchant_id") == merchantId));
         }, this)
      }]);
   },
   pushView : function(view)
   {
      this.getViewport().push(view);
   },
   popView : function(view)
   {
      this.getViewport().pop(view);
   },
   openMainPage : Ext.emptyFn,
   isOpenAllowed : function()
   {
      return "Cannot Open Folder";
   }
});

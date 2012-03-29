Ext.define('Genesis.model.Merchant',
{
   extend : 'Ext.data.Model',
   alternateClassName : 'Merchant',
   id : 'Merchant',
   config :
   {
      fields : ['merchant_id', 'name', 'email', 'photo', 'icon_url', 'account_first_name', 'account_last_name', 'phone', 'auth_code', 'qr_code', 'payment_account_id', 'created_ts', 'update_ts'],
      idProperty : 'merchant_id'
   }
});

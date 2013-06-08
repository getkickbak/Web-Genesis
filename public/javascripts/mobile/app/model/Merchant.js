Ext.define('Genesis.model.Merchant',
{
   extend : 'Ext.data.Model',
   alternateClassName : 'Merchant',
   id : 'Merchant',
   config :
   {
      fields : ['id', 'name', 'email', 'photo', 'alt_photo', 'account_first_name', 'account_last_name', //
      'phone', 'auth_code', 'qr_code', 'features_config', 'payment_account_id', 'created_ts', 'update_ts', 'type', 'reward_terms'],
      idProperty : 'id'
   }
});

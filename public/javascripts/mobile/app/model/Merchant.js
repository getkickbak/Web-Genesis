Ext.define('Genesis.model.Merchant', {
   extend : 'Ext.data.Model',
   id : 'Merchant',
   fields : ['merchant_id', 'name', 'email', 'photo_url', 'account_first_name', 'account_last_name', 'phone', 'auth_code', 'qr_code', 'payment_account_id', 'created_ts', 'update_ts']
});

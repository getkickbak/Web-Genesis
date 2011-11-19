class Common
   def self.generate_full_reward_file_path(user, filename)
      get_host+generate_reward_file_path(user, filename)
   end

   def self.generate_reward_file_path(user, filename)
      "#{user.user_id}/rewards/#{filename}"
   end

   def self.generate_full_voucher_file_path(user, filename)
      get_host+generate_voucher_file_path(user, filename)
   end

   def self.generate_voucher_file_path(user, filename)
      "#{user.user_id}/vouchers/#{filename}"
   end

   def self.generate_photo_file_path(deal_id,filename)
      "#{deal_id}/#{filename}"
   end

   def self.generate_full_photo_file_path(deal_id,filename)
      "http://#{APP_PROP["PHOTO_HOST"]}/"+generate_photo_file_path(deal_id,filename)
   end

   private

   def self.get_photo_host_bucket
      "#{APP_PROP["AMAZON_PHOTOS_BUCKET"]}"
   end

   def self.get_photo_host
      "http://#{APP_PROP["PHOTO_HOST"]}/"
   end

   def self.get_host
      "http://#{APP_PROP["FILE_HOST"]}/"
   end
end
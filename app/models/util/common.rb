class Common
  def self.generate_full_merchant_qr_code_image_file_path(merchant_id, filename)
    get_host+generate_merchant_qr_code_image_file_path(merchant_id, filename)
  end

  def self.generate_merchant_qr_code_image_file_path(merchant_id, filename)
    "#{merchant_id}/qr_code_image/#{filename}"
  end

  def self.generate_full_merchant_qr_code_file_path(merchant_id, filename)
    get_host+generate_merchant_qr_code_file_path(merchant_id, filename)
  end

  def self.generate_merchant_qr_code_file_path(merchant_id, filename)
    "#{merchant_id}/qr_code/#{filename}"
  end

  def self.generate_full_voucher_file_path(user_id, filename)
    get_host+generate_voucher_file_path(user_id, filename)
  end

  def self.generate_voucher_file_path(user_id, filename)
    "#{user_id}/vouchers/#{filename}"
  end

  def self.generate_photo_file_path(deal_id, filename)
    "#{deal_id}/#{filename}"
  end

  def self.generate_full_photo_file_path(deal_id,filename)
    "http://#{APP_PROP["PHOTO_HOST"]}/"+generate_photo_file_path(deal_id,filename)
  end

  def self.within_geo_distance?(latitude_1, longitude_1, latitude_2, longitude_2)
    cal_distance = 6371000 * acos( cos( radians( latitude_1 ) ) * cos( radians( latitude_2 ) ) * cos( radians( longitude_2 ) - radians( longitude_1 ) ) + sin( radians( latitude_1 ) ) * sin( radians( latitude_2 ) ) )
    cal_distance <= 50
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
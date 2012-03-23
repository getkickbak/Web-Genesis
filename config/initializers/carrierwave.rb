CarrierWave.configure do |config|
  config.fog_credentials = {
    :provider               => 'AWS',       # required
    :aws_access_key_id      => 'AKIAIBKLCOJMK2OWLHUQ',       # required
    :aws_secret_access_key  => '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'       # required
  }
  config.fog_directory  = "#{APP_PROP["AMAZON_PHOTOS_BUCKET"]}"                     # required
  config.fog_host       = "http://#{APP_PROP["PHOTO_HOST"]}"            # optional, defaults to nil
end

module CarrierWave
  module MiniMagick
    def quality(percentage)
      manipulate! do |img|
        img.quality(percentage.to_s)
        img = yield(img) if block_given?
        img
      end
    end
  end
end
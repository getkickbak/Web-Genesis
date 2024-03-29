# encoding: utf-8
class PromotionPhotoUploader < CarrierWave::Uploader::Base

  # Include RMagick or MiniMagick support:
  # include CarrierWave::RMagick
  include CarrierWave::MiniMagick

  # Choose what kind of storage to use for this uploader:
  # storage :file
  # storage :fog
  storage :fog
  # Override the directory where uploaded files will be stored.
  # This is a sensible default for uploaders that are meant to be mounted:
  def store_dir
    "merchants/#{model.merchant.id}/promotions" if model.merchant
  end
  
  # Provide a default URL as a default if there hasn't been a file uploaded:
  # def default_url
  #   "/images/fallback/" + [version_name, "default.png"].compact.join('_')
  # end

  # Process files as they are uploaded:
  process :cropper
  process :resize_to_limit => [1024,1024]

  def cropper
    manipulate! do |img|
      if model.crop_x.blank?
        image = MiniMagick::Image.open(current_path)
        width = image[:width]
        height = image[:height]
        if width == height || width > height
          crop_x = 0
          crop_y = 0
        elsif height > width
          crop_x = 0
          crop_y = (height - width)/2
          height = width
        end
        model.crop_w = width.to_i
        model.crop_h = height.to_i
        model.crop_x = crop_x.to_i
        model.crop_y = crop_y.to_i
      end
      img.crop "#{model.crop_w}x#{model.crop_h}+#{model.crop_x}+#{model.crop_y}"
      img
    end
  end

  #
  # def scale(width, height)
  #   # do something
  # end

  # Create different versions of your uploaded files:
  
  version :thumbnail_ios_large do
    process :resize_to_limit => [640, 640]
  end
  
  version :thumbnail_ios_medium, :from_version => :thumbnail_ios_large do
    process :resize_to_limit => [114, 114]
  end
  
  version :thumbnail_ios_small, :from_version => :thumbnail_ios_large do
    process :resize_to_limit => [60, 60]
  end
 
  version :thumbnail_android_mxhdpi_large do
    process :resize_to_limit => [720, 720]
  end
  
  version :thumbnail_android_mxhdpi_medium, :from_version => :thumbnail_android_mxhdpi_large do
    process :resize_to_limit => [96, 96]
  end
  
  version :thumbnail_android_mxhdpi_small, :from_version => :thumbnail_android_mxhdpi_large do
    process :resize_to_limit => [60, 60]
  end
  
  version :thumbnail_android_lhdpi_large do
    process :resize_to_limit => [480, 480]
  end
  
  version :thumbnail_android_lhdpi_medium, :from_version => :thumbnail_android_lhdpi_large do
    process :resize_to_limit => [72, 72]
  end
  
  version :thumbnail_android_lhdpi_small, :from_version => :thumbnail_android_lhdpi_large do
    process :resize_to_limit => [60, 60]
  end
  
  # Add a white list of extensions which are allowed to be uploaded.
  # For images you might use something like this:
  def extension_white_list
    %w(jpg jpeg gif png)
  end

# Override the filename of the uploaded files:
# Avoid using model.id or version_name here, see uploader/store.rb for details.
# def filename
#   "something.jpg" if original_filename
# end

end

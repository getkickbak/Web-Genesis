object @photo_uploader
attributes :url
node :thumbnail_small_url do |u|
  case session[:user_agent]
  when :iphone
 	u.thumbnail_ios_small.url
  when :android
    if session[:resolution] == :lhdpi
    	u.thumbnail_android_lhdpi_small.url
    elsif session[:resolution] == :mxhdpi
    	u.thumbnail_android_mxhdpi_small.url
   	end
  end	
end
node :thumbnail_medium_url do |u|
  case session[:user_agent]
  when :iphone
 	u.thumbnail_ios_medium.url
  when :android
    if session[:resolution] == :lhdpi
    	u.thumbnail_android_lhdpi_medium.url
    elsif session[:resolution] == :mxhdpi
    	u.thumbnail_android_mxhdpi_medium.url
   	end
  end	
end
node :thumbnail_large_url do |u|
  case session[:user_agent]
  when :iphone
 	u.thumbnail_ios_large.url
  when :android
    if session[:resolution] == :lhdpi
    	u.thumbnail_android_lhdpi_large.url
    elsif session[:resolution] == :mxhdpi
    	u.thumbnail_android_mxhdpi_large.url
   	end
  end	
end
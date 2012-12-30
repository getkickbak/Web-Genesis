exists = DataMapper.repository(:default).adapter.storage_exists?('venues')
if exists
  venues_info = Venues.all(:fields => [:id])
  venues_info.each do |venue_info|
    device_count = Device.count(:merchant_venue_id => venue_info.id)
    device_count.times do |x|
      Channel.add
    end
  end
end  

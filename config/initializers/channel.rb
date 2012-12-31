hash = YAML.load(File.new(File.expand_path("config/database.yml", Rails.root)))
DataMapper.setup(:default, hash[Rails.env])
exists = DataMapper.repository(:default).adapter.storage_exists?('venues')
if exists
  venues = Venue.all
  venues.each do |venue|
    device_count = Device.count(:merchant_venue => venue)
    device_count.times do |x|
      Channel.group_size.times do |n|
        Channel.add
      end
    end
  end
end

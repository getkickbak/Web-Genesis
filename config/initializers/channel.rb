hash = YAML.load(File.new(File.expand_path("config/database.yml", Rails.root)))
DataMapper.setup(:default, hash[Rails.env])
exists = DataMapper.repository(:default).adapter.storage_exists?('venues')
if exists
  venues_info = Venue.all
  venues_info.each do |venue_info|
    device_count = DataMapper.repository(:default).adapter.select(
      "SELECT count(*) FROM devices WHERE merchant_venue_id = ?", venue_info.id
    )
    if device_count.length > 0
      device_count[0].times do |x|
        Channel.add(Channel.get_group(venue_info.id))
      end
    end
  end
end

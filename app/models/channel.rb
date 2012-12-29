class Channel
  @@free_list = {}
  @@reserve_list = {}
  
  def self.add(channel)
    system("mkfifo #{channel}")
    @@free_list[channel] = channel
  end
  
  def self.reserve
    channel = @@free_list.shift
    if channel
      @@reserve_list[channel[0]] = channel[1]
    else
      raise "Cannot reserve channel"
    end    
  end
  
  def self.free(channel)
    free_channel = @@reserve_list.delete(channel)
    (@@free_list[free_channel] = free_channel) if not free_channel.nil?
  end
end
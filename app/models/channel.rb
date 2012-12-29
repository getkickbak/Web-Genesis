class Channel
  @@memcache = nil
  
  def self.setup
    @@memcache.set("FREE_CHANNELS", {})
    @@memcache.set("RSERVE_CHANNELS", {})
  end
  
  def self.add(channel)
    system("mkfifo #{channel}")
    free_channels = @@memcache.get("FREE_CHANNELS")    
    free_channels[channel] = channel
  end
  
  def self.reserve
    reserve_channels = @@memcache.get("RESERVE_CHANNELS")
    free_channels = @@memcache.get("FREE_CHANNELS")
    channel = free_channels.shift
    if channel
      reserve_channels[channel[0]] = channel[1]
    else
      raise "Cannot reserve channel"
    end    
  end
  
  def self.free(channel)
    free_channels = @@memcache.get("FREE_CHANNELS")  
    reserve_channels = @@memcache.get("RESERVE_CHANNELS")
    free_channel = reserve_channels.delete(channel)
    (free_channels[free_channel] = free_channel) if not free_channel.nil?
  end
  
  def self.memcache=(memcache)
    @@memcache = memcache
  end
  
  def self.memcache
    @@memcache
  end
end
class Channel
  @@memcache = nil
  
  def self.setup
    @@memcache.set("FREE_CHANNELS", {})
    @@memcache.set("RSERVE_CHANNELS", {})
  end
  
  def self.add(channel)
    File.mkfifo(channel)
    free_channels = @@memcache.get("FREE_CHANNELS")    
    free_channels[channel] = channel
  end
  
  def self.reserve
    reserve_channels = @@memcache.get("RESERVE_CHANNELS")
    free_channels = @@memcache.get("FREE_CHANNELS")
    channel = free_channels.shift
    reserve_channels[channel[0]] = channel[1]
    channel[0]
  end
  
  def self.free(channel)
    free_channels = @@memcache.get("FREE_CHANNELS")  
    reserve_channels = @@memcache.get("RESERVE_CHANNELS")
    reserve_channels.delete(channel)
    free_channels[channel] = channel
  end
  
  def self.memcache=(memcache)
    @@memcache = memcache
  end
  
  def self.memcache
    @@memcache
  end
end
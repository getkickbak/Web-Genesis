class Channel
  @@free_list = {}
  @@reserve_list = {}
  @@groups = {}
  @@count = 0
  
  def self.get_group(venue_id)
    "ChannelGroup-#{venue_id}"  
  end
  
  def self.add(group)
    begin
      mutex = CacheMutex.new(group, Cache.memcache)
      acquired = mutex.acquire
      @@count = @@count + 1
      channel = "/tmp/channel_#{@@count}"
      system("mkfifo #{channel}")
      channels = @@free_list[group]
      if channels.nil?
        channels = @@free_list[group] = {}
      end
      channels[channel] = channel
    ensure
      mutex.release if ((defined? mutex) && !mutex.nil?)
    end
  end
  
  def self.reserve(group)
    begin
      mutex = CacheMutex.new(group, Cache.memcache)
      acquired = mutex.acquire
      channel = @@free_list[group].shift
      if channel
        channels = @@reserve_list[group]
        if channels.nil?
          channels = @@reserve_list[group] = {}
        end  
        channels[channel[0]] = channel[1]
      else
        raise "Cannot reserve channel"
      end 
    ensure
      mutex.release if ((defined? mutex) && !mutex.nil?)
    end   
  end
  
  def self.free(group, channel)
    begin
      mutex = CacheMutex.new(group, Cache.memcache)
      acquired = mutex.acquire
      free_channel = @@reserve_list[group].delete(channel)
      (@@free_list[group][free_channel] = free_channel) if not free_channel.nil?
    ensure
      mutex.release if ((defined? mutex) && !mutex.nil?)
    end
  end
  
  def self.count
    @@count
  end
end
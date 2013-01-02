class Channel
  @@memcache = nil
  @@count_mutex_name = "ChannelCountMutex"
  @cache_cache_name = "ChannelCount"
  
  def self.get_group(venue_id)
    "ChannelGroup-#{venue_id}"  
  end
  
  def self.add(group)
    begin
      mutex = CacheMutex.new(group, Cache.memcache)
      acquired = mutex.acquire
      count_mutex = CacheMutex.new(@@count_mutex_name, Cache.memcache)
      acquired = count_mutex.acquire
      count = @@memcache.get(@@count_cache_name) || 0
      count = count + 1
      channel = "/tmp/channel_#{count}"
      @@memcache.set(@@count_cache_name, count)
      system("mkfifo #{channel}")
      channels = @@memcache.get(get_free_list_cache_name(group)) || {}
      channels[channel] = channel
      @@memcache.set(get_free_list_cache_name(group), channels)
    ensure
      count_mutex.release if ((defined? count_mutex) && !count_mutex.nil?)
      mutex.release if ((defined? mutex) && !mutex.nil?)
    end
  end
  
  def self.reserve(group)
    begin
      mutex = CacheMutex.new(group, Cache.memcache)
      acquired = mutex.acquire
      group_free_list = get_free_list_cache_name(group)
      free_channels = @@memcache.get(group_free_list)
      channel = free_channels.shift
       @@memcache.set(group_free_list, free_channels)
      if channel
        group_reserve_list = get_reserve_list_cache_name(group)
        reserve_channels = @@memcache.get(group_reserve_list) || {} 
        reserve_channels[channel[0]] = channel[1]
        @@memcache.set(group_reserve_list, reserve_channels)
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
      group_reserve_list = get_reserve_list_cache_name(group)
      reserve_channels = @@memcache.get(group_reserve_list)
      free_channel = reserve_channels.delete(channel)
      @@memcache.set(group_reserve_list, reserve_channels)
      if not free_channel.nil?
        group_free_list = get_free_list_cache_name(group)
        free_channels = @@memcache.get(group_free_list)
        free_channels[free_channel] = free_channel
        @@memcache.set(group_free_list, free_channels)
      end 
    ensure
      mutex.release if ((defined? mutex) && !mutex.nil?)
    end
  end
  
  def self.memcache=(memcache)
    @@memcache = memcache
  end
  
  def self.memcache
    @@memcache
  end
  
  private
  
  def self.get_free_list_cache_name(group)
    "#{group}-FreeList"
  end
  
  def self.get_reserve_list_cache_name(group)
    "#{group}-ReserveList"
  end
end
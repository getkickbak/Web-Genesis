class Channel
  @@free_list = {}
  @@reserve_list = {}
  @@groups = ["ChannelGroup-1"]
  @@count = 0
  @@group_size = 5
  
  def self.get_group
    @@groups[Random.rand(@@groups.length)]
  end
  
  def self.add
    begin
      group = @@groups.last
      group_mutex = CacheMutex.new(group, Cache.memcache)
      acquired = group_mutex.acquire
      @@count = @@count + 1
      group_count = @@count / @@group_size
      if group_count > @@groups.length
        @@groups << "ChannelGroup-#{group_count}"
      elsif @@count == (@@group_size + 1) 
        @@groups << "ChannelGroup-#{group_count+1}"
      end
      channel = "/tmp/channel_#{@@count}"
      system("mkfifo #{channel}")
      group = @@groups.last
      channels = @@free_list[group]
      if channels.nil?
        channels = @@free_list[group] = {}
      end
      channels[channel] = channel
    ensure
      group_mutex.release if ((defined? group_mutex) && !group_mutex.nil?)
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
  
  def self.group_size
    @@group_size
  end
end
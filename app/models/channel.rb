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
      mutex = CacheMutex.new(group, Cache.memcache)
      acquired = mutex.acquire
      channel = "/tmp/channel_#{@@count+1}"
      system("mkfifo #{channel}")
      channels = @@free_list[group]
      if channels.nil?
        @@free_list[group] = {}
      else
        @@free_list[group][channel] = channel
      end
      @@count = @@count + 1
      group = @@count / @@group_size
      if group > @@groups.length
        @@groups << "ChannelGroup-#{group}"
      elsif @@count == @@group_size
        @@groups << "ChannelGroup-#{group+1}"  
      end
    ensure
      mutex.release if ((defined? mutex) && !mutex.nil?)
    end
  end
  
  def self.reserve(group)
    begin
      mutex = CacheMutex.new(group, Cache.memcache)
      acquired = mutex.acquire
      @@free_list.each do |item|
        Rails.logger.info("free-list item:#{item}")
      end
      channel = @@free_list[group].shift
      if channel
        @@reserve_list[group][channel[0]] = channel[1]
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
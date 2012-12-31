class Channel
  @@free_list = {}
  @@reserve_list = {}
  @@groups = ["ChannelGroup-1"]
  @@count = 0
  @@group_size = 5
  @@groups_mutex_name = "ChannelGroups"
  
  def self.get_group
    begin
      mutex = CacheMutex.new(@@groups_mutex_name, Cache.memcache)
      acquired = mutex.acquire
      @@groups[Random.rand(@@groups.length)]
    ensure
      mutex.release if ((defined? mutex) && !mutex.nil?)
    end
  end
  
  def self.add
    begin
      group = @@groups.last
      group_mutex = CacheMutex.new(group, Cache.memcache)
      acquired = group_mutex.acquire
      @@count = @@count + 1
      group_count = @@count / @@group_size
      if group_count > @@groups.length
        groups_mutex = CacheMutex.new(@@groups_mutex_name, Cache.memcache)
        acquired = groups_mutex.acquire
        @@groups << "ChannelGroup-#{group_count}"
      elsif @@count == (@@group_size + 1) 
        group_count = group_count + 1
        groups_mutex = CacheMutex.new(@@groups_mutex_name, Cache.memcache)
        acquired = groups_mutex.acquire
        @@groups << "ChannelGroup-#{group_count}"
      end
      channel = "/tmp/channel_#{@@count}"
      system("mkfifo #{channel}")
      group = @@groups.last
      channels = @@free_list[group]
      if channels.nil?
        channels = @@free_list[group] = {}
      end
      channels[channel] = channel
      @@free_list.each do |item|
        Rails.logger.info("show free-list group: #{item}")
        Rails.logger.info("channels in this group: #{@@free_list[item[0]]}")
      end
    ensure
      groups_mutex.release if ((defined? groups_mutex) && !groups_mutex.nil?)
      group_mutex.release if ((defined? group_mutex) && !group_mutex.nil?)
    end
  end
  
  def self.reserve(group)
    begin
      mutex = CacheMutex.new(group, Cache.memcache)
      acquired = mutex.acquire
      Rails.logger.info("reserving group: #{group}")
      @@free_list.each do |item|
        Rails.logger.info("show free-list group: #{item}")
      end
      Rails.logger.info("channels in group(#{group}): #{@@free_list[group]}")
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
class Cache
  @@memcache = nil
  
  def self.set(key, value, exptime = 0)
    @@memcache.set(key, value, exptime)
  end
  
  def self.get(key)
    @@memcache.get(key)
  end
  
  def self.add(key, value, exptime = 0)
    @@memcache.add(key, value, exptime)  
  end
  
  def self.delete(key)
    @@memcache.delete(key)  
  end
  
  def self.memcache=(memcache)
    @@memcache = memcache
  end
  
  def self.memcache
    @@memcache
  end
end
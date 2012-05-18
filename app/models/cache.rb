class Cache
  @@memcache = nil
  
  def self.set(key, value, exptime = 0)
    @@memcache.set(key, HashWithIndifferentAccess[value.attributes], exptime)
  end
  
  def self.get(obj_class, key)
    obj_class.load([@@memcache.get(key)], obj_class.all.query).first
  end
  
  def self.memcache=(memcache)
    @@memcache = memcache
  end
  
  def self.memcache
    @@memcache
  end
end
class Cache
  @@memcache = nil
  
  def self.set(key, value)
    @@memcache.set(key, HashWithIndifferentAccess[value.attributes])
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
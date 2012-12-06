class Cache
  @@memcache = nil
  
  def self.set_obj(key, value, exptime = 0)
    @@memcache.set(key, HashWithIndifferentAccess[value.attributes], exptime)
  end
  
  def self.get_obj(obj_class, key)
    obj_class.load([@@memcache.get(key)], obj_class.all.query).first
  end
  
  def self.add_obj(key, value, exptime = 0)
    @@memcache.add(key, HashWithIndifferentAccess[value.attributes], exptime)  
  end
  
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
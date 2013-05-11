class SmsProvider

  TWILIO = "twilio"
  PLIVO = "plivo"

  @@memcache = nil
  @@current_provider_cache_key = "CurrentProvider"
  
  def self.set_current(value)
    @@memcache.set(@@current_provider_cache_key, value, 0)
  end

  def self.get_current
    @@memcache.get(@@current_provider_cache_key)
  end

  def self.memcache=(memcache)
    @@memcache = memcache
  end

  def self.memcache
    @@memcache
  end
end
memcache = Dalli::Client.new('localhost:11211')
Cache.memcache = memcache
Channel.memcache = memcache
Channel.memcache.set(Channel.count_cache_key, 0)
SmsProvider.memcache = memcache
if SmsProvider.get_current.nil?
  SmsProvider.set_current(SmsProvider::PLIVO)
end
memcache = Dalli::Client.new('localhost:11211')
Cache.memcache = memcache
Channel.memcache = memcache
Channel.memcache.set(Channel.count_cache_key, 0)
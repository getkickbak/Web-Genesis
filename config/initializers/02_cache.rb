memcache = Dalli::Client.new('localhost:11211')
Cache.memcache = memcache

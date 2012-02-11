class CacheMutex
  def initialize(name, memcache)
    @name = name
    # Keep track of if we have to lock to ensure
    # that if lock/unlock is called multiple times it doesn't break anything
    @have_lock = false
    @memcache = memcache
    ObjectSpace.define_finalizer(self, Proc.new{release})
  end

  def acquire
    if @have_lock
      return true
    end
    # Keep trying to add the key to memcache
    # Add returns false if the key is already in memcache
    # Add is our test-and-set operation
    tries = 1
    while not @memcache.add(key, 1)
      if tries >= 3
        raise "Cannot acquire cache mutex(#{@name})"
      end
      # We didn't get the lock, keep trying till we do
      sleep tries
      tries += 1
    end   
    @have_lock = true
    return true
  end

  def release
    if @have_lock
      @memcache.delete(key)
      @have_lock = false
    end  
  end

  def key
    return "LOCK-%s" % @name
  end
end
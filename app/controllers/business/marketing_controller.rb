module Business
  class MarketingController < BaseApplicationController
    before_filter :authenticate_merchant!
    skip_authorization_check
    
    def index
=begin      
      begin
        mutex = CacheMutex.new(current_merchant.cache_key, Cache.memcache)
        mutex.acquire
        Cache.set(current_merchant.cache_key,current_merchant)
        merchant = Cache.get(Merchant,Merchant.get_cache_key(1))
        #mutex.release
      rescue StandardError => e
        respond_to do |format|
          format.html # index.html.erb
          #format.xml  { render :xml => @merchants }
        end  
      ensure
        mutex.release  
      end
=end      
      if current_merchant.status == :pending
        respond_to do |format|
          format.html { redirect_to setup_path }
        end
      else
        @venues = current_merchant.venues
        respond_to do |format|
          format.html # index.html.erb
          #format.xml  { render :xml => @merchants }
        end
      end
    end
  end
end
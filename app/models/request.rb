require 'util/constant'

class Request
  include DataMapper::Resource
    
  Statuses = [:pending, :failed, :complete]
    
  property :id, Serial
  property :type, String, :required => true, :default => ""
  property :frequency1, Integer, :required => true, :default => 0
  property :frequency2, Integer, :required => true, :default => 0
  property :frequency3, Integer, :required => true, :default => 0
  property :latitude, Decimal, :precision => 20, :scale => 15, :required => true, :default => 0
  property :longitude, Decimal, :precision => 20, :scale => 15, :required => true, :default => 0
  property :data, String, :required => true, :default => ""
  property :channel, String, :required => true, :default => ""
  property :status, Enum[:pending, :failed, :complete], :default => :pending
  property :created_ts, DateTime, :default => ::Constant::MIN_TIME
  property :update_ts, DateTime, :default => ::Constant::MIN_TIME
  property :deleted_ts, ParanoidDateTime
  #property :deleted, ParanoidBoolean, :default => false  
  
  def self.create(request_info)
    now = Time.now
    request = Request.new(
      :type => request_info[:type],
      :frequency1 => request_info[:frequency1],
      :frequency2 => request_info[:frequency2],
      :frequency3 => request_info[:frequency3],
      :latitude => request_info[:latitude],
      :longitude => request_info[:longitude],
      :data => request_info[:data],
      :channel => request_info[:channel]
    )
    request[:created_ts] = now
    request[:update_ts] = now
    request.save
    return request
  end
  
  def self.match(request_info)
    if Rails.env == 'production'
      c = lambda {
        return DataMapper.repository(:default).adapter.select(
          "SELECT id, round( 6371000 * acos( cos( radians(?) ) * cos( radians( latitude ) ) * cos( radians( longitude ) - radians(?) ) + sin( radians(?) ) * sin( radians( latitude ) ) ), 1) AS distance
          FROM requests WHERE type = ? AND status = ? AND abs(frequency1 - ?) <= 10 AND abs(frequency2 - ?) <= 10 AND abs(frequency3 - ?) <= 10 AND distance <= 100 AND deleted_ts IS NULL
          ORDER BY distance
          ASC LIMIT 0,1", request_info[:latitude], request_info[:longitude], request_info[:latitude], request_info[:type], Request::Statuses.index(:pending)+1, request_info[:frequency1], request_info[:frequency2], request_info[:frequency3]
        )
      }
    else  
      c = lambda {
        return DataMapper.repository(:default).adapter.select(
          "SELECT id, 0 AS distance
          FROM requests WHERE type = ? AND status = ? AND abs(frequency1 - ?) <= 10 AND abs(frequency2 - ?) <= 10 AND abs(frequency3 - ?) <= 10 AND deleted_ts IS NULL
          ORDER BY id
          DESC LIMIT 0,1", request_info[:type], Request::Statuses.index(:pending)+1, request_info[:frequency1], request_info[:frequency2], request_info[:frequency3]
        )  
      }
    end
    
    n = 50 - 1
    n.times do |x|
      request = c.call
      if request.length > 0
        return Request.get(request[0].id)
      elsif x < n
        sleep(0.2) 
      end
    end  
    return nil    
  end
  
  def self.set_status(request, status)
    if defined? request && request
      request.status = status
      request.save
      c = File.open(request.channel, "w+")
      c.puts status.to_str
      c.flush
    end  
  end
  
  def is_status?(status)
    begin
      timer = Timer.new("one_time",  2) {
        c = File.open(self.channel, "w+")
        c.puts :failed.to_str
        c.flush
      }
      c = File.open(self.channel, "r+")
      r = c.gets 
      timer.cancel
    ensure
      Channel.free(self.channel)
      if (defined? r) && r
        r.to_sym == status ? true : false
      else
        return false
      end    
    end  
  end
  
=begin  
  def is_status?(status)
    c = lambda {
      return DataMapper.repository(:default).adapter.select(
        "SELECT status from requests WHERE id = ? AND deleted_ts IS NULL", self.id
      )
    }
    
    n = 10 - 1
    n.times do |x|
      r = c.call
      if r.length > 0 && r[0] != Request::Statuses.index(:pending)+1 
        if r[0] == Request::Statuses.index(status)+1
          return true
        end    
      elsif x < n
        sleep(0.2)
      end
    end
    return false 
  end
=end  
end
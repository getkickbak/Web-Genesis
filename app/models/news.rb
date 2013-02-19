class News
  attr_accessor :type, :item_id, :item_type, :title, :photo, :text
  
  def initialize(hash)
    hash.keys.each do |key|
      m = "#{key}="
      self.send( m, hash[key] ) if self.respond_to?( m )
    end
  end
end
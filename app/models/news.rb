class News
  attr_accessor :type, :item_id, :item_type, :title, :text
  
  def initialize(hash)
    hash.keys.each do |key|
      m = "#{key}="
      obj.send( m, hash[key] ) if obj.respond_to?( m )
    end
  end
end
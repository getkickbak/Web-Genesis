class FacebookPost
  attr_accessor :type, :message, :picture, :link_name, :link, :caption, :description
  
  def initialize(hash)
    hash.keys.each do |key|
      m = "#{key}="
      obj.send( m, hash[key] ) if obj.respond_to?( m )
    end
  end
end
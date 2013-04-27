class FacebookPost
  attr_accessor :type, :message, :picture, :link_name, :link, :caption, :description, :page_id
  
  def initialize(hash)
    hash.keys.each do |key|
      m = "#{key}="
      self.send( m, hash[key] ) if self.respond_to?( m )
    end
  end
end
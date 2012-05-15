module Math
  
  def self.radians(degrees)
    degrees * Math::PI / 180
  end
  
  def self.rand_hexstring(length=8)
    ((0..length).map{rand(256).chr}*"").unpack("H*")[0][0,length]
  end
end
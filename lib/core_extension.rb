class String
  def self.random_alphanumeric(size=16)
    s = ""
    size.times { s << (i = Kernel.rand(62); i += ((i < 10) ? 48 : ((i < 36) ? 55 : 61 ))).chr }
    s
  end

  def to_bool
    return true if self == true || self =~ (/(true|t|yes|y|1)$/i)
    return false if self == false || self.blank? || self =~ (/(false|f|no|n|0)$/i)
    raise ArgumentError.new("invalid value for Boolean: \"#{self}\"")
  end

  def prepend_a_or_an(options = {})
    params = {}
    if options && options[:caps]
      params[:a] = "A"
      params[:an] = "An"
    else
      params[:a] = "a"
      params[:an] = "an"
    end
    %w(a e i o u).include?(downcase.first) ? "#{params[:an]} #{self}" : "#{params[:a]} #{self}"
  end
end

class BigDecimal
  def as_json(options = nil) self end
end
class Domain
  def self.matches?(request)
    !request.subdomain.present? || request.subdomain == 'www' || request.subdomain == 'm'
  end
end
class Domain
  def self.matches?(request)
    !request.subdomain.present? || request.subdomain == 'www' || request.subdomain == 'dev'
  end
end
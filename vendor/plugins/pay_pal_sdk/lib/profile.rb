# The module has a class which holds merchant's API credentials and PayPal endpoint information.
require 'socket'

module PayPalSDKProfiles
  class Profile
    cattr_accessor :headers
    cattr_accessor :endpoints
    cattr_accessor :client_info
    cattr_accessor :proxy_info
    cattr_accessor :DEV_CENTRAL_URL
    cattr_accessor :client_details
    cattr_accessor :PAYPAL_REDIRECT_URL

    ADAPTIVE_SERVICE_PAY = "/AdaptivePayments/Pay"
    ADAPTIVE_SERVICE_PAYMENT_DETAILS = "/AdaptivePayments/PaymentDetails"

    #Developer central URL
    @@DEV_CENTRAL_URL="https://developer.paypal.com"
    ###############################################################################################################################
    #    NOTE: Production code should NEVER expose API credentials in any way! They must be managed securely in your application.
    #    To generate a Sandbox API Certificate, follow these steps: https://www.paypal.com/IntegrationCenter/ic_certificate.html
    ###############################################################################################################################
    # specify the 3-token values.
    @@headers = {"X-PAYPAL-SERVICE-VERSION" => "1.0.0", "X-PAYPAL-SECURITY-USERID" => nil, "X-PAYPAL-SECURITY-PASSWORD" => nil, "X-PAYPAL-SECURITY-SIGNATURE" => nil, "X-PAYPAL-APPLICATION-ID" => nil, "X-PAYPAL-DEVICE-IPADDRESS"=> nil, "X-PAYPAL-REQUEST-DATA-FORMAT" => "NV", "X-PAYPAL-RESPONSE-DATA-FORMAT" => "NV"}

    # endpoint of PayPal server against which call will be made.
    @@endpoints = {"SERVER" => nil, "PORT" => "443"}

    #Client details to be send in request
    @@client_details ={"ipAddress" => nil, "deviceId" => nil, "applicationId" => nil}

    # Proxy information of the client environment.
    @@proxy_info = {"USE_PROXY" => false, "ADDRESS" => nil, "PORT" => "443", "USER" => nil, "PASSWORD" => nil}

    # Information needed for tracking purposes.
    @@client_info = {"VERSION" => nil, "SOURCE" => nil}

    def self.load_config(config)
      @@config = config
      @@PAYPAL_REDIRECT_URL = @@config["REDIRECT_URL"]
      @@headers["X-PAYPAL-SECURITY-USERID"] = @@config["USER"]
      @@headers["X-PAYPAL-SECURITY-PASSWORD"] = @@config["PASSWORD"]
      @@headers["X-PAYPAL-SECURITY-SIGNATURE"] = @@config["SIGNATURE"]
      @@headers["X-PAYPAL-APPLICATION-ID"] = @@config["APPLICATION_ID"]
      @@headers["X-PAYPAL-DEVICE-IPADDRESS"] = @@config["IP_ADDRESS"]
      @@endpoints["SERVER"] = @@config["API_SERVER"]
      @@client_details["ipAddress"] = @@config["IP_ADDRESS"]
      @@client_details["applicationId"] = @@config["APPLICATION_ID"]
      @@proxy_info["USE_PROXY"] = @@config["USE_PROXY"]
      @@client_info["SOURCE"] = @@config["SOURCE"]
    end

  end

end


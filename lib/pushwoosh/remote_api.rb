module Pushwoosh
  class RemoteApi
    def initialize  
    end
    
    def create_message(message, time, device_list)
      service = "createMessage"
      body ={
        "request" => {
          "application" => APP["PUSHWOOSH_APP_CODE"],
          "username" => APP["PUSHWOOSH_LOGIN"],
          "password" => APP["PUSHWOOSH_PASSWORD"],
          "notifications" => [
            {
              #"send_date" => time || "now",
              "send_date" => "now",
              "content" => {
                "en" => message
              },
              #"page_id" => 39,
              #"link" => "http://google.com",
              #"data" => {
              #  "custom" => "json data"
              #},
              #"wp_type" => "Tile",
              #"wp_background" => "image.png",
              #"wp_count" => 3,
              "ios_badges" => 1,
              #"ios_sound" => "soundfile",
              #"android_sound" => "soundfile",
              "devices" => device_list
            }
          ]
        }
      }.to_json
      call_api(path, body)
    end
    
    def register_device(device_id, device_type, hw_id)
      service = "/registerDevice"
      body = {
        "request" => {
          "application" => APP["PUSHWOOSH_APP_CODE"],
          "device_id" => device_id,
          "language" => "en",
          "hw_id" => hw_id,
          #"timezone" => 3600,
          "device_type" => device_type
        }
      }.to_json
      call_api(path, body)
    end
    
    def unregister_device(device_id, device_type)
      service = "unregisterDevice"
      body = {
        "request" => {
          "application" => APP["PUSHWOOSH_APP_CODE"],
          "device_id" => device_id,
          "device_type" => device_type
        }
      }.to_json
      call_api(service, body)
    end
    
    private
    
    def call_api(service, body)
      uri = URI.parse("https://cp.pushwoosh.com/json/1.2/#{service}")
      https = Net::HTTP.new(uri.host,uri.port)
      https.verify_mode = OpenSSL::SSL::VERIFY_NONE #unless ssl_strict
      https.use_ssl = true
      request = Net::HTTP::Post.new(uri.path, initheader = {'Content-Type' =>'application/json'})
      request.body = body
      response = https.request(req)
      raise "HTTP error: #{response.code}" unless response.code == "200"
      transaction = Transaction.new(service, response.body)
    end  
  end
  
  class Transaction
    def initialize(service, data)
      case service
      when "createMessage", "unregisterDevice"
        @success = data["status_code"] == "200"
      when "registerDevice"
        @success = data["status_code"] == "103"  
      end
      @response = data
    end

    def success?
      @success
    end

    def response
      @response
    end
  end
end
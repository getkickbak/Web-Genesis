class Business::Api::V1::BaseApplicationController < ApplicationController
  around_filter :global_request_logging

  def global_request_logging 
    begin 
      yield 
    ensure 
      logger.debug("Response: #{response.body}") if response.body.length > 0
    end 
  end 
end
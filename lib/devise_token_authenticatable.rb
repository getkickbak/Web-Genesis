require 'devise/strategies/base'
require 'devise/strategies/token_authenticatable'

module Devise
  module Strategies
    # Strategy for signing in a user, based on a authenticatable token. This works for both params
    # and http. For the former, all you need to do is to pass the params in the URL:
    #
    #   http://myapp.example.com/?user_token=SECRET
    #
    # For HTTP, you can pass the token as username and blank password. Since some clients may require
    # a password, you can pass "X" as password and it will simply be ignored.
    class TokenAuthenticatable < Authenticatable

      def authenticate!
        resource = mapping.to.find_for_token_authentication(authentication_hash)
        return fail(:invalid_token) unless resource

        if validate(resource)
          if params[:sid]
            staff = Staff.get(params[:sid])
            if staff && staff.role == "admin"
              session[:is_admin] = true
            end
          end
          resource.after_token_authentication
          success!(resource)
        end
      end
    end
  end
end
class UserDevise::PasswordsController < Devise::PasswordsController
  def new
    # Prevent users from using devise for now
    raise ActionController::RoutingError.new("Not Found")
  end

  def create
    # Prevent users from using devise for now
    raise ActionController::RoutingError.new("Not Found")
  end

  def edit
    # Prevent users from using devise for now
    raise ActionController::RoutingError.new("Not Found")
  end

  def update
    # Prevent users from using devise for now
    raise ActionController::RoutingError.new("Not Found")
  end
end

class UserDevise::PasswordsController < Devise::PasswordsController
  def new
    # Prevent users from using devise for now
    raise ActionController::RoutingError.new
  end

  def create
    # Prevent users from using devise for now
    raise ActionController::RoutingError.new
  end

  def edit
    # Prevent users from using devise for now
    raise ActionController::RoutingError.new
  end

  def update
    # Prevent users from using devise for now
    raise ActionController::RoutingError.new
  end
end

require 'singleton'

class FriendshipService
  include Singleton
    
  def add_friend(user, friend)
    user.add_friend(friend)
  end
  
  def remove_friend(user, friend)
    user.remove_friend(friend)
  end
  
end
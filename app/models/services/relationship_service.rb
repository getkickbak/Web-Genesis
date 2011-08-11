require 'singleton'

class RelationshipService
  include Singleton
  
  def follow(user, others)
    user.follow(others)
  end
  
  def unfollow(user, others)
    user.unfollow(others)
  end
  
end
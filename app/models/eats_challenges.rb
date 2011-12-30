class EatsChallenges
  @@default_challenge_types = [
      ["Menu", "menu"],
      ["Check-In", "checkin"],
      ["Picture", "picture"],
      ["Referral", "referral"],
      ["Birthday", "birthday"],
      ["Custom", "custom"]
    ]
    
  @@default_challenges = {
      "menu" =>
      {
        :type => "menu",
        :name => "Menu",
        :description => "",
        :require_verif => true
      },
      "checkin" =>
      {
        :type => "checkin",
        :name => "Check-In",
        :description => "",
        :data => CheckInData.new,
        :require_verif => false
      },
      "picture" =>
      {
        :type => "picture",
        :name => "Picture",
        :description => "",
        :require_verif => false
      },
      "referral" =>
      {
        :type => "referral",
        :title => "Buddy",
        :description => "",
        :require_verif => false
      },
      "birthday" =>
      {
        :type => "birthday",
        :name => "Birthday",
        :description => "",
        :require_verif => false
      },
      "custom" =>
      {
        :type => "custom",
        :name => "Custom",
        :description => "",
        :require_verif => true
      }
    }
    
  def self.default_challenge_types
    @@default_challenge_types
  end
  
  def self.default_challenges
    @@default_challenges
  end
end
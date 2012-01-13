class EatsChallenges
  @@default_challenge_types = [
      ["Menu", "menu"],
      ["Check-In", "checkin"],
      ["Picture", "picture"],
      ["Referral", "referral"],
      ["Birthday", "birthday"],
      ["Lottery", "lottery"],
      ["Custom", "custom"]
    ]
  @@default_challenge_type_to_name = {
      "menu" => "Menu",
      "checkin" => "Check-In",
      "picture" => "Picture",
      "referral" => "Referral",
      "birthday" => "Birthday",
      "lottery" => "Lottery",
      "custom" => "Custom"
    }  
  @@default_challenges = {
      "menu" =>
      {
        :type => "menu",
        :name => "Menu",
        :description => "test",
        :require_verif => true
      },
      "checkin" =>
      {
        :type => "checkin",
        :name => "Check-In",
        :description => "test",
        :data => CheckInData.new,
        :require_verif => false
      },
      "picture" =>
      {
        :type => "picture",
        :name => "Picture",
        :description => "test",
        :require_verif => false
      },
      "referral" =>
      {
        :type => "referral",
        :title => "Buddy",
        :description => "test",
        :require_verif => false
      },
      "birthday" =>
      {
        :type => "birthday",
        :name => "Birthday",
        :description => "test",
        :require_verif => false
      },
      "lottery" =>
      {
        :type => "lottery",
        :name => "Lottery",
        :description => "test",
        :data => LotteryData.new,
        :require_verif => true
      },
      "custom" =>
      {
        :type => "custom",
        :name => "Custom",
        :description => "",
        :require_verif => true
      }
    }
  
  def self.default_challenges
    @@default_challenges
  end
  
  def self.default_challenge_types
    @@default_challenge_types
  end
  
  def self.default_challenge_type_to_name
    @@default_challenge_type_to_name
  end
end
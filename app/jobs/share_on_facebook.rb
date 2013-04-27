module ShareOnFacebook
  @queue = :share_on_facebook
  
  EARN_POINTS = "earn_poinsts"
  REDEEM = "redeem"
  
  def self.logger
    @logger ||= Logger.new("#{Rails.root}/log/share_on_facebook.log")
  end

  def self.perform(user_id, venue_id, type, posts)
    begin
      Customer.transaction do
        @posts = JSON.parse(posts, { :symbolize_names => true })
        @user = User.get(user_id)
        @venue = Venue.get(venue_id)
        @customer = Customer.first(:merchant => @venue.merchant, :user => @user)
        challenge_type_id = ChallengeType.value_to_id["facebook"]
        @challenge = Challenge.first(:challenge_to_type => { :challenge_type_id => challenge_type_id }, :challenge_venues => { :venue_id => @venue.id })
        if @user.facebook_share_settings.nil?
          FacebookShareSettings.create(@user)
        end
        success_posts = Common.connect_to_facebook(@user, @posts)
        if ((type == ShareOnFacebook::EARN_POINTS) && (@customer.visits % 3 > 0) || (type == ShareOnFacebook::REDEEM)) && success_posts > 0
          now = Time.now
          points = @challenge.points * success_posts
          facebook_reward_record = EarnRewardRecord.new(
            :type => :challenge,
            :ref_id => @challenge.id,
            :venue_id => @venue.id,
            :data => "",
            :data_expiry_ts => ::Constant::MIN_TIME,
            :points => points,
            :created_ts => now,
            :update_ts => now
          )
          facebook_reward_record.merchant = @venue.merchant
          facebook_reward_record.customer = @customer
          facebook_reward_record.user = @user
          facebook_reward_record.save
          facebook_trans_record = TransactionRecord.new(
            :type => :earn_points,
            :ref_id => facebook_reward_record.id,
            :description => @challenge.name,
            :points => points,
            :created_ts => now,
            :update_ts => now
          )
          facebook_trans_record.merchant = @venue.merchant
          facebook_trans_record.customer = @customer
          facebook_trans_record.user = @user
          facebook_trans_record.save
          @customer.points += points
          @customer.save
        end
      end
    rescue Koala::Facebook::APIError => e
      if e.fb_error_type == "OAuthException" && e.fb_error_code == "190" && (eb.fb_error_subcode == "460" || eb.fb_error_subcode == "463")
        UserMailer.facebook_token_expired_email(@user)
      end
      now = Time.now
      logger.error("Exception: " + e.message)
      logger.info("Share on Facebook failed for User(#{user_id}) at #{now.strftime("%a %m/%d/%y %H:%M %Z")}")
    rescue DataMapper::SaveFailureError => e
      now = Time.now
      logger.error("Exception: " + e.resource.errors.inspect)
      logger.info("Share on Facebook failed for User(#{user_id}) at #{now.strftime("%a %m/%d/%y %H:%M %Z")}")
    rescue StandardError => e
      now = Time.now
      logger.error("Exception: " + e.message)
      logger.info("Share on Facebook failed for User(#{user_id}) at #{now.strftime("%a %m/%d/%y %H:%M %Z")}")
    end
  end
end
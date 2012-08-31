module UpdateMerchantBadges
  @queue = :update_merchant_badges
  
  def self.logger
    @logger ||= Logger.new("#{Rails.root}/log/update_merchant_batches.log")
  end

  def self.perform()
    now = Time.now
    logger.info("Update Merchant Badges started at #{now.strftime("%a %m/%d/%y %H:%M %Z")}")
    merchants = Merchant.all(:custom_badges => false, :status => :active)
    merchants.each do |merchant|
      badges = merchant.badges.sort_by { |b| b.rank }
      badge_ids = []
      badges.each do |badge|
        badge_ids << badge.id
      end
      badge_id_to_type_id = {}
      badge_to_types = BadgeToType.all(:fields => [:badge_id, :badge_type_id], :badge_id => badge_ids)
      badge_to_types.each do |badge_to_type|
        badge_id_to_type_id[badge_to_type.badge_id] = badge_to_type.badge_type_id
      end
      badges.each do |badge|
        badge.eager_load_type = BadgeType.id_to_type[badge_id_to_type_id[badge.id]]
      end
      badge_types = BadgeType.all(:merchant_type_id => merchant.type.id, :order => [:rank.asc])
      badges_size = badges.length
      for i in 0..badge_types.length-1
        badge_type = badge_types[i]
        if i <= badges_size-1
          badge = badge[i]
          badge.visits = BadgeType.visits[merchant.visit_frequency.value][badge_type.value]
          if badge.eager_load_type.id != badge_type.id
            badge.type.destroy
            badge.type = badge_type
            badge.eager_load_type = badge_type
            badge.update_ts = now
          end
        else  
          badge = Badge.new(:custom => false, :visits => BadgeType.visits[merchant.visit_frequency.value][badge_type.value])
          badge[:created_ts] = now
          badge[:update_ts] = now
          badge.type = badge_type
          badges.concat(badge)
        end
      end
      merchant.update_badges_ts = now
      merchant.update_ts = now
      merchant.save
    end
    now = Time.now
    logger.info("Update Merchant Badges completed successfully at #{now.strftime("%a %m/%d/%y %H:%M %Z")}")
  end
end
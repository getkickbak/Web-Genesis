module Business
  class BadgesController < BaseApplicationController
    before_filter :authenticate_merchant!
    
    def index
      authorize! :read, Badge
      
      @badges = current_merchant.badges.sort_by { |b| b.rank }
      badge_ids = []
      @badges.each do |badge|
        badge_ids << badge.id
      end
      badge_id_to_type_id = {}
      badge_to_types = BadgeToType.all(:fields => [:badge_id, :badge_type_id], :badge_id => badge_ids)
      badge_to_types.each do |badge_to_type|
        badge_id_to_type_id[badge_to_type.badge_id] = badge_to_type.badge_type_id
      end
      @badges.each do |badge|
        badge.eager_load_type = BadgeType.id_to_type[badge_id_type_id[badge.id]]
      end

      respond_to do |format|
        format.html # index.html.erb
      #format.xml  { render :xml => @merchants }
      end
    end
  end
end
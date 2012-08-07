module Business
  class BadgesController < BaseApplicationController
    before_filter :authenticate_merchant!
    
    def index
      authorize! :read, Badge
      
      @badges = current_merchant.badges.sort_by { |b| b.rank }
      if !current_merchant.custom_badges
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
      end  

      respond_to do |format|
        format.html # index.html.erb
      #format.xml  { render :xml => @merchants }
      end
    end
    
    def new
      
    end
    
    def create_badges
      authorize! :create, Badge
      
      begin
        Badge.transaction do
          now = Time.now
          badges = []
          merchant_badge_types = MerchantBadgeType.all(MerchantBadgeType.merchant.id => current_merchant.id)
          merchant_badge_types.each do |merchant_badge_type|
            badge = Badge.new(:custom => true, :visits => 0)
            badge[:created_ts] = now
            badge[:update_ts] = now
            badge.custom_type = merchant_badge_type
            badge.save
            badges << badge
          end
          current_merchant.badges.concat(badges)
          current_merchant.save
          respond_to do |format|
            format.html { redirect_to challenges_path(:notice => t("business.badges.create_many_success")) }
          #format.xml  { render :xml => @deal, :status => :created, :location => @deal }
          #format.json { render :json => { :success => true, :data => @deal, :total => 1 } }
          end
        end
      rescue DataMapper::SaveFailureError => e
        logger.error("Exception: " + e.resource.errors.inspect)
        respond_to do |format|
          format.html { render :action => "index" }
          #format.xml  { render :xml => @order.errors, :status => :unprocessable_entity }
          #format.json { render :json => { :success => false } }
        end
      end
    end
  end
end
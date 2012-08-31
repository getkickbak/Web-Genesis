module Business
  class BadgesController < BaseApplicationController
    before_filter :authenticate_merchant!
    
    def index
      authorize! :read, Badge
     
      @badges = Common.populate_badges(current_merchant, request.env['HTTP_USER_AGENT'])  

      respond_to do |format|
        format.html # index.html.erb
      #format.xml  { render :xml => @merchants }
      end
    end
    
    def create_custom_badges
      authorize! :create, Badge
      
      begin
        Badge.transaction do
          if current_merchant.custom_badges
            now = Time.now
            merchant_badge_types = MerchantBadgeType.all(MerchantBadgeType.merchant.id => current_merchant.id, :order => [:rank.asc])
            badges = current_merchant.badges.sort_by { |b| b.rank }
            badges_size = badges.length
            if merchant_badges_types.length >= current_merchant.badges.length
              for i in 0..merchant_badge_types.length-1
                merchant_badge_type = merchant_badge_types[i]
                if i <= badges_size-1
                  badge = badge[i]
                  badge.custom = true
                  badge.type.destroy
                  badge.custom_type = merchant_badge_type
                  badge.update_ts = now
                else  
                  badge = Badge.new(:custom => true, :visits => 0)
                  badge[:created_ts] = now
                  badge[:update_ts] = now
                  badge.custom_type = merchant_badge_type
                  badges.concat(badge)
                end
              end
              current_merchant.badges_update_ts = now
              current_merchant.udpate_ts = now
              current_merchant.save
              respond_to do |format|
                format.html { redirect_to badges_path(:notice => t("business.badges.create_custom_badges_success")) }
              #format.xml  { render :xml => @deal, :status => :created, :location => @deal }
              #format.json { render :json => { :success => true, :data => @deal, :total => 1 } }
              end
            else
              respond_to do |format|
                format.html { redirect_to badges_path(:alert => t("business.badges.too_few_custom_badges")) }
              #format.xml  { render :xml => @deal, :status => :created, :location => @deal }
              #format.json { render :json => { :success => true, :data => @deal, :total => 1 } }
              end
            end
          else
            respond_to do |format|
              format.html { redirect_to badges_path(:alert => t("business.badges.not_in_custom_badge_mode")) }
            #format.xml  { render :xml => @deal, :status => :created, :location => @deal }
            #format.json { render :json => { :success => true, :data => @deal, :total => 1 } }
            end
          end
        end
      rescue DataMapper::SaveFailureError => e
        logger.error("Exception: " + e.resource.errors.inspect)
        flash[:alert] = t("business.badges.create_custom_badges_failure")
        @merchant = current_merchant
        @merchant.badges = Common.populate_badges(current_merchant, request.env['HTTP_USER_AGENT'])
        respond_to do |format|
          format.html { render :action => "index" }
          #format.xml  { render :xml => @order.errors, :status => :unprocessable_entity }
          #format.json { render :json => { :success => false } }
        end
      end
    end
    
    def edit
      authorize! :update, Badge
            
      @merchant = current_merchant
      @merchant.badges = Common.populate_badges(current_merchant, request.env['HTTP_USER_AGENT'])  

      respond_to do |format|
        format.html # index.html.erb
      #format.xml  { render :xml => @merchants }
      end
    end
    
    def update_badges
      authorize! :update, Badge
      
      @merchant = current_merchant
      @merchant.badges = Common.populate_badges(current_merchant, request.env['HTTP_USER_AGENT'])
      
      begin
        Badge.transaction do
          current_merchant.badges_attributes = params[:merchant][:badges_attributes]
          now = Time.now
          current_merchant.badges_update_ts = now
          current_merchant.update_ts = now
          current_merchant.save
          respond_to do |format|
            format.html { redirect_to badges_path(:notice => t("business.badges.update_success")) }
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
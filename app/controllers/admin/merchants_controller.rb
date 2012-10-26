module Admin
  class MerchantsController < Admin::BaseApplicationController
    before_filter :authenticate_staff!
    
    def index
      authorize! :read, Merchant

      @merchants = Merchant.all(:order => [:created_ts.desc]).paginate(:page => params[:page])

      respond_to do |format|
        format.html # index.html.erb
      #format.xml  { render :xml => @merchants }
      end
    end

    def show
      @merchant = Merchant.get(params[:id]) || not_found
      authorize! :read, @merchant

      respond_to do |format|
        format.html # show.html.erb
      #format.xml  { render :xml => @merchant }
      end
    end

    def new
      authorize! :create, Merchant
      @merchant = Merchant.new

      respond_to do |format|
        format.html # new.html.erb
      #format.xml  { render :xml => @merchant }
      end
    end

    def edit
      @merchant = Merchant.get(params[:id]) || not_found
      authorize! :update, @merchant
      
      @merchant.type_id = @merchant.type.id
      if @merchant.will_terminate && @customer_reward.termination_date < Date.today
        @customer_reward.termination_date = Date.today
      end
    end

    def create
      authorize! :create, Merchant

      begin
        Merchant.transaction do
          now = Time.now
          params[:merchant][:status] = :pending
          params[:merchant][:will_terminate] = false
          params[:merchant][:custom_badges] = false
          type = MerchantType.get(params[:merchant][:type_id])
          visit_frequency = VisitFrequencyType.get(params[:merchant][:visit_frequency_id])
          params[:merchant][:reward_terms] = I18n.t 'customer_reward.terms'
          @merchant = Merchant.create(type, visit_frequency, params[:merchant])
          if !@merchant.custom_badges
            badges = []
            badge_types = BadgeType.all(:merchant_type_id => @merchant.type.id)
            badge_types.each do |badge_type|
              badge = Badge.new(:custom => false, :visits => BadgeType.visits[@merchant.visit_frequency.value][badge_type.value])
              badge[:created_ts] = now
              badge[:update_ts] = now
              badge.type = badge_type
              badge.save
              badges << badge
            end  
            @merchant.badges.concat(badges)
            @merchant.save
          end
          respond_to do |format|
            format.html { redirect_to(merchant_path(@merchant), :notice => t("admin.merchants.create_success")) }
          #format.xml  { render :xml => @merchant, :status => :created, :location => @merchant }
          end
        end
      rescue DataMapper::SaveFailureError => e
        logger.error("Exception: " + e.resource.errors.inspect)
        @merchant = e.resource
        @merchant.type_id = params[:merchant][:type_id]
        respond_to do |format|
          format.html { render :action => "new" }
          #format.xml  { render :xml => @merchant.errors, :status => :unprocessable_entity }
        end
      end    
    end

    def update
      @merchant = Merchant.get(params[:id]) || not_found
      authorize! :update, @merchant

      begin
        Merchant.transaction do
          previous_status = @merchant.status
          params[:merchant][:custom_badges] = false
          type = MerchantType.get(params[:merchant][:type_id])
          @merchant.update_all(type, @merchant.visit_frequency, params[:merchant])
          if @merchant.status != previous_status && previous_status == :active
            new_password = String.random_alphanumeric(8)
            @merchant.reset_password!(new_password, new_password)
            @merchant.reset_authentication_token!
            DataMapper.repository(:default).adapter.execute(
              "UPDATE venues SET status = ? WHERE merchant_id = ?", Merchant::Statuses.index(@merchant.status)+1, @merchant.id
            )
            DataMapper.repository(:default).adapter.execute(
              "UPDATE customers SET status = ? WHERE merchant_id = ?", Merchant::Statuses.index(@merchant.status)+1, @merchant.id
            )
          end
          respond_to do |format|
            format.html { redirect_to(merchant_path(@merchant), :notice => t("admin.merchants.update_success")) }
          #format.xml  { head :ok }
          end
        end
      rescue DataMapper::SaveFailureError => e
        logger.error("Exception: " + e.resource.errors.inspect)
        @merchant = e.resource
        @merchant.type_id = params[:merchant][:type_id]
        respond_to do |format|
          format.html { render :action => "edit" }
          #format.xml  { render :xml => @merchant.errors, :status => :unprocessable_entity }
        end
      end    
    end

    def destroy
      @merchant = Merchant.get(params[:id]) || not_found
      authorize! :destroy, @merchant

      @merchant.destroy

      respond_to do |format|
        format.html { redirect_to(merchants_url) }
      #format.xml  { head :ok }
      end
    end
  end
end
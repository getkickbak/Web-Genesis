class DashboardController < ApplicationController
  before_filter :authenticate_user!
  
  def index
    authorize! :read, current_user
    
    @user_tag = UserTag.new
    get_customers_info
    respond_to do |format|
      format.html # index.html.erb
    #format.xml  { render :xml => @users }
    end
  end

  def register_tag
    authorize! :update, current_user

    tag_id = params[:user_tag][:tag_id].strip
    begin
      User.transaction do
        now = Time.now
        @tag = UserTag.first(:tag_id => tag_id)
        if @tag.nil?
          @user_tag = UserTag.new(:tag_id => tag_id)
          @user_tag.errors.add(:tag_id, t("users.invalid_tag"))
          raise DataMapper::SaveFailureError.new("", @user_tag)
        end
        if @tag.status == :active || !@tag.status == :virtual
          @user_tag = UserTag.new(:tag_id => tag_id)
          @user_tag.errors.add(:tag_id, t("users.tag_already_in_use_failure"))
          raise DataMapper::SaveFailureError.new("", @user_tag)
        end
        user_to_tag = UserToTag.first(:fields => [:user_id], :user_tag_id => @tag.id)
        if not user_to_tag.nil?
          user = User.get(user_to_tag.user_id)
          if user && user.status == :pending
            current_merchant_ids = []
            merchant_id_to_customer_id = {}
            current_customers_info = Customer.all(:fields => [:id, :merchant_id], :user => current_user, :status => :active)
            current_customers_info.each do |current_customer_info|
              current_merchant_ids << current_customer_info.merchant_id
              merchant_id_to_customer_id[customer_info.merchant_id] = current_customer_info.id
            end
            current_merchants = Merchant.all(:id => current_merchant_ids)
            customer_id_to_merchant = {}
            current_merchants.each do |current_merchant|
              customer_id_to_merchant[merchant_id_to_customer_id[current_merchant.id]] = current_merchant
            end
            current_customers = Customer.all(:user => current_user, :status => :active)
            merchant_id_to_current_customer = {}
            current_merchant_ids = []
            current_customers.each do |current_customer|
              merchant_id_to_current_customer[customer_id_to_merchant[current_customer.id].id] = current_customer
            end
            customers_info = Customer.all(:fields => [:id, :merchant_id], :user=> user, :status => :active)
            merchant_ids = []
            customers_info.each do |customer_info|
              merchant_ids << customer_info.merchant_id
              merchant_id_to_customer_id[customer_info.merchant_id] = customer_info.id
            end
            merchants = Merchant.all(:id => merchant_ids)
            merchants.each do |merchant|
              customer_id_to_merchant[merchant_id_to_customer_id[merchant.id]] = merchant
            end
            customers = Customer.all(:user => user, :status => :active)
            merge_customers = customers.all(:merchant_id => current_merchant_ids)
            merge_customers.each do |merge_customer|
              customer = merchant_id_to_current_customer[customer_id_to_merchant[merge_customer.id].id]
              customer.points += merge_customer.points
              customer.prize_points += merge_customer.prize_points
              customer.visits += merge_customer.visits
              badges = customer_id_to_merchant[customer.id].badges
              customer.badge, customer.next_badge_visits = Common.find_badge(badges.to_a, customer.visits)
              customer.badge_reset_ts = now
              customer_rewards = CustomerReward.all(:merchant => customer_id_to_merchant[customer.id])
              rewards = customer_rewards.all(:mode => :reward)
              prizes = customer_rewards.all(:mode => :prize)
              eligible_for_reward = !Common.find_eligible_reward(rewards.to_a, customer.points).nil?
              eligible_for_prize = !Common.find_eligible_reward(prizes.to_a, customer.prize_points).nil?
              customer.eligible_for_reward = eligible_for_reward
              customer.eligible_for_prize = eligible_for_prize
              customer.update_ts = now
              customer.save
              DataMapper.repository(:default).adapter.execute(
                "UPDATE earn_reward_records 
                SET user_id = ?, customer_id = ?
                WHERE user_id = ? AND customer_id = ?", current_user.id, customer.id, user.id, merge_customer.id
              )
              DataMapper.repository(:default).adapter.execute(
                "UPDATE earn_prize_records 
                SET user_id = ?, customer_id = ?
                WHERE user_id = ? AND customer_id = ?", current_user.id, customer.id, user.id, merge_customer.id
              )
              DataMapper.repository(:default).adapter.execute(
                "UPDATE transaction_records 
                SET user_id = ?, customer_id = ?
                WHERE user_id = ? AND customer_id = ?", current_user.id, customer.id, user.id, merge_customer.id
              )
            end
            add_customers = customers - merge_customers
            add_customers.each do |add_customer|
              customer = Customer.create(customer_id_to_merchant[add_customer.id], current_user)
              customer.points = add_customer.points
              customer.prize_points = add_customer.prize_points
              customer.visits = add_customer.visits
              badges = customer.merchant.badges
              customer.badge, customer.next_badge_visits = Common.find_badge(badges.to_a, customer.visits)
              customer.badge_reset_ts = now
              customer_rewards = CustomerReward.all(:merchant => customer.merchant)
              rewards = customer_rewards.all(:mode => :reward)
              prizes = customer_rewards.all(:mode => :prize)
              eligible_for_reward = !Common.find_eligible_reward(rewards.to_a, customer.points).nil?
              eligible_for_prize = !Common.find_eligible_reward(prizes.to_a, customer.prize_points).nil?
              customer.eligible_for_reward = eligible_for_reward
              customer.eligible_for_prize = eligible_for_prize
              customer.update_ts = now
              customer.save
              DataMapper.repository(:default).adapter.execute(
                "UPDATE earn_reward_records 
                SET user_id = ?, customer_id = ?
                WHERE user_id = ? AND customer_id = ?", current_user.id, customer.id, user.id, add_customer.id
              )
              DataMapper.repository(:default).adapter.execute(
                "UPDATE earn_prize_records 
                SET user_id = ?, customer_id = ?
                WHERE user_id = ? AND customer_id = ?", current_user.id, customer.id, user.id, add_customer.id
              )
              DataMapper.repository(:default).adapter.execute(
                "UPDATE transaction_records 
                SET user_id = ?, customer_id = ?
                WHERE user_id = ? AND customer_id = ?", current_user.id, customer.id, user.id, add_customer.id
              )
            end
            customers.destroy
            user.destroy
          else
            @user_tag = UserTag.new(:tag_id => tag_id)
            @user_tag.errors.add(:tag_id, t("users.tag_already_in_use_failure"))
            raise DataMapper::SaveFailureError.new("", @user_tag)
          end
        end
        current_user.register_tag(@tag)
        respond_to do |format|
          format.html { redirect_to({:action => "index"}, {:notice => t("users.register_tag_success")}) }
          #format.xml  { render :xml => @merchant.errors, :status => :unprocessable_entity }
        end
      end
    rescue DataMapper::SaveFailureError => e
      logger.error("Exception: " + e.resource.errors.inspect)
      @user_tag = UserTag.new(:tag_id => tag_id) if @user_tag.nil?
      get_customers_info
      flash[:error] = t("users.register_tag_failure") if @user_tag.errors.empty?
      respond_to do |format|
        format.html { render :action => "index" }
        #format.xml  { render :xml => @merchant.errors, :status => :unprocessable_entity }
      end
    end
  end 
  
  def deregister_tag
    @tag = UserTag.get(params[:id]) || not_found
    authorize! :update, current_user

    begin
      User.transaction do
        current_user.deregister_tag(@tag)

        respond_to do |format|
          format.html { redirect_to(dashboard_url) }
          #format.xml  { head :ok }
        end
      end
    rescue DataMapper::SaveFailureError => e
      logger.error("Exception: " + e.resource.errors.inspect)
      @user_tag = UserTag.new
      get_customers_info
      flash[:error] = t("users.deregister_tag_failure")
      respond_to do |format|
        format.html { render :action => "index" }
        #format.xml  { render :xml => @merchant.errors, :status => :unprocessable_entity }
      end
    end
  end
  
  private
  
  def get_customers_info
    customers_info = Customer.all(:fields => [:id, :merchant_id], :user => current_user, :status => :active, :order => [:update_ts.desc])
    customer_ids = []
    merchant_ids = []
    merchant_id_to_customer_id = {}
    customers_info.each do |customer_info|
      customer_ids << customer_info.id
      merchant_ids << customer_info.merchant_id
      merchant_id_to_customer_id[customer_info.merchant_id] = customer_info.id
    end
    merchants = Merchant.all(:id => merchant_ids)
    customer_id_to_merchant = {}
    merchants.each do |merchant|
      customer_id_to_merchant[merchant_id_to_customer_id[merchant.id]] = merchant
    end
    customer_to_badges = CustomerToBadge.all(:fields => [:customer_id, :badge_id], :customer_id => customer_ids)
    badge_ids = []
    badge_id_to_customer_id = {}
    customer_to_badges.each do |customer_to_badge|
      badge_ids << customer_to_badge.badge_id
      badge_id_to_customer_id[customer_to_badge.badge_id] = customer_to_badge.customer_id
    end
    badges = Badge.all(:id => badge_ids)
    customer_id_to_badge = {}
    badges.each do |badge|
      customer_id_to_badge[badge_id_to_customer_id[badge.id]] = badge
    end    
    badge_id_to_type_id = {}
    badge_to_types = BadgeToType.all(:fields => [:badge_id, :badge_type_id], :badge_id => badge_ids)
    badge_to_types.each do |badge_to_type|
      badge_id_to_type_id[badge_to_type.badge_id] = badge_to_type.badge_type_id
    end
    @customers = Customer.all(:user_id => current_user.id, :status => :active, :order => [:update_ts.desc]).paginate(:page => params[:page])
    @customers.each do |customer|
      customer.eager_load_merchant = customer_id_to_merchant[customer.id]
      badge = customer_id_to_badge[customer.id]
      customer.eager_load_badge = badge
      customer.eager_load_badge.eager_load_type = BadgeType.id_to_type[badge_id_to_type_id[badge.id]]
    end
  end
end
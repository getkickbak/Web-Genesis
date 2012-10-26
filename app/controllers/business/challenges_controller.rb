module Business
  class ChallengesController < Business::BaseApplicationController
    before_filter :authenticate_merchant!
    before_filter :check_is_admin
    
    def index
      authorize! :read, Challenge
      
      @venues = current_merchant.venues
      @challenges = Challenge.all(:merchant => current_merchant)
      @display = params[:display] || "default"
      @venue = Venue.get(params[:venue_id]) || @venues.first

      respond_to do |format|
        format.html # index.html.erb
      #format.xml  { render :xml => @merchants }
      end
    end

    def show
      @challenge = Challenge.get(params[:id]) || not_found
      authorize! :read, @challenge

      respond_to do |format|
        format.html # index.html.erb
      #format.xml  { render :xml => @merchants }
      end
    end

    def new
      authorize! :create, Challenge

      type = ChallengeType.id_to_value[params[:type_id].to_i]
      @available_challenge_types = get_available_challenge_types(type)

      if type
        @challenge = Challenge.new(get_challenge_info()[type])
        @challenge.type_id = params[:type_id].to_i
        @challenge.type = ChallengeType.get(@challenge.type_id)
      else
        @challenge = Challenge.new
      end
      @data = @challenge.data
      @venue_ids = []
      current_merchant.venues.each do |venue|
        @venue_ids << venue.id
      end

      respond_to do |format|
        format.html # index.html.erb
      #format.xml  { render :xml => @merchants }
      end
    end

    def create
      authorize! :create, Challenge

      allowed = true
      type = ChallengeType.get(params[:challenge][:type_id])
      if type.value != 'custom' && type.value != 'menu'
        challenges = Challenge.all(:merchant => current_merchant)
        challenges.each do |challenge|
          if type.value == challenge.type.value
            allowed = false
            break;
          end
        end
      end

      if !allowed
        raise Exceptions::AppException.new("Challenge Type(#{type.value}) already exists for Merchant(#{current_merchant.name})")
      end

      begin
        Challenge.transaction do
          if type.value == 'referral'
            params[:challenge][:data] = params[:challenge][:referral_data]  
          end
          params[:challenge][:venue_ids].delete("")
          if params[:challenge][:venue_ids].length > 0
            venues = Venue.all(:conditions => ["id IN ?", params[:challenge][:venue_ids]])
          else
            venues = []
          end
          if type.value == 'menu'  
            params[:challenge][:description] = ((t "challenge.type.menu.description") % [params[:challenge][:name]])
          end
          @challenge = Challenge.create(current_merchant, type, params[:challenge], venues)
          respond_to do |format|
            format.html { redirect_to(challenges_path, :notice => t("business.challenges.create_success")) }
          #format.xml  { render :xml => @deal, :status => :created, :location => @deal }
          #format.json { render :json => { :success => true, :data => @deal, :total => 1 } }
          end
        end
      rescue DataMapper::SaveFailureError => e
        logger.error("Exception: " + e.resource.errors.inspect)
        @challenge = e.resource
        @available_challenge_types = get_available_challenge_types(@challenge.type.value)
        @data = @challenge.data
        @venue_ids = []
        current_merchant.venues.each do |venue|
          @venue_ids << venue.id
        end
        respond_to do |format|
          format.html { render :action => "new" }
          #format.xml  { render :xml => @order.errors, :status => :unprocessable_entity }
          #format.json { render :json => { :success => false } }
        end
      end    
    end

    def edit
      @challenge = Challenge.get(params[:id]) || not_found
      authorize! :update, @challenge

      @available_challenge_types = get_available_challenge_types(@challenge.type.value)

      type = ChallengeType.id_to_value[params[:type_id].to_i]
      if type
        challenge_info = get_challenge_info()[type]
        @challenge.update_without_save(challenge_info)
        @challenge.type_id = params[:type_id].to_i
        @challenge.type = ChallengeType.get(@challenge.type_id)
        if type == 'menu'
          @challenge.description = @challenge.description % [@challenge.name]
        end
      else
        @challenge.type_id = @challenge.type.id
      end
      @data = @challenge.data
      @venue_ids = []
      @challenge.venues.each do |venue|
        @venue_ids << venue.id
      end
    end

    def update
      @challenge = Challenge.get(params[:id]) || not_found
      authorize! :update, @challenge

      allowed = true
      type = ChallengeType.get(params[:challenge][:type_id])
      if type.value != 'custom'
        challenges = Challenge.all(:merchant => current_merchant)
        challenges.each do |challenge|
          if type.value == challenge.type.value && type.value != @challenge.type.value
            allowed = false
            break;
          end
        end
      end

      if !allowed
        raise Exceptions::AppException.new("Challenge Type(#{type.value}) already exists for Merchant(#{current_merchant.name})")
      end

      begin
        Challenge.transaction do
          if type.value == 'referral'
            params[:challenge][:data] = params[:challenge][:referral_data]  
          end
          params[:challenge][:venue_ids].delete("")
          if params[:challenge][:venue_ids].length > 0
            venues = Venue.all(:conditions => ["id IN ?", params[:challenge][:venue_ids]])
          else
            venues = []
          end
          if type.value == 'menu'  
            params[:challenge][:description] = ((t "challenge.type.menu.description") % [params[:challenge][:name]])
          end
          @challenge.update(type, params[:challenge], venues)
          respond_to do |format|
            format.html { redirect_to({:action => "edit", :id => @challenge.id}, {:notice => t("business.challenges.update_success")}) }
            format.xml  { head :ok }
          end
        end
      rescue DataMapper::SaveFailureError => e
        logger.error("Exception: " + e.resource.errors.inspect)
        @challenge = e.resource
        @available_challenge_types = get_available_challenge_types(@challenge.type.value)
        @data = @challenge.data
        @venue_ids = []
        current_merchant.venues.each do |venue|
          @venue_ids << venue.id
        end
        respond_to do |format|
          format.html { render :action => "edit" }
          #format.xml  { render :xml => @deal.errors, :status => :unprocessable_entity }
          #format.json { render :json => { :success => false } }
        end
      end    
    end

    def destroy
      @challenge = Challenge.get(params[:id]) || not_found
      authorize! :destroy, @challenge

      @challenge.destroy

      respond_to do |format|
        format.html { redirect_to(challenges_url) }
      #format.xml  { head :ok }
      end
    end

    private

    def get_available_challenge_types(current_type)
      in_use_types = {}
      challenges = Challenge.all(:merchant => current_merchant)
      challenges.each do |challenge|
        in_use_types[challenge.type.value] = challenge.type.value
      end
      challenge_types = []
      ChallengeType.values[current_merchant.type.value][I18n.locale].each do |challenge_type|
        value = ChallengeType.id_to_value[challenge_type[1]]
        if !(in_use_types.include? value) || value == 'custom' || value == 'menu' || value == current_type
          challenge_types << challenge_type
        end
      end
      return challenge_types
    end

    def get_challenge_info
      challenge_info = {}
      if current_merchant.type.value == "food"
        challenge_info.update({
          "menu" => 
          {
            :name => (t "challenge.type.menu.name"),
            :description => (t "challenge.type.menu.description"),
            :require_verif => true
          }
        })
      end
      challenge_info.update({
        "birthday" =>
        {
          :name => (t "challenge.type.birthday.name"),
          :description => (t "challenge.type.birthday.description"),
          :require_verif => true
        },
        "photo" =>
        {
          :name => (t "challenge.type.photo.name"),
          :description => (t "challenge.type.photo.description"),
          :require_verif => false
        },
        "referral" =>
        {
          :name => (t "challenge.type.referral.name"),
          :description => (t "challenge.type.referral.description"),
          :data => ReferralData.new,
          :require_verif => false
        },
        "custom" =>
        {
          :name => (t "challenge.type.custom.name"),
          :description => (t "challenge.type.custom.description"),
          :require_verif => true
        }
      })
      return challenge_info
    end
  end
end
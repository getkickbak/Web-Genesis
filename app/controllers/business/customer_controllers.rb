module Business
  class CustomersController < Business::BaseApplicationController
    before_filter :authenticate_merchant!
    #load_and_authorize_resource
  
    def index
      authorize! :read, Customer

      @users = []
      @customers = Customer.all(:merchant => current_merchant, :order => [:created_ts.desc]).paginate(:page => params[:page])
      if @customers.length > 0
        customers_info = Customer.all(:fields => [:id, :user_id], :merchant => current_merchant, :order => [:created_ts.desc]).paginate(:page => params[:page])
        @customer_id_to_user_id = {}
        user_ids = []
        customers_info.each do |customer|
          @customer_id_to_user_id[customer.id] = customer.user_id
          user_ids << customer.user_id
        end
        users = User.all(:id => user_ids)
        @user_id_to_user = {}
        users.each do |user|
          @user_id_to_user[user.id] = user
        end
      end

      respond_to do |format|
        format.html # index.html.erb
      #format.xml  { render :xml => @users }
      end
    end
  end
end
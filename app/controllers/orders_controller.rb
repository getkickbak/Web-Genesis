class OrdersController < ApplicationController
  
  def index
    user_id = params[:user_id]
    start = 0
    max = 10 
    @user = UserService.instance.get_user(user_id)
    @orders = OrderService.instance.get_orders(user_id, start, max)

    respond_to do |format|
      format.html # index.html.erb
      format.xml  { render :xml => @orders }
    end
  end
  
  def show
    @user = UserService.instance.get_user(params[:user_id])
    @order = OrderService.instance.get_order(params[:id])

    respond_to do |format|
      format.html # show.html.erb
      format.xml  { render :xml => @order }
    end
  end
  
  # GET /orders/new
  # GET /orders/new.xml
  def new
    @user = UserService.instance.get_user(1)
    @deal = DealService.instance.get_deal(params[:id])
    @referral_id = params[:referral_id]
    @order = Order.new

    respond_to do |format|
      format.html # new.html.erb
      format.xml  { render :xml => @order }
    end
  end
  
  def create
    Order.transaction do
      begin
        @user = UserService.instance.get_user(1)
        @deal = DealService.instance.get_deal(params[:id])
        @order = OrderService.instance.create_order(@deal, params[:referral_id], 1, params[:order])
        respond_to do |format|
          format.html { redirect_to user_order_path(@user, @order, :notice => 'Order was successfully created.') }
          format.xml  { render :xml => @order, :status => :created, :location => @order }
          format.json { render :json => { :success => true, :data => @order, :total => 1 } }
        end
      rescue DataMapper::SaveFailureError => e
        puts "Exception: " + e.resource.errors.inspect
        @order = e.resource
        respond_to do |format|
          format.html { render :action => "new" }
          format.xml  { render :xml => @order.errors, :status => :unprocessable_entity }
          format.json { render :json => { :success => false } }
        end
      end
    end
  end
  
end

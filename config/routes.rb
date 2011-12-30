Genesis::Application.routes.draw do

  scope :module => "business" do
    constraints :subdomain => "merchant" do
      devise_for :merchants, :path => "", :controllers => {
        :sessions => "business/merchant_devise/sessions",
        :registrations => "business/merchant_devise/registrations",
        :passwords => "business/merchant_devise/passwords"
      }
      
      resources :challenges
      resources :purchase_rewards
      resources :customer_rewards
      resources :venues
      #resources :deals

      match "/account" => 'merchants#show', :as => :account
      match "/account/edit" => 'merchants#edit', :as => :edit_account
      match "/account/update" => 'merchants#update', :as => :update_account
      match "/account/update_qr_code" => 'merchants#update_qr_code', :via => :post
      
      match "/merchant_terms" => 'pages#merchant_terms'
      match "/contact_us" => 'pages#contact_us'
      match "/contact_us/create" => 'pages#contact_us_create', :via => :post, :as => :create_contact

=begin
      match '/vouchers' => 'coupons#index', :as => :coupons
      match '/vouchers/:id' => 'coupons#show'
      match '/vouchers/:id/redeem' => 'coupons#redeem', :as => :redeem_coupon
=end
      match '*a', :to => 'errors#routing'

      #root :to => redirect("/vouchers")
    end
  end

  constraints Domain do
    devise_for :users, :path => "", :controllers => {
      :registrations => "user_devise/registrations"
    }

    match "/how_it_works" => 'pages#how_it_works'
    #match "/privacy" => 'pages#privacy'
    match "/terms" => 'pages#terms'
    match "/contact_us" => 'pages#contact_us'
    match "/contact_us/create" => 'pages#contact_us_create', :via => :post, :as => :create_contact
    match "/faq" => 'pages#faq'

    match "/add_business" => 'pages#add_business'
    match "/add_business/create" => 'pages#add_business_create'
    
    #resources :credit_cards, :as => 'billing_info', :only => [:index, :create, :update, :destroy]
    resources :check_ins, :only => [:create]
    resources :customers, :only => [:index, :show]
    
    match "/account" => 'users#show', :as => :account
    match "/account/edit" => 'users#edit', :as => :edit_account
    match "/account/update" => 'users#update', :as => :update_account
      
    match '/venues/find_nearest' => 'venues#find_nearest'

    match '/challenges/:challenge_id/find' => 'challenges#find'
    match '/challenges/:challenge_id/start' => 'challenges#start'
    match '/challenges/:challenge_id/complete' => 'challenges#complete'
    
    match '/customer_rewards/index' => 'customer_rewards#index'
    match '/customer_rewards/redeem' => 'customer_rewards#redeem'
    
    match '/purchase_rewards/index' => 'purchase_rewards#index'
    match '/purchase_rewards/earn' => 'purchase_rewards#earn'
    
    #match '/users/:id/account' => 'users#edit'
    #match '/users/:user_id/coupons' => 'orders#index', :via => :get , :as => :user_coupons
    #match '/users/:user_id/orders/:id' => 'orders#show', :via => :get, :as => :user_order
    #match '/orders/:id' => 'orders#show', :as => :order

    #Testing purposes only
=begin    
    match '/orders/:id/confirmed_email' => 'orders#confirmed_email'
    match '/vouchers/:id/reminder_email' => 'coupons#reminder_email'

    match '/orders/:id/confirmed_email_template' => 'orders#confirmed_email_template'
    match '/vouchers/:id/template' => 'coupons#template'
    #end
=end
=begin
    match '/deals/:id' => 'deals#show', :as => :deal
    match '/deals/:id/confirmation' => 'orders#new', :as => :confirm_order
    match '/deals/:id/complete_order' => 'orders#create', :via => :post, :as => :complete_order
    match '/deals/:id/pay_details' => 'orders#pay_details', :as => :pay_details
    match '/deals/:id/thanks' => 'orders#thanks', :as => :pay_thanks
    match '/deals/:id/referrals' => 'referrals#find_by_deal'
    match '/deals/:id/referrers' => 'referrals#find_by_user'
    match '/referrals/:id/confirm' => 'referrals#confirm', :via => :post
    match '/referrals/photo_upload' => 'referrals#upload_photo', :via => :post

    match '/deals/:id/cancel_order' => 'orders#cancel', :as => :cancel_order
    match '/deals/:id/referrals/create' => 'referrals#create', :via => :post, :as => :new_referral
    match '/rewards' => 'rewards#index', :as => :rewards
    match '/rewards/:id' => 'rewards#show'
    match '/rewards/:id/redeem' => 'rewards#redeem', :as => :redeem_reward
=end

    namespace :admin do
      resources :users
      match '/jobs' => 'jobs#index', :as => :jobs
      match '/jobs/run' => 'jobs#run', :as => :job_run

      constraints CanAccessResque do
        mount Resque::Server, at: '/resque'
      end
      match '/resque', :to => redirect("/")
      match '/resque/*path', :to => redirect("/")
    end

    namespace :sales do
      resources :merchants do
        resources :deals
      end
    end

    match '*a', :to => 'errors#routing'

    root :to => 'deals#show'

  #match '/referrals' => 'referrals#index'
  #root :to => 'referrals#index', :via => :get
  end

# The priority is based upon order of creation:
# first created -> highest priority.

# Sample of regular route:
#   match 'products/:id' => 'catalog#view'
# Keep in mind you can assign values other than :controller and :action

# Sample of named route:
#   match 'products/:id/purchase' => 'catalog#purchase', :as => :purchase
# This route can be invoked with purchase_url(:id => product.id)

# Sample resource route (maps HTTP verbs to controller actions automatically):
#   resources :products

# Sample resource route with options:
#   resources :products do
#     member do
#       get 'short'
#       post 'toggle'
#     end
#
#     collection do
#       get 'sold'
#     end
#   end

# Sample resource route with sub-resources:
#   resources :products do
#     resources :comments, :sales
#     resource :seller
#   end

# Sample resource route with more complex sub-resources
#   resources :products do
#     resources :comments
#     resources :sales do
#       get 'recent', :on => :collection
#     end
#   end

# Sample resource route within a namespace:
#   namespace :admin do
#     # Directs /admin/products/* to Admin::ProductsController
#     # (app/controllers/admin/products_controller.rb)
#     resources :products
#   end

# You can have the root of your site routed with "root"
# just remember to delete public/index.html.
# root :to => "welcome#index"

# See how all your routes lay out with "rake routes"

# This is a legacy wild controller route that's not recommended for RESTful applications.
# Note: This route will make all actions in every controller accessible via GET requests.
# match ':controller(/:action(/:id(.:format)))'
end

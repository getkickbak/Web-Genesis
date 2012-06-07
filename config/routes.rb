Genesis::Application.routes.draw do

  scope :module => "business" do
    constraints :subdomain => "merchant" do
      devise_for :merchants, :path => "", :controllers => {
        :sessions => "business/merchant_devise/sessions",
        :registrations => "business/merchant_devise/registrations",
        :passwords => "business/merchant_devise/passwords"
      }

      namespace :api do
        namespace :v1  do
          resources :tokens, :only => [:create, :destroy] 
          
          match "earn_prizes/verify" => 'earn_prizes#verify', :via => :post
          match "customer_rewards/verify" => 'customer_rewards#verify', :via => :post  
        end
      end
      
      resources :challenges
      resources :customer_rewards
      resources :venues do
        get 'update_auth_code', :on => :member, :as => :update_auth_code
        get 'check_in_template', :on => :member
      end
      resources :invoices, :only => [:index, :show]
      #resources :deals
              
      match "/dashboard" => 'dashboard#index', :as => :dashboard
      match "/setup" => 'setup#index', :as => :setup
      match "/setup/activate" => 'setup#activate', :as => :setup_activate
      match "/account/photo" => 'merchants#photo', :as => :account_photo
      match "/account/photo/update" => 'merchants#update_photo', :as => :update_account_photo
      match "/account/photo/update_alt" => 'merchants#update_alt_photo', :as => :update_account_alt_photo
      match "/reward_model" => 'reward_model#index', :as => :reward_model
      match "/reward_model/update" => 'reward_model#update', :as => :update_reward_model
      match "/marketing" => 'marketing#index', :as => :marketing
      match "/analytics" => 'analytics#index', :as => :analytics
      match "/analytics/show_charts" => 'analytics#show_charts'
      match "/account" => 'merchants#show', :as => :account
      match "/account/edit" => 'merchants#edit', :as => :edit_account
      match "/account/update" => 'merchants#update', :as => :update_account
      match "/billings" => 'credit_cards#index', :as => :credit_cards
      match "/billings/create" => 'credit_cards#create', :via => :post, :as => :create_credit_card
      match "/billings/update" => 'credit_cards#update', :as => :update_credit_card
      match "/billings/delete" => 'credit_cards#destroy', :as => :delete_credit_card

      match "/merchant_terms" => 'pages#merchant_terms'
      match "/contact_us" => 'pages#contact_us'
      match "/contact_us/create" => 'pages#contact_us_create', :via => :post, :as => :create_contact

=begin
      match '/vouchers' => 'coupons#index', :as => :coupons
      match '/vouchers/:id' => 'coupons#show'
      match '/vouchers/:id/redeem' => 'coupons#redeem', :as => :redeem_coupon
=end
      match '*a', :to => 'errors#routing'

      root :to => redirect("/dashboard")
    end
  end

  scope :module => "admin" do
    constraints :subdomain => "manage" do
      devise_for :staffs, :path => "", :controllers => {
        :sessions => "admin/staff_devise/sessions",
        :registrations => "admin/staff_devise/registrations",
        :passwords => "admin/staff_devise/passwords"
      }

      resources :users
      resources :staffs
      resources :merchants do
        #resources :deals
      end
      
      match "/marketing" => 'marketing#index', :as => :marketing
      match "/marketing/update_poster" => 'marekting#update_poster_image', :as => :update_poster_image
      match "/marketing/update_table_topper" => 'marketing#update_checkin_image', :as => :update_checkin_image
      match "/account" => 'account#show', :as => :account
      match "/account/edit" => 'account#edit', :as => :edit_account
      match "/account/update" => 'account#update', :as => :update_account

      constraints CanAccessResque do
        mount Resque::Server, at: '/resque'
      end

      match '*a', :to => 'errors#routing'
      
      root :to => redirect("/merchants")
    end
  end

  constraints Domain do
    devise_for :users, :skip => [:sessions, :registrations, :passwords]
    #devise_for :users, :path => "", :controllers => {
    #  :sessions => "user_devise/sessions",
    #  :registrations => "user_devise/registrations",
    #  :passwords => "user_devise/passwords",
    #} do
    #  match "/facebook_sign_in" => 'user_devise/sessions#create_from_facebook'
    #end
    
    namespace :api do
      namespace :v1  do
        resources :tokens, :only => [:create, :destroy] do
          post "create_from_facebook", :on => :collection
        end
        resources :check_ins, :only => [:create]
        resources :customers, :only => [:index] do
          post "transfer_points", :on => :collection
          post "receive_points", :on => :collection
        end
                
        match "/sign_up" => 'registrations#create', :via => :post
        
        match "/account/update" => 'users#update', :via => :post
        match "/account/update_facebook_info" => 'users#update_facebook_info', :via => :post
    
        match '/venues/find_closest' => 'venues#find_closest'
        match '/venues/find_nearest' => 'venues#find_nearest'
        match '/venues/share_photo' => 'venues#share_photo', :via => :post
        match '/venues/:id/explore' => 'venues#explore'

        match '/challenges' => 'challenges#index'
        match '/challenges/:id/start' => 'challenges#start'
        match '/challenges/:id/complete' => 'challenges#complete', :via => :post
        match '/challenges/complete_referral' => 'challenges#complete_referral', :via => :post

        match '/customer_rewards' => 'customer_rewards#index'
        match '/customer_rewards/:id/redeem' => 'customer_rewards#redeem', :via => :post

        match '/purchase_rewards/earn' => 'purchase_rewards#earn', :via => :post

        match '/earn_prizes' => 'earn_prizes#index'
        match '/earn_prizes/show_venues' => 'earn_prizes#show_venues'
        match '/earn_prizes/:id/redeem' => 'earn_prizes#redeem', :via => :post
      end
    end
  
    constraints :user_agent => /iPhone/ do
      match "/download" => redirect {|params, req| "http:/itunes.com/apps/kickbak" }
    end
    #constraints :user_agent => /Android/ do
    #  match "/download" => redirect {|params, req| "https://play.google.com/store/apps/details?id=com.kickbak.android" }
    #end
    constraints :user_agent => /Android/ do
      match "/download" => redirect {|params, req| "http://www.getkickbak.com/coming_soon" }
    end
    
    #match "/how_it_works" => 'pages#how_it_works'
    #match "/privacy" => 'pages#privacy'
    #match "/terms" => 'pages#terms'
    match "/contact_us" => 'pages#contact_us'
    match "/contact_us/create" => 'pages#contact_us_create', :via => :post, :as => :create_contact
    #match "/faq" => 'pages#faq'
    match "/add_business" => 'pages#add_business'
    match "/add_business/create" => 'pages#add_business_create', :via => :post, :as => :create_merchant_contact
    match "/coming_soon" => 'pages#coming_soon'
    
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

    match '*a', :to => 'errors#routing'

    root :to => 'pages#index'

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

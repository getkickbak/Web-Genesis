Genesis::Application.routes.draw do

  scope :module => "business" do
    constraints :subdomain => /merchant/ do
      devise_for :merchants, :path => "", :controllers => {
        :sessions => "business/merchant_devise/sessions",
        :registrations => "business/merchant_devise/registrations",
        :passwords => "business/merchant_devise/passwords"
      }

      namespace :api do
        namespace :v1  do
          resources :tokens, :only => [:create, :destroy] do
            get "get_csrf_token", :on => :collection
          end
        end
      end
      
      resources :challenges, :except => [:show]
      resources :customer_rewards, :except => [:show] do
        put 'update_photo', :on => :member, :as => :update_photo
      end
      resources :venues, :except => [:destroy] do
        get 'update_auth_code', :on => :member, :as => :update_auth_code
        get 'update_check_in_auth_code', :on => :member, :as => :update_check_in_auth_code
        get 'check_in_template', :on => :member, :as => :check_in_template
      end
      resources :customers, :only => [:index], :path => "members"
      resources :invoices, :only => [:index, :show]
      resources :promotions, :only => [:index, :new, :create]
      #resources :deals
              
      match "/dashboard" => 'analytics#index', :as => :dashboard
      match "/dashboard/show_charts" => 'analytics#show_charts'
      match "/setup" => 'setup#index', :as => :setup
      match "/setup/activate" => 'setup#activate', :as => :setup_activate
      match "/account/photo" => 'merchants#photo', :as => :account_photo
      match "/account/photo/update" => 'merchants#update_photo', :as => :update_account_photo
      match "/account/photo/update_alt" => 'merchants#update_alt_photo', :as => :update_account_alt_photo
      match "/reward_model" => 'reward_model#index', :as => :reward_model
      match "/reward_model/update" => 'reward_model#update', :as => :update_reward_model
      match "/marketing" => 'marketing#index', :as => :marketing
      match "/marketing/create_sign_up_code" => 'marketing#create_sign_up_code', :as => :create_sign_up_code
      match "/marketing/update_sign_up_code" => 'marketing#update_sign_up_code', :as => :update_sign_up_code
      match "/badges" => 'badges#index', :as => :badges
      match "/badges/edit" => 'badges#edit', :as => :edit_badges
      match "/badges/update_badges" => 'badges#update_badges', :as => :update_badges
      match "/badges/create_custom_badges" => 'badges#create_custom_badges', :via => :post, :as => :create_custom_badges
      match "/account" => 'merchants#edit', :as => :account
      match "/account/update" => 'merchants#update', :as => :update_account
      match "/account/password" => 'merchants#password', :as => :account_password
      match "/account/password/update" => 'merchants#update_password', :as => :update_account_password
      match "/billings" => 'credit_cards#index', :as => :credit_cards
      match "/billings/create" => 'credit_cards#create', :via => :post, :as => :create_credit_card
      match "/billings/update" => 'credit_cards#update', :as => :update_credit_card
      match "/billings/delete" => 'credit_cards#destroy', :via => :delete, :as => :delete_credit_card

      #match "/merchant_terms" => 'pages#merchant_terms'
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
    constraints :subdomain => /manage/ do
      devise_for :staffs, :path => "", :controllers => {
        :sessions => "admin/staff_devise/sessions",
        :registrations => "admin/staff_devise/registrations",
        :passwords => "admin/staff_devise/passwords"
      }

      resources :users do
        post 'update_auth_token', :on => :member, :as => :update_auth_token
      end
      resources :staffs
      resources :merchants do
        resources :venues, :only => [:index, :edit, :update]
        resources :devices
        resources :invoices do
          post "pay", :on => :member, :as => :pay
        end
        get "payment_subscription", :on => :member, :as => :payment_subscription
        put "update_payment_subscription", :on => :member, :as => :update_payment_subscription
      end
      
      match "/configuration" => 'configuration#index', :as => :configuration
      match "/configuration/update" => "configuration#update", :as => :update_configuration
      match "/marketing" => 'marketing#index', :as => :marketing
      match "/marketing/update_poster" => 'marekting#update_poster_image', :as => :update_poster_image
      match "/marketing/update_table_topper" => 'marketing#update_checkin_image', :as => :update_checkin_image
      match "/account" => 'account#edit', :as => :account
      match "/account/update" => 'account#update', :as => :update_account
      match "/account/password" => 'account#password', :as => :account_password
      match "/account/password/update" => 'account#update_password', :as => :update_account_password

      constraints CanAccessResque do
        mount Resque::Server, at: '/resque'
      end

      match '*a', :to => 'errors#routing'
      
      root :to => redirect("/merchants")
    end
  end
  
  constraints Domain do
    devise_for :users, :path => "", :controllers => {
      :sessions => "user_devise/sessions",
      :registrations => "user_devise/registrations",
      :passwords => "user_devise/passwords",
      :omniauth_callbacks => "user_devise/omniauth_callbacks"
    } do
      match "/facebook_sign_in" => 'user_devise/sessions#create_from_facebook'
      get "/auth/failure" => "user_devise/omniauth_callbacks#failure"
    end
    
    namespace :api do
      namespace :v1  do
        resources :tokens, :only => [:create, :destroy] do
          post "create_from_facebook", :on => :collection
          get "get_csrf_token", :on => :collection
        end
        resources :check_ins, :only => [:create]
        resources :customers, :only => [:index] do
          post "transfer_points", :on => :collection
          post "receive_points", :on => :collection
          get "show_jackpot_winners", :on => :collection   
          get "show_account", :on => :collection 
        end
                          
        match "/sign_up" => 'registrations#create', :via => :post
        
        match "/account/update" => 'users#update', :via => :post
        match "/account/update_facebook_info" => 'users#update_facebook_info', :via => :post
        match "/account/reset_password" => 'users#reset_password', :via => :post
        match "/account/change_password" => 'users#change_password', :via => :post
        match "/account/register_user_device" => "users#register_user_device", :via => :post
    
        match '/venues/find_closest' => 'venues#find_closest'
        match '/venues/find_nearest' => 'venues#find_nearest'
        match '/venues/share_photo' => 'venues#share_photo', :via => :post
        match '/venues/:id/explore' => 'venues#explore'
        match '/venues/:id/merchant_explore' => 'venues#merchant_explore'

        match '/challenges' => 'challenges#index'
        match '/challenges/:id/start' => 'challenges#start'
        match '/challenges/:id/complete' => 'challenges#complete', :via => :post
        match '/challenges/merchant_complete' => 'challenges#merchant_complete', :via => :post
        match '/challenges/complete_referral' => 'challenges#complete_referral', :via => :post

        match '/customer_rewards' => 'customer_rewards#index'
        match '/customer_rewards/:id/redeem' => 'customer_rewards#redeem', :via => :post
        match '/customer_rewards/:id/merchant_redeem' => 'customer_rewards#merchant_redeem', :via => :post

        match '/purchase_rewards/earn' => 'purchase_rewards#earn', :via => :post     
        match '/purchase_rewards/merchant_earn' => 'purchase_rewards#merchant_earn', :via => :post
        
        match '/devices/get_encryption_key' => 'devices#get_encryption_key'
      end
    end
      
    constraints :user_agent => /iPhone/ do
      match "/download" => redirect {|params, req| "http://itunes.apple.com/us/app/kickbak-inc/id537476722?ls=1&mt=8" }
      match "/d" => redirect {|params, req| "http://itunes.apple.com/us/app/kickbak-inc/id537476722?ls=1&mt=8" }
      root :to => redirect {|params, req| "http://m.getkickbak.com" } 
    end
    #constraints :user_agent => /Android/ do
    #  match "/download" => redirect {|params, req| "https://play.google.com/store/apps/details?id=com.kickbak.android" }
    #end
    constraints :user_agent => /Android/ do
      match "/download" => redirect {|params, req| "https://play.google.com/store/apps/details?id=com.getkickbak.kickbak" }
      match "/d" => redirect {|params, req| "https://play.google.com/store/apps/details?id=com.getkickbak.kickbak" }
      root :to => redirect {|params, req| "http://m.getkickbak.com" } 
    end
    constraints :user_agent => /BlackBerry|Windows Phone/ do
      match "/download" => redirect {|params, req| "http://www.getkickbak.com/" }
      match "/d" => redirect {|params, req| "http://www.getkickbak.com/" }
      root :to => redirect {|params, req| "http://m.getkickbak.com" } 
    end
    
    match "/dashboard" => 'dashboard#index', :as => :dashboard
    match "/business/:id" => "merchants#show", :as => :business_profile
    match "/register_tag" => 'dashboard#register_tag', :via => :post, :as => :register_tag
    match "/deregister_tag" => 'dashboard#deregister_tag', :via => :delete, :as => :deregister_tag
    match "/account" => 'users#edit', :as => :account
    match "/account/update" => 'users#update', :as => :update_account
    match "/account/password" => 'users#password', :as => :account_password
    match "/account/password/update" => 'users#update_password', :as => :update_account_password
    match "/account/subscriptions" => 'users#subscriptions', :as => :account_subscriptions
    match "/account/subscriptions/update_email_notif" => 'users#update_email_notif', :via => :post, :as => :update_email_notif
    match "/account/facebook_settings" => 'users#facebook_settings', :as => :facebook_settings
    match "/account/facebook_settings/disconnect" => 'users#facebook_disconnect', :via => :post, :as => :facebook_disconnect
    match "/account/facebook_settings/update" => 'users#update_facebook_settings', :via => :post, :as => :update_facebook_settings
    match "/account/facebook_settings/update_facebook_checkins" => 'users#update_facebook_checkins', :via => :post, :as => :update_facebook_checkins
    match "/account/facebook_settings/update_facebook_badge_promotions" => 'users#update_facebook_badge_promotions', :via => :post, :as => :update_facebook_badge_promotions
    match "/account/facebook_settings/update_facebook_rewards" => 'users#update_facebook_rewards', :via => :post, :as => :update_facebook_rewards
    
    match "/validate_phone" => 'pages#validate_phone', :via => :post, :as => :validate_phone
    #match "/how_it_works" => 'pages#how_it_works'
    match "/privacy" => 'pages#privacy'
    match "/terms" => 'pages#terms'
    match "/contact_us" => 'pages#contact_us'
    match "/contact_us/create" => 'pages#contact_us_create', :via => :post, :as => :create_contact
    #match "/faq" => 'pages#faq'
    match "/business" => 'pages#add_business'
    match "/add_business" => 'pages#add_business'
    match "/add_business/create" => 'pages#add_business_create', :via => :post, :as => :create_merchant_contact
    match "/d", :to => 'pages#index'
    match "/download", :to => 'pages#index'
    
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

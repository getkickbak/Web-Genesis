Genesis::Application.routes.draw do

  scope :module => "business" do
    constraints :subdomain => "merchant" do
      resources :sessions, :only => [:new, :create, :destroy]

      match '/sign_in' => 'sessions#new'
      match '/sign_out' => 'sessions#destroy'

      match '/coupons' => 'coupons#index'
      match '/coupons/:id' => 'coupons#show'
      match '/coupons/:id/redeem' => 'coupons#redeem', :via => :post

      match '/rewards' => 'rewards#index'
      match '/rewards/:id' => 'rewards#show'
      match '/rewards/:id/redeem' => 'rewards#redeem', :via => :post

      root :to => redirect("/coupons")
    end
  end

  constraints Domain do
=begin
  devise_for :users, :path => "", :controllers => {
  :registrations => "user_devise/registrations"
  }
=end
    match "/how_it_works" => 'pages#how_it_works'

    resources :merchants do
      resources :deals
    end

    match '/sign_in' => 'sessions#create'
    match '/sign_out' => 'sessions#destroy'

    #match '/users/:id/account' => 'users#edit'
    #match '/users/:user_id/coupons' => 'orders#index', :via => :get , :as => :user_coupons
    #match '/users/:user_id/orders/:id' => 'orders#show', :via => :get, :as => :user_order
    #match '/orders/:id' => 'orders#show', :as => :order

    #Testing purposes only
    match '/orders/:id/confirmed_email' => 'orders#confirmed_email'
    match '/referrals/:id/reward_email' => 'referrals#reward_email'
    
    match '/orders/:id/confirmed_email_template' => 'orders#confirmed_email_template'
    match '/orders/:id/coupon_template' => 'orders#coupon_template'
    match '/referrals/:id/reward_email_template' => 'referrals#reward_email_template'
    match '/referrals/:id/reward_template' => 'referrals#reward_template'
    #end
    
    match '/deals/:id' => 'deals#show', :as => :deal
    match '/deals/:id/confirmation' => 'orders#new', :as => :confirm_order
    match '/deals/:id/complete_order' => 'orders#create', :via => :post, :as => :complete_order
    match '/deals/:id/pay_details' => 'orders#pay_details', :as => :pay_details
    match '/deals/:id/thanks' => 'orders#thanks', :as => :pay_thanks
    match '/deals/:id/referrals' => 'referrals#find_by_deal' 

    match '/deals/:id/cancel_order' => 'orders#cancel'
    match '/deals/:id/referrals/create' => 'referrals#create', :via => :post, :as => :new_referral    
    match '/resend_vouchers' => 'orders#resend_coupons'
    match '/resend_reward' => 'referrals#resend_reward'

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

Genesis::Application.routes.draw do
=begin  
  devise_for :users, :path => "", :controllers => { 
    :registrations => "user_devise/registrations"
  }
=end  
  resources :merchants do
    resources :deals
  end
  
  match '/sign_in' => 'sessions#create'
  match '/sign_out' => 'sessions#destroy'
  
  #match '/users/:id/account' => 'users#edit'
  #match '/users/:user_id/coupons' => 'orders#index', :via => :get , :as => :user_coupons
  #match '/users/:user_id/orders/:id' => 'orders#show', :via => :get, :as => :user_order
  match '/orders/:id' => 'orders#show', :as => :user_order

  match '/deals/:id' => 'deals#show'
  match '/deals/:id/confirmation' => 'orders#new', :via => :get, :as => :confirm_order
  match '/deals/:id/complete_order' => 'orders#create', :via => :post, :as => :complete_order
  match '/deals/:id/pay_details' => 'orders#pay_details', :via => :get, :as => :pay_details
  match '/deals/:id/referrals/create' => 'referrals#create', :via => :get, :as => :new_referral
  
  namespace "business" do
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
    end
  end
  
  match '/featured_deal' => 'deals#show', :as => :default_deal
  root :to => redirect("/featured_deal")
  #match '/referrals' => 'referrals#index'
  #root :to => 'referrals#index', :via => :get
  
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

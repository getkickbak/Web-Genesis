module Business
  class AnalyticsController < Business::BaseApplicationController
    before_filter :authenticate_merchant!
    before_filter :check_status
    skip_authorization_check
    
    def index
      @customers_total = get_customers_total(nil)
      @new_customers_total = get_customers_total(Date.today >> -1) 
      @purchases_total = get_purchases_total(nil, Date.today >> -12)
      @revenue_total = get_revenue_total(nil, Date.today >> -12)
      @rewards_redeemed_total = get_rewards_redeemed_total(nil, :reward)
      @new_rewards_redeemed_total = get_rewards_redeemed_total(nil, :reward, Date.today >> -12) 
      @prizes_redeemed_total = get_rewards_redeemed_total(nil, :prize)
      @new_prizes_redeemed_total = get_rewards_redeemed_total(nil, :prize, Date.today >> -12)
      
      best_customers_info = DataMapper.repository(:default).adapter.select(
          "SELECT user_id, SUM(amount) AS total_amount FROM earn_reward_records WHERE merchant_id = ? 
              AND deleted_ts IS NULL
              GROUP BY user_id
              ORDER BY total_amount
              LIMIT 0,10", current_merchant.id
        )
      best_customer_ids = []  
      @user_id_to_amount_spent = {}
      best_customers_info.each do |customer_info|
        best_customer_ids << customer_info.user_id
        @user_id_to_amount_spent[customer_info.user_id] = customer_info.total_amount
      end 
      @best_customers = []
      if best_customer_ids.length > 0
        users = User.all(:fields => [:id, :name], :id => best_customer_ids)
        users.each do |user|
          customer = {}
          customer[:name] = user.name
          customer[:total_amount] = @user_id_to_amount_spent[user.id]
          @best_customers << customer 
        end
        @best_customers.sort! {| a, b | 
          a[:total_amount] <=> b[:total_amount] 
        }
      end
      
      respond_to do |format|
        format.html # index.html.erb
        #format.xml  { render :xml => @merchants }
      end
    end
    
    def show_charts
      periodType = params[:periodType] ? params[:periodType] : "day"
      period = params[:period] ? params[:period].to_i : 30
      
      if periodType == "day"
        period = (period >= 1 && period <= 30 ? period : 30)
      else 
        period = (period > 1 && period <= 12 ? period : 3)  
      end
      case params[:type]
      when "customers"
        show_customers_data(periodType, period)
      when "visits"
        show_visits_data(periodType, period)
      when "purchases"
        show_purchases_data(periodType, period)
      when "challenges"
        show_challenges_data(periodType, period)
      else
        show_customers_data(periodType, period)
      end
    end
    
    private 
    
    def get_customers_total(date)
      if date.nil?
        Customer.count(:merchant => current_merchant)
      else
        Customer.count(:merchant => current_merchant, :created_ts.gte => date)
      end  
    end
    
    def get_purchases_total(venue, date)
      EarnRewardRecord.count(:type => :purchase, :merchant => current_merchant, :created_ts.gte => date)
    end
    
    def get_revenue_total(venue, date)
      EarnRewardRecord.sum(:amount, :type => :purchase, :merchant => current_merchant, :created_ts.gte => date)
    end
    
    def get_rewards_redeemed_total(venue, mode, date = nil)
      if date.nil?
        RedeemRewardRecord.count(:merchant => current_merchant, :mode => mode)
      else
        RedeemRewardRecord.count(:merchant => current_merchant, :mode => mode, :created_ts.gte => date)
      end
    end
    
    def show_customers_data(periodType, period)
      today = Date.today
      if periodType == "day"
        sometime_ago = today - period
      else
        sometime_ago = today >> -period
      end
      new_customers = DataMapper.repository(:default).adapter.select(
          "SELECT DATE(created_ts) AS created_date, COUNT(*) AS count FROM customers WHERE merchant_id = ? 
              AND created_ts >= ? AND deleted_ts IS NULL
              GROUP BY created_date", current_merchant.id, sometime_ago
        )
      
      i = 0
      x = 0
      total_customers_data = []
      total_customers_sometime_ago = Customer.count(:merchant => current_merchant, :created_ts.lt => sometime_ago)
      sometime_ago.upto(today) do |date|
        #puts "begin"
        #total_customers_data[i] = [date]
        total_customers_data[i] = [date.to_time.to_i*1000]
        #puts "total_customers_data: " + total_customers_data[i].to_s 
        inserted = false
        if i == 0
          previous_customers_total = total_customers_sometime_ago
        else  
          previous_customers_total = total_customers_data[i-1][1]
        end
        while x < new_customers.length
          created_date = new_customers[x][:created_date]
          created_date = (created_date.is_a? Date) ? created_date : Date.strptime(created_date,"%Y-%m-%d")
          if created_date < date
            x += 1
          elsif created_date == date
            total_customers_data[i] << (previous_customers_total + new_customers[x][:count])
            inserted = true
            break  
          else
            total_customers_data[i] << previous_customers_total   
            inserted = true
            break  
          end
        end
        if !inserted
          total_customers_data[i] << previous_customers_total
        end
        i += 1
        #puts "end"
      end
      
      data = {}
      data[:total_customers] = total_customers_data
      respond_to do |format|
         format.json { render :json => { :success => true, :data => data } }
      end
    end
    
    def show_visits_data(periodType, period)
      today = Date.today
      if periodType == "day"
        sometime_ago = today - period
      else
        sometime_ago = today >> -period
      end
      earn_rewards_total = []
      earn_rewards = DataMapper.repository(:default).adapter.select(
        "SELECT DATE(created_ts) AS created_date, SUM(points) AS points, COUNT(*) AS count FROM earn_reward_records WHERE type = ? 
            AND merchant_id = ? AND created_ts >= ? AND deleted_ts IS NULL
            GROUP BY created_date", EarnRewardRecord::Types.index(:purchase)+1, current_merchant.id, sometime_ago
      )
      
      i = 0
      x = 0
      earn_rewards_data = []
      earn_rewards_data[0] = { :name => 'Visits', :data => [] }
      earn_rewards_data[1] = { :name => 'Points', :yAxis => 1, :data => [] }
      total_visits_sometime_ago = EarnRewardRecord.count(:merchant => current_merchant, :type => :purchase, :created_ts.lt => sometime_ago)
      total_points_sometime_ago = EarnRewardRecord.sum(:points, :merchant => current_merchant, :type => :purchase, :created_ts.lt => sometime_ago) || 0
      sometime_ago.upto(today) do |date|
        #puts "begin"
        earn_rewards_data[0][:data][i] = [date.to_time.to_i*1000]
        earn_rewards_data[1][:data][i] = [date.to_time.to_i*1000]
        #puts "earn_rewards: " + earn_rewards[i].to_s
        inserted = false
        if i == 0
          previous_earn_rewards_visits_total = total_visits_sometime_ago
          previous_earn_rewards_points_total = total_points_sometime_ago
        else  
          previous_earn_rewards_visits_total = earn_rewards_data[0][:data][i-1][1]
          previous_earn_rewards_points_total = earn_rewards_data[1][:data][i-1][1]
        end
        while x < earn_rewards.length
          created_date = earn_rewards[x][:created_date]
          created_date = (created_date.is_a? Date) ? created_date : Date.strptime(created_date,"%Y-%m-%d")
          if created_date < date
            x += 1
          elsif created_date == date
            earn_rewards_data[0][:data][i] << (previous_earn_rewards_visits_total + earn_rewards[x][:count])
            earn_rewards_data[1][:data][i] << (previous_earn_rewards_points_total + earn_rewards[x][:points])
            inserted = true
            break
          else
            earn_rewards_data[0][:data][i] << previous_earn_rewards_visits_total
            earn_rewards_data[1][:data][i] << previous_earn_rewards_points_total
            inserted = true
            break
          end
        end
        if !inserted
          earn_rewards_data[0][:data][i] << previous_earn_rewards_visits_total
          earn_rewards_data[1][:data][i] << previous_earn_rewards_points_total
        end   
        i += 1
      end
      
      data = {}
      data[:visits] = earn_rewards_data
      respond_to do |format|
         format.json { render :json => { :success => true, :data => data } }
      end
    end
    
    def show_purchases_data(periodType, period)
      today = Date.today
      if periodType == "day"
        sometime_ago = today - period
      else
        sometime_ago = today >> -period
      end
      earn_rewards = DataMapper.repository(:default).adapter.select(
        "SELECT DATE(created_ts) AS created_date, SUM(amount) AS amount, COUNT(*) AS count FROM earn_reward_records WHERE type = ? 
            AND merchant_id = ? AND created_ts >= ? AND deleted_ts IS NULL
            GROUP BY created_date", EarnRewardRecord::Types.index(:purchase)+1, current_merchant.id, sometime_ago
      )
            
      i = 0
      x = 0
      earn_rewards_data = []
      earn_rewards_data = []
      earn_rewards_data[0] = { :name => 'Amount', :data => [] }
      earn_rewards_data[1] = { :name => 'Visits', :yAxis => 1, :data => [] }
      total_amount_sometime_ago = EarnRewardRecord.sum(:amount, :merchant => current_merchant, :type => :purchase, :created_ts.lt => sometime_ago) || 0.00
      total_visits_sometime_ago = EarnRewardRecord.count(:merchant => current_merchant, :type => :purchase, :created_ts.lt => sometime_ago)
      sometime_ago.upto(today) do |date|
        #puts "begin"
        earn_rewards_data[0][:data][i] = [date.to_time.to_i*1000]
        earn_rewards_data[1][:data][i] = [date.to_time.to_i*1000]
        #puts "earn_rewards: " + earn_rewards[i].to_s
        inserted = false
        if i == 0
          previous_earn_rewards_amount_total = total_amount_sometime_ago
          previous_earn_rewards_visits_total = total_visits_sometime_ago
        else  
          previous_earn_rewards_amount_total = earn_rewards_data[0][:data][i-1][1]
          previous_earn_rewards_visits_total = earn_rewards_data[1][:data][i-1][1]
        end
        while x < earn_rewards.length
          created_date = earn_rewards[x][:created_date]
          created_date = (created_date.is_a? Date) ? created_date : Date.strptime(created_date,"%Y-%m-%d")
          if created_date < date
            x += 1
          elsif created_date == date
            earn_rewards_data[0][:data][i] << (previous_earn_rewards_amount_total + earn_rewards[x][:amount])
            earn_rewards_data[1][:data][i] << (previous_earn_rewards_visits_total + earn_rewards[x][:count])
            inserted = true
            break
          else
            earn_rewards_data[0][:data][i] << previous_earn_rewards_amount_total
            earn_rewards_data[1][:data][i] << previous_earn_rewards_visits_total
            inserted = true
            break
          end
        end
        if !inserted
          earn_rewards_data[0][:data][i] << previous_earn_rewards_amount_total 
          earn_rewards_data[1][:data][i] << previous_earn_rewards_visits_total
        end   
        i += 1
      end
      
      data = {}
      data[:purchases] = earn_rewards_data
      respond_to do |format|
         format.json { render :json => { :success => true, :data => data } }
      end
    end
    
    def show_challenges_data(periodType, period)
      today = Date.today
      if periodType == "day"
        sometime_ago = today - period
      else
        sometime_ago = today >> -period
      end
      challenges = Challenge.all(:merchant => current_merchant)
      #challenge_records = { :names => [], :data => [] }
      challenge_records = []
      challenges_total = []
      challenge_count_sometime_ago = []
      challenges.each do |challenge|
        data = DataMapper.repository(:default).adapter.select(
          "SELECT DATE(created_ts) AS created_date, COUNT(*) AS count FROM earn_reward_records WHERE type = ? 
              AND ref_id = ? AND created_ts >= ? AND deleted_ts IS NULL
              GROUP BY created_date", EarnRewardRecord::Types.index(:challenge)+1, challenge.id, sometime_ago
        )
        #challenge_records[:names] << challenge.name
        #challenge_records[:data] << { :data => data, :counter => 0 }
        challenge_records << { :name => challenge.name, :data => data, :counter => 0 }
        challenge_count = EarnRewardRecord.count(:type => :challenge, :ref_id => challenge.id, :created_ts.gte => sometime_ago)
        challenges_total << [challenge.name, challenge_count]
        challenge_count_sometime_ago << EarnRewardRecord.count(:type => :challenge, :ref_id => challenge.id, :created_ts.lt => sometime_ago)
      end
      
      i = 0
      x = 0 
      challenge_data = []
      challenge_records.each do |records|
        challenge_data[i] = { :name => records[:name], :data => [] }
        y = 0
        sometime_ago.upto(today) do |date|
          challenge_data[i][:data] << [date.to_time.to_i*1000]
          x = records[:counter]
          inserted = false
          if y == 0
            previous_challenge_count = challenge_count_sometime_ago[y]
          else  
            previous_challenge_count = challenge_data[i][:data][y-1][1]
          end
          while x < records[:data].length
            created_date = records[:data][x][:created_date]
            created_date = (created_date.is_a? Date) ? created_date : Date.strptime(created_date,"%Y-%m-%d")
            if created_date < date
              x += 1
            elsif created_date == date
              challenge_data[i][:data][y] << (previous_challenge_count + records[:data][x][:count])
              records[:counter] = x
              inserted = true
              break
            else
              challenge_data[i][:data][y] << previous_challenge_count  
              records[:counter] = x
              inserted = true
              break
            end
          end
          if !inserted
            challenge_data[i][:data][y] << previous_challenge_count
          end
          y += 1
        end
        i += 1
      end
      
      data = {}
      data[:challenges] = { :line_data => challenge_data, :pie_data => challenges_total }  
      respond_to do |format|
         format.json { render :json => { :success => true, :data => data } }
      end
    end
  end
end
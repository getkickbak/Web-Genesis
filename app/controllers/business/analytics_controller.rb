module Business
  class AnalyticsController < BaseApplicationController
    before_filter :authenticate_merchant!
    skip_authorization_check
    
    def index
      if current_merchant.status == :pending
        respond_to do |format|
          format.html { redirect_to setup_path }
        end
      else
        @customers_total = get_customers_total(nil)
        @new_customers_total = get_customers_total(Date.today - 14) 
        @purchases_total = get_purchases_total(nil, Date.today >> -2)
        @revenue_total = get_revenue_total(nil, Date.today >> -2)
        respond_to do |format|
          format.html # index.html.erb
          #format.xml  { render :xml => @merchants }
        end
      end
    end
    
    def show_charts
      today = Date.today
      new_customers_data = []
      new_customers = DataMapper.repository(:default).adapter.select(
          "SELECT DATE(created_ts) AS created_date, COUNT(*) AS count FROM customers WHERE merchant_id = ? 
              AND created_ts >= ? AND deleted_ts IS NULL
              GROUP BY created_date", current_merchant.id, today - 14
        )
      
      i = 0
      x = 0
      two_weeks_ago = today - 14
      two_weeks_ago.upto(today) do |date|
        #puts "begin"
        #new_customers_data[i] = [date]
        new_customers_data[i] = [date.to_time.to_i*1000]
        #puts "new_customers_data: " + new_customers_data[i].to_s 
        inserted = false
        while x < new_customers.length
          logger.debug(new_customers[x][:created_date])
          created_date = Date.strptime(new_customers[x][:created_date],"%Y-%m-%d")
          logger.debug("end")
          if created_date < date
            x += 1
          elsif created_date == date
            new_customers_data[i] << new_customers[x][:count]
            inserted = true
            break  
          else
            new_customers_data[i] << 0    
            inserted = true
            break  
          end
        end
        if !inserted
          new_customers_data[i] << 0
        end
        i += 1
        #puts "end"
      end
      
      two_months_ago = today >> -2
      earn_rewards_total = []
      earn_rewards = DataMapper.repository(:default).adapter.select(
        "SELECT DATE(created_ts) AS created_date, SUM(amount) AS total_amount, COUNT(*) AS count FROM earn_reward_records WHERE type = ? 
            AND merchant_id = ? AND created_ts >= ? AND deleted_ts IS NULL
            GROUP BY created_date", EarnRewardRecord::Types.index(:purchase)+1, current_merchant.id, two_months_ago
      )
      
      challenges = Challenge.all(Challenge.merchant.id => current_merchant.id)
      #challenge_records = { :names => [], :data => [] }
      challenge_records = []
      challenges_total = []
      challenges.each do |challenge|
        data = DataMapper.repository(:default).adapter.select(
          "SELECT DATE(created_ts) AS created_date, COUNT(*) AS count FROM earn_reward_records WHERE type = ? 
              AND ref_id = ? AND created_ts >= ? AND deleted_ts IS NULL
              GROUP BY created_date", EarnRewardRecord::Types.index(:challenge)+1, challenge.id, two_months_ago
        )
        #challenge_records[:names] << challenge.name
        #challenge_records[:data] << { :data => data, :counter => 0 }
        challenge_records << { :name => challenge.name, :data => data, :counter => 0 }
        challenge_count = EarnRewardRecord.count(:type => :challenge, :ref_id => challenge.id, :created_ts.gte => two_months_ago)
        challenges_total << [challenge.name, challenge_count]
      end
      
      earn_rewards_data = { :count => [], :amount => [] }
      challenge_data = []
      
      i = 0
      x = 0
      two_months_ago.upto(today) do |date|
        #puts "begin"
        #earn_rewards_data[i] = [date]
        earn_rewards_data[:count][i] = [date.to_time.to_i*1000]
        earn_rewards_data[:amount][i] = [date.to_time.to_i*1000]
        #puts "earn_rewards: " + earn_rewards[i].to_s
        inserted = false
        while x < earn_rewards.length
          created_date = Date.strptime(earn_rewards[x][:created_date],"%Y-%m-%d")
          if created_date < date
            x += 1
          elsif created_date == date
            earn_rewards_data[:count][i] << earn_rewards[x][:count]
            earn_rewards_data[:amount][i] << earn_rewards[x][:total_amount]
            inserted = true
            break
          else
            earn_rewards_data[:count][i] << 0   
            earn_rewards_data[:amount][i] << 0  
            inserted = true
            break
          end
        end
        if !inserted
          earn_rewards_data[:count][i] << 0
          earn_rewards_data[:amount][i] << 0 
        end
=begin        
        challenge_data[i] = [date]
        #puts "challenge_data: " + challenge_data[i].to_s
        challenge_records[:data].each do |records|
          #puts "challenge_records: " + records.to_s
          x = records[:counter]
          inserted = false
          while x < records[:data].length
            created_date = Date.strptime(records[:data][x][:created_date],"%Y-%m-%d")
            if created_date < date
              x += 1
            elsif created_date == date
              challenge_data[i] << records[:data][x][:count]
              records[:counter] = x
              inserted = true
              break
            else
              challenge_data[i] << 0    
              records[:counter] = x
              inserted = true
              break
            end
          end
          if !inserted
            challenge_data[i] << 0
          end
        end
=end            
        i += 1
        #puts "end"
      end   
      
      i = 0
      challenge_records.each do |records|
        challenge_data[i] = { :name => records[:name], :data => [] }
        y = 0
        two_months_ago.upto(today) do |date|
          challenge_data[i][:data] << [date.to_time.to_i*1000]
          x = records[:counter]
          inserted = false
          while x < records[:data].length
            created_date = Date.strptime(records[:data][x][:created_date],"%Y-%m-%d")
            if created_date < date
              x += 1
            elsif created_date == date
              challenge_data[i][:data][y] << records[:data][x][:count]
              records[:counter] = x
              inserted = true
              break
            else
              challenge_data[i][:data][y] << 0    
              records[:counter] = x
              inserted = true
              break
            end
          end
          if !inserted
            challenge_data[i][:data][y] << 0
          end
          y += 1
        end
        i += 1
      end
      
      data = {}
      data[:new_customers] = new_customers_data
      data[:purchases] = { :line_data => earn_rewards_data[:count], :line_data_amount => earn_rewards_data[:amount] }
      #data[:challenges] = { :line_data => { :names => challenge_records[:names], :data => challenge_data }, :pie_data => challenges_total }  
      data[:challenges] = { :line_data => challenge_data, :pie_data => challenges_total }  
      respond_to do |format|
         format.json { render :json => { :success => true, :data => data } }
      end
    end
    
    private 
    
    def get_customers_total(date)
      if date.nil?
        Customer.count(Customer.merchant.id => current_merchant.id)
      else
        Customer.count(Customer.merchant.id => current_merchant.id, :created_ts.gte => date)
      end  
    end
    
    def get_purchases_total(venue, date)
      EarnRewardRecord.count(:type => :purchase, EarnRewardRecord.merchant.id => current_merchant.id, :created_ts.gte => date)
    end
    
    def get_revenue_total(venue, date)
      EarnRewardRecord.sum(:amount, :type => :purchase, EarnRewardRecord.merchant.id => current_merchant.id, :created_ts.gte => date)
    end
  end
end
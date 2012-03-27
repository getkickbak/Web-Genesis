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
        @customers_total = get_customers_total
        @purchases_total = get_purchases_total(nil)
        @challenges_total = get_challenges_total(nil)
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
              AND created_date >= ? AND deleted_ts IS NULL
              GROUP BY created_date", current_merchant.id, today - 14
        )
      
      i = 0
      x = 0
      two_weeks_ago = today - 14
      two_weeks_ago.upto(today) do |date|
        #puts "begin"
        new_customers_data[i] = [date]
        #puts "new_customers_data: " + new_customers_data[i].to_s 
        inserted = false
        while x < new_customers.length
          created_date = Date.strptime(new_customers[x][:created_date],"%Y-%m-%d")
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
      
      purchase_rewards = PurchaseReward.all(PurchaseReward.merchant.id => current_merchant.id)
      earn_reward_records = { :names => [], :data => [] }
      purchase_rewards.each do |reward|
        data = DataMapper.repository(:default).adapter.select(
          "SELECT DATE(created_ts) AS created_date, COUNT(*) AS count FROM earn_reward_records WHERE reward_id = ? 
              AND created_date >= ? AND deleted_ts IS NULL
              GROUP BY created_date", reward.id, today >> -2
        )
        earn_reward_records[:names] << reward.title
        earn_reward_records[:data] << { :data => data, :counter => 0 }
      end
      
      challenges = Challenge.all(Challenge.merchant.id => current_merchant.id)
      challenge_records = { :names => [], :data => [] }
      challenges.each do |challenge|
        data = DataMapper.repository(:default).adapter.select(
          "SELECT DATE(created_ts) AS created_date, COUNT(*) AS count FROM earn_reward_records WHERE challenge_id = ? 
              AND created_date >= ? AND deleted_ts IS NULL
              GROUP BY created_date", challenge.id, today >> -2
        )
        challenge_records[:names] << challenge.name
        challenge_records[:data] << { :data => data, :counter => 0 }
      end
      
      earn_rewards = []
      challenge_data = []
      
      i = 0
      two_months_ago = today >> -2
      two_months_ago.upto(today) do |date|
        #puts "begin"
        earn_rewards[i] = [date]
        #puts "earn_rewards: " + earn_rewards[i].to_s
        earn_reward_records[:data].each do |records|
          #puts "earn_reward_records: " + records.to_s
          x = records[:counter]
          inserted = false
          while x < records[:data].length
            created_date = Date.strptime(records[:data][x][:created_date],"%Y-%m-%d")
            if created_date < date
              x += 1
            elsif created_date == date
              earn_rewards[i] << records[:data][x][:count]
              records[:counter] = x
              inserted = true
              break
            else
              earn_rewards[i] << 0    
              records[:counter] = x
              inserted = true
              break
            end
          end
          if !inserted
            earn_rewards[i] << 0
          end
        end
        
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
              break
            else
              challenge_data[i] << 0    
              records[:counter] = x
              break
            end
          end
          if !inserted
            challenge_data[i] << 0
          end
        end
        i += 1
        #puts "end"
      end
      
      data = {}
      data[:new_customers] = new_customers_data
      data[:purchases] = { :names => earn_reward_records[:names], :data => earn_rewards }
      data[:challenges] = { :names => challenge_records[:names], :data => challenge_data }     
      respond_to do |format|
         format.json { render :json => { :success => true, :data => data } }
      end
    end
    
    private 
    
    def get_customers_total
      Customer.count(Customer.merchant.id => current_merchant.id)  
    end
    
    def get_purchases_total(venue)
      purchases_total = []
      if venue.nil?
        purchase_rewards = PurchaseReward.all(PurchaseReward.merchant.id => current_merchant.id)
      else
        purchase_rewards = venue.purchase_rewards
      end
      purchase_rewards.each do |reward|
        purchases_total << { :name => reward.title, :total => EarnRewardRecord.count(:reward_id => reward.id) }
      end
      return purchases_total
    end
    
    def get_challenges_total(venue)
      challenges_total = []
      if venue.nil?
        challenges = Challenge.all(Challenge.merchant.id => current_merchant.id)
      else
        challenges = venue.challenges
      end
      challenges.each do |challenge|
        challenges_total << { :name => challenge.name, :total => EarnRewardRecord.count(:challenge_id => challenge.id) }
      end
      return challenges_total
    end
  end
end
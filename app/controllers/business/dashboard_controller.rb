module Business
  class DashboardController < BaseApplicationController
    before_filter :authenticate_merchant!
    skip_authorization_check
    def index
      if current_merchant.status == :pending
        respond_to do |format|
          format.html { redirect_to setup_path }
        end
      else
        @total_reward_points = (EarnRewardRecord.sum(:points, :merchant => current_merchant) || 0) - (RedeemRewardRecord.sum(:points, :merchant => current_merchant, :mode => :reward) || 0)
        @total_prize_points = (EarnPrizeRecord.sum(:points, :merchant => current_merchant) || 0) - (RedeemRewardRecord.sum(:points, :merchant => current_merchant, :mode => :prize) || 0)
        respond_to do |format|
          format.html # index.html.erb
        #format.xml  { render :xml => @merchants }
        end
      end
    end

    def show_charts
      two_months_ago = today >> -2
      earn_rewards = DataMapper.repository(:default).adapter.select(
      "SELECT DATE(created_ts) AS created_date, SUM(points) AS total_points FROM earn_reward_records WHERE
              merchant_id = ? AND created_date >= ? AND deleted_ts IS NULL
              GROUP BY created_date", current_merchant.id, two_months_ago
      )
      redeem_rewards = DataMapper.repository(:default).adapter.select(
      "SELECT DATE(created_ts) AS created_date, SUM(points) AS total_points FROM redeem_reward_records WHERE
              merchant_id = ? AND mode = ? AND created_date >= ? AND deleted_ts IS NULL
              GROUP BY created_date", current_merchant.id, RedeemCustomerRecord::Modes.index(:reward)+1, two_months_ago
      )
      earn_prizes = DataMapper.repository(:default).adapter.select(
      "SELECT DATE(created_ts) AS created_date, SUM(points) AS total_points FROM earn_prize_records WHERE
              merchant_id = ? AND created_date >= ? AND deleted_ts IS NULL
              GROUP BY created_date", current_merchant.id, two_months_ago
      )
      redeem_prizes = DataMapper.repository(:default).adapter.select(
      "SELECT DATE(created_ts) AS created_date, SUM(points) AS total_points FROM redeem_reward_records WHERE
              merchant_id = ? AND mode = ? AND created_date >= ? AND deleted_ts IS NULL
              GROUP BY created_date", current_merchant.id, RedeemCustomerRecord::Modes.index(:prize)+1, two_months_ago
      )
      earn_rewards_data = []
      redeem_rewards_data = []
      earn_prizes_data = []
      redeem_prizes_data = []
      two_months_ago.upto(today) do |date|
        earn_rewards_data[i] = [date.to_time.to_i*1000]
        redeem_rewards_data[i] = [date.to_time.to_i*1000]
        earn_prizes_data[i] = [date.to_time.to_i*1000]
        redeem_prizes_data[i] = [date.to_time.to_i*1000]
        inserted = false
        while x < earn_rewards.length
          created_date = Date.strptime(earn_rewards[x][:created_date],"%Y-%m-%d")
          if created_date < date
          x += 1
          elsif created_date == date
            earn_rewards_data[i] << earn_rewards[x][:total_points]
          inserted = true
          break
          else
            earn_rewards_data[i] << 0
          inserted = true
          break
          end
        end
        if !inserted
          earn_rewards_data[i] << 0
        end

        inserted = false
        while x < redeem_rewards.length
          created_date = Date.strptime(redeem_rewards[x][:created_date],"%Y-%m-%d")
          if created_date < date
          x += 1
          elsif created_date == date
            redeem_rewards_data[i] << redeem_rewards[x][:total_points]
          inserted = true
          break
          else
            redeem_rewards_data[i] << 0
          inserted = true
          break
          end
        end
        if !inserted
          redeem_rewards_data[i] << 0
        end
        
        inserted = false
        while x < earn_prizes.length
          created_date = Date.strptime(earn_prizes[x][:created_date],"%Y-%m-%d")
          if created_date < date
          x += 1
          elsif created_date == date
            earn_prizes_data[i] << earn_prizes[x][:total_points]
          inserted = true
          break
          else
            earn_prizes_data[i] << 0
          inserted = true
          break
          end
        end
        if !inserted
          earn_prizes_data[i] << 0
        end
        
        inserted = false
        while x < redeem_prizes.length
          created_date = Date.strptime(redeem_prizes[x][:created_date],"%Y-%m-%d")
          if created_date < date
          x += 1
          elsif created_date == date
            redeem_prizes_data[i] << redeem_prizes[x][:total_points]
          inserted = true
          break
          else
            redeem_prizes_data[i] << 0
          inserted = true
          break
          end
        end
        if !inserted
          redeem_rewards_data[i] << 0
        end
        
        i += 1
      end
      data[:earn_rewards] = earn_rewards_data
      data[:redeem_rewards] = redeem_rewards_data
      data[:earn_prizes] = earn_prizes_data
      data[:redeem_prizes] = redeem_prizes_data
      respond_to do |format|
        format.json { render :json => { :success => true, :data => data } }
      end
    end
  end
end
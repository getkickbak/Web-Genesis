module PointsExpirationReminders
  @queue = :points_expiration_reminders
  
  def self.logger
    @logger ||= Logger.new("#{Rails.root}/log/points_expiration_reminders.log")
  end
  
  def self.perform()
=begin    
    if Rails.env == 'production'
      earned_points_sql = "SELECT merchant_id, customer_id, SUM(points) AS earned_points, DATE(created_ts) AS created_date
              FROM earn_reward_record 
              WHERE user_id = ? AND (PERIODDIFF(date_format(?, '%Y%m') - date_format(created_ts, '%Y%m')) = 9 AND deleted_ts IS NULL
              GROUP BY merchant_id"
      redeemed_points_sql = "SELECT merchant_id, SUM(points) AS redeemed_points, PERIODDIFF(date_format(?, '%Y%m') - date_format(created_ts, '%Y%m')) AS months_ago
              FROM redeem_reward_record
              WHERE cutomer_id IN (?) AND deleted_ts IS NULL
              GROUP BY merchant_id HAVING (months_ago BETWEEN 0 AND 9)"   
      transfer_in_points_sql = "SELECT merchant_id, recipient_id, SUM(points) AS transfer_in_points, DATE(created_ts) AS created_date
              FROM transfer_points_record 
              WHERE recipient_user_id = ? AND PERIODDIFF(date_format(?, '%Y%m') - date_format(created_ts, '%Y%m')) = 9 AND deleted_ts IS NULL
              GROUP BY recipient_id"
      transfer_out_points_sql = "SELECT merchant_id, sender_id, SUM(points) AS transfer_out_points, PERIODDIFF(date_format(?, '%Y%m') - date_format(created_ts, '%Y%m')) AS months_ago
              FROM transfer_points_record 
              WHERE sender_id IN (?) AND deleted_ts IS NULL
              GROUP BY sender_id HAVING (months_ago BETWEEN 0 AND 9)"                    
    else
      earned_points_sql = "SELECT merchant_id, customer_id, SUM(points) AS earned_points, DATE(created_ts) AS created_date
              FROM earn_reward_record 
              WHERE user_id = ? AND (julianday(strftime('%Y-%m-%d',?)) - julianday(strftime('%Y-%m-%d',created_ts))) / 30 = 9 AND deleted_ts IS NULL
              GROUP BY merchant_id"     
      redeemed_points_sql = "SELECT merchant_id, SUM(points) AS redeemed_points, (julianday(strftime('%Y-%m-%d',?)) - julianday(strftime('%Y-%m-%d',created_ts))) / 30 AS months_ago
              FROM redeem_reward_record 
              WHERE customer_id IN (?) AND deleted_ts IS NULL
              GROUP BY merchant_id HAVING (months_ago BETWEEN 0 AND 9)"   
      transfer_in_points_sql = "SELECT merchant_id, recipient_id, SUM(points) AS transfer_in_points, DATE(created_ts) AS created_date
              FROM transfer_points_record
              WHERE sender_user_id = ? AND (julianday(strftime('%Y-%m-%d',?)) - julianday(strftime('%Y-%m-%d',created_ts))) / 30 = 9 AND deleted_ts IS NULL
              GROUP BY recipient_id"
      transfer_out_points_sql = "SELECT merchant_id, sender_id, SUM(points) AS transfer_out_points, (julianday(strftime('%Y-%m-%d',?)) - julianday(strftime('%Y-%m-%d',created_ts))) / 30 AS months_ago
              FROM transfer_points_record
              WHERE sender_id IN (?) AND deleted_ts IS NULL
              GROUP BY sender_id HAVING (months_ago BETWEEN 0 AND 9)"           
    end
    now = Time.now
    logger.info("Points Expiration Reminders started at #{now.strftime("%a %m/%d/%y %H:%M %Z")}")
    users = User.all
    users.each do |user|
      earned_points_records = DataMapper.repository(:default).adapter.select(
        earned_points_sql, user.id, now, now
      )
      transfer_in_points_records = DataMapper.repository(:default).adapter.select(
        transfer_in_points_sql, user.id, now
      )
      if earned_points_records.length > 0 || transfer_in_points_sql.length > 0
        merchant_ids = []
        customer_ids = []
        records = []
        merchant_id_to_earned_points = {}
        earned_points_records.each do |record|
          merchant_ids << record[:merchant_id]
          customer_ids << record[:customer_id]
          beginning_of_month = (Date.strptime(record[:created_date],"%Y-%m-%d") + 12.months).at_beginning_of_month
          merchant_id_to_earned_points[record[:merchant_id]] = { :points => record[:earned_points], :expiry_date => beginning_of_month }    
        end
        merchant_id_to_transfer_in_points = {}
        transfer_in_points_records.each do |record|
          merchant_ids << record[:merchant_id]
          customer_ids << record[:recipient_id]
          beginning_of_month = (Date.strptime(record[:created_date],"%Y-%m-%d") + 12.months).at_beginning_of_month
          merchant_id_to_transfer_in_points[record[:merchant_id]] = { :points => record[:transfer_in_points], :expiry_date => beginning_of_month }
        end
        customer_ids.uniq!
        redeemed_points_records = DataMapper.repository(:default).adapter.select(
          redeemed_points_sql, customer_ids.join(','), now, now
        )
        merchant_id_to_redeemed_points = {}
        redeemed_points_records.each do |record|
          merchant_id_to_redeemed_points[record[:merchant_id]] = record[:redeemed_points]
        end
        transfer_out_points_records = DataMapper.repository(:default).adapter.select(
          transfer_out_points_sql, customer_ids.join(','), now, now
        )
        merchant_id_to_transfer_out_points = {}
        transfer_out_points_records.each do |record|
          merchant_id_to_transfer_out_points[record[:merchant_id]] = record[:transfer_out_points]
        end
        merchant_ids.uniq!
        merchants = Merchant.all(:id => merchant_ids)
        merchants.each do |merchant|
          expired_points = ((merchant_id_to_earned_points[merchant.id][:points] || 0) + (merchant_id_to_transfer_in_points[merchant.id][:points] || 0)) - ((merchant_id_to_redeemed_points[merchant.id] || 0) + (merchant_id_to_transfer_out_points[merchant.id] || 0))
          if expired_points > 0
            records << {:merchant => merchant, :points => expired_points, :expiry_date => (merchant_id_to_earned_points[merchant.id][:expiry_date] || merchant_id_to_transfer_in_points[merchant.id][:expiry_date])}
          end
        end
        UserMailer.points_expiration_reminder_email(user, records).deliver
      end
    end
    now = Time.now
    logger.info("Points Expiration Reminders completed successfully at #{now.strftime("%a %m/%d/%y %H:%M %Z")}")
=end    
  end
end
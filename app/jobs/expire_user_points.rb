module ExpireUserPoints
  @queue = :expire_user_points
  
  def self.logger
    @logger ||= Logger.new("#{Rails.root}/log/expire_user_points.log")
  end

  def self.perform(auto)
    now = Time.now
    logger.info("Expire User Points started at #{now.strftime("%a %m/%d/%y %H:%M %Z")}")
    if RAILS_ENV == 'production'
      earned_points_sql = "SELECT customer_id, SUM(points) AS earned_points
              FROM earn_reward_record 
              WHERE user_id = ? AND PERIODDIFF(date_format(?, '%Y%m') - date_format(created_ts, '%Y%m')) = 12 AND deleted_ts IS NULL
              GROUP BY customer_id"
      redeemed_points_sql = "SELECT customer_id, SUM(points) AS redeemed_points, PERIODDIFF(date_format(?, '%Y%m') - date_format(created_ts, '%Y%m')) AS months_ago
              FROM redeem_reward_record 
              WHERE customer_id IN (?) AND (months_ago BETWEEN 0 AND 12) AND deleted_ts IS NULL
              GROUP BY customer_id"      
      transfer_in_points_sql = "SELECT recipient_id, SUM(points) AS transfer_in_points
              FROM transfer_points_record 
              WHERE recipient_user_id = ? AND PERIODDIFF(date_format(?, '%Y%m') - date_format(created_ts, '%Y%m')) = 12 AND deleted_ts IS NULL
              GROUP BY recipient_id"
      transfer_out_points_sql = "SELECT sender_id, SUM(points) AS transfer_out_points, PERIODDIFF(date_format(?, '%Y%m') - date_format(created_ts, '%Y%m')) AS months_ago
              FROM transfer_points_record 
              WHERE sender_id IN (?) AND (months_ago BETWEEN 0 AND 12) AND deleted_ts IS NULL
              GROUP BY sender_id"          
    else
      earned_points_sql = "SELECT customer_id, SUM(points) AS earned_points
              FROM earn_reward_record
              WHERE user_id = ? AND (julianday(strftime('%Y-%m-%d',?)) - julianday(strftime('%Y-%m-%d',created_ts))) = 12 AND deleted_ts IS NULL
              GROUP BY customer_id"     
      redeemed_points_sql = "SELECT customer_id, SUM(points) AS redeemed_points, (julianday(strftime('%Y-%m-%d',?)) - julianday(strftime('%Y-%m-%d',created_ts))) / 30 AS months_ago
              FROM redeem_reward_record 
              WHERE customer_id IN (?) AND (months_ago BETWEEN 0 AND 12) AND deleted_ts IS NULL
              GROUP BY customer_id"      
      transfer_in_points_sql = "SELECT recipient_id, SUM(points) AS transfer_in_points
              FROM transfer_points_record
              WHERE sender_user_id = ? AND (julianday(strftime('%Y-%m-%d',?)) - julianday(strftime('%Y-%m-%d',created_ts))) = 12 AND deleted_ts IS NULL
              GROUP BY recipient_id"
      transfer_out_points_sql = "SELECT sender_id, SUM(points) AS transfer_out_points, (julianday(strftime('%Y-%m-%d',?)) - julianday(strftime('%Y-%m-%d',created_ts))) / 30 AS months_ago
              FROM transfer_points_record
              WHERE sender_id IN (?) AND (months_ago BETWEEN 0 AND 12) AND deleted_ts IS NULL
              GROUP BY sender_id"             
    end
    now = Time.now
    logger.info("Expire User Points started at #{now.strftime("%a %m/%d/%y %H:%M %Z")}")
    users = User.all
    users.each do |user|
      earned_points_records = DataMapper.repository(:default).adapter.select(
        earned_points_sql, user.id, now
      )
      transfer_in_points_records = DataMapper.repository(:default).adapter.select(
        transfer_in_points_sql, user.id, now
      )
      if earned_points_record.length > 0 || transfer_in_points_sql.length > 0
        customer_ids = []
        customer_id_to_expired_points = {}
        earned_points_records.each do |record|
          customer_ids << record[:customer_id]
          customer_id_to_expired_points[record[:customer_id]] = record[:earned_points]
        end
        customer_id_to_transfer_in_points = {}
        transfer_in_points_records.each do |record|
          customer_ids << record[:recipient_id]
          customer_id_to_transfer_in_points[record[:recipient_id]] = record[:transfer_in_points]
        end
        customer_ids.uniq!
        redeemed_points_records = DataMapper.repository(:default).adapter.select(
          redeemed_points_sql, customer_ids.join(','), now
        )
        customer_id_to_redeemed_points = {}
        redeemed_points_records.each do |record|
          customer_id_to_redeemed_points[record[:customer_id]] = record[:redeemed_points]
        end
        transfer_out_points_records = DataMapper.repository(:default).adapter.select(
          transfer_out_points_sql, customer_ids.join(','), now
        )
        customer_id_to_transfer_out_points = {}
        transfer_out_points_records.each do |record|
          customer_id_to_transfer_out_points[record[:sender_id]] = record[:transfer_out_points]
        end
        customers = Customer.all(:id => customer_ids)
        customers.each do |customer|
          expired_points = ((customer_id_to_expired_points[customer.id] || 0) + (customer_id_to_transfer_in_points[customer.id] || 0)) - ((customer_id_to_redeemed_points[customer.id] || 0) + (customer_id_to_transfer_out_points[customer.id] || 0))
          if expired_points > 0
            customer.points -= expired_points
            customer.update_ts = now
            customer.save
            trans_record = TransactionRecord.new(
              :type => :expire,
              :ref_id => 0,
              :description => I18n.t("transactions.expire"),
              :points => -expired_points,
              :created_ts => now,
              :update_ts => now
            )
            trans_record.merchant = customer.merchant
            trans_record.customer = customer
            trans_record.user = user
            trans_record.save
          end
        end
      end
    end
    now = Time.now
    logger.info("Expire User Points completed successfully at #{now.strftime("%a %m/%d/%y %H:%M %Z")}")
    now = Time.now
    logger.info("Expire User Points completed successfully at #{now.strftime("%a %m/%d/%y %H:%M %Z")}")
  end
end
module PointsSummary
  @queue = :points_summary
  def self.logger
    @logger ||= Logger.new("#{Rails.root}/log/points_summary.log")
  end

  def self.perform()
    if Rails.env == 'production'
      earned_points_sql = "SELECT merchant_id, customer_id, DATE(created_ts) AS created_date
              FROM earn_reward_record
              WHERE user_id = ? AND (PERIODDIFF(date_format(?, '%Y%m') - date_format(created_ts, '%Y%m')) = 1 AND deleted_ts IS NULL
              ORDER BY created_ts
              DESC LIMIT 0,1"
    else
      earned_points_sql = "SELECT merchant_id, customer_id, DATE(created_ts) AS created_date
              FROM earn_reward_record
              WHERE user_id = ? AND (julianday(strftime('%Y-%m-%d',?)) - julianday(strftime('%Y-%m-%d',created_ts))) / 30 = 1 AND deleted_ts IS NULL"
    end
    now = Time.now
    logger.info("Points Expiration Reminders started at #{now.strftime("%a %m/%d/%y %H:%M %Z")}")

    begin
      count = User.count
      max = 500
      n = 1
      if count == max
        n = count/max
      elsif count > max
        n = count/max + 1
      end
      for i in 0..n-1
        logger.info("Sending iteration #{i+1}")
        start = i*max
        users = User.all(:fields => [:user_id], :offset => start, :limit => max)
        users.each do |user|
          earned_points_records = DataMapper.repository(:default).adapter.select(
            earned_points_sql, user.id, now, now
          )
          UserMailer.points_summary_email(user, records).deliver
        end
      end
    end
    now = Time.now
    logger.info("Points Expiration Reminders completed successfully at #{now.strftime("%a %m/%d/%y %H:%M %Z")}")
  end
end
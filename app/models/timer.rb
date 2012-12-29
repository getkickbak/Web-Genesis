class Timer
  def initialize(mode, interval, &block)
    if mode == "one_time"
      @thread = Thread.new {
        Rails.logger.info("About to sleep")
        sleep interval
        Rails.logger.info("Before calling callback")
        yield
     }
    else
      loop do
        @thread = Thread.new {
          sleep interval
          yield
        }
      end 
    end
  end

  def cancel
    @thread.exit
  end
end
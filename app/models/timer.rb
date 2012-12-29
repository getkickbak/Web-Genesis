class Timer
  def initialize(mode, interval, &block)
    if mode == "one_time"
      @thread = Thread.new {
        sleep interval
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
    @thread.exit if not @thread.nil?
  end
end
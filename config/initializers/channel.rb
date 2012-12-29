Channel.setup
n = 100
n.times do |x|
  Channel.add("/tmp/channel_#{x}")
end

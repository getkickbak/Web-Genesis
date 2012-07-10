$LOAD_PATH.unshift File.dirname(__FILE__) + '/../../lib/pushwoosh'
puts $LOAD_PATH
require 'resque/tasks'
require 'resque_scheduler/tasks'

task "resque:setup" => :environment
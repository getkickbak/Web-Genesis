namespace :db do
  desc "Generate User Tags"
  task :generate_tags, [:num] => :environment do |t, args|
    Time.zone = "Eastern Time (US & Canada)"
    puts "Creating User Tags ..."
    num = args[:num].to_i
    num.times do |i|
      UserTag.create
    end    
    puts "Complete User Tags creation"
  end
end
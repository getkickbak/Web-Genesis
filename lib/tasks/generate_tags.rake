namespace :db do
  desc "Generate User Tags"
  task :generate_tags, [:num] => :environment do |t, args|
    Time.zone = "Eastern Time (US & Canada)"
    file = File.open("tags.csv", 'w+')
    puts "Creating User Tags ..."
    num = args[:num].to_i
    num.times do |i|
      tag = UserTag.create
      file.puts(tag.tag_id)
    end    
    file.flush
    puts "Complete User Tags creation"
  end
end
namespace :db do
  desc "Import User Tags"
  task :generate_tags, [:num] => :environment do |t, args|
    Time.zone = "Eastern Time (US & Canada)"
    file = File.open("tags.csv", 'r')
    while (line = file.gets)
      tag_id = line.split(',')[0]
      UserTag.create(:pending, tag_id)
    end
    puts "Complete User Tags import"
  end
end
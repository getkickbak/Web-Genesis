namespace :db do
  desc "Generate User Tags"
  task :generate_tags, [:num] => :environment do |t, args|
    Time.zone = "Eastern Time (US & Canada)"
    file = File.open("tags.csv", 'w+')
    file.puts("Printed UUID,Payload UUID")
    puts "Creating User Tags ..."
    num = args[:num].to_i
    num.times do |i|
      tag = UserTag.create
      tag_id_json = {
        "tagID" => "#{tag.tag_id}" 
      }.to_json
      file.puts("#{tag.tag_id},#{tag_id_json}")
    end    
    file.flush
    puts "Complete User Tags creation"
  end
end
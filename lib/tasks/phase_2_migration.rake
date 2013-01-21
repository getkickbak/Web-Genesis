namespace :db do
  desc "Phase 2 Migration"
  task :phase_2_migration, [:num] => :environment do |t, args|
    puts "Starting migration ..."
    users = User.all(:facebook_id.not => "")
    users.each do |user|
      user.update_facebook_auth(:provider => "facebook", :uid => user.facebook_id)
    end
    puts "Complete migration"
  end
end
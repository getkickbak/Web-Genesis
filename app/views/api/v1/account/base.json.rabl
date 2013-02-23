object @account
attributes :name, :email, :phone
node( :gender ) { |m| m.profile.gender }
node( :birthday ) { |m| m.profile.birthday == ::Constant::MIN_DATE ? nil : m.profile.birthday }

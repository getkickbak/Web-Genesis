object @account
attributes :name, :email, :phone
node( :virtual_tag_id ) { |m| m.virtual_tag.tag_id }
node( :gender ) { |m| m.profile.gender }
node( :birthday ) { |m| m.profile.birthday == ::Constant::MIN_DATE ? nil : m.profile.birthday }

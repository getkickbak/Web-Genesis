class PhoneFormatValidator < ActiveModel::EachValidator  
  def validate_each(object, attribute, value)  
    unless value =~ /^[\d]+$/  
      error_msg = I18n.t('errors.messages.phone_format', :attribute => I18n.t('activemodel.attributes.contact.phone'))
      object.errors[attribute] << (options[:message] || error_msg)  
    end  
  end  
end 
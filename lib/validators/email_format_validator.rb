class EmailFormatValidator < ActiveModel::EachValidator  
  def validate_each(object, attribute, value)  
    unless value =~ /^([^@\s]+)@((?:[-a-z0-9]+\.)+[a-z]{2,})$/i  
      error_msg = I18n.t('errors.messages.email_format', :attribute => I18n.t('activemodel.attributes.contact.email'))
      object.errors[attribute] << (options[:message] || error_msg)  
    end  
  end  
end 
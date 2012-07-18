class DeviseFailure < Devise::FailureApp

  protected
  
  def http_auth_body
    return i18n_message unless request_format
    method = "to_#{request_format}"
    if method == "to_xml"
      { :error => i18n_message }.to_xml(:root => "errors")
    elsif method == "to_json" || method == "to_*/*"
      { :success => false, :metaData => { :session_timeout => true, :rescode => 'server_error' }, :message => [i18n_message] }.to_json
    elsif {}.respond_to?(method)
      { :error => i18n_message }.send(method)
    else
      i18n_message
    end
  end
end
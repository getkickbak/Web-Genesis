class CarmenCountryInput < SimpleForm::Inputs::PriorityInput
  def input
    @builder.send(:"country_select", attribute_name, options, input_html_options)
  end
end
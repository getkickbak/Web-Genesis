class SubRegionInput < SimpleForm::Inputs::CollectionSelectInput
  def input
    @builder.send(:"subregion_select", attribute_name, options[:parent_region], options, input_html_options)
  end
end
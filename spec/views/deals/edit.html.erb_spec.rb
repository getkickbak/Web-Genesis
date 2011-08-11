require 'spec_helper'

describe "deals/edit.html.erb" do
  before(:each) do
    @deal = assign(:deal, stub_model(Deal,
      :new_record? => false
    ))
  end

  it "renders the edit deal form" do
    render

    # Run the generator again with the --webrat-matchers flag if you want to use webrat matchers
    assert_select "form", :action => deal_path(@deal), :method => "post" do
    end
  end
end

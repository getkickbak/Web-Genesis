require 'spec_helper'

describe "merchants/edit.html.erb" do
  before(:each) do
    @merchant = assign(:merchant, stub_model(Merchant,
      :new_record? => false
    ))
  end

  it "renders the edit merchant form" do
    render

    # Run the generator again with the --webrat-matchers flag if you want to use webrat matchers
    assert_select "form", :action => merchant_path(@merchant), :method => "post" do
    end
  end
end

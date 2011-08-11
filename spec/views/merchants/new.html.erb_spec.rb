require 'spec_helper'

describe "merchants/new.html.erb" do
  before(:each) do
    assign(:merchant, stub_model(Merchant).as_new_record)
  end

  it "renders new merchant form" do
    render

    # Run the generator again with the --webrat-matchers flag if you want to use webrat matchers
    assert_select "form", :action => merchants_path, :method => "post" do
    end
  end
end

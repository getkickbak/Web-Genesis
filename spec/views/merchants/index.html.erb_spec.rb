require 'spec_helper'

describe "merchants/index.html.erb" do
  before(:each) do
    assign(:merchants, [
      stub_model(Merchant),
      stub_model(Merchant)
    ])
  end

  it "renders a list of merchants" do
    render
  end
end

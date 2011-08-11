require 'spec_helper'

describe "merchants/show.html.erb" do
  before(:each) do
    @merchant = assign(:merchant, stub_model(Merchant))
  end

  it "renders attributes in <p>" do
    render
  end
end

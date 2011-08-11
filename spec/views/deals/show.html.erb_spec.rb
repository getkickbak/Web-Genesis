require 'spec_helper'

describe "deals/show.html.erb" do
  before(:each) do
    @deal = assign(:deal, stub_model(Deal))
  end

  it "renders attributes in <p>" do
    render
  end
end

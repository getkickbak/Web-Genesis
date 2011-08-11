require 'spec_helper'

describe "orders/edit.html.erb" do
  before(:each) do
    @order = assign(:order, stub_model(Order,
      :new_record? => false
    ))
  end

  it "renders the edit order form" do
    render

    # Run the generator again with the --webrat-matchers flag if you want to use webrat matchers
    assert_select "form", :action => order_path(@order), :method => "post" do
    end
  end
end

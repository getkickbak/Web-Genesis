require 'spec_helper'

describe "referrals/edit.html.erb" do
  before(:each) do
    @referral = assign(:referral, stub_model(Referral,
      :new_record? => false
    ))
  end

  it "renders the edit referral form" do
    render

    # Run the generator again with the --webrat-matchers flag if you want to use webrat matchers
    assert_select "form", :action => referral_path(@referral), :method => "post" do
    end
  end
end

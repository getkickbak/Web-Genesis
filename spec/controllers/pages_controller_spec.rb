require 'spec_helper'

describe PagesController do

  describe "GET 'how_it_works'" do
    it "should be successful" do
      get 'how_it_works'
      response.should be_success
    end
  end

end

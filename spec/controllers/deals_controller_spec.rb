require 'spec_helper'

describe DealsController do

  def mock_deal(stubs={})
    (@mock_deal ||= mock_model(Deal).as_null_object).tap do |deal|
      deal.stub(stubs) unless stubs.empty?
    end
  end

  describe "GET index" do
    it "assigns all deals as @deals" do
      Deal.stub(:all) { [mock_deal] }
      get :index
      assigns(:deals).should eq([mock_deal])
    end
  end

  describe "GET show" do
    it "assigns the requested deal as @deal" do
      Deal.stub(:get).with("37") { mock_deal }
      get :show, :id => "37"
      assigns(:deal).should be(mock_deal)
    end
  end

  describe "GET new" do
    it "assigns a new deal as @deal" do
      Deal.stub(:new) { mock_deal }
      get :new
      assigns(:deal).should be(mock_deal)
    end
  end

  describe "GET edit" do
    it "assigns the requested deal as @deal" do
      Deal.stub(:get).with("37") { mock_deal }
      get :edit, :id => "37"
      assigns(:deal).should be(mock_deal)
    end
  end

  describe "POST create" do

    describe "with valid params" do
      it "assigns a newly created deal as @deal" do
        Deal.stub(:new).with({'these' => 'params'}) { mock_deal(:save => true) }
        post :create, :deal => {'these' => 'params'}
        assigns(:deal).should be(mock_deal)
      end

      it "redirects to the created deal" do
        Deal.stub(:new) { mock_deal(:save => true) }
        post :create, :deal => {}
        response.should redirect_to(deal_url(mock_deal))
      end
    end

    describe "with invalid params" do
      it "assigns a newly created but unsaved deal as @deal" do
        Deal.stub(:new).with({'these' => 'params'}) { mock_deal(:save => false) }
        post :create, :deal => {'these' => 'params'}
        assigns(:deal).should be(mock_deal)
      end

      it "re-renders the 'new' template" do
        Deal.stub(:new) { mock_deal(:save => false) }
        post :create, :deal => {}
        response.should render_template("new")
      end
    end

  end

  describe "PUT update" do

    describe "with valid params" do
      it "updates the requested deal" do
        Deal.should_receive(:get).with("37") { mock_deal }
        mock_deal.should_receive(:update).with({'these' => 'params'})
        put :update, :id => "37", :deal => {'these' => 'params'}
      end

      it "assigns the requested deal as @deal" do
        Deal.stub(:get) { mock_deal(:update => true) }
        put :update, :id => "1"
        assigns(:deal).should be(mock_deal)
      end

      it "redirects to the deal" do
        Deal.stub(:get) { mock_deal(:update => true) }
        put :update, :id => "1"
        response.should redirect_to(deal_url(mock_deal))
      end
    end

    describe "with invalid params" do
      it "assigns the deal as @deal" do
        Deal.stub(:get) { mock_deal(:update => false) }
        put :update, :id => "1"
        assigns(:deal).should be(mock_deal)
      end

      it "re-renders the 'edit' template" do
        Deal.stub(:get) { mock_deal(:update => false) }
        put :update, :id => "1"
        response.should render_template("edit")
      end
    end

  end

  describe "DELETE destroy" do
    it "destroys the requested deal" do
      Deal.should_receive(:get).with("37") { mock_deal }
      mock_deal.should_receive(:destroy)
      delete :destroy, :id => "37"
    end

    it "redirects to the deals list" do
      Deal.stub(:get) { mock_deal }
      delete :destroy, :id => "1"
      response.should redirect_to(deals_url)
    end
  end

end

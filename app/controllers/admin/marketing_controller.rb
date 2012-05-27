module Admin
  class MarketingController < BaseApplicationController
    before_filter :authenticate_staff!
    skip_authorization_check

    @@check_in_template = ERB.new File.read(File.expand_path "app/views/admin/marketing/generic_check_in_template.html.erb")
    
    def index
      respond_to do |format|
        format.html # index.html.erb
      #format.xml  { render :xml => @merchants }
      end
    end

    def update_poster_image
      
    end

    def update_checkin_image
      html = @@check_in_template.result
      kit = PDFKit.new(html, :page_size => 'Tabloid')
      AWS::S3::S3Object.store(
        "check_in.pdf",
        kit.to_pdf,
        APP_PROP["AMAZON_FILES_BUCKET"],
        :content_type => 'application/pdf',
        :access => :public_read
      )
      
      respond_to do |format|
        format.html { redirect_to(marketing_path, :notice => t("admin.marketing.update_checkin_image_success")) }
        #format.xml  { render :xml => @merchant, :status => :created, :location => @merchant }
      end
    end
  end
end
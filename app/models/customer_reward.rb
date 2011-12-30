require 'util/common'
require 'aws/s3'

class Reward
  include DataMapper::Resource

  @@template = ERB.new File.read(File.expand_path "app/views/user_mailer/reward_template.html.erb")

  property :referral_id, Integer, :key => true
  property :reward_code, String, :unique_index => true,  :required => true, :default => ""
  property :qr_code, String, :required => true, :default => ""
  property :expiry_date, DateTime, :required => true, :default => ::Constant::MIN_TIME 
  property :redeemed, Boolean, :default => false
  property :created_ts, DateTime, :default => ::Constant::MIN_TIME
  property :update_ts, DateTime, :default => ::Constant::MIN_TIME
  property :deleted_ts, ParanoidDateTime
  #property :deleted, ParanoidBoolean, :default => false

  attr_accessible :referral_id, :reward_code, :qr_code, :expiry_date

  belongs_to :deal
  belongs_to :user
  
  def self.create(deal, user, referral_id)
    now = Time.now
    reward_code = "#{now.to_i}#{rand(1000) + 1000}"
    qr = RQRCode::QRCode.new( reward_code, :size => 5, :level => :h )
    png = qr.to_img.resize(90,90)
    AWS::S3::S3Object.store(
      ::Common.generate_reward_file_path(user,"#{reward_code}.png"), 
      png.to_string,
      APP_PROP["AMAZON_FILES_BUCKET"], 
      :content_type => 'image/png', 
      :access => :public_read
    )
    filename = ::Common.generate_full_reward_file_path(user,"#{reward_code}.png")
    reward = Reward.new(
      :referral_id => referral_id,
      :reward_code => reward_code,
      :qr_code => filename,
      :expiry_date => deal.reward_expiry_date
    )
    reward[:created_ts] = now
    reward[:update_ts] = now
    reward.deal = deal
    reward.user = user
    reward.save
    return reward
  end

  def to_param
    self.reward_code
  end
  
  def print
    html = @@template.result(binding)
    kit = PDFKit.new(html, :page_size => 'Letter')
    #kit.stylesheets << '/path/to/css/file'

    # Save the PDF to a file
    AWS::S3::S3Object.store(::Common.generate_reward_file_path(self.user,"#{self.reward_code}.pdf"), kit.to_pdf, APP_PROP["AMAZON_FILES_BUCKET"], :access => :public_read)
  end
end
class Reward
  include DataMapper::Resource

  @@template = ERB.new File.read(File.expand_path "app/views/user_mailer/reward_template.html.erb")

  property :referral_id, Integer, :key => true
  property :reward_code, String, :unique_index => true,  :required => true, :default => ""
  property :qr_code, String, :default => ""
  property :redeemed, Boolean, :default => false
  property :created_ts, DateTime, :default => ::Constant::MIN_TIME
  property :update_ts, DateTime, :default => ::Constant::MIN_TIME
  property :deleted_ts, ParanoidDateTime
  #property :deleted, ParanoidBoolean, :default => false

  attr_accessible :referral_id, :reward_code, :qr_code

  belongs_to :deal
  belongs_to :user
  
  def self.create(deal, user, referral_id)
    now = Time.now
    reward_code = "#{now.to_i}#{rand(1000) + 1000}"
    qr = RQRCode::QRCode.new( reward_code, :size => 5, :level => :h )
    png = qr.to_img.resize(90,90)
    filename = APP_PROP["REWARD_QR_CODE_FILE_PATH"] + reward_code + ".png"
    png.save(filename)
    reward = Reward.new(
      :referral_id => referral_id,
      :reward_code => reward_code,
      :qr_code => filename
    )
    reward[:created_ts] = now
    reward[:update_ts] = now
    reward.deal = deal
    reward.user = user
    reward.save
    return reward
  end

  def print
    html = @@template.result(binding)
    kit = PDFKit.new(html, :page_size => 'Letter')
    #kit.stylesheets << '/path/to/css/file'

    # Save the PDF to a file
    kit.to_file(APP_PROP["REWARD_FILE_PATH"]+"#{self.reward_code}.pdf")
  end
end
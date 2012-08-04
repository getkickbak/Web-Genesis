class News
  attr_accessor :type, :item_id, :item_type, :title, :text
  
  def initialize(type, item_id, item_type, title, text)  
    @type = type
    @item_id = item_id
    @item_type = item_type
    @title = title
    @text = text
  end
end
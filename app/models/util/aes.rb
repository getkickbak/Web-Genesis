class Aes
 
  def initialize(key_size, mode)
 
    # Validate key size
    if !['128', '192', '256'].include? key_size
      raise 'Invalid key size'
    end
 
    #Validate mode
    mode.downcase!
    if !['cbc', 'cfb', 'cfb1', 'cfb8', 'ecb', 'ofb'].include? mode
      raise 'Invalid mode'
    end
 
    @cipher = OpenSSL::Cipher::Cipher.new('aes-' + key_size + '-' + mode)
 
  end
 
  def decrypt(data, key, iv)
    @cipher.decrypt
    @cipher.key = key
    @cipher.iv = iv
    return @cipher.update(data) + @cipher.final
  end
 
  def encrypt(data, key, iv)
    @cipher.encrypt
    @cipher.key = key
    @cipher.iv = iv
    return @cipher.update(data) + @cipher.final
  end
 
end
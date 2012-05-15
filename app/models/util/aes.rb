class Aes
 
  
  def self.decrypt(key_size, mode, data, key, iv)
    # Validate key size
    if !['128', '192', '256'].include? key_size
      raise 'Invalid key size'
    end
 
    #Validate mode
    mode.downcase!
    if !['cbc', 'cfb', 'cfb1', 'cfb8', 'ecb', 'ofb'].include? mode
      raise 'Invalid mode'
    end
 
    cipher = OpenSSL::Cipher::Cipher.new('aes-' + key_size + '-' + mode)
    cipher.decrypt
    cipher.key = key
    cipher.iv = Base64.decode64(iv)
    return cipher.update(Base64.decode64(data)) + cipher.final
  end
 
  def self.encrypt(key_size, mode, data, key)
    # Validate key size
    if !['128', '192', '256'].include? key_size
      raise 'Invalid key size'
    end
 
    #Validate mode
    mode.downcase!
    if !['cbc', 'cfb', 'cfb1', 'cfb8', 'ecb', 'ofb'].include? mode
      raise 'Invalid mode'
    end
 
    cipher = OpenSSL::Cipher::Cipher.new('aes-' + key_size + '-' + mode)
    cipher.encrypt
    cipher.key = key
    cipher.iv = initialization_vector = cipher.random_iv
    return "#{Base64.strict_encode64(initialization_vector)}$#{Base64.strict_encode64(cipher.update(data) + cipher.final)}"
  end
 
end
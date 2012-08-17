module DataMapper
  class Property
    class Decimal
      alias :original_typecast_to_primitive :typecast_to_primitive
      def typecast_to_primitive(value)
        typecasted = original_typecast_to_primitive(value)
        typecasted.round(@scale) if typecasted.respond_to?(:round)
      end
    end
  end
end
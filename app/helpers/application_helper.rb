module ApplicationHelper

   def helpers
      ActionController::Base.helpers
   end

   def link_to_remove_fields(name, f)
      #f.hidden_field(:_destroy) + link_to_function(name, "remove_fields(this)")
      link_to_function(name, "remove_fields(this)")
   end

   def link_to_add_fields(name, f, association)
      #new_object = f.object.class.reflect_on_association(association).klass.new
      new_object = f.object.model.relationships[association].target_model.new
      fields = f.simple_fields_for(association, new_object, :child_index => "new_#{association}") do |builder|
         render(association.to_s.singularize + "_fields", :f => builder)
      end
      link_to_function(name, "add_fields(this, \"#{association}\", \"#{escape_javascript(fields)}\")")
   end

   def only_us_and_canada
      Carmen::Country.all.select{|c| %w{US CA}.include?(c.alpha_2_code)}
    end
end

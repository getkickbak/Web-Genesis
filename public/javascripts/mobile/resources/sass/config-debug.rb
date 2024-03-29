# Get the directory that this configuration file exists in
dir = File.dirname(__FILE__)

# Load the sencha-touch framework automatically.
#load File.join(dir, '../../lib/sencha-touch-2.0.1.1/resources', 'themes')
load File.join(dir, '..', 'themes')

# Compass configurations
sass_path    = dir
css_path     = File.join(dir, "..", "css")
environment  = :development
output_style = :expanded

require 'sass-css-importer'
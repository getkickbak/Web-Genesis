OmniAuth.config.on_failure = Proc.new { |env|
  origin_path = env["omniauth.origin"]
  OmniAuth::FailureEndpoint.new(env).redirect_to_failure
}
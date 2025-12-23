# frozen_string_literal: true

# DEPCRECATED: Should be removed
class InertiaExampleController < InertiaController
  self.inertia_i18n_scopes = [ "pages.inertia_example" ]
  def index
    render inertia: {
      rails_version: Rails.version,
      ruby_version: RUBY_DESCRIPTION,
      rack_version: Rack.release,
      inertia_rails_version: InertiaRails::VERSION,
      green_text: I18n.t("pages.inertia_example.green_text")
    }
  end
end

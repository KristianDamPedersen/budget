# frozen_string_literal: true

class InertiaController < ApplicationController
  before_action :set_locale

  inertia_share i18n: -> {
    self.class.inertia_i18n_scopes.each_with_object({}) do |scope, acc|
      section = I18n.t(scope, default: {})
      next unless section.is_a?(Hash)

      # Wrap the translated hash back under its scope path
      wrapped = scope.to_s.split(".").reverse.reduce(section) { |h, key| { key => h } }
      acc.deep_merge!(wrapped) # keep structure; later scopes override where they overlap
    end
  }

  def default_url_options
    { locale: I18n.locale }
  end
  class_attribute :inertia_i18n_scopes, default: [ "common" ]
  def set_locale
    I18n.locale = params[:locale] || I18n.default_locale
  end
end

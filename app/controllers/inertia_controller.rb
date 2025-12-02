# frozen_string_literal: true

# FIX: DOCS before flight
# FIX: TESTS before flight
class InertiaController < ApplicationController
  inertia_share flash: -> { flash.to_hash }

  inertia_share auth: -> {
    u = current_user
    Rails.logger.debug("Inertia shared auth: user_id=#{u&.id}")
    u ? { id: u.id, email: u.email, first_name: u.first_name, last_name: u.last_name } : nil
  }
end

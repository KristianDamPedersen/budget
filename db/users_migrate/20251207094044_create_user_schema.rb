class CreateUserSchema < ActiveRecord::Migration[8.1]
  def change
      execute "CREATE SCHEMA IF NOT EXISTS users"
  end
end

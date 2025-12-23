class CreateDomainAuthenticationUsers < ActiveRecord::Migration[8.1]
  def change
    execute "CREATE SCHEMA IF NOT EXISTS authentication"
    create_table "authentication.users" do |t|
      t.string :first_name, null: false
      t.string :last_name, null: false
      t.string :email, null: false

      t.integer :provider, null: false
      t.string :provider_uid, null: false

      t.timestamps
    end

    add_index "authentication.users", :email, unique: true
    add_index  "authentication.users", %i[provider provider_uid], unique: true
  end
end

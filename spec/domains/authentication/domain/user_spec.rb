# require "rails_helper"
#
# RSpec.describe Authentication::Domain::User, type: :model do
#   def build_valid_user(overrides = {})
#     described_class.new(
#       {
#         first_name: "Ada",
#         last_name: "Lovelace",
#         email: "ada.#{SecureRandom.hex(6)}@example.com",
#         provider: :workos,
#         provider_uid: SecureRandom.uuid
#       }.merge(overrides)
#     )
#   end
#
#   describe ".table_name" do
#     it "uses the authentication schema" do
#       expect(described_class.table_name).to eq("authentication.users")
#     end
#   end
#
#   describe "provider enum" do
#     it "defines workos as 0" do
#       expect(described_class.providers).to include("workos" => 0)
#     end
#
#     it "adds prefixed predicate methods" do
#       user = build_valid_user(provider: :workos)
#       expect(user.provider_workos?).to be(true)
#     end
#   end
#
#   describe "validations" do
#     it "requires provider" do
#       user = build_valid_user(provider: nil)
#       expect(user).not_to be_valid
#       expect(user.errors[:provider]).to be_present
#     end
#
#     it "requires email" do
#       user = build_valid_user(email: nil)
#       expect(user).not_to be_valid
#       expect(user.errors[:email]).to be_present
#     end
#
#     it "requires provider_uid to be unique per provider" do
#       provider_uid = SecureRandom.uuid
#       described_class.create!(build_valid_user(provider_uid: provider_uid).attributes)
#
#       user = build_valid_user(provider_uid: provider_uid)
#       expect(user).not_to be_valid
#       expect(user.errors[:provider_uid]).to include("has already been taken")
#     end
#   end
#
#   describe "database constraints (persistence contract)" do
#     it "enforces NOT NULL first_name" do
#       user = build_valid_user(first_name: nil)
#       expect { user.save!(validate: false) }.to raise_error(ActiveRecord::NotNullViolation)
#     end
#
#     it "enforces NOT NULL last_name" do
#       user = build_valid_user(last_name: nil)
#       expect { user.save!(validate: false) }.to raise_error(ActiveRecord::NotNullViolation)
#     end
#
#     it "enforces NOT NULL provider_uid" do
#       user = build_valid_user(provider_uid: nil)
#       expect { user.save!(validate: false) }.to raise_error(ActiveRecord::NotNullViolation)
#     end
#
#     it "enforces unique email" do
#       email = "unique.#{SecureRandom.hex(6)}@example.com"
#       described_class.create!(build_valid_user(email: email).attributes)
#
#       user = build_valid_user(email: email)
#       expect { user.save!(validate: false) }.to raise_error(ActiveRecord::RecordNotUnique)
#     end
#
#     it "enforces unique [provider, provider_uid]" do
#       provider_uid = SecureRandom.uuid
#       described_class.create!(build_valid_user(provider_uid: provider_uid).attributes)
#
#       user = build_valid_user(provider_uid: provider_uid)
#       expect { user.save!(validate: false) }.to raise_error(ActiveRecord::RecordNotUnique)
#     end
#   end
# end

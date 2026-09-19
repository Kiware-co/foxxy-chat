require 'rails_helper'

# FOXXY: el chat no manda ningún correo, nunca (olympus-ms-back#259).
RSpec.describe FoxxyNoEmailInterceptor do
  it 'marks any message as not deliverable' do
    message = Mail.new(to: 'agent@example.com', from: 'chat@example.com', subject: 'x', body: 'y')

    described_class.delivering_email(message)

    expect(message.perform_deliveries).to be(false)
  end

  context 'when registered, as it is outside the test environment' do
    around do |example|
      ActionMailer::Base.register_interceptor(described_class)
      example.run
    ensure
      ActionMailer::Base.unregister_interceptor(described_class)
    end

    it 'keeps Devise emails from reaching the delivery method' do
      user = create(:user)

      expect { user.send_reset_password_instructions }.not_to(change { ActionMailer::Base.deliveries.count })
    end

    it 'keeps a message with its own SMTP settings from being delivered' do
      message = Mail.new(to: 'contact@example.com', from: 'inbox@example.com', subject: 'x', body: 'y')
      message.delivery_method(:test)

      expect { message.deliver }.not_to(change { Mail::TestMailer.deliveries.count })
    end
  end
end

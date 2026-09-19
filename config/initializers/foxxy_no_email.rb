# FOXXY: el chat no manda ningún correo, nunca (Julián, 18 sep 2026; olympus-ms-back#259).
#
# El proveedor bloqueó el SMTP compartido por los avisos a agentes que copiaban el texto de los chats.
# `perform_deliveries = false` (config/initializers/mailer.rb) ya corta ActionMailer y Devise; este
# interceptor es la segunda llave: corre justo antes de entregar cualquier Mail::Message, incluidos
# los que llevan su propio método de entrega (ConversationReplyMailer con el SMTP de un buzón), y lo
# marca como no entregable. En pruebas no se registra, para no romper las specs de upstream que
# cuentan ActionMailer::Base.deliveries.
class FoxxyNoEmailInterceptor
  def self.delivering_email(message)
    message.perform_deliveries = false
  end
end

unless Rails.env.test?
  ActiveSupport.on_load(:action_mailer) do
    ActionMailer::Base.register_interceptor(FoxxyNoEmailInterceptor)
  end
end

# backend/whatsapp.py
from twilio.rest import Client

# --- Credenciais Twilio (já direto no código)
TWILIO_SID = "AC9389b6ee3cf2f5261d50d1c5c324a634"
TWILIO_AUTH = "7f3b796d5e2fa34d8c216ae32cf67c0f"
TWILIO_WHATSAPP_FROM = "whatsapp:+14155238886"  # Twilio sandbox

def enviar_whatsapp(to_number: str, mensagem: str):
    """
    Envia mensagem via WhatsApp usando Twilio.
    
    to_number: string no formato 'whatsapp:+55957302442'
    mensagem: texto a enviar
    """
    try:
        client = Client(TWILIO_SID, TWILIO_AUTH)
        message = client.messages.create(
            body=mensagem,
            from_=TWILIO_WHATSAPP_FROM,
            to=to_number
        )
        print(f"[WHATSAPP] mensagem enviada para {to_number}: {mensagem}")
        return True, message.sid
    except Exception as e:
        print(f"[WHATSAPP] erro ao enviar para {to_number}: {e}")
        return False, str(e)

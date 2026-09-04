import os
import json

from dotenv import load_dotenv
from groq import Groq

load_dotenv()

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)



def generate_recovery_content(decision_result):

    action = decision_result.get("action")
    reason = decision_result.get("reason")
    amount_at_risk = decision_result.get("amount_at_risk", 0)
    customer_type = decision_result.get("customer_type")
    customer_value = decision_result.get("customer_value")
    priority = decision_result.get("priority")
    recoverability = decision_result.get("recoverability")

    prompt = f"""
You are an AI assistant for a revenue recovery system.

A deterministic recovery agent has already decided what action should be taken.
DO NOT change or override the recovery action.

Your job is only to generate a short, professional and customer-friendly recovery message.
- Do not mention links, buttons, URLs, phone numbers, or contact details unless they are explicitly provided.
- Do not assume the customer has a subscription, membership, recurring plan, or account status unless explicitly provided.

Recovery information:

Action: {action}
Reason: {reason}
Amount at risk: {amount_at_risk}
Customer type: {customer_type}
Customer value: {customer_value}
Priority: {priority}
Recoverability: {recoverability}

Generate a response in VALID JSON only.

Use this exact structure:

{{
    "subject": "short message subject",
    "message": "customer-facing recovery message",
    "tone": "professional",
    "recommended_channel": "EMAIL"
}}

Rules:
- Do not mention internal terms such as recoverability, customer value, risk score or priority.
- Do not blame the customer.
- Keep the message concise.
- Do not invent discounts or offers.
- Do not change the recovery action.
- If payment failed, explain the issue politely.
- Give the customer a clear next step.
"""

    try:
        response = client.chat.completions.create(
            model="openai/gpt-oss-20b",

            messages=[
                {
                    "role": "system",
                    "content": (
                        "You generate concise customer-facing revenue recovery messages. "
                        "The recovery action has already been decided by another system. "
                        "Never change or override that action."
                    )
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],

            response_format={
                "type": "json_schema",
                "json_schema": {
                    "name": "recovery_message",
                    "strict": True,
                    "schema": {
                        "type": "object",
                        "properties": {
                            "subject": {
                                "type": "string"
                            },
                            "message": {
                                "type": "string"
                            },
                            "tone": {
                                "type": "string"
                            },
                            "recommended_channel": {
                                "type": "string"
                            }
                        },
                        "required": [
                            "subject",
                            "message",
                            "tone",
                            "recommended_channel"
                        ],
                        "additionalProperties": False
                    }
                }
            },

            temperature=0.3,
            max_tokens=600
        )

        generated_text = response.choices[0].message.content

        return json.loads(generated_text)

    except json.JSONDecodeError:
        return {
            "subject": "Payment Update Required",
            "message": generated_text,
            "tone": "professional",
            "recommended_channel": "EMAIL"
        }

    except Exception as e:
        return {
            "error": True,
            "message": str(e)
        }

if __name__ == "__main__":

    test_decision = {
        "action": "REQUEST_PAYMENT_METHOD_UPDATE",
        "reason": "Card expired",
        "amount_at_risk": 5830.2,
        "customer_type": "Returning",
        "customer_value": "MEDIUM",
        "priority": "MEDIUM",
        "recoverability": "MEDIUM"
    }

    result = generate_recovery_content(test_decision)

    print(result)
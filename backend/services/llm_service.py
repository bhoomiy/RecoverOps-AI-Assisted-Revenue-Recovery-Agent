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
    amount_at_risk = decision_result.get(
        "amount",
        decision_result.get("amount_at_risk", 0)
    )
    customer_type = decision_result.get("customer_type")
    customer_value = decision_result.get("customer_value")
    priority = decision_result.get("priority")
    recoverability = decision_result.get("recoverability")

    prompt = f"""
You are an AI assistant for a revenue recovery system.

A deterministic recovery agent has already decided what action should be taken.
DO NOT change or override the recovery action.

Your job has two parts:

1. Explain internally why the deterministic agent selected this action.
2. Generate a short, professional and customer-friendly recovery message.

Recovery information:

Action: {action}
Reason: {reason}
Amount at risk: {amount_at_risk}
Customer type: {customer_type}
Customer value: {customer_value}
Priority: {priority}
Recoverability: {recoverability}


Generate a response using the JSON structure defined by the response schema.

The response must contain:
- explanation
- key_factors
- subject
- message
- tone
- recommended_channel

Rules:

INTERNAL EXPLANATION:
- The explanation is for an internal operator, not the customer.
- Explain the decision that has already been made.
- Do not recommend a different recovery action.
- You may mention customer type, customer value, priority and recoverability.
- Keep the explanation concise.
- key_factors must contain exactly 3 short factors.

CUSTOMER MESSAGE:
- Do not mention internal terms such as recoverability, customer value, risk score or priority.
- Do not blame the customer.
- Do not invent links, buttons, URLs, phone numbers, contact details, login instructions or navigation steps.
- Do not assume the customer has an account, subscription, membership, recurring plan or ongoing service.
- Do not mention keeping an account active, continuing services, service interruption or any consequence that was not explicitly provided.
- Only use facts present in the Recovery information above.
- Keep the message concise.
- Do not invent discounts or offers.
- Do not change the recovery action.
- If payment failed, explain the provided failure reason politely.
- Give a general next step consistent with the selected recovery action without inventing how or where the customer should perform it.
"""
    try:
        response = client.chat.completions.create(
            model="openai/gpt-oss-20b",

            messages=[
                {
                    "role": "system",
                    "content": (
                        "You generate structured JSON for a revenue recovery system. "
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
                            "explanation": {
                                "type": "string"
                            },

                            "key_factors": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                }
                            },

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
                            "explanation",
                            "key_factors",
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
            "explanation": (
                "The AI explanation could not be parsed, "
                "but the deterministic recovery decision remains unchanged."
            ),
            "key_factors": [
                action or "Recovery action selected",
                customer_type or "Customer context available",
                recoverability or "Recoverability evaluated"
            ],
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
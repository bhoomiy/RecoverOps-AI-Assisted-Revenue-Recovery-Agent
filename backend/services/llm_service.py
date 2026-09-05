import os
import json

from dotenv import load_dotenv
from groq import Groq

load_dotenv()

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)



def generate_recovery_content(decision_result, recovery_result=None):

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

    # --------------------------------------------------
    # Recovery outcome, if recovery has already happened
    # --------------------------------------------------

    if recovery_result is None:
        recovery_status = "PENDING"
        recovery_success = None
        simulation_result = None
        revenue_recovered = 0
        revenue_lost = 0
        recovery_reason = None

    else:
        recovery_success = recovery_result.get("success")

        recovery_status = (
            "RECOVERED"
            if recovery_success == 1
            else "FAILED"
        )

        simulation_result = recovery_result.get(
            "simulation_result"
        )

        revenue_recovered = recovery_result.get(
            "revenue_recovered",
            0
        )

        revenue_lost = recovery_result.get(
            "revenue_lost",
            0
        )

        recovery_reason = recovery_result.get("reason")

    prompt = f"""
You are an AI assistant for a revenue recovery system.

A deterministic recovery agent has already selected the recovery action.
You MUST NOT change or override that action.

Your job is to explain the transaction's CURRENT recovery state.

Recovery decision:

Action: {action}
Decision reason: {reason}
Amount at risk: {amount_at_risk}
Customer type: {customer_type}
Customer value: {customer_value}
Priority: {priority}
Recoverability: {recoverability}

Recovery outcome:

Recovery status: {recovery_status}
Recovery success: {recovery_success}
Simulation result: {simulation_result}
Revenue recovered: {revenue_recovered}
Revenue lost: {revenue_lost}
Recovery result reason: {recovery_reason}


Generate a response using the JSON structure defined by the response schema.

The response must contain:

- explanation
- key_factors
- subject
- message
- tone
- recommended_channel


IMPORTANT STATE RULES:

IF Recovery status is PENDING:

- Explain why the deterministic agent selected the action.
- The action has NOT been executed yet.
- The customer message should request the appropriate next step.
- Do not imply that recovery has already succeeded.


IF Recovery status is RECOVERED:

- The INTERNAL explanation must clearly state that the recovery
  action was already executed.
- The INTERNAL explanation may mention the deterministic agent,
  action name, simulation result, customer value, priority,
  recoverability and recovered amount.
- Use past tense.
- Clearly state that the recovery succeeded.
- Mention the recovered amount when available.

For the CUSTOMER message:
- Write only a short customer-facing confirmation.
- NEVER mention "deterministic agent".
- NEVER mention "simulation".
- NEVER include internal action names such as
  REQUEST_PAYMENT_METHOD_UPDATE.
- NEVER mention customer value, priority, recoverability,
  risk level or other internal classifications.
- Do not explain why the internal system chose the action.
- Do not ask the customer to repeat an action that already succeeded.
- Simply confirm the successful outcome using customer-friendly language.


IF Recovery status is FAILED:

- Clearly explain that the recovery action was attempted but did not succeed.
- Mention the recovery result reason when available.
- Do NOT falsely claim that revenue was recovered.
- Do NOT invent another recovery strategy.
- The customer message may politely explain that the payment issue remains unresolved.
- Do not override the deterministic agent's selected action.


INTERNAL EXPLANATION RULES:

- The explanation is for an internal operator.
- Explain what the deterministic agent selected and what happened afterward.
- Do not recommend a different recovery action.
- You may mention customer type, customer value, priority and recoverability.
- Keep the explanation concise.
- key_factors must contain exactly 3 short factors.


CUSTOMER MESSAGE RULES:

- Do not mention internal terms such as recoverability,
  customer value, risk score or priority.
- Do not blame the customer.
- The customer message and internal explanation MUST be different.
- Never copy or paraphrase the internal explanation into the customer message.
- Never expose internal system terminology in the customer message.
- Do not invent links, buttons, URLs, phone numbers,
  contact details, login instructions or navigation steps.
- Do not assume the customer has an account,
  subscription, membership, recurring plan or ongoing service.
- Do not mention service interruption or consequences
  that were not explicitly provided.
- Only use facts present in the information above.
- Keep the message concise.
- Do not invent discounts or offers.
- Never mention the deterministic agent, internal recovery action names,
  simulation logic, customer value, priority, recoverability,
  or internal system terminology in the customer message.
- Do not change the deterministic recovery action.
"""

    try:

        response = client.chat.completions.create(
            model="openai/gpt-oss-20b",

            messages=[
                {
                    "role": "system",
                    "content": (
                        "You generate structured JSON for a revenue "
                        "recovery system. The deterministic agent makes "
                        "all recovery decisions. You only explain the "
                        "decision and the current recovery outcome. "
                        "Never change or override the selected action."
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

        result = json.loads(generated_text)

        # Validate customer-facing message
        internal_terms = [
            "deterministic agent",
            "REQUEST_PAYMENT_METHOD_UPDATE",
            "RETRY_PAYMENT",
            "SEND_PAYMENT_REMINDER",
            "SEND_CHECKOUT_REMINDER",
            "ESCALATE_TO_SUPPORT",
            "OFFER_DISCOUNT",
            "recoverability",
            "customer value",
            "priority",
            "simulation"
        ]

        customer_message = result.get("message", "")

        contains_internal_terms = any(
            term.lower() in customer_message.lower()
            for term in internal_terms
        )

        # Replace unsafe/internal customer message with a clean fallback
        if contains_internal_terms:

            if recovery_status == "RECOVERED":

                if action == "REQUEST_PAYMENT_METHOD_UPDATE":
                    result["subject"] = "Payment method updated successfully"
                    result["message"] = (
                        "Your payment method was updated successfully. "
                        "The payment issue has been resolved."
                    )

                else:
                    result["subject"] = "Payment recovery successful"
                    result["message"] = (
                        "The payment issue has been resolved successfully."
                    )

            elif recovery_status == "FAILED":
                result["subject"] = "Payment issue update"
                result["message"] = (
                    "We were unable to resolve the payment issue. "
                    "The payment remains unresolved."
                )

        return result

    except json.JSONDecodeError:

        return {
            "explanation": (
                "The AI explanation could not be parsed, "
                "but the deterministic recovery decision "
                "and recovery result remain unchanged."
            ),

            "key_factors": [
                action or "Recovery action selected",
                recovery_status,
                customer_type or "Customer context available"
            ],

            "subject": "Recovery Update",

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
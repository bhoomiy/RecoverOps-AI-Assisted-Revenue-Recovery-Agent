from services.decision_agent import get_decision
import random
from services.recovery_tracker import track_recovery

def recovery_simulator(transaction_id,action,original_revenue,recoverability,customer_value,customer_type):
    result={}

    # Simulate payment method update
    if action == "REQUEST_PAYMENT_METHOD_UPDATE":

        # Case 1: Highly recoverable
        if recoverability == "HIGH":
            result["simulation_result"] = "PAYMENT_METHOD_UPDATED"
            result["success"] = True
            result["revenue_recovered"] = original_revenue
            result["revenue_lost"] = 0
            result["reason"] = "Transaction has high recoverability, so the customer is simulated to update the payment method."

        # Case 2: Medium recoverability + existing customer
        elif recoverability == "MEDIUM" and customer_type == "Returning":
            result["simulation_result"] = "PAYMENT_METHOD_UPDATED"
            result["success"] = True
            result["revenue_recovered"] = original_revenue
            result["revenue_lost"] = 0
            result["reason"] = "Returning customer with medium recoverability is simulated to update the payment method."

        # Otherwise recovery fails
        else:
            result["simulation_result"] = "PAYMENT_METHOD_NOT_UPDATED"
            result["success"] = False
            result["revenue_recovered"] = 0
            result["revenue_lost"] = original_revenue
            result["reason"] = "Customer is simulated to not update the payment method."

        # Simulate payment retry
    elif action == "RETRY_PAYMENT":

        # Case 1: Highly recoverable
        if recoverability == "HIGH":
            result["simulation_result"] = "PAYMENT_RETRY_SUCCESSFUL"
            result["success"] = True
            result["revenue_recovered"] = original_revenue
            result["revenue_lost"] = 0
            result["reason"] = "Transaction has high recoverability, so the payment retry is simulated to succeed."

        # Case 2: Medium recoverability + returning customer
        elif recoverability == "MEDIUM" and customer_type == "Returning":
            result["simulation_result"] = "PAYMENT_RETRY_SUCCESSFUL"
            result["success"] = True
            result["revenue_recovered"] = original_revenue
            result["revenue_lost"] = 0
            result["reason"] = "Returning customer with medium recoverability is simulated to have a successful payment retry."

        # Otherwise recovery fails
        else:
            result["simulation_result"] = "PAYMENT_RETRY_FAILED"
            result["success"] = False
            result["revenue_recovered"] = 0
            result["revenue_lost"] = original_revenue
            result["reason"] = "Payment retry is simulated to fail."

        # Simulate authentication request
    elif action == "REQUEST_AUTHENTICATION":

        # Case 1: Highly recoverable
        if recoverability == "HIGH":
            result["simulation_result"] = "AUTHENTICATION_COMPLETED"
            result["success"] = True
            result["revenue_recovered"] = original_revenue
            result["revenue_lost"] = 0
            result["reason"] = "Transaction has high recoverability, so the customer is simulated to complete authentication."

        # Case 2: Medium recoverability + returning customer
        elif recoverability == "MEDIUM" and customer_type == "Returning":
            result["simulation_result"] = "AUTHENTICATION_COMPLETED"
            result["success"] = True
            result["revenue_recovered"] = original_revenue
            result["revenue_lost"] = 0
            result["reason"] = "Returning customer with medium recoverability is simulated to complete authentication."

        # Otherwise recovery fails
        else:
            result["simulation_result"] = "AUTHENTICATION_NOT_COMPLETED"
            result["success"] = False
            result["revenue_recovered"] = 0
            result["revenue_lost"] = original_revenue
            result["reason"] = "Customer is simulated to not complete the required authentication."

        # Simulate checkout reminder
    elif action == "SEND_CHECKOUT_REMINDER":

        # Case 1: Highly recoverable
        if recoverability == "HIGH":
            result["simulation_result"] = "CUSTOMER_RETURNED_AND_PURCHASED"
            result["success"] = True
            result["revenue_recovered"] = original_revenue
            result["revenue_lost"] = 0
            result["reason"] = "Transaction has high recoverability, so the customer is simulated to return and complete the purchase."

        # Case 2: Medium recoverability + returning customer
        elif recoverability == "MEDIUM" and customer_type == "Returning":
            result["simulation_result"] = "CUSTOMER_RETURNED_AND_PURCHASED"
            result["success"] = True
            result["revenue_recovered"] = original_revenue
            result["revenue_lost"] = 0
            result["reason"] = "Returning customer with medium recoverability is simulated to return after the reminder and complete the purchase."

        # Otherwise recovery fails
        else:
            result["simulation_result"] = "CUSTOMER_DID_NOT_RETURN"
            result["success"] = False
            result["revenue_recovered"] = 0
            result["revenue_lost"] = original_revenue
            result["reason"] = "Customer is simulated to not return after receiving the checkout reminder."

        # Simulate retrying payment later
    elif action == "RETRY_LATER":

        # Case 1: High recoverability
        if recoverability == "HIGH":
            result["simulation_result"] = "LATER_RETRY_SUCCESSFUL"
            result["success"] = True
            result["revenue_recovered"] = original_revenue
            result["revenue_lost"] = 0
            result["reason"] = "Transaction has high recoverability, so the later payment retry is simulated to succeed."

        # Case 2: Medium recoverability + returning customer
        elif recoverability == "MEDIUM" and customer_type == "Returning":
            result["simulation_result"] = "LATER_RETRY_SUCCESSFUL"
            result["success"] = True
            result["revenue_recovered"] = original_revenue
            result["revenue_lost"] = 0
            result["reason"] = "Returning customer with medium recoverability is simulated to successfully retry the payment later."

        # Otherwise recovery fails
        else:
            result["simulation_result"] = "LATER_RETRY_FAILED"
            result["success"] = False
            result["revenue_recovered"] = 0
            result["revenue_lost"] = original_revenue
            result["reason"] = "Customer is simulated to still be unable to complete the payment later."

        # Simulate suggesting an alternative payment method
    elif action == "SUGGEST_ALTERNATIVE_PAYMENT":

        # Case 1: High-value customer
        if customer_value == "HIGH":
            result["simulation_result"] = "ALTERNATIVE_PAYMENT_SUCCESSFUL"
            result["success"] = True
            result["revenue_recovered"] = original_revenue
            result["revenue_lost"] = 0
            result["reason"] = "High-value customer is simulated to use an alternative payment method successfully."

        # Case 2: Returning customer with medium customer value
        elif customer_value == "MEDIUM" and customer_type == "Returning":
            result["simulation_result"] = "ALTERNATIVE_PAYMENT_SUCCESSFUL"
            result["success"] = True
            result["revenue_recovered"] = original_revenue
            result["revenue_lost"] = 0
            result["reason"] = "Returning customer is simulated to use an alternative payment method after the original payment was declined."

        # Otherwise recovery fails
        else:
            result["simulation_result"] = "ALTERNATIVE_PAYMENT_FAILED"
            result["success"] = False
            result["revenue_recovered"] = 0
            result["revenue_lost"] = original_revenue
            result["reason"] = "Customer is simulated to not complete the purchase using an alternative payment method."

    elif action == "NO_ACTION":
        result["simulation_result"] = "NO_RECOVERY_ATTEMPTED"
        result["success"] = False
        result["revenue_recovered"] = 0
        result["revenue_lost"] = original_revenue
        result["reason"] = "Agent decided that no recovery action should be attempted for this transaction."  

    else:
        raise ValueError(f"Unsupported recovery action: {action}")

    result["transaction_id"]=transaction_id
    result["action_taken"]=action
    result["original_revenue_at_risk"]=original_revenue

    track_recovery(result)
    return result
